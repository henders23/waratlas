import type { EventImage } from '../data/schema';

const COMMONS = 'https://commons.wikimedia.org/wiki/';

export const commonsName = (image: EventImage) => encodeURIComponent(image.file.replace(/ /g, '_'));
export const commonsPage = (image: EventImage) => `${COMMONS}File:${commonsName(image)}`;
export const commonsSrc = (image: EventImage, width = 640) => `${COMMONS}Special:FilePath/${commonsName(image)}?width=${width}`;

// Pictures are fetched ahead of the playhead so a card can flick up the moment its
// event is reached. A picture that fails to load is remembered and never shown.
const status = new Map<string, 'loading' | 'ok' | 'failed'>();

export function preload(image: EventImage, width = 640) {
  const src = commonsSrc(image, width);
  if (status.has(src)) return;
  status.set(src, 'loading');
  const img = new Image();
  img.decoding = 'async';
  img.onload = () => status.set(src, 'ok');
  img.onerror = () => status.set(src, 'failed');
  img.src = src;
}

export function pictureReady(image: EventImage | undefined, width = 640) {
  return !!image && status.get(commonsSrc(image, width)) === 'ok';
}
