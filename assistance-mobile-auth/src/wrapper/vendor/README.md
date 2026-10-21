# China Mobile JSSDK resources

The wrapper loads official JSSDK 1.0.6 from https://authsafe.cmpassport.com/h5/js/jssdk_sf/jssdk-1.0.6.min.js. Only the official control CSS is stored locally.

The project owner approved use of this CSS on 2026-05-07. Resource URLs, retrieval date, approval status, license status and existing checksums are recorded in `mobile-jssdk.meta.ts`. No general redistribution license text was supplied with the official customer documentation.

H5 CSS uses `env-dynamic-remote-css`; wrapper consumers use the `caller-required-local-asset` strategy. The wrapper initializes the required global CryptoJS before loading the official SDK.

When updating CSS, review the official URL, version, license and permission, then update the asset, existing checksum, metadata and tests together. JavaScript remains loaded from the official CDN.
