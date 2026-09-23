// Regions of Europe and the Mediterranean, 1792–1815, assembled from Natural Earth admin-1 units.
// Modern provinces are a proxy for the states, provinces and départements of the period;
// the atlas says so. Each member is 'ADM0' (every unit of a country), 'ADM0:Unit name',
// or { a: 'ADM0', n?: 'Unit name', r?: 'NE region', g?: 'NE geounit', not?: [names], clip?: bbox }.

export const THEATRE = [-12, 25, 45, 66];

const fr = (...n) => n.map((x) => `FRA:${x}`);
const names = (a, list) => list.split('|').map((n) => `${a}:${n}`);

// The Rhine through North Rhine-Westphalia, as boxes west of the river (Bonn, Cologne,
// Düsseldorf, Wesel). Everything else in the state is the right bank.
const LEFT_BANK_NRW = [
  [5, 50.3, 7.12, 50.8],
  [5, 50.8, 6.96, 51.12],
  [5, 51.12, 6.74, 51.55],
  [5, 51.55, 6.3, 52.6],
];
const RIGHT_BANK_NRW = [
  [7.12, 50.3, 10, 50.8],
  [6.96, 50.8, 10, 51.12],
  [6.74, 51.12, 10, 51.55],
  [6.3, 51.55, 10, 52.6],
];

