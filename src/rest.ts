import axios from "axios";
import { EndpointHandler } from "./handler";
import { IServerRequestConfig, TServerRequest } from "./types";

/**
 * Build a REST API method class
 *
 * @export
 * @template RequestType
 * @template ResponseType
 * @param {IServerRequestConfig} config
 * @returns {TServerRequest<RequestType, ResponseType>}
 */
export function rest_api<RequestType, ResponseType>(
    config: IServerRequestConfig
): TServerRequest<RequestType, ResponseType> {
    return (request: RequestType): Promise<ResponseType> => {
        return new Promise(async (resolve, reject) => {
            const handler = config.handler ? new config.handler() : new EndpointHandler();
            handler.init(config, resolve, reject);
            try {
                config = handler.getConfig();
                handler.setRequest(request);
                config.data = handler.getRequest();
                handler.processServerResponse(await axios(config), true);
            } catch (err) {
                handler.processServerResponse(err.response || null, false);
                handler.handleError(err);
            }
        });
    };
}
