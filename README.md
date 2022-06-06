# Pirsch JavaScript SDK

<a href="https://www.npmjs.com/package/pirsch-sdk"><img src="https://img.shields.io/npm/v/pirsch-sdk.svg?sanitize=true" alt="Version"></a>
<a href="https://discord.gg/fAYm4Cz"><img src="https://img.shields.io/discord/739184135649886288?logo=discord" alt="Chat on Discord"></a>

This is the official JavaScript client SDK for Pirsch. For details, please check out our [documentation](https://docs.pirsch.io/).

The SDK can be used in the browser or server-side using NodeJS. Please see the demos below.

## Using the SDK in the Browser

*WIP*

## Using the SDK with Node

Here is a quick demo on how to use this library in NodeJS:

```js
var http = require("http");
var { URL } = require("url");

// Import the Pirsch client.
var { Client } = require("pirsch-sdk");

// Create a client with the hostname, client ID, and client secret you have configured on the Pirsch dashboard.
var client = new Client({
    hostname: "example.com",
    protocol: "https", // used to parse the request URL, default is http
    clientID: "<client_id>",
    clientSecret: "<client_secret>"
});

// Create your http handler and start the server.
http.createServer((req, res) => {
    // In this example, we only want to track the / path and nothing else.
    // We parse the request URL to read and check the pathname.
    const url = new URL(req.url || "", "http://localhost:8765");

    if(url.pathname === "/") {
        // Send the hit to Pirsch. hitFromRequest is a helper function that returns all required information from the request.
        // You can also built the Hit object on your own and pass it in.
        client.hit(client.hitFromRequest(req)).catch(e => {
            // Something went wrong, check the error output.
            console.log(e);
        });
    }

    // Render your website...
    res.write("Hello from Pirsch!");
    res.end();
}).listen(8765);
```

## Changelog

See [CHANGELOG.md](CHANGELOG.md).

## License

MIT
