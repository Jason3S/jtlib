/**
 *
 */

import { Json, isJsonObj, isJsonArray } from './json';

export interface TransformationDefinition {
    [field: string]: TranFn;
    [field: number]: TranFn;
}

export type IndexKey = string | number;

export function parent() {
    return create(a => a).parent();
}

export function field(index: IndexKey) {
    return create(a => a).field(index);
}

export interface Indexable<T> {
    [key: string]: T;
    [key: number]: T;
}

export interface ContextItem {
    index: IndexKey;
    data: Json;
}

export type Context = ContextItem[];


export interface TranFn {
    (data?: Json, index?: IndexKey, context?: Context): Json | undefined;
}

export interface TranFnT extends TranFn {
    parent: () => TranFnT;
    field: (index: IndexKey) => TranFnT;
}

interface TranFnResolve {
    (state: TranState): TranState;
}

interface TranState {
    data?: Json;
    index?: IndexKey;
    context: Context;
}


function create(fnResolve: TranFnResolve) {

    const fnTran = <TranFnT> function(data?: Json, index?: IndexKey, context: Context = []) {
        const state: TranState = fnResolve({ data, index, context });
        return state.data;
    };

    fnTran.field = function(index: IndexKey) {
        return create(
            function (stateInitial: TranState) {
                const state = fnResolve(stateInitial);
                const data = (isJsonObj(state.data))
                    ? state.data[index]
                    : (isJsonArray(state.data) && typeof index === 'number' ? state.data[index] : undefined);
                const context = [{index: state.index, data: state.data}, ...state.context];
                return { data, index, context };
            }
        );
    };

    fnTran.parent = function() {
        return create(
            function (stateInitial: TranState) {
                const state = fnResolve(stateInitial);
                const parentState: ContextItem = state.context[0] || {index: undefined, data: undefined};
                const {data, index} = parentState;
                const context = state.context.slice(1);
                return { data, index, context };
            }
        );
    };

    return fnTran;
}

