import { Recipe, RecipeInput } from '../__generated__/types';
import RecipeModel from '../models/recipe.js';

/**
 *
 */
export async function getRecipes(): Promise<Recipe[]> {
    let recipes;
    try {
        recipes = await RecipeModel.find({});
    } catch (error) {
        console.error(error);
        throw error;
    }
    return recipes;
}

/**
 *
 */
export async function addRecipes(recipes: RecipeInput[]): Promise<Recipe[]> {
    let insertedRecipes;
    try {
        insertedRecipes = await RecipeModel.insertMany(recipes);
    } catch (error) {
        console.error(error);
        throw error;
    }
    return insertedRecipes;
}
