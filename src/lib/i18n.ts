/**
 * Arabic is the source of truth here: `Dict` is derived from the Arabic
 * dictionary, so adding a string to `ar` makes TypeScript demand it in `en`.
 *
 * This module is imported by both server and client components, so it must stay
 * free of `next/headers` and any other server-only API. Reading the chosen
 * locale from the cookie lives in `locale.ts`.
 */

export const LOCALES = ["ar", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "ar";

export function isLocale(v: string | undefined): v is Locale {
  return v === "ar" || v === "en";
}

export function dirOf(locale: Locale): "rtl" | "ltr" {
  return locale === "ar" ? "rtl" : "ltr";
}

const ar = {
  dir: "rtl",
  nav: {
    dashboard: "الرئيسية",
    settings: "الإعدادات",
    signOut: "تسجيل الخروج",
    signIn: "تسجيل الدخول",
    switchTo: "English",
    switchLabel: "تغيير اللغة إلى الإنجليزية",
  },
  footer:
    "تُحسب أوقات الصلاة محليًا حسب مدينتك. ويُتحقَّق من التسجيل مقابل نافذة مدينتك أنت — لا ساعة مشتركة.",

  landing: {
    eyebrow: "الفجر، معًا",
    titleTop: "أصعب صلاة",
    titleBottom: "أسهل مع الرفقة.",
    subtitle:
      "أنشئ مجموعة، وادعُ أصدقاءك أو عائلتك، وابنوا سلسلة لا يريد أحد أن يكون أول من يقطعها.",
    ctaPrimary: "ابدأ مجموعة",
    ctaSecondary: "لديّ دعوة",
    features: [
      {
        icon: "🕰️",
        title: "النافذة هي الأساس",
        body: "لا يمكنك التسجيل إلا بين الأذان وشروق الشمس، محسوبَين لمدينتك ولتاريخ اليوم. لا قبل، ولا بعد.",
      },
      {
        icon: "⚡",
        title: "الأبكر أفضل",
        body: "تنقسم النافذة إلى ثلاثة أثلاث. الصلاة بعد الأذان مباشرة تساوي ٣ نقاط، واللحاق قبل الشروق يساوي نقطة واحدة.",
      },
      {
        icon: "🛡️",
        title: "تفويت يوم لن ينهي كل شيء",
        body: "يوما سماح في الشهر يحميان سلسلتك. لا يمنحان نقاطًا — يمنعان فقط أن يمحو خطأ واحد أربعين يومًا.",
      },
    ],
    scoringTitle: "كيف تُحسب النقاط",
    scoringNote:
      "الصلاة في جماعة تضيف +2. ويكون ترتيب مجموعتك بالنقاط هذا الأسبوع، وهذا الشهر، ومنذ البداية — إضافةً إلى سلسلة مشتركة للأيام التي يلحق بها الجميع.",
    honest:
      "لا شيء هنا يُثبت أنك صليت — ذلك بينك وبين الله. ما يفعله أنه يتأكد أنك كنت مستيقظًا، وأن أصدقاءك سيلاحظون إن لم تكن.",
  },

  tiers: {
    early: { name: "الوقت المختار", note: "الثلث الأول من النافذة" },
    middle: { name: "في الوقت", note: "الثلث الأوسط" },
    late: { name: "قبل الشروق", note: "الثلث الأخير قبل الشروق" },
  },

  login: {
    title: "تسجيل الدخول",
    subtitle: "بدون كلمة مرور. نرسل لك رابطًا عبر البريد يسجّل دخولك.",
    email: "البريد الإلكتروني",
    submit: "أرسل لي رابط الدخول",
    sending: "جارٍ الإرسال…",
    hint: "الرابط ينتهي بعد وقت قصير. إن لم يصلك، تحقّق من مجلد الرسائل غير المرغوب فيها.",
  },

  onboarding: {
    eyebrow: "إعداد مطلوب · لمرة واحدة",
    title: "أهلًا بك في الفجر",
    subtitle:
      "قبل أن تسجّل أول فجر، نحتاج شيئين فقط: اسمًا تعرفك به مجموعتك، والمدينة التي تصلي فيها.",
    why: "من المدينة نحسب وقت الأذان والشروق كل يوم — وهي النافذة الوحيدة التي يُقبل فيها التسجيل. لهذا لا يمكن تخطّي هذه الخطوة.",
    changeLater: "لن نسألك عن هذا مرة أخرى. يمكنك تغييره متى شئت من الإعدادات.",
    submit: "احفظ وابدأ",
  },

  picker: {
    nameLabel: "اسمك",
    nameHelp: "هذا ما تراه مجموعتك في لوحة الترتيب.",
    whereLabel: "أين تصلي؟",
    whereHelp: "يُحسب الفجر والشروق من هذا، لكل يوم في السنة.",
    searchPlaceholder: "ابحث عن مدينة…",
    searchAria: "ابحث عن مدينتك",
    useLocation: "📍 استخدم موقعي",
    customLocation: "موقع مخصص",
    change: "تغيير",
    geoUnsupported: "هذا المتصفح لا يستطيع مشاركة موقعك. اختر مدينة بدلًا من ذلك.",
    geoBlocked: "تم حظر الوصول للموقع. اختر مدينة من القائمة بدلًا من ذلك.",
    previewTitle: "نافذتك اليوم",
    previewFajr: "أذان الفجر",
    previewSunrise: "الشروق",
    previewNote: "التسجيل مفتوح فقط بين هذين الوقتين.",
    methodInUse: (m: string) => `محسوبة بطريقة ${m}`,
    required: "مطلوب",
    pickCityFirst: "اختر مدينة للمتابعة.",
    saving: "جارٍ الحفظ…",
  },

  methods: {
    UmmAlQura: { label: "أم القرى", note: "مكة · السعودية" },
    Egyptian: { label: "الهيئة المصرية العامة للمساحة", note: "مصر · الشام" },
    MuslimWorldLeague: { label: "رابطة العالم الإسلامي", note: "أوروبا · الأكثر شيوعًا" },
    Karachi: { label: "جامعة كراتشي", note: "باكستان · الهند · بنغلاديش" },
    NorthAmerica: { label: "ISNA", note: "أمريكا الشمالية" },
    Dubai: { label: "دبي", note: "الإمارات" },
    Qatar: { label: "قطر", note: "قطر" },
    Kuwait: { label: "الكويت", note: "الكويت" },
    Turkey: { label: "ديانت", note: "تركيا" },
    Singapore: { label: "MUIS", note: "سنغافورة · ماليزيا" },
    Tehran: { label: "طهران", note: "إيران" },
    MoonsightingCommittee: { label: "لجنة رؤية الهلال", note: "مناسبة لخطوط العرض العالية" },
  },

  checkIn: {
    heading: "فجر اليوم",
    adhan: "الأذان",
    sunrise: "الشروق",
    beforeLabel: "يبدأ الفجر بعد",
    beforeHelp: (fajr: string) => `يُفتح التسجيل عند الأذان (${fajr}) ويُغلق عند الشروق.`,
    locked: "🔒 مقفل حتى الفجر",
    openLabel: "تُغلق النافذة بعد",
    openPrompt: (points: number, tier: string) => `سجّل الآن مقابل ${points} نقاط — ${tier}`,
    congregation: "صليت في جماعة",
    submit: "صليت الفجر",
    submitting: "جارٍ التسجيل…",
    loggedTitle: "تم تسجيل الفجر",
    loggedPoints: (n: number) => `+${n} نقاط`,
    loggedJamaah: "🕌 في جماعة",
    loggedStreak: (n: number) => `🔥 سلسلة ${n} يومًا`,
    loggedClosed: (sunrise: string) => `أُغلقت النافذة في ${sunrise}. عد غدًا.`,
    graceTitle: "استُخدم يوم سماح",
    graceBody: "سلسلتك محميّة. لا يُحتسب صلاةً — الغد هو الذي يُحتسب.",
    closedBody: (sunrise: string) => `طلعت الشمس في ${sunrise}. أُغلقت نافذة اليوم.`,
    nextLabel: "الفجر القادم بعد",
    nextAt: (t: string) => `غدًا في ${t}`,
    pts: "نقاط",
    unavailable:
      "تعذّر تحديد الفجر والشروق لموقعك اليوم. جرّب اختيار مدينة أقرب من",
    unavailableLink: "الإعدادات",
  },

  grace: {
    badge: "يوم سماح",
    title: (date: string) => `فوّتَّ ${date}`,
    withStreak: (n: number) =>
      `يوم السماح يُبقي سلسلتك البالغة ${n} يومًا حيّة. لا يمنح نقاطًا ولا يُحتسب صلاةً أبدًا — يمنع فقط أن يعيدك خطأ واحد إلى الصفر.`,
    withoutStreak:
      "يوم السماح يسدّ الفجوة حتى تتمكن سلسلة جديدة من البناء عبرها. لا يمنح نقاطًا ولا يُحتسب صلاةً أبدًا.",
    submit: "استخدم يوم سماح",
    submitting: "جارٍ التطبيق…",
    remaining: (n: number) => `${n} من 2 متبقٍ هذا الشهر · يتجدّدان في الأول من الشهر`,
  },

  stats: {
    currentStreak: "السلسلة الحالية",
    totalPoints: "مجموع النقاط",
    consistency: "الانتظام",
    longestStreak: "أطول سلسلة",
    notLoggedToday: "لم تسجّل اليوم",
    daysPrayed: (n: number) => `${n} يوم صلاة`,
  },

  badges: {
    heading: "الأوسمة",
    of: (a: number, b: number) => `${a} من ${b}`,
    empty: "لا شيء بعد. أول وسام يأتي بعد أول فجر.",
    nextUp: "التالي",
    items: {
      first: { name: "أول فجر", requirement: "سجّل أول فجر" },
      streak7: { name: "أسبوع", requirement: "سلسلة 7 أيام" },
      streak30: { name: "شهر", requirement: "سلسلة 30 يومًا" },
      streak40: { name: "الأربعون", requirement: "سلسلة 40 يومًا" },
      streak100: { name: "المئة", requirement: "سلسلة 100 يوم" },
      early10: { name: "المبكّر", requirement: "10 تسجيلات في الثلث الأول" },
      early50: { name: "ملازم الفجر", requirement: "50 تسجيلًا في الثلث الأول" },
      jamaah10: { name: "الجماعة", requirement: "10 صلوات في جماعة" },
      jamaah40: { name: "أربعون جماعة", requirement: "40 صلاة في جماعة" },
    },
  },

  dashboard: {
    greeting: "السلام عليكم",
    yourGroups: "مجموعاتك",
    noGroups: "لا مجموعات بعد. أنشئ واحدة وشارك رابط الدعوة، أو أدخل رمزًا وصلك.",
    members: (n: number) => (n === 1 ? "عضو واحد" : n === 2 ? "عضوان" : `${n} أعضاء`),
    youOwn: "أنت المالك",
  },

  groupForms: {
    createTab: "أنشئ مجموعة",
    joinTab: "انضم برمز",
    nameLabel: "اسم المجموعة",
    namePlaceholder: "نادي الفجر",
    descLabel: "الوصف",
    descOptional: "(اختياري)",
    descPlaceholder: "أبناء العم، بلا أعذار",
    create: "أنشئ المجموعة",
    creating: "جارٍ الإنشاء…",
    codeLabel: "رمز الدعوة",
    join: "انضم للمجموعة",
    joining: "جارٍ الانضمام…",
  },

  group: {
    back: "← الرئيسية",
    membersMetric: "الأعضاء",
    groupStreak: "سلسلة المجموعة",
    perfectDays: "أيام كاملة",
    inToday: "سجّلوا اليوم",
    perfectBanner: (n: number) =>
      `🔥 التزم كل الأعضاء ${n} ${n === 1 ? "يومًا" : "يومًا"} متتاليًا. لا تكن من يقطعها.`,
    boardTitle: "لوحة الفجر",
    boardToday: "اليوم",
    boardCount: (a: number, b: number) => `${a}/${b} سجّلوا`,
    you: "(أنت)",
    stateOpen: "النافذة مفتوحة",
    stateBefore: "قبل الفجر",
    stateMissed: "فاته",
    stateUnknown: "لا يوجد موقع",
    stateGrace: "يوم سماح",
    stateLogged: "سُجِّل",
    leaderboard: "لوحة الترتيب",
    week: "هذا الأسبوع",
    month: "هذا الشهر",
    all: "منذ البداية",
    emptyPeriod: "لم يُسجَّل شيء في هذه الفترة بعد.",
    days: (n: number) => (n === 1 ? "يوم واحد" : n === 2 ? "يومان" : `${n} أيام`),
    atFirstLight: (n: number) => `${n} في الوقت المختار`,
    rank: (n: number) => `المركز ${n}`,
    inviteTitle: "ادعُ أشخاصًا",
    inviteHelp: "أي شخص لديه هذا الرابط يمكنه الانضمام. شاركه في مجموعة العائلة.",
    copyLink: "انسخ الرابط",
    copied: "تم النسخ ✓",
    orCode: "أو شارك الرمز",
    leave: "غادر المجموعة",
    leaving: "جارٍ المغادرة…",
    delete: "احذف المجموعة",
    deleting: "جارٍ الحذف…",
    deleteConfirm: (name: string) =>
      `هل تحذف «${name}»؟ سيفقد كل عضو المجموعة وسجلّها. أما سلاسلهم الشخصية فلن تتأثر.`,
    deleteYes: "نعم، احذفها",
    cancel: "إلغاء",
    fajrAt: (t: string) => `الفجر ${t}`,
  },

  join: {
    invited: "أنت مدعو",
    alreadyIn: (n: number) =>
      n === 1 ? "شخص واحد انضم بالفعل" : n === 2 ? "شخصان انضما بالفعل" : `${n} أشخاص انضموا بالفعل`,
    explain:
      "الانضمام يعني أن تسجيلات الفجر الخاصة بك ستظهر في لوحة هذه المجموعة. لا يمكنك التسجيل إلا بين الأذان والشروق في مدينتك — ويمكنك المغادرة في أي وقت.",
    signInToJoin: "سجّل الدخول للانضمام",
    joinNow: "انضم لهذه المجموعة",
    badTitle: "هذه الدعوة لا تعمل",
    badBody: "قد يكون الرمز مكتوبًا خطأً، أو حُذفت المجموعة.",
    goHome: "العودة للرئيسية",
  },

  settings: {
    title: "الإعدادات",
    subtitle: "انتقلت لمدينة أخرى؟ حدّث هذا وستتبع كل النوافذ القادمة الموقع الجديد.",
    submit: "احفظ التغييرات",
    recordTitle: "سجلّك",
    signedInAs: "مسجَّل الدخول بـ",
    daysLogged: "أيام مسجّلة",
    graceUsed: "أيام السماح المستخدمة",
    permanence:
      "التسجيلات السابقة دائمة — لا يمكن تعديلها أو حذفها، لا منك ولا من غيرك. وهذا ما يجعل لوحة الترتيب ذات قيمة. لديك يوما سماح في الشهر ولا شيء أكثر.",
  },

  errors: {
    notSignedIn: "لست مسجّل الدخول.",
    invalidEmail: "أدخل بريدًا إلكترونيًا صحيحًا.",
    magicLinkSent: (email: string) => `تحقّق من ${email} للحصول على رابط الدخول.`,
    pickName: "اختر اسمًا تعرفه مجموعتك.",
    pickCity: "اختر مدينة، أو اسمح بالوصول إلى موقعك.",
    pickMethod: "اختر طريقة حساب.",
    badTimezone: "لم يتم التعرّف على هذه المنطقة الزمنية. جرّب اختيار مدينة بدلًا من ذلك.",
    saved: "تم الحفظ.",
    setCityFirst: "حدّد مدينتك أولًا حتى نتمكن من حساب الفجر.",
    beforeFajr: "لم يدخل وقت الفجر بعد. تُفتح النافذة عند الأذان.",
    afterSunrise: "طلعت الشمس بالفعل. لا يمكن تسجيل الفجر إلا بين الأذان والشروق.",
    alreadyLogged: "سجّلت الفجر اليوم بالفعل.",
    logged: (n: number) => `تم التسجيل. +${n} نقاط.`,
    dayAccounted: "هذا اليوم محسوب بالفعل.",
    graceExhausted: "استخدمت يومَي السماح هذا الشهر. يتجدّدان في الأول من الشهر.",
    graceApplied: "تم تطبيق يوم السماح. سلسلتك في أمان.",
    groupName: "أعطِ المجموعة اسمًا (من 1 إلى 60 حرفًا).",
    groupCreateFailed: "تعذّر إنشاء المجموعة.",
    enterCode: "أدخل رمز دعوة.",
    badCode: "رمز الدعوة هذا لا يطابق أي مجموعة.",
    missingGroup: "المجموعة غير محددة.",
    ownerCannotLeave: "أنت مالك هذه المجموعة. احذفها بدلًا من ذلك، أو انقل ملكيتها أولًا.",
  },
};

export type Dict = typeof ar;

const en: Dict = {
  dir: "ltr",
  nav: {
    dashboard: "Dashboard",
    settings: "Settings",
    signOut: "Sign out",
    signIn: "Sign in",
    switchTo: "العربية",
    switchLabel: "Switch language to Arabic",
  },
  footer:
    "Prayer times computed locally from your city. Check-in is verified against your own city's window — never a shared clock.",

  landing: {
    eyebrow: "Fajr, together",
    titleTop: "The hardest prayer",
    titleBottom: "is easier with company.",
    subtitle:
      "Make a group, invite your friends or family, and build a streak nobody wants to be the first to break.",
    ctaPrimary: "Start a group",
    ctaSecondary: "I have an invite",
    features: [
      {
        icon: "🕰️",
        title: "The window is the point",
        body: "You can only log between the adhan and sunrise, computed for your city and today's date. Not before. Not after.",
      },
      {
        icon: "⚡",
        title: "Earlier beats later",
        body: "The window splits into thirds. Praying right after the adhan is worth 3 points; scraping in before sunrise is worth 1.",
      },
      {
        icon: "🛡️",
        title: "One miss won't end you",
        body: "Two grace days a month protect your streak. They score nothing — they just stop a single miss from wiping out 40 days.",
      },
    ],
    scoringTitle: "How the scoring works",
    scoringNote:
      "Praying in congregation adds +2. Your group ranks by points this week, this month, and all time — plus a shared streak for days when everyone makes it.",
    honest:
      "Nothing here can prove you prayed — that stays between you and Allah. What it can do is make sure you were awake, and that your friends will notice if you weren't.",
  },

  tiers: {
    early: { name: "First light", note: "First third of the window" },
    middle: { name: "On time", note: "Middle third" },
    late: { name: "Just in time", note: "Last third before sunrise" },
  },

  login: {
    title: "Sign in",
    subtitle: "No password. We email you a link that signs you in.",
    email: "Email",
    submit: "Email me a sign-in link",
    sending: "Sending…",
    hint: "The link expires shortly. If it doesn't arrive, check your spam folder.",
  },

  onboarding: {
    eyebrow: "Required · one-time setup",
    title: "Welcome to Fajr",
    subtitle:
      "Before you can log your first Fajr we need two things: a name your group will recognise, and the city you pray in.",
    why: "Your city is what we compute the adhan and sunrise from each day — and that window is the only time a check-in is accepted. That is why this step cannot be skipped.",
    changeLater: "We won't ask again. You can change any of it later in settings.",
    submit: "Save and start",
  },

  picker: {
    nameLabel: "Your name",
    nameHelp: "This is what your group sees on the leaderboard.",
    whereLabel: "Where do you pray?",
    whereHelp: "Fajr and sunrise are computed from this, for every day of the year.",
    searchPlaceholder: "Search a city…",
    searchAria: "Search for your city",
    useLocation: "📍 Use my location",
    customLocation: "Custom location",
    change: "Change",
    geoUnsupported: "This browser can't share your location. Pick a city instead.",
    geoBlocked: "Location was blocked. Pick a city from the list instead.",
    previewTitle: "Your window today",
    previewFajr: "Fajr adhan",
    previewSunrise: "Sunrise",
    previewNote: "Check-in is open only between these two times.",
    methodInUse: (m: string) => `Calculated using ${m}`,
    required: "Required",
    pickCityFirst: "Pick a city to continue.",
    saving: "Saving…",
  },

  methods: {
    UmmAlQura: { label: "Umm al-Qura", note: "Makkah · Saudi Arabia" },
    Egyptian: { label: "Egyptian General Authority", note: "Egypt · Levant" },
    MuslimWorldLeague: { label: "Muslim World League", note: "Europe · common default" },
    Karachi: { label: "University of Karachi", note: "Pakistan · India · Bangladesh" },
    NorthAmerica: { label: "ISNA", note: "North America" },
    Dubai: { label: "Dubai", note: "UAE" },
    Qatar: { label: "Qatar", note: "Qatar" },
    Kuwait: { label: "Kuwait", note: "Kuwait" },
    Turkey: { label: "Diyanet", note: "Türkiye" },
    Singapore: { label: "MUIS", note: "Singapore · Malaysia" },
    Tehran: { label: "Tehran", note: "Iran" },
    MoonsightingCommittee: { label: "Moonsighting Committee", note: "High-latitude friendly" },
  },

  checkIn: {
    heading: "Today's Fajr",
    adhan: "Adhan",
    sunrise: "Sunrise",
    beforeLabel: "Fajr begins in",
    beforeHelp: (fajr: string) =>
      `Check-in unlocks at the adhan (${fajr}) and closes at sunrise.`,
    locked: "🔒 Locked until Fajr",
    openLabel: "Window closes in",
    openPrompt: (points: number, tier: string) => `Log now for ${points} points — ${tier}`,
    congregation: "I prayed in congregation",
    submit: "I prayed Fajr",
    submitting: "Logging…",
    loggedTitle: "Fajr logged",
    loggedPoints: (n: number) => `+${n} points`,
    loggedJamaah: "🕌 In congregation",
    loggedStreak: (n: number) => `🔥 ${n}-day streak`,
    loggedClosed: (sunrise: string) => `The window closed at ${sunrise}. Come back tomorrow.`,
    graceTitle: "Grace day applied",
    graceBody: "Your streak is protected. It doesn't count as a prayer — tomorrow does.",
    closedBody: (sunrise: string) => `The sun rose at ${sunrise}. Today's window has closed.`,
    nextLabel: "Next Fajr in",
    nextAt: (t: string) => `Tomorrow at ${t}`,
    pts: "pts",
    unavailable:
      "Fajr and sunrise could not be resolved for your location today. Try picking a nearer city in",
    unavailableLink: "settings",
  },

  grace: {
    badge: "Grace day",
    title: (date: string) => `You missed ${date}`,
    withStreak: (n: number) =>
      `A grace day keeps your ${n}-day streak alive. It scores zero points and never counts as a prayer — it only stops one miss from resetting you to nothing.`,
    withoutStreak:
      "A grace day covers the gap so a fresh streak can build through it. It scores zero points and never counts as a prayer.",
    submit: "Use a grace day",
    submitting: "Applying…",
    remaining: (n: number) => `${n} of 2 left this month · resets on the 1st`,
  },

  stats: {
    currentStreak: "Current streak",
    totalPoints: "Total points",
    consistency: "Consistency",
    longestStreak: "Longest streak",
    notLoggedToday: "Not logged today",
    daysPrayed: (n: number) => `${n} days prayed`,
  },

  badges: {
    heading: "Badges",
    of: (a: number, b: number) => `${a} of ${b}`,
    empty: "None yet. The first one lands after your first Fajr.",
    nextUp: "Next up",
    items: {
      first: { name: "First Light", requirement: "Log your first Fajr" },
      streak7: { name: "Week Strong", requirement: "7-day streak" },
      streak30: { name: "Full Moon", requirement: "30-day streak" },
      streak40: { name: "The Forty", requirement: "40-day streak" },
      streak100: { name: "Hundred", requirement: "100-day streak" },
      early10: { name: "Early Riser", requirement: "10 first-third check-ins" },
      early50: { name: "Dawn Chaser", requirement: "50 first-third check-ins" },
      jamaah10: { name: "Congregation", requirement: "10 prayers in congregation" },
      jamaah40: { name: "Forty in Jama'ah", requirement: "40 prayers in congregation" },
    },
  },

  dashboard: {
    greeting: "Assalamu alaikum",
    yourGroups: "Your groups",
    noGroups:
      "No groups yet. Create one and share the invite link, or enter a code you were sent.",
    members: (n: number) => `${n} ${n === 1 ? "member" : "members"}`,
    youOwn: "you own this",
  },

  groupForms: {
    createTab: "Create a group",
    joinTab: "Join with a code",
    nameLabel: "Group name",
    namePlaceholder: "The Dawn Club",
    descLabel: "Description",
    descOptional: "(optional)",
    descPlaceholder: "Cousins, no excuses",
    create: "Create group",
    creating: "Creating…",
    codeLabel: "Invite code",
    join: "Join group",
    joining: "Joining…",
  },

  group: {
    back: "← Dashboard",
    membersMetric: "Members",
    groupStreak: "Group streak",
    perfectDays: "Perfect days",
    inToday: "In today",
    perfectBanner: (n: number) =>
      `🔥 Every member has made it ${n} ${n === 1 ? "day" : "days"} running. Don't be the one who ends it.`,
    boardTitle: "Dawn board",
    boardToday: "Today",
    boardCount: (a: number, b: number) => `${a}/${b} in`,
    you: "(you)",
    stateOpen: "Window open",
    stateBefore: "Before Fajr",
    stateMissed: "Missed",
    stateUnknown: "No location",
    stateGrace: "Grace day",
    stateLogged: "Logged",
    leaderboard: "Leaderboard",
    week: "This week",
    month: "This month",
    all: "All time",
    emptyPeriod: "Nothing logged in this period yet.",
    days: (n: number) => `${n} ${n === 1 ? "day" : "days"}`,
    atFirstLight: (n: number) => `${n} at first light`,
    rank: (n: number) => `Rank ${n}`,
    inviteTitle: "Invite people",
    inviteHelp: "Anyone with this link can join. Share it in the family group chat.",
    copyLink: "Copy link",
    copied: "Copied ✓",
    orCode: "Or share the code",
    leave: "Leave group",
    leaving: "Leaving…",
    delete: "Delete group",
    deleting: "Deleting…",
    deleteConfirm: (name: string) =>
      `Delete "${name}"? Every member loses the group and its history. Their personal streaks are unaffected.`,
    deleteYes: "Yes, delete it",
    cancel: "Cancel",
    fajrAt: (t: string) => `Fajr ${t}`,
  },

  join: {
    invited: "You're invited",
    alreadyIn: (n: number) => `${n} ${n === 1 ? "person is" : "people are"} already in`,
    explain:
      "Joining means your Fajr check-ins show on this group's board. You can only log between the adhan and sunrise in your own city — and you can leave any time.",
    signInToJoin: "Sign in to join",
    joinNow: "Join this group",
    badTitle: "This invite doesn't work",
    badBody: "The code may have been mistyped, or the group was deleted.",
    goHome: "Go home",
  },

  settings: {
    title: "Settings",
    subtitle: "Moving city? Update this and every future window follows the new location.",
    submit: "Save changes",
    recordTitle: "Your record",
    signedInAs: "Signed in as",
    daysLogged: "Days logged",
    graceUsed: "Grace days used",
    permanence:
      "Past check-ins are permanent — they can't be edited or deleted, by you or anyone else. That's what makes the leaderboard worth anything. You get 2 grace days a month and nothing more.",
  },

  errors: {
    notSignedIn: "You are not signed in.",
    invalidEmail: "Enter a valid email address.",
    magicLinkSent: (email: string) => `Check ${email} for your sign-in link.`,
    pickName: "Pick a name your group will recognise.",
    pickCity: "Choose a city, or allow location access.",
    pickMethod: "Pick a calculation method.",
    badTimezone: "That timezone was not recognised. Try picking a city instead.",
    saved: "Saved.",
    setCityFirst: "Set your city first so we can work out Fajr.",
    beforeFajr: "Fajr has not come in yet. The window opens at the adhan.",
    afterSunrise:
      "The sun is already up. Fajr can only be logged between the adhan and sunrise.",
    alreadyLogged: "You already logged Fajr today.",
    logged: (n: number) => `Logged. +${n} points.`,
    dayAccounted: "That day is already accounted for.",
    graceExhausted: "You have used both grace days this month. They reset on the 1st.",
    graceApplied: "Grace day applied. Your streak is safe.",
    groupName: "Give the group a name (1–60 characters).",
    groupCreateFailed: "Could not create the group.",
    enterCode: "Enter an invite code.",
    badCode: "That invite code does not match any group.",
    missingGroup: "Missing group.",
    ownerCannotLeave: "You own this group. Delete it instead, or hand it over first.",
  },
};

const DICTIONARIES: Record<Locale, Dict> = { ar, en };

export function getDict(locale: Locale): Dict {
  return DICTIONARIES[locale] ?? DICTIONARIES[DEFAULT_LOCALE];
}

/**
 * Long-form date for display. Western digits in both locales, so they line up
 * with the tabular figures used for times and scores everywhere else.
 */
export function formatDate(date: string, locale: Locale): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-u-nu-latn" : "en-GB", {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(Date.UTC(y, m - 1, d)));
}
