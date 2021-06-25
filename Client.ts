import { IncomingMessage } from "http";
import { URL } from "url";
import axios, { AxiosInstance } from "axios";
import { ClientConfig, AuthenticationResponse, APIError, Hit } from "./types";

const defaultBaseURL = "https://api.pirsch.io";
const defaultTimeout = 5000;
const defaultProtocol = "http";
const authenticationEndpoint = "/api/v1/token";
const hitEndpoint = "/api/v1/hit";
const domainEndpoint = "/api/v1/domain";
const sessionDurationEndpoint = "/api/v1/statistics/duration/session";
const timeOnPageEndpoint = "/api/v1/statistics/duration/page";
const utmSourceEndpoint = "/api/v1/statistics/utm/source";
const utmMediumEndpoint = "/api/v1/statistics/utm/medium";
const utmCampaignEndpoint = "/api/v1/statistics/utm/campaign";
const utmContentEndpoint = "/api/v1/statistics/utm/content";
const utmTermEndpoint = "/api/v1/statistics/utm/term";
const visitorsEndpoint = "/api/v1/statistics/visitor";
const pagesEndpoint = "/api/v1/statistics/page";
const conversionGoalsEndpoint = "/api/v1/statistics/goals";
const growthRateEndpoint = "/api/v1/statistics/growth";
const activeVisitorsEndpoint = "/api/v1/statistics/active";
const timeOfDayEndpoint = "/api/v1/statistics/hours";
const languageEndpoint = "/api/v1/statistics/language";
const referrerEndpoint = "/api/v1/statistics/referrer";
const osEndpoint = "/api/v1/statistics/os";
const browserEndpoint = "/api/v1/statistics/browser";
const countryEndpoint = "/api/v1/statistics/country";
const platformEndpoint = "/api/v1/statistics/platform";
const screenEndpoint = "/api/v1/statistics/screen";
const keywordsEndpoint = "/api/v1/statistics/keywords";
const referrerQueryParams = [
	"ref",
	"referer",
	"referrer",
    "source",
    "utm_source"
];

/**
 * Client is the Pirsch API client.
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
        if(!config.baseURL) {
            config.baseURL = defaultBaseURL;
        }

        if(!config.timeout) {
            config.timeout = defaultTimeout;
        }

        if(!config.protocol) {
            config.protocol = defaultProtocol;
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
     * Hit sends a hit to Pirsch. Make sure you call it in all request handlers you want to track.
     * Also, make sure to filter out unwanted pathnames (like /favicon.ico in your root handler for example).
     * 
     * @param hit all required data for the request.
     * @param retry retry the request in case a 401 (unauthenticated) error is returned. Don't modify this.
     * @returns an empty promise or an APIError, in case something went wrong
     */
    async hit(hit: Hit, retry: boolean = true): Promise<APIError | null> {
        try {
            if(hit.dnt === "1") {
                return Promise.resolve<null>(null);
            }

            await this.client.post(hitEndpoint, {
                hostname: this.hostname,
                ...hit,
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${this.accessToken}`
                }
            });
            return Promise.resolve<null>(null);
        } catch(e) {
            if(e.response.status === 401) {
                try {
                    await this.refreshToken();
                    return this.hit(hit, false);
                } catch(e) {
                    return e;
                }
            }

            return Promise.reject<APIError>(e.response.data);
        }
    }

    /**
     * hitFromRequest returns the required data to send a hit to Pirsch for a Node request object.
     * 
     * @param req the Node request object from the http package.
     * @returns a Hit object containing all necessary fields.
     */
    hitFromRequest(req: IncomingMessage): Hit {
        const url = new URL(req.url || "", `${this.protocol}://${this.hostname}`);
        return {
            url: url.toString(),
            ip: req.socket.remoteAddress || "",
            cf_connecting_ip: req.headers["cf-connecting-ip"] as string || "",
            x_forwarded_for: req.headers["x-forwarded-for"] as string || "",
            forwarded: req.headers["forwarded"] || "",
            x_real_ip: req.headers["x-real-ip"] as string || "",
            dnt: req.headers["dnt"] as string || "",
            user_agent: req.headers["user-agent"] || "",
            accept_language: req.headers["accept-language"] || "",
            referrer: Client.getReferrer(req, url)
        };
    }

    private async refreshToken(): Promise<APIError | null> {
        try {
            const resp = await this.client.post<AuthenticationResponse>(authenticationEndpoint, {
                client_id: this.clientID,
                client_secret: this.clientSecret,
            });
            this.accessToken = resp.data.access_token;
            return Promise.resolve<null>(null);
        } catch(e) {
            this.accessToken = "";
            return Promise.reject<APIError>(e.response.data);
        }
    }

    private static getReferrer(req: IncomingMessage, url: URL): string {
        let referrer = req.headers["referer"] || "";

        if(referrer === "") {
            for(let ref of referrerQueryParams) {
                const param = url.searchParams.get(ref);

                if(param && param !== "") {
                    return param;
                }
            }
        }

        return referrer;
    }
}
