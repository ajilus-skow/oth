import eventsFixture from "../fixtures/truck-events.json";
import { parseEventPage } from "./models";

test("parses valid fixture events and excludes invalid coordinates", () => {
  expect(parseEventPage(eventsFixture).events).toHaveLength(3);
  expect(parseEventPage({ ...eventsFixture, events: [{ ...eventsFixture.events[0], latitude: 91 }] }).events).toEqual(
    []
  );
});
