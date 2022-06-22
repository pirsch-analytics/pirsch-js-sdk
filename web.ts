import ky, { HTTPError as KyHttpError, Options as KyOptions } from "ky";
import { PirschClientConfig, PirschApiError, PirschHttpOptions, Optional } from "./types";

import { PirschCoreClient } from "./core";
import { PIRSCH_DEFAULT_BASE_URL, PIRSCH_DEFAULT_TIMEOUT, PIRSCH_DEFAULT_PROTOCOL } from "./constants";

/**
 * Client is used to access the Pirsch API.
 */
export class PirschWebClient extends PirschCoreClient {
    private httpClient: typeof ky;

    /**
     * The constructor creates a new client.
     *
     * @param {object} config You need to pass in the **Hostname**, **Client ID**, and **Client Secret** you have configured on the Pirsch dashboard.
     * It's also recommended to set the proper protocol for your website, else it will be set to `https` by default.
     * All other configuration parameters can be left to their defaults.
     * @param {string} config.baseUrl The base URL for the pirsch API
     * @param {number} config.timeout The default HTTP timeout in milliseconds
     * @param {string} config.clientId The OAuth client ID
     * @param {string} config.clientSecret The OAuth client secret
     * @param {string} config.hostname The hostname of the domain to track
     * @param {string} config.protocol The default HTTP protocol to use for tracking
     *
     */
    constructor({
        baseUrl = PIRSCH_DEFAULT_BASE_URL,
        timeout = PIRSCH_DEFAULT_TIMEOUT,
        protocol = PIRSCH_DEFAULT_PROTOCOL,
        hostname,
        clientId,
        clientSecret,
    }: PirschClientConfig) {
        super({ baseUrl, timeout, protocol, hostname, clientId, clientSecret });
        this.httpClient = ky.create({ prefixUrl: baseUrl, timeout });
    }

    protected async get<Response>(url: string, options?: PirschHttpOptions): Promise<Response> {
        const result = await this.httpClient.get(url, this.createOptions({ ...options }));
        const response = await result.json() as unknown;
        return response as Response;
    }

    protected async post<Response, Data extends object = object>(
        url: string,
        data: Data,
        options?: PirschHttpOptions
    ): Promise<Response> {
        const result = await this.httpClient.post(url, this.createOptions({ ...options, data }));
        const response = await result.json() as unknown;
        return response as Response;
    }

    protected async toApiError(error: unknown): Promise<Optional<PirschApiError>> {
        if (error instanceof KyHttpError) {
            return {
                code: error.response.status,
                validation: {},
                error: [],
                ...(await error.response.json() as object),
            };
        }

        return;
    }

    private createOptions({ headers, parameters, data }: PirschHttpOptions & { data?: object }): KyOptions {
        return {
            headers,
            json: data,
            searchParams: parameters as Record<string, string>,
        };
    }
}

export const Pirsch = PirschWebClient;
export const Client = PirschWebClient;
