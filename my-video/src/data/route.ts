// ─── Map SVG coordinate system ───────────────────────────────────────────────
// viewBox "0 0 1920 648"
// bounds: minLng=-2.400  maxLng=-2.275  lngRange=0.125
//         minLat=42.900  maxLat=42.972  latRange=0.072
// padX=80 padY=50 mapW=1760 mapH=548
//   x = 80 + (lng - (-2.400)) / 0.125 * 1760
//   y = 50 + (42.972 - lat) / 0.072 * 548
//
// ─── Elevation profile SVG coordinate system ─────────────────────────────────
// viewBox "0 0 1920 432"
// altMin=200  altMax=1620  altRange=1420
// padX=60 padY=30 plotW=1800 plotH=372
//   x = 60 + (km / 42.195) * 1800
//   y = 30 + (1620 - alt) / 1420 * 372

export interface Waypoint {
  id: number;
  name: string;
  km: number;
  alt: number;
  lat: number;
  lng: number;
  type: 'start' | 'checkpoint' | 'summit' | 'legendary' | 'iconic' | 'finish';
  color: string;
  segment: string;
  segmentKm: string;
  terrain: string;
  gradient: string;
  desnivel?: string;
  cutoff?: string | null;
  runnerTip?: string;
  spectatorTip?: string;
  icon: string;
  milestone?: string;
  vibe?: string;
  // Computed SVG positions
  mapX: number;
  mapY: number;
  profileX: number;
  profileY: number;
  cumDPlus: number;
  segmentPathLength: number; // SVG path length from previous WP to this WP
  cumPathLength: number;     // cumulative path length up to this WP
}

function mapCoords(lat: number, lng: number) {
  const x = 80 + (lng - (-2.400)) / 0.125 * 1760;
  const y = 50 + (42.972 - lat) / 0.072 * 548;
  return { x: Math.round(x), y: Math.round(y) };
}

function profileCoords(km: number, alt: number) {
  const x = 60 + (km / 42.195) * 1800;
  const y = 30 + (1620 - alt) / 1420 * 372;
  return { x: Math.round(x), y: Math.round(y) };
}

function dist(x1: number, y1: number, x2: number, y2: number) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

