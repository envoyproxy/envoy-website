# Netlify Configuration

## Build Image

The Envoy website is deployed to Netlify using Ubuntu 24.04 Noble Numbat as the build image.

### Changing the Build Image

The build image version cannot be specified in `netlify.toml`. To update the build image:

1. Go to the site on the [Netlify dashboard](https://app.netlify.com)
2. Open **Site settings**
3. Navigate to **Build & deploy > Continuous Deployment > Build image selection**
4. Click **Configure** and select **Ubuntu Noble 24.04**
5. Save the changes

### Current Configuration

- **Build Image**: Ubuntu 24.04 Noble Numbat (recommended)
- **Previous Image**: Ubuntu 20.04 Focal Fossa (deprecated as of January 1, 2026)

### Build Dependencies

The build process uses:
- Bazel (via Bazelisk)
- Node.js (configured via `.node-version`)
- Yarn v1.22.10 (specified in `netlify.toml`)

See `netlify.toml` for environment variable configuration.

### Troubleshooting

If builds fail after updating the build image:
1. Check the deploy logs in Netlify for missing dependencies
2. Verify that tool versions are compatible with Ubuntu 24.04
3. Update dependency versions in `netlify.toml` if needed
4. Test the build locally using Docker (see `README.md`)

For more information, see:
- [Netlify Build Image Documentation](https://docs.netlify.com/build/configure-builds/available-software-at-build-time/)
- [Ubuntu 24.04 LTS Release Notes](https://discourse.ubuntu.com/t/ubuntu-24-04-lts-noble-numbat-release-notes/39890)
