/**
 * Web Audio API synthesizer for realistic Chinese-style wind chimes, paper rustles, and gentle breezes.
 * Self-contained without external audio assets.
 * Features a dynamic atmospheric haunted background music score which sways in rhythm with wind intensity.
 */

let audioCtx: AudioContext | null = null;
let ambientStarted = false;
let ambientGainNode: GainNode | null = null;
let lfoNode: OscillatorNode | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx) {
      audioCtx = new AudioCtx();
    }
  }
  if (audioCtx) {
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    // Start background ambience track on first user gesture
    startBackgroundAmbience(audioCtx);
  }
  return audioCtx;
}

/**
 * Ensures audio is initialized and resumed on user clicking.
 */
export function ensureAudioStarted() {
  getAudioContext();
}

/**
 * Procedural atmospheric background score playing slow, haunting minor chords.
 * Self-modulating with lowpass filters and slow linear swells.
 */
export function startBackgroundAmbience(ctx: AudioContext) {
  if (ambientStarted) return;
  ambientStarted = true;

  // Create a master atmospheric ambient bus
  ambientGainNode = ctx.createGain();
  ambientGainNode.gain.setValueAtTime(0.045, ctx.currentTime); 
  ambientGainNode.connect(ctx.destination);

  // Slow LFO to construct natural ambient wave fluctuation
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.frequency.setValueAtTime(0.12, ctx.currentTime); // 0.12 Hz is ultra-slow and hypnotic
  lfoGain.gain.setValueAtTime(0.015, ctx.currentTime);
  
  lfo.connect(lfoGain);
  lfoGain.connect(ambientGainNode.gain);
  lfo.start();
  lfoNode = lfo;

  let barIdx = 0;
  function playNextBar() {
    if (!ctx || ctx.state === "closed" || !ambientGainNode) return;
    const now = ctx.currentTime;
    
    // Haunting, slightly dramatic cinematic minor chord progression
    const progression = [
      [73.42, 110.00, 174.61, 261.63], // D minor 9
      [98.00, 146.83, 233.08, 349.23], // G minor 9
      [110.00, 164.81, 196.00, 293.66], // A7sus4
      [87.31, 130.81, 174.61, 220.00]  // F Major 7
    ];
    
    const notes = progression[barIdx % progression.length];
    barIdx++;

    const barDuration = 9.5; // 9.5 seconds chord cycles

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const voiceGain = ctx.createGain();
      const lpFilter = ctx.createBiquadFilter();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now);
      // Detune voices for a rich, analog tape choral chorus shimmer
      osc.detune.setValueAtTime((Math.random() - 0.5) * 15, now);
      
      lpFilter.type = "lowpass";
      lpFilter.frequency.setValueAtTime(260 + idx * 48, now);
      lpFilter.Q.setValueAtTime(0.9, now);

      // Smooth attack swelling and long decay release
      voiceGain.gain.setValueAtTime(0, now);
      voiceGain.gain.linearRampToValueAtTime(0.024, now + 3.2); // soft swell
      voiceGain.gain.setValueAtTime(0.024, now + 5.8);
      voiceGain.gain.exponentialRampToValueAtTime(0.0001, now + barDuration - 0.3);

      osc.connect(lpFilter);
      lpFilter.connect(voiceGain);
      voiceGain.connect(ambientGainNode!);

      osc.start(now);
      osc.stop(now + barDuration);
    });

    // Occasional wind chime-infused sparkling notes during calm periods
    if (Math.random() > 0.45) {
      setTimeout(() => {
        if (ctx.state === "suspended") return;
        playWindChime(0.2 + Math.random() * 0.4);
      }, 4200);
    }

    setTimeout(playNextBar, (barDuration - 0.8) * 1000);
  }

  playNextBar();
}

/**
 * Dynamically sways the background music intensity and LFO rate based on Wind activity.
 * @param intensity Value from 0.0 to 1.0
 */
export function setAmbienceIntensity(intensity: number) {
  if (!ambientGainNode || !audioCtx) return;
  const now = audioCtx.currentTime;
  
  // Gain increases from 0.045 to 0.11 during high energy wind bursts
  const targetGain = 0.045 + intensity * 0.075;
  ambientGainNode.gain.cancelScheduledValues(now);
  ambientGainNode.gain.linearRampToValueAtTime(targetGain, now + 0.4);
  
  // Rate of volume wobble swells up when tags are swinging rapidly
  if (lfoNode) {
    lfoNode.frequency.cancelScheduledValues(now);
    lfoNode.frequency.linearRampToValueAtTime(0.12 + intensity * 1.5, now + 0.5);
  }
}

