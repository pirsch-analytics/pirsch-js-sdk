export interface ClientConfig {
    baseURL?: string
    timeout?: number
    clientID: string
    clientSecret: string
    hostname: string
    protocol?: string
}

export interface AuthenticationResponse {
    access_token: string
}

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

export interface APIError {
    validation: Validation
    error: string[]
}

export interface Validation {
    [key: string]: string
}