export const REGIONS = [
  // ── France ──────────────────────────────────────────────────────────────
  { id: 'paris', name: 'Île-de-France & the Loire', members: [{ a: 'FRA', r: 'Île-de-France' }, { a: 'FRA', r: 'Centre-Val de Loire' }] },
  { id: 'north-france', name: 'Picardy, Artois & Flanders', members: [{ a: 'FRA', r: 'Hauts-de-France' }] },
  { id: 'normandy', name: 'Normandy', members: [{ a: 'FRA', r: 'Normandie' }] },
  { id: 'brittany', name: 'Brittany', members: [{ a: 'FRA', r: 'Bretagne' }] },
  { id: 'vendee', name: 'The Vendée', members: fr('Vendée', 'Maine-et-Loire', 'Loire-Atlantique', 'Deux-Sèvres') },
  {
    id: 'poitou', name: 'Maine, Poitou & Limousin',
    members: [...fr('Sarthe', 'Mayenne', 'Vienne', 'Charente', 'Charente-Maritime', 'Haute-Vienne', 'Creuse', 'Corrèze')],
  },
  { id: 'guyenne', name: 'Guyenne & Gascony', members: fr('Gironde', 'Dordogne', 'Lot-et-Garonne', 'Landes', 'Pyrénées-Atlantiques') },
  { id: 'languedoc', name: 'Languedoc & Roussillon', members: [{ a: 'FRA', r: 'Occitanie' }] },
  { id: 'provence', name: 'Provence', members: [{ a: 'FRA', r: "Provence-Alpes-Côte-d'Azur", not: ['Alpes-Maritimes'] }] },
  { id: 'nice', name: 'County of Nice', members: ['FRA:Alpes-Maritimes', 'MCO'] },
  { id: 'lyonnais', name: 'Lyonnais, Dauphiné & Auvergne', members: [{ a: 'FRA', r: 'Auvergne-Rhône-Alpes', not: ['Savoie', 'Haute-Savoie'] }] },
  { id: 'savoy', name: 'Savoy', members: fr('Savoie', 'Haute-Savoie') },
  { id: 'burgundy', name: 'Burgundy & Franche-Comté', members: [{ a: 'FRA', r: 'Bourgogne-Franche-Comté' }] },
  { id: 'champagne', name: 'Champagne & Lorraine', members: [{ a: 'FRA', r: 'Grand Est', not: ['Bas-Rhin', 'Haute-Rhin'] }] },
  { id: 'alsace', name: 'Alsace', members: fr('Bas-Rhin', 'Haute-Rhin') },
  { id: 'corsica', name: 'Corsica', members: [{ a: 'FRA', r: 'Corse' }] },

  // ── Low Countries ───────────────────────────────────────────────────────
  { id: 'belgium', name: 'Austrian Netherlands', members: ['BEL'] },
  { id: 'luxembourg', name: 'Luxembourg', members: ['LUX'] },
  { id: 'holland', name: 'Holland & Zeeland', members: names('NLD', 'Noord-Holland|Zuid-Holland|Utrecht|Zeeland|Flevoland') },
  { id: 'dutch-north', name: 'Friesland, Groningen & Gelderland', members: names('NLD', 'Groningen|Friesland|Drenthe|Overijssel|Gelderland') },
  { id: 'dutch-brabant', name: 'Dutch Brabant', members: names('NLD', 'Noord-Brabant|Limburg') },

  // ── Germany ─────────────────────────────────────────────────────────────
  {
    id: 'rhineland', name: 'Left bank of the Rhine',
    members: ['DEU:Rheinland-Pfalz', 'DEU:Saarland', ...LEFT_BANK_NRW.map((clip) => ({ a: 'DEU', n: 'Nordrhein-Westfalen', clip }))],
  },
  { id: 'westphalia', name: 'Westphalia & Berg', members: RIGHT_BANK_NRW.map((clip) => ({ a: 'DEU', n: 'Nordrhein-Westfalen', clip })) },
  { id: 'hanover', name: 'Hanover & Brunswick', members: [{ a: 'DEU', n: 'Niedersachsen', clip: [5, 47, 16, 52.75] }] },
  {
    id: 'north-sea', name: 'Oldenburg, Bremen & Hamburg',
    members: [{ a: 'DEU', n: 'Niedersachsen', clip: [5, 52.75, 16, 56] }, 'DEU:Bremen', 'DEU:Hamburg'],
  },
  { id: 'holstein', name: 'Schleswig & Holstein', members: ['DEU:Schleswig-Holstein'] },
  { id: 'mecklenburg', name: 'Mecklenburg', members: [{ a: 'DEU', n: 'Mecklenburg-Vorpommern', clip: [9, 50, 12.9, 56] }] },
  { id: 'swedish-pomerania', name: 'Swedish Pomerania', members: [{ a: 'DEU', n: 'Mecklenburg-Vorpommern', clip: [12.9, 50, 16, 56] }] },
  { id: 'brandenburg', name: 'Brandenburg', members: ['DEU:Brandenburg', 'DEU:Berlin', 'POL:Lubusz'] },
  { id: 'magdeburg', name: 'Magdeburg & the Altmark', members: ['DEU:Sachsen-Anhalt'] },
  { id: 'saxony', name: 'Saxony', members: ['DEU:Sachsen'] },
  { id: 'thuringia', name: 'Thuringia', members: ['DEU:Thüringen'] },
  { id: 'hesse', name: 'Hesse & Frankfurt', members: ['DEU:Hessen'] },
  { id: 'swabia', name: 'Württemberg & Baden', members: ['DEU:Baden-Württemberg'] },
  { id: 'franconia', name: 'Franconia', members: [{ a: 'DEU', n: 'Bayern', clip: [8, 49.05, 14, 51] }] },
  { id: 'bavaria', name: 'Bavaria', members: [{ a: 'DEU', n: 'Bayern', clip: [8, 46, 14, 49.05] }] },

  // ── Prussia and Poland ──────────────────────────────────────────────────
  { id: 'pomerania', name: 'Pomerania', members: ['POL:West Pomeranian'] },
  { id: 'west-prussia', name: 'West Prussia & Danzig', members: ['POL:Pomeranian', 'POL:Kuyavian-Pomeranian'] },
  { id: 'east-prussia', name: 'East Prussia', members: ['RUS:Kaliningrad', 'POL:Warmian-Masurian', 'LTU:Klaipedos'] },
  { id: 'greater-poland', name: 'Greater Poland', members: ['POL:Greater Poland'] },
  { id: 'silesia', name: 'Silesia', members: ['POL:Lower Silesian', 'POL:Opole', 'POL:Silesian'] },
  { id: 'masovia', name: 'Masovia', members: ['POL:Masovian', 'POL:Łódź'] },
  { id: 'lesser-poland', name: 'Lesser Poland', members: ['POL:Lesser Poland', 'POL:Świętokrzyskie'] },
  { id: 'lublin', name: 'Lublin', members: ['POL:Lublin'] },
  { id: 'bialystok', name: 'Białystok', members: ['POL:Podlachian'] },

  // ── Russia ──────────────────────────────────────────────────────────────
  { id: 'lithuania', name: 'Lithuania', members: [{ a: 'LTU', not: ['Klaipedos'] }, 'BLR:Grodno'] },
  { id: 'baltic', name: 'Courland, Livonia & Estonia', members: ['LVA', 'EST'] },
  { id: 'belarus', name: 'White Russia', members: names('BLR', 'Minsk|City of Minsk|Vitebsk|Mogilev|Gomel|Brest') },
  { id: 'smolensk', name: 'Smolensk', members: ['RUS:Smolensk', 'RUS:Bryansk'] },
  { id: 'moscow', name: 'Moscow', members: names('RUS', 'Moskva|Moskovskaya|Kaluga|Tula') },
  { id: 'petersburg', name: 'St Petersburg & Novgorod', members: names('RUS', 'Leningrad|City of St. Petersburg|Novgorod|Pskov') },
  { id: 'central-russia', name: 'Central Russia', members: names('RUS', "Tver'|Yaroslavl'|Vladimir|Ryazan'|Ivanovo|Orel|Kursk|Lipetsk|Tambov|Voronezh|Belgorod") },
  { id: 'right-bank-ukraine', name: 'Volhynia, Podolia & Kiev', members: names('UKR', "Volyn|Rivne|Zhytomyr|Khmel'nyts'kyy|Vinnytsya|Kiev|Kiev City|Cherkasy") },
  {
    id: 'new-russia', name: 'Little Russia & New Russia',
    members: names('UKR', "Chernihiv|Sumy|Poltava|Kharkiv|Kirovohrad|Mykolayiv|Odessa|Kherson|Dnipropetrovs'k|Zaporizhzhya"),
  },
  { id: 'finland', name: 'Finland', members: ['FIN'] },

  // ── Habsburg lands ──────────────────────────────────────────────────────
  { id: 'austria', name: 'Archduchy of Austria', members: names('AUT', 'Niederösterreich|Oberösterreich|Wien|Burgenland') },
  { id: 'inner-austria', name: 'Styria & Carinthia', members: names('AUT', 'Steiermark|Kärnten') },
  { id: 'tyrol', name: 'Tyrol', members: ['AUT:Tirol', 'AUT:Vorarlberg', { a: 'ITA', r: 'Trentino-Alto Adige' }] },
  { id: 'salzburg', name: 'Salzburg', members: ['AUT:Salzburg'] },
  { id: 'bohemia', name: 'Bohemia', members: [{ a: 'CZE', not: ['Olomoucký', 'Moravskoslezský', 'Jihomoravský', 'Zlínský'] }] },
  { id: 'moravia', name: 'Moravia', members: names('CZE', 'Olomoucký|Moravskoslezský|Jihomoravský|Zlínský') },
  { id: 'hungary', name: 'Kingdom of Hungary', members: ['HUN', 'SVK'] },
  {
    id: 'transylvania', name: 'Transylvania & the Banat',
    members: names('ROU', 'Cluj|Bistrita-Nasaud|Salaj|Maramures|Satu Mare|Bihor|Arad|Timis|Caras-Severin|Hunedoara|Alba|Sibiu|Brasov|Covasna|Harghita|Mures'),
  },
  { id: 'galicia', name: 'Galicia & Bukovina', members: ['POL:Subcarpathian', ...names('UKR', "L'viv|Ternopil'|Ivano-Frankivs'k|Chernivtsi|Transcarpathia")] },
  { id: 'carniola', name: 'Carniola, Gorizia & Istria', members: ['SVN', 'HRV:Istarska', { a: 'ITA', r: 'Friuli-Venezia Giulia', n: 'Trieste' }, { a: 'ITA', r: 'Friuli-Venezia Giulia', n: 'Gorizia' }] },
  { id: 'military-croatia', name: 'Croatian Military Frontier', members: names('HRV', 'Karlovacka|Licko-Senjska|Primorsko-Goranska|Sisacko-Moslavacka') },
  { id: 'slavonia', name: 'Croatia & Slavonia', members: [{ a: 'HRV', not: ['Karlovacka', 'Licko-Senjska', 'Primorsko-Goranska', 'Sisacko-Moslavacka', 'Istarska', 'Zadarska', 'Šibensko-Kninska', 'Splitsko-Dalmatinska', 'Dubrovacko-Neretvanska'] }] },
  { id: 'dalmatia', name: 'Dalmatia', members: [...names('HRV', 'Zadarska|Šibensko-Kninska|Splitsko-Dalmatinska|Dubrovacko-Neretvanska'), ...names('MNE', 'Kotor|Tivat|Herceg Novi')] },

  // ── Italy ───────────────────────────────────────────────────────────────
  { id: 'piedmont', name: 'Piedmont', members: [{ a: 'ITA', r: 'Piemonte' }, { a: 'ITA', r: "Valle d'Aosta" }] },
  { id: 'sardinia', name: 'Sardinia', members: [{ a: 'ITA', r: 'Sardegna' }] },
  { id: 'liguria', name: 'Genoa', members: [{ a: 'ITA', r: 'Liguria' }] },
  { id: 'lombardy', name: 'Lombardy', members: [{ a: 'ITA', r: 'Lombardia' }] },
  { id: 'venetia', name: 'Venetia & Friuli', members: [{ a: 'ITA', r: 'Veneto' }, { a: 'ITA', r: 'Friuli-Venezia Giulia', not: ['Trieste', 'Gorizia'] }] },
  { id: 'parma-modena', name: 'Parma & Modena', members: names('ITA', 'Piacenza|Parma|Reggio Emilia|Modena') },
  { id: 'legations', name: 'Bologna & the Romagna', members: names('ITA', 'Bologna|Ferrara|Ravenna|Forlì-Cesena|Rimini') },
  { id: 'tuscany', name: 'Tuscany', members: [{ a: 'ITA', r: 'Toscana' }] },
  { id: 'marches', name: 'The Marches', members: [{ a: 'ITA', r: 'Marche' }, 'SMR'] },
  { id: 'rome', name: 'Rome & Umbria', members: [{ a: 'ITA', r: 'Lazio' }, { a: 'ITA', r: 'Umbria' }, 'VAT'] },
  { id: 'naples', name: 'Naples', members: ['Campania', 'Abruzzo', 'Molise', 'Apulia', 'Basilicata'].map((r) => ({ a: 'ITA', r })) },
  { id: 'calabria', name: 'Calabria', members: [{ a: 'ITA', r: 'Calabria' }] },
  { id: 'sicily', name: 'Sicily', members: [{ a: 'ITA', r: 'Sicily' }] },
  { id: 'malta', name: 'Malta', members: ['MLT'] },

  // ── Switzerland ─────────────────────────────────────────────────────────
  { id: 'switzerland', name: 'Switzerland', members: [{ a: 'CHE', not: ['Genève', 'Valais'] }, 'LIE'] },
  { id: 'geneva', name: 'Geneva', members: ['CHE:Genève'] },
  { id: 'valais', name: 'Valais', members: ['CHE:Valais'] },

  // ── Iberia ──────────────────────────────────────────────────────────────
  { id: 'catalonia', name: 'Catalonia', members: [{ a: 'ESP', r: 'Cataluña' }, 'AND'] },
  { id: 'aragon', name: 'Aragon', members: [{ a: 'ESP', r: 'Aragón' }] },
  { id: 'basque', name: 'Navarre & the Basque provinces', members: [{ a: 'ESP', r: 'País Vasco' }, { a: 'ESP', r: 'Foral de Navarra' }, { a: 'ESP', r: 'La Rioja' }] },
  { id: 'asturias', name: 'Asturias & Santander', members: [{ a: 'ESP', r: 'Asturias' }, { a: 'ESP', r: 'Cantabria' }] },
  { id: 'galicia-es', name: 'Galicia', members: [{ a: 'ESP', r: 'Galicia' }] },
  { id: 'old-castile', name: 'León & Old Castile', members: [{ a: 'ESP', r: 'Castilla y León' }] },
  { id: 'new-castile', name: 'Madrid & New Castile', members: [{ a: 'ESP', r: 'Madrid' }, { a: 'ESP', r: 'Castilla-La Mancha' }] },
  { id: 'extremadura', name: 'Extremadura', members: [{ a: 'ESP', r: 'Extremadura' }] },
  { id: 'andalusia', name: 'Andalusia', members: [{ a: 'ESP', r: 'Andalucía' }] },
  { id: 'valencia', name: 'Valencia & Murcia', members: [{ a: 'ESP', r: 'Valenciana' }, { a: 'ESP', r: 'Murcia' }] },
  { id: 'balearics', name: 'Balearic Islands', members: [{ a: 'ESP', r: 'Islas Baleares' }] },
  { id: 'portugal-north', name: 'Northern Portugal', members: names('PRT', 'Viana do Castelo|Braga|Porto|Vila Real|Bragança|Aveiro|Viseu|Guarda|Coimbra|Castelo Branco|Leiria') },
  { id: 'portugal-south', name: 'Lisbon & the Alentejo', members: names('PRT', 'Lisboa|Setúbal|Santarém|Portalegre|Évora|Beja|Faro') },

  // ── British Isles and Scandinavia ───────────────────────────────────────
  { id: 'england', name: 'England & Wales', members: [{ a: 'GBR', g: 'England' }, { a: 'GBR', g: 'Wales' }, 'IMN'] },
  { id: 'scotland', name: 'Scotland', members: [{ a: 'GBR', g: 'Scotland' }] },
  { id: 'ireland', name: 'Ireland', members: ['IRL', { a: 'GBR', g: 'Northern Ireland' }] },
  { id: 'denmark', name: 'Denmark', members: ['DNK'] },
  { id: 'norway', name: 'Norway', members: [{ a: 'NOR', not: ['Svalbard', 'Bouvet Island'] }] },
  { id: 'sweden', name: 'Sweden', members: ['SWE'] },

  // ── Ottoman lands ───────────────────────────────────────────────────────
  { id: 'bosnia', name: 'Bosnia', members: ['BIH'] },
  { id: 'serbia', name: 'Serbia', members: ['SRB', 'KOS'] },
  { id: 'montenegro', name: 'Montenegro', members: [{ a: 'MNE', not: ['Kotor', 'Tivat', 'Herceg Novi'] }] },
  { id: 'albania', name: 'Albania & Epirus', members: ['ALB', 'GRC:Ipeiros'] },
  {
    id: 'rumelia', name: 'Rumelia',
    members: ['BGR', 'MKD', ...names('GRC', 'Dytiki Makedonia|Kentriki Makedonia|Anatoliki Makedonia kai Thraki|Ayion Oros'), ...names('TUR', 'Edirne|Kirklareli|Tekirdag|Istanbul')],
  },
  { id: 'greece', name: 'Morea & Greece', members: names('GRC', 'Thessalia|Stereá Elláda|Attiki|Peloponnisos|Dytiki Ellada|Notio Aigaio|Voreio Aigaio|Kriti') },
  { id: 'ionian', name: 'Ionian Islands', members: ['GRC:Ionioi Nisoi'] },
  { id: 'wallachia', name: 'Wallachia', members: names('ROU', 'Mehedinti|Dolj|Olt|Teleorman|Giurgiu|Calarasi|Ialomita|Ilfov|Bucharest|Arges|Dâmbovita|Prahova|Buzau|Braila|Gorj|Vâlcea|Constanta|Tulcea') },
  { id: 'moldavia', name: 'Moldavia', members: names('ROU', 'Suceava|Botosani|Iasi|Neamt|Bacau|Vaslui|Vrancea|Galati') },
  { id: 'bessarabia', name: 'Bessarabia', members: ['MDA'] },
  { id: 'anatolia', name: 'Anatolia', members: [{ a: 'TUR', not: ['Edirne', 'Kirklareli', 'Tekirdag', 'Istanbul'], clip: [25, 35, 45, 43] }] },
  { id: 'cyprus', name: 'Cyprus', members: ['CYP'] },
  { id: 'syria', name: 'Syria & Palestine', members: ['SYR', 'LBN', 'ISR', 'PSX', 'JOR'] },
  {
    id: 'lower-egypt', name: 'Lower Egypt',
    members: names('EGY', 'Al Qahirah|Al Jizah|Al Iskandariyah|Al Buhayrah|Kafr ash Shaykh|Al Gharbiyah|Al Minufiyah|Al Qalyubiyah|Ash Sharqiyah|Ad Daqahliyah|Dumyat|Bur Sa`id|Al Isma`iliyah|As Suways|Al Fayyum'),
  },
  { id: 'upper-egypt', name: 'Upper Egypt', members: names('EGY', 'Bani Suwayf|Al Minya|Asyut|Suhaj|Qina|Luxor|Aswan') },
];
