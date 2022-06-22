import {
    PirschClientConfig,
    PirschAuthenticationResponse,
    PirschApiError,
    PirschHit,
    PirschDomain,
    PirschFilter,
    PirschKeyword,
    PirschScreenClassStats,
    PirschPlatformStats,
    PirschCountryStats,
    PirschBrowserStats,
    PirschOSStats,
    PirschReferrerStats,
    PirschLanguageStats,
    PirschVisitorHourStats,
    PirschActiveVisitorsData,
    PirschGrowth,
    PirschConversionGoal,
    PirschEventStats,
    PirschPageStats,
    PirschVisitorStats,
    PirschUTMTermStats,
    PirschUTMContentStats,
    PirschUTMCampaignStats,
    PirschUTMMediumStats,
    PirschUTMSourceStats,
    PirschTimeSpentStats,
    PirschTotalVisitorStats,
    PirschEventListStats,
    PirschOSVersionStats,
    PirschBrowserVersionStats,
    PirschEntryStats,
    PirschExitStats,
    PirschCityStats,
    PirschHttpOptions,
    Scalar,
    Optional,
} from "./types";

import { PIRSCH_DEFAULT_BASE_URL, PIRSCH_DEFAULT_TIMEOUT, PIRSCH_DEFAULT_PROTOCOL, PirschEndpoint } from "./constants";

export abstract class PirschCoreClient {
    protected readonly version = "v1";
    protected readonly endpoint = "api";

    protected readonly clientId?: string;
    protected readonly clientSecret?: string;

    protected readonly hostname: string;
    protected readonly protocol: string;
    protected readonly baseUrl: string;
    protected readonly timeout: number;
    protected accessToken = "";

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
    constructor(configuration: PirschClientConfig) {
        const {
            baseUrl = PIRSCH_DEFAULT_BASE_URL,
            timeout = PIRSCH_DEFAULT_TIMEOUT,
            protocol = PIRSCH_DEFAULT_PROTOCOL,
            hostname,
        } = configuration;

        this.baseUrl = baseUrl;
        this.timeout = timeout;
        this.hostname = hostname;
        this.protocol = protocol;

        if ("accessToken" in configuration) {
            const { accessToken } = configuration;
            this.accessToken = accessToken;
            this.mode = 'access-token'
        } else {
            const { clientId, clientSecret } = configuration;
            this.clientId = clientId;
            this.clientSecret = clientSecret;
            this.mode = 'oauth'
        }
    }

    /**
     * hit sends a hit to Pirsch. Make sure you call it in all request handlers you want to track.
     * Also, make sure to filter out unwanted pathnames (like /favicon.ico in your root handler for example).
     *
     * @param hit all required data for the request.
     * @returns APIError or an empty promise, in case something went wrong
     */
    async hit(hit: PirschHit): Promise<Optional<PirschApiError>> {
        if (hit.dnt === "1") {
            return;
        }

        return await this.performPost(PirschEndpoint.HIT, hit);
    }

    /**
     * event sends an event to Pirsch. Make sure you call it in all request handlers you want to track.
     * Also, make sure to filter out unwanted pathnames (like /favicon.ico in your root handler for example).
     *
     * @param name the name for the event
     * @param hit all required data for the request
     * @param duration optional duration for the event
     * @param meta optional object containing metadata (only scalar values, like strings, numbers, and booleans)
     * @returns APIError or an empty promise, in case something went wrong
     */
    async event(
        name: string,
        hit: PirschHit,
        duration = 0,
        meta?: Record<string, Scalar>
    ): Promise<Optional<PirschApiError>> {
        if (hit.dnt === "1") {
            return;
        }

        return await this.performPost(PirschEndpoint.EVENT, {
            event_name: name,
            event_duration: duration,
            event_meta: meta,
            ...hit,
        });
    }

    /**
     * session keeps a session alive.
     *
     * @param hit all required data for the request.
     * @returns APIError or an empty promise, in case something went wrong
     */
    async session(hit: PirschHit): Promise<Optional<PirschApiError>> {
        if (hit.dnt === "1") {
            return;
        }

        return await this.performPost(PirschEndpoint.SESSION, hit);
    }

