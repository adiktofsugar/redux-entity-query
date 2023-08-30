// eslint-disable-next-line import/no-extraneous-dependencies
import { useCallback, useEffect } from "react";
import { createSelector } from "reselect";

const NO_KEY = "@@_NO_KEY_@@";
/** @typedef {string} EntityKey */

/**
 * @template GlobalState
 * @template {(state:GlobalState, ...args:any[]) => any} Executor
 */
export default class EntityQuery {
  /** @typedef {Record<EntityKey,EntityState>} State */
  /** @typedef {Awaited<ReturnType<Executor>>} Result */
  /** @typedef {Executor extends (state:any,...args:infer A)=>any ? A : never} Args */
  /** @typedef {()=>GlobalState} GetState */
  /** @typedef {(action:BasicAction<any>)=>any} Dispatch */
  /** @typedef {{getState:GetState,dispatch:Dispatch}} Store */

  /**
   * @typedef {object} EntityState
   * @property {EntityKey} key
   * @property {boolean} pending
   * @property {boolean} complete
   * @property {Result?} [result]
   * @property {Error?} [error]
   */

  /**
   * @template Payload
   * @typedef {object} BasicAction
   * @property {string} type
   * @property {Payload?} [payload]
   * @property {Error?} [error]
   * @property {any} [meta]
   */

  /**
   * @callback ThunkAction
   * @param {()=>GlobalState} getState
   * @param {(action:ThunkAction | BasicAction<any>)=>any} dispatch
   * @returns {any}
   */

  /**
   * @typedef {(...args:Args)=>ThunkAction} ExecEnsureActionCreator
   */

  /**
   * @param {string[]} prefix - Specify both the action prefix and reducer location
   * @param {Executor} executor - Main function called by action creators that should return a function
   *                              that can use state that actually calls the intended method
   * @param {object} [options]
   * @param {(state:GlobalState, ...args:Args)=>EntityKey} [options.key]
   */
  constructor(prefix, executor, { key: getKey } = {}) {
    /**
     *
     * @param {EntityKey} key
     * @returns {EntityState}
     */
    const createInitialState = (key) => ({
      complete: false,
      key,
      pending: false,
      error: null,
      result: null,
    });

    /**
     * @param {GlobalState} state
     */
    const selectBase = (state) => {
      let current = state;
      for (const p of prefix) {
        // @ts-ignore
        current = current[p];
      }
      return /** @type {State} */ (current);
    };

    const selectAll = createSelector(selectBase, (state) =>
      Object.values(state)
    );
    /**
     * @param {GlobalState} state
     * @param {Args} args
     */
    const selectKey = (state, ...args) =>
      getKey ? getKey(state, ...args) : NO_KEY;
    const selectOne = createSelector(
      [selectAll, selectKey],
      (state, key) =>
        state.find((entity) => entity.key === key) || createInitialState(key)
    );

    const LOADING = [...prefix, "loading"].join("/");
    const COMPLETE = [...prefix, "complete"].join("/");

    /**
     * @param {EntityKey} key
     * @returns {BasicAction<null>}
     */
    const loadingAction = (key) => ({
      type: LOADING,
      meta: { key },
    });

    /**
     * @param {EntityKey} key
     * @param {Result?} payload
     * @param {Error?} error
     * @returns {BasicAction<Result>}
     */
    const completeAction = (key, payload, error) => ({
      type: COMPLETE,
      payload,
      error,
      meta: { key },
    });

    /** @typedef {(getState:GetState,dispatch:Dispatch,...args:Args)=>any} ExecEnsure */

    /** @type {ExecEnsure} */
    async function exec(getState, dispatch, ...args) {
      const key = getKey ? getKey(getState(), ...args) : NO_KEY;
      dispatch(loadingAction(key));
      try {
        dispatch(
          completeAction(key, await executor(getState(), ...args), null)
        );
      } catch (e) {
        dispatch(completeAction(key, null, e));
      }
    }

    /** @type {ExecEnsure} */
    function ensure(getState, dispatch, ...args) {
      const key = getKey ? getKey(getState(), ...args) : NO_KEY;
      const base = selectBase(getState());
      if (!base[key] || (!base[key].complete && !base[key].pending)) {
        exec(getState, dispatch, ...args);
      }
    }

    /** @type {ExecEnsureActionCreator} */
    const execAction =
      (...args) =>
      (getState, dispatch) =>
        exec(getState, dispatch, ...args);

    /** @type {ExecEnsureActionCreator} */
    const ensureAction =
      (...args) =>
      (getState, dispatch) => {
        const key = getKey ? getKey(getState(), ...args) : NO_KEY;
        const base = selectBase(getState());
        if (!base[key] || (!base[key].complete && !base[key].pending)) {
          dispatch(execAction(...args));
        }
      };

    /**
     *
     * @param {State} state
     * @param {BasicAction<null>} action
     * @returns {State}
     */
    function loadingReducer(state, { meta: { key } }) {
      const current = state[key] || createInitialState(key);
      return {
        ...state,
        [key]: {
          ...current,
          loading: true,
        },
      };
    }
    /**
     *
     * @param {State} state
     * @param {BasicAction<Result>} action
     * @returns {State}
     */
    function completeReducer(state, { payload, error, meta: { key } }) {
      const current = state[key];
      return {
        ...state,
        [key]: {
          ...current,
          loading: false,
          complete: true,
          result: payload,
          error,
        },
      };
    }

    this.actions = {
      exec: execAction,
      ensure: ensureAction,
    };

    /**
     * Hook to return an exec method to force query
     * @param {Store} store
     */
    this.useExec = (store) =>
      useCallback(
        /** @param {Args} args */
        (...args) => exec(store.getState, store.dispatch, ...args),
        []
      );

    /**
     * Hook to return an ensure method to trigger query
     * @param {Store} store
     */
    this.useEnsure = (store) =>
      useCallback(
        /** @param {Args} args */
        (...args) => ensure(store.getState, store.dispatch, ...args),
        []
      );

    /**
     * Hook to call the ensure flow of the query
     * @param {Store} store
     * @param  {Args} args
     */
    this.useEnsured = (store, ...args) => {
      useEffect(() => {
        ensure(store.getState, store.dispatch, ...args);
      }, []);
    };
    /**
     *
     * @param {State} state
     * @param {BasicAction<any>} action
     * @returns {State}
     */
    // eslint-disable-next-line default-param-last
    this.reducer = (state = {}, action) => {
      switch (action.type) {
        case LOADING:
          return loadingReducer(state, action);
        case COMPLETE:
          return completeReducer(state, action);
        default:
          return state;
      }
    };

    this.selectors = {
      selectBase,
      selectAll,
      selectOne,
    };
  }
}
