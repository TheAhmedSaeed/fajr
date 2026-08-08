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

/**
 * Arabic counted nouns do not work like English ones: the noun changes form at
 * one, two, three-to-ten, and eleven-plus. Pluralising by appending an "s"
 * equivalent produces "0 أيام" and "+1 نقاط", which read as machine
 * translation to any native speaker.
 */
function counted(
  n: number,
  forms: { one: string; two: string; few: string; many: string },
): string {
  if (n === 1) return forms.one;
  if (n === 2) return forms.two;
  if (n >= 3 && n <= 10) return `${n} ${forms.few}`;
  return `${n} ${forms.many}`;
}

const arDays = (n: number) =>
  counted(n, { one: "يوم واحد", two: "يومان", few: "أيام", many: "يومًا" });

const arDaysBare = (n: number) =>
  counted(n, { one: "يوم", two: "يومان", few: "أيام", many: "يومًا" });

const arPoints = (n: number) =>
  counted(n, { one: "نقطة واحدة", two: "نقطتان", few: "نقاط", many: "نقطة" });

const arPointsBare = (n: number) =>
  counted(n, { one: "نقطة", two: "نقطتان", few: "نقاط", many: "نقطة" });

const arMembers = (n: number) =>
  counted(n, { one: "عضو واحد", two: "عضوان", few: "أعضاء", many: "عضوًا" });

const arPeople = (n: number) =>
  counted(n, { one: "شخص واحد", two: "شخصان", few: "أشخاص", many: "شخصًا" });

