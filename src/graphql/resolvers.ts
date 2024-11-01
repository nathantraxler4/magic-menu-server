import * as menuService from '../services/menuService.js'
import { Resolvers } from '../__generated__/types.js';

const resolvers: Resolvers = {
    Query: {
      menus: () => menuService.getMenus(),
      generateMenu: (_parent, args, _contextValue, _info) => menuService.generateMenu(args.recipes)
    }
};

export default resolvers