import { PIRSCH_PROXY_HEADERS } from "./constants";

/**
 * PirschClientConfigBase contains the base configuration parameters for the Client.
 */
export interface PirschClientConfigBase {
    /**
     * The base URL for the pirsch API
     *
     * @default 'https://api.pirsch.io'
     */
    baseUrl?: string;
    /**
     * The default HTTP timeout in milliseconds
     *
     * @default 5000
     */
    timeout?: number;
}

/**
 * PirschOAuthClientConfig contains the configuration parameters for the Client.
 */
export interface PirschOAuthClientConfig extends PirschClientConfigBase {
    /**
     * The OAuth client ID
     */
    clientId?: string;
    /**
     * The OAuth client secret
     */
    clientSecret: string;
}

/**
 * PirschTokenClientConfig contains the configuration parameters for the Client.
 */
export interface PirschTokenClientConfig extends PirschClientConfigBase {
    /**
     * The secret access token
     */
    accessToken: string;
}

/**
 * IdentificationCode contains the configuration parameters for the Client.
 */
export interface PirschIdentificationCodeClientConfig extends PirschClientConfigBase {
    /**
     * The public identification code
     */
    identificationCode: string;
    /**
     * The hostname of the domain to track
     */
    hostname?: string;
}

export interface PirschNodeClientConfigBase {
    /**
     * The hostname of the domain to track
     */
    hostname: string;
    /**
     * The default HTTP protocol to use for tracking
     *
     * @default 'https'
     */
    protocol?: Protocol;
    /**
     * The proxy headers to trust
     *
     * @default undefined
     */
    trustedProxyHeaders?: PirschProxyHeader[];
}

export type PirschClientConfig = PirschOAuthClientConfig | PirschTokenClientConfig;
export type PirschNodeClientConfig =
    | (PirschOAuthClientConfig & PirschNodeClientConfigBase)
    | (PirschTokenClientConfig & PirschNodeClientConfigBase);

/**
 * PirschAuthenticationResponse is the authentication response for the API and returns the access token.
 */
export interface PirschAuthenticationResponse {
    access_token: string;
}

/**
 * PirschHit contains all required fields to send a hit to Pirsch. The URL, IP, and User-Agent are mandatory,
 * all other fields can be left empty, but it's highly recommended to send all fields to generate reliable data.
 * The fields can be set from the request headers.
 */
export interface PirschHit {
    url: string;
    ip: string;
    user_agent: string;
    accept_language?: string;
    sec_ch_ua?: string;
	sec_ch_ua_mobile?: string;
	sec_ch_ua_platform?: string;
	sec_ch_ua_platform_version?: string;
	sec_ch_width?: string;
    sec_ch_viewport_width?: string;
    title?: string;
    referrer?: string;
    screen_width?: number;
    screen_height?: number;
    tags?: Record<string, Scalar>;
}

/**
 * PirschBatchHit contains all required fields to send batched hits to Pirsch. The URL, IP, and User-Agent are mandatory,
 * all other fields can be left empty, but it's highly recommended to send all fields to generate reliable data.
 * The fields can be set from the request headers.
 */
export interface PirschBatchHit extends PirschHit {
    time: string;
}

/**
 * PirschEvent contains all required fields to send a event to Pirsch. The Name, URL, IP, and User-Agent are mandatory,
 * all other fields can be left empty, but it's highly recommended to send all fields to generate reliable data.
 * The fields can be set from the request headers.
 */
export interface PirschEvent extends PirschHit {
    event_name: string;
    event_duration?: number;
    event_meta?: Record<string, Scalar>;
}

/**
 * PirschBatchEvent contains all required fields to send batched events to Pirsch. The Name, URL, IP, and User-Agent are mandatory,
 * all other fields can be left empty, but it's highly recommended to send all fields to generate reliable data.
 * The fields can be set from the request headers.
 */
export interface PirschBatchEvent extends PirschEvent {
    time: string;
}