/**
 * Synthesizes a beautiful metallic wind chime strike.
 * Combines several high-frequency sine oscillators with exponential volume decays
 * to match the natural harmonic structure of resonant metal chimes.
 */
export function playWindChime(pitchModifier: number = 0) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  
  // Natural bell/chime frequencies
  const baseFreqs = [440, 554.37, 659.25, 880, 1056, 1318];
  
  // Pick 3 random frequencies and apply pitch modification
  const frequencies = baseFreqs
    .sort(() => 0.5 - Math.random())
    .slice(0, 3)
    .map(f => f * (1 + pitchModifier * 0.1));

  frequencies.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now);
    osc.detune.setValueAtTime((Math.random() - 0.5) * 15, now);

    // Initial chime strike volume
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.08 / frequencies.length, now + 0.01);
    
    // Long exponential decay (each frequency decays at a different rate)
    const decay = 1.0 + Math.random() * 2.5 + idx * 0.4;
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + decay);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + decay + 0.1);
  });
}

/**
 * Synthesizes paper rustling sounds using a high-pass filtered white noise burst.
 */
export function playPaperRustle() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const bufferSize = ctx.sampleRate * 0.6; // 0.6 seconds
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  // Generate white noise
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.setValueAtTime(1500, now);
  filter.Q.setValueAtTime(1, now);

  const gainNode = ctx.createGain();
  gainNode.gain.setValueAtTime(0, now);
  
  gainNode.gain.linearRampToValueAtTime(0.06, now + 0.05);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);

  noiseSource.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(ctx.destination);

  noiseSource.start(now);
  noiseSource.stop(now + 0.6);
}

/**
 * Synthesizes a gentle warm breeze sound.
 * Lowpass filtered white noise with a slow swell.
 */
export function playBreeze() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const bufferSize = ctx.sampleRate * 2.0; // 2.0 seconds
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(300, now);
  filter.frequency.exponentialRampToValueAtTime(800, now + 0.8);
  filter.frequency.exponentialRampToValueAtTime(250, now + 2.0);

  const gainNode = ctx.createGain();
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(0.08, now + 0.7);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 2.0);

  noiseSource.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(ctx.destination);

  noiseSource.start(now);
  noiseSource.stop(now + 2.0);
}

/**
 * State 1: Synthesizes the spectacular Red Lotus/Amaryllis Flower Blooming.
 * Combines a deep sub-bass resonance, multi-layered silk rustles, and high-pitch magical glowing shimmer.
 */
