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
 * 
 * @param recipes a list of recipes to be used in generating the menu
 * @returns the generated menu
 */
export async function generateMenu(recipes: RecipeInput[]): Promise<Menu> {
    const openai = new OpenAI();
    const completionPromises = []
    for (const recipe of recipes) {
        const completion = openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { 
                    role: "system", 
                    content: `
                        You are a master chef preparing a meal for your friends. 
                        Pick out the 5 most important ingredients of a recipe presented to you and 
                        respond to me using a comma separated list
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
    const completions = await Promise.all(completionPromises)

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