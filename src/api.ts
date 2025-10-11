import { getPreferenceValues } from "@raycast/api";
import { CatalogResponse, PackageMetadata, Preferences } from "./types";

function getRegistryBaseUrl(): string {
  const preferences = getPreferenceValues<Preferences>();
  return preferences.registryUrl || "https://registry.defenseunicorns.com";
}

async function fetchWithAuth(url: string): Promise<Response> {
  const preferences = getPreferenceValues<Preferences>();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (preferences.sessionCookie) {
    headers["Cookie"] = `uds_session=${preferences.sessionCookie}`;
  }

  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response;
}

export async function fetchCatalog(): Promise<CatalogResponse> {
  const baseUrl = getRegistryBaseUrl();
  const response = await fetchWithAuth(`${baseUrl}/uds/catalog`);
  return await response.json();
}

export async function fetchPackageMetadata(org: string, packageName: string): Promise<PackageMetadata> {
  const baseUrl = getRegistryBaseUrl();
  const response = await fetchWithAuth(`${baseUrl}/uds/metadata/${org}/${packageName}`);
  return await response.json();
}
