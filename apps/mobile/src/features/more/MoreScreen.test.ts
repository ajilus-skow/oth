import { moreRows } from "./MoreScreen";

test("lists the specified internal and external More destinations", () => {
  expect(moreRows.map(row => row.label)).toEqual([
    "About On The Hook",
    "Contact Us",
    "Jobs",
    "On The Hook Store",
    "Franchise Opportunities",
    "Notification Settings",
    "Location Settings",
    "Privacy Policy",
    "Terms & Conditions"
  ]);
  expect(moreRows.filter(row => "url" in row)).toHaveLength(5);
  expect(moreRows.filter(row => "url" in row).every(row => "url" in row && row.url.startsWith("https://"))).toBe(true);
});