export function playFlowerBloom() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  // 1. Deep Sub-bass Resonant Drone (warm organic drone body at 55Hz sliding down)
  const droneOsc = ctx.createOscillator();
  const droneGain = ctx.createGain();
  const droneFilter = ctx.createBiquadFilter();

  droneOsc.type = "sine";
  droneOsc.frequency.setValueAtTime(55, now);
  droneOsc.frequency.linearRampToValueAtTime(46, now + 2.6);

  droneFilter.type = "lowpass";
  droneFilter.frequency.setValueAtTime(105, now);
  droneFilter.Q.setValueAtTime(3.0, now);

  droneGain.gain.setValueAtTime(0, now);
  droneGain.gain.linearRampToValueAtTime(0.24, now + 0.82); // high sub presence
  droneGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.9);

  droneOsc.connect(droneFilter);
  droneFilter.connect(droneGain);
  droneGain.connect(ctx.destination);

  droneOsc.start(now);
  droneOsc.stop(now + 3.0);

  // 2. Multi-layered heavy silk rustle layers (3 overlapping sources)
  for (let layer = 0; layer < 3; layer++) {
    const delay = layer * 0.22;
    const dur = 1.7 - layer * 0.22;
    const bufferSize = ctx.sampleRate * dur;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1.0 - i / bufferSize);
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;

    const lp = ctx.createBiquadFilter();
    lp.type = "bandpass";
    lp.frequency.setValueAtTime(1450 - layer * 180, now + delay);
    lp.frequency.exponentialRampToValueAtTime(300 + layer * 40, now + delay + dur);
    lp.Q.setValueAtTime(2.0, now + delay);

    const layerGain = ctx.createGain();
    layerGain.gain.setValueAtTime(0, now + delay);
    layerGain.gain.linearRampToValueAtTime(0.085, now + delay + 0.16);
    layerGain.gain.exponentialRampToValueAtTime(0.0001, now + delay + dur);

    noiseSource.connect(lp);
    lp.connect(layerGain);
    layerGain.connect(ctx.destination);

    noiseSource.start(now + delay);
    noiseSource.stop(now + delay + dur + 0.1);
  }

  // 3. Shimmering high-pitched magical sparkles (7 rapid panning frequencies)
  const sparkles = [1567.98, 1760.00, 2093.00, 2349.32, 2793.83, 3135.96, 3520.00];
  sparkles.forEach((freq, idx) => {
    const sparkDelay = 0.35 + idx * 0.13;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now + sparkDelay);
    osc.detune.setValueAtTime(Math.sin(idx * 5) * 12, now + sparkDelay);

    gainNode.gain.setValueAtTime(0, now + sparkDelay);
    gainNode.gain.linearRampToValueAtTime(0.013, now + sparkDelay + 0.025);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + sparkDelay + 0.32);

    if (ctx.createStereoPanner) {
      const p = ctx.createStereoPanner();
      p.pan.setValueAtTime((idx / (sparkles.length - 1)) * 1.6 - 0.8, now + sparkDelay);
      osc.connect(gainNode);
      gainNode.connect(p);
      p.connect(ctx.destination);
    } else {
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
    }

    osc.start(now + sparkDelay);
    osc.stop(now + sparkDelay + 0.35);
  });
}

/**
 * State 2: Synthesizes a rapid, dense clattering cascade of puppet cards/tags dropping.
 * Plays a sharp wooden strike/clack for the first tag, instantly followed by 27 staggered wood/paper clicks.
 */
export function playTagsCascade(count: number = 28) {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  // 1. Sharp FIRST heavy wood strike (Triangle wave with rapid pitch glide + scratch/crackle)
  const leadOsc = ctx.createOscillator();
  const leadGain = ctx.createGain();
  const leadFilter = ctx.createBiquadFilter();

  leadOsc.type = "triangle";
  leadOsc.frequency.setValueAtTime(145, now);
  leadOsc.frequency.exponentialRampToValueAtTime(45, now + 0.09);

  leadFilter.type = "bandpass";
  leadFilter.frequency.setValueAtTime(420, now);
  leadFilter.Q.setValueAtTime(3.2, now);

  leadGain.gain.setValueAtTime(0, now);
  leadGain.gain.linearRampToValueAtTime(0.24, now + 0.002);
  leadGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.13);

  leadOsc.connect(leadFilter);
  leadFilter.connect(leadGain);
  leadGain.connect(ctx.destination);

  leadOsc.start(now);
  leadOsc.stop(now + 0.16);

  // Lead parchment wood cracks overlay
  const crackSize = ctx.sampleRate * 0.12;
  const crackBuff = ctx.createBuffer(1, crackSize, ctx.sampleRate);
  const crackData = crackBuff.getChannelData(0);
  for (let i = 0; i < crackSize; i++) {
    crackData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.026));
  }
  const crackSrc = ctx.createBufferSource();
  crackSrc.buffer = crackBuff;
  const crackGain = ctx.createGain();
  crackGain.gain.setValueAtTime(0.19, now);
  crackGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);
  crackSrc.connect(crackGain);
  crackGain.connect(ctx.destination);
  crackSrc.start(now);

  // 2. Cascade remaining 27 card tiles with exponential delay clustering (wooden clack / card shuffle)
  for (let idx = 1; idx < count; idx++) {
    const delay = 0.04 + Math.pow(idx / (count - 1), 1.25) * 1.62;
    const dur = 0.06 + Math.random() * 0.08;

    // Pitch variation models dynamic tile shapes
    const cardFreq = 230 + (idx % 6) * 115 + Math.random() * 90;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(cardFreq, now + delay);
    osc.frequency.linearRampToValueAtTime(cardFreq * 0.72, now + delay + 0.022);

    filter.type = "bandpass";
    filter.frequency.setValueAtTime(cardFreq * 2.3, now + delay);
    filter.Q.setValueAtTime(4.4, now + delay);

    gainNode.gain.setValueAtTime(0, now + delay);
    // Taper peak gain down as density clusters to avoid digital saturation
    const gainMultiplier = 1.0 - (idx / count) * 0.44;
    gainNode.gain.linearRampToValueAtTime(0.044 * gainMultiplier, now + delay + 0.003);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + delay + dur);

    osc.connect(filter);
    filter.connect(gainNode);

    if (ctx.createStereoPanner) {
      const p = ctx.createStereoPanner();
      p.pan.setValueAtTime(Math.sin(idx * 1.28) * 0.75, now + delay);
      gainNode.connect(p);
      p.connect(ctx.destination);
    } else {
      gainNode.connect(ctx.destination);
    }

    osc.start(now + delay);
    osc.stop(now + delay + dur + 0.05);

    // Complement layer: individual parchment paper frictional click sounds
    const paperBuffSize = ctx.sampleRate * 0.045;
    const paperBuff = ctx.createBuffer(1, paperBuffSize, ctx.sampleRate);
    const paperData = paperBuff.getChannelData(0);
    for (let k = 0; k < paperBuffSize; k++) {
      paperData[k] = (Math.random() * 2 - 1) * (1.0 - k / paperBuffSize) * 0.14;
    }
    const paperSrc = ctx.createBufferSource();
    paperSrc.buffer = paperBuff;
    const paperFilter = ctx.createBiquadFilter();
    paperFilter.type = "highpass";
    paperFilter.frequency.setValueAtTime(1450 + Math.random() * 1100, now + delay);
    
    const paperGain = ctx.createGain();
    paperGain.gain.setValueAtTime(0, now + delay);
    paperGain.gain.linearRampToValueAtTime(0.033, now + delay + 0.002);
    paperGain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.038);

    paperSrc.connect(paperFilter);
    paperFilter.connect(paperGain);
    paperGain.connect(ctx.destination);
    
    paperSrc.start(now + delay);
  }
}

