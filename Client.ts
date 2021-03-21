import axios, { AxiosInstance } from "axios";

const defaultBaseURL = "https://api.pirsch.io";
const defaultTimeout = 5000;
const authenticationEndpoint = "/api/v1/token";
const hitEndpoint = "/api/v1/hit";

export interface ClientConfig {
    baseURL?: string
    timeout?: number
    clientID: string
    clientSecret: string
    hostname: string
}

export class Client {
    private clientID: string;
    private clientSecret: string;
    private hostname: string;
    private client: AxiosInstance;

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
}
