export type Territory = { start: number; name: string; points: [number, number][]; tone?: 'gold' | 'rose' | 'sage' | 'blue' };

// Illustrative zones of Mongol control, deliberately generalized. These are not surveyed borders.
export const territory: Territory[] = [
  { start: 1206, name: 'Mongol heartland', points: [[87,49],[91,51],[101,51],[108,50],[116,48],[119,44],[116,41],[111,42],[106,40],[100,42],[96,43],[90,44]] },
  { start: 1209, name: 'Western Xia frontier', points: [[99,43],[106,43],[111,41],[109,37],[104,36],[99,38],[96,40]] },
  { start: 1215, name: 'Jin frontier', points: [[108,44],[117,47],[125,45],[128,41],[121,37],[115,35],[109,37]] },
  { start: 1218, name: 'Central Asian steppe', points: [[76,48],[84,50],[92,48],[99,44],[96,39],[89,37],[82,39],[73,42]] },
  { start: 1221, name: 'Khwarazmian lands', points: [[54,45],[66,47],[76,45],[82,41],[74,37],[69,34],[63,34],[59,30],[53,31],[47,36],[50,41]] },
  { start: 1234, name: 'Northern China', points: [[108,40],[115,41],[122,39],[123,35],[118,32],[111,32],[106,35]] },
  { start: 1242, name: 'Western steppe', points: [[34,57],[44,58],[54,55],[61,51],[65,47],[58,44],[50,45],[42,48],[32,49],[26,53]] },
  { start: 1242, name: 'Eastern Europe frontier', points: [[19,53],[28,56],[36,53],[34,48],[29,45],[24,46],[20,49]] },
  { start: 1258, name: 'Persia and Mesopotamia', points: [[45,40],[55,41],[63,37],[64,32],[57,28],[51,29],[45,32],[41,35]] },
  { start: 1259, name: 'Korean peninsula', points: [[124,41],[130,43],[132,39],[129,35],[126,35],[124,38]] },
  { start: 1279, name: 'Southern China', points: [[105,33],[113,34],[122,32],[123,25],[118,21],[111,20],[105,24],[101,28]] },
];

export const campaigns = [
  { year: 1206, from: [110, 47] as [number,number], to: [105, 43] as [number,number] },
  { year: 1215, from: [108, 45] as [number,number], to: [116.4, 39.9] as [number,number] },
  { year: 1220, from: [90, 45] as [number,number], to: [64.4, 39.7] as [number,number] },
  { year: 1221, from: [64, 40] as [number,number], to: [58.8, 36.3] as [number,number] },
  { year: 1237, from: [80, 49] as [number,number], to: [49, 55.8] as [number,number] },
  { year: 1241, from: [49, 55.8] as [number,number], to: [21, 52] as [number,number] },
  { year: 1258, from: [63, 38] as [number,number], to: [44.4, 33.3] as [number,number] },
  { year: 1279, from: [116, 40] as [number,number], to: [113, 23] as [number,number] },
];

export const successorRealms: (Territory & { end?: number })[] = [
  { start: 1260, name: 'Golden Horde', tone: 'blue', points: [[19,54],[30,57],[42,57],[53,55],[63,49],[64,44],[55,43],[42,46],[31,45],[22,48]] },
  { start: 1260, name: 'Chagatai Khanate', tone: 'sage', points: [[58,47],[68,47],[80,45],[88,40],[80,34],[69,34],[60,37],[55,42]] },
  { start: 1260, end: 1335, name: 'Ilkhanate', tone: 'rose', points: [[42,39],[51,42],[60,40],[65,35],[62,29],[55,27],[47,31],[41,35]] },
  { start: 1260, name: 'Yuan dynasty', tone: 'gold', points: [[88,52],[102,52],[115,49],[126,45],[129,38],[124,32],[112,31],[102,35],[91,38],[85,44]] },
  { start: 1279, end: 1368, name: 'Yuan China', tone: 'gold', points: [[103,34],[115,34],[123,31],[123,25],[117,20],[108,20],[100,25],[99,30]] },
];
