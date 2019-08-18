import { isInstanceOf } from "@blendsdk/stdlib/dist/isInstanceOf";
import { AxiosResponse } from "axios";
import { IServerRequestConfig } from "./types";
import { getTokenName } from "./utils";

/**
 * This class implements a Request/Response handler
 *
 * @export
 * @class EndpointHandler
 * @template RequestType
 * @template ResponseType
 */
export class EndpointHandler<RequestType, ResponseType> {
    /**
     * Reference to the IServerRequestConfig/axios configuration
     *
     * @protected
     * @type {IServerRequestConfig}
     * @memberof EndpointHandler
     */
    protected config: IServerRequestConfig;
    /**
     * Reference to the server response
     *
     * @protected
     * @type {AxiosResponse<any>}
     * @memberof EndpointHandler
     */
    protected serverResponse: AxiosResponse<any>;
    /**
     * reference to the response data
     *
     * @protected
     * @type {ResponseType}
     * @memberof EndpointHandler
     */
    protected response: ResponseType;
    /**
     * Reference to the request data
     *
     * @protected
     * @type {RequestType}
     * @memberof EndpointHandler
     */
    protected request: RequestType;
    /**
     * Reference to the resolve method of the wrapper Promise
     *
     * @protected
     * @type {Function}
     * @memberof EndpointHandler
     */
    protected resolve: Function;
    /**
     * Reference to the reject method of the wrapper Promise
     *
     * @protected
     * @type {Function}
     * @memberof EndpointHandler
     */
    protected reject: Function;

    /**
     * Initialize the handler
     *
     * @param {IServerRequestConfig} request
     * @param {Function} resolve
     * @param {Function} reject
     * @memberof EndpointHandler
     */
    public init(config: IServerRequestConfig, resolve: Function, reject: Function) {
        config.headers = config.headers || {};
        config.headers.common = config.headers.common || {};

        if (config.useToken) {
            config.headers.common.Authorization = `Bearer ${this.getToken(getTokenName(config || {}))}`;
        }

        this.config = config;
        this.resolve = resolve;
        this.reject = reject;
    }

    /**
     *  Get the request config instance.
     * This method can be used as a hook method to ass
     * extra configuratin to the axios config object
     *
     * @returns {IServerRequestConfig}
     * @memberof EndpointHandler
     */
    public getConfig(): IServerRequestConfig {
        return this.config;
    }

    /**
     * gets the response content-type
     *
     * @protected
     * @param {AxiosResponse} response
     * @returns
     * @memberof EndpointHandler
     */
    protected getContentType() {
        return (this.serverResponse.headers["content-type"] as string).split(";")[0] || null;
    }

    /**
     * Sets the request
     *
     * @param {RequestType} request
     * @memberof EndpointHandler
     */
    public setRequest(request: RequestType) {
        this.request = request;
    }

    /**
     * A hook method that can be used to manipulate the request before
     * sending it to the server
     *
     * @param {RequestType} request
     * @returns {RequestType}
     * @memberof EndpointHandler
     */
    public getRequest(): RequestType {
        return this.request;
    }

    /**
     * Gets the authentication token from the local storage.
     *
     * @param {string} token
     * @returns {string}
     * @memberof EndpointHandler
     */
    public getToken(token: string): string {
        return window.localStorage.getItem(token) || "";
    }

    /**
     * Creates a client side Error object based on the value
     * provided by the REST call.
     *
     * @protected
     * @param {*} error
     * @param {AxiosResponse<any>} response
     * @returns {*}
     * @memberof EndpointHandler
     */
    protected getRejectData(error: any): any {
        if (this.serverResponse) {
            switch (this.getContentType()) {
                case "text/html":
                    return new Error(this.serverResponse.statusText);
                case "application/json":
                default:
                    return this.serverResponse.data;
            }
        } else {
            return error;
        }
    }

    /**
     * Creates a client side Error instance based on the
     * value provided by a REST response
     *
     * @protected
     * @param {*} data
     * @returns {Error}
     * @memberof EndpointHandler
     */
    protected createError(data: any): Error {
        if (isInstanceOf(data, Error)) {
            return data as Error;
        } else {
            const error: any = new Error(data.message);
            error.name = data.type;
            error.metaData = data.metaData;
            error.level = data.level;
            error.code = data.code;
            return error;
        }
    }

    /**
     * A hook method that can be used to handle response error.
     *
     * @param {*} error
     * @param {AxiosResponse<any>} response
     * @param {Function} reject
     * @memberof EndpointHandler
     */
    public handleError(error: any) {
        this.reject(this.createError(this.getRejectData(error)));
    }

    /**
     * A hook method that can be used to parse or manipulate the server response
     * before passing it to the call
     *
     * @param {ResponseType} result
     * @memberof EndpointHandler
     */
    public handleResponse(result: ResponseType) {
        this.resolve(result);
    }

    /**
     * Sets the server response and calls the handler
     *
     * @param {AxiosResponse<any>} response
     * @memberof EndpointHandler
     */
    public processServerResponse(response: AxiosResponse<any>, callHandler: boolean) {
        this.serverResponse = response;
        if (callHandler) {
            this.handleResponse(response.data || {});
        }
    }
}