/**
 * State 3: Intros wind blowing through a valley and paper rustling.
 * Triggers the string-pad dynamic swelling and pan fluctuations.
 */
export function playWindScatter() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  // Swell environmental background chords
  setAmbienceIntensity(1.0);
  setTimeout(() => {
    setAmbienceIntensity(0.0);
  }, 4500);

  // Subtle metallic shimmer / digital click at the exact moment of spawn
  const shimmerOsc = ctx.createOscillator();
  const shimmerGain = ctx.createGain();
  shimmerOsc.type = "sine";
  shimmerOsc.frequency.setValueAtTime(2480, now);
  shimmerGain.gain.setValueAtTime(0, now);
  shimmerGain.gain.linearRampToValueAtTime(0.05, now + 0.005);
  shimmerGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
  shimmerOsc.connect(shimmerGain);
  shimmerGain.connect(ctx.destination);
  shimmerOsc.start(now);
  shimmerOsc.stop(now + 0.25);

  const clickOsc = ctx.createOscillator();
  const clickGain = ctx.createGain();
  clickOsc.type = "triangle";
  clickOsc.frequency.setValueAtTime(3800, now);
  clickOsc.frequency.exponentialRampToValueAtTime(1400, now + 0.15);
  clickGain.gain.setValueAtTime(0, now);
  clickGain.gain.linearRampToValueAtTime(0.04, now + 0.003);
  clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
  clickOsc.connect(clickGain);
  clickGain.connect(ctx.destination);
  clickOsc.start(now);
  clickOsc.stop(now + 0.2);

  // 1. Violent Wind Storm Valley Whooshing (3.6s white noise swept envelope)
  const whooshSize = ctx.sampleRate * 3.6;
  const whooshBuff = ctx.createBuffer(1, whooshSize, ctx.sampleRate);
  const data = whooshBuff.getChannelData(0);
  for (let i = 0; i < whooshSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const windSrc = ctx.createBufferSource();
  windSrc.buffer = whooshBuff;

  const windFilter = ctx.createBiquadFilter();
  windFilter.type = "lowpass";
  windFilter.frequency.setValueAtTime(215, now);
  windFilter.frequency.exponentialRampToValueAtTime(1500, now + 0.9); // violent peak
  windFilter.frequency.exponentialRampToValueAtTime(250, now + 3.3);

  const windGain = ctx.createGain();
  windGain.gain.setValueAtTime(0, now);
  windGain.gain.linearRampToValueAtTime(0.19, now + 0.7); // larger, more violent gale
  windGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.5);

  windSrc.connect(windFilter);
  windFilter.connect(windGain);
  windGain.connect(ctx.destination);

  windSrc.start(now);
  windSrc.stop(now + 3.6);

  // Layer a secondary high-frequency howling wind resonance
  const howlOsc = ctx.createOscillator();
  const howlFilter = ctx.createBiquadFilter();
  const howlGain = ctx.createGain();
  howlOsc.type = "sine";
  howlOsc.frequency.setValueAtTime(280, now);
  howlOsc.frequency.linearRampToValueAtTime(620, now + 0.8);
  howlOsc.frequency.linearRampToValueAtTime(320, now + 2.5);

  howlFilter.type = "bandpass";
  howlFilter.frequency.setValueAtTime(600, now);
  howlFilter.Q.setValueAtTime(4.5, now);

  howlGain.gain.setValueAtTime(0, now);
  howlGain.gain.linearRampToValueAtTime(0.065, now + 0.5);
  howlGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.0);

  howlOsc.connect(howlFilter);
  howlFilter.connect(howlGain);
  howlGain.connect(ctx.destination);
  howlOsc.start(now);
  howlOsc.stop(now + 3.1);

  // 2. High-speed rhythmic paper flutter flapping effects ("hundreds of pages peeling away" - increased density)
  const flapInterval = 32; // much faster, tighter interval of 32ms for dense flutter cascade
  const flapCount = 98; // massive count of rapid flutters
  for (let f = 0; f < flapCount; f++) {
    const flutterDelay = 0.05 + (f * flapInterval) / 1000 + Math.sin(f) * 0.008;
    const flapDuration = 0.045;

    const flapSize = ctx.sampleRate * flapDuration;
    const flapBuff = ctx.createBuffer(1, flapSize, ctx.sampleRate);
    const fd = flapBuff.getChannelData(0);
    for (let k = 0; k < flapSize; k++) {
      fd[k] = Math.random() * 2 - 1;
    }

    const flapSrc = ctx.createBufferSource();
    flapSrc.buffer = flapBuff;

    const flapFilter = ctx.createBiquadFilter();
    flapFilter.type = "highpass";
    flapFilter.frequency.setValueAtTime(1400 + Math.sin(f * 0.45) * 650, now + flutterDelay);

    const flapGain = ctx.createGain();
    flapGain.gain.setValueAtTime(0, now + flutterDelay);
    // Envelope rises to peak page peeling intensity early
    const progress = f / (flapCount - 1);
    const flapVolume = Math.sin(progress * Math.PI) * 0.055 * (1.0 - progress * 0.4); 
    flapGain.gain.linearRampToValueAtTime(flapVolume, now + flutterDelay + 0.008);
    flapGain.gain.exponentialRampToValueAtTime(0.0001, now + flutterDelay + flapDuration);

    flapSrc.connect(flapFilter);
    flapFilter.connect(flapGain);
    flapGain.connect(ctx.destination);

    flapSrc.start(now + flutterDelay);
    flapSrc.stop(now + flutterDelay + flapDuration + 0.01);
  }

  // Double down on random crystalline bell sways
  for (let c = 0; c < 5; c++) {
    const bellDelay = 0.2 + c * 0.78 + Math.random() * 0.25;
    setTimeout(() => {
      if (ctx.state === "suspended") return;
      playWindChime(Math.random() - 0.5);
    }, bellDelay * 1000);
  }
}

