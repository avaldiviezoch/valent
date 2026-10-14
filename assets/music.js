/* Local MP3s; playback is unlocked by the first real interaction on mobile. */
(() => {
  'use strict';
  const map = document.body.dataset.page === 'map';
  const game = document.body.dataset.page === 'rescue';
  if (!map && !game) return;
  const track = new Audio(map ? 'one-piece-episode-1000-special-o.mp3' : '../familia/MUSICA%20DE%20VIDEO%20JUEGO.mp3');
  track.preload = 'metadata';track.loop = false;
  const level = map ? .20 : .09;
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
      if (context && context.state !== 'running' && context.state !== 'closed') return context.resume();
    } catch { /* Native volume is the fallback for browsers without Web Audio. */ }
  }
  const music = {
    play(restart = false) {
      const activated = unlock();
      if (restart) track.currentTime = 0;
      return Promise.all([track.play(),activated]).then(() => !context || context.state === 'running').catch(() => false);
    },
    pause() { track.pause(); }
  };
  if (game) globalThis.ValentGameMusic = music;
  if (map) {
    let played = false, pending = false;
    async function begin() {
      if (played || pending || document.hidden) return;
      pending = true;
      if (await music.play()) {
        played = true;
        document.removeEventListener('click',begin);
        document.removeEventListener('keydown',begin);
      }
      pending = false;
    }
    if (!played) {
      document.addEventListener('click',begin);
      document.addEventListener('keydown',begin);
      // A real tap/key unlocks audible playback on Safari and mobile Chrome.
      // The welcome button supplies that interaction without an extra control.
    }
  }
  document.addEventListener('visibilitychange',() => { if (document.hidden) music.pause(); });
  window.addEventListener('pagehide',() => music.pause());
})();
