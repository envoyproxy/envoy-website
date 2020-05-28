---
layout: learn
title: Learn Envoy
---

Distributed systems are hard, but upgrading your networking with Envoy doesn’t have to be. Read on for common best practices of successful, production-grade Envoy deployments, drawn from the experience of engineers from the largest cloud-native applications on the planet.

## Getting Started

You can get Envoy set up on your laptop with a bootstrap config, then extend it as you need more functionality. Start seeing the benefits, and learn how to talk to the community when you get stuck. 

* [On Your Laptop](on-your-laptop) — Getting Envoy configured locally is a great way to start learning about all of its parts. A minimal setup is fast, especially with a few default configurations.
* [Routing Basic](routing-basics) — Send your first request through the proxy to a service running on your laptop, and learn how to connect more services to Envoy.
* [Getting Help](getting-help) — Stuck? Found an edge-case issue? Here's where to go to get answers, and the information you’ll need to dig into any issue.

## Dynamic Configuration

Envoy's powerful configuration model is miles ahead of other open-source serving layers. Envoy uses pluggable, dynamic APIs instead of static files, allowing changes to your environment to be applied instantly, with no service interruption. You can get Envoy set up on your laptop with a bootstrap config, then extend it as you need more functionality. As your Envoy fleet grows, centralize configuration in a control plane that implements Envoy's xDS APIs. 

* [Service Discovery Integration](service-discovery) — No more hard-coding IP addresses and ports. [CDS](https://www.envoyproxy.io/docs/envoy/latest/configuration/upstream/cluster_manager/cds) and [EDS](https://www.envoyproxy.io/docs/envoy/latest/api-v2/api/v2/eds.proto) let you integrate with your service registry to automatically populate which hosts are available for each services
* [Routing Configuration](routing-configuration) — [RDS](https://www.envoyproxy.io/docs/envoy/latest/configuration/http/http_conn_man/rds) lets you move routing configuration out of static configs and into a type-safe API, making typos and merge conflicts a thing of the past.
* [Securing with SSL](ssl) — Configure Envoy to terminate [SSL or TLS](https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/security/ssl) when used as a public-facing proxy.

## Observability

Once Envoy is emitting the right data, what do you do with it?

* **Log Parsing** — Envoy’s logs contain a lot of data that you can’t get from the auto-generated summaries. Decide what’s useful to you, configure [LDS](https://www.envoyproxy.io/docs/envoy/latest/configuration/listeners/lds) to emit these logs, parse them and forward them to an appropriate consumer.
* **Metrics Aggregation** — Information on one Envoy is great, but information about your entire environment is better. Use the Envoy primitives to aggregate information about clusters/services, domains/routes, and servers/nodes.
* **Change Logging** — Unlike traditional serving layers, Envoy’s behavior can change without human intervention. Use the admin interface to inspect the current state of an Envoy instance, including backend health and other runtime metrics.

## Deployment Models

Envoy’s small footprint allows for a variety of models. Most companies end up running multiple models to support: 

* [Front Proxy](front-proxy) — How do you get traffic into your service from the internet? Envoy can take care of terminating SSL, translating traffic from HTTP1.1 to HTTP/2, and more.
* [Service Mesh](service-mesh) — By co-locating Envoy with your code, you can let Envoy handle the complexities of the network. This makes service-to-service communication safer and more reliable, while alleviating the need to re-implement this functionality within each service.
* **Hosted Where You Are** — Use your existing deployment and production tooling to get Envoy on your infrastructure. There’s no need to reinvent the wheel to put Envoy in place as a front proxy or sidecar.

## Resilience

No two distributed systems are alike, and this only gets more true as systems get larger. Here’s how teams have approached the particularly thorny problem of managing dozens or hundreds of services at scale. Use their experience to solve your issues quickly. 

* [Circuit Breaking](circuit-breaking) — Fail quickly and apply back pressure downstream for your connections. Start with 1,000% of your max expected load on most services.
* [Automatic Retries](automatic-retries) — Finely-tune retries to ensure that hiccups don't lead to downtime, without making things worse when backends are unhealthy.
* [Health Checks](health-check) — Identify unhealthy hosts within services and automatically remove them from the load balancing rotation until they become healthy again.
* [Backpressure](backpressure) — A comprehensive list of ways Envoy can send an unsuccessful response to the downstream client, based on a failure within Envoy or from upstream.

## Building On Envoy

Tools are good. Solutions are better. The best companies use Envoy’s capabilities to democratize capabilities that normally require arcane knowledge and deep expertise. Be careful: once you’ve tried some of these workflows, you may not be able to go back. 

* [Incremental Blue/Green Deploys](incremental-deploys) — Separate deploy from release. First, deploy new versions without taking traffic. Then, shift 1% of traffic over to the new version and check the metrics. If everything looks good, try 10%, 50%, 100%. It takes all of the stress out of releasing.
* **Verifying in Production** — Stop trying to run all 5,000 microservices on your laptop. You don’t have enough RAM. You’ll never have enough RAM.
* **Migrations** — Moving to Kubernetes? Going multi-cloud? Deconstructing your monolith? Run traffic to both versions simultaneously and capture metrics as you build.
