# Asset Sources

The files in this folder are implementation/reference assets collected from publicly served On The Hook web properties during the August 13, 2026 design pass. See `asset-manifest.json` for exact source URLs, file hashes, and intended usage.

## Release requirement

`brand/oth-wordmark-reference.jpeg` is not the preferred production master. Replace it with the company's official SVG/transparent PNG before release and create App Store/Play Store icon/splash renditions from that official master.

The remaining line art and photography were directly served by the On The Hook website's CDN. Confirm internal rights/brand approval before distributing them in the shipped app.

The `photos/mobile/` variants are 640-pixel JPEG renditions of the corresponding source photography. Use these semantic registry entries in screens and retain their full-size siblings only as source masters; this avoids decoding the larger source files for card and hero use.

Do not download additional assets from ordering/vendor pages as part of this app scope.
