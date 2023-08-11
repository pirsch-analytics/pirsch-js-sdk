import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import { PirschTokenClientConfig, PirschHttpOptions, PirschApiErrorResponse } from "./types";

import { PirschCoreClient } from "./core";
import { PirschApiError, PirschUnknownApiError } from "./common";

/**
 * Client is used to access the Pirsch API.
 */
export class PirschWebApiClient extends PirschCoreClient {
    private httpClient: AxiosInstance;

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
            throw new Error("Do not pass OAuth secrets such as 'clientId' or 'clientSecret' to the web client!");
        }

        super(configuration);
        this.httpClient = axios.create({
            baseURL: this.baseUrl,
            timeout: this.timeout,
        });
    }

    protected async get<Response>(url: string, options?: PirschHttpOptions): Promise<Response> {
        const result = await this.httpClient.get<Response>(url, this.createOptions({ ...options }));

        return result.data;
    }

    protected async post<Response, Data extends object = object>(
        url: string,
        data: Data,
        options?: PirschHttpOptions
    ): Promise<Response> {
        const result = await this.httpClient.post<Response>(url, data, this.createOptions({ ...options, data }));

        return result.data;
    }

    protected async toApiError(error: unknown): Promise<PirschApiError> {
        if (error instanceof PirschApiError) {
            return error;
        }

        if (error instanceof AxiosError) {
            return new PirschApiError(error.response?.status ?? 400, error.response?.data as PirschApiErrorResponse);
        }

        if (typeof error === 'object' && error !== null && 'response' in error && typeof error.response === 'object' &&  error.response !== null && 'status' in error.response && 'data' in error.response) {
            return new PirschApiError(error.response.status as number ?? 400, error.response?.data as PirschApiErrorResponse);
        }

        if (error instanceof Error) {
            return new PirschUnknownApiError(error.message);
        }

        if (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string') {
            return new PirschUnknownApiError(error.message);
        }

        return new PirschUnknownApiError(JSON.stringify(error));
    }

    private createOptions({ headers, parameters, data }: PirschHttpOptions & { data?: object }): AxiosRequestConfig {
        return {
            headers,
            params: parameters as Record<string, string>,
            data,
        };
    }
}

export const Pirsch = PirschWebApiClient;
export const Client = PirschWebApiClient;
