import { contactDetails } from "./ContactScreen";

test("uses documented contact defaults that are safe to open only on tap", () => {
  expect(contactDetails).toEqual({ email: "info@onthehookfishandchips.com", phone: "+13073164665" });
});
