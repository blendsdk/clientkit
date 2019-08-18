import { isBoolean } from "@blendsdk/stdlib/dist/isBoolean";
import { IServerRequestConfig } from "./types";

/**
 * Check if the given error is of a certain type
 *
 * @export
 * @param {string} name
 * @param {Error} error
 * @returns
 */
export function isErrorType(name: string, error: Error) {
    return error && error.name && error.name === name;
}

/**
 * Gets a token key name that is going to be used to read
 * the authentication token from local storage
 *
 * @export
 * @param {IServerRequestConfig} config
 * @returns {string}
 */
export function getTokenName(config: IServerRequestConfig): string {
    return isBoolean(config.useToken) && config.useToken === true ? "token" : (config.useToken || "").toString();
}

/**
 * Clears the authentication token from the local storage
 *
 * @export
 * @param {string} [tokenKey]
 */
export function clearToken(tokenKey?: string) {
    window.localStorage.removeItem(tokenKey || "token");
}