    /**
     * domain returns the domain for this client.
     *
     * @returns Domain object for this client.
     */
    async domain(): Promise<PirschDomain | PirschApiError> {
        const result = await this.performGet<PirschDomain[]>(PirschEndpoint.DOMAIN);

        const error: PirschApiError = {
            code: 404,
            validation: {},
            error: ["domain not found"],
        };

        if (Array.isArray(result) && result.length === 0) {
            return error;
        } else if (Array.isArray(result)) {
            return result.at(0) ?? error;
        }

        return result;
    }

    /**
     * sessionDuration returns the session duration grouped by day.
     *
     * @param filter used to filter the result set.
     */
    async sessionDuration(filter: PirschFilter): Promise<PirschTimeSpentStats[] | PirschApiError> {
        return await this.performFilteredGet<PirschTimeSpentStats[]>(PirschEndpoint.SESSION_DURATION, filter);
    }

    /**
     * timeOnPage returns the time spent on pages.
     *
     * @param filter used to filter the result set.
     */
    async timeOnPage(filter: PirschFilter): Promise<PirschTimeSpentStats[] | PirschApiError> {
        return await this.performFilteredGet<PirschTimeSpentStats[]>(PirschEndpoint.TIME_ON_PAGE, filter);
    }

    /**
     * utmSource returns the utm sources.
     *
     * @param filter used to filter the result set.
     */
    async utmSource(filter: PirschFilter): Promise<PirschUTMSourceStats[] | PirschApiError> {
        return await this.performFilteredGet<PirschUTMSourceStats[]>(PirschEndpoint.UTM_SOURCE, filter);
    }

    /**
     * utmMedium returns the utm medium.
     *
     * @param filter used to filter the result set.
     */
    async utmMedium(filter: PirschFilter): Promise<PirschUTMMediumStats[] | PirschApiError> {
        return await this.performFilteredGet<PirschUTMMediumStats[]>(PirschEndpoint.UTM_MEDIUM, filter);
    }

    /**
     * utmCampaign returns the utm campaigns.
     *
     * @param filter used to filter the result set.
     */
    async utmCampaign(filter: PirschFilter): Promise<PirschUTMCampaignStats[] | PirschApiError> {
        return await this.performFilteredGet<PirschUTMCampaignStats[]>(PirschEndpoint.UTM_CAMPAIGN, filter);
    }

    /**
     * utmContent returns the utm content.
     *
     * @param filter used to filter the result set.
     */
    async utmContent(filter: PirschFilter): Promise<PirschUTMContentStats[] | PirschApiError> {
        return await this.performFilteredGet<PirschUTMContentStats[]>(PirschEndpoint.UTM_CONTENT, filter);
    }

    /**
     * utmTerm returns the utm term.
     *
     * @param filter used to filter the result set.
     */
    async utmTerm(filter: PirschFilter): Promise<PirschUTMTermStats[] | PirschApiError> {
        return await this.performFilteredGet<PirschUTMTermStats[]>(PirschEndpoint.UTM_TERM, filter);
    }

    /**
     * totalVisitors returns the total visitor statistics.
     *
     * @param filter used to filter the result set.
     */
    async totalVisitors(filter: PirschFilter): Promise<PirschTotalVisitorStats | PirschApiError> {
        return await this.performFilteredGet<PirschTotalVisitorStats>(PirschEndpoint.TOTAL_VISITORS, filter);
    }

    /**
     * visitors returns the visitor statistics grouped by day.
     *
     * @param filter used to filter the result set.
     */
    async visitors(filter: PirschFilter): Promise<PirschVisitorStats[] | PirschApiError> {
        return await this.performFilteredGet<PirschVisitorStats[]>(PirschEndpoint.VISITORS, filter);
    }

    /**
     * entryPages returns the entry page statistics grouped by page.
     *
     * @param filter used to filter the result set.
     */
    async entryPages(filter: PirschFilter): Promise<PirschEntryStats[] | PirschApiError> {
        return await this.performFilteredGet<PirschEntryStats[]>(PirschEndpoint.ENTRY_PAGES, filter);
    }

    /**
     * exitPages returns the exit page statistics grouped by page.
     *
     * @param filter used to filter the result set.
     */
    async exitPages(filter: PirschFilter): Promise<PirschExitStats[] | PirschApiError> {
        return await this.performFilteredGet<PirschExitStats[]>(PirschEndpoint.EXIT_PAGES, filter);
    }

