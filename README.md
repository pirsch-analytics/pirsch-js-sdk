# Pirsch JavaScript SDK

<a href="https://www.npmjs.com/package/pirsch-sdk"><img src="https://img.shields.io/npm/v/pirsch-sdk.svg?sanitize=true" alt="Version"></a>

This is the official JavaScript client SDK for Pirsch. For details, please check out our [documentation](https://docs.pirsch.io/).

## Installation

```
npm i pirsch-sdk
```

## Usage

### Configuration

The SDK is configured using the constructor. We recommend using an access key instead of a client ID + secret if you only need write access (sending page views and events), as it saves a roundtrip to the server when refreshing the access token.

If you run your server-side integration behind a proxy or load balancer, make sure you correctly configure `trustedProxyHeaders`. They will be used to extract the real visitor IP for each request. They will be used in the order they are passed into the configuration. Possible values are: `"cf-connecting-ip", "x-forwarded-for", "forwarded", "x-real-ip"`.

### Server-Side

Here is a quick demo on how to use this library in NodeJS:

```js
import { createServer } from "node:http";
import { URL } from "node:url";

// Import the Pirsch client.
import { Pirsch } from "pirsch-sdk";

// Create a client with the hostname, client ID, and client secret you have configured on the Pirsch dashboard.
const client = new Pirsch({
    hostname: "example.com",
    protocol: "http", // used to parse the request URL, default is https
    clientId: "<client_id>",
    clientSecret: "<client_secret or access_key>"
});

// Create your http handler and start the server.
createServer((request, response) => {
    // In this example, we only want to track the / path and nothing else.
    // We parse the request URL to read and check the pathname.
    const url = new URL(request.url || "", "http://localhost:8765");

    if (url.pathname === "/") {
        // Send the hit to Pirsch. hitFromRequest is a helper function that returns all required information from the request.
        // You can also built the Hit object on your own and pass it in.
        client.hit(client.hitFromRequest(request)).catch(error => {
            // Something went wrong, check the error output.
            console.error(error);
        });
    }

    // Render your website...
    response.write("Hello from Pirsch!");
    response.end();
}).listen(8765);
```

### Client-Side

Here is how you can do the same in the browser:

```js
// Import the Pirsch client.
import { Pirsch } from "pirsch-sdk/web";

// Create a client with the identification code you have configured on the Pirsch dashboard.
const client = new Pirsch({
    identificationCode: "<identification_code>"
});

const main = async () => {
    await client.hit();

    await client.event("test-event", 60, { clicks: 1, test: "xyz" });
}

void main();
```

#### Tracking Outbound Links and Downloads

The Pirsch snippet will, by default, connect event handlers to outbound and download links. To recreate this behavior:

```js
import { Pirsch } from "pirsch-sdk/web";

const client = new Pirsch({ identificationCode: "<identification_code>" });

const OUTBOUND_LINK_EVENT = "Outbound Link Click";
const FILE_DOWNLOAD_EVENT = "File Download";
const DOWNLOAD_EXTENSIONS = [
  "7z", "avi", "csv", "docx", "exe", "gz", "key", "midi", "mov",
  "mp3", "mp4", "mpeg", "pdf", "pkg", "pps", "ppt", "pptx", "rar",
  "rtf", "txt", "wav", "wma", "wmv", "xlsx", "zip"
];

function trackLinks(container = document) {
  for (const link of container.getElementsByTagName("a")) {
    if (link.classList.contains("pirsch-ignore")) continue;

    const ext = link.href.split(".").pop().toLowerCase();
    const isDownload = DOWNLOAD_EXTENSIONS.includes(ext);

    let track;
    if (isDownload) {
      const file = new URL(link.href).pathname;
      track = () => client.event(FILE_DOWNLOAD_EVENT, 0, { file });
    } else {
      try {
        const url = new URL(link.href);
        if (url.hostname === location.hostname) continue;
        track = () => client.event(OUTBOUND_LINK_EVENT, 0, { url: link.href });
      } catch {
        // Skip invalid URLs (javascript:, mailto:, tel:, etc.)
        continue;
      }
    }

    link.addEventListener("click", track);
    link.addEventListener("auxclick", track);
  }
}

// Call after your content has rendered
trackLinks();

// Or scope to a specific container
trackLinks(document.getElementById("content"));
```

#### Tracking Page Views in SPAs

The snippet automatically tracks page views via the History API. To replicate this:

```js
// Using client from above
const originalPushState = history.pushState;
history.pushState = function(state, title, url) {
  originalPushState.apply(this, [state, title, url]);
  client.hit();
};
window.addEventListener("popstate", () => client.hit());
```

## FAQ

> This module export three Clients (`pirsch-sdk`, `pirsch-sdk/web-api` and `pirsch-sdk/web`), what are the differences?

 - `pirsch-sdk` and `pirsch-sdk/web-api` are based on the same core logic, and function the same. It can be used to access and sending data via the API. `pirsch-sdk/web-api` is a version of the Node client that works in the web. You will rarely need to use this version though.
 - `pirsch-sdk/web` is a modular version of the JS Snippet, that has no automatic functionality. You need to send any hits or events yourself.

> :information_source: Basically your choice will be between `pirsch-sdk` (Node, backend, accessing or sending data) or `pirsch-sdk/web`, (Browser, frontend, sending data) in 99% of the cases.

## Changelog

See [CHANGELOG.md](CHANGELOG.md).

## License

MIT