/**
 * PirschSession contains all required fields to send a session to Pirsch. The IP and User-Agent are mandatory,
 * all other fields can be left empty, but it's highly recommended to send all fields to generate reliable data.
 * The fields can be set from the request headers.
 */
export type PirschSession = Pick<PirschEvent, "ip" | "user_agent">;

/**
 * PirschBatchSession contains all required fields to send batched sessions to Pirsch. The IP and User-Agent are mandatory,
 * all other fields can be left empty, but it's highly recommended to send all fields to generate reliable data.
 * The fields can be set from the request headers.
 */
export interface PirschBatchSession extends PirschSession {
    time: string;
}

/**
 * PirschBrowserHit contains all required fields to send a browser hit to Pirsch. The URL and User-Agent are mandatory,
 * all other fields can be left empty, but it's highly recommended to send all fields to generate reliable data.
 * The fields can be set from the request headers.
 */
export interface PirschBrowserHit {
    url: string;
    title?: string;
    accept_language?: string;
    referrer?: string;
    screen_width?: number;
    screen_height?: number;
    tags?: Record<string, Scalar>;
}

/**
 * PirschApiErrorResponse represents an error returned from the API.
 */
export interface PirschApiErrorResponse {
    validation?: PirschValidation;
    error: string[];
}

/**
 * PirschValidation is a validation error string for a specific field.
 */
export type PirschValidation = Record<string, string>;

/**
 * PirschScale sets the time period over which data is aggregated by.
 */
export type PirschScale = "day" | "week" | "month" | "year";

/**
 * CustomMetricType sets the custom metric aggregation type.
 */
export type PirschCustomMetricType = "integer" | "float";

/**
 * PirschSortDirection is used to sort results.
 */
export type PirschSortDirection = "asc" | "desc";

/**
 * PirschFilter is used to filter statistics.
 * DomainID, From, and To are required dates (the time is ignored).
 */
export interface PirschFilter {
    id: string;
    from: Date;
    to: Date;
    start?: number;
    scale?: PirschScale;
    tz?: string;
    path?: string;
    pattern?: string;
    entry_path?: string;
    exit_path?: string;
    event?: string;
    event_meta_key?: string;
    event_meta?: Record<string, Scalar>;
    language?: string;
    country?: string;
    region?: string;
    city?: string;
    referrer?: string;
    referrer_name?: string;
    os?: string;
    browser?: string;
    platform?: string;
    screen_class?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_content?: string;
    utm_term?: string;
    tag?: string;
	tags?: Record<string, Scalar>;
    custom_metric_key?: string;
	custom_metric_type?: PirschCustomMetricType;
    search?: string;
    offset?: number;
    limit?: number;
    sort?: string;
    direction?: PirschSortDirection;
    include_avg_time_on_page?: boolean;
}

/**
 * PirschBaseEntity contains the base data for all entities.
 */
export interface PirschBaseEntity {
    id: string;
    def_time: Date;
    mod_time: Date;
}

/**
 * PirschDomain is a domain on the dashboard.
 */
export interface PirschDomain extends PirschBaseEntity {
    user_id: string;
    organization_id: string;
    hostname: string;
    subdomain: string;
    identification_code: string;
    public: boolean;
    google_user_id?: string;
    google_user_email?: string;
    gsc_domain?: string;
    new_owner?: number;
    timezone?: string;
	group_by_title: boolean;
	active_visitors_seconds?: number;
	disable_scripts: boolean;
	statistics_start?: Date;
	imported_statistics: boolean;
	theme_id: string;
	theme: Object;
	custom_domain?: string;
    display_name?: string;
	user_role: string;
	settings: Object;
	theme_settings: Object;
    pinned: boolean;
    subscription_active: boolean;
}

/**
 * PirschTimeSpentStats is the time spent on the website or specific pages.
 */
export interface PirschTimeSpentStats {
    day?: Date;
    week?: Date;
    month?: Date;
    year?: Date;
    path: string;
    title: string;
    average_time_spent_seconds: number;
}

