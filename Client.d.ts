import { ClientConfig, APIError, Hit } from "./types";
export declare class Client {
    private clientID;
    private clientSecret;
    private hostname;
    private client;
    private accessToken;
    constructor(config: ClientConfig);
    hit(hit: Hit): Promise<APIError | null>;
    private refreshToken;
}