// ─── Raw waypoint data ───────────────────────────────────────────────────────
const RAW = [
  { id: 0,  name: 'Zegama — Salida',           km: 0,      alt: 296,  lat: 42.964, lng: -2.285, type: 'start'      as const, color: '#00D4FF', segment: 'SALIDA',               segmentKm: '0–3 km',      terrain: 'Calle + pista rápida',                         gradient: '+5% avg',                                            icon: '🏁', milestone: 'SALIDA — ZEGAMA', cutoff: null,
    runnerTip: 'Salida en grupo. No te dejes llevar por la euforia: los 3 primeros km son engañosamente rápidos. La carrera empieza en el km 20.',
    spectatorTip: 'La salida a las 09:00h convierte Zegama en festival. El pelotón completo en la calle principal es un espectáculo único.' },
  { id: 1,  name: 'Bixarte / Otzaurte',         km: 7,      alt: 652,  lat: 42.940, lng: -2.310, type: 'checkpoint' as const, color: '#FFB800', segment: 'PRIMERA SUBIDA',      segmentKm: '3–7 km',      terrain: 'Pista + senda hayedo',                         gradient: '+10% avg, picos 20%',                                icon: '🌲',
    runnerTip: 'Aquí empieza el juego. Si ya vas en zona roja en el km 5, la carrera será larguísima. Sube caminando si hace falta, conserva piernas.',
    spectatorTip: 'Bus lanzadera desde plaza Zegama (06:30h) hasta apeadero del tren. Desde Otzaurte se puede ir a pie a Sancti Spiritu: 5 km y 460 m D+.' },
  { id: 2,  name: 'Ultzama — Control km 8,5',   km: 8.5,    alt: 750,  lat: 42.934, lng: -2.318, type: 'checkpoint' as const, color: '#FFB800', segment: 'PRIMER CONTROL',      segmentKm: '7–8,5 km',    terrain: 'Senda boscosa',                                gradient: 'Ondulado',                                           icon: '⏱️', cutoff: '1h25 para populares',
    runnerTip: 'CORTE 1h25. Si llegas justo, recalcula tu ritmo desde ya. Después viene Aratz y no perdona.',
    spectatorTip: 'Punto accesible desde Otzaurte. Merendero de Beunde (km 10) es una opción tranquila con buenas vistas.' },
  { id: 3,  name: 'Aratz — 1.443 m',            km: 16.1,   alt: 1443, lat: 42.910, lng: -2.350, type: 'summit'     as const, color: '#FF4444', segment: 'PRIMER GRAN ASCENSO', segmentKm: '8,5–16,1 km', terrain: 'Senda técnica + pedrera + cresta',              gradient: '+15% avg — picos 30%',   desnivel: '+693 m en 7,6 km',   icon: '⛰️', milestone: 'PRIMERA GRAN CUMBRE', cutoff: 'Llegar con 10-20 min de margen',
    runnerTip: 'EL PRIMER FILTRO. El Aratz selecciona el campo. Ascenso progresivo pero sin descanso. A mitad de carrera ya llevas más desnivel que algunas ultras de 80 km. Bastones aquí marcan la diferencia.',
    spectatorTip: 'Requiere madrugada y buenas piernas. El acceso requiere subir desde Otzaurte. Recompensa: ver a los pro en pleno esfuerzo de alta montaña.' },
  { id: 4,  name: 'Sancti Spiritu — 969 m',     km: 20,     alt: 969,  lat: 42.932, lng: -2.362, type: 'legendary'  as const, color: '#FF6B00', segment: 'BAJADA TÉCNICA',      segmentKm: '16,1–20 km',  terrain: 'Bajada técnica, piedras húmedas, barro',        gradient: '-15% avg — Muy resbaladizo', desnivel: '-474 m en 3,9 km', icon: '🔥', milestone: 'KM 20 — ECUADOR INFERNAL', vibe: 'TOUR DE FRANCE EN MONTAÑA', cutoff: 'Corte estricto. Solo 15 min desde Aratz.',
    runnerTip: 'PELIGRO EN LA BAJADA. Las piedras húmedas y el barro convierten cada apoyo en una lotería. La carrera EMPIEZA en el km 20.',
    spectatorTip: '⭐ EL PUNTO MÁS ÉPICO. El santuario rodeado de hayedos concentra miles de aficionados. Bus desde Zegama (06:30h) + 6,3 km / 450 m D+. Llega antes de las 11:00h.' },
  { id: 5,  name: 'Túnel de San Adrián',         km: 22,     alt: 1000, lat: 42.925, lng: -2.370, type: 'iconic'     as const, color: '#9B59B6', segment: 'SUBIDA AL AIZKORRI',  segmentKm: '20–22 km',    terrain: 'Senda + hayedo + túnel medieval en roca',      gradient: '+5% suave, recuperación',                            icon: '🕳️', milestone: 'TÚNEL MEDIEVAL (s. XI)',
    runnerTip: 'El túnel medieval (siglo XI) es una pausa mental. Linternas encendidas incluso de día. Recompón el ritmo respiratorio antes del gran esfuerzo.',
    spectatorTip: 'Lugar icónico del Camino Vasco del Interior. Espectacular por la oscuridad y la luz al otro lado. Accesible desde Oñati/Arantzazu.' },
  { id: 6,  name: 'Aizkorri — 1.528 m',          km: 25,     alt: 1528, lat: 42.915, lng: -2.378, type: 'summit'     as const, color: '#E74C3C', segment: 'EL ASCENSO MÍTICO',  segmentKm: '22–25 km',    terrain: 'Hayedo + roca viva, pendientes al 30–40%',     gradient: '+528 m en 3 km — MURO',   desnivel: '+528 m',             icon: '🪓', milestone: 'EL TECHO DE LA CARRERA',
    runnerTip: 'LA SUBIDA MÁS FAMOSA. Esta es la cuesta que aparece en todos los vídeos: hayedo abierto, piernas en llamas, miles de personas gritando. No mires arriba. Un paso detrás de otro.',
    spectatorTip: 'Si puedes llegar aquí, la recompensa es única. Vista panorámica de todo el macizo. Los corredores pasan visiblemente al límite. Necesitas madrugar mucho.' },
  { id: 7,  name: 'Aitxuri / Aketegi — 1.551 m', km: 27,     alt: 1551, lat: 42.912, lng: -2.385, type: 'summit'     as const, color: '#C0392B', segment: 'CRESTERÍO',           segmentKm: '25–27 km',    terrain: 'Cresta expuesta, roca pulida, viento norte',   gradient: 'Cresterío técnico +/- 100 m',                        icon: '🏔️', milestone: 'PUNTO MÁS ALTO — TECHO DE EUSKADI',
    runnerTip: 'TECHO DE EUSKADI (1.551 m). Con viento del norte este tramo puede ser el más duro mentalmente. Rocas muy pulidas — resbaladizas. Cresta con cabeza.',
    spectatorTip: 'Solo para los más atrevidos. Requiere salida antes del amanecer. Impresionante panorámica.' },
  { id: 8,  name: 'Urbia — Campas',               km: 30,     alt: 1050, lat: 42.920, lng: -2.395, type: 'checkpoint' as const, color: '#27AE60', segment: 'BAJADA A URBIA',      segmentKm: '27–30 km',    terrain: 'Bajada técnica a campas de pasto',             gradient: '-501 m en 3 km',                                     icon: '🌿',
    runnerTip: 'La carrera EMPIEZA aquí. En el km 30, con piernas destrozadas, empieza la verdadera Zegama. Las campas de Urbia dan una falsa sensación de alivio.',
    spectatorTip: 'Zona accesible desde Oñati/Arantzazu. Amplia explanada donde los corredores llegan visiblemente al límite.' },
  { id: 9,  name: 'Andraitz — 1.434 m',           km: 33,     alt: 1434, lat: 42.935, lng: -2.340, type: 'checkpoint' as const, color: '#E67E22', segment: 'ÚLTIMO REPECHO',      segmentKm: '30–33 km',    terrain: 'Subida corta pero devastadora + senda rocosa', gradient: '+384 m — Las peores piernas del día',                 icon: '💀', milestone: 'ÚLTIMO REPECHO',
    runnerTip: 'EL ÚLTIMO JEFE FINAL. Con 30 km en las piernas, esta subida rompe a mucha gente. Si llegas con tiempo y piernas, ya es tuya.',
    spectatorTip: 'Menos concurrido que Sancti Spiritu pero con ambiente íntimo. Desde aquí se vuelve a la vertiente de Zegama.' },
  { id: 10, name: 'Itzubiaga / Moano',             km: 37,     alt: 600,  lat: 42.950, lng: -2.305, type: 'checkpoint' as const, color: '#3498DB', segment: 'DESCENSO FINAL',      segmentKm: '33–37 km',    terrain: 'Senda de descenso + pista forestal',           gradient: '-834 m en 4 km — velocidad máxima',                  icon: '⬇️',
    runnerTip: 'Aquí se decide el crono. Ritmos de 5:00–5:30/km son suficientes. No te rompas los cuádriceps. Piensa: 5 km para entrar en Zegama.',
    spectatorTip: 'Zona tranquila. La gente se concentra ya en el pueblo para la llegada.' },
  { id: 11, name: 'Zegama — Meta',                 km: 42.195, alt: 296,  lat: 42.964, lng: -2.285, type: 'finish'     as const, color: '#00D4FF', segment: 'ENTRADA A META',      segmentKm: '37–42,2 km',  terrain: 'Pista + calle urbana',                         gradient: 'Llano',                                              icon: '🏆', milestone: 'META — ZEGAMA ES ZEGAMA',
    runnerTip: 'El ambiente de la meta es indescriptible. El mismísimo Kilian Jornet esperó en meta al último participante. Disfruta cada zancada.',
    spectatorTip: '⭐ OBLIGATORIO. Los primeros llegan ~3h30 desde la salida (12:30–13:00h). El ambiente de llegada de populares es igual de emocionante.' },
];

