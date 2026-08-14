import { act, create, type ReactTestInstance, type ReactTestRenderer } from "react-test-renderer";

const mockNavigate = jest.fn();
const mockRequestNotificationPermission = jest.fn();
const mockSaveNotificationPreferences = jest.fn();
const mockOpenDirections = jest.fn();
const mockAddCalendarEvent = jest.fn();

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
  useRoute: () => ({ params: { eventId: "oth-202608-001" } })
}));
jest.mock("../config/environment", () => ({
  mobileEnvironment: { useMockData: false }
}));
jest.mock("../services/notifications/notificationPreferences", () => ({
  defaultNotificationPreferences: { homeArea: "", scheduledNearby: true, dayBefore: true, morningOf: false },
  loadNotificationPreferences: async () => ({ homeArea: "", scheduledNearby: true, dayBefore: true, morningOf: false }),
  normalizeHomeArea: (value: string) => (value === "Johnstown, CO" ? value : null),
  openNotificationSettings: jest.fn(),
  requestNotificationPermission: (...args: unknown[]) => mockRequestNotificationPermission(...args),
  saveNotificationPreferences: (...args: unknown[]) => mockSaveNotificationPreferences(...args)
}));
jest.mock("../services/linking/directions", () => ({
  openDirections: (...args: unknown[]) => mockOpenDirections(...args)
}));
jest.mock("../services/calendar/nativeCalendar", () => ({
  addCalendarEvent: (...args: unknown[]) => mockAddCalendarEvent(...args)
}));
jest.mock("../assets/registry", () => ({
  images: { photos: { truckSide: 1 } },
  OfficialWordmark: () => null
}));

import { FindUsScreen } from "./locations/FindUsScreen";
import { EventDetailScreen } from "./locations/EventDetailScreen";
import { HomeScreen } from "./home/HomeScreen";
import { NotificationSetupScreen } from "./notifications/NotificationSetupScreen";

function textContent(renderer: ReactTestRenderer): string {
  const collect = (node: ReactTestInstance | string): string[] =>
    typeof node === "string" ? [node] : node.children.flatMap(collect);
  return collect(renderer.root).join(" ");
}

async function render(component: React.ReactElement): Promise<ReactTestRenderer> {
  let renderer!: ReactTestRenderer;
  await act(async () => {
    renderer = create(component);
  });
  return renderer;
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  jest.setSystemTime(new Date("2026-08-13T12:00:00.000Z"));
});

afterEach(async () => {
  await act(async () => {
    await jest.runOnlyPendingTimersAsync();
  });
  jest.useRealTimers();
});

test("home uses bundled informational content even with no API configured", async () => {
  const screen = await render(<HomeScreen />);

  expect(textContent(screen)).toContain("Fresh, wild-caught fish and chips.");
  expect(textContent(screen)).toContain("Brought to your neck of the woods.");
  expect(textContent(screen)).toContain("Why On The Hook");

  const findNearMe = screen.root.findByProps({ accessibilityLabel: "Find a truck near me" });
  act(() => findNearMe.props.onPress());
  expect(mockNavigate).toHaveBeenCalledWith("Tabs", { screen: "FindUs" });
});

test("manual search finds a known bundled event and opens its detail without network data", async () => {
  const screen = await render(<FindUsScreen />);
  const search = screen.root.findByProps({ accessibilityLabel: "Search city state ZIP or host" });

  act(() => {
    search.props.onChangeText("Johnstown");
  });
  await act(async () => {
    await jest.advanceTimersByTimeAsync(301);
  });

  expect(textContent(screen)).toMatch(/Johnstown\s*,\s*CO/);
  expect(textContent(screen)).toContain("Dine In");

  const details = screen.root
    .findAllByProps({ accessibilityRole: "button" })
    .find(node => textContent({ root: node } as ReactTestRenderer).includes("Details"));
  expect(details).toBeDefined();
  act(() => details?.props.onPress());
  expect(mockNavigate).toHaveBeenCalledWith("EventDetail", { eventId: "oth-202608-001" });
});

test("notification onboarding saves a valid local preference before requesting local permission", async () => {
  mockRequestNotificationPermission.mockResolvedValue("granted");
  const screen = await render(<NotificationSetupScreen />);
  const homeArea = screen.root.findByProps({ accessibilityLabel: "Home area, city and state or ZIP" });

  await act(async () => {
    homeArea.props.onChangeText("Johnstown, CO");
  });
  const enable = screen.root.findByProps({ accessibilityLabel: "Enable alerts" });
  await act(async () => {
    enable.props.onPress();
  });

  expect(mockSaveNotificationPreferences).toHaveBeenCalledWith({
    homeArea: "Johnstown, CO",
    scheduledNearby: true,
    dayBefore: true,
    morningOf: false
  });
  expect(mockRequestNotificationPermission).toHaveBeenCalledTimes(1);
  expect(textContent(screen)).toContain("Alerts are ready.");
});

test("bundled event detail offers maps directions but never invents an order destination", async () => {
  mockAddCalendarEvent.mockResolvedValue(undefined);
  const screen = await render(<EventDetailScreen />);

  expect(textContent(screen)).toMatch(/Johnstown\s*,\s*CO/);
  expect(textContent(screen)).toContain("4884 Larimer Parkway");
  expect(textContent(screen)).not.toContain("Order Food");

  const directions = screen.root.findByProps({ accessibilityLabel: "Get directions" });
  act(() => directions.props.onPress());
  expect(mockOpenDirections).toHaveBeenCalledWith(
    expect.objectContaining({ eventId: "oth-202608-001", address1: "4884 Larimer Parkway" })
  );

  const calendar = screen.root.findByProps({ accessibilityLabel: "Add to Calendar" });
  await act(async () => {
    calendar.props.onPress();
  });
  expect(mockAddCalendarEvent).toHaveBeenCalledWith(
    expect.objectContaining({
      title: "On The Hook — Johnstown at Dine In",
      location: "Dine In, 4884 Larimer Parkway, Johnstown, CO, 80534"
    })
  );
});
