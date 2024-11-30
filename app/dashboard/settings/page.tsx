import { Separator } from "@/components/ui/separator";
import { LanguageSelector } from "@/components/language-selector";
import { useTranslations } from "@/hooks/use-translations";

export default function SettingsPage() {
  const t = useTranslations();
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">{t.settings.headline}</h3>
        <p className="text-sm text-muted-foreground">
          {t.settings.description}
        </p>
      </div>
      <Separator />
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-2">
            {t.settings.language.headline}
          </h4>
          <LanguageSelector />
          <p className="text-sm text-muted-foreground mt-2">
            {t.settings.language.description}
          </p>
        </div>
      </div>
    </div>
  );
}
