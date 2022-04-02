"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expandList = exports.expandObject = exports.applyListOptions = exports.stringifyMetadata = exports.generateId = void 0;
function generateId(length = 20) {
    const chars = "0123456789abcfedghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    return new Array(length).fill("5").map(() => chars[(Math.random() * chars.length) | 0]).join("");
}
exports.generateId = generateId;
function stringifyMetadata(metadata) {
    if (!metadata) {
        return {};
    }
    const resp = {};
    for (const key in metadata) {
        resp[key] = metadata[key] + "";
    }
    return resp;
}
exports.stringifyMetadata = stringifyMetadata;
/**
 * Applies query parameters common to all "list" endpoints (IListOptions) to the results.
 * @param data The result of the list endpoint.
 * @param params The list endpoint params.
 * @param retriever A function that retrieves an item from the list with the given ID.
 *                  When an object with the given ID is not in the list a StripeError
 *                  should be thrown that matches the error when using the `retrieve` endpoint.
 */
function applyListOptions(data, params, retriever) {
    let hasMore = false;
    if (params.starting_after) {
        const startingAfter = retriever(params.starting_after, "starting_after");
        const startingAfterIx = data.indexOf(startingAfter);
        data = data.slice(startingAfterIx + 1);
        if (params.limit && data.length > params.limit) {
            data = data.slice(0, params.limit);
            hasMore = true;
        }
    }
    else if (params.ending_before) {
        const endingBefore = retriever(params.ending_before, "ending_before");
        const endingBeforeIx = data.indexOf(endingBefore);
        data = data.slice(0, endingBeforeIx);
        if (params.limit && data.length > params.limit) {
            data = data.slice(data.length - params.limit);
            hasMore = true;
        }
    }
    else if (params.limit && data.length > params.limit) {
        data = data.slice(0, params.limit);
        hasMore = true;
    }
    return {
        object: "list",
        data: data,
        has_more: hasMore,
        url: "/v1/refunds"
    };
}
exports.applyListOptions = applyListOptions;
/**
 * Hide some properties from the object that are not expanded.
 * This creates a copy of the object.
 * @param obj The object to expand.
 * @param hideList The list of properties to hide.
 * @param expandList The list of properties to expand (overriding hideList).
 */
function expandObject(obj, hideList, expandList) {
    const expandListValid = expandList != null && Array.isArray(expandList);
    const filteredObj = {};
    for (const key in obj) {
        if (!hideList.includes(key) || (expandListValid && expandList.includes(key))) {
            filteredObj[key] = obj[key];
        }
    }
    return filteredObj;
}
exports.expandObject = expandObject;
/**
 * Hide some properties from the objects that are not expanded.
 * This creates a copy of the object.
 * @param list The list of objects to expand.
 * @param hideList The list of properties to hide.
 * @param expandList The list of properties to expand (overriding hideList).
 */
function expandList(list, hideList, expandList) {
    return Object.assign(Object.assign({}, list), { data: list.data.map(d => expandObject(d, hideList, expandList)) });
}
exports.expandList = expandList;
//# sourceMappingURL=utils.js.map