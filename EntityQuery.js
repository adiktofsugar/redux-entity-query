import { createSelector } from 'reselect'
/** 
 * @template GlobalState
 * @template {(...args:any[])=>any} Func
 * @template {(...args:any[]) => (getState:()=>GlobalState) => ReturnType<Func>} Executor
 */
export default class EntityQuery {
    /** @typedef {Record<string,EntityState>} State */
    /** @typedef {Awaited<ReturnType<Func>>} Result */

    /**
     * @typedef {object} EntityState
     * @property {string?} key
     * @property {boolean} pending
     * @property {boolean} complete
     * @property {Result} [result]
     * @property {Error} [error]
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
     * @typedef {(...args:Parameters<Executor>)=>ThunkAction} ExecEnsureActionCreator
     */

    /**
     * @param {string[]} prefix - Specify both the action prefix and reducer location
     * @param {Executor} executor - Main function called by action creators that should return a function
     *                              that can use state that actually calls the intended method
     * @param {object} [options]
     * @param {(getState:()=>GlobalState, ...args:Parameters<Executor>)=>string} [options.key]
     */
    constructor(prefix, executor, { key: getKey } = {}) {

        /**
         * 
         * @returns {EntityState}
         */
        const createInitialState = (key) => ({
            complete: false,
            key,
            pending: false,
            error: null,
            result: null,
        })

        /**
         * @param {GlobalState} state 
         */
        const selectBase = (state) => {
            let current = state;
            for (const p of prefix) {
                current = current[p];
            }
            return /** @type {State} */(current);
        }

        const selectAll = createSelector(selectBase, (state) => Object.values(state));
        /**
         * @param {any} state 
         * @param {string} id 
         */
        const selectId = (state, id) => id;
        const selectOne = createSelector([
            selectAll,
            selectId,
        ], (state, id) => state.find(entity => entity.key === id) || createInitialState(id));


        const LOADING = [...prefix, 'loading'].join('/');
        const COMPLETE = [...prefix, 'complete'].join('/');
    
        /**
         * @param {string} key
         * @returns {BasicAction<null>}
        */
        const loadingAction = (key) => ({
            type: LOADING,
            meta: { key }
        });

        /**
         * @param {string} key
         * @param {Result} payload
         * @param {Error?} error
         * @returns {BasicAction<Result>}
        */
        const completeAction = (key, payload, error) => ({
            type: COMPLETE,
            payload,
            error,
            meta: { key }
        })

        
        /** @type {ExecEnsureActionCreator} */
        const execAction = (...args) => async (getState, dispatch) => {
            const key = getKey ? getKey(getState, ...args) : null;
            dispatch(loadingAction(key));
            try {
                dispatch(completeAction(key, await executor(...args)(getState), null));
            } catch (e) {
                dispatch(completeAction(key, null, e));
            }
        }
        
        /** @type {ExecEnsureActionCreator} */
        const ensureAction = (...args) => (getState, dispatch) => {
            const key = getKey ? getKey(getState, ...args) : null;
            const base = selectBase(getState());
            if (!base[key] || (!base[key].complete &&!base[key].pending)) {
                dispatch(execAction(...args));
            }
        }
        
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
                }
            }
        }
        /**
         * 
         * @param {State} state 
         * @param {BasicAction<Result>} action
         * @returns {State}
         */
        function completeReducer(state, { payload, error, meta: { key }}) {
            const current = state[key];
            return {
                ...state,
                [key]: {
                    ...current,
                    loading: false,
                    complete: true,
                    result: payload,
                    error: error,
                }
            }
        }

        this.actions = {
            exec: execAction,
            ensure: ensureAction,
        }
        /**
         * 
         * @param {State} state 
         * @param {BasicAction<any>} action 
         * @returns {State}
         */
        this.reducer = (state = {}, action) => {
            switch(action.type) {
                case LOADING:
                    return loadingReducer(state, action);
                case COMPLETE:
                    return completeReducer(state, action);
            }
            return state;
        }

        this.selectors = {
            selectBase,
            selectAll,
            selectOne,
        }

    }
}