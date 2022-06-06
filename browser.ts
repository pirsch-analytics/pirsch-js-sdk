import { config } from "process";
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
    domains?: string[]
    excludePaths?: string[]
    dev?: boolean
    hitEndpoint?: string
    eventEndpoint?: string
    sessionEndpoint?: string
}

export interface EventMeta {
    [key: string]: string | number
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

    pirschConfig = config;
}

/**
 * TODO
 */
export function hit() {
    if(ignoreRequest()) {
        return;
    }

    sendHit();

    if(pirschConfig.domains) {
        for(let i = 0; i < pirschConfig.domains.length; i++) {
            sendHit(pirschConfig.domains[i]);
        }
    }
}

/**
 * TODO
 */
export function event(name: string, meta?: EventMeta, duration?: number) {
    if(ignoreRequest()) {
        return;
    }

    if(!meta) {
        meta = {};
    }

    if(!duration) {
        duration = 0;
    }

    sendEvent("", name, meta, duration);

    if(pirschConfig.domains) {
        for(let i = 0; i < pirschConfig.domains.length; i++) {
            sendEvent(pirschConfig.domains[i], name, meta, duration);
        }
    }
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

    try {
        if(pirschConfig.excludePaths) {
            for(let i = 0; i < pirschConfig.excludePaths.length; i++) {
                if (new RegExp(pirschConfig.excludePaths[i]).test(location.pathname)) {
                    return true;
                }
            }
        }
    } catch(e) {
        console.error(e);
    }

    return false;
}

function dntOrDisabled() {
    return navigator.doNotTrack === "1" || localStorage.getItem("disable_pirsch");
}

function sendHit(hostname?: string) {
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

function sendEvent(hostname: string, name: string, meta: EventMeta, duration: number) {
    if(!name) {
        console.error("The event name must not be empty.");
        return;
    }

    if(!hostname) {
        hostname = location.href;
    } else {
        hostname = location.href.replace(location.hostname, hostname);
    }

    for(let key in meta) {
        if(meta.hasOwnProperty(key)) {
            meta[key] = String(meta[key]);
        }
    }

    const req = new XMLHttpRequest();
    req.open("POST", pirschConfig.eventEndpoint || eventEndpoint);
    req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    /*req.onload = () => {
        if(req.status >= 200 && req.status < 300) {
            resolve(req.response);
        } else {
            reject(req.statusText);
        }
    };
    req.onerror = () => reject(req.statusText);*/
    req.send(JSON.stringify({
        identification_code: pirschConfig.identificationCode,
        url: hostname.substring(0, 1800),
        title: document.title,
        referrer: document.referrer,
        screen_width: screen.width,
        screen_height: screen.height,
        event_name: name,
        event_duration: duration,
        event_meta: meta
    }));
}

function sendSession() {
    // TODO
}
