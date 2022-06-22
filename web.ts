import ky, { HTTPError as KyHttpError, Options as KyOptions } from "ky";
import { PirschTokenClientConfig, PirschApiError, PirschHttpOptions, Optional } from "./types";

import { PirschCoreClient } from "./core";

/**
 * Client is used to access the Pirsch API.
 */
export class PirschWebClient extends PirschCoreClient {
    private httpClient: typeof ky;

    /**
     * The constructor creates a new client.
     *
     * @param {object} configuration You need to pass in the **Hostname** and **Access Token** you have configured on the Pirsch dashboard.
     * It's also recommended to set the proper protocol for your website, else it will be set to `https` by default.
     * All other configuration parameters can be left to their defaults.
     * @param {string} configuration.baseUrl The base URL for the pirsch API
     * @param {number} configuration.timeout The default HTTP timeout in milliseconds
     * @param {string} configuration.accessToken The access token
     *
     */
    constructor(configuration: PirschTokenClientConfig) {
        if ("clientId" in configuration || "clientSecret" in configuration) {
            throw new Error("Do not pass OAuth secrets such as 'clientId' or 'clientSecret' to the web client, as it is insecure!");
        }

        super(configuration);
        this.httpClient = ky.create({ prefixUrl: this.baseUrl, timeout: this.timeout });
    }

    protected async get<Response>(url: string, options?: PirschHttpOptions): Promise<Response> {
        const result = await this.httpClient.get(url, this.createOptions({ ...options }));
        const response = (await result.json()) as unknown;
        return response as Response;
    }

    protected async post<Response, Data extends object = object>(
        url: string,
        data: Data,
        options?: PirschHttpOptions
    ): Promise<Response> {
        const result = await this.httpClient.post(url, this.createOptions({ ...options, data }));
        const response = (await result.json()) as unknown;
        return response as Response;
    }

    protected async toApiError(error: unknown): Promise<Optional<PirschApiError>> {
        if (error instanceof KyHttpError) {
            return {
                code: error.response.status,
                validation: {},
                error: [],
                ...((await error.response.json()) as object),
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
