// Russian translations
export const ru = {
  // Welcome Screen
  welcome: {
    title: "NAOMI'S",
    subtitle: "САЛОН КРАСОТЫ",
    tagline: "Где стиль встречает совершенство.",
    taglineSubtext: "Познайте искусство профессиональной прически для всех.",
    bookAppointmentBtn: "Записаться на Приём",
    contactForQuestions: "По вопросам обращайтесь:",
    features: {
      expertStylists: {
        title: "Опытные Стилисты",
        description: "Профессиональные стрижки и укладки для всех клиентов"
      },
      easyBooking: {
        title: "Простая Запись",
        description: "Быстрая онлайн-запись на приём"
      },
      premiumService: {
        title: "Премиум Сервис",
        description: "Качественный сервис с вниманием к деталям"
      }
    }
  },

  // Main Booking Screen
  booking: {
    backToHome: "← Назад на Главную",
    title: "Записаться на Приём",
    subtitle: "Выберите предпочтительную дату и время",
    chooseService: "Выберите Услугу",
    backToCalendar: "Назад к Календарю",
    loading: "Загрузка...",
    
    // Calendar
    calendar: {
      monthNames: [
        "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
        "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
      ],
      dayNames: ["П", "В", "С", "Ч", "П", "С", "В"],
      selectDate: "Выберите Дату",
      selectTime: "Выберите Время",
      noAvailableSlots: "Нет доступных слотов на эту дату",
      previousMonth: "Предыдущий месяц",
      nextMonth: "Следующий месяц"
    }
  },

  // Services
  services: {
    title: "Выберите Услугу",
    duration: "мин",
    price: "РОН"
  },

  // Booking Form
  bookingForm: {
    title: "Завершите Запись",
    summary: "Сводка Записи",
    service: "Услуга",
    date: "Дата",
    time: "Время",
    fullName: "Полное Имя",
    fullNameRequired: "Полное имя *",
    phoneNumber: "Номер Телефона",
    phoneNumberRequired: "Номер телефона *",
    emailAddress: "Email Адрес (Необязательно)",
    additionalNotes: "Дополнительные Заметки (Необязательно)",
    notesPlaceholder: "Особые пожелания или заметки...",
    nameRequired: "Имя обязательно",
    phoneRequired: "Номер телефона обязателен",
    phoneInvalid: "Пожалуйста, введите действительный номер телефона",
    emailInvalid: "Пожалуйста, введите действительный email адрес",
    namePlaceholder: "Введите ваше полное имя",
    phonePlaceholder: "Введите ваш номер телефона",
    emailPlaceholder: "Введите ваш email адрес",
    back: "Назад",
    bookingBtn: "Записаться",
    bookingProgress: "Запись..."
  },

  // Confirmation
  confirmation: {
    title: "Запись Подтверждена!",
    details: "Детали Приёма",
    service: "Услуга",
    date: "Дата",
    time: "Время",
    customer: "Клиент",
    phone: "Телефон",
    email: "Email",
    confirmationText: "Мы отправим вам подтверждение в ближайшее время. Пожалуйста, приходите за 5 минут до назначенного времени.",
    bookAnother: "Записаться Ещё",
    backToHome: "Назад на Главную"
  },

  // Language Switcher
  language: {
    switchTo: "Română", // Show Romanian when current is Russian
    currentLang: "Русский"
  },

  // Admin Dashboard
  admin: {
    title: "Панель Администратора",
    loading: "Загружается...",
    logout: "Выйти",
    login: {
      title: "Вход Администратора",
      username: "Имя пользователя",
      password: "Пароль",
      loginBtn: "Войти",
      loggingIn: "Вход...",
      invalidCredentials: "Неверные учетные данные",
      loginFailed: "Ошибка входа"
    },
    dashboard: {
      welcome: "Добро пожаловать в Панель Администратора",
      totalBookings: "Всего Записей",
      pendingBookings: "Ожидающие Записи",
      completedBookings: "Завершённые Записи",
      todayBookings: "Записи Сегодня",
      booking: "запись",
      bookings: "записи",
      noBookings: "Записи не найдены",
      noBookingsForDate: "Записи на эту дату не найдены",
      showingBookingsFor: "Показаны записи для",
      for: "для",
      status: "Статус",
      edit: "Редактировать",
      save: "Сохранить",
      cancel: "Отменить",
      delete: "Удалить",
      confirmDelete: "Подтвердить Удаление",
      service: "Услуга",
      customer: "Клиент",
      phone: "Телефон",
      email: "Email",
      notes: "Заметки",
      deleteBooking: "Удалить Запись"
    }
  },

  // Status values
  status: {
    confirmed: "Подтверждено",
    completed: "Завершено",
    cancelled: "Отменено"
  },

  // Error messages
  errors: {
    loadServices: "Ошибка загрузки услуг",
    createBooking: "Ошибка создания записи",
    loadBookings: "Ошибка загрузки записей",
    networkError: "Ошибка сети. Пожалуйста, попробуйте снова."
  },

  // Common
  common: {
    loading: "Загрузка...",
    error: "Ошибка",
    success: "Успех",
    close: "Закрыть",
    ok: "ОК",
    yes: "Да",
    no: "Нет"
  }
};