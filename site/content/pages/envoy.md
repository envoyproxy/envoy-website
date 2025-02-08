---
title: Envoy Proxy
slug: envoy
template: project
id: envoy
feature_adopters: true
---

### What is Envoy?

Envoy is a high-performance C++ proxy designed for the cloud-native era with no-restart dynamic reload of configurations. It is highly extensible and can be used to build a wide variety of network architectures.

It is used as the core proxy component in API Gateways, Service Meshes, Cloud Load Balancers, and Edge Gateways.

Whether you know it or not, you are likely to have used Envoy Proxy if you have used a modern application.


### Why Envoy?

As on the ground microservice practitioners quickly realize, the majority of operational problems that arise when moving to a distributed architecture are ultimately grounded in two areas: networking and observability. It is simply an orders of magnitude larger problem to network and debug a set of intertwined distributed services versus a single monolithic application.

Originally built at **Lyft**, Envoy is a high performance C++ distributed proxy designed for single services and applications, as well as a communication bus and "universal data plane" designed for large microservice "service mesh" architectures.

Built on the learnings of solutions such as NGINX, HAProxy, hardware load balancers, and cloud load balancers, Envoy runs alongside every application and abstracts the network by providing common features in a platform-agnostic manner. When all service traffic in an infrastructure flows via an Envoy mesh, it becomes easy to visualize problem areas via consistent observability, tune overall performance, and add substrate features in a single place.
