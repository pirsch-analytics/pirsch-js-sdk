import axios, { AxiosError, AxiosInstance } from "axios";
import { ClientConfig, APIError, Optional, HttpOptions } from "./types";

import { Core } from "./core";
import { defaultBaseUrl, defaultTimeout, defaultProtocol } from "./constants";

/**
 * Client is used to access the Pirsch API.
 */
export class Client extends Core {
    private httpClient: AxiosInstance;

    /**
     * The constructor creates a new client.
     *
     * @param config You need to pass in the hostname, client ID, and client secret you have configured on the Pirsch dashboard.
     * It's also recommended to set the proper protocol for your website, else it will be set to http by default.
     * All other configuration parameters can be left to their defaults.
     */
    constructor({
        baseUrl = defaultBaseUrl,
        timeout = defaultTimeout,
        protocol = defaultProtocol,
        hostname,
        clientId,
        clientSecret,
    }: ClientConfig) {
        super({ baseUrl, timeout, protocol, hostname, clientId, clientSecret });
        this.httpClient = axios.create({ baseURL: this.baseUrl, timeout: this.timeout });
    }

    protected async get<Response>(url: string, options?: HttpOptions): Promise<Response> {
        const result = await this.httpClient.get<Response>(url, options);

        return result.data;
    }

    protected async post<Response, Data extends object = object>(
        url: string,
        data: Data,
        options?: HttpOptions
    ): Promise<Response> {
        const result = await this.httpClient.post<Response>(url, data, options);

        return result.data;
    }

    protected toApiError(error: unknown): Optional<APIError> {
        if (error instanceof AxiosError && error.response !== undefined && error.request !== null) {
            const exception = error as AxiosError<APIError>;
            return {
                code: exception.response?.status ?? 500,
                validation: {},
                error: [],
                ...exception.response?.data,
            };
        }

        return;
    }
}
