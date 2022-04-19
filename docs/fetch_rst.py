#!/usr/bin/env python3

import asyncio
import pathlib
import sys

import aiohttp


BUCKET="https://storage.googleapis.com/envoy-postsubmit"
DOCS_PUBLISH_PATH="docs/envoy-docs-rst.tar.gz"


async def main():
    short_commit = sys.argv[1][:7]
    url = f"{BUCKET}/{short_commit}/{DOCS_PUBLISH_PATH}"
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as resp:
            path = pathlib.Path(sys.argv[2])
            path.write_bytes(await resp.read())


if __name__ == "__main__":
    asyncio.run(main())
