import {
    ClientConfig,
    AuthenticationResponse,
    APIError,
    Hit,
    Domain,
    Filter,
    Keyword,
    ScreenClassStats,
    PlatformStats,
    CountryStats,
    BrowserStats,
    OSStats,
    ReferrerStats,
    LanguageStats,
    VisitorHourStats,
    ActiveVisitorsData,
    Growth,
    ConversionGoal,
    EventStats,
    PageStats,
    VisitorStats,
    UTMTermStats,
    UTMContentStats,
    UTMCampaignStats,
    UTMMediumStats,
    UTMSourceStats,
    TimeSpentStats,
    TotalVisitorStats,
    EventListStats,
    OSVersionStats,
    BrowserVersionStats,
    EntryStats,
    ExitStats,
    CityStats,
    Scalar,
    Optional,
    HttpOptions,
} from "./types";

import {
    defaultBaseUrl,
    defaultTimeout,
    defaultProtocol,
    authenticationEndpoint,
    hitEndpoint,
    eventEndpoint,
    sessionEndpoint,
    domainEndpoint,
    sessionDurationEndpoint,
    timeOnPageEndpoint,
    utmSourceEndpoint,
    utmMediumEndpoint,
    utmCampaignEndpoint,
    utmContentEndpoint,
    utmTermEndpoint,
    totalVisitorsEndpoint,
    visitorsEndpoint,
    pagesEndpoint,
    entryPagesEndpoint,
    exitPagesEndpoint,
    conversionGoalsEndpoint,
    eventsEndpoint,
    eventMetadataEndpoint,
    listEventsEndpoint,
    growthRateEndpoint,
    activeVisitorsEndpoint,
    timeOfDayEndpoint,
    languageEndpoint,
    referrerEndpoint,
    osEndpoint,
    osVersionEndpoint,
    browserEndpoint,
    browserVersionEndpoint,
    countryEndpoint,
    cityEndpoint,
    platformEndpoint,
    screenEndpoint,
    keywordsEndpoint,
} from "./constants";

export abstract class Core {
    protected readonly clientId: string;
    protected readonly clientSecret: string;
    protected readonly hostname: string;
    protected readonly protocol: string;
    protected readonly baseUrl: string;
    protected readonly timeout: number;
    protected accessToken = "";

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
        if (!clientId) {
            this.accessToken = clientSecret;
        }

