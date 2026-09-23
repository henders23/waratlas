import type { City, Phase, Reign } from '../schema';

export const PHASES: Phase[] = [
  {
    id: 'july-crisis', title: 'Sarajevo and the July Crisis', from: 1914.49, to: 1914.59,
    story: 'On 28 June 1914 a Bosnian Serb student shoots the heir to the Habsburg throne in Sarajevo. Austria-Hungary, promised German backing, sends Serbia an ultimatum meant to be refused. In five weeks of mobilisations and miscalculation the alliances pull Russia, Germany, France and Britain into a general European war.',
    camera: { center: [15, 47], zoom: 4.3 },
  },
  {
    id: 'movement', title: 'The war of movement', from: 1914.59, to: 1914.96,
    story: 'Germany marches through Belgium to envelop France and is stopped on the Marne. In the east the Russians are crushed at Tannenberg but overrun Austrian Galicia, while Serbia twice throws back its invaders. By December the Western Front is a line of trenches from the Channel to Switzerland, and the Ottoman Empire has joined the war.',
    camera: { center: [10, 49], zoom: 4.2 },
  },
  {
    id: 'new-fronts', title: 'Stalemate and new fronts', from: 1914.96, to: 1915.75,
    story: 'The Allies try to break the deadlock elsewhere: at the Dardanelles, where the Gallipoli landings stall, and by bringing Italy in against Austria. Poison gas is used at Ypres. In the east, the breakthrough at Gorlice–Tarnów drives Russia out of Poland and Lithuania. The Ottoman government begins the deportation and murder of its Armenians.',
    camera: { center: [22, 46], zoom: 3.8 },
  },
  {
    id: 'balkans', title: 'Serbia falls, Gallipoli ends', from: 1915.75, to: 1916.13,
    story: 'Bulgaria joins the Central Powers and Serbia is overrun from three sides; its army and king retreat through the Albanian mountains in winter to the sea. An Allied army lands at Salonika too late to help. Gallipoli is evacuated, and a British force is besieged at Kut on the Tigris.',
    camera: { center: [22, 41.5], zoom: 4.8 },
  },
  {
    id: 'attrition', title: 'The year of attrition', from: 1916.13, to: 1917,
    story: 'Germany sets out to bleed France white at Verdun; the British and French answer on the Somme. Each battle costs hundreds of thousands of lives for a few miles. Brusilov’s offensive nearly breaks Austria-Hungary, Romania enters the war and is crushed, the fleets meet once at Jutland, and the Arab Revolt begins.',
    camera: { center: [12, 48], zoom: 4 },
  },
  {
    id: 'revolution', title: 'Revolution and mutiny', from: 1917, to: 1917.54,
    story: 'Germany gambles on unrestricted submarine warfare, and the United States declares war. Revolution in Petrograd topples the Tsar. The British take Baghdad. The French Nivelle offensive fails at the Chemin des Dames and whole divisions refuse to attack.',
    camera: { center: [16, 50], zoom: 3.7 },
  },
  {
    id: 'mud', title: 'Passchendaele, Caporetto, Brest-Litovsk', from: 1917.54, to: 1918.22,
    story: 'The British offensive at Ypres drowns in mud at Passchendaele. The Italians collapse at Caporetto and fall back to the Piave. Allenby takes Jerusalem. The Bolsheviks seize power, ask for peace and, at Brest-Litovsk in March 1918, give up Poland, the Baltic and Ukraine to German control.',
    camera: { center: [20, 50], zoom: 3.6 },
  },
  {
    id: 'kaiserschlacht', title: 'The last German gamble', from: 1918.22, to: 1918.54,
    story: 'With divisions freed from the east, Ludendorff strikes in the west before the Americans arrive in strength. Operation Michael tears open the British front, and by June the Germans are on the Marne again, 60 km from Paris. But each offensive gains ground it cannot hold, and the German army is exhausted.',
    camera: { center: [3, 49.8], zoom: 5.6 },
  },
  {
    id: 'hundred-days', title: 'The Hundred Days', from: 1918.54, to: 1918.86,
    story: 'The Allies counter-attack on the Marne, then break through at Amiens on the black day of the German army. The Hindenburg Line falls. Bulgaria gives up after Dobro Pole, the Ottoman armies collapse after Megiddo, and Austria-Hungary dissolves after Vittorio Veneto. Mutiny and revolution spread through Germany.',
    camera: { center: [16, 45], zoom: 3.7 },
  },
  {
    id: 'peace', title: 'Armistice and a new map', from: 1918.86, to: 1919.5,
    story: 'The guns stop at 11 a.m. on 11 November 1918. The Kaiser has fled and four empires are gone. New states fight over borders the peacemakers have not yet drawn, civil war rages across Russia and influenza kills millions. On 28 June 1919, five years to the day after Sarajevo, Germany signs the Treaty of Versailles.',
    camera: { center: [18, 49], zoom: 3.7 },
  },
];

