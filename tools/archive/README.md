# Archive manifest reconciliation

The `//tools/archive` targets list `gs://<archive-bucket>/envoy/docs`, read the
current manifest and per-version sidecars from the meta bucket, and rebuild the
website-compatible manifest. The `backfill` binary computes and uploads missing
sidecars without overwriting existing ones. `publish_manifest` refuses to
publish if any version still lacks a sidecar, then writes the immutable
content-addressed manifest before updating `versions.json` and its sha256 file.
Network listing actions are local-only and uncached.

The `Sync Envoy` workflow runs backfill before building and publishing the
manifest. It requires the `GCS_ARCHIVE_META_KEY` repository secret and the
`GCS_ARCHIVE_BUCKET` and `GCS_ARCHIVE_META_BUCKET` repository variables. For manual
writes, set `GCP_KEY_PATH` to a service-account key with the required access,
and provide the bucket names with the Bazel flags below.

```bash
ARGS=(--config=ci
      --//tools/archive:archive_bucket="${GCS_ARCHIVE_BUCKET}"
      --//tools/archive:meta_bucket="${GCS_ARCHIVE_META_BUCKET}")

bazel run "${ARGS[@]}" //tools/archive:backfill -- --all --dry-run
bazel run "${ARGS[@]}" //tools/archive:backfill -- --all
bazel build "${ARGS[@]}" //tools/archive:manifest //tools/archive:changed //tools/archive:missing_sidecars //tools/archive:dropped
bazel run "${ARGS[@]}" //tools/archive:publish_manifest
```

`bazel test //tools/archive/...` runs the golden tests offline; those tests use
fixtures and do not list or write to GCS.