/**
 * PirschMetaStats is the base for meta result types (languages, countries, ...).
 */
export interface PirschMetaStats {
    visitors: number;
    relative_visitors: number;
}

/**
 * PirschUTMSourceStats is the result export interface for utm source statistics.
 */
export interface PirschUTMSourceStats extends PirschMetaStats {
    utm_source: string;
}

/**
 * PirschUTMMediumStats is the result export interface for utm medium statistics.
 */
export interface PirschUTMMediumStats extends PirschMetaStats {
    utm_medium: string;
}

/**
 * PirschUTMCampaignStats is the result export interface for utm campaign statistics.
 */
export interface PirschUTMCampaignStats extends PirschMetaStats {
    utm_campaign: string;
}

/**
 * PirschUTMContentStats is the result export interface for utm content statistics.
 */
export interface PirschUTMContentStats extends PirschMetaStats {
    utm_content: string;
}

/**
 * PirschUTMTermStats is the result export interface for utm term statistics.
 */
export interface PirschUTMTermStats extends PirschMetaStats {
    utm_term: string;
}

/**
 * PirschTotalVisitorStats is the result export interface for total visitor statistics.
 */
export interface PirschTotalVisitorStats {
    visitors: number;
    views: number;
    sessions: number;
    bounces: number;
    bounce_rate: number;
    cr: number;
	custom_metric_avg: number;
	custom_metric_total: number;
}

/**
 * PirschVisitorStats is the result export interface for visitor statistics.
 */
export interface PirschVisitorStats {
    day?: Date;
    week?: Date;
    month?: Date;
    year?: Date;
    visitors: number;
    views: number;
    sessions: number;
    bounces: number;
    bounce_rate: number;
    cr: number;
	custom_metric_avg: number;
	custom_metric_total: number;
}

/**
 * PirschPageStats is the result export interface for page statistics.
 */
export interface PirschPageStats {
    path: string;
    title: string;
    visitors: number;
    views: number;
    sessions: number;
    bounces: number;
    relative_visitors: number;
    relative_views: number;
    bounce_rate: number;
    average_time_spent_seconds: number;
}

/*
 * PirschEntryStats is the result type for entry page statistics.
 */
export interface PirschEntryStats {
    path: string;
    title: string;
    visitors: number;
    sessions: number;
    entries: number;
    entry_rate: number;
    average_time_spent_seconds: number;
}

/*
 * PirschExitStats is the result type for exit page statistics.
 */
export interface PirschExitStats {
    exit_path: string;
    title: string;
    visitors: number;
    sessions: number;
    exits: number;
    exit_rate: number;
}

/**
 * PirschConversionGoal is a conversion goal as configured on the dashboard.
 */
export interface PirschConversionGoal extends PirschBaseEntity {
    domain_id: string;
    name: string;
    path_pattern: string;
    pattern: string;
    visitor_goal?: number;
    cr_goal?: number;
    delete_reached: boolean;
    email_reached: boolean;
}

// PirschEventStats is the result type for custom events.
export interface PirschEventStats {
    name: string;
    visitors: number;
    views: number;
    cr: number;
    average_duration_seconds: number;
    meta_keys: string[];
    meta_value: string;
}

// PirschEventListStats is the result type for a custom event list.
export interface PirschEventListStats {
    name: string;
    meta: Record<string, string>;
    visitors: number;
    count: number;
}

/**
 * PirschPageConversionsStats is the result export interface for page conversions.
 */
export interface PirschPageConversionsStats {
    visitors: number;
    views: number;
    cr: number;
}

/**
 * PirschConversionGoalStats are the statistics for a conversion goal.
 */
export interface PirschConversionGoalStats {
    page_goal: PirschConversionGoal;
    stats: PirschPageConversionsStats;
}

/**
 * PirschGrowth represents the visitors, views, sessions, bounces, and average session duration growth between two time periods.
 */
