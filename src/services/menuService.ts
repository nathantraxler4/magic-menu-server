import { Menu, RecipeInput } from "../__generated__/types";
import OpenAI from "openai";
const openai = new OpenAI();

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

    let completionContentArray
    if (completion?.choices[0]?.message?.content) {
        try {
            const completionContent = completion?.choices[0]?.message?.content
            const jsonStartIndex = completionContent.indexOf('[')
            const jsonEndIndex = completionContent.indexOf(']') + 1
            const completionContentArrayString = completionContent.substring(jsonStartIndex, jsonEndIndex)
            completionContentArray = JSON.parse(completionContentArrayString)
        } catch (error) {
            console.log('There was an error parsing the completion')
            throw error
        }
    }

    const courses = completionContentArray.map((content: string, i: number) => {
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


function _generateDescription(recipe: RecipeInput) {

}