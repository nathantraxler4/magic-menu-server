import OpenAI from 'openai';
import type { Nullable, PineconeMetaData } from '../types';

import { Menu, RecipeInput } from '../__generated__/types';
import openai from '../setup/openai';
import { Errors, logAndThrowError } from '../utils/errors';
import MenuModel from '../models/menu';
import logger from '../utils/logger';
import pc from '../setup/pinecone';
import type { QueryResponse, EmbeddingsList, Index } from '@pinecone-database/pinecone';
import { GraphQLError } from 'graphql';

const INDEX_NAME = 'recipes';
const INDEX_HOST = 'https://recipes2-xx1tt13.svc.aped-4627-b74a.pinecone.io';
const EMBEDDING_MODEL = 'multilingual-e5-large';

/**
 *
 */
export async function getMenus() {
    logger.info('Getting menus');
    let menus;
    try {
        menus = await MenuModel.find({});
    } catch (error) {
        logger.error(error);
        throw error;
    }
    logger.info(`Fetched ${menus.length} menus from the DB.`);
    return menus;
}

/**
 * Service method used to generate a Menu based on a prompt.
 */
export async function generateMenuFromPrompt(prompt: string) /*: Promise<Menu>*/ {
    logger.info('Generating menu from prompt.', { prompt });
    const index: Index = pc.index<PineconeMetaData>(INDEX_NAME, INDEX_HOST);
    const vector = await getEmbedding(prompt);
    const queryResponse = await queryPinecone(index, vector);
    validateQueryResponse(queryResponse);
    const recipes: PineconeMetaData[] = queryResponse.matches.map((m) => m.metadata!) as PineconeMetaData[];;
    const menu = generateMenu(recipes);
    return menu;
}

function validateQueryResponse(queryResponse: QueryResponse) {
    for (const match of queryResponse.matches) {
        if (!match.metadata) {
           logAndThrowError({
                message: `Pinecone record missing metadata: ${match}.`,
                code: Errors.PINECONE_ERROR
           });
        }
    }
}

async function queryPinecone(index: Index, vector: number[]): Promise<QueryResponse> {
    try {
        const queryResponse: QueryResponse = await index.query({
            topK: 3,
            vector: vector,
            includeValues: false,
            includeMetadata: true
        });

        logger.debug("Pinecone query response.", { queryResponse });

        return queryResponse;
    } catch (error) {
        logAndThrowError({
            message: "Error occurred querying pinecone.",
            error: error,
            code: Errors.PINECONE_ERROR
        });
    }
}

async function getEmbedding(prompt: string): Promise<number[]> {
    let embeddings: EmbeddingsList;
    try {
        embeddings = await pc.inference.embed(EMBEDDING_MODEL, [prompt], { inputType: 'query' });

        if (!embeddings[0].values) {
            throw new GraphQLError("Query did not return values for embedding.", { extensions: { code: Errors.PINECONE_ERROR } });
        }

        logger.debug("Embedding generated successfully.", { embeddings });

        return embeddings[0].values;
    } catch (error) {
        logAndThrowError({
            message: "Error occurred embedding the prompt.",
            error: error,
            code: Errors.PINECONE_ERROR
        });
    }
}

/**
 * Service method used to generate a Menu based on an array of Recipes.
 */
export async function generateMenu(recipes: RecipeInput[] | PineconeMetaData[]): Promise<Menu> {
    logger.info('Generating menu from recipes.', { recipes });
    const [completion, image] = await Promise.all([
        _generateDescriptions(recipes),
        _generateBackgroundImage(recipes)
    ]);
    const imageUrl = image.data[0].url || ''; // TO DO: Add more robust error handling
    const descriptions = _extractJsonArrayFromCompletion(completion);
    const names = recipes.map((r) => r.name);
    const menu = _constructMenu(names, descriptions, imageUrl);
    await insertMenus([menu]);
    return menu;
}

