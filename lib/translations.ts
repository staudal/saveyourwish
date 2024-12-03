export const translations = {
  en: {
    loading: "Loading...",
    error: "Something went wrong...",
    wishlists: {
      createDialog: {
        headline: "Create a new wishlist",
        description: "What’s the perfect title for your wishlist?",
        trigger: "New wishlist",
        cancel: "Cancel",
        create: "Create",
        success: "Wishlist created successfully!",
        titleLabel: "Title",
        titlePlaceholder: "Christmas 2024",
        titleError: "Title must be at least 2 characters",
      },
      editDialog: {
        headline: "Edit wishlist",
        description: "Time to give your wishlist a new look!",
        trigger: "Edit",
        cancel: "Cancel",
        save: "Save changes",
        success: "Wishlist updated successfully!",
        titleLabel: "Title",
        titlePlaceholder: "Enter a title",
        titleError: "Title must be at least 2 characters",
      },
      deleteDialog: {
        headline: "Are you sure?",
        description:
          "This action cannot be undone. This will permanently delete your wishlist and all items within it.",
        trigger: "Delete",
        cancel: "Cancel",
        delete: "Delete wishlist",
        success: "Wishlist deleted successfully!",
      },
      dataTable: {
        searchPlaceholder: "Search titles...",
        columns: "Columns",
        title: "Title",
        wishCount: "Wish count",
        averagePrice: "Average price",
        actions: "Actions",
        previous: "Previous",
        next: "Next",
        noWishlistsFound: "No wishlists found",
      },
    },
    wishes: {
      emptyState: {
        title: "No wishes yet",
        description: "Add your first wish to get started",
      },
      createDialog: {
        trigger: "Add wish",
        headline: "Add new wish",
        description: "Enter details about the item you wish for.",
        cancel: "Cancel",
        create: "Create",
        success: "Wish created successfully!",
        titleField: {
          label: "Title",
          placeholder: "Enter a title",
          error: "Title must be at least 2 characters",
          minLengthError: "Title must be at least 2 characters",
          maxLengthError: "Cannot exceed 100 characters",
        },
        priceField: {
          label: "Price",
          placeholder: "Enter a price",
          error: "Price must be a number",
          minLengthError: "Price must be positive",
          maxLengthError: "Cannot exceed 1,000,000",
        },
        imageUrlField: {
          label: "Image URL",
          placeholder: "Enter an image URL",
          error: "Must be a valid URL",
        },
        destinationUrlField: {
          label: "Product URL",
          placeholder: "Enter a product URL",
          error: "Must be a valid URL",
        },
        descriptionField: {
          label: "Description",
          placeholder: "Enter a description",
          maxLengthError: "Cannot exceed 1,000 characters",
        },
        quantityField: {
          label: "Quantity",
          placeholder: "Enter a quantity",
          error: "Number is required",
          minLengthError: "Must be at least 1",
          maxLengthError: "Cannot exceed 100",
        },
      },
      editDialog: {
        trigger: "Edit wish",
        headline: "Edit wish",
        description: "Update the details of your wish.",
        cancel: "Cancel",
        save: "Save changes",
        success: "Wish created successfully!",
        titleField: {
          label: "Title",
          placeholder: "Enter a title",
          error: "Title must be at least 2 characters",
          minLengthError: "Title must be at least 2 characters",
          maxLengthError: "Cannot exceed 100 characters",
        },
        priceField: {
          label: "Price",
          placeholder: "Enter a price",
          error: "Price must be a number",
          minLengthError: "Price must be positive",
          maxLengthError: "Cannot exceed 1,000,000",
        },
        imageUrlField: {
          label: "Image URL",
          placeholder: "Enter an image URL",
          error: "Must be a valid URL",
        },
        destinationUrlField: {
          label: "Product URL",
          placeholder: "Enter a product URL",
          error: "Must be a valid URL",
        },
        descriptionField: {
          label: "Description",
          placeholder: "Enter a description",
          maxLengthError: "Cannot exceed 1,000 characters",
        },
        quantityField: {
          label: "Quantity",
          placeholder: "Enter a quantity",
          error: "Number is required",
          minLengthError: "Must be at least 1",
          maxLengthError: "Cannot exceed 100",
        },
      },
      shareDialog: {
        button: "Share",
        headline: "Share your wishlist with others",
        descriptionEnabled:
          "Anyone with the link can now view this wishlist. Be aware that you can visit the link yourself if you don't want to see who has reserved the wishes.",
        descriptionDisabled:
          "Share your wishlist with others and get a link you can send to them. Be aware that you can visit the link yourself and see who has reserved your wishes.",
        copiedToClipboard: "Link copied to clipboard!",
        shareLinkLabel: "Link",
        cancelButton: "Cancel",
        disableButton: "Disable sharing",
        enableButton: "Enable sharing",
        enableSuccess: "Your wishlist is now public",
        disableSuccess: "Your wishlist is now private",
      },
      reserveDialog: {
        nameRequired: "Name is required",
        nameMinLength: "Name must be at least 2 characters",
        nameMaxLength: "Name must be less than 50 characters",
        success: "Wish reserved successfully!",
        nameLabel: "Your name",
        namePlaceholder: "Enter your name",
        headline: "Reserve this wish",
        description:
          "Enter your name so the wishlist owner knows who reserved it",
        cancelButton: "Cancel",
        button: "Reserve",
      },
      removeReservationDialog: {
        success: "Reservation removed successfully!",
        headline: "Remove reservation",
        description: "This will allow others to reserve this wish",
        cancelButton: "Cancel",
        button: "Remove",
      },
      wishCard: {
        noLink: "No link",
        reservedBy: "Reserved by",
        reserve: "Reserve",
        removeReservation: "Remove",
      },
      imagePositionDialog: {
        headline: "Adjust image position",
        description: "Adjust the position of the image",
        zoomLabel: "Zoom",
        verticalPositionLabel: "Vertical position",
        horizontalPositionLabel: "Horizontal position",
        cancel: "Cancel",
        save: "Save",
        success: "Image updated",
      },
      deleteDialog: {
        headline: "Are you sure?",
        description:
          "This action cannot be undone. This will permanently delete this wish.",
        delete: "Delete wish",
        success: "Wish deleted successfully!",
        cancel: "Cancel",
      },
      reorderMode: {
        button: "Reorder",
        cancelButton: "Cancel",
        saveButton: "Save",
        success: "Order updated",
        dragging: "Drag to reorder",
      },
      actions: {
        manage: "Manage",
        edit: {
          button: "Edit",
        },
        adjustImage: {
          button: "Adjust image",
        },
        delete: {
          button: "Delete",
        },
      },
    },
    sidebar: {
      light: "Light Mode",
      dark: "Dark Mode",
      signOut: "Log out",
      wishlists: "Wishlists",
      settings: "Settings",
      support: "Support",
      feedback: "Feedback",
    },
    settings: {
      headline: "Settings",
      description: "Manage your account settings and preferences.",
      language: {
        headline: "Language",
        description: "Select your preferred language.",
      },
    },
  },
  da: {
    loading: "Tænker...",
    error: "Noget gik galt...",
    wishlists: {
      createDialog: {
        headline: "Ny ønskeliste",
        description: "Hvad er det perfekte navn for din ønskeliste?",
        trigger: "Ny ønskeliste",
        cancel: "Annuller",
        create: "Opret",
        success: "Ønskeliste oprettet!",
        titleLabel: "Navn",
        titlePlaceholder: "Indtast et navn",
        titleError: "Navn skal være mindst 2 tegn",
      },
      editDialog: {
        headline: "Rediger ønskeliste",
        description: "Tid til at give ønskelisten et nyt pift!",
        trigger: "Rediger",
        cancel: "Annuller",
        save: "Gem ændringer",
        success: "Ønskeliste opdateret!",
        titleLabel: "Navn",
        titlePlaceholder: "Indtast et navn",
        titleError: "Navn skal være mindst 2 tegn",
      },
      deleteDialog: {
        headline: "Er du sikker?",
        description:
          "Denne handling kan ikke fortrydes. Denne handling vil slette din ønskeliste og alle ønsker i den.",
        trigger: "Slet",
        cancel: "Annuller",
        delete: "Slet ønskeliste",
        success: "Ønskeliste slettet!",
      },
      dataTable: {
        searchPlaceholder: "Søg efter navne...",
        columns: "Kolonner",
        title: "Navn",
        wishCount: "Antal ønsker",
        averagePrice: "Gennemsnitlig pris",
        actions: "Handlinger",
        previous: "Forrige",
        next: "Næste",
        noWishlistsFound: "Ingen ønskelister fundet",
      },
    },
    wishes: {
      emptyState: {
        title: "Ingen ønsker endnu",
        description: "Tilføj dit første ønske for at komme i gang",
      },
      createDialog: {
        trigger: "Tilføj ønske",
        headline: "Tilføj ønske",
        description: "Indtast detaljer om det ønskede element.",
        cancel: "Annuller",
        create: "Opret",
        success: "Ønske oprettet!",
        titleField: {
          label: "Navn",
          placeholder: "Indtast et navn",
          error: "Navn skal være mindst 2 tegn",
          minLengthError: "Navn skal være mindst 2 tegn",
          maxLengthError: "Kan ikke overstige 100 tegn",
        },
        priceField: {
          label: "Pris",
          placeholder: "Indtast en pris",
          error: "Pris skal være et tal",
          minLengthError: "Pris skal være positiv",
          maxLengthError: "Kan ikke overstige 1,000,000",
        },
        imageUrlField: {
          label: "Billede URL",
          placeholder: "Indtast et billede URL",
          error: "Må være en gyldig URL",
        },
        destinationUrlField: {
          label: "Produkt URL",
          placeholder: "Indtast et produkt URL",
          error: "Må være en gyldig URL",
        },
        descriptionField: {
          label: "Beskrivelse",
          placeholder: "Indtast en beskrivelse",
          maxLengthError: "Kan ikke overstige 1,000 tegn",
        },
        quantityField: {
          label: "Antal",
          placeholder: "Indtast et antal",
          error: "Skal være et tal",
          minLengthError: "Må være mindst 1",
          maxLengthError: "Kan ikke overstige 100",
        },
      },
      editDialog: {
        headline: "Rediger ønske",
        description: "Opdater detaljerne for dit ønske.",
        cancel: "Annuller",
        save: "Gem ændringer",
        success: "Ønske opdateret!",
        titleField: {
          label: "Navn",
          placeholder: "Indtast et navn",
          error: "Navn skal være mindst 2 tegn",
          minLengthError: "Navn skal være mindst 2 tegn",
          maxLengthError: "Kan ikke overstige 100 tegn",
        },
        priceField: {
          label: "Pris",
          placeholder: "Indtast en pris",
          error: "Pris skal være et tal",
          minLengthError: "Pris skal være positiv",
          maxLengthError: "Kan ikke overstige 1,000,000",
        },
        imageUrlField: {
          label: "Billede URL",
          placeholder: "Indtast et billede URL",
          error: "Må være en gyldig URL",
        },
        destinationUrlField: {
          label: "Produkt URL",
          placeholder: "Indtast et produkt URL",
          error: "Må være en gyldig URL",
        },
        descriptionField: {
          label: "Beskrivelse",
          placeholder: "Indtast en beskrivelse",
          maxLengthError: "Kan ikke overstige 1,000 tegn",
        },
        quantityField: {
          label: "Antal",
          placeholder: "Indtast et antal",
          error: "Skal være et tal",
          minLengthError: "Må være mindst 1",
          maxLengthError: "Kan ikke overstige 100",
        },
      },
      shareDialog: {
        button: "Del",
        headline: "Del ønskeliste",
        descriptionEnabled:
          "Folk du deler linket med, kan nu se denne ønskeliste. Vær opmærksom på, at du selv kan besøge linket, hvis du ikke vil se, hvem der har reserveret ønskerne.",
        descriptionDisabled:
          "Del din ønskeliste med andre og modtag et link, du kan sende til dem. Vær opmærksom på, du selv kan se linket og dermed også se, hvem som har reserveret dine ønsker.",
        copiedToClipboard: "Linket blev kopieret!",
        shareLinkLabel: "Link",
        cancelButton: "Annuller",
        disableButton: "Deaktiver deling",
        enableButton: "Aktiver deling",
        enableSuccess: "Din ønskeliste er nu offentlig",
        disableSuccess: "Din ønskeliste er nu privat",
      },
      imagePositionDialog: {
        headline: "Juster billede position",
        description: "Juster positionen af billedet",
        zoomLabel: "Zoom",
        verticalPositionLabel: "Vertikal position",
        horizontalPositionLabel: "Horisontal position",
        cancel: "Annuller",
        save: "Gem",
        success: "Billede opdateret",
      },
      deleteDialog: {
        headline: "Er du sikker?",
        description:
          "Denne handling kan ikke fortrydes. Denne handling vil slette dette ønske.",
        delete: "Slet ønske",
        success: "Ønske slettet!",
        cancel: "Annuller",
      },
      reserveDialog: {
        nameRequired: "Navn er påkrævet",
        nameMinLength: "Navn skal være mindst 2 tegn",
        nameMaxLength: "Navn kan ikke overstige 50 tegn",
        success: "Ønske reserveret!",
        nameLabel: "Navn",
        namePlaceholder: "Indtast dit navn",
        headline: "Reserver dette ønske",
        description:
          "Indtast dit navn så andre ved, hvem der har reserveret det",
        cancelButton: "Annuller",
        button: "Reserver",
      },
      removeReservationDialog: {
        success: "Reservation fjernet!",
        headline: "Fjern reservation",
        description: "Dette vil tillade andre at reservere dette ønske",
        cancelButton: "Annuller",
        button: "Fjern",
      },
      wishCard: {
        noLink: "Intet link",
        reservedBy: "Reserveret af",
        reserve: "Reserver",
        removeReservation: "Fjern",
      },
      reorderMode: {
        button: "Skift rækkefølge",
        cancelButton: "Annuller",
        saveButton: "Gem",
        success: "Rækkefølge opdateret",
        dragging: "Træk for at skifte rækkefølge",
      },
      actions: {
        manage: "Handlinger",
        edit: {
          button: "Rediger",
        },
        adjustImage: {
          button: "Juster billede",
        },
        delete: {
          button: "Slet",
        },
      },
    },
    sidebar: {
      light: "Lys tilstand",
      dark: "Mørk tilstand",
      signOut: "Log ud",
      wishlists: "Ønskelister",
      settings: "Indstillinger",
      support: "Support",
      feedback: "Feedback",
    },
    settings: {
      headline: "Indstillinger",
      description: "Administrer dine kontoindstillinger og præferencer.",
      language: {
        headline: "Sprog",
        description: "Vælg dit foretrukne sprog.",
      },
    },
  },
  sv: {
    loading: "Tänker...",
    error: "Något gick fel...",
    wishlists: {
      createDialog: {
        headline: "Skapa en ny önskelista",
        description: "Vad är den perfekta titeln för din önskelista?",
        trigger: "Ny önskelista",
        cancel: "Avbryt",
        create: "Skapa",
        success: "Önskelista skapad!",
        titleLabel: "Titel",
        titlePlaceholder: "Julafton 2024",
        titleError: "Titeln måste vara minst 2 tecken lång",
      },
      editDialog: {
        headline: "Redigera önskelista",
        description: "Dags att ge din önskelista ett nytt utseende!",
        trigger: "Redigera",
        cancel: "Avbryt",
        save: "Spara ändringar",
        success: "Önskelista uppdaterad!",
        titleLabel: "Titel",
        titlePlaceholder: "Ange en titel",
        titleError: "Titeln måste vara minst 2 tecken lång",
      },
      deleteDialog: {
        headline: "Är du säker?",
        description:
          "Den här åtgärden kan inte ångras. Detta kommer att permanent radera din önskelista och alla föremål i den.",
        trigger: "Radera",
        cancel: "Avbryt",
        delete: "Radera önskelista",
        success: "Önskelista raderad!",
      },
      dataTable: {
        searchPlaceholder: "Sök efter titlar...",
        columns: "Kolumner",
        title: "Titel",
        wishCount: "Antal önskningar",
        averagePrice: "Genomsnittspris",
        actions: "Åtgärder",
        previous: "Föregående",
        next: "Nästa",
        noWishlistsFound: "Inga önskelistor hittades",
      },
    },
    wishes: {
      emptyState: {
        title: "Inga önskningar ännu",
        description: "Lägg till din första önskning för att komma igång",
      },
      createDialog: {
        trigger: "Lägg till önskning",
        headline: "Lägg till ny önskning",
        description: "Ange detaljer om det föremål du önskar dig.",
        cancel: "Avbryt",
        create: "Skapa",
        success: "Önskning skapad!",
        titleField: {
          label: "Titel",
          placeholder: "Ange en titel",
          error: "Titeln måste vara minst 2 tecken lång",
          minLengthError: "Titeln måste vara minst 2 tecken lång",
          maxLengthError: "Får inte överstiga 100 tecken",
        },
        priceField: {
          label: "Pris",
          placeholder: "Ange ett pris",
          error: "Pris måste vara ett tal",
          minLengthError: "Pris måste vara positivt",
          maxLengthError: "Får inte överstiga 1,000,000",
        },
        imageUrlField: {
          label: "Bild-URL",
          placeholder: "Ange en bild-URL",
          error: "Måste vara en giltig URL",
        },
        destinationUrlField: {
          label: "Produkt-URL",
          placeholder: "Ange en produkt-URL",
          error: "Måste vara en giltig URL",
        },
        descriptionField: {
          label: "Beskrivning",
          placeholder: "Ange en beskrivning",
          maxLengthError: "Får inte överstiga 1,000 tecken",
        },
        quantityField: {
          label: "Antal",
          placeholder: "Ange ett antal",
          error: "Måste vara ett tal",
          minLengthError: "Måste vara minst 1",
          maxLengthError: "Får inte överstiga 100",
        },
      },
      editDialog: {
        trigger: "Redigera önskning",
        headline: "Redigera önskning",
        description: "Uppdatera detaljerna för din önskning.",
        cancel: "Avbryt",
        save: "Spara ändringar",
        success: "Önskning uppdaterad!",
        titleField: {
          label: "Titel",
          placeholder: "Ange en titel",
          error: "Titeln måste vara minst 2 tecken lång",
          minLengthError: "Titeln måste vara minst 2 tecken lång",
          maxLengthError: "Får inte överstiga 100 tecken",
        },
        priceField: {
          label: "Pris",
          placeholder: "Ange ett pris",
          error: "Pris måste vara ett tal",
          minLengthError: "Pris måste vara positivt",
          maxLengthError: "Får inte överstiga 1,000,000",
        },
        imageUrlField: {
          label: "Bild-URL",
          placeholder: "Ange en bild-URL",
          error: "Måste vara en giltig URL",
        },
        destinationUrlField: {
          label: "Produkt-URL",
          placeholder: "Ange en produkt-URL",
          error: "Måste vara en giltig URL",
        },
        descriptionField: {
          label: "Beskrivning",
          placeholder: "Ange en beskrivning",
          maxLengthError: "Får inte överstiga 1,000 tecken",
        },
        quantityField: {
          label: "Antal",
          placeholder: "Ange ett antal",
          error: "Måste vara ett tal",
          minLengthError: "Måste vara minst 1",
          maxLengthError: "Får inte överstiga 100",
        },
      },
      shareDialog: {
        button: "Dela",
        headline: "Dela önskelista",
        descriptionEnabled:
          "Alla med länken kan nu se den här önskelistan. Vär uppmärksam på att du kan besöka länken själv om du inte vill se vem som har reserverat önskningarna.",
        descriptionDisabled:
          "Dela din önskelista med andra och få en länk du kan skicka till dem. Vär uppmärksam på att du kan besöka länken själv och se vem som har reserverat dina önskningar.",
        copiedToClipboard: "Länk kopierad till urklipp!",
        shareLinkLabel: "Link",
        cancelButton: "Avbryt",
        disableButton: "Inaktivera delning",
        enableButton: "Aktivera delning",
        enableSuccess: "Din önskelista är nu offentlig",
        disableSuccess: "Din önskelista är nu privat",
      },
      imagePositionDialog: {
        headline: "Justera bildposition",
        description: "Justera bildens position",
        zoomLabel: "Zoom",
        verticalPositionLabel: "Vertikal position",
        horizontalPositionLabel: "Horisontell position",
        cancel: "Avbryt",
        save: "Spara",
        success: "Bild uppdaterad",
      },
      deleteDialog: {
        headline: "Är du säker?",
        description:
          "Den här åtgärden kan inte ångras. Detta kommer att permanent radera denna önskning.",
        delete: "Radera önskning",
        success: "Önskning raderad!",
        cancel: "Avbryt",
      },
      reorderMode: {
        button: "Omordna",
        cancelButton: "Avbryt",
        saveButton: "Spara",
        success: "Ordning uppdaterad",
        dragging: "Dra för att ändra ordning",
      },
      reserveDialog: {
        nameRequired: "Navn krävs",
        nameMinLength: "Navn måste vara minst 2 tecken",
        nameMaxLength: "Navn kan inte överstiga 50 tecken",
        success: "Önskning reserverad!",
        nameLabel: "Ditt namn",
        namePlaceholder: "Ange ditt namn",
        headline: "Reservera denna önskning",
        description:
          "Ange ditt namn så önskelistans ägare vet vem som har reserverat den",
        cancelButton: "Avbryt",
        button: "Reservera",
      },
      removeReservationDialog: {
        success: "Reservation borttagen!",
        headline: "Ta bort reservation",
        description: "Detta kommer att låta andra reservera denna önskning",
        cancelButton: "Avbryt",
        button: "Ta bort",
      },
      wishCard: {
        noLink: "Ingen länk",
        reservedBy: "Reserverad av",
        reserve: "Reservera",
        removeReservation: "Ta bort",
      },
      actions: {
        manage: "Hantera",
        edit: {
          button: "Redigera",
        },
        adjustImage: {
          button: "Justera bild",
        },
        delete: {
          button: "Radera",
        },
      },
    },
    sidebar: {
      light: "Ljust läge",
      dark: "Mörkt läge",
      signOut: "Logga ut",
      wishlists: "Önskelistor",
      settings: "Inställningar",
      support: "Support",
      feedback: "Feedback",
    },
    settings: {
      headline: "Inställningar",
      description: "Hantera dina kontoinställningar och preferenser.",
      language: {
        headline: "Språk",
        description: "Välj ditt föredragna språk.",
      },
    },
  },
  es: {
    loading: "Cargando...",
    error: "Algo salió mal...",
    wishlists: {
      createDialog: {
        headline: "Crear una nueva lista de deseos",
        description: "¿Cuál es el título perfecto para tu lista de deseos?",
        trigger: "Nueva lista de deseos",
        loading: "Creando...",
        cancel: "Cancelar",
        create: "Crear",
        success: "¡Lista de deseos creada!",
        error: "No se pudo crear la lista de deseos",
        titleLabel: "Título",
        titlePlaceholder: "Navidad 2024",
        titleError: "El título debe tener al menos 2 caracteres",
      },
      editDialog: {
        headline: "Editar lista de deseos",
        description: "¡Es hora de darle un nuevo toque a tu lista de deseos!",
        trigger: "Editar",
        cancel: "Cancelar",
        save: "Guardar cambios",
        success: "¡Lista de deseos actualizada!",
        titleLabel: "Título",
        titlePlaceholder: "Introduce un título",
        titleError: "El título debe tener al menos 2 caracteres",
      },
      deleteDialog: {
        headline: "¿Estás seguro?",
        description:
          "Esta acción no se puede deshacer. Esto eliminará permanentemente tu lista de deseos y todos los elementos en ella.",
        trigger: "Eliminar",
        cancel: "Cancelar",
        delete: "Eliminar lista de deseos",
        success: "¡Lista de deseos eliminada!",
      },
      dataTable: {
        searchPlaceholder: "Buscar títulos...",
        columns: "Columnas",
        title: "Título",
        wishCount: "Número de deseos",
        averagePrice: "Precio promedio",
        actions: "Acciones",
        previous: "Anterior",
        next: "Siguiente",
        noWishlistsFound: "No se encontraron listas de deseos",
      },
    },
    wishes: {
      emptyState: {
        title: "No hay deseos todavía",
        description: "Agrega tu primer deseo para empezar",
      },
      createDialog: {
        trigger: "Agregar deseo",
        headline: "Agregar nuevo deseo",
        description: "Introduce detalles sobre el artículo que deseas.",
        cancel: "Cancelar",
        create: "Crear",
        success: "¡Deseo creado!",
        titleField: {
          label: "Título",
          placeholder: "Introduce un título",
          error: "El título debe tener al menos 2 caracteres",
          minLengthError: "El título debe tener al menos 2 caracteres",
          maxLengthError: "No puede exceder los 100 caracteres",
        },
        priceField: {
          label: "Precio",
          placeholder: "Introduce un precio",
          error: "El precio debe ser un número",
          minLengthError: "El precio debe ser positivo",
          maxLengthError: "No puede exceder 1,000,000",
        },
        imageUrlField: {
          label: "URL de la imagen",
          placeholder: "Introduce una URL de imagen",
          error: "Debe ser una URL válida",
        },
        destinationUrlField: {
          label: "URL del producto",
          placeholder: "Introduce una URL del producto",
          error: "Debe ser una URL válida",
        },
        descriptionField: {
          label: "Descripción",
          placeholder: "Introduce una descripción",
          maxLengthError: "No puede exceder los 1,000 caracteres",
        },
        quantityField: {
          label: "Cantidad",
          placeholder: "Introduce una cantidad",
          error: "Debe ser un número",
          minLengthError: "Debe ser al menos 1",
          maxLengthError: "No puede exceder 100",
        },
      },
      editDialog: {
        trigger: "Editar deseo",
        headline: "Editar deseo",
        description: "Actualiza los detalles de tu deseo.",
        cancel: "Cancelar",
        save: "Guardar cambios",
        success: "¡Deseo actualizado!",
        titleField: {
          label: "Título",
          placeholder: "Introduce un título",
          error: "El título debe tener al menos 2 caracteres",
          minLengthError: "El título debe tener al menos 2 caracteres",
          maxLengthError: "No puede exceder los 100 caracteres",
        },
        priceField: {
          label: "Precio",
          placeholder: "Introduce un precio",
          error: "El precio debe ser un número",
          minLengthError: "El precio debe ser positivo",
          maxLengthError: "No puede exceder 1,000,000",
        },
        imageUrlField: {
          label: "URL de la imagen",
          placeholder: "Introduce una URL de imagen",
          error: "Debe ser una URL válida",
        },
        destinationUrlField: {
          label: "URL del producto",
          placeholder: "Introduce una URL del producto",
          error: "Debe ser una URL válida",
        },
        descriptionField: {
          label: "Descripción",
          placeholder: "Introduce una descripción",
          maxLengthError: "No puede exceder los 1,000 caracteres",
        },
        quantityField: {
          label: "Cantidad",
          placeholder: "Introduce una cantidad",
          error: "Debe ser un número",
          minLengthError: "Debe ser al menos 1",
          maxLengthError: "No puede exceder 100",
        },
      },
      shareDialog: {
        button: "Compartir",
        headline: "Compartir tu lista de deseos",
        descriptionEnabled:
          "Cualquiera con el enlace puede ver tu lista de deseos. Ten en cuenta que puedes visitar el enlace tú mismo si no quieres ver quién ha reservado los deseos.",
        descriptionDisabled:
          "Comparte tu lista de deseos con otros y obtén un enlace que puedas enviar a ellos. Ten en cuenta que puedes visitar el enlace tú mismo y ver quién ha reservado tus deseos.",
        copiedToClipboard: "¡Enlace copiado al portapapeles!",
        shareLinkLabel: "Link",
        cancelButton: "Cancelar",
        disableButton: "Desactivar uso compartido",
        enableButton: "Activar uso compartido",
        enableSuccess: "Tu lista de deseos es ahora pública",
        disableSuccess: "Tu lista de deseos es ahora privada",
      },
      imagePositionDialog: {
        headline: "Ajustar posición de la imagen",
        description: "Ajusta la posición de la imagen",
        zoomLabel: "Zoom",
        verticalPositionLabel: "Posición vertical",
        horizontalPositionLabel: "Posición horizontal",
        cancel: "Cancelar",
        save: "Guardar",
        success: "Imagen actualizada",
      },
      deleteDialog: {
        headline: "¿Estás seguro?",
        description:
          "Esta acción no se puede deshacer. Esto eliminará permanentemente este deseo.",
        delete: "Eliminar deseo",
        success: "¡Deseo eliminado!",
        cancel: "Cancelar",
      },
      reserveDialog: {
        nameRequired: "Nombre requerido",
        nameMinLength: "El nombre debe tener al menos 2 caracteres",
        nameMaxLength: "El nombre no puede exceder los 50 caracteres",
        success: "¡Deseo reservado!",
        nameLabel: "Tu nombre",
        namePlaceholder: "Introduce tu nombre",
        headline: "Reserva este deseo",
        description:
          "Introduce tu nombre para que el propietario de la lista de deseos sepa quién lo reservó",
        cancelButton: "Cancelar",
        button: "Reservar",
      },
      removeReservationDialog: {
        success: "¡Reserva eliminada!",
        headline: "Eliminar reserva",
        description: "Esto permitirá que otros reserven este deseo",
        cancelButton: "Cancelar",
        button: "Eliminar",
      },
      wishCard: {
        noLink: "Sin enlace",
        reservedBy: "Reservado por",
        reserve: "Reservar",
        removeReservation: "Eliminar",
      },
      reorderMode: {
        button: "Reordenar",
        cancelButton: "Cancelar",
        saveButton: "Guardar",
        success: "Orden actualizado",
        dragging: "Arrastra para reordenar",
      },
      actions: {
        manage: "Gestionar",
        edit: {
          button: "Editar",
        },
        adjustImage: {
          button: "Ajustar imagen",
        },
        delete: {
          button: "Eliminar",
        },
      },
    },
    sidebar: {
      light: "Modo claro",
      dark: "Modo oscuro",
      signOut: "Cerrar sesión",
      wishlists: "Listas de deseos",
      settings: "Configuración",
      support: "Soporte",
      feedback: "Comentarios",
    },
    settings: {
      headline: "Configuración",
      description:
        "Administra las configuraciones y preferencias de tu cuenta.",
      language: {
        headline: "Idioma",
        description: "Selecciona tu idioma preferido.",
      },
    },
  },
} as const;

export type Language = keyof typeof translations;
export type TranslationType = (typeof translations)[Language];
