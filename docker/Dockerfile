FROM envoyproxy/envoy-build:devtools-v0.2.3@sha256:7cbfd3c61439d510f5e21fcca6b08fcd6616b1d13ebd85d7550ecf4bfd8e3d23 AS build


FROM build AS live
RUN apt-get update -qq \
    && apt-get -qq install -y --no-install-recommends inotify-tools \
    && rm -rf /var/lib/apt/lists/*


FROM build AS update
