export const PIRSCH_DEFAULT_BASE_URL = "https://api.pirsch.io" as const;
export const PIRSCH_DEFAULT_TIMEOUT = 5000 as const;
export const PIRSCH_DEFAULT_PROTOCOL = "https" as const;

export const PIRSCH_REFERRER_QUERY_PARAMETERS = ["ref", "referer", "referrer", "source", "utm_source"] as const;

export const PIRSCH_PROXY_HEADERS = ["cf-connecting-ip", "x-forwarded-for", "forwarded", "x-real-ip"] as const;

export const PIRSCH_ACCESS_TOKEN_PREFIX = "pa_" as const;

export const PIRSCH_CLIENT_ID_LENGTH = 32 as const;
export const PIRSCH_CLIENT_SECRET_LENGTH = 64 as const;
export const PIRSCH_ACCESS_TOKEN_LENGTH = 45 as const;
export const PIRSCH_IDENTIFICATION_CODE_LENGTH = 32 as const;

export const PIRSCH_URL_LENGTH_LIMIT = 1800 as const;

export enum PirschEndpoint {
    AUTHENTICATION = "token",
    HIT = "hit",
    HIT_BATCH = "hit/batch",
    EVENT = "event",
    EVENT_BATCH = "event/batch",
    SESSION = "session",
    SESSION_BATCH = "session/batch",
    DOMAIN = "domain",
    SESSION_DURATION = "statistics/duration/session",
    TIME_ON_PAGE = "statistics/duration/page",
    UTM_SOURCE = "statistics/utm/source",
    UTM_MEDIUM = "statistics/utm/medium",
    UTM_CAMPAIGN = "statistics/utm/campaign",
    UTM_CONTENT = "statistics/utm/content",
    UTM_TERM = "statistics/utm/term",
    TOTAL_VISITORS = "statistics/total",
    VISITORS = "statistics/visitor",
    PAGES = "statistics/page",
    ENTRY_PAGES = "statistics/page/entry",
    EXIT_PAGES = "statistics/page/exit",
    CONVERSION_GOALS = "statistics/goals",
    EVENTS = "statistics/events",
    EVENT_METADATA = "statistics/event/meta",
    LIST_EVENTS = "statistics/event/list",
    GROWTH_RATE = "statistics/growth",
    ACTIVE_VISITORS = "statistics/active",
    TIME_OF_DAY = "statistics/hours",
    LANGUAGE = "statistics/language",
    REFERRER = "statistics/referrer",
    OS = "statistics/os",
    OS_VERSION = "statistics/os/version",
    BROWSER = "statistics/browser",
    BROWSER_VERSION = "statistics/browser/version",
    COUNTRY = "statistics/country",
    CITY = "statistics/city",
    PLATFORM = "statistics/platform",
    SCREEN = "statistics/screen",
    KEYWORDS = "statistics/keywords",
}
