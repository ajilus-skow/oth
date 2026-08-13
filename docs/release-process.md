# Release process

The App Store app name is `OnTheHookBeta`, its SKU is `oth-ios-001`, and its
iOS application identifier is `com.ajilus.oth`. Before establishing CI or
TestFlight delivery, configure the Apple developer team and signing material in
the iOS project and keep signing secrets outside the repository.

The `Release iOS to TestFlight` GitHub workflow runs for `oth-v*` tags or
manual dispatch on the `oth-mac` self-hosted runner. It requires:

- repository variable `APPLE_TEAM_ID`;
- secrets `APP_STORE_CONNECT_KEY_ID`, `APP_STORE_CONNECT_ISSUER_ID`, and
  `APP_STORE_CONNECT_PRIVATE_KEY`;
- a production environment whose access policy permits the release.

Use [`../private/app-store-connect.env.example`](../private/app-store-connect.env.example)
as a local credential template. Its populated copy and `.p8` key stay ignored.
