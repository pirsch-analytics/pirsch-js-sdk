import { IncomingHttpHeaders, IncomingMessage } from "node:http";
import { URL } from "node:url";

import axios, { AxiosError, AxiosInstance } from "axios";
import { PirschClientConfig, PirschApiError, PirschHttpOptions, PirschHit, Optional } from "./types";

import { PirschCoreClient } from "./core";
import { PIRSCH_DEFAULT_BASE_URL, PIRSCH_DEFAULT_TIMEOUT, PIRSCH_DEFAULT_PROTOCOL, PIRSCH_REFERRER_QUERY_PARAMETERS} from "./constants";

/**
 * Client is used to access the Pirsch API.
 */
export class PirschNodeClient extends PirschCoreClient {
    private httpClient: AxiosInstance;

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
    }: PirschClientConfig) {
        super({ baseUrl, timeout, protocol, hostname, clientId, clientSecret });
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
        return {
            url: url.toString(),
            ip: request.socket.remoteAddress ?? "",
            cf_connecting_ip: this.getHeaderWithDefault(request.headers, "cf-connecting-ip"),
            x_forwarded_for: this.getHeaderWithDefault(request.headers, "x-forwarded-for"),
            forwarded: this.getHeaderWithDefault(request.headers, "forwarded"),
            x_real_ip: this.getHeaderWithDefault(request.headers, "x-real-ip"),
            dnt: this.getHeaderWithDefault(request.headers, "dnt"),
            user_agent: this.getHeaderWithDefault(request.headers, "user-agent"),
            accept_language: this.getHeaderWithDefault(request.headers, "accept-language"),
            referrer: this.getReferrer(request, url),
        };
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

    private getHeaderWithDefault(headers: IncomingHttpHeaders, name: string): string {
        return this.getHeader(headers, name) ?? "";
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

    protected async toApiError(error: unknown): Promise<Optional<PirschApiError>> {
        if (error instanceof AxiosError && error.response !== undefined && error.request !== null) {
            const exception = error as AxiosError<PirschApiError>;
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

export const Pirsch = PirschNodeClient;
export const Client = PirschNodeClient;
