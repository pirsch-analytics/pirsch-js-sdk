import {
    PirschIdentificationCodeClientConfig,
    PirschHttpOptions,
    PirschApiErrorResponse,
    PirschBrowserHit,
    Scalar,
} from "./types";

import { PirschApiError, PirschCommon, PirschUnknownApiError } from "./common";
import { PirschEndpoint, PIRSCH_DEFAULT_BASE_URL, PIRSCH_DEFAULT_TIMEOUT, PIRSCH_URL_LENGTH_LIMIT } from "./constants";
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";

/**
 * Client is used to access the Pirsch API.
 */
export class PirschWebClient extends PirschCommon {
    private readonly baseUrl: string;
    private readonly timeout: number;

    private readonly identificationCode: string;
    private readonly hostname?: string;

    private httpClient: AxiosInstance;

    /**
     * The constructor creates a new client.
     *
     * @param {object} configuration You need to pass in the **Hostname** and **Access Token** you have configured on the Pirsch dashboard.
     * It's also recommended to set the proper protocol for your website, else it will be set to `https` by default.
     * All other configuration parameters can be left to their defaults.
     * @param {string} configuration.baseUrl The base URL for the pirsch API
     * @param {number} configuration.timeout The default HTTP timeout in milliseconds
     * @param {string} configuration.identificationCode The identification code
     *
     */
    constructor(configuration: PirschIdentificationCodeClientConfig) {
        super();

        if ("clientId" in configuration || "clientSecret" in configuration) {
            throw new Error("Do not pass OAuth secrets such as 'clientId' or 'clientSecret' to the web client!");
        }

        if ("accessToken" in configuration) {
            throw new Error("Do not pass secrets such as 'accessToken' to the web client!");
        }

        const {
            baseUrl = PIRSCH_DEFAULT_BASE_URL,
            timeout = PIRSCH_DEFAULT_TIMEOUT,
            identificationCode,
            hostname,
        } = configuration;

        this.assertIdentificationCodeCredentials({ identificationCode });

        this.baseUrl = baseUrl;
        this.timeout = timeout;
        this.identificationCode = identificationCode;
        this.hostname = hostname;

        this.httpClient = axios.create({ baseURL: this.baseUrl, timeout: this.timeout });
    }

    /**
     * hit sends a hit to Pirsch.
     *
     * @param hit optional override data for the request.
     */
    public async hit(hit?: Partial<PirschBrowserHit>): Promise<void> {
        const data = { ...this.hitFromBrowser(), ...hit };
        const parameters = this.browserHitToGetParameters(data);

        if (data.dnt === "1") {
            return;
        }

        await this.get(PirschEndpoint.HIT, { parameters });
    }

    /**
     * event sends an event to Pirsch.
     *
     * @param name the name for the event
     * @param duration optional duration for the event
     * @param meta optional object containing metadata (only scalar values, like strings, numbers, and booleans)
     * @param hit optional override data for the request
     */
    public async event(
        name: string,
        duration = 0,
        meta?: Record<string, Scalar>,
        hit?: Partial<PirschBrowserHit>
    ): Promise<void> {
        const data = { ...this.hitFromBrowser(), ...hit };

        if (data.dnt === "1") {
            return;
        }

        await this.post(
            PirschEndpoint.EVENT,
            {
                identification_code: this.identificationCode,
                event_name: name,
                event_duration: duration,
                event_meta: this.prepareScalarObject(meta),
                ...data,
            },
            { headers: { "Content-Type": "application/json" } }
        );
    }

    /**
     * customHit sends a hit to Pirsch.
     *
     * @param hit data for the request.
     */
    public async customHit(hit: PirschBrowserHit): Promise<void> {
        const parameters = this.browserHitToGetParameters(hit);

        if (hit.dnt === "1") {
            return;
        }

        await this.get(PirschEndpoint.HIT, { parameters });
    }

    /**
     * customEvent sends an event to Pirsch.
     *
     * @param name the name for the event
     * @param duration optional duration for the event
     * @param hit data for the request
     * @param meta optional object containing metadata (only scalar values, like strings, numbers, and booleans)
     */
    public async customEvent(
        name: string,
        duration = 0,
        hit: PirschBrowserHit,
        meta?: Record<string, Scalar>
    ): Promise<void> {
        if (hit.dnt === "1") {
            return;
        }

        await this.post(
            PirschEndpoint.EVENT,
            {
                identification_code: this.identificationCode,
                event_name: name,
                event_duration: duration,
                event_meta: this.prepareScalarObject(meta),
                ...hit,
            },
            {
                headers: { "Content-Type": "application/json" },
            }
        );
    }

    /**
     * hitFromBrowser returns the required data to send a hit to Pirsch.
     *
     * @returns Hit object containing all necessary fields.
     */
    public hitFromBrowser(): PirschBrowserHit {
        const element: PirschBrowserHit = {
            url: this.generateUrl(),
            title: document.title,
            referrer: document.referrer,
            screen_width: screen.width,
            screen_height: screen.height,
        };

        if (navigator.doNotTrack === "1") {
            element.dnt = navigator.doNotTrack;
        }

        return element;
    }

    private browserHitToGetParameters(data: PirschBrowserHit) {
        const hit: {
            code: string;
            nc: number;
            url: string;
            t?: string;
            ref?: string;
            w?: number;
            h?: number;
        } = {
            nc: Date.now(),
            code: this.identificationCode,
            url: data.url,
        };

        if (data.title) {
            hit.t = data.title;
        }

        if (data.referrer) {
            hit.ref = data.referrer;
        }

        if (data.screen_width) {
            hit.w = data.screen_width;
        }

        if (data.screen_height) {
            hit.h = data.screen_height;
        }

        return hit;
    }

    private generateUrl() {
        const url = this.hostname ? location.href.replace(location.hostname, this.hostname) : location.href;

        return url.slice(0, PIRSCH_URL_LENGTH_LIMIT);
    }

    protected async get<Response>(url: string, options?: PirschHttpOptions): Promise<Response> {
        try {
            const result = await this.httpClient.get<Response>(url, this.createOptions({ ...options }));
            return result.data;
        } catch (error: unknown) {
            const exception = await this.toApiError(error);

            throw exception;
        }
    }

    protected async post<Response, Data extends object = object>(
        url: string,
        data: Data,
        options?: PirschHttpOptions
    ): Promise<Response> {
        try {
            const result = await this.httpClient.post<Response>(url, data, this.createOptions(options ?? {}));
            return result.data;
        } catch (error: unknown) {
            const exception = await this.toApiError(error);
            throw exception;
        }
    }

    protected async toApiError(error: unknown): Promise<PirschApiError> {
        if (error instanceof PirschApiError) {
            return error;
        }

        if (error instanceof AxiosError) {
            return new PirschApiError(error.response?.status ?? 400, error.response?.data as PirschApiErrorResponse);
        }

        if (typeof error === 'object' && error !== null && 'response' in error && typeof error.response === 'object' && error.response !== null && 'status' in error.response && 'data' in error.response) {
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

    private createOptions({ headers, parameters }: PirschHttpOptions): AxiosRequestConfig {
        return {
            headers,
            params: parameters as Record<string, Scalar>,
        };
    }
}

export const Pirsch = PirschWebClient;
export const Client = PirschWebClient;
