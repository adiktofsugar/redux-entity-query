import { EntityQuery } from "redux-entity-query";
import { combineReducers, createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import fetchPostList from "./data/fetchPostList.js";
import fetchPostDetail from "./data/fetchPostDetail.js";

/**
 * @typedef {object} GlobalState
 * @property {string} token
 */

export const postListQuery = new EntityQuery(
  ["postList"],
  /**
   * @param {GlobalState} state
   */
  (state) => fetchPostList(state.token)
);

export const postDetailQuery = new EntityQuery(
  ["postDetail"],
  /**
   * @param {GlobalState} state
   * @param {string} id
   */
  (state, id) => fetchPostDetail("token", id)
);

/**
 *
 * @param {string} state
 * @param {import('redux').Action<'SET_TOKEN'> & { payload: string }} action
 */
// eslint-disable-next-line default-param-last
const tokenReducer = (state = "no-token", action) => {
  if (action.type === "SET_TOKEN") {
    return action.payload;
  }
  return state;
};

export default () =>
  createStore(
    combineReducers({
      token: tokenReducer,
      postList: postListQuery.reducer,
      postDetail: postDetailQuery.reducer,
    }),
    // @ts-ignore
    applyMiddleware(thunk)
  );