const ar = {
  dir: "rtl",
  nav: {
    dashboard: "الرئيسية",
    settings: "الإعدادات",
    signOut: "خروج",
    signIn: "دخول",
    switchTo: "English",
    switchLabel: "تغيير اللغة إلى الإنجليزية",
  },
  footer:
    "أوقات الصلاة محسوبة لمدينتك أنت، لا لساعةٍ مشتركة. ولا يُقبل التسجيل إلا داخل وقت الفجر عندك.",

  landing: {
    eyebrow: "نصلّي الفجر… معًا",
    titleTop: "أثقل صلاةٍ على النفس",
    titleBottom: "أخفُّ حين نحملها معًا.",
    subtitle:
      "اجمع أهلك وأصحابك في مجموعة، وابدأوا تتابعًا لا يرضى أحدكم أن يكون أول من يكسره.",
    ctaPrimary: "أنشئ مجموعة",
    ctaSecondary: "عندي دعوة",
    features: [
      {
        icon: "🕰️",
        title: "الوقت هو الشرط",
        body: "لا تسجيل إلا بين الأذان وطلوع الشمس، محسوبَين لمدينتك وليوم اليوم. لا قبلهما ولا بعدهما.",
      },
      {
        icon: "⚡",
        title: "من بكّر… ربح",
        body: "وقت الفجر ثلاثة أثلاث. من صلّى عقب الأذان فله ثلاث نقاط، ومن أدركها قُبيل الشروق فله نقطة.",
      },
      {
        icon: "🛡️",
        title: "زلّة يومٍ لا تهدم شهرًا",
        body: "لك يوما سماحٍ في الشهر يحفظان تتابعك. لا نقاط فيهما، لكنهما يمنعان أن يمحو تأخّرُ ليلةٍ أربعين يومًا.",
      },
    ],
    scoringTitle: "كيف تُحسب النقاط",
    scoringNote:
      "وصلاة الجماعة تزيدك نقطتين. والترتيب في مجموعتك بالنقاط: هذا الأسبوع، وهذا الشهر، ومن البداية — ومعه تتابعٌ مشترك للأيام التي يدركها الجميع.",
    honest:
      "لا شيء هنا يُثبت أنك صليت — تلك بينك وبين الله. لكنه يضمن أنك كنت مستيقظًا، وأن إخوانك سيفتقدونك إن غبت.",
  },

  tiers: {
    early: { name: "وقت الاختيار", note: "الثلث الأول من الوقت" },
    middle: { name: "في الوقت", note: "الثلث الأوسط" },
    late: { name: "قُبيل الشروق", note: "الثلث الأخير قبل طلوع الشمس" },
  },

  login: {
    title: "تسجيل الدخول",
    subtitle: "بلا كلمة مرور. نرسل إلى بريدك رابطًا يفتح لك حسابك.",
    email: "البريد الإلكتروني",
    submit: "أرسل لي الرابط",
    sending: "جارٍ الإرسال…",
    sentTitle: "افتح بريدك",
    sentTo: (email: string) => `أرسلنا الرابط إلى ${email}`,
    sentStep: "اضغط الرابط في الرسالة، وستعود إلى هنا وقد دخلت.",
    sentJunk: "لم تجدها؟ انظر في «غير المرغوب فيه» (Junk / Spam)؛ كثيرًا ما تستقر هناك.",
    sentPatience: "قد تتأخر دقيقة. لا داعي لطلب رابطٍ جديد.",
    sentOther: "استخدم بريدًا آخر",
  },

  onboarding: {
    eyebrow: "إعداد مطلوب · مرة واحدة",
    title: "أهلًا بك",
    subtitle:
      "قبل أن تسجّل أول فجر نحتاج أمرين: اسمًا يعرفك به أهل مجموعتك، والمدينة التي تصلي فيها.",
    why: "من مدينتك نحسب الأذان والشروق كل يوم، وهو الوقت الوحيد الذي يُقبل فيه التسجيل. لذلك لا يمكن تجاوز هذه الخطوة.",
    changeLater: "لن نسألك مرة أخرى، ولك أن تغيّره متى شئت من الإعدادات.",
    submit: "احفظ وابدأ",
  },

  picker: {
    nameLabel: "اسمك",
    nameHelp: "هذا ما يراه أهل مجموعتك في الترتيب.",
    whereLabel: "أين تصلي؟",
    whereHelp: "منها نحسب الفجر والشروق طوال السنة.",
    searchPlaceholder: "ابحث عن مدينتك…",
    searchAria: "ابحث عن مدينتك",
    useLocation: "📍 حدّد موقعي",
    customLocation: "موقع مخصّص",
    change: "تغيير",
    geoUnsupported: "متصفحك لا يستطيع تحديد موقعك. اختر مدينة من القائمة.",
    geoBlocked: "مُنِع الوصول إلى موقعك. اختر مدينة من القائمة.",
    previewTitle: "وقتك اليوم",
    previewFajr: "أذان الفجر",
    previewSunrise: "الشروق",
    previewNote: "التسجيل مفتوح بين هذين الوقتين فقط.",
    methodInUse: (m: string) => `بحساب ${m}`,
    required: "مطلوب",
    pickCityFirst: "اختر مدينتك أولًا.",
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
    MoonsightingCommittee: { label: "لجنة رؤية الهلال", note: "لخطوط العرض العالية" },
  },

  checkIn: {
    heading: "فجر اليوم",
    adhan: "الأذان",
    sunrise: "الشروق",
    beforeLabel: "بقي على الأذان",
    beforeHelp: (fajr: string) => `يُفتح التسجيل مع الأذان (${fajr}) ويُغلق مع الشروق.`,
    locked: "🔒 مغلق حتى الأذان",
    openLabel: "بقي على الشروق",
    openPrompt: (points: number, tier: string) => `سجّل الآن: ${arPoints(points)} — ${tier}`,
    congregation: "صليتها في جماعة",
    submit: "صليت الفجر",
    submitting: "لحظة…",
    loggedTitle: "تقبّل الله",
    loggedPoints: (n: number) => `+${arPoints(n)}`,
    loggedJamaah: "🕌 في جماعة",
    loggedStreak: (n: number) => `🔥 ${arDaysBare(n)} متتالية`,
    loggedClosed: (sunrise: string) => `أُغلق الوقت عند ${sunrise}. نلقاك غدًا.`,
    graceTitle: "استُخدم يوم سماح",
    graceBody: "تتابعك محفوظ. لا يُحسب صلاةً — والغد هو الذي يُحسب.",
    closedBody: (sunrise: string) => `طلعت الشمس عند ${sunrise}، وانتهى وقت الفجر.`,
    nextLabel: "بقي على فجر الغد",
    nextAt: (t: string) => `غدًا عند ${t}`,
    pts: "نقطة",
    ptsShort: (n: number) => arPointsBare(n),
    unavailable: "تعذّر تحديد الفجر والشروق لموقعك اليوم. جرّب مدينة أقرب من",
    unavailableLink: "الإعدادات",
  },

  grace: {
    badge: "يوم سماح",
    title: (date: string) => `فاتك فجر ${date}`,
    withStreak: (n: number) =>
      `يوم السماح يحفظ تتابعك البالغ ${arDaysBare(n)}. لا نقاط فيه ولا يُحسب صلاةً، لكنه يمنع أن تعود إلى الصفر بزلّةٍ واحدة.`,
    withoutStreak:
      "يوم السماح يسدّ الفجوة ليقوم عليها تتابعٌ جديد. لا نقاط فيه ولا يُحسب صلاةً.",
    submit: "استخدم يوم سماح",
    submitting: "لحظة…",
    remaining: (n: number) => `بقي ${n} من 2 هذا الشهر · يتجدّدان أول الشهر`,
  },

  stats: {
    currentStreak: "أيام متتالية",
    totalPoints: "مجموع النقاط",
    consistency: "الانتظام",
    longestStreak: "أطول تتابع",
    notLoggedToday: "لم تسجّل اليوم",
    daysPrayed: (n: number) => `صليت ${arDaysBare(n)}`,
  },

  badges: {
    heading: "الأوسمة",
    of: (a: number, b: number) => `${a} من ${b}`,
    empty: "لا أوسمة بعد. أولها يأتي مع أول فجرٍ تسجّله.",
    nextUp: "القريب منك",
    items: {
      first: { name: "أول فجر", requirement: "سجّل أول فجر" },
      streak7: { name: "أسبوع", requirement: "7 أيام متتالية" },
      streak30: { name: "شهر", requirement: "30 يومًا متتالية" },
      streak40: { name: "الأربعون", requirement: "40 يومًا متتالية" },
      streak100: { name: "المئة", requirement: "100 يوم متتالية" },
      early10: { name: "المبكّر", requirement: "10 مرات في وقت الاختيار" },
      early50: { name: "ملازم الفجر", requirement: "50 مرة في وقت الاختيار" },
      jamaah10: { name: "صاحب جماعة", requirement: "10 صلوات في جماعة" },
      jamaah40: { name: "أربعون جماعة", requirement: "40 صلاة في جماعة" },
    },
  },

  dashboard: {
    greeting: "السلام عليكم",
    yourGroups: "مجموعاتك",
    noGroups: "لا مجموعات بعد. أنشئ واحدة وشارك رابط الدعوة، أو أدخل رمزًا وصلك.",
    members: (n: number) => arMembers(n),
    youOwn: "أنت مؤسسها",
  },

  groupForms: {
    addMore: "أنشئ مجموعة أخرى أو انضم برمز",
    close: "إغلاق",
    createTab: "مجموعة جديدة",
    joinTab: "انضم برمز",
    nameLabel: "اسم المجموعة",
    namePlaceholder: "نادي الفجر",
    descLabel: "نبذة",
    descOptional: "(اختياري)",
    descPlaceholder: "أولاد العم، بلا أعذار",
    create: "أنشئ المجموعة",
    creating: "جارٍ الإنشاء…",
    codeLabel: "رمز الدعوة",
    join: "انضم",
    joining: "جارٍ الانضمام…",
  },

  group: {
    back: "← الرئيسية",
    membersMetric: "الأعضاء",
    groupStreak: "تتابع المجموعة",
    perfectDays: "أيام كاملة",
    inToday: "سجّلوا اليوم",
    perfectBanner: (n: number) =>
      `🔥 أدرككم الفجر جميعًا ${arDaysBare(n)} متتالية. لا تكن أنت من يقطعها.`,
    boardTitle: "من صلّى اليوم",
    boardToday: "",
    boardCount: (a: number, b: number) => `${a} من ${b}`,
    you: "(أنت)",
    anonymous: "عضو",
    stateOpen: "الوقت مفتوح",
    stateBefore: "لم يدخل الوقت",
    stateMissed: "فاته",
    stateUnknown: "لم يحدّد مدينته",
    stateGrace: "يوم سماح",
    stateLogged: "سجّل",
    leaderboard: "الترتيب",
    week: "هذا الأسبوع",
    month: "هذا الشهر",
    all: "منذ البداية",
    emptyPeriod: "لا تسجيلات في هذه المدة بعد.",
    days: (n: number) => arDays(n),
    atFirstLight: (n: number) => `${n} في وقت الاختيار`,
    rank: (n: number) => `المركز ${n}`,
    inviteTitle: "ادعُ من تحب",
    inviteHelp: "من يملك هذا الرابط يستطيع الانضمام. أرسله في مجموعة العائلة.",
    copyLink: "انسخ الرابط",
    copied: "نُسخ ✓",
    orCode: "أو أرسل الرمز",
    leave: "غادر المجموعة",
    leaving: "جارٍ المغادرة…",
    delete: "احذف المجموعة",
    deleting: "جارٍ الحذف…",
    deleteConfirm: (name: string) =>
      `تحذف «${name}»؟ سيفقد كل عضوٍ المجموعة وسجلّها، أما تتابعه الشخصي فلا يتأثر.`,
    deleteYes: "نعم، احذفها",
    cancel: "تراجع",
    fajrAt: (t: string) => `الفجر ${t}`,
  },

  join: {
    invited: "أنت مدعوّ",
    alreadyIn: (n: number) => `انضم ${arPeople(n)} قبلك`,
    explain:
      "بانضمامك تظهر تسجيلاتك للفجر في لوحة هذه المجموعة. ولن تستطيع التسجيل إلا بين الأذان والشروق في مدينتك — ولك أن تغادر متى شئت.",
    signInToJoin: "سجّل الدخول للانضمام",
    joinNow: "انضم إلى المجموعة",
    badTitle: "الدعوة غير صالحة",
    badBody: "قد يكون الرمز مكتوبًا خطأً، أو حُذفت المجموعة.",
    goHome: "إلى الرئيسية",
  },

  settings: {
    title: "الإعدادات",
    subtitle: "انتقلت إلى مدينةٍ أخرى؟ حدّثها هنا وستتبعها أوقاتك القادمة.",
    submit: "احفظ",
    recordTitle: "سجلّك",
    signedInAs: "الحساب",
    daysLogged: "أيام سجّلتها",
    graceUsed: "أيام السماح المستخدمة",
    permanence:
      "التسجيلات السابقة ثابتة، لا تُعدَّل ولا تُحذف، لا منك ولا من غيرك. وهذا وحده ما يجعل للترتيب قيمة. ولك يوما سماحٍ في الشهر، لا أكثر.",
  },

  errors: {
    notSignedIn: "لم تسجّل دخولك.",
    serverConfig: "تعذّر إتمام العملية لخللٍ في إعداد الخادم. التفاصيل في سجلّ الخادم.",
    invalidEmail: "اكتب بريدًا إلكترونيًا صحيحًا.",
    magicLinkSent: (email: string) => `أرسلنا الرابط إلى ${email}`,
    rateLimited: "أُرسلت رسائل كثيرة في وقتٍ قصير. انتظر قليلًا ثم أعد المحاولة.",
    emailSendFailed:
      "تعذّر إرسال رسالة الدخول. الخلل في إعداد البريد لا في حسابك — أعد المحاولة بعد قليل.",
    pickName: "اكتب اسمًا يعرفك به أهل مجموعتك.",
    pickCity: "اختر مدينتك، أو اسمح بتحديد موقعك.",
    pickMethod: "اختر طريقة حساب.",
    badTimezone: "لم نتعرّف على هذه المنطقة الزمنية. جرّب اختيار مدينة.",
    saved: "حُفظ.",
    setCityFirst: "حدّد مدينتك أولًا حتى نحسب لك الفجر.",
    beforeFajr: "لم يدخل وقت الفجر بعد. يُفتح التسجيل مع الأذان.",
    afterSunrise: "طلعت الشمس. لا يُسجَّل الفجر إلا بين الأذان والشروق.",
    alreadyLogged: "سجّلت فجر اليوم.",
    logged: (n: number) => `سُجِّل. +${arPoints(n)}`,
    dayAccounted: "هذا اليوم محسوبٌ أصلًا.",
    graceExhausted: "استنفدت يومَي السماح هذا الشهر. يتجدّدان أول الشهر.",
    graceApplied: "طُبِّق يوم السماح. تتابعك في أمان.",
    groupName: "سمِّ المجموعة (من حرف إلى 60).",
    groupCreateFailed: "تعذّر إنشاء المجموعة.",
    enterCode: "اكتب رمز الدعوة.",
    badCode: "لا توجد مجموعة بهذا الرمز.",
    missingGroup: "المجموعة غير محدّدة.",
    ownerCannotLeave: "أنت مؤسس هذه المجموعة. احذفها، أو انقل ملكيتها أولًا.",
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
    sentTitle: "Check your email",
    sentTo: (email: string) => `We sent a sign-in link to ${email}`,
    sentStep: "Open the message and tap the link — you'll land back here, signed in.",
    sentJunk: "Can't find it? Look in your Junk / Spam folder. That's usually where it is.",
    sentPatience: "It can take a minute to arrive. There's no need to request another link.",
    sentOther: "Use a different email",
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
    ptsShort: (n: number) => `${n} ${n === 1 ? "pt" : "pts"}`,
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
    addMore: "Create another group or join with a code",
    close: "Close",
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
    anonymous: "Member",
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
    serverConfig: "This could not be completed because of a server configuration problem. The details are in the server log.",
    invalidEmail: "Enter a valid email address.",
    magicLinkSent: (email: string) => `Check ${email} for your sign-in link.`,
    rateLimited: "Too many emails sent in a short time. Wait a few minutes and try again.",
    emailSendFailed:
      "The sign-in email could not be sent. This is a mail configuration problem, not your account — try again shortly.",
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