/**
 * State 4: Dampened wooden click on action press.
 */
export function playButtonClick() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  // 1. Tight triangle-wave click
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = "triangle";
  osc.frequency.setValueAtTime(115, now);
  
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(325, now);
  filter.Q.setValueAtTime(6.2, now);

  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(0.085, now + 0.001);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.032);

  osc.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.05);

  // 2. High impact tiny wood tick
  const tickOsc = ctx.createOscillator();
  const tickGain = ctx.createGain();
  tickOsc.type = "sine";
  tickOsc.frequency.setValueAtTime(1250, now);
  tickGain.gain.setValueAtTime(0, now);
  tickGain.gain.linearRampToValueAtTime(0.02, now + 0.0005);
  tickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.008);
  
  tickOsc.connect(tickGain);
  tickGain.connect(ctx.destination);
  
  tickOsc.start(now);
  tickOsc.stop(now + 0.02);
}

/**
 * State 4: Puppet line tightening on click Gather.
 * Sweeping thread swoosh representing cords sliding and securing tightly.
 */
export function playThreadTighten() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = "sine";
  osc.frequency.setValueAtTime(450, now);
  osc.frequency.exponentialRampToValueAtTime(1650, now + 0.23); // sweep upward tension

  filter.type = "bandpass";
  filter.frequency.setValueAtTime(580, now);
  filter.frequency.exponentialRampToValueAtTime(2450, now + 0.23);
  filter.Q.setValueAtTime(2.2, now);

  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(0.095, now + 0.04);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.26);

  osc.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.28);

  // High sweep sliding paper fiber fricative noise
  const stringSize = ctx.sampleRate * 0.23;
  const stringBuff = ctx.createBuffer(1, stringSize, ctx.sampleRate);
  const stringData = stringBuff.getChannelData(0);
  for (let i = 0; i < stringSize; i++) {
    stringData[i] = (Math.random() * 2 - 1) * (1.0 - i / stringSize);
  }
  
  const stringSrc = ctx.createBufferSource();
  stringSrc.buffer = stringBuff;
  
  const stringFilter = ctx.createBiquadFilter();
  stringFilter.type = "highpass";
  stringFilter.frequency.setValueAtTime(1850, now);
  
  const stringGain = ctx.createGain();
  stringGain.gain.setValueAtTime(0, now);
  stringGain.gain.linearRampToValueAtTime(0.036, now + 0.03);
  stringGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.23);

  stringSrc.connect(stringFilter);
  stringFilter.connect(stringGain);
  stringGain.connect(ctx.destination);
  
  stringSrc.start(now);
}

