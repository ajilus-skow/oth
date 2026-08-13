const granted = { status: "granted", settings: {} };

module.exports = {
  PERMISSIONS: { IOS: { LOCATION_WHEN_IN_USE: "ios.permission.LOCATION_WHEN_IN_USE" } },
  check: jest.fn(async () => "granted"),
  checkNotifications: jest.fn(async () => granted),
  openSettings: jest.fn(async () => {}),
  request: jest.fn(async () => "granted"),
  requestNotifications: jest.fn(async () => granted)
};
