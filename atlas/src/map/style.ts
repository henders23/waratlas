import type { StyleSpecification } from 'maplibre-gl';

// A dark, antique relief: bathymetry in inks, land in umber and steppe tones,
// high ranges in pale stone. Everything else in the atlas is drawn on top of this.
export const TERRAIN_TILES = 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png';

export const WATER = '#0f2238';

export function baseStyle(): StyleSpecification {
  return {
    version: 8,
    projection: { type: 'globe' },
    sky: {
      'sky-color': '#060a14',
      'horizon-color': '#1c2740',
      'fog-color': '#0b1220',
      'sky-horizon-blend': 0.6,
      'horizon-fog-blend': 0.6,
      'fog-ground-blend': 0.9,
      'atmosphere-blend': ['interpolate', ['linear'], ['zoom'], 0, 1, 5, 0.8, 8, 0],
    },
    sources: {
      dem: {
        type: 'raster-dem',
        tiles: [TERRAIN_TILES],
        encoding: 'terrarium',
        tileSize: 256,
        maxzoom: 11,
        attribution:
          '<a href="https://registry.opendata.aws/terrain-tiles/">Terrain Tiles</a> (Mapzen, SRTM, ETOPO1, GMTED)',
      },
    },
    layers: [
      { id: 'background', type: 'background', paint: { 'background-color': '#081424' } },
      {
        id: 'relief',
        type: 'color-relief',
        source: 'dem',
        paint: {
          'color-relief-color': [
            'interpolate', ['linear'], ['elevation'],
            -9000, '#040a14',
            -5000, '#071224',
            -2500, '#0a1a30',
            -600, '#0d2139',
            -60, '#12304f',
            -1, '#173a5c',
            0, '#26291f',
            150, '#2e3123',
            500, '#3a3927',
            1000, '#4a452f',
            1600, '#5a5037',
            2400, '#6a5d45',
            3400, '#81766a',
            4600, '#a8a39b',
            6000, '#dcd8d0',
          ],
          'color-relief-opacity': 1,
        },
      },
      {
        id: 'hillshade',
        type: 'hillshade',
        source: 'dem',
        paint: {
          'hillshade-shadow-color': 'rgba(4,3,2,0.85)',
          'hillshade-highlight-color': 'rgba(255,240,210,0.22)',
          'hillshade-accent-color': 'rgba(0,0,0,0.3)',
          'hillshade-exaggeration': ['interpolate', ['linear'], ['zoom'], 1, 0.55, 6, 0.35],
          'hillshade-illumination-direction': 315,
        },
      },
    ],
  };
}
