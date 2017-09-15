---
layout: page
title: Download
---

The easiest way to get started with Envoy is by using the pre-built Docker images. Envoy is designed to be highly configurable, with APIs for dynamic configuration and a [JSON configuration format for static configuration](https://envoyproxy.github.io/envoy/configuration/configuration.html).

To get it working, you're going to need to create your own Docker image with your own Envoy configuration. Create a `Dockerfile` that uses the latest Envoy images:

```
FROM lyft/envoy:latest
RUN apt-get update
COPY envoy.json /etc/envoy.json
CMD /usr/local/bin/envoy -c /etc/envoy.json
```

Create an `envoy.json` configuration file. [Here is a simple, non-production](https://github.com/envoyproxy/envoy/blob/master/configs/google_com_proxy.json) example you can use that proxies incoming requests to Google.com. Note you may have to modify the listener to listen to `0.0.0.0` instead of `127.0.0.1` for this to work locally.

Build the Dockerfile:

```
docker build -t envoy:v1 .
```

Run the image, binding localhost port 8080 to the listener on port 10000 specified in the `envoy.json`:

```
docker run -d -p 8080:10000 envoy:v1
```

Test the image with `curl`:

```
curl localhost:8080
```

Congratulations! You should receive a bunch of HTML from Google.com, proxied via Envoy.

## Next steps

* Read the [Envoy documentation](https://envoyproxy.github.io/envoy/index.html)
