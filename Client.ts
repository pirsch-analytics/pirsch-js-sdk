import axios, { AxiosInstance } from "axios";
import { ClientConfig, AuthenticationResponse, APIError, Hit } from "./types";

const defaultBaseURL = "https://api.pirsch.io";
const defaultTimeout = 5000;
const authenticationEndpoint = "/api/v1/token";
const hitEndpoint = "/api/v1/hit";

export class Client {
    private clientID: string;
    private clientSecret: string;
    private hostname: string;
    private client: AxiosInstance;
    private accessToken: string = "";

    constructor(config: ClientConfig) {
        if(!config.baseURL) {
            config.baseURL = defaultBaseURL;
        }

        if(!config.timeout) {
            config.timeout = defaultTimeout;
        }

        this.clientID = config.clientID;
        this.clientSecret = config.clientSecret;
        this.hostname = config.hostname;
        this.client = axios.create({
            baseURL: config.baseURL,
            timeout: config.timeout,
        });
    }

    async hit(hit: Hit): Promise<APIError | null> {
        try {
            this.client.post(hitEndpoint, {
                hostname: this.hostname,
                ...hit,
            });
            return Promise.resolve<null>(null);
        } catch(e) {
            return Promise.reject<APIError>(e.response.data);
        }
    }

    private async refreshToken() {
        const resp = await this.client.post<AuthenticationResponse>(authenticationEndpoint, {
            client_id: this.clientID,
            client_secret: this.clientSecret,
        });
        this.accessToken = resp.data.access_token;
    }
}