// ─── Compute cumulative D+ ────────────────────────────────────────────────────
const cumDPlus: number[] = [0];
for (let i = 1; i < RAW.length; i++) {
  const diff = RAW[i].alt - RAW[i - 1].alt;
  cumDPlus.push(cumDPlus[i - 1] + (diff > 0 ? diff : 0));
}

// ─── Compute SVG map + profile coordinates ────────────────────────────────────
const mapPositions = RAW.map(w => mapCoords(w.lat, w.lng));
const profilePositions = RAW.map(w => profileCoords(w.km, w.alt));

// ─── Compute path lengths in map SVG space ───────────────────────────────────
const segLengths: number[] = [0]; // segLengths[i] = length of segment i-1→i
for (let i = 1; i < RAW.length; i++) {
  segLengths.push(Math.round(dist(mapPositions[i-1].x, mapPositions[i-1].y, mapPositions[i].x, mapPositions[i].y)));
}
const cumPathLengths = segLengths.reduce((acc, v, i) => {
  acc.push((acc[i - 1] ?? 0) + v);
  return acc;
}, [] as number[]);
export const TOTAL_PATH_LENGTH = cumPathLengths[cumPathLengths.length - 1];

// ─── Assemble WAYPOINTS ───────────────────────────────────────────────────────
export const WAYPOINTS: Waypoint[] = RAW.map((w, i) => ({
  ...w,
  mapX: mapPositions[i].x,
  mapY: mapPositions[i].y,
  profileX: profilePositions[i].x,
  profileY: profilePositions[i].y,
  cumDPlus: cumDPlus[i],
  segmentPathLength: segLengths[i],
  cumPathLength: cumPathLengths[i],
}));

// ─── SVG path string for the full route on the map ───────────────────────────
export const ROUTE_MAP_PATH = WAYPOINTS
  .map((w, i) => `${i === 0 ? 'M' : 'L'} ${w.mapX} ${w.mapY}`)
  .join(' ');

// ─── SVG path string for the elevation profile (filled area) ─────────────────
const profilePoints = WAYPOINTS.map(w => `${w.profileX} ${w.profileY}`).join(' L ');
const firstX = WAYPOINTS[0].profileX;
const lastX  = WAYPOINTS[WAYPOINTS.length - 1].profileX;
const bottomY = 402; // 30 + 372
export const ELEVATION_PATH = `M ${firstX} ${bottomY} L ${profilePoints} L ${lastX} ${bottomY} Z`;
export const ELEVATION_LINE  = `M ${profilePoints}`;

// ─── Race metadata ───────────────────────────────────────────────────────────
export const RACE_INFO = {
  name: 'Zegama-Aizkorri',
  subtitle: 'Mendi Maratoia',
  edition: '25ª Edición · 2026',
  date: '17 de mayo de 2026',
  distance: 42.195,
  dPlusTotal: 2750,
  dAccum: 5472,
  altMax: 1551,
  altMin: 296,
  timeLimit: '8 horas',
  runners: 585,
  recordHolder: 'Kilian Jornet',
  series: 'Golden Trail World Series',
  tagline: 'La maratón de montaña más legendaria del mundo',
};
