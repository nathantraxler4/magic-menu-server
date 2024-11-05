import * as menuService from '../services/menuService.js'
import * as recipeService from '../services/recipeService.js'
import { Resolvers } from '../__generated__/types.js';

const resolvers: Resolvers = {
    Query: {
      recipes: () => recipeService.getRecipes(),
      menus: () => menuService.getMenus(),
      generateMenu: (_parent, args, _contextValue, _info) => menuService.generateMenu(args.recipes)
    }
};

export default resolvers