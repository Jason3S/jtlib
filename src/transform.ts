/**
 *
 */

import { Json, isJsonObj, isJsonArray } from './json';

export type TransformationDefinition = TransformationDefObj | TranDefFn | TransformationDefArray;

export interface TransformationDefObj {
    [field: string]: TransformationDefinition;
    [field: number]: TransformationDefinition;
}

export interface TransformationDefArray extends Array<TransformationDefinition> {};

export type IndexKey = string | number | undefined;

export function parent() {
    return node().parent;
}

export function field(index: IndexKey) {
    return node().field(index);
}

export function node() {
    return create(a => a);
}

export function index() {
    return node().index;
}

export interface ContextItem {
    index: IndexKey;
    data: Json;
}

export type Context = ContextItem[];

export interface TranDefFn {
    <T>(data: Json, index?: IndexKey, context?: Context): T;
}

export interface TranFn {
    (data: Json, index?: IndexKey, context?: Context): Json;
}

export interface MapFn<T> {
    (data: Json, index?: IndexKey, context?: Context): T;
}

export interface TranFnT extends TranFn {
    parent: TranFnT;
    field: (index: IndexKey) => TranFnT;
    index: MapFn<IndexKey>;
    map: <T>(fn: MapFn<T>) => MapFn<T>;
}

interface TranFnResolve {
    (state: TranState): TranState;
}

interface TranState {
    data: Json;
    index?: IndexKey;
    context: Context;
}


function create(fnResolve: TranFnResolve) {

    const fnTran = <TranFnT> function(data: Json, index?: IndexKey, context: Context = []) {
        const state: TranState = fnResolve({ data, index, context });
        return state.data;
    };

    function resolveMap<T>(fn: (state: TranState) => T) {
        return function(data: Json, index?: IndexKey, context: Context = []) {
            const state: TranState = fnResolve({ data, index, context });
            return fn(state);
        };
    }

    fnTran.field = function(index: IndexKey) {
        return create(
            (stateInitial: TranState) => {
                const state = fnResolve(stateInitial);
                const data = (isJsonObj(state.data))
                    ? state.data[index!]
                    : (isJsonArray(state.data) && typeof index === 'number' ? state.data[index] : undefined);
                const context = [{index: state.index, data: state.data}, ...state.context];
                return { data, index, context };
            },
        );
    };

    /**
     * Define parent getter
     */
    Object.defineProperty(fnTran, 'parent', { get: () => {
        return create(
            (stateInitial: TranState) => {
                const state = fnResolve(stateInitial);
                const parentState: ContextItem = state.context[0] || {index: undefined, data: undefined};
                const {data, index} = parentState;
                const context = state.context.slice(1);
                return { data, index, context };
            },
        );
    } });

    /**
     * Define index getter
     */
    Object.defineProperty(fnTran, 'index', { get: () => {
        return resolveMap( state => state.index );
    } });

    fnTran.map = function<T>(fn: MapFn<T>) {
        return resolveMap( state => fn(state.data, state.index, state.context) );
    };

    return fnTran;
}

