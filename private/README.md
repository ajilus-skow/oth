# Private Apple credentials

This directory is ignored except for this guide and the safe template. Keep
real Apple credentials here locally; never commit them or paste them into chat.

1. Copy `app-store-connect.env.example` to `app-store-connect.env`.
2. Fill in the App Store Connect API issuer ID, key ID, and Apple Developer
   team ID.
3. Save the downloaded App Store Connect private key as
   `AuthKey_<KEY_ID>.p8` in this directory and set `APP_STORE_CONNECT_KEY_PATH`
   to that file.

The values map to the GitHub configuration required by
`Release iOS to TestFlight`:

| Local value | GitHub configuration |
| --- | --- |
| `APPLE_TEAM_ID` | Repository variable `APPLE_TEAM_ID` |
| `APP_STORE_CONNECT_KEY_ID` | Secret `APP_STORE_CONNECT_KEY_ID` |
| `APP_STORE_CONNECT_ISSUER_ID` | Secret `APP_STORE_CONNECT_ISSUER_ID` |
| Contents of `APP_STORE_CONNECT_KEY_PATH` | Secret `APP_STORE_CONNECT_PRIVATE_KEY` |
