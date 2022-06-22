import ky, { HTTPError, Options } from "ky";
import { ClientConfig, APIError, Optional, HttpOptions } from "./types";

import { Core } from "./core";
import { PIRSCH_DEFAULT_BASE_URL, PIRSCH_DEFAULT_TIMEOUT, PIRSCH_DEFAULT_PROTOCOL } from "./constants";

/**
 * Client is used to access the Pirsch API.
 */
export class Client extends Core {
    private httpClient: typeof ky;

    /**
     * The constructor creates a new client.
     *
     * @param config You need to pass in the hostname, client ID, and client secret you have configured on the Pirsch dashboard.
     * It's also recommended to set the proper protocol for your website, else it will be set to http by default.
     * All other configuration parameters can be left to their defaults.
     */
    constructor({
        baseUrl = PIRSCH_DEFAULT_BASE_URL,
        timeout = PIRSCH_DEFAULT_TIMEOUT,
        protocol = PIRSCH_DEFAULT_PROTOCOL,
        hostname,
        clientId,
        clientSecret,
    }: ClientConfig) {
        super({ baseUrl, timeout, protocol, hostname, clientId, clientSecret });
        this.httpClient = ky.create({ prefixUrl: baseUrl, timeout });
    }

    protected async get<Response>(url: string, options?: HttpOptions): Promise<Response> {
        const result = await this.httpClient.get(url, this.createOptions({ ...options }));
        const response = await result.json() as unknown;
        return response as Response;
    }

    protected async post<Response, Data extends object = object>(
        url: string,
        data: Data,
        options?: HttpOptions
    ): Promise<Response> {
        const result = await this.httpClient.post(url, this.createOptions({ ...options, data }));
        const response = await result.json() as unknown;
        return response as Response;
    }

    protected async toApiError(error: unknown): Promise<Optional<APIError>> {
        if (error instanceof HTTPError) {
            return {
                code: error.response.status,
                validation: {},
                error: [],
                ...(await error.response.json() as object),
            };
        }

        return;
    }

    private createOptions({ headers, parameters, data }: HttpOptions & { data?: object }): Options {
        return {
            headers,
            json: data,
            searchParams: parameters as Record<string, string>,
        };
    }
}