    /**
     * pages returns the page statistics grouped by page.
     *
     * @param filter used to filter the result set.
     */
    async pages(filter: PirschFilter): Promise<PirschPageStats[] | PirschApiError> {
        return await this.performFilteredGet<PirschPageStats[]>(PirschEndpoint.PAGES, filter);
    }

    /**
     * conversionGoals returns all conversion goals.
     *
     * @param filter used to filter the result set.
     */
    async conversionGoals(filter: PirschFilter): Promise<PirschConversionGoal[] | PirschApiError> {
        return await this.performFilteredGet<PirschConversionGoal[]>(PirschEndpoint.CONVERSION_GOALS, filter);
    }

    /**
     * events returns all events.
     *
     * @param filter used to filter the result set.
     */
    async events(filter: PirschFilter): Promise<PirschEventStats[] | PirschApiError> {
        return await this.performFilteredGet<PirschEventStats[]>(PirschEndpoint.EVENTS, filter);
    }

    /**
     * eventMetadata returns the metadata for a single event.
     *
     * @param filter used to filter the result set.
     */
    async eventMetadata(filter: PirschFilter): Promise<PirschEventStats[] | PirschApiError> {
        return await this.performFilteredGet<PirschEventStats[]>(PirschEndpoint.EVENT_METADATA, filter);
    }

    /**
     * listEvents returns a list of all events including metadata.
     *
     * @param filter used to filter the result set.
     */
    async listEvents(filter: PirschFilter): Promise<PirschEventListStats[] | PirschApiError> {
        return await this.performFilteredGet<PirschEventListStats[]>(PirschEndpoint.LIST_EVENTS, filter);
    }

    /**
     * growth returns the growth rates for visitors, bounces, ...
     *
     * @param filter used to filter the result set.
     */
    async growth(filter: PirschFilter): Promise<PirschGrowth | PirschApiError> {
        return await this.performFilteredGet<PirschGrowth>(PirschEndpoint.GROWTH_RATE, filter);
    }

    /**
     * activeVisitors returns the active visitors and what pages they're on.
     *
     * @param filter used to filter the result set.
     */
    async activeVisitors(filter: PirschFilter): Promise<PirschActiveVisitorsData | PirschApiError> {
        return await this.performFilteredGet<PirschActiveVisitorsData>(PirschEndpoint.ACTIVE_VISITORS, filter);
    }

    /**
     * timeOfDay returns the number of unique visitors grouped by time of day.
     *
     * @param filter used to filter the result set.
     */
    async timeOfDay(filter: PirschFilter): Promise<PirschVisitorHourStats[] | PirschApiError> {
        return await this.performFilteredGet<PirschVisitorHourStats[]>(PirschEndpoint.TIME_OF_DAY, filter);
    }

    /**
     * languages returns language statistics.
     *
     * @param filter used to filter the result set.
     */
    async languages(filter: PirschFilter): Promise<PirschLanguageStats[] | PirschApiError> {
        return await this.performFilteredGet<PirschLanguageStats[]>(PirschEndpoint.LANGUAGE, filter);
    }

    /**
     * referrer returns referrer statistics.
     *
     * @param filter used to filter the result set.
     */
    async referrer(filter: PirschFilter): Promise<PirschReferrerStats[] | PirschApiError> {
        return await this.performFilteredGet<PirschReferrerStats[]>(PirschEndpoint.REFERRER, filter);
    }

    /**
     * os returns operating system statistics.
     *
     * @param filter used to filter the result set.
     */
    async os(filter: PirschFilter): Promise<PirschOSStats[] | PirschApiError> {
        return await this.performFilteredGet<PirschOSStats[]>(PirschEndpoint.OS, filter);
    }

    /**
     * osVersions returns operating system version statistics.
     *
     * @param filter used to filter the result set.
     */
    async osVersions(filter: PirschFilter): Promise<PirschOSVersionStats[] | PirschApiError> {
        return await this.performFilteredGet<PirschOSVersionStats[]>(PirschEndpoint.OS_VERSION, filter);
    }

    /**
     * browser returns browser statistics.
     *
     * @param filter used to filter the result set.
     */
    async browser(filter: PirschFilter): Promise<PirschBrowserStats[] | PirschApiError> {
        return await this.performFilteredGet<PirschBrowserStats[]>(PirschEndpoint.BROWSER, filter);
    }

