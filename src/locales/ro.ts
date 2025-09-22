// Romanian translations (default language)
export const ro = {
  // Welcome Screen
  welcome: {
    title: "NAOMI'S",
    subtitle: "SALON DE COAFURĂ",
    tagline: "Unde stilul întâlnește excelența.",
    taglineSubtext: "Experimentează arta coafurii profesionale pentru toți.",
    bookAppointmentBtn: "Rezervă o Programare",
    contactForQuestions: "Pentru întrebări, contactează-ne:",
    features: {
      expertStylists: {
        title: "Coafori Experți",
        description: "Tunsori și coafuri profesionale pentru toți clienții"
      },
      easyBooking: {
        title: "Rezervare Ușoară",
        description: "Programare rapidă online"
      },
      premiumService: {
        title: "Servicii Premium",
        description: "Servicii de calitate cu atenție la detalii"
      }
    }
  },

  // Main Booking Screen
  booking: {
    backToHome: "← Înapoi la Pagina Principală",
    title: "Rezervă o Programare",
    subtitle: "Selectează data și ora preferată",
    chooseService: "Alege Serviciul",
    backToCalendar: "Înapoi la Calendar",
    loading: "Se încarcă...",
    
    // Calendar
    calendar: {
      monthNames: [
        "Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie",
        "Iulie", "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie"
      ],
      dayNames: ["L", "M", "M", "J", "V", "S", "D"],
      selectDate: "Selectează o Dată",
      selectTime: "Selectează Ora",
      noAvailableSlots: "Nu sunt sloturi disponibile pentru această dată",
      previousMonth: "Luna anterioară",
      nextMonth: "Luna următoare"
    }
  },

  // Services
  services: {
    title: "Selectează un Serviciu",
    duration: "min",
    price: "RON"
  },

  // Booking Form
  bookingForm: {
    title: "Completează Rezervarea",
    summary: "Rezumatul Rezervării",
    service: "Serviciu",
    date: "Data",
    time: "Ora",
    fullName: "Numele Complet",
    fullNameRequired: "Numele complet *",
    phoneNumber: "Numărul de Telefon",
    phoneNumberRequired: "Numărul de telefon *",
    emailAddress: "Adresa de Email (Opțional)",
    additionalNotes: "Note Adiționale (Opțional)",
    notesPlaceholder: "Cerințe speciale sau note...",
    nameRequired: "Numele este obligatoriu",
    phoneRequired: "Numărul de telefon este obligatoriu",
    phoneInvalid: "Te rugăm să introduci un număr de telefon valid",
    emailInvalid: "Te rugăm să introduci o adresă de email validă",
    namePlaceholder: "Introdu numele tău complet",
    phonePlaceholder: "Introdu numărul tău de telefon",
    emailPlaceholder: "Introdu adresa ta de email",
    back: "Înapoi",
    bookingBtn: "Rezervă Programarea",
    bookingProgress: "Se rezervă..."
  },

  // Confirmation
  confirmation: {
    title: "Rezervare Confirmată!",
    details: "Detaliile Programării",
    service: "Serviciu",
    date: "Data",
    time: "Ora",
    customer: "Client",
    phone: "Telefon",
    email: "Email",
    confirmationText: "Îți vom trimite o confirmare în scurt timp. Te rugăm să ajungi cu 5 minute înainte de ora programării.",
    bookAnother: "Rezervă Alta",
    backToHome: "Înapoi la Pagina Principală"
  },

  // Language Switcher
  language: {
    switchTo: "Русский", // Show Russian when current is Romanian
    currentLang: "Română"
  },

  // Admin Dashboard
  admin: {
    title: "Panou Administrativ",
    loading: "Se încarcă...",
    logout: "Deconectare",
    login: {
      title: "Autentificare Administrator",
      username: "Nume de utilizator",
      password: "Parolă",
      loginBtn: "Conectare",
      loggingIn: "Se conectează...",
      invalidCredentials: "Credențiale invalide",
      loginFailed: "Autentificare eșuată"
    },
    dashboard: {
      welcome: "Bun venit în Panoul Administrativ",
      totalBookings: "Total Rezervări",
      pendingBookings: "Rezervări în Așteptare",
      completedBookings: "Rezervări Completate",
      todayBookings: "Rezervări Astăzi",
      booking: "rezervare",
      bookings: "rezervări",
      noBookings: "Nu sunt rezervări găsite",
      noBookingsForDate: "Nu sunt rezervări găsite pentru această dată",
      showingBookingsFor: "Arătând rezervările pentru",
      for: "pentru",
      status: "Status",
      edit: "Editează",
      save: "Salvează",
      cancel: "Anulează",
      delete: "Șterge",
      confirmDelete: "Confirmă Ștergerea",
      service: "Serviciu",
      customer: "Client",
      phone: "Telefon",
      email: "Email",
      notes: "Note",
      deleteBooking: "Șterge Programarea"
    }
  },

  // Status values
  status: {
    confirmed: "Confirmat",
    completed: "Completat",
    cancelled: "Anulat"
  },

  // Error messages
  errors: {
    loadServices: "Eșec la încărcarea serviciilor",
    createBooking: "Eșec la crearea rezervării",
    loadBookings: "Eșec la încărcarea rezervărilor",
    networkError: "Eroare de rețea. Te rugăm să încerci din nou."
  },

  // Common
  common: {
    loading: "Se încarcă...",
    error: "Eroare",
    success: "Succes",
    close: "Închide",
    ok: "OK",
    yes: "Da",
    no: "Nu"
  }
};