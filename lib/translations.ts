export const translations = {
  en: {
    wishlists: {
      createDialog: {
        headline: "New wishlist",
        description: "Name your wishlist and choose a category if you'd like.",
        trigger: "New wishlist",
        loading: "Creating...",
        cancel: "Cancel",
        create: "Create",
        success: "Wishlist created successfully!",
        error: "Failed to create wishlist",
        titleLabel: "Title",
        titlePlaceholder: "Enter a title",
        titleError: "Title must be at least 2 characters",
      },
    },
  },
  da: {
    wishlists: {
      createDialog: {
        headline: "Ny ønskeliste",
        description: "Navngiv din ønskeliste og vælg en kategori hvis du vil.",
        trigger: "Ny ønskeliste",
        loading: "Opretter...",
        cancel: "Annuller",
        create: "Opret",
        success: "Ønskeliste oprettet!",
        error: "Fejl ved oprettelse af ønskeliste",
        titleLabel: "Navn",
        titlePlaceholder: "Indtast et navn",
        titleError: "Navn skal være mindst 2 tegn",
      },
    },
  },
} as const;

export type Language = keyof typeof translations;
export type TranslationType = (typeof translations)[Language];
