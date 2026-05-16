export interface Activity {
  icon: string;
  text: string;
}

export interface CityData {
  id: string;
  name: string;
  emoji: string;
  dates: string;
  nights: number;
  themeColor: string;
  bgGradient: [string, string];
  price: 'cheap' | 'moderate' | 'expensive';
  priceEmoji: string;
  transport: string;
  activities: Activity[];
  featured?: string;
  mapPosition: { x: number; y: number };
}

export const CITIES: CityData[] = [
  {
    id: 'colombo',
    name: 'COLOMBO',
    emoji: '🏙️',
    dates: '20-21 marzo',
    nights: 1,
    themeColor: '#E85D04',
    bgGradient: ['#C44B03', '#E85D04'],
    price: 'moderate',
    priceEmoji: '🟡',
    transport: 'Uber / Taxi',
    activities: [
      { icon: '✈️', text: 'Llegada al aeropuerto (20:20h)' },
      { icon: '🏛️', text: 'Zona colonial' },
      { icon: '🍜', text: 'Gastronomía de calle' },
    ],
    mapPosition: { x: 17, y: 260 },
  },
  {
    id: 'sigiriya',
    name: 'SIGIRIYA',
    emoji: '🪨',
    dates: '21-23 marzo',
    nights: 2,
    themeColor: '#2D6A4F',
    bgGradient: ['#1B4332', '#2D6A4F'],
    price: 'cheap',
    priceEmoji: '🟢',
    transport: 'Tuk-tuk por zona rural',
    activities: [
      { icon: '🦁', text: 'Roca de Sigiriya (UNESCO)' },
      { icon: '⛰️', text: 'Pidurangala Rock' },
      { icon: '🦒', text: 'Safari en Minneriya' },
      { icon: '🚣', text: 'Aldea tradicional en barca' },
    ],
    mapPosition: { x: 92, y: 165 },
  },
  {
    id: 'kandy',
    name: 'KANDY',
    emoji: '🦷',
    dates: '23-24 marzo',
    nights: 1,
    themeColor: '#D4A017',
    bgGradient: ['#A07710', '#D4A017'],
    price: 'cheap',
    priceEmoji: '🟢',
    transport: 'A pie + Tuk-tuk',
    activities: [
      { icon: '🛕', text: 'Temple of the Tooth' },
      { icon: '🌅', text: 'Lago al atardecer' },
      { icon: '🌿', text: 'Jardín Botánico de Peradeniya' },
      { icon: '🧺', text: 'Mercado artesanal' },
    ],
    mapPosition: { x: 81, y: 225 },
  },
  {
    id: 'ella',
    name: 'ELLA',
    emoji: '🌿',
    dates: '24-27 marzo',
    nights: 3,
    themeColor: '#40916C',
    bgGradient: ['#1B4332', '#40916C'],
    price: 'cheap',
    priceEmoji: '🟢',
    transport: 'A pie + Tuk-tuk (pueblo pequeño)',
    activities: [
      { icon: '🚂', text: 'Tren panorámico Ambewella→Ella (15:00h)' },
      { icon: '🌉', text: 'Nine Arch Bridge' },
      { icon: '⛰️', text: "Little Adam's Peak" },
      { icon: '🍵', text: 'Plantaciones de té' },
      { icon: '💧', text: 'Cascadas y miradores' },
    ],
    featured: '🚂 El tren panorámico más icónico de Asia',
    mapPosition: { x: 117, y: 263 },
  },
  {
    id: 'yala',
    name: 'YALA',
    emoji: '🦁',
    dates: '27-29 marzo',
    nights: 2,
    themeColor: '#C68B2A',
    bgGradient: ['#7A4B10', '#C68B2A'],
    price: 'expensive',
    priceEmoji: '🔴',
    transport: 'Jeep safari + transfer privado',
    activities: [
      { icon: '🌅', text: 'Safari mañanero (28 marzo)' },
      { icon: '🐆', text: 'Leopardos, elefantes, cocodrilos' },
      { icon: '🐦', text: 'Birdwatching' },
      { icon: '🏨', text: 'Hotel eco-resort de lujo' },
      { icon: '🏊', text: 'Relax en piscina infinity' },
    ],
    mapPosition: { x: 158, y: 307 },
  },
  {
    id: 'mirissa',
    name: 'MIRISSA',
    emoji: '🌊',
    dates: '29-31 marzo',
    nights: 2,
    themeColor: '#0077B6',
    bgGradient: ['#023E8A', '#0077B6'],
    price: 'moderate',
    priceEmoji: '🟡',
    transport: 'A pie + Bici + Tuk-tuk',
    activities: [
      { icon: '🏄', text: 'Clase de surf en Midigama (30 marzo)' },
      { icon: '🌅', text: 'Coconut Hill al atardecer' },
      { icon: '🐋', text: 'Whale watching' },
      { icon: '🐢', text: 'Granja de tortugas' },
      { icon: '🍹', text: 'Bar secreto en la playa' },
    ],
    mapPosition: { x: 66, y: 346 },
  },
  {
    id: 'galle',
    name: 'GALLE',
    emoji: '🏰',
    dates: '31 mar – 1 abr',
    nights: 1,
    themeColor: '#8B7355',
    bgGradient: ['#5C4A30', '#8B7355'],
    price: 'moderate',
    priceEmoji: '🟡',
    transport: 'A pie + Tuk-tuk + Tren a Colombo',
    activities: [
      { icon: '🏛️', text: 'Fuerte de Galle (UNESCO)' },
      { icon: '🐢', text: 'Granja tortugas en Habaraduwa' },
      { icon: '🏡', text: 'Ciudad colonial portuguesa' },
      { icon: '☕', text: 'Cafés boutique en el Fuerte' },
    ],
    mapPosition: { x: 45, y: 338 },
  },
];

export const TRIP_INFO = {
  travelers: 'Pedro & Karyna',
  startDate: '20 marzo',
  endDate: '1 abril',
  year: '2024',
  days: 13,
  cities: 7,
  flight: 'Colombo → Nueva Delhi · 1 de abril',
};