    /**
     * browserVersions returns browser version statistics.
     *
     * @param filter used to filter the result set.
     */
    async browserVersions(filter: PirschFilter): Promise<PirschBrowserVersionStats[] | PirschApiError> {
        return await this.performFilteredGet<PirschBrowserVersionStats[]>(PirschEndpoint.BROWSER_VERSION, filter);
    }

    /**
     * country returns country statistics.
     *
     * @param filter used to filter the result set.
     */
    async country(filter: PirschFilter): Promise<PirschCountryStats[] | PirschApiError> {
        return await this.performFilteredGet<PirschCountryStats[]>(PirschEndpoint.COUNTRY, filter);
    }

    /**
     * city returns city statistics.
     *
     * @param filter used to filter the result set.
     */
    async city(filter: PirschFilter): Promise<PirschCityStats[] | PirschApiError> {
        return await this.performFilteredGet<PirschCityStats[]>(PirschEndpoint.CITY, filter);
    }

    /**
     * platform returns the platforms used by visitors.
     *
     * @param filter used to filter the result set.
     */
    async platform(filter: PirschFilter): Promise<PirschPlatformStats[] | PirschApiError> {
        return await this.performFilteredGet<PirschPlatformStats[]>(PirschEndpoint.PLATFORM, filter);
    }

    /**
     * screen returns the screen classes used by visitors.
     *
     * @param filter used to filter the result set.
     */
    async screen(filter: PirschFilter): Promise<PirschScreenClassStats[] | PirschApiError> {
        return await this.performFilteredGet<PirschScreenClassStats[]>(PirschEndpoint.SCREEN, filter);
    }

    /**
     * keywords returns the Google keywords, rank, and CTR.
     *
     * @param filter used to filter the result set.
     */
    async keywords(filter: PirschFilter): Promise<PirschKeyword[] | PirschApiError> {
        return await this.performFilteredGet<PirschKeyword[]>(PirschEndpoint.KEYWORDS, filter);
    }

    private async performPost<T extends object>(
        path: PirschEndpoint,
        data: T,
        retry = true
    ): Promise<Optional<PirschApiError>> {
        try {
            await this.post(
                this.generateUrl(path),
                {
                    hostname: this.hostname,
                    ...data,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${this.accessToken}`,
                    },
                }
            );
            return;
        } catch (error: unknown) {
            const exception = await this.toApiError(error);

            if (exception && this.clientId && exception.code === 401 && retry) {
                await this.refreshToken();
                return this.performPost(path, data, false);
            }

            throw error;
        }
    }

    private async performGet<T>(
        path: PirschEndpoint,
        parameters: object = {},
        retry = true
    ): Promise<T | PirschApiError> {
        try {
            if (!this.accessToken && retry) {
                await this.refreshToken();
            }

            const data = await this.get<T>(this.generateUrl(path), {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${this.accessToken}`,
                },
                parameters,
            });

            return data;
        } catch (error: unknown) {
            const exception = await this.toApiError(error);

            if (exception && this.clientId && exception.code === 401 && retry) {
                await this.refreshToken();
                return this.performGet<T>(path, parameters, false);
            }

            throw error;
        }
    }

    private async performFilteredGet<T>(url: PirschEndpoint, filter: PirschFilter): Promise<T | PirschApiError> {
        return this.performGet<T>(url, filter);
    }

    private async refreshToken(): Promise<Optional<PirschApiError>> {
        if (!this.clientId || !this.clientSecret) {
            return;
        }

        try {
            const result = await this.post<PirschAuthenticationResponse>(
                this.generateUrl(PirschEndpoint.AUTHENTICATION),
                {
                    client_id: this.clientId,
                    client_secret: this.clientSecret,
                }
            );
            this.accessToken = result.access_token;
            return;
        } catch (error: unknown) {
            this.accessToken = "";

            const exception = await this.toApiError(error);

            if (exception) {
                return exception;
            }

            throw error;
        }
    }

    private generateUrl(path: PirschEndpoint): string {
        return "/" + [this.endpoint, this.version, path].join("/");
    }

    protected abstract post<Response, Data extends object = object>(
        url: string,
        data: Data,
        options?: PirschHttpOptions
    ): Promise<Response>;
    protected abstract get<Response>(url: string, options?: PirschHttpOptions): Promise<Response>;
    protected abstract toApiError(error: unknown): Promise<Optional<PirschApiError>>;
}
