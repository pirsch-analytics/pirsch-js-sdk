import { defaultBaseURL, defaultTimeout } from "./Client";

const hitEndpoint = "https://api.pirsch.io/hit";
const eventEndpoint = "https://api.pirsch.io/event";
const sessionEndpoint = "https://api.pirsch.io/session";

let pirschConfig: Config;

/**
 * Config is the configuration used to initialize Pirsch in the browser.
 */
export interface Config {
    identificationCode: string
    domain?: string
    dev?: boolean
    hitEndpoint?: string
    eventEndpoint?: string
    sessionEndpoint?: string
}

/**
 * init initializes Pirsch.
 * The identification must be set. Call this function when initializing your app or at the beginning of your script.
 * 
 * @param config the configration to use
 */
export function init(config: Config) {
    if(!config.dev && (/^localhost(.*)$|^127(\.[0-9]{1,3}){3}$/is.test(location.hostname) || location.protocol === "file:")) {
        console.warn("Pirsch ignores hits on localhost. You can enable it by setting dev to true.");
        return;
    }

    if(!config.identificationCode) {
        console.error("Error initializing Pirsch: the identification code must be set.");
        return;
    }

    if(!config.hitEndpoint) {
        config.hitEndpoint = hitEndpoint;
    }

    if(!config.eventEndpoint) {
        config.eventEndpoint = eventEndpoint;
    }

    if(!config.sessionEndpoint) {
        config.sessionEndpoint = sessionEndpoint;
    }

    // TODO set exclude paths
    // TODO additional domains

    pirschConfig = config;
}

/**
 * TODO
 */
export async function hit() {
    if(ignoreRequest()) {
        return;
    }

    // TODO iterate domains
    sendHit("");
}

/**
 * TODO
 */
export function event() {
    if(ignoreRequest()) {
        return;
    }

    // TODO
}

/**
 * TODO
 */
 export function session() {
    if(ignoreRequest()) {
        return;
    }

    // TODO
}

function ignoreRequest() {
    if(pirschConfig.identificationCode === "") {
        console.warn("Pirsch identification code not set.");
        return true;
    }

    if(dntOrDisabled()) {
        return true;
    }

    return false;
}

function dntOrDisabled() {
    return navigator.doNotTrack === "1" || localStorage.getItem("disable_pirsch");
}

function sendHit(hostname: string) {
    if(!hostname) {
        hostname = location.href;
    } else {
        hostname = location.href.replace(location.hostname, hostname);
    }

    const url = pirschConfig.hitEndpoint+
        "?nc="+new Date().getTime()+
        "&code="+pirschConfig.identificationCode+
        "&url="+encodeURIComponent(hostname.substring(0, 1800))+
        "&t="+encodeURIComponent(document.title)+
        "&ref="+encodeURIComponent(document.referrer)+
        "&w="+screen.width+
        "&h="+screen.height;
    const req = new XMLHttpRequest();
    req.open("GET", url);
    req.send();
}