// Germany's supreme army command (OHL), the war's centre of decision for the Central Powers.
export const REIGNS: Reign[] = [
  { name: 'Moltke', from: 1914.49, to: 1914.7 },
  { name: 'Falkenhayn', from: 1914.7, to: 1916.66 },
  { name: 'Hindenburg and Ludendorff', from: 1916.66, to: 1918.82 },
  { name: 'Hindenburg and Groener', from: 1918.82, to: 1919.5, regency: true },
];

export const CITIES: City[] = [
  { name: 'Paris', lon: 2.35, lat: 48.86, rank: 1 },
  { name: 'London', lon: -0.12, lat: 51.51, rank: 1 },
  { name: 'Berlin', lon: 13.4, lat: 52.52, rank: 1 },
  { name: 'Vienna', lon: 16.37, lat: 48.21, rank: 1 },
  { name: 'Petrograd', modern: 'St Petersburg', lon: 30.32, lat: 59.94, rank: 1 },
  { name: 'Moscow', lon: 37.62, lat: 55.75, rank: 1 },
  { name: 'Rome', lon: 12.48, lat: 41.9, rank: 1 },
  { name: 'Constantinople', modern: 'Istanbul', lon: 28.98, lat: 41.01, rank: 1 },
  { name: 'Brussels', lon: 4.35, lat: 50.85, rank: 2 },
  { name: 'Amsterdam', lon: 4.9, lat: 52.37, rank: 2 },
  { name: 'Budapest', lon: 19.04, lat: 47.5, rank: 2 },
  { name: 'Prague', lon: 14.42, lat: 50.09, rank: 2 },
  { name: 'Warsaw', lon: 21.01, lat: 52.23, rank: 2 },
  { name: 'Kiev', modern: 'Kyiv', lon: 30.52, lat: 50.45, rank: 2 },
  { name: 'Riga', lon: 24.11, lat: 56.95, rank: 2 },
  { name: 'Königsberg', modern: 'Kaliningrad', lon: 20.51, lat: 54.71, rank: 2 },
  { name: 'Munich', lon: 11.58, lat: 48.14, rank: 2 },
  { name: 'Hamburg', lon: 9.99, lat: 53.55, rank: 2 },
  { name: 'Belgrade', lon: 20.46, lat: 44.82, rank: 2 },
  { name: 'Sofia', lon: 23.32, lat: 42.7, rank: 2 },
  { name: 'Bucharest', lon: 26.1, lat: 44.43, rank: 2 },
  { name: 'Athens', lon: 23.73, lat: 37.98, rank: 2 },
  { name: 'Milan', lon: 9.19, lat: 45.46, rank: 2 },
  { name: 'Venice', lon: 12.33, lat: 45.44, rank: 2 },
  { name: 'Madrid', lon: -3.7, lat: 40.42, rank: 2 },
  { name: 'Lisbon', lon: -9.14, lat: 38.72, rank: 2 },
  { name: 'Copenhagen', lon: 12.57, lat: 55.68, rank: 2 },
  { name: 'Stockholm', lon: 18.07, lat: 59.33, rank: 2 },
  { name: 'Dublin', lon: -6.26, lat: 53.35, rank: 2 },
  { name: 'Cairo', lon: 31.24, lat: 30.04, rank: 2 },
  { name: 'Baghdad', lon: 44.37, lat: 33.31, rank: 2 },
  { name: 'Damascus', lon: 36.29, lat: 33.51, rank: 2 },
  { name: 'Ankara', lon: 32.85, lat: 39.93, rank: 2 },
  { name: 'Tiflis', modern: 'Tbilisi', lon: 44.79, lat: 41.72, rank: 2 },
  { name: 'Odessa', lon: 30.72, lat: 46.48, rank: 2 },
];
