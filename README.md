# Pirsch JavaScript SDK

<a href="https://www.npmjs.com/package/pirsch-sdk"><img src="https://img.shields.io/npm/v/pirsch-sdk.svg?sanitize=true" alt="Version"></a>
<a href="https://discord.gg/fAYm4Cz"><img src="https://img.shields.io/discord/739184135649886288?logo=discord" alt="Chat on Discord"></a>

This is the official JavaScript client SDK for Pirsch. For details, please check out our [documentation](https://docs.pirsch.io/).

## Usage

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
    clientSecret: "<client_secret>"
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

Here is how you can do the same in the browser:

```js
// Import the Pirsch client.
import { Pirsch } from "pirsch-sdk/web";

// Create a client with the identification code you have configured on the Pirsch dashboard.
const client = new Pirsch({
    identificationCode: "<identification_code>"
});

const main = async () => {
    await api.hit();

    await api.event("test-event", 60, { clicks: 1, test: "xyz" });
}

void main();
```

## Changelog

See [CHANGELOG.md](CHANGELOG.md).

## License

MIT
