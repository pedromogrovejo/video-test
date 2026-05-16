/**
 * Zegama-Aizkorri Epic Audio Generator
 * Generates public/epic-zegama.wav using pure Node.js (no external deps).
 *
 * Usage:  node scripts/generate-audio.mjs
 *
 * Audio layers:
 *   1. DRUMS  — 140 BPM, kick/snare/hihat
 *   2. DRONE  — sine wave at 110 Hz (A2) with vibrato
 *   3. TENSION — triangle wave that builds on ascents
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SAMPLE_RATE  = 44100;
const DURATION_SEC = 122;       // slightly longer than 120s
const TOTAL_SAMPLES = SAMPLE_RATE * DURATION_SEC;
const BPM          = 140;
const BEAT_SAMPLES = Math.floor(SAMPLE_RATE * 60 / BPM); // ~18,900
const BAR_SAMPLES  = BEAT_SAMPLES * 4;

// ─── Noise buffer (for snare + hihat) ───────────────────────────────────────
const noise = new Float32Array(TOTAL_SAMPLES);
for (let i = 0; i < TOTAL_SAMPLES; i++) noise[i] = Math.random() * 2 - 1;

// ─── Output buffer (stereo interleaved float) ─────────────────────────────────
const out = new Float32Array(TOTAL_SAMPLES * 2);

// ─── Helper: add samples to output ──────────────────────────────────────────
function addSample(i, valueL, valueR = valueL) {
  if (i < 0 || i >= TOTAL_SAMPLES) return;
  out[i * 2]     += valueL;
  out[i * 2 + 1] += valueR;
}

// ─── Kick drum ───────────────────────────────────────────────────────────────
function kick(startSample, velocity = 1.0) {
  const duration = Math.floor(SAMPLE_RATE * 0.25);
  for (let i = 0; i < duration; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t * 20) * velocity;
    // Pitch falls from 140Hz to 45Hz
    const freq = 140 * Math.exp(-t * 18) + 45;
    const phase = 2 * Math.PI * freq * t;
    const sample = Math.sin(phase) * env * 0.85;
    addSample(startSample + i, sample);
  }
}

// ─── Snare ───────────────────────────────────────────────────────────────────
function snare(startSample, velocity = 0.7) {
  const duration = Math.floor(SAMPLE_RATE * 0.15);
  for (let i = 0; i < duration; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t * 30) * velocity;
    // Mix of tone (200Hz) + noise
    const tone  = Math.sin(2 * Math.PI * 200 * t) * 0.3;
    const noisy = noise[startSample + i] * 0.7;
    addSample(startSample + i, (tone + noisy) * env * 0.55);
  }
}

// ─── Hi-hat ──────────────────────────────────────────────────────────────────
function hihat(startSample, open = false, velocity = 0.4) {
  const duration = Math.floor(SAMPLE_RATE * (open ? 0.12 : 0.04));
  for (let i = 0; i < duration; i++) {
    const t = i / SAMPLE_RATE;
    const decay = open ? 8 : 40;
    const env = Math.exp(-t * decay) * velocity;
    const idx = (startSample + i) % noise.length;
    // High-pass: only use high freq noise
    const hf = noise[idx] - (noise[Math.max(0, idx - 3)] * 0.7);
    addSample(startSample + i, hf * env * 0.35);
  }
}

// ─── Sine drone ──────────────────────────────────────────────────────────────
function addDrone(startSample, endSample, freqHz = 110, ampL = 0.08, ampR = 0.08) {
  for (let i = startSample; i < Math.min(endSample, TOTAL_SAMPLES); i++) {
    const t = i / SAMPLE_RATE;
    // Vibrato: ±2 Hz at 0.2 Hz
    const vib = Math.sin(2 * Math.PI * 0.2 * t) * 2;
    const sample = Math.sin(2 * Math.PI * (freqHz + vib) * t) * ampL;
    // Slight stereo spread with a tiny phase offset
    const sampleR = Math.sin(2 * Math.PI * (freqHz + vib) * t + 0.05) * ampR;
    addSample(i, sample, sampleR);
  }
}

// ─── Tension oscillator (triangle wave) ──────────────────────────────────────
function addTension(startSample, endSample, freqHz = 220, amp = 0) {
  if (amp <= 0) return;
  for (let i = startSample; i < Math.min(endSample, TOTAL_SAMPLES); i++) {
    const t = i / SAMPLE_RATE;
    // Triangle wave approximation
    const phase = (t * freqHz) % 1;
    const tri = phase < 0.5 ? phase * 4 - 1 : 3 - phase * 4;
    addSample(i, tri * amp * 0.05);
  }
}

// ─── Zegama route events (in seconds from video start) ───────────────────────
// Intro: 0–5s | Flyby: 5–113s | Outro: 113–122s
const EVENTS = {
  intro:       { start: 0,   end: 5 },
  colombo:     { start: 5,   end: 14 },
  sigiriya:    { start: 14,  end: 27 },   // ascending
  aratz:       { start: 27,  end: 44 },   // SUMMIT - big buildup
  sancti:      { start: 44,  end: 57 },   // LEGENDARY
  tunel:       { start: 57,  end: 66 },
  aizkorri:    { start: 66,  end: 80 },   // SUMMIT
  aitxuri:     { start: 80,  end: 94 },   // SUMMIT - peak
  urbia:       { start: 94,  end: 103 },
  andraitz:    { start: 103, end: 112 },
  outro:       { start: 113, end: 122 },
};

// ─── DRUMS ───────────────────────────────────────────────────────────────────
console.log('Generating drums...');

const totalBars = Math.ceil(TOTAL_SAMPLES / BAR_SAMPLES);

for (let bar = 0; bar < totalBars; bar++) {
  const barStart = bar * BAR_SAMPLES;
  const timeSec  = barStart / SAMPLE_RATE;

  // Velocity ramp: quiet in intro, builds through the race, climax at Aizkorri
  let intensity = 0.2;
  if (timeSec >= 3) intensity = 0.5 + (timeSec - 3) / 80 * 0.4; // ramp 0.5→0.9
  if (timeSec >= EVENTS.aratz.start)  intensity = 0.85;
  if (timeSec >= EVENTS.sancti.start) intensity = 1.0;
  if (timeSec >= EVENTS.aizkorri.start) intensity = 1.0;
  if (timeSec >= EVENTS.outro.start)  intensity = Math.max(0, 1.0 - (timeSec - EVENTS.outro.start) / 9);

  // Kick on beats 1 and 3 (+ double kick before Sancti Spiritu buildup)
  kick(barStart,                           intensity);
  kick(barStart + BEAT_SAMPLES * 2,        intensity * 0.9);
  if (timeSec >= EVENTS.sancti.start - 4) {
    kick(barStart + BEAT_SAMPLES * 3 + Math.floor(BEAT_SAMPLES * 0.5), intensity * 0.5);
  }

  // Snare on beats 2 and 4
  snare(barStart + BEAT_SAMPLES,          intensity * 0.7);
  snare(barStart + BEAT_SAMPLES * 3,      intensity * 0.7);

  // Hi-hats on 8th notes
  for (let h = 0; h < 8; h++) {
    const open = h === 4 && timeSec >= EVENTS.aratz.start;
    hihat(barStart + Math.floor(BEAT_SAMPLES * h / 2), open, intensity * 0.5);
  }
}

// ─── DRONE ───────────────────────────────────────────────────────────────────
console.log('Generating drone...');
addDrone(0,                              TOTAL_SAMPLES,             110,  0.06, 0.06);
// Rises a semitone at each summit (×1.0595)
addDrone(EVENTS.aratz.start  * SAMPLE_RATE, EVENTS.sancti.start * SAMPLE_RATE, 116.5, 0.04, 0.04);
addDrone(EVENTS.aizkorri.start * SAMPLE_RATE, EVENTS.urbia.start * SAMPLE_RATE, 123.5, 0.05, 0.04);

// ─── TENSION LAYER ───────────────────────────────────────────────────────────
console.log('Generating tension...');
// Ascents: Bixarte→Aratz, Túnel→Aizkorri, Urbia→Andraitz
addTension(EVENTS.sigiriya.start * SAMPLE_RATE, EVENTS.aratz.end   * SAMPLE_RATE, 220, 0.6);
addTension(EVENTS.tunel.start    * SAMPLE_RATE, EVENTS.aitxuri.end * SAMPLE_RATE, 220, 0.9);
addTension(EVENTS.urbia.end      * SAMPLE_RATE, EVENTS.andraitz.end * SAMPLE_RATE, 220, 0.5);

// Sancti Spiritu chord (A minor: 220, 261, 330, 440 Hz)
for (const freq of [220, 261, 330, 440]) {
  const s = EVENTS.sancti.start * SAMPLE_RATE;
  const e = EVENTS.sancti.end   * SAMPLE_RATE;
  for (let i = s; i < Math.min(e, TOTAL_SAMPLES); i++) {
    const t = (i - s) / SAMPLE_RATE;
    const env = Math.min(1, t * 0.5) * Math.max(0, 1 - (i - e + 60) / 60);
    addSample(i, Math.sin(2 * Math.PI * freq * t) * env * 0.04);
  }
}

// ─── Normalize ───────────────────────────────────────────────────────────────
console.log('Normalizing...');
let peak = 0;
for (let i = 0; i < out.length; i++) peak = Math.max(peak, Math.abs(out[i]));
const normalFactor = peak > 0 ? 0.85 / peak : 1;
for (let i = 0; i < out.length; i++) out[i] *= normalFactor;

// ─── WAV writer ───────────────────────────────────────────────────────────────
function writeWav(buffer, sampleRate, channels, bitsPerSample, filePath) {
  const numSamples = buffer.length / channels;
  const dataSize   = numSamples * channels * (bitsPerSample / 8);
  const wavBuffer  = Buffer.alloc(44 + dataSize);

  // RIFF header
  wavBuffer.write('RIFF', 0);
  wavBuffer.writeUInt32LE(36 + dataSize, 4);
  wavBuffer.write('WAVE', 8);
  wavBuffer.write('fmt ', 12);
  wavBuffer.writeUInt32LE(16, 16);           // subchunk1Size
  wavBuffer.writeUInt16LE(1, 20);            // PCM
  wavBuffer.writeUInt16LE(channels, 22);
  wavBuffer.writeUInt32LE(sampleRate, 24);
  wavBuffer.writeUInt32LE(sampleRate * channels * (bitsPerSample / 8), 28);
  wavBuffer.writeUInt16LE(channels * (bitsPerSample / 8), 32);
  wavBuffer.writeUInt16LE(bitsPerSample, 34);
  wavBuffer.write('data', 36);
  wavBuffer.writeUInt32LE(dataSize, 40);

  // PCM data (16-bit signed)
  for (let i = 0; i < buffer.length; i++) {
    const val = Math.max(-1, Math.min(1, buffer[i]));
    wavBuffer.writeInt16LE(Math.round(val * 32767), 44 + i * 2);
  }

  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, wavBuffer);
  console.log(`✓ Written: ${filePath} (${(wavBuffer.length / 1024 / 1024).toFixed(1)} MB)`);
}

const outPath = join(__dirname, '..', 'public', 'epic-zegama.wav');
writeWav(out, SAMPLE_RATE, 2, 16, outPath);
console.log('🎵 Audio generation complete!');
console.log('Now uncomment the <Audio> tag in src/compositions/ZegamaVideo.tsx');
