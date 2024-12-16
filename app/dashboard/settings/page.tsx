import { Suspense } from "react";
import SettingsContent from "./settings-content";
import SettingsLoading from "./loading";

export default function SettingsPage() {
  return (
    <Suspense fallback={<SettingsLoading />}>
      <SettingsContent />
    </Suspense>
  );
}