        this.baseUrl = baseUrl;
        this.timeout = timeout;
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.hostname = hostname;
        this.protocol = protocol;
    }

    /**
     * hit sends a hit to Pirsch. Make sure you call it in all request handlers you want to track.
     * Also, make sure to filter out unwanted pathnames (like /favicon.ico in your root handler for example).
     *
     * @param hit all required data for the request.
     * @returns APIError or an empty promise, in case something went wrong
     */
    async hit(hit: Hit): Promise<Optional<APIError>> {
        if (hit.dnt === "1") {
            return;
        }

        return await this.performPost(hitEndpoint, hit);
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
    async event(name: string, hit: Hit, duration = 0, meta?: Record<string, Scalar>): Promise<Optional<APIError>> {
        if (hit.dnt === "1") {
            return;
        }

        return await this.performPost(eventEndpoint, {
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
    async session(hit: Hit): Promise<Optional<APIError>> {
        if (hit.dnt === "1") {
            return;
        }

        return await this.performPost(sessionEndpoint, hit);
    }

    /**
     * domain returns the domain for this client.
     *
     * @returns Domain object for this client.
     */
    async domain(): Promise<Domain | APIError> {
        const result = await this.performGet<Domain[]>(domainEndpoint);

        const error: APIError = {
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
    async sessionDuration(filter: Filter): Promise<TimeSpentStats[] | APIError> {
        return await this.performFilteredGet<TimeSpentStats[]>(sessionDurationEndpoint, filter);
    }

    /**
     * timeOnPage returns the time spent on pages.
     *
     * @param filter used to filter the result set.
     */
    async timeOnPage(filter: Filter): Promise<TimeSpentStats[] | APIError> {
        return await this.performFilteredGet<TimeSpentStats[]>(timeOnPageEndpoint, filter);
    }

    /**
     * utmSource returns the utm sources.
     *
     * @param filter used to filter the result set.
     */
    async utmSource(filter: Filter): Promise<UTMSourceStats[] | APIError> {
        return await this.performFilteredGet<UTMSourceStats[]>(utmSourceEndpoint, filter);
    }

    /**
     * utmMedium returns the utm medium.
     *
     * @param filter used to filter the result set.
     */
    async utmMedium(filter: Filter): Promise<UTMMediumStats[] | APIError> {
        return await this.performFilteredGet<UTMMediumStats[]>(utmMediumEndpoint, filter);
    }

    /**
     * utmCampaign returns the utm campaigns.
     *
     * @param filter used to filter the result set.
     */
    async utmCampaign(filter: Filter): Promise<UTMCampaignStats[] | APIError> {
        return await this.performFilteredGet<UTMCampaignStats[]>(utmCampaignEndpoint, filter);
    }

    /**
     * utmContent returns the utm content.
     *
     * @param filter used to filter the result set.
     */
    async utmContent(filter: Filter): Promise<UTMContentStats[] | APIError> {
        return await this.performFilteredGet<UTMContentStats[]>(utmContentEndpoint, filter);
    }

    /**
     * utmTerm returns the utm term.
     *
     * @param filter used to filter the result set.
     */
    async utmTerm(filter: Filter): Promise<UTMTermStats[] | APIError> {
        return await this.performFilteredGet<UTMTermStats[]>(utmTermEndpoint, filter);
    }

    /**
     * totalVisitors returns the total visitor statistics.
     *
     * @param filter used to filter the result set.
     */
    async totalVisitors(filter: Filter): Promise<TotalVisitorStats | APIError> {
        return await this.performFilteredGet<TotalVisitorStats>(totalVisitorsEndpoint, filter);
    }

    /**
     * visitors returns the visitor statistics grouped by day.
     *
     * @param filter used to filter the result set.
     */
    async visitors(filter: Filter): Promise<VisitorStats[] | APIError> {
        return await this.performFilteredGet<VisitorStats[]>(visitorsEndpoint, filter);
    }

    /**
     * entryPages returns the entry page statistics grouped by page.
     *
     * @param filter used to filter the result set.
     */
    async entryPages(filter: Filter): Promise<EntryStats[] | APIError> {
        return await this.performFilteredGet<EntryStats[]>(entryPagesEndpoint, filter);
    }

    /**
     * exitPages returns the exit page statistics grouped by page.
     *
     * @param filter used to filter the result set.
     */
    async exitPages(filter: Filter): Promise<ExitStats[] | APIError> {
        return await this.performFilteredGet<ExitStats[]>(exitPagesEndpoint, filter);
    }

    /**
     * pages returns the page statistics grouped by page.
     *
     * @param filter used to filter the result set.
     */
    async pages(filter: Filter): Promise<PageStats[] | APIError> {
        return await this.performFilteredGet<PageStats[]>(pagesEndpoint, filter);
    }

    /**
     * conversionGoals returns all conversion goals.
     *
     * @param filter used to filter the result set.
     */
    async conversionGoals(filter: Filter): Promise<ConversionGoal[] | APIError> {
        return await this.performFilteredGet<ConversionGoal[]>(conversionGoalsEndpoint, filter);
    }

    /**
     * events returns all events.
     *
     * @param filter used to filter the result set.
     */
    async events(filter: Filter): Promise<EventStats[] | APIError> {
        return await this.performFilteredGet<EventStats[]>(eventsEndpoint, filter);
    }

    /**
     * eventMetadata returns the metadata for a single event.
     *
     * @param filter used to filter the result set.
     */
    async eventMetadata(filter: Filter): Promise<EventStats[] | APIError> {
        return await this.performFilteredGet<EventStats[]>(eventMetadataEndpoint, filter);
    }

    /**
     * listEvents returns a list of all events including metadata.
     *
     * @param filter used to filter the result set.
     */
    async listEvents(filter: Filter): Promise<EventListStats[] | APIError> {
        return await this.performFilteredGet<EventListStats[]>(listEventsEndpoint, filter);
    }

    /**
     * growth returns the growth rates for visitors, bounces, ...
     *
     * @param filter used to filter the result set.
     */
    async growth(filter: Filter): Promise<Growth | APIError> {
        return await this.performFilteredGet<Growth>(growthRateEndpoint, filter);
    }

    /**
     * activeVisitors returns the active visitors and what pages they're on.
     *
     * @param filter used to filter the result set.
     */
    async activeVisitors(filter: Filter): Promise<ActiveVisitorsData | APIError> {
        return await this.performFilteredGet<ActiveVisitorsData>(activeVisitorsEndpoint, filter);
    }

    /**
     * timeOfDay returns the number of unique visitors grouped by time of day.
     *
     * @param filter used to filter the result set.
     */
    async timeOfDay(filter: Filter): Promise<VisitorHourStats[] | APIError> {
        return await this.performFilteredGet<VisitorHourStats[]>(timeOfDayEndpoint, filter);
    }

    /**
     * languages returns language statistics.
     *
     * @param filter used to filter the result set.
     */
    async languages(filter: Filter): Promise<LanguageStats[] | APIError> {
        return await this.performFilteredGet<LanguageStats[]>(languageEndpoint, filter);
    }

    /**
     * referrer returns referrer statistics.
     *
     * @param filter used to filter the result set.
     */
    async referrer(filter: Filter): Promise<ReferrerStats[] | APIError> {
        return await this.performFilteredGet<ReferrerStats[]>(referrerEndpoint, filter);
    }

    /**
     * os returns operating system statistics.
     *
     * @param filter used to filter the result set.
     */
    async os(filter: Filter): Promise<OSStats[] | APIError> {
        return await this.performFilteredGet<OSStats[]>(osEndpoint, filter);
    }

    /**
     * osVersions returns operating system version statistics.
     *
     * @param filter used to filter the result set.
     */
    async osVersions(filter: Filter): Promise<OSVersionStats[] | APIError> {
        return await this.performFilteredGet<OSVersionStats[]>(osVersionEndpoint, filter);
    }

    /**
     * browser returns browser statistics.
     *
     * @param filter used to filter the result set.
     */
    async browser(filter: Filter): Promise<BrowserStats[] | APIError> {
        return await this.performFilteredGet<BrowserStats[]>(browserEndpoint, filter);
    }

    /**
     * browserVersions returns browser version statistics.
     *
     * @param filter used to filter the result set.
     */
    async browserVersions(filter: Filter): Promise<BrowserVersionStats[] | APIError> {
        return await this.performFilteredGet<BrowserVersionStats[]>(browserVersionEndpoint, filter);
    }

    /**
     * country returns country statistics.
     *
     * @param filter used to filter the result set.
     */
    async country(filter: Filter): Promise<CountryStats[] | APIError> {
        return await this.performFilteredGet<CountryStats[]>(countryEndpoint, filter);
    }

    /**
     * city returns city statistics.
     *
     * @param filter used to filter the result set.
     */
    async city(filter: Filter): Promise<CityStats[] | APIError> {
        return await this.performFilteredGet<CityStats[]>(cityEndpoint, filter);
    }

    /**
     * platform returns the platforms used by visitors.
     *
     * @param filter used to filter the result set.
     */
    async platform(filter: Filter): Promise<PlatformStats[] | APIError> {
        return await this.performFilteredGet<PlatformStats[]>(platformEndpoint, filter);
    }

    /**
     * screen returns the screen classes used by visitors.
     *
     * @param filter used to filter the result set.
     */
    async screen(filter: Filter): Promise<ScreenClassStats[] | APIError> {
        return await this.performFilteredGet<ScreenClassStats[]>(screenEndpoint, filter);
    }

    /**
     * keywords returns the Google keywords, rank, and CTR.
     *
     * @param filter used to filter the result set.
     */
    async keywords(filter: Filter): Promise<Keyword[] | APIError> {
        return await this.performFilteredGet<Keyword[]>(keywordsEndpoint, filter);
    }

    private async performPost<T extends object>(url: string, data: T, retry = true): Promise<Optional<APIError>> {
        try {
            await this.post(
                url,
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
            const exception = this.toApiError(error);

            if (exception && this.clientId && exception.code === 401 && retry) {
                await this.refreshToken();
                return this.performPost(url, data, false);
            }

            throw error;
        }
    }

    private async performGet<T>(url: string, parameters: object = {}, retry = true): Promise<T | APIError> {
        try {
            if (!this.accessToken && retry) {
                await this.refreshToken();
            }

            const data = await this.get<T>(url, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${this.accessToken}`,
                },
                parameters,
            });
            return data;
        } catch (error: unknown) {
            const exception = this.toApiError(error);

            if (exception && this.clientId && exception.code === 401 && retry) {
                await this.refreshToken();
                return this.performGet<T>(url, parameters, false);
            }

            throw error;
        }
    }

    private async performFilteredGet<T>(url: string, filter: Filter): Promise<T | APIError> {
        return this.performGet<T>(url, filter);
    }

    private async refreshToken(): Promise<Optional<APIError>> {
        try {
            const result = await this.post<AuthenticationResponse>(authenticationEndpoint, {
                client_id: this.clientId,
                client_secret: this.clientSecret,
            });
            this.accessToken = result.access_token;
            return;
        } catch (error: unknown) {
            this.accessToken = "";

            const exception = this.toApiError(error);

            if (exception) {
                return exception;
            }

            throw error;
        }
    }

    protected abstract post<Response, Data extends object = object>(
        url: string,
        data: Data,
        options?: HttpOptions
    ): Promise<Response>;
    protected abstract get<Response>(url: string, options?: HttpOptions): Promise<Response>;
    protected abstract toApiError(error: unknown): Optional<APIError>;
}
