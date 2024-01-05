FROM ubuntu:22.04@sha256:6042500cf4b44023ea1894effe7890666b0c5c7871ed83a97c36c76ae560bb9b

ARG APT_PKGS="\
    apt-transport-https \
    curl \
    gnupg \
    language-pack-en-base \
    software-properties-common"
ARG APT_BUILD_PKGS="\
    autoconf \
    automake \
    bison \
    build-essential \
    gawk \
    git \
    gnupg2 \
    gosu \
    libffi-dev \
    libgdbm-dev \
    libgmp-dev \
    libncurses5-dev \
    libreadline-dev \
    libsqlite3-dev \
    libssl-dev \
    libtool \
    libyaml-dev \
    pkg-config \
    sqlite3 \
    zlib1g-dev"
ARG BAZELISK_VERSION=1.10.1

ENV LANGUAGE en_US:en
ENV LANG en_US.UTF-8
ENV LC_ALL en_US.UTF-8
ENV USER_ID=1000
ENV USER_HOME=/home/buildbazel
ENV DEFAULT_USER_NAME=buildbazel
ENV USER_NAME=$DEFAULT_USER_NAME

RUN export DEBIAN_FRONTEND=noninteractive \
    && apt-get update \
    && apt-get install -y -qq --no-install-recommends $APT_PKGS \
    && echo 'Acquire::Languages {"none";};' > /etc/apt/apt.conf.d/60language \
    && echo "LANG=\"${LANG}\"" > /etc/default/locale \
    && echo "LANGUAGE=\"${LANGUAGE}\"" >> /etc/default/locale \
    && locale-gen "$LANG" \
    && update-locale "$LANG" \
    # git version must be >= 2.26
    && add-apt-repository -y ppa:git-core/ppa \
    && apt-get update \
    && apt-get install -y -qq --no-install-recommends $APT_BUILD_PKGS \
    && curl -fsSL --output \
        /usr/local/bin/bazel \
        "https://github.com/bazelbuild/bazelisk/releases/download/v${BAZELISK_VERSION}/bazelisk-linux-$(dpkg --print-architecture)" \
    && chmod +x /usr/local/bin/bazel \
    && useradd --shell /bin/bash -u "$USER_ID" -o  -d "$USER_HOME" -c "" -m "$USER_NAME" || : \
    && mkdir -p "${USER_HOME}/.cache/bazel" \
    && mkdir -p "${USER_HOME}/.cache/bazelisk" \
    && chown -R $USER_NAME "${USER_HOME}/.cache"

ADD entrypoint.sh /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
