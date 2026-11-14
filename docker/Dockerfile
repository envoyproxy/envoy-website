FROM envoyproxy/envoy-build:devtools-v0.2.5@sha256:5914ff8694b377cbd137317acb4a0f91c9496e08a17e867743f942e15f4deb83 AS build


FROM build AS live
RUN apt-get update -qq \
    && apt-get -qq install -y --no-install-recommends inotify-tools \
    && rm -rf /var/lib/apt/lists/*
