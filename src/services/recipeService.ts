import { Recipe, RecipeInput } from "../__generated__/types";
import RecipeModel from "../models/recipe.js";

export async function getRecipes(): Promise<Recipe[]> {
    let recipes
    try {
        recipes = await RecipeModel.find({})
    } catch (error) {
        console.log('An error occured fetching recipes.')
        throw error
    }
    return recipes
}

export async function addRecipes(recipes: RecipeInput[]): Promise<Recipe[]> {
    await RecipeModel.insertMany(recipes)
    return recipes
}