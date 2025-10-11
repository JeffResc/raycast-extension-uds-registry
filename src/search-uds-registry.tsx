import { Action, ActionPanel, List, showToast, Toast, Icon, getPreferenceValues } from "@raycast/api";
import { useEffect, useState } from "react";
import { fetchCatalog } from "./api";
import { CatalogPackage, Preferences } from "./types";
import { PackageDetail } from "./package-detail";

interface PackageWithOrg extends CatalogPackage {
  orgName: string;
}

export default function Command() {
  const [packages, setPackages] = useState<PackageWithOrg[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    async function loadCatalog() {
      try {
        setIsLoading(true);
        const response = await fetchCatalog();
        const preferences = getPreferenceValues<Preferences>();

        // Convert catalog response to array of packages with org info
        const packageArray: PackageWithOrg[] = [];
        Object.entries(response.catalog).forEach(([orgName, orgData]) => {
          // Skip organizations based on preferences
          if (preferences.ignorePublic && orgName === "public") {
            return;
          }
          if (preferences.ignoreAirgapStore && orgName === "airgap-store") {
            return;
          }

          orgData.repos.forEach((pkg) => {
            packageArray.push({
              ...pkg,
              orgName,
            });
          });
        });

        setPackages(packageArray);
        await showToast({
          style: Toast.Style.Success,
          title: "Catalog loaded",
          message: `Found ${packageArray.length} packages`,
        });
      } catch (error) {
        await showToast({
          style: Toast.Style.Failure,
          title: "Failed to load catalog",
          message: error instanceof Error ? error.message : "Unknown error",
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadCatalog();
  }, []);

  const filteredPackages = packages.filter((pkg) => {
    const searchLower = searchText.toLowerCase();
    return (
      pkg.repo?.toLowerCase().includes(searchLower) ||
      pkg.title?.toLowerCase().includes(searchLower) ||
      pkg.orgName?.toLowerCase().includes(searchLower) ||
      pkg.description?.toLowerCase().includes(searchLower) ||
      pkg.tagline?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <List
      isLoading={isLoading}
      onSearchTextChange={setSearchText}
      searchBarPlaceholder="Search UDS Registry packages..."
      throttle
    >
      {filteredPackages.map((pkg) => (
        <List.Item
          key={`${pkg.orgName}/${pkg.repo}`}
          title={`${pkg.orgName} / ${pkg.repo}`}
          subtitle={pkg.tagline || pkg.title}
          accessories={[]}
          icon={pkg.icon || Icon.Box}
          actions={
            <ActionPanel>
              <Action.Push
                title="View Details"
                icon={Icon.Eye}
                target={<PackageDetail org={pkg.orgName} packageName={pkg.repo} packageData={pkg} />}
              />
              {pkg.url && (
                <Action.OpenInBrowser
                  title="Open Repository"
                  url={pkg.url}
                  icon={Icon.Globe}
                  shortcut={{ modifiers: ["cmd"], key: "o" }}
                />
              )}
              <Action.CopyToClipboard
                title="Copy Package Reference"
                content={`${pkg.orgName}/${pkg.repo}`}
                shortcut={{ modifiers: ["cmd"], key: "c" }}
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
