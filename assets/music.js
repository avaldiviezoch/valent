/* Local MP3s; playback is unlocked by the first real interaction on mobile. */
(() => {
  'use strict';
  const map = document.body.dataset.page === 'map';
  const game = document.body.dataset.page === 'rescue';
  if (!map && !game) return;
  const track = new Audio(map ? 'one-piece-episode-1000-special-o.mp3' : '../familia/MUSICA%20DE%20VIDEO%20JUEGO.mp3');
  track.preload = 'metadata';track.loop = false;
  const level = map ? .10 : .18;
  track.volume = level;
  let context, attempted = false;
  function unlock() {
    try {
      if (!attempted) {
        attempted = true;
        const AudioEngine = window.AudioContext || window.webkitAudioContext;
        if (!AudioEngine) return;
        context = new AudioEngine();
        const source = context.createMediaElementSource(track), gain = context.createGain();
        gain.gain.value = level;source.connect(gain);gain.connect(context.destination);
        track.volume = 1;
      }
      if (context?.state === 'suspended') context.resume().catch(() => {});
    } catch { /* Native volume is the fallback for browsers without Web Audio. */ }
  }
  const music = {
    play(restart = false) {
      unlock();
      if (restart) track.currentTime = 0;
      return track.play().then(() => true).catch(() => false);
    },
    pause() { track.pause(); }
  };
  if (game) globalThis.ValentGameMusic = music;
  if (map) {
    const key = 'valent-map-music-played-v1';
    let played = false, pending = false;
    try { played = sessionStorage.getItem(key) === 'yes'; } catch {}
    async function begin() {
      if (played || pending || document.hidden) return;
      pending = true;
      if (await music.play()) {
        played = true;
        try { sessionStorage.setItem(key,'yes'); } catch {}
        document.removeEventListener('pointerdown',begin);
        document.removeEventListener('keydown',begin);
      }
      pending = false;
    }
    if (!played) {
      document.addEventListener('pointerdown',begin);
      document.addEventListener('keydown',begin);
      // A real tap/key unlocks audible playback on Safari and mobile Chrome.
      // The welcome button supplies that interaction without an extra control.
    }
  }
  document.addEventListener('visibilitychange',() => { if (document.hidden) music.pause(); });
  window.addEventListener('pagehide',() => music.pause());
})();
