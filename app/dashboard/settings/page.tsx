import { Separator } from "@/components/ui/separator";
import { LanguageSelector } from "@/components/language-selector";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Settings</h3>
        <p className="text-sm text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>
      <Separator />
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-2">Language</h4>
          <LanguageSelector />
          <p className="text-sm text-muted-foreground mt-2">
            Select your preferred language. This will be used across the entire
            application.
          </p>
        </div>
      </div>
    </div>
  );
}
