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
    const completionPromises = []
    for (const recipe of recipes) {
        const completion = openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { 
                    role: "system", 
                    content: 
                    `
                        You are a master chef preparing a meal for your friends. 
                        Pick out the 5 most important ingredients of a recipe presented to you and 
                        respond to me using a comma separated list. Please order the ingredients by
                        their importance to the dish starting with most important.
                    ` 
                },
                {
                    role: "user",
                    content: JSON.stringify(recipe),
                },
            ],
        });
        completionPromises.push(completion)
    }

    let completions
    try {
        completions = await Promise.all(completionPromises)
    } catch (error) {
        console.log('An error occurred generating completions.')
        throw error
    }

    const courses = []
    for (let i = 0; i < completions.length; i++) {
        courses.push({
            name: recipes[i].name,
            description: completions[i].choices[0].message.content ?? ''
        })
    }

    const menu = {
        courses: courses,
        backgroundImage: 1
    }

    return menu
}


function _generateDescription(recipe: RecipeInput) {

}