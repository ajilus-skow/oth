# Asset Sources

The files in this folder are implementation/reference assets collected from publicly served On The Hook web properties during the August 13, 2026 design pass. See `asset-manifest.json` for exact source URLs, file hashes, and intended usage.

## Release requirement

`brand/oth-logo.svg` is the approved first-party wordmark supplied in `docs/reference/oth-logo.svg` and is the Home screen logo source. Create App Store icon/splash renditions from that official master before release.

`brand/oth-wordmark-reference.jpeg` remains a development reference and must not be used as a production logo.

The remaining line art and photography were directly served by the On The Hook website's CDN. Confirm internal rights/brand approval before distributing them in the shipped app.

The `photos/mobile/` variants are 640-pixel JPEG renditions of the corresponding source photography. Use these semantic registry entries in screens and retain their full-size siblings only as source masters; this avoids decoding the larger source files for card and hero use.

Do not download additional assets from ordering/vendor pages as part of this app scope.
