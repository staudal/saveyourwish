"use client";

import { Separator } from "@/components/ui/separator";
import { LanguageSelector } from "@/components/language-selector";
import { useTranslations } from "@/hooks/use-translations";
import { Button } from "@/components/ui/button";
import { DeleteAccountDialog } from "@/components/dialogs/delete-account-dialog";
import { useState } from "react";

export default function SettingsPage() {
  const t = useTranslations();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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
          <div className="max-w-[180px]">
            <LanguageSelector />
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {t.settings.language.description}
          </p>
        </div>
      </div>
      <Separator />
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-2">
            {t.settings.deleteAccount.headline}
          </h4>
          <p className="text-sm text-muted-foreground mb-4">
            {t.settings.deleteAccount.description}
          </p>
          <Button
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            {t.settings.deleteAccount.button}
          </Button>
        </div>
      </div>

      <DeleteAccountDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
      />
    </div>
  );
}