/**
 * Synthesizes a crisp, cinematic paper tearing & wood-cracking sound effects.
 * Fits the dramatic "tear away tag definitions" climax in the art board.
 */
export function playTearOrShatter() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  
  // 1. White noise tear burst
  const bufferSize = ctx.sampleRate * 0.45; // 0.45 seconds
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    const tearFluctuation = 1.0 + Math.sin(i * 0.05) * 0.4;
    data[i] = (Math.random() * 2 - 1) * tearFluctuation;
  }

  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(1200, now);
  filter.frequency.exponentialRampToValueAtTime(3200, now + 0.15);
  filter.frequency.exponentialRampToValueAtTime(800, now + 0.4);
  filter.Q.setValueAtTime(2.5, now);

  const gainNode = ctx.createGain();
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(0.12, now + 0.02);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

  noiseSource.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(ctx.destination);

  noiseSource.start(now);
  noiseSource.stop(now + 0.5);

  // 2. High-pitch chime / crack resonance
  const baseFreqs = [520, 680, 1150];
  baseFreqs.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    
    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.linearRampToValueAtTime(freq * 0.6, now + 0.18);

    oscGain.gain.setValueAtTime(0, now);
    oscGain.gain.linearRampToValueAtTime(0.07 / baseFreqs.length, now + 0.01);
    oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25 + idx * 0.08);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.4);
  });
}

const GUQIN_HARMONICS = [
  329.63, 392.00, 440.00, // E4, G4, A4
  523.25, 587.33, 659.25, 783.99, 880.00, // C5, D5, E5, G5, A5
  1046.50, 1174.66, 1318.51, 1567.98, 1760.00, // C6, D6, E6, G6, A6
  2093.00, 2349.32 // C7, D7
];

/**
 * Procedural synthesizer for exquisite Chinese Guqin harmonics (古琴泛音).
 * Plays clean, celestial resonant tones with warm wooden body decay.
 * If mouse speed (velocity) is high, plays a rapid cascade (fragment);
 * if slow, plays a single pure and delicate sound.
 */
