import { IncomingMessage } from "http";
import { URL } from "url";
import axios, { AxiosInstance } from "axios";
import { ClientConfig, AuthenticationResponse, APIError, Hit } from "./types";

const defaultBaseURL = "https://api.pirsch.io";
const defaultTimeout = 5000;
const defaultProtocol = "http";
const authenticationEndpoint = "/api/v1/token";
const hitEndpoint = "/api/v1/hit";
const referrerQueryParams = [
	"ref",
	"referer",
	"referrer",
];

export class Client {
    private clientID: string;
    private clientSecret: string;
    private hostname: string;
    private protocol: string;
    private client: AxiosInstance;
    private accessToken: string = "";

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

    async hit(hit: Hit, retry: boolean = true): Promise<APIError | null> {
        try {
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

    hitFromRequest(req: IncomingMessage): Hit {
        const url = new URL(req.url || "", `${this.protocol}://${this.hostname}`);
        return {
            url: url.toString(),
            ip: req.socket.remoteAddress || "",
            cf_connecting_ip: req.headers["cf-connecting-ip"] as string || "",
            x_forwarded_for: req.headers["x-forwarded-for"] as string || "",
            forwarded: req.headers["forwarded"] || "",
            x_real_ip: req.headers["x-real-ip"] as string || "",
            user_agent: req.headers["user-agent"] || "",
            accept_language: req.headers["accept-language"] || "",
            referrer: this.getReferrer(req, url)
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

    private getReferrer(req: IncomingMessage, url: URL): string {
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
