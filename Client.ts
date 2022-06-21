import { IncomingMessage } from "http";
import { URL } from "url";
import axios, { AxiosError, AxiosInstance } from "axios";
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
} from "./types";
import { EntryStats } from ".";
import { ExitStats } from ".";
import { CityStats } from ".";

const defaultBaseURL = "https://api.pirsch.io";
const defaultTimeout = 5000;
const defaultProtocol = "http";
const authenticationEndpoint = "/api/v1/token";
const hitEndpoint = "/api/v1/hit";
const eventEndpoint = "/api/v1/event";
const sessionEndpoint = "/api/v1/session";
const domainEndpoint = "/api/v1/domain";
const sessionDurationEndpoint = "/api/v1/statistics/duration/session";
const timeOnPageEndpoint = "/api/v1/statistics/duration/page";
const utmSourceEndpoint = "/api/v1/statistics/utm/source";
const utmMediumEndpoint = "/api/v1/statistics/utm/medium";
const utmCampaignEndpoint = "/api/v1/statistics/utm/campaign";
const utmContentEndpoint = "/api/v1/statistics/utm/content";
const utmTermEndpoint = "/api/v1/statistics/utm/term";
const totalVisitorsEndpoint = "/api/v1/statistics/total";
const visitorsEndpoint = "/api/v1/statistics/visitor";
const pagesEndpoint = "/api/v1/statistics/page";
const entryPagesEndpoint = "/api/v1/statistics/page/entry";
const exitPagesEndpoint = "/api/v1/statistics/page/exit";
const conversionGoalsEndpoint = "/api/v1/statistics/goals";
const eventsEndpoint = "/api/v1/statistics/events";
const eventMetadataEndpoint = "/api/v1/statistics/event/meta";
const listEventsEndpoint = "/api/v1/statistics/event/list";
const growthRateEndpoint = "/api/v1/statistics/growth";
const activeVisitorsEndpoint = "/api/v1/statistics/active";
const timeOfDayEndpoint = "/api/v1/statistics/hours";
const languageEndpoint = "/api/v1/statistics/language";
const referrerEndpoint = "/api/v1/statistics/referrer";
const osEndpoint = "/api/v1/statistics/os";
const osVersionEndpoint = "/api/v1/statistics/os/version";
const browserEndpoint = "/api/v1/statistics/browser";
const browserVersionEndpoint = "/api/v1/statistics/browser/version";
const countryEndpoint = "/api/v1/statistics/country";
const cityEndpoint = "/api/v1/statistics/city";
const platformEndpoint = "/api/v1/statistics/platform";
const screenEndpoint = "/api/v1/statistics/screen";
const keywordsEndpoint = "/api/v1/statistics/keywords";
const referrerQueryParams = ["ref", "referer", "referrer", "source", "utm_source"];

/**
 * Client is used to access the Pirsch API.
 */
export class Client {
    private readonly clientID: string;
    private readonly clientSecret: string;
    private readonly hostname: string;
    private readonly protocol: string;
    private client: AxiosInstance;
    private accessToken: string = "";

    /**
     * The constructor creates a new client.
     *
     * @param config You need to pass in the hostname, client ID, and client secret you have configured on the Pirsch dashboard.
     * It's also recommended to set the propper protocol for your website, else it will be set to http by default.
     * All other configuration parameters can be left to their defaults.
     */
    constructor(config: ClientConfig) {
        if (!config.baseURL) {
            config.baseURL = defaultBaseURL;
        }

        if (!config.timeout) {
            config.timeout = defaultTimeout;
        }

        if (!config.protocol) {
            config.protocol = defaultProtocol;
        }

        if (!config.clientID) {
            this.accessToken = config.clientSecret;
        }

        this.clientID = config.clientID;
        this.clientSecret = config.clientSecret;
        this.hostname = config.hostname;
        this.protocol = config.protocol;
        this.client = axios.create({
            baseURL: config.baseURL,
            timeout: config.timeout,
        });
    }

