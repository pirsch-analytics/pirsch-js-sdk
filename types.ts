/**
 * ClientConfig contains the configuration parameters for the Client.
 */
export interface ClientConfig {
    baseURL?: string
    timeout?: number
    clientID: string
    clientSecret: string
    hostname: string
    protocol?: string
}

/**
 * AuthenticationResponse is the authentication response for the API and returns the access token.
 */
export interface AuthenticationResponse {
    access_token: string
}

/**
 * Hit contains all required fields to send a hit to Pirsch. The URL, IP, and User-Agent are mandatory,
 * all other fields can be left empty, but it's highly recommended to send all fields to generate reliable data.
 * The fields can be set from the request headers.
 */
export interface Hit {
    url: string
    ip: string
    cf_connecting_ip: string
    x_forwarded_for: string
    forwarded: string
    x_real_ip: string
    user_agent: string
    accept_language: string
    referrer: string
}

/**
 * APIError represents an error returned from the API.
 */
export interface APIError {
    validation: Validation
    error: string[]
}

/**
 * Validation is a validation error string for a specific field.
 */
export interface Validation {
    [key: string]: string
}
