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
    dnt: string
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

/**
 * Filter is used to filter statistics.
 * DomainID, From, and To are required dates (the time is ignored).
 */
export interface Filter {
    id: string
    from: Date
    to: Date
    path?: string
    pattern?: string
    language?: string
    country?: string
    referrer?: string
    os?: string
    browser?: string
    platform?: string
    screen_class?: string
    utm_source?: string
    utm_medium?: string
    utm_campaign?: string
    utm_content?: string
    utm_term?: string
    limit?: number
    include_avg_time_on_page?: boolean
}

/**
 * BaseEntity contains the base data for all entities.
 */
export interface BaseEntity {
    id: string
    def_time: Date
    mod_time: Date
}

/**
 * Domain is a domain on the dashboard.
 */
export interface Domain extends BaseEntity {
    user_id: string
    hostname: string
    subdomain: string
    identification_code: string
    public: boolean
    google_user_id?: string
    google_user_email?: string
    gsc_domain?: string
    new_owner?: number
    timezone?: string
}

/**
 * TimeSpentStats is the time spent on the website or specific pages.
 */
export interface TimeSpentStats {
    day: Date
    path: string
    average_time_spent_seconds: number
}

/**
 * MetaStats is the base for meta result types (languages, countries, ...).
 */
export interface MetaStats {
    visitors: number
    relative_visitors: number
}

/**
 * UTMSourceStats is the result export interface for utm source statistics.
 */
export interface UTMSourceStats extends MetaStats {
    utm_source: string
}

/**
 * UTMMediumStats is the result export interface for utm medium statistics.
 */
export interface UTMMediumStats extends MetaStats {
    utm_medium: string
}

/**
 * UTMCampaignStats is the result export interface for utm campaign statistics.
 */
export interface UTMCampaignStats extends MetaStats {
    utm_campaign: string
}

/**
 * UTMContentStats is the result export interface for utm content statistics.
 */
export interface UTMContentStats extends MetaStats {
    utm_content: string
}

/**
 * UTMTermStats is the result export interface for utm term statistics.
 */
export interface UTMTermStats extends MetaStats {
    utm_term: string
}

/**
 * VisitorStats is the result export interface for visitor statistics.
 */
export interface VisitorStats {
    day: Date
    visitors: number
    views: number
    sessions: number
    bounces: number
    bounce_rate: number
}

/**
 * PageStats is the result export interface for page statistics.
 */
export interface PageStats {
    path: string
    visitors: number
    views: number
    sessions: number
    bounces: number
    relative_visitors: number
    relative_views: number
    bounce_rate: number
    average_time_spent_seconds: number
}

/**
 * ConversionGoal is a conversion goal as configured on the dashboard.
 */
export interface ConversionGoal extends BaseEntity {
    domain_id: string
    name: string
    path_pattern: string
    pattern: string
    visitor_goal?: number
    cr_goal?: number
    delete_reached: boolean
    email_reached: boolean
}

/**
 * PageConversionsStats is the result export interface for page conversions.
 */
export interface PageConversionsStats {
    visitors: number
    views: number
    cr: number
}

/**
 * ConversionGoalStats are the statistics for a conversion goal.
 */
export interface ConversionGoalStats {
    page_goal: ConversionGoal
    stats: PageConversionsStats
}

/**
 * Growth represents the visitors, views, sessions, bounces, and average session duration growth between two time periods.
 */
export interface Growth {
    visitors_growth: number
    views_growth: number
    sessions_growth: number
    bounces_growth: number
    time_spent_growth: number
}

/**
 * ActiveVisitorStats is the result export interface for active visitor statistics.
 */
export interface ActiveVisitorStats {
    path: string
    visitors: number
}

/**
 * ActiveVisitorsData contains the active visitors data.
 */
export interface ActiveVisitorsData {
    stats: ActiveVisitorStats[]
    visitors: number
}

/**
 * VisitorHourStats is the result export interface for visitor statistics grouped by time of day.
 */
export interface VisitorHourStats {
    hour: number
    visitors: number
}

/**
 * LanguageStats is the result export interface for language statistics.
 */
export interface LanguageStats extends MetaStats {
    language: string
}

/**
 * CountryStats is the result export interface for country statistics.
 */
export interface CountryStats extends MetaStats {
    country_code: string
}

/**
 * BrowserStats is the result export interface for browser statistics.
 */
export interface BrowserStats extends MetaStats {
    browser: string
}

/**
 * OSStats is the result export interface for operating system statistics.
 */
export interface OSStats extends MetaStats {
    os: string
}

/**
 * ReferrerStats is the result export interface for referrer statistics.
 */
export interface ReferrerStats {
    referrer: string
    referrer_name: string
    referrer_icon: string
    visitors: number
    relative_visitors: number
    bounces: number
    bounce_rate: number
}

/**
 * PlatformStats is the result export interface for platform statistics.
 */
export interface PlatformStats {
    platform_desktop: number
    platform_mobile: number
    platform_unknown: number
    relative_platform_desktop: number
    relative_platform_mobile: number
    relative_platform_unknown: number
}

/**
 * ScreenClassStats is the result export interface for screen class statistics.
 */
export interface ScreenClassStats extends MetaStats {
    screen_class: string
}

/**
 * Keyword is the result export interface for keyword statistics.
 */
export interface Keyword {
    keys: string[]
    clicks: number
    impressions: number
    ctr: number
    position: number
}