    /**
     * hit sends a hit to Pirsch. Make sure you call it in all request handlers you want to track.
     * Also, make sure to filter out unwanted pathnames (like /favicon.ico in your root handler for example).
     *
     * @param hit all required data for the request.
     * @param retry retry the request in case a 401 (unauthenticated) error is returned. Don't modify this.
     * @returns APIError or an empty promise, in case something went wrong
     */
    async hit(hit: Hit, retry: boolean = true): Promise<APIError | null> {
        try {
            if (hit.dnt === "1") {
                return Promise.resolve<null>(null);
            }

            await this.client.post(
                hitEndpoint,
                {
                    hostname: this.hostname,
                    ...hit,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${this.accessToken}`,
                    },
                }
            );
            return Promise.resolve<null>(null);
        } catch (e: any) {
            if (e.response) {
                if (this.clientID && e.response.status === 401 && retry) {
                    try {
                        await this.refreshToken();
                        return this.hit(hit, false);
                    } catch (e) {
                        return Promise.reject(e);
                    }
                }

                return Promise.reject<APIError>(e.response.data);
            }

            return Promise.reject(e);
        }
    }

    /**
     * event sends an event to Pirsch. Make sure you call it in all request handlers you want to track.
     * Also, make sure to filter out unwanted pathnames (like /favicon.ico in your root handler for example).
     *
     * @param name the name for the event
     * @param hit all required data for the request
     * @param duration optional duration for the event
     * @param meta optional object containing metadata (only scalar values, like strings, numbers, and booleans)
     * @param retry retry the request in case a 401 (unauthenticated) error is returned. Don't modify this.
     * @returns APIError or an empty promise, in case something went wrong
     */
    async event(
        name: string,
        hit: Hit,
        duration: number = 0,
        meta: Object | null = null,
        retry: boolean = true
    ): Promise<APIError | null> {
        try {
            if (hit.dnt === "1") {
                return Promise.resolve<null>(null);
            }

            await this.client.post(
                eventEndpoint,
                {
                    hostname: this.hostname,
                    event_name: name,
                    event_duration: duration,
                    event_meta: meta,
                    ...hit,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${this.accessToken}`,
                    },
                }
            );
            return Promise.resolve<null>(null);
        } catch (e: any) {
            if (e.response) {
                if (this.clientID && e.response.status === 401 && retry) {
                    try {
                        await this.refreshToken();
                        return this.event(name, hit, duration, meta, false);
                    } catch (e) {
                        return Promise.reject(e);
                    }
                }

                return Promise.reject<APIError>(e.response.data);
            }

            return Promise.reject(e);
        }
    }

    /**
     * session keeps a session alive.
     *
     * @param hit all required data for the request.
     * @param retry retry the request in case a 401 (unauthenticated) error is returned. Don't modify this.
     * @returns APIError or an empty promise, in case something went wrong
     */
    async session(hit: Hit, retry: boolean = true): Promise<APIError | null> {
        try {
            if (hit.dnt === "1") {
                return Promise.resolve<null>(null);
            }

            await this.client.post(
                sessionEndpoint,
                {
                    hostname: this.hostname,
                    ...hit,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${this.accessToken}`,
                    },
                }
            );
            return Promise.resolve<null>(null);
        } catch (e: any) {
            if (e.response) {
                if (this.clientID && e.response.status === 401 && retry) {
                    try {
                        await this.refreshToken();
                        return this.session(hit, false);
                    } catch (e) {
                        return Promise.reject(e);
                    }
                }

                return Promise.reject<APIError>(e.response.data);
            }

            return Promise.reject(e);
        }
    }

    /**
     * hitFromRequest returns the required data to send a hit to Pirsch for a Node request object.
     *
     * @param req the Node request object from the http package.
     * @returns Hit object containing all necessary fields.
     */
    hitFromRequest(req: IncomingMessage): Hit {
        const url = new URL(req.url || "", `${this.protocol}://${this.hostname}`);
        return {
            url: url.toString(),
            ip: req.socket.remoteAddress || "",
            cf_connecting_ip: (req.headers["cf-connecting-ip"] as string) || "",
            x_forwarded_for: (req.headers["x-forwarded-for"] as string) || "",
            forwarded: req.headers["forwarded"] || "",
            x_real_ip: (req.headers["x-real-ip"] as string) || "",
            dnt: (req.headers["dnt"] as string) || "",
            user_agent: req.headers["user-agent"] || "",
            accept_language: req.headers["accept-language"] || "",
            referrer: Client.getReferrer(req, url),
        };
    }

    /**
     * domain returns the domain for this client in an array (first and only entry).
     *
     * @param retry retry the request in case a 401 (unauthenticated) error is returned. Don't modify this.
     * @returns Domain object for this client.
     */
    async domain(retry: boolean = true): Promise<Domain[] | APIError> {
        try {
            const resp = await this.client.get(domainEndpoint, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${this.accessToken}`,
                },
            });

            if (resp.data.length === 0) {
                return Promise.reject<APIError>({
                    error: ["domain not found"],
                });
            }

            return Promise.resolve<Domain[]>(resp.data);
        } catch (e: any) {
            if (e.response) {
                if (this.clientID && e.response.status === 401 && retry) {
                    try {
                        await this.refreshToken();
                        return this.domain(false);
                    } catch (e) {
                        return Promise.reject(e);
                    }
                }

                return Promise.reject<APIError>(e.response.data);
            }

            return Promise.reject(e);
        }
    }

    /**
     * sessionDuration returns the session duration grouped by day.
     *
     * @param filter used to filter the result set.
     */
    async sessionDuration(filter: Filter): Promise<TimeSpentStats[] | APIError> {
        return await this.performGet<TimeSpentStats[]>(sessionDurationEndpoint, filter);
    }

    /**
     * timeOnPage returns the time spent on pages.
     *
     * @param filter used to filter the result set.
     */
    async timeOnPage(filter: Filter): Promise<TimeSpentStats[] | APIError> {
        return await this.performGet<TimeSpentStats[]>(timeOnPageEndpoint, filter);
    }

    /**
     * utmSource returns the utm sources.
     *
     * @param filter used to filter the result set.
     */
    async utmSource(filter: Filter): Promise<UTMSourceStats[] | APIError> {
        return await this.performGet<UTMSourceStats[]>(utmSourceEndpoint, filter);
    }

    /**
     * utmMedium returns the utm medium.
     *
     * @param filter used to filter the result set.
     */
    async utmMedium(filter: Filter): Promise<UTMMediumStats[] | APIError> {
        return await this.performGet<UTMMediumStats[]>(utmMediumEndpoint, filter);
    }

    /**
     * utmCampaign returnst he utm campaigns.
     *
     * @param filter used to filter the result set.
     */
    async utmCampaign(filter: Filter): Promise<UTMCampaignStats[] | APIError> {
        return await this.performGet<UTMCampaignStats[]>(utmCampaignEndpoint, filter);
    }

    /**
     * utmContent returns the utm content.
     *
     * @param filter used to filter the result set.
     */
    async utmContent(filter: Filter): Promise<UTMContentStats[] | APIError> {
        return await this.performGet<UTMContentStats[]>(utmContentEndpoint, filter);
    }

    /**
     * utmTerm returns the utm term.
     *
     * @param filter used to filter the result set.
     */
    async utmTerm(filter: Filter): Promise<UTMTermStats[] | APIError> {
        return await this.performGet<UTMTermStats[]>(utmTermEndpoint, filter);
    }

    /**
     * totalVisitors returns the total visitor statistics.
     *
     * @param filter used to filter the result set.
     */
    async totalVisitors(filter: Filter): Promise<TotalVisitorStats | APIError> {
        return await this.performGet<TotalVisitorStats>(totalVisitorsEndpoint, filter);
    }

    /**
     * visitors returns the visitor statistics grouped by day.
     *
     * @param filter used to filter the result set.
     */
    async visitors(filter: Filter): Promise<VisitorStats[] | APIError> {
        return await this.performGet<VisitorStats[]>(visitorsEndpoint, filter);
    }

    /**
     * entryPages returns the entry page statistics grouped by page.
     *
     * @param filter used to filter the result set.
     */
    async entryPages(filter: Filter): Promise<EntryStats[] | APIError> {
        return await this.performGet<EntryStats[]>(entryPagesEndpoint, filter);
    }

    /**
     * exitPages returns the exit page statistics grouped by page.
     *
     * @param filter used to filter the result set.
     */
    async exitPages(filter: Filter): Promise<ExitStats[] | APIError> {
        return await this.performGet<ExitStats[]>(exitPagesEndpoint, filter);
    }

    /**
     * pages returns the page statistics grouped by page.
     *
     * @param filter used to filter the result set.
     */
    async pages(filter: Filter): Promise<PageStats[] | APIError> {
        return await this.performGet<PageStats[]>(pagesEndpoint, filter);
    }

    /**
     * conversionGoals returns all conversion goals.
     *
     * @param filter used to filter the result set.
     */
    async conversionGoals(filter: Filter): Promise<ConversionGoal[] | APIError> {
        return await this.performGet<ConversionGoal[]>(conversionGoalsEndpoint, filter);
    }

    /**
     * events returns all events.
     *
     * @param filter used to filter the result set.
     */
    async events(filter: Filter): Promise<EventStats[] | APIError> {
        return await this.performGet<EventStats[]>(eventsEndpoint, filter);
    }

    /**
     * eventMetadata returns the metadata for a single event.
     *
     * @param filter used to filter the result set.
     */
    async eventMetadata(filter: Filter): Promise<EventStats[] | APIError> {
        return await this.performGet<EventStats[]>(eventMetadataEndpoint, filter);
    }

    /**
     * listEvents returns a list of all events including metadata.
     *
     * @param filter used to filter the result set.
     */
    async listEvents(filter: Filter): Promise<EventListStats[] | APIError> {
        return await this.performGet<EventListStats[]>(listEventsEndpoint, filter);
    }

    /**
     * growth returns the growth rates for visitors, bounces, ...
     *
     * @param filter used to filter the result set.
     */
    async growth(filter: Filter): Promise<Growth | APIError> {
        return await this.performGet<Growth>(growthRateEndpoint, filter);
    }

    /**
     * activeVisitors returns the active visitors and what pages they're on.
     *
     * @param filter used to filter the result set.
     */
    async activeVisitors(filter: Filter): Promise<ActiveVisitorsData | APIError> {
        return await this.performGet<ActiveVisitorsData>(activeVisitorsEndpoint, filter);
    }

    /**
     * timeOfDay returns the number of unique visitors grouped by time of day.
     *
     * @param filter used to filter the result set.
     */
    async timeOfDay(filter: Filter): Promise<VisitorHourStats[] | APIError> {
        return await this.performGet<VisitorHourStats[]>(timeOfDayEndpoint, filter);
    }

    /**
     * languages returns language statistics.
     *
     * @param filter used to filter the result set.
     */
    async languages(filter: Filter): Promise<LanguageStats[] | APIError> {
        return await this.performGet<LanguageStats[]>(languageEndpoint, filter);
    }

    /**
     * referrer returns referrer statistics.
     *
     * @param filter used to filter the result set.
     */
    async referrer(filter: Filter): Promise<ReferrerStats[] | APIError> {
        return await this.performGet<ReferrerStats[]>(referrerEndpoint, filter);
    }

    /**
     * os returns operating system statistics.
     *
     * @param filter used to filter the result set.
     */
    async os(filter: Filter): Promise<OSStats[] | APIError> {
        return await this.performGet<OSStats[]>(osEndpoint, filter);
    }

    /**
     * osVersions returns operating system version statistics.
     *
     * @param filter used to filter the result set.
     */
    async osVersions(filter: Filter): Promise<OSVersionStats[] | APIError> {
        return await this.performGet<OSVersionStats[]>(osVersionEndpoint, filter);
    }

    /**
     * browser returns browser statistics.
     *
     * @param filter used to filter the result set.
     */
    async browser(filter: Filter): Promise<BrowserStats[] | APIError> {
        return await this.performGet<BrowserStats[]>(browserEndpoint, filter);
    }

    /**
     * browserVersions returns browser version statistics.
     *
     * @param filter used to filter the result set.
     */
    async browserVersions(filter: Filter): Promise<BrowserVersionStats[] | APIError> {
        return await this.performGet<BrowserVersionStats[]>(browserVersionEndpoint, filter);
    }

    /**
     * country returns country statistics.
     *
     * @param filter used to filter the result set.
     */
    async country(filter: Filter): Promise<CountryStats[] | APIError> {
        return await this.performGet<CountryStats[]>(countryEndpoint, filter);
    }

    /**
     * city returns city statistics.
     *
     * @param filter used to filter the result set.
     */
    async city(filter: Filter): Promise<CityStats[] | APIError> {
        return await this.performGet<CityStats[]>(cityEndpoint, filter);
    }

    /**
     * platform returns the platforms used by visitors.
     *
     * @param filter used to filter the result set.
     */
    async platform(filter: Filter): Promise<PlatformStats[] | APIError> {
        return await this.performGet<PlatformStats[]>(platformEndpoint, filter);
    }

    /**
     * screen returns the screen classes used by visitors.
     *
     * @param filter used to filter the result set.
     */
    async screen(filter: Filter): Promise<ScreenClassStats[] | APIError> {
        return await this.performGet<ScreenClassStats[]>(screenEndpoint, filter);
    }

    /**
     * keywords returns the Google keywords, rank, and CTR.
     *
     * @param filter used to filter the result set.
     */
    async keywords(filter: Filter): Promise<Keyword[] | APIError> {
        return await this.performGet<Keyword[]>(keywordsEndpoint, filter);
    }

    private async performGet<T>(url: string, filter: Filter, retry: boolean = true): Promise<T | APIError> {
        try {
            if (!this.accessToken && retry) {
                await this.refreshToken();
            }

            const resp = await this.client.get(url, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${this.accessToken}`,
                },
                params: filter,
            });
            return Promise.resolve<T>(resp.data);
        } catch (e: any) {
            if (e.response) {
                if (this.clientID && e.response.status === 401 && retry) {
                    try {
                        await this.refreshToken();
                        return this.performGet<T>(url, filter, false);
                    } catch (e) {
                        return Promise.reject(e);
                    }
                }

                return Promise.reject<APIError>(e.response.data);
            }

            return Promise.reject(e);
        }
    }

    private async refreshToken(): Promise<APIError | null> {
        try {
            const resp = await this.client.post<AuthenticationResponse>(authenticationEndpoint, {
                client_id: this.clientID,
                client_secret: this.clientSecret,
            });
            this.accessToken = resp.data.access_token;
            return Promise.resolve<null>(null);
        } catch (e: any) {
            this.accessToken = "";

            if (e.response) {
                return Promise.reject<APIError>(e.response.data);
            }

            return Promise.reject(e);
        }
    }

    private static getReferrer(req: IncomingMessage, url: URL): string {
        let referrer = req.headers["referer"] || "";

        if (referrer === "") {
            for (let ref of referrerQueryParams) {
                const param = url.searchParams.get(ref);

                if (param && param !== "") {
                    return param;
                }
            }
        }

        return referrer;
    }
}