export interface PirschGrowth {
    visitors_growth: number;
    views_growth: number;
    sessions_growth: number;
    bounces_growth: number;
    time_spent_growth: number;
    cr_growth: number;
	custom_metric_avg_growth: number;
	custom_metric_total_growth: number;
}

/**
 * PirschActiveVisitorStats is the result export interface for active visitor statistics.
 */
export interface PirschActiveVisitorStats {
    path: string;
    title: string;
    visitors: number;
}

/**
 * PirschActiveVisitorsData contains the active visitors data.
 */
export interface PirschActiveVisitorsData {
    stats: PirschActiveVisitorStats[];
    visitors: number;
}

/**
 * PirschVisitorHourStats is the result export interface for visitor statistics grouped by time of day.
 */
export interface PirschVisitorHourStats {
    hour: number;
    visitors: number;
    views: number;
    sessions: number;
    bounces: number;
    bounce_rate: number;
    cr: number;
	custom_metric_avg: number;
	custom_metric_total: number;
}

/**
 * PirschLanguageStats is the result export interface for language statistics.
 */
export interface PirschLanguageStats extends PirschMetaStats {
    language: string;
}

/**
 * PirschCountryStats is the result export interface for country statistics.
 */
export interface PirschCountryStats extends PirschMetaStats {
    country_code: string;
}

/*
 * PirschRegionStats is the result type for regional statistics.
 */
export interface PirschRegionStats extends PirschMetaStats {
    country_code: string;
    region: string;
}

/*
 * PirschCityStats is the result type for city statistics.
 */
export interface PirschCityStats extends PirschMetaStats {
    country_code: string;
    region: string;
    city: string;
}

/**
 * PirschBrowserStats is the result export interface for browser statistics.
 */
export interface PirschBrowserStats extends PirschMetaStats {
    browser: string;
}

// PirschBrowserVersionStats is the result type for browser version statistics.
export interface PirschBrowserVersionStats extends PirschMetaStats {
    browser: string;
    browser_version: string;
}

/**
 * PirschOSStats is the result export interface for operating system statistics.
 */
export interface PirschOSStats extends PirschMetaStats {
    os: string;
}

// PirschOSVersionStats is the result type for operating system version statistics.
export interface PirschOSVersionStats extends PirschMetaStats {
    os: string;
    os_version: string;
}

/**
 * PirschReferrerStats is the result export interface for referrer statistics.
 */
export interface PirschReferrerStats {
    referrer: string;
    referrer_name: string;
    referrer_icon: string;
    visitors: number;
    sessions: number;
    relative_visitors: number;
    bounces: number;
    bounce_rate: number;
}

/**
 * PirschPlatformStats is the result export interface for platform statistics.
 */
export interface PirschPlatformStats {
    platform_desktop: number;
    platform_mobile: number;
    platform_unknown: number;
    relative_platform_desktop: number;
    relative_platform_mobile: number;
    relative_platform_unknown: number;
}

/**
 * PirschScreenClassStats is the result export interface for screen class statistics.
 */
export interface PirschScreenClassStats extends PirschMetaStats {
    screen_class: string;
}

/**
 * TagStats is the result export interface for tag statistics.
 */
export interface TagStats {
	key: string;
	value: string;
	visitors: number;
	views: number;
	relative_visitors: number;
	relative_views: number;
}

/**
 * PirschKeyword is the result export interface for keyword statistics.
 */
export interface PirschKeyword {
    keys: string[];
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
}

/**
 * PirschHttpOptions type
 */
export interface PirschHttpOptions {
    headers?: Record<string, string>;
    parameters?: object;
}

/**
 * PirschProxyHeader type
 */
export type PirschProxyHeader = typeof PIRSCH_PROXY_HEADERS[number];

/**
 * PirschAccessMode type
 */
export type PirschAccessMode = "access-token" | "oauth";

/**
 * Protocol type
 */
export type Protocol = "http" | "https";

/**
 * Scalar type
 */
export type Scalar = string | number | boolean;

/**
 * Optional type
 */
export type Optional<T> = T | undefined;
