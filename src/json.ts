/**
 *
 */

export type Json = number | string | boolean | JsonObj | JsonArray | undefined | null;

export interface JsonObj {
    [index: string]: Json;
    [index: number]: Json;
}

export interface JsonArray extends Array<Json> {};

export function isJsonArray(json: Json): json is JsonArray {
    return json instanceof Array;
}

export function isJsonObj(json: Json): json is JsonObj {
    return ! isJsonArray(json) && typeof json === 'object';
}
