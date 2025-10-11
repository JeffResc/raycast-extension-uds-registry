import { Action, ActionPanel, List, Clipboard, showToast, Toast, Icon, Color } from "@raycast/api";
import { useEffect, useState } from "react";
import { fetchPackageMetadata } from "./api";
import { CatalogPackage, PackageMetadata } from "./types";
import { getPreferenceValues } from "@raycast/api";
import { Preferences } from "./types";

interface CopyPackageReferenceProps {
  org: string;
  packageName: string;
  packageData: CatalogPackage;
}

export function CopyPackageReference({ org, packageName, packageData }: CopyPackageReferenceProps) {
  const [metadata, setMetadata] = useState<PackageMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFlavor, setSelectedFlavor] = useState<string>("");

  const preferences = getPreferenceValues<Preferences>();
  const registryUrl = preferences.registryUrl || "https://registry.defenseunicorns.com";
  const baseUrl = registryUrl.replace(/^https?:\/\//, ""); // Remove protocol for OCI format

  useEffect(() => {
    async function loadMetadata() {
      try {
        setIsLoading(true);
        const data = await fetchPackageMetadata(org, packageName);
        setMetadata(data);
      } catch (error) {
        await showToast({
          style: Toast.Style.Failure,
          title: "Failed to load package versions",
          message: error instanceof Error ? error.message : "Unknown error",
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadMetadata();
  }, [org, packageName]);

  const getVersionsForFlavor = (flavor: string): string[] => {
    if (!metadata || !metadata.tags) return [];

    const versionSet = new Set<string>();
    metadata.tags.forEach((tag) => {
      if (tag.zarf_data?.flavor === flavor) {
        versionSet.add(tag.name);
      }
    });

    return Array.from(versionSet).sort().reverse();
  };

  const handleCopy = async (version: string, flavor: string) => {
    const ociRef = `${baseUrl}/${org}/${packageName}:${version}-${flavor}`;
    await Clipboard.copy(ociRef);
    await showToast({
      style: Toast.Style.Success,
      title: "Copied to clipboard",
      message: ociRef,
    });
  };

  if (isLoading) {
    return <List isLoading={true} />;
  }

  // If no flavors, show versions with latest tag format
  if (!packageData.flavors || packageData.flavors.length === 0) {
    const versionSet = new Set<string>();
    if (metadata && metadata.tags) {
      metadata.tags.forEach((tag) => {
        versionSet.add(tag.name);
      });
    } else {
      versionSet.add(packageData.latest_tag);
    }
    const versions = Array.from(versionSet).sort().reverse();

    return (
      <List searchBarPlaceholder="Select version to copy...">
        {versions.map((version) => (
          <List.Item
            key={version}
            title={version}
            icon={Icon.Tag}
            accessories={
              version === packageData.latest_tag ? [{ tag: { value: "latest", color: Color.Green } }] : []
            }
            actions={
              <ActionPanel>
                <Action
                  title="Copy OCI Reference"
                  icon={Icon.Clipboard}
                  onAction={() => handleCopy(version, "")}
                />
              </ActionPanel>
            }
          />
        ))}
      </List>
    );
  }

  // Show flavor selection if not selected yet
  if (!selectedFlavor) {
    return (
      <List searchBarPlaceholder="Select flavor...">
        {packageData.flavors.map((flavor) => (
          <List.Item
            key={flavor}
            title={flavor}
            icon={Icon.Star}
            actions={
              <ActionPanel>
                <Action title="Select Flavor" onAction={() => setSelectedFlavor(flavor)} />
              </ActionPanel>
            }
          />
        ))}
      </List>
    );
  }

  // Show versions for selected flavor
  const versions = getVersionsForFlavor(selectedFlavor);

  return (
    <List
      searchBarPlaceholder={`Select version for ${selectedFlavor}...`}
      navigationTitle={`Flavor: ${selectedFlavor}`}
    >
      <List.Item
        key="back"
        title="← Back to Flavor Selection"
        icon={Icon.ArrowLeft}
        actions={
          <ActionPanel>
            <Action title="Back" onAction={() => setSelectedFlavor("")} />
          </ActionPanel>
        }
      />
      {versions.map((version) => {
        const isLatest = packageData.latest_tag === `${version}-${selectedFlavor}`;
        return (
          <List.Item
            key={version}
            title={version}
            icon={Icon.Tag}
            accessories={isLatest ? [{ tag: { value: "latest", color: Color.Green } }] : []}
            actions={
              <ActionPanel>
                <Action
                  title="Copy OCI Reference"
                  icon={Icon.Clipboard}
                  onAction={() => handleCopy(version, selectedFlavor)}
                />
                <Action title="Change Flavor" icon={Icon.ArrowLeft} onAction={() => setSelectedFlavor("")} />
              </ActionPanel>
            }
          />
        );
      })}
    </List>
  );
}
