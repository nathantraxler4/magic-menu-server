import { Menu, RecipeInput } from "../__generated__/types";
import OpenAI from "openai";
import openai from "../setup/openai.js";

function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function getMenus() {
    console.log("Getting menus")
    await delay(2000)
    const menu = [{
        courses: [
            {
                name: "Course 1",
                description: "This is a yummy course."
            },
            {
                name: "Course 2",
                description: "This is also a yummy course."
            },
            {
                name: "Course 3",
                description: "This might be a yummy dessert course."
            }
        ],
        backgroundImage: 1
    }]
    return menu
}


/**
 * Service method used to generate a Menu.
 * @param recipes
 * @returns A generated menu
 */
export async function generateMenu(recipes: RecipeInput[]): Promise<Menu> {

    const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
            { 
                role: "system", 
                content: 
                `
                    You are a master chef preparing a meal for your friends. 
                    Pick out the 5 most important ingredients of each recipe presented to you formatted as a comma separated string. 
                    Please order the ingredients by their importance to the dish starting with most important. 
                    Please use a JSON Array to hold a list of the generated strings.  
                ` 
            },
            {
                role: "user",
                content: JSON.stringify(recipes),
            },
        ],
    });

    const descriptions = _extractJsonArrayFromCompletion(completion);

    console.log('Parsed content array:', descriptions);

    const courses = descriptions.map((content: string, i: number) => {
        return {
            name: recipes[i].name,
            description: content
        }
    })

    const menu = {
        courses: courses,
        backgroundImage: 1
    }

    return menu
}


function _extractJsonArrayFromCompletion(completion: OpenAI.Chat.Completions.ChatCompletion & {
    _request_id?: string | null;
}) {
    if (!completion?.choices?.[0]?.message?.content) {
        console.error('Completion does not have valid content.');
        throw new LLMResponseFormatError('Invalid completion object: missing content.');
    }

    const content = completion.choices[0].message.content;

    try {
        const jsonStartIndex = content.indexOf('[');
        const jsonEndIndex = content.indexOf(']');

        if (jsonStartIndex === -1 || jsonEndIndex === -1) {
            console.error('No JSON array found in the content.');
            throw new LLMResponseFormatError('Content does not contain a JSON array.');
        }

        const jsonArrayString = content.substring(jsonStartIndex, jsonEndIndex + 1);

        return JSON.parse(jsonArrayString);
    } catch (error) {
        console.error('Failed to parse JSON from completion content:', error);
        throw new LLMResponseFormatError(`Error parsing JSON array from LLM: ${error}`);
    }
}
