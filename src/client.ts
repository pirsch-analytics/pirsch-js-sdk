import { IncomingHttpHeaders, IncomingMessage } from "node:http";
import { URL } from "node:url";

import axios, { AxiosError as AxiosHttpError, AxiosInstance } from "axios";
import {
    PirschNodeClientConfig,
    PirschHttpOptions,
    PirschHit,
    PirschProxyHeader,
    Optional,
    Protocol,
    PirschSnakeCaseHeader,
    PirschApiErrorResponse,
} from "./types";

import { PirschCoreClient } from "./core";
import { PirschApiError, PirschUnknownApiError } from "./common";
import { PIRSCH_DEFAULT_PROTOCOL, PIRSCH_REFERRER_QUERY_PARAMETERS, PIRSCH_PROXY_HEADERS } from "./constants";

/**
 * Client is used to access the Pirsch API.
 */
export class PirschNodeApiClient extends PirschCoreClient {
    protected readonly hostname: string;
    protected readonly protocol: Protocol;
    protected readonly trustedProxyHeaders?: PirschProxyHeader[];

    private httpClient: AxiosInstance;

    /**
     * The constructor creates a new client.
     *
     * @param {object} configuration You need to pass in the **Hostname**, **Client ID**, and **Client Secret** you have configured on the Pirsch dashboard.
     * It's also recommended to set the proper protocol for your website, else it will be set to `https` by default.
     * All other configuration parameters can be left to their defaults.
     * @param {string} configuration.baseUrl The base URL for the pirsch API
     * @param {number} configuration.timeout The default HTTP timeout in milliseconds
     * @param {string} configuration.clientId The OAuth client ID
     * @param {string} configuration.clientSecret The OAuth client secret
     * @param {string} configuration.hostname The hostname of the domain to track
     * @param {string} configuration.protocol The default HTTP protocol to use for tracking
     *
     */
    constructor(configuration: PirschNodeClientConfig) {
        super(configuration);
        const { protocol = PIRSCH_DEFAULT_PROTOCOL, hostname } = configuration;

        this.hostname = hostname;
        this.protocol = protocol;

        this.httpClient = axios.create({ baseURL: this.baseUrl, timeout: this.timeout });
    }

    /**
     * hitFromRequest returns the required data to send a hit to Pirsch for a Node request object.
     *
     * @param request the Node request object from the http package.
     * @returns Hit object containing all necessary fields.
     */
    public hitFromRequest(request: IncomingMessage): PirschHit {
        const url = new URL(request.url ?? "", `${this.protocol}://${this.hostname}`);

        const element: PirschHit = {
            url: url.toString(),
            ip: request.socket.remoteAddress ?? "",
            dnt: this.getHeader(request.headers, "dnt"),
            user_agent: this.getHeader(request.headers, "user-agent"),
            accept_language: this.getHeader(request.headers, "accept-language"),
            referrer: this.getReferrer(request, url),
        };

        if (this.trustedProxyHeaders && this.trustedProxyHeaders.length > 0) {
            for (const header of this.trustedProxyHeaders.filter(header => {
                return PIRSCH_PROXY_HEADERS.includes(header);
            })) {
                element[this.snakeCase(header)] = this.getHeader(request.headers, header);
            }
        }

        return element;
    }

    private getReferrer(request: IncomingMessage, url: URL): string {
        const referrer =
            this.getHeader(request.headers, "referer") ?? this.getHeader(request.headers, "referrer") ?? "";

        if (referrer === "") {
            for (const parameterName of PIRSCH_REFERRER_QUERY_PARAMETERS) {
                const parameter = url.searchParams.get(parameterName);

                if (parameter && parameter !== "") {
                    return parameter;
                }
            }
        }

        return referrer;
    }

    private getHeader(headers: IncomingHttpHeaders, name: string): Optional<string> {
        const header = headers[name];

        if (Array.isArray(header)) {
            return header.at(0);
        }

        return header;
    }

    protected async get<Response>(url: string, options?: PirschHttpOptions): Promise<Response> {
        const result = await this.httpClient.get<Response>(url, options);

        return result.data;
    }

    protected async post<Response, Data extends object = object>(
        url: string,
        data: Data,
        options?: PirschHttpOptions
    ): Promise<Response> {
        const result = await this.httpClient.post<Response>(url, data, options);

        return result.data;
    }

    protected async toApiError(error: unknown): Promise<PirschApiError> {
        if (error instanceof PirschApiError) {
            return error;
        }

        if (error instanceof AxiosHttpError && error.response !== undefined) {
            const exception = error as AxiosHttpError<PirschApiErrorResponse>;

            return new PirschApiError(
                exception.response?.status ?? 500,
                exception.response?.data ?? { validation: {}, error: [] }
            );
        }

        if (error instanceof Error) {
            return new PirschUnknownApiError(error.message);
        }

        return new PirschUnknownApiError();
    }

    private snakeCase<T extends string>(value: T): PirschSnakeCaseHeader<T> {
        return value.replaceAll("-", "_") as PirschSnakeCaseHeader<T>;
    }
}

export const Pirsch = PirschNodeApiClient;
export const Client = PirschNodeApiClient;
