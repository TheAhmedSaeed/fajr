import type { MethodId } from "./prayer";

export type City = {
  id: string;
  name: string;
  ar: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
  method: MethodId;
};

/**
 * A starter list so most people never have to think about coordinates.
 * `method` is the convention actually used by the local authority in each place.
 * Anyone not listed here can drop a pin instead — see the custom-location flow
 * in settings, which stores raw lat/lng plus the browser's IANA timezone.
 */
export const CITIES: City[] = [
  // Gulf
  { id: "riyadh", name: "Riyadh", ar: "الرياض", country: "Saudi Arabia", latitude: 24.7136, longitude: 46.6753, timezone: "Asia/Riyadh", method: "UmmAlQura" },
  { id: "jeddah", name: "Jeddah", ar: "جدة", country: "Saudi Arabia", latitude: 21.4858, longitude: 39.1925, timezone: "Asia/Riyadh", method: "UmmAlQura" },
  { id: "makkah", name: "Makkah", ar: "مكة المكرمة", country: "Saudi Arabia", latitude: 21.3891, longitude: 39.8579, timezone: "Asia/Riyadh", method: "UmmAlQura" },
  { id: "madinah", name: "Madinah", ar: "المدينة المنورة", country: "Saudi Arabia", latitude: 24.5247, longitude: 39.5692, timezone: "Asia/Riyadh", method: "UmmAlQura" },
  { id: "dammam", name: "Dammam", ar: "الدمام", country: "Saudi Arabia", latitude: 26.4207, longitude: 50.0888, timezone: "Asia/Riyadh", method: "UmmAlQura" },
  { id: "dubai", name: "Dubai", ar: "دبي", country: "UAE", latitude: 25.2048, longitude: 55.2708, timezone: "Asia/Dubai", method: "Dubai" },
  { id: "abudhabi", name: "Abu Dhabi", ar: "أبو ظبي", country: "UAE", latitude: 24.4539, longitude: 54.3773, timezone: "Asia/Dubai", method: "Dubai" },
  { id: "sharjah", name: "Sharjah", ar: "الشارقة", country: "UAE", latitude: 25.3463, longitude: 55.4209, timezone: "Asia/Dubai", method: "Dubai" },
  { id: "doha", name: "Doha", ar: "الدوحة", country: "Qatar", latitude: 25.2854, longitude: 51.5310, timezone: "Asia/Qatar", method: "Qatar" },
  { id: "kuwait", name: "Kuwait City", ar: "مدينة الكويت", country: "Kuwait", latitude: 29.3759, longitude: 47.9774, timezone: "Asia/Kuwait", method: "Kuwait" },
  { id: "manama", name: "Manama", ar: "المنامة", country: "Bahrain", latitude: 26.2285, longitude: 50.5860, timezone: "Asia/Bahrain", method: "UmmAlQura" },
  { id: "muscat", name: "Muscat", ar: "مسقط", country: "Oman", latitude: 23.5880, longitude: 58.3829, timezone: "Asia/Muscat", method: "UmmAlQura" },

  // Levant, Iraq, Yemen
  { id: "amman", name: "Amman", ar: "عمّان", country: "Jordan", latitude: 31.9454, longitude: 35.9284, timezone: "Asia/Amman", method: "Egyptian" },
  { id: "beirut", name: "Beirut", ar: "بيروت", country: "Lebanon", latitude: 33.8938, longitude: 35.5018, timezone: "Asia/Beirut", method: "Egyptian" },
  { id: "damascus", name: "Damascus", ar: "دمشق", country: "Syria", latitude: 33.5138, longitude: 36.2765, timezone: "Asia/Damascus", method: "Egyptian" },
  { id: "jerusalem", name: "Jerusalem", ar: "القدس", country: "Palestine", latitude: 31.7683, longitude: 35.2137, timezone: "Asia/Hebron", method: "Egyptian" },
  { id: "gaza", name: "Gaza", ar: "غزة", country: "Palestine", latitude: 31.5017, longitude: 34.4668, timezone: "Asia/Hebron", method: "Egyptian" },
  { id: "baghdad", name: "Baghdad", ar: "بغداد", country: "Iraq", latitude: 33.3152, longitude: 44.3661, timezone: "Asia/Baghdad", method: "Karachi" },
  { id: "erbil", name: "Erbil", ar: "أربيل", country: "Iraq", latitude: 36.1911, longitude: 44.0091, timezone: "Asia/Baghdad", method: "Karachi" },
  { id: "sanaa", name: "Sana'a", ar: "صنعاء", country: "Yemen", latitude: 15.3694, longitude: 44.1910, timezone: "Asia/Aden", method: "UmmAlQura" },

  // North Africa
  { id: "cairo", name: "Cairo", ar: "القاهرة", country: "Egypt", latitude: 30.0444, longitude: 31.2357, timezone: "Africa/Cairo", method: "Egyptian" },
  { id: "alexandria", name: "Alexandria", ar: "الإسكندرية", country: "Egypt", latitude: 31.2001, longitude: 29.9187, timezone: "Africa/Cairo", method: "Egyptian" },
  { id: "giza", name: "Giza", ar: "الجيزة", country: "Egypt", latitude: 30.0131, longitude: 31.2089, timezone: "Africa/Cairo", method: "Egyptian" },
  { id: "khartoum", name: "Khartoum", ar: "الخرطوم", country: "Sudan", latitude: 15.5007, longitude: 32.5599, timezone: "Africa/Khartoum", method: "Egyptian" },
  { id: "tripoli-ly", name: "Tripoli", ar: "طرابلس", country: "Libya", latitude: 32.8872, longitude: 13.1913, timezone: "Africa/Tripoli", method: "Egyptian" },
  { id: "tunis", name: "Tunis", ar: "تونس", country: "Tunisia", latitude: 36.8065, longitude: 10.1815, timezone: "Africa/Tunis", method: "MuslimWorldLeague" },
  { id: "algiers", name: "Algiers", ar: "الجزائر", country: "Algeria", latitude: 36.7538, longitude: 3.0588, timezone: "Africa/Algiers", method: "MuslimWorldLeague" },
  { id: "casablanca", name: "Casablanca", ar: "الدار البيضاء", country: "Morocco", latitude: 33.5731, longitude: -7.5898, timezone: "Africa/Casablanca", method: "MuslimWorldLeague" },
  { id: "rabat", name: "Rabat", ar: "الرباط", country: "Morocco", latitude: 34.0209, longitude: -6.8416, timezone: "Africa/Casablanca", method: "MuslimWorldLeague" },
  { id: "marrakesh", name: "Marrakesh", ar: "مراكش", country: "Morocco", latitude: 31.6295, longitude: -7.9811, timezone: "Africa/Casablanca", method: "MuslimWorldLeague" },
  { id: "nouakchott", name: "Nouakchott", ar: "نواكشوط", country: "Mauritania", latitude: 18.0735, longitude: -15.9582, timezone: "Africa/Nouakchott", method: "MuslimWorldLeague" },

  // Sub-Saharan Africa
  { id: "lagos", name: "Lagos", ar: "لاغوس", country: "Nigeria", latitude: 6.5244, longitude: 3.3792, timezone: "Africa/Lagos", method: "MuslimWorldLeague" },
  { id: "kano", name: "Kano", ar: "كانو", country: "Nigeria", latitude: 12.0022, longitude: 8.5920, timezone: "Africa/Lagos", method: "MuslimWorldLeague" },
  { id: "dakar", name: "Dakar", ar: "داكار", country: "Senegal", latitude: 14.7167, longitude: -17.4677, timezone: "Africa/Dakar", method: "MuslimWorldLeague" },
  { id: "nairobi", name: "Nairobi", ar: "نيروبي", country: "Kenya", latitude: -1.2864, longitude: 36.8172, timezone: "Africa/Nairobi", method: "MuslimWorldLeague" },
  { id: "mogadishu", name: "Mogadishu", ar: "مقديشو", country: "Somalia", latitude: 2.0469, longitude: 45.3182, timezone: "Africa/Mogadishu", method: "MuslimWorldLeague" },
  { id: "addis", name: "Addis Ababa", ar: "أديس أبابا", country: "Ethiopia", latitude: 9.0300, longitude: 38.7400, timezone: "Africa/Addis_Ababa", method: "MuslimWorldLeague" },
  { id: "capetown", name: "Cape Town", ar: "كيب تاون", country: "South Africa", latitude: -33.9249, longitude: 18.4241, timezone: "Africa/Johannesburg", method: "MuslimWorldLeague" },
  { id: "johannesburg", name: "Johannesburg", ar: "جوهانسبرغ", country: "South Africa", latitude: -26.2041, longitude: 28.0473, timezone: "Africa/Johannesburg", method: "MuslimWorldLeague" },

  // Türkiye, Iran, Central Asia
  { id: "istanbul", name: "Istanbul", ar: "إسطنبول", country: "Türkiye", latitude: 41.0082, longitude: 28.9784, timezone: "Europe/Istanbul", method: "Turkey" },
  { id: "ankara", name: "Ankara", ar: "أنقرة", country: "Türkiye", latitude: 39.9334, longitude: 32.8597, timezone: "Europe/Istanbul", method: "Turkey" },
  { id: "izmir", name: "Izmir", ar: "إزمير", country: "Türkiye", latitude: 38.4237, longitude: 27.1428, timezone: "Europe/Istanbul", method: "Turkey" },
  { id: "tehran", name: "Tehran", ar: "طهران", country: "Iran", latitude: 35.6892, longitude: 51.3890, timezone: "Asia/Tehran", method: "Tehran" },
  { id: "baku", name: "Baku", ar: "باكو", country: "Azerbaijan", latitude: 40.4093, longitude: 49.8671, timezone: "Asia/Baku", method: "Tehran" },
  { id: "tashkent", name: "Tashkent", ar: "طشقند", country: "Uzbekistan", latitude: 41.2995, longitude: 69.2401, timezone: "Asia/Tashkent", method: "MuslimWorldLeague" },
  { id: "almaty", name: "Almaty", ar: "ألماتي", country: "Kazakhstan", latitude: 43.2220, longitude: 76.8512, timezone: "Asia/Almaty", method: "MuslimWorldLeague" },

  // South Asia
  { id: "karachi", name: "Karachi", ar: "كراتشي", country: "Pakistan", latitude: 24.8607, longitude: 67.0011, timezone: "Asia/Karachi", method: "Karachi" },
  { id: "lahore", name: "Lahore", ar: "لاهور", country: "Pakistan", latitude: 31.5204, longitude: 74.3587, timezone: "Asia/Karachi", method: "Karachi" },
  { id: "islamabad", name: "Islamabad", ar: "إسلام آباد", country: "Pakistan", latitude: 33.6844, longitude: 73.0479, timezone: "Asia/Karachi", method: "Karachi" },
  { id: "delhi", name: "Delhi", ar: "دلهي", country: "India", latitude: 28.6139, longitude: 77.2090, timezone: "Asia/Kolkata", method: "Karachi" },
  { id: "mumbai", name: "Mumbai", ar: "مومباي", country: "India", latitude: 19.0760, longitude: 72.8777, timezone: "Asia/Kolkata", method: "Karachi" },
  { id: "hyderabad-in", name: "Hyderabad", ar: "حيدر آباد", country: "India", latitude: 17.3850, longitude: 78.4867, timezone: "Asia/Kolkata", method: "Karachi" },
  { id: "dhaka", name: "Dhaka", ar: "دكا", country: "Bangladesh", latitude: 23.8103, longitude: 90.4125, timezone: "Asia/Dhaka", method: "Karachi" },
  { id: "colombo", name: "Colombo", ar: "كولومبو", country: "Sri Lanka", latitude: 6.9271, longitude: 79.8612, timezone: "Asia/Colombo", method: "Karachi" },
  { id: "kabul", name: "Kabul", ar: "كابل", country: "Afghanistan", latitude: 34.5553, longitude: 69.2075, timezone: "Asia/Kabul", method: "Karachi" },

  // Southeast Asia
  { id: "jakarta", name: "Jakarta", ar: "جاكرتا", country: "Indonesia", latitude: -6.2088, longitude: 106.8456, timezone: "Asia/Jakarta", method: "Singapore" },
  { id: "surabaya", name: "Surabaya", ar: "سورابايا", country: "Indonesia", latitude: -7.2575, longitude: 112.7521, timezone: "Asia/Jakarta", method: "Singapore" },
  { id: "kualalumpur", name: "Kuala Lumpur", ar: "كوالالمبور", country: "Malaysia", latitude: 3.1390, longitude: 101.6869, timezone: "Asia/Kuala_Lumpur", method: "Singapore" },
  { id: "singapore", name: "Singapore", ar: "سنغافورة", country: "Singapore", latitude: 1.3521, longitude: 103.8198, timezone: "Asia/Singapore", method: "Singapore" },
  { id: "brunei", name: "Bandar Seri Begawan", ar: "بندر سري بكاوان", country: "Brunei", latitude: 4.9031, longitude: 114.9398, timezone: "Asia/Brunei", method: "Singapore" },
  { id: "manila", name: "Manila", ar: "مانيلا", country: "Philippines", latitude: 14.5995, longitude: 120.9842, timezone: "Asia/Manila", method: "Singapore" },

  // Europe
  { id: "london", name: "London", ar: "لندن", country: "United Kingdom", latitude: 51.5074, longitude: -0.1278, timezone: "Europe/London", method: "MoonsightingCommittee" },
  { id: "birmingham", name: "Birmingham", ar: "برمنغهام", country: "United Kingdom", latitude: 52.4862, longitude: -1.8904, timezone: "Europe/London", method: "MoonsightingCommittee" },
  { id: "manchester", name: "Manchester", ar: "مانشستر", country: "United Kingdom", latitude: 53.4808, longitude: -2.2426, timezone: "Europe/London", method: "MoonsightingCommittee" },
  { id: "paris", name: "Paris", ar: "باريس", country: "France", latitude: 48.8566, longitude: 2.3522, timezone: "Europe/Paris", method: "MuslimWorldLeague" },
  { id: "marseille", name: "Marseille", ar: "مرسيليا", country: "France", latitude: 43.2965, longitude: 5.3698, timezone: "Europe/Paris", method: "MuslimWorldLeague" },
  { id: "berlin", name: "Berlin", ar: "برلين", country: "Germany", latitude: 52.5200, longitude: 13.4050, timezone: "Europe/Berlin", method: "MuslimWorldLeague" },
  { id: "frankfurt", name: "Frankfurt", ar: "فرانكفورت", country: "Germany", latitude: 50.1109, longitude: 8.6821, timezone: "Europe/Berlin", method: "MuslimWorldLeague" },
  { id: "amsterdam", name: "Amsterdam", ar: "أمستردام", country: "Netherlands", latitude: 52.3676, longitude: 4.9041, timezone: "Europe/Amsterdam", method: "MuslimWorldLeague" },
  { id: "brussels", name: "Brussels", ar: "بروكسل", country: "Belgium", latitude: 50.8503, longitude: 4.3517, timezone: "Europe/Brussels", method: "MuslimWorldLeague" },
  { id: "stockholm", name: "Stockholm", ar: "ستوكهولم", country: "Sweden", latitude: 59.3293, longitude: 18.0686, timezone: "Europe/Stockholm", method: "MoonsightingCommittee" },
  { id: "oslo", name: "Oslo", ar: "أوسلو", country: "Norway", latitude: 59.9139, longitude: 10.7522, timezone: "Europe/Oslo", method: "MoonsightingCommittee" },
  { id: "copenhagen", name: "Copenhagen", ar: "كوبنهاغن", country: "Denmark", latitude: 55.6761, longitude: 12.5683, timezone: "Europe/Copenhagen", method: "MoonsightingCommittee" },
  { id: "madrid", name: "Madrid", ar: "مدريد", country: "Spain", latitude: 40.4168, longitude: -3.7038, timezone: "Europe/Madrid", method: "MuslimWorldLeague" },
  { id: "rome", name: "Rome", ar: "روما", country: "Italy", latitude: 41.9028, longitude: 12.4964, timezone: "Europe/Rome", method: "MuslimWorldLeague" },
  { id: "moscow", name: "Moscow", ar: "موسكو", country: "Russia", latitude: 55.7558, longitude: 37.6173, timezone: "Europe/Moscow", method: "MuslimWorldLeague" },

  // Americas & Oceania
  { id: "newyork", name: "New York", ar: "نيويورك", country: "United States", latitude: 40.7128, longitude: -74.0060, timezone: "America/New_York", method: "NorthAmerica" },
  { id: "chicago", name: "Chicago", ar: "شيكاغو", country: "United States", latitude: 41.8781, longitude: -87.6298, timezone: "America/Chicago", method: "NorthAmerica" },
  { id: "houston", name: "Houston", ar: "هيوستن", country: "United States", latitude: 29.7604, longitude: -95.3698, timezone: "America/Chicago", method: "NorthAmerica" },
  { id: "dearborn", name: "Dearborn", ar: "ديربورن", country: "United States", latitude: 42.3223, longitude: -83.1763, timezone: "America/Detroit", method: "NorthAmerica" },
  { id: "losangeles", name: "Los Angeles", ar: "لوس أنجلوس", country: "United States", latitude: 34.0522, longitude: -118.2437, timezone: "America/Los_Angeles", method: "NorthAmerica" },
  { id: "toronto", name: "Toronto", ar: "تورونتو", country: "Canada", latitude: 43.6532, longitude: -79.3832, timezone: "America/Toronto", method: "NorthAmerica" },
  { id: "montreal", name: "Montreal", ar: "مونتريال", country: "Canada", latitude: 45.5019, longitude: -73.5674, timezone: "America/Toronto", method: "NorthAmerica" },
  { id: "sydney", name: "Sydney", ar: "سيدني", country: "Australia", latitude: -33.8688, longitude: 151.2093, timezone: "Australia/Sydney", method: "MuslimWorldLeague" },
  { id: "melbourne", name: "Melbourne", ar: "ملبورن", country: "Australia", latitude: -37.8136, longitude: 144.9631, timezone: "Australia/Melbourne", method: "MuslimWorldLeague" },
];

export function findCity(id: string): City | undefined {
  return CITIES.find((c) => c.id === id);
}

export function searchCities(query: string, limit = 8): City[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return CITIES.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.country.toLowerCase().includes(q) ||
      c.ar.includes(query.trim()),
  ).slice(0, limit);
}

/** Best-effort city match for a browser-reported IANA timezone. */
export function cityForTimezone(tz: string): City | undefined {
  return CITIES.find((c) => c.timezone === tz);
}
