import { useEffect, useState } from 'react';
import { WARS, buildWar, type WarData } from './data/war';
import { setOutcomeColors } from './map/icons';
import { store } from './store';
import { Chooser } from './ui/Chooser';

type AppModule = typeof import('./App');
const loadApp = () => import('./App');

function warFromUrl(): string | null {
  const id = new URLSearchParams(location.search).get('war');
  if (id && WARS.some((w) => w.id === id && w.load)) return id;
  // Links shared before the atlas had a second war carry only a hash, and meant the Mongols.
  if (/^#(e|t)=/.test(location.hash)) return 'mongol';
  return null;
}

/** Warm the map engine and a war's data while the visitor is still choosing. */
export function prefetch(id: string) {
  void loadApp();
  void WARS.find((w) => w.id === id)?.load?.();
}

export function Root() {
  const [id, setId] = useState(warFromUrl);
  const [loaded, setLoaded] = useState<{ war: WarData; App: AppModule['App'] } | null>(null);

  useEffect(() => {
    const onPop = () => setId(warFromUrl());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    if (!id) {
      document.title = 'Atlas of Wars · Qing’s Workshop';
      return;
    }
    let live = true;
    Promise.all([WARS.find((w) => w.id === id)!.load!(), loadApp()]).then(([def, mod]) => {
      if (!live) return;
      const war = buildWar(def);
      setOutcomeColors(war.outcomeColors);
      store.set({ t: war.from, playing: false, speed: war.speeds[1], selected: null, hovered: null, headline: null, panel: null });
      setLoaded({ war, App: mod.App });
    });
    return () => {
      live = false;
    };
  }, [id]);

  const go = (next: string | null) => {
    history.pushState(null, '', next ? `${location.pathname}?war=${next}` : location.pathname);
    setId(next);
  };

  if (!id) return <Chooser onPick={go} onPrefetch={prefetch} />;
  if (!loaded || loaded.war.id !== id) return <div className="boot" aria-busy="true"><span>Loading the atlas…</span></div>;
  const { App, war } = loaded;
  return <App key={war.id} war={war} onSwitch={go} />;
}