function _extractJsonArrayFromCompletion(
    completion: Nullable<
        OpenAI.Chat.Completions.ChatCompletion & {
            _request_id?: Nullable<string>;
        }
    >
): string[] {
    // Check for valid content
    if (!completion?.choices?.[0]?.message?.content) {
        logAndThrowError({
            message: 'LLM response has no content.',
            code: Errors.LLM_RESPONSE_PARSE_ERROR
        });
    }

    const content = completion.choices[0].message.content;

    // Locate JSON array indices
    const jsonStartIndex = content.indexOf('[');
    const jsonEndIndex = content.indexOf(']');

    if (jsonStartIndex === -1 || jsonEndIndex === -1) {
        logAndThrowError({
            message: `Content does not contain a valid JSON array. Content received: "${content}"`,
            code: Errors.LLM_RESPONSE_PARSE_ERROR
        });
    }

    const jsonArrayString = content.substring(jsonStartIndex, jsonEndIndex + 1);

    // Attempt to parse the JSON array
    let descriptions;
    try {
        descriptions = JSON.parse(jsonArrayString);
    } catch (error) {
        logAndThrowError({
            message: `Failed to parse LLM Response as JSON. Content received: "${jsonArrayString}"`,
            error: error,
            code: Errors.LLM_RESPONSE_PARSE_ERROR
        });
    }
    logger.info('Response from LLM successfully parsed to an array!');
    return descriptions;
}

function _constructMenu(names: string[], descriptions: string[], imageUrl: string): Menu {
    if (descriptions.length != names.length) {
        logAndThrowError({
            message: 'LLM did not respond with appropriate number of recipe descriptions.',
            code: Errors.LLM_RESPONSE_PARSE_ERROR
        });
    }

    const courses = descriptions.map((content: string, i: number) => {
        return {
            name: names[i],
            description: content
        };
    });

    const menu = {
        courses: courses,
        backgroundImage: imageUrl
    };

    return menu;
}

/**
 * Top level service method to insert menus
 */
export async function insertMenus(menus: Menu[]) {
    logger.info('Inserting menus to DB', { menus });
    try {
        await MenuModel.insertMany(menus);
    } catch (error) {
        logAndThrowError({
            message: `Failed to insert menus into MongoDB. Menus: "${menus}"`,
            error: error,
            code: Errors.MONGO_DB_ERROR
        });
    }
    logger.info('Menus succesfully inserted!');
}

async function _generateDescriptions(recipes: RecipeInput[] | PineconeMetaData[]) {
    logger.info('Requesting LLM to generate descriptions...');
    let completion;
    try {
        completion = await openai.chat.completions.create({
            model: process.env.GENERATE_RECIPE_MODEL ?? 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: `
                        You are a master chef preparing a meal for your friends. 
                        Pick out the 5 most important ingredients of each recipe presented to you formatted as a comma separated string. 
                        Please order the ingredients by their importance to the dish starting with most important. 
                        Please use a JSON Array to hold a list of the generated strings.  
                    `
                },
                {
                    role: 'user',
                    content: JSON.stringify(recipes)
                }
            ]
        });
    } catch (error) {
        logAndThrowError({
            message: 'An error occurred requesting LLM API.',
            error,
            code: Errors.LLM_API_ERROR
        });
    }
    return completion;
}

async function _generateBackgroundImage(recipes: RecipeInput[]| PineconeMetaData[]) {
    logger.info('Requesting Text-To-Image model to generate background image...');
    let image;

    try {
        image = await openai.images.generate({
            model: 'dall-e-3',
            prompt: `
                Please generate me an image that does not contain words for a dinner menu that includes the following courses: ${JSON.stringify(recipes)}`,
            n: 1,
            size: '1024x1792',
            quality: 'hd',
            style: 'vivid'
        });
    } catch (error) {
        logAndThrowError({
            message: 'An error occurred requesting Text-to-Image API.',
            error,
            code: Errors.IMAGE_GEN_API_ERROR
        });
    }

    return image;
}
