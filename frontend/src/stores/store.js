import vuex from "vuex";

import * as StoreGetters from './items/StoreGetters';
import * as StoreMutations from './items/StoreMutations';


export const store = new vuex.Store({
  state:{
    site_key: '6Lc9PTEhAAAAAI7TR8J7Id1SiN0xaMajrfSaynpR',
    secret_key: '6Lc9PTEhAAAAAI3Qt3N1YaI8Ak9kWhG2wo03QuWf',
  },
  getters: StoreGetters,
  mutations: StoreMutations,

});
