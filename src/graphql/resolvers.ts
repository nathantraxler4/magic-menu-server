import * as menuService from '../services/menuService.js';
import * as recipeService from '../services/recipeService.js';
import { Resolvers } from '../__generated__/types.js';

const resolvers: Resolvers = {
    Query: {
        recipes: async () => await recipeService.getRecipes(),
        menus: async () => await menuService.getMenus(),
        generateMenu: async (_parent, args) => {
            return await menuService.generateMenu(args.recipes);
        }
    },
    Mutation: {
        addRecipes: async (_parent, args) => await recipeService.addRecipes(args.recipes)
    }
};

export default resolvers;
