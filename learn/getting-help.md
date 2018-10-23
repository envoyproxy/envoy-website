---
layout: learn
title: Getting Help
description: >
  Trying to debug Envoy and need more information? Learn how to get more
  data out of Envoy and the best places to ask for help!
---

## How to Get More Information

To enable debug logging for Envoy, send the following request to
the admin interface, which is included in the bootstrap, or
configured separately in the case of a custom xDS configuration.

`GET /logging`

You can also pass these flags to the Envoy binary:

```console
-l <string>, --log-level <string> --log-path <path string>
```

It will set both the log level, and the path in which your logs
are stored.

## How to Get Help

The Envoy community is active, and lives on Github, as well as
several mailing lists, and a Slack team. Find out more by
visiting
[the contact section](https://github.com/envoyproxy/envoy#contact)

When talking to other users and maintainers on Slack, be sure to
clearly identify your issues, the steps you've attempted to
remedy each one, and provide any pertinent logs. As a very
developer-friendly environment, help abounds. The other users
you will encounter are at a variety of experience levels with
Envoy, but everyone wants to collaborate to make Envoy better.
Have fun with it.
