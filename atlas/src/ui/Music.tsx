import { useEffect, useRef, useState } from 'react';

const KEY = 'atlas-music';

function loadPrefs(): { on: boolean; volume: number } {
  try {
    const p = JSON.parse(localStorage.getItem(KEY) ?? '');
    if (typeof p.on === 'boolean' && typeof p.volume === 'number') return { on: p.on, volume: Math.max(0, Math.min(1, p.volume)) };
  } catch {
    /* no stored preference, or storage blocked */
  }
  return { on: true, volume: 0.5 };
}

function savePrefs(p: { on: boolean; volume: number }) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* storage blocked: the setting just won't be remembered */
  }
}

/**
 * A looping soundtrack with an on/off button and a volume slider. Browsers only allow
 * sound after the visitor interacts with the page, so playback starts on the first
 * click, tap or key press (the intro's play button counts) and fades in.
 */
export function Music({ src, title }: { src: string; title: string }) {
  const [prefs, setPrefs] = useState(loadPrefs);
  const audio = useRef<HTMLAudioElement | null>(null);
  const fade = useRef(0);
  const prefsRef = useRef(prefs);
  prefsRef.current = prefs;

  // One audio element per atlas; released when the visitor leaves for another war.
  useEffect(() => {
    const a = new Audio(src);
    a.loop = true;
    a.preload = 'none';
    a.volume = 0;
    audio.current = a;
    const start = () => {
      if (!prefsRef.current.on || !a.paused) return;
      a.play().then(() => fadeTo(prefsRef.current.volume, 1500)).catch(() => {});
    };
    const events = ['pointerdown', 'keydown', 'touchstart'] as const;
    events.forEach((e) => window.addEventListener(e, start, { passive: true }));
    return () => {
      events.forEach((e) => window.removeEventListener(e, start));
      cancelAnimationFrame(fade.current);
      a.pause();
      a.removeAttribute('src');
      a.load();
      audio.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  function fadeTo(target: number, ms: number, then?: () => void) {
    const a = audio.current;
    if (!a) return;
    cancelAnimationFrame(fade.current);
    const from = a.volume;
    const t0 = performance.now();
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / ms);
      a.volume = from + (target - from) * k;
      if (k < 1) fade.current = requestAnimationFrame(step);
      else then?.();
    };
    fade.current = requestAnimationFrame(step);
  }

  const update = (p: { on: boolean; volume: number }) => {
    setPrefs(p);
    savePrefs(p);
  };

  const toggle = () => {
    const a = audio.current;
    const on = !prefs.on;
    update({ ...prefs, on });
    if (!a) return;
    if (on) a.play().then(() => fadeTo(prefs.volume, 800)).catch(() => {});
    else fadeTo(0, 400, () => a.pause());
  };

  const setVolume = (volume: number) => {
    update({ on: volume > 0 ? true : prefs.on, volume });
    const a = audio.current;
    if (!a) return;
    cancelAnimationFrame(fade.current);
    a.volume = volume;
    if (volume > 0 && a.paused) a.play().catch(() => {});
  };

  const label = prefs.on ? `Music on: ${title}` : 'Music off';
  return (
    <div className="music" title={label}>
      <button className={prefs.on ? 'on' : ''} onClick={toggle} aria-pressed={prefs.on} aria-label={prefs.on ? 'Turn music off' : 'Turn music on'}>
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
          <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor" />
          {prefs.on ? (
            <path d="M15.5 9a4.5 4.5 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          ) : (
            <path d="M16 9.5l5 5M21 9.5l-5 5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          )}
        </svg>
        <span className="music-label">Music</span>
      </button>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={prefs.on ? prefs.volume : 0}
        onChange={(e) => setVolume(Number(e.target.value))}
        aria-label="Music volume"
        style={{ '--v': `${(prefs.on ? prefs.volume : 0) * 100}%` } as React.CSSProperties}
      />
    </div>
  );
}
