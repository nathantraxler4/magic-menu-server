import OpenAI from 'openai';

import { Menu, RecipeInput } from '../__generated__/types';
import openai from '../setup/openai';
import { Errors, logAndThrowError } from '../utils/errors';

function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 *
 */
export async function getMenus() {
    console.log('Getting menus');
    await delay(2000);
    const menu = [
        {
            courses: [
                {
                    name: 'Course 1',
                    description: 'This is a yummy course.'
                },
                {
                    name: 'Course 2',
                    description: 'This is also a yummy course.'
                },
                {
                    name: 'Course 3',
                    description: 'This might be a yummy dessert course.'
                }
            ],
            backgroundImage: 1
        }
    ];
    return menu;
}

/**
 * Service method used to generate a Menu based on an array of Recipes.
 */
export async function generateMenu(recipes: RecipeInput[]): Promise<Menu> {
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
            message: 'An error occurred requesting LLM API',
            error,
            code: Errors.LLM_API_ERROR
        });
    }

    const descriptions = _extractJsonArrayFromCompletion(completion);

    const menu = _constructMenu(recipes, descriptions);

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
    try {
        return JSON.parse(jsonArrayString);
    } catch (error) {
        logAndThrowError({
            message: `Failed to parse LLM Response as JSON. Content received: "${jsonArrayString}"`,
            error: error,
            code: Errors.LLM_RESPONSE_PARSE_ERROR
        });
    }
}

function _constructMenu(recipes: RecipeInput[], descriptions: string[]): Menu {

    if (descriptions.length != recipes.length) {
        logAndThrowError({
            message: 'LLM did not respond with appropriate number of recipe descriptions.',
            code: Errors.LLM_RESPONSE_PARSE_ERROR
        });
    }

    const courses = descriptions.map((content: string, i: number) => {
        return {
            name: recipes[i].name,
            description: content
        };
    });

    const menu = {
        courses: courses,
        backgroundImage: 1
    };

    return menu;
}
