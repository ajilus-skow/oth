import bootstrap from "../content/bootstrap.json";
import { validateExternalUrl } from "../services/linking/externalLinks";

type ExternalDestination = "jobs" | "store" | "franchise" | "privacy" | "terms";

const safeDefaults: Record<ExternalDestination, string> = {
  jobs: "https://onthehookfishandchips.com/jobs",
  store: "https://onthehookoutfitters.com/",
  franchise: "https://franchiseonthehook.com/",
  privacy: "https://onthehookfishandchips.com/privacy-policy",
  terms: "https://onthehookfishandchips.com/terms-and-conditions"
};

function validDestination(value: unknown, fallback: string): string {
  return typeof value === "string" && validateExternalUrl(value, "web") ? value : fallback;
}

export const externalDestinations: Record<ExternalDestination, string> = {
  jobs: validDestination(bootstrap.links.jobs, safeDefaults.jobs),
  store: validDestination(bootstrap.links.store, safeDefaults.store),
  franchise: validDestination(bootstrap.links.franchise, safeDefaults.franchise),
  privacy: validDestination(bootstrap.links.privacy, safeDefaults.privacy),
  terms: validDestination(bootstrap.links.terms, safeDefaults.terms)
};