export function playGuqinOvertone(velocity: number = 0.5) {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  // Let's decide how many notes to play based on velocity
  // velocity < 0.6: 1 node (single light touch representation)
  // velocity >= 0.6 and < 1.8: 2 notes (staggered dyad)
  // velocity >= 1.8: 3 or 4 notes cascading quickly (glorious roll/cascade fragment!)
  let notesToPlay = 1;
  let interNoteDelay = 0.07; // seconds

  if (velocity >= 1.9) {
    notesToPlay = 3 + Math.floor(Math.random() * 2); // 3 or 4 notes
    interNoteDelay = 0.05 + Math.random() * 0.04;
  } else if (velocity >= 0.7) {
    notesToPlay = 2;
    interNoteDelay = 0.07 + Math.random() * 0.05;
  }

  // We choose a random pentatonic starting position for this cascade fragment
  const startIdx = Math.floor(Math.random() * (GUQIN_HARMONICS.length - notesToPlay - 1));
  
  // Decide whether the cascade goes up or down
  const isAscending = Math.random() > 0.4;

  for (let i = 0; i < notesToPlay; i++) {
    const noteDelay = i * interNoteDelay;
    const noteTime = now + noteDelay;

    // Select pentatonic frequency
    const idx = isAscending ? (startIdx + i) : (startIdx + notesToPlay - 1 - i);
    const freq = GUQIN_HARMONICS[Math.max(0, Math.min(GUQIN_HARMONICS.length - 1, idx))];

    // Play a single pristine Guqin overtone at scheduled noteTime
    playSingleOvertoneNode(ctx, freq, noteTime, velocity);
  }
}

function playSingleOvertoneNode(ctx: AudioContext, freq: number, playTime: number, speed: number) {
  // 1. Core Sine Oscillator (Pure overtone tone)
  const osc1 = ctx.createOscillator();
  // 2. Secondary Sine Oscillator (Adding organic depth at octave harmonic)
  const osc2 = ctx.createOscillator();
  const gainNode = ctx.createGain();
  const bpFilter = ctx.createBiquadFilter();

  osc1.type = "sine";
  osc1.frequency.setValueAtTime(freq, playTime);
  // Delicate mechanical slide/vibrato: overtones hold flat (unlike stopped strings) but have tiny detune warmth
  osc1.detune.setValueAtTime((Math.random() - 0.5) * 8, playTime);

  osc2.type = "sine";
  osc2.frequency.setValueAtTime(freq * 2, playTime);
  osc2.detune.setValueAtTime((Math.random() - 0.5) * 12, playTime);

  // Filter to soften attack and contain metallic glaze
  bpFilter.type = "bandpass";
  bpFilter.frequency.setValueAtTime(freq * 1.5, playTime);
  bpFilter.Q.setValueAtTime(3.0, playTime);

  // Volume scale: moderate speed should be extremely clear and medium volume.
  // We limit the volume to prevent digital clipping/harshness, keeping it elegant.
  const maxGain = Math.min(0.065, 0.02 + speed * 0.015);

  // Attack-decay envelope envelope for crystalline Guqin overtone
  gainNode.gain.setValueAtTime(0, playTime);
  // Extremely quick attack but round (not clicking)
  gainNode.gain.linearRampToValueAtTime(maxGain, playTime + 0.008);
  // Moderate ring decrescendo
  gainNode.gain.exponentialRampToValueAtTime(maxGain * 0.3, playTime + 0.12);
  // Sweet lingering ring tail
  const decayTime = 1.2 + Math.random() * 1.4;
  gainNode.gain.exponentialRampToValueAtTime(0.0001, playTime + decayTime);

  // Soft high-passed click mimicking a nail pluck (木质弹拨质感)
  const pluckOsc = ctx.createOscillator();
  const pluckGain = ctx.createGain();
  pluckOsc.type = "triangle";
  pluckOsc.frequency.setValueAtTime(freq * 2.8, playTime);
  pluckOsc.frequency.exponentialRampToValueAtTime(80, playTime + 0.04);
  
  pluckGain.gain.setValueAtTime(0, playTime);
  pluckGain.gain.linearRampToValueAtTime(maxGain * 0.45, playTime + 0.002);
  pluckGain.gain.exponentialRampToValueAtTime(0.0001, playTime + 0.038);

  // Audio routing
  osc1.connect(gainNode);
  osc2.connect(gainNode);
  pluckOsc.connect(pluckGain);

  gainNode.connect(ctx.destination);
  pluckGain.connect(ctx.destination);

  osc1.start(playTime);
  osc2.start(playTime);
  pluckOsc.start(playTime);

  osc1.stop(playTime + decayTime + 0.1);
  osc2.stop(playTime + decayTime + 0.1);
  pluckOsc.stop(playTime + 0.05);
}
