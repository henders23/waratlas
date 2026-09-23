// Regions of Europe and the Middle East in 1914, assembled from Natural Earth admin-1 units
// along the 1914 frontiers where modern provinces allow (Alsace-Lorraine with Germany, Galicia
// with Austria-Hungary, Russian Poland apart from Prussian Poland). Member syntax as in
// scripts/regions/napoleonic.mjs.

export const THEATRE = [-12, 12, 62, 68];

const names = (a, list) => list.split('|').map((n) => `${a}:${n}`);
const reg = (a, ...rs) => rs.map((r) => ({ a, r }));

export const REGIONS = [
  // ── France and the Low Countries ────────────────────────────────────────
  { id: 'paris', name: 'Paris & the Loire', members: reg('FRA', 'Île-de-France', 'Centre-Val de Loire') },
  { id: 'lille', name: 'Lille & French Flanders', members: ['FRA:Nord'] },
  { id: 'artois', name: 'Artois & the Somme', members: ['FRA:Pas-de-Calais', 'FRA:Somme'] },
  { id: 'aisne', name: 'Aisne & Oise', members: ['FRA:Aisne', 'FRA:Oise'] },
  { id: 'ardennes', name: 'French Ardennes', members: ['FRA:Ardennes'] },
  { id: 'champagne', name: 'Champagne', members: ['FRA:Marne', 'FRA:Aube', 'FRA:Haute-Marne'] },
  { id: 'verdun', name: 'Verdun & French Lorraine', members: ['FRA:Meuse', 'FRA:Meurthe-et-Moselle', 'FRA:Vosges'] },
  { id: 'western-france', name: 'Western France', members: reg('FRA', 'Normandie', 'Bretagne', 'Pays de la Loire', 'Nouvelle-Aquitaine') },
  { id: 'southern-france', name: 'Southern France', members: reg('FRA', 'Occitanie', "Provence-Alpes-Côte-d'Azur", 'Auvergne-Rhône-Alpes', 'Bourgogne-Franche-Comté', 'Corse') },
  { id: 'alsace-lorraine', name: 'Alsace-Lorraine', members: ['FRA:Bas-Rhin', 'FRA:Haute-Rhin', 'FRA:Moselle'] },
  { id: 'flanders', name: 'West Flanders', members: ['BEL:West Flanders'] },
  { id: 'belgium', name: 'Belgium', members: [{ a: 'BEL', not: ['West Flanders'] }] },
  { id: 'luxembourg', name: 'Luxembourg', members: ['LUX'] },
  { id: 'netherlands', name: 'Netherlands', members: [{ a: 'NLD', not: ['Bonaire', 'St. Eustatius', 'Saba'] }] },

  // ── British Isles, Scandinavia and the western neutrals ─────────────────
  { id: 'england', name: 'England & Wales', members: [{ a: 'GBR', g: 'England' }, { a: 'GBR', g: 'Wales' }, 'IMN'] },
  { id: 'scotland', name: 'Scotland', members: [{ a: 'GBR', g: 'Scotland' }] },
  { id: 'ireland', name: 'Ireland', members: ['IRL', { a: 'GBR', g: 'Northern Ireland' }] },
  { id: 'denmark', name: 'Denmark', members: ['DNK'] },
  { id: 'norway', name: 'Norway', members: [{ a: 'NOR', not: ['Svalbard', 'Bouvet Island'] }] },
  { id: 'sweden', name: 'Sweden', members: ['SWE'] },
  { id: 'switzerland', name: 'Switzerland', members: ['CHE', 'LIE'] },
  { id: 'spain', name: 'Spain', members: [{ a: 'ESP', not: ['Ceuta', 'Melilla', 'Santa Cruz de Tenerife', 'Las Palmas'] }, 'AND'] },
  { id: 'portugal', name: 'Portugal', members: [{ a: 'PRT', not: ['Madeira', 'Azores'] }] },

  // ── The German Empire ───────────────────────────────────────────────────
  { id: 'rhineland', name: 'Rhineland & Westphalia', members: ['DEU:Rheinland-Pfalz', 'DEU:Saarland', 'DEU:Nordrhein-Westfalen'] },
  { id: 'north-germany', name: 'Hanover, Hamburg & Holstein', members: names('DEU', 'Niedersachsen|Bremen|Hamburg|Schleswig-Holstein') },
  { id: 'brandenburg', name: 'Berlin & Brandenburg', members: names('DEU', 'Brandenburg|Berlin|Sachsen-Anhalt|Mecklenburg-Vorpommern') },
  { id: 'saxony', name: 'Saxony & Thuringia', members: ['DEU:Sachsen', 'DEU:Thüringen'] },
  { id: 'southwest-germany', name: 'Baden, Württemberg & Hesse', members: ['DEU:Baden-Württemberg', 'DEU:Hessen'] },
  { id: 'bavaria', name: 'Bavaria', members: ['DEU:Bayern'] },
  { id: 'pomerania', name: 'Pomerania', members: ['POL:West Pomeranian'] },
  { id: 'west-prussia', name: 'West Prussia', members: ['POL:Pomeranian', 'POL:Kuyavian-Pomeranian'] },
  { id: 'east-prussia', name: 'East Prussia', members: ['RUS:Kaliningrad', 'POL:Warmian-Masurian', 'LTU:Klaipedos'] },
  { id: 'posen', name: 'Posen', members: ['POL:Greater Poland', 'POL:Lubusz'] },
  { id: 'silesia', name: 'Silesia', members: ['POL:Lower Silesian', 'POL:Opole', 'POL:Silesian'] },

  // ── Austria-Hungary ─────────────────────────────────────────────────────
  { id: 'austria', name: 'Austria', members: [{ a: 'AUT', not: ['Tirol', 'Vorarlberg'] }] },
  { id: 'tyrol', name: 'Tyrol & Trentino', members: ['AUT:Tirol', 'AUT:Vorarlberg', { a: 'ITA', r: 'Trentino-Alto Adige' }] },
  { id: 'bohemia', name: 'Bohemia & Moravia', members: ['CZE'] },
  { id: 'west-galicia', name: 'West Galicia', members: ['POL:Lesser Poland', 'POL:Subcarpathian'] },
  { id: 'east-galicia', name: 'East Galicia', members: names('UKR', "L'viv|Ternopil'|Ivano-Frankivs'k") },
  { id: 'bukovina', name: 'Bukovina', members: ['UKR:Chernivtsi'] },
  { id: 'hungary', name: 'Hungary & Upper Hungary', members: ['HUN', 'SVK', 'UKR:Transcarpathia'] },
  {
    id: 'transylvania', name: 'Transylvania & the Banat',
    members: names('ROU', 'Cluj|Bistrita-Nasaud|Salaj|Maramures|Satu Mare|Bihor|Arad|Timis|Caras-Severin|Hunedoara|Alba|Sibiu|Brasov|Covasna|Harghita|Mures'),
  },
  { id: 'vojvodina', name: 'Bačka, Banat & Srem', members: names('SRB', 'Severno-Backi|Zapadno-Backi|Južno-Backi|Severno-Banatski|Srednje-Banatski|Južno-Banatski|Sremski') },
  { id: 'croatia', name: 'Croatia-Slavonia', members: [{ a: 'HRV', not: ['Istarska', 'Zadarska', 'Šibensko-Kninska', 'Splitsko-Dalmatinska', 'Dubrovacko-Neretvanska'] }] },
  { id: 'littoral', name: 'Carniola & the Littoral', members: ['SVN', 'HRV:Istarska', { a: 'ITA', r: 'Friuli-Venezia Giulia', n: 'Trieste' }, { a: 'ITA', r: 'Friuli-Venezia Giulia', n: 'Gorizia' }] },
  { id: 'dalmatia', name: 'Dalmatia', members: [...names('HRV', 'Zadarska|Šibensko-Kninska|Splitsko-Dalmatinska|Dubrovacko-Neretvanska'), ...names('MNE', 'Kotor|Tivat|Herceg Novi')] },
  { id: 'bosnia', name: 'Bosnia-Herzegovina', members: ['BIH'] },

  // ── Italy ───────────────────────────────────────────────────────────────
  { id: 'friuli', name: 'Friuli & Belluno', members: [{ a: 'ITA', r: 'Friuli-Venezia Giulia', not: ['Trieste', 'Gorizia'] }, 'ITA:Belluno'] },
  { id: 'veneto', name: 'Venetia', members: [{ a: 'ITA', r: 'Veneto', not: ['Belluno'] }] },
  { id: 'north-italy', name: 'Lombardy & Piedmont', members: reg('ITA', 'Lombardia', 'Piemonte', "Valle d'Aosta", 'Liguria') },
  { id: 'central-italy', name: 'Central Italy', members: reg('ITA', 'Emilia-Romagna', 'Toscana', 'Marche', 'Umbria', 'Lazio') },
  { id: 'south-italy', name: 'Southern Italy', members: reg('ITA', 'Campania', 'Abruzzo', 'Molise', 'Apulia', 'Basilicata', 'Calabria') },
  { id: 'sicily', name: 'Sicily', members: reg('ITA', 'Sicily') },
  { id: 'sardinia', name: 'Sardinia', members: reg('ITA', 'Sardegna') },

  // ── The Balkans ─────────────────────────────────────────────────────────
  { id: 'serbia', name: 'Serbia', members: [{ a: 'SRB', not: ['Severno-Backi', 'Zapadno-Backi', 'Južno-Backi', 'Severno-Banatski', 'Srednje-Banatski', 'Južno-Banatski', 'Sremski'] }, 'KOS'] },
  { id: 'macedonia', name: 'Vardar Macedonia', members: ['MKD'] },
  { id: 'montenegro', name: 'Montenegro', members: [{ a: 'MNE', not: ['Kotor', 'Tivat', 'Herceg Novi'] }] },
  { id: 'albania', name: 'Albania', members: ['ALB'] },
  { id: 'salonika', name: 'Salonika & Greek Macedonia', members: names('GRC', 'Dytiki Makedonia|Kentriki Makedonia|Ayion Oros') },
  { id: 'kavala', name: 'Eastern Macedonia & Thrace', members: ['GRC:Anatoliki Makedonia kai Thraki'] },
  { id: 'greece', name: 'Greece', members: names('GRC', 'Ipeiros|Thessalia|Stereá Elláda|Attiki|Peloponnisos|Dytiki Ellada|Notio Aigaio|Voreio Aigaio|Kriti|Ionioi Nisoi') },
  { id: 'bulgaria', name: 'Bulgaria', members: ['BGR'] },
  { id: 'wallachia', name: 'Wallachia', members: names('ROU', 'Mehedinti|Dolj|Olt|Teleorman|Giurgiu|Calarasi|Ialomita|Ilfov|Bucharest|Arges|Dâmbovita|Prahova|Buzau|Braila|Gorj|Vâlcea') },
  { id: 'dobruja', name: 'Dobruja', members: ['ROU:Constanta', 'ROU:Tulcea'] },
  { id: 'moldavia', name: 'Moldavia', members: names('ROU', 'Suceava|Botosani|Iasi|Neamt|Bacau|Vaslui|Vrancea|Galati') },
  { id: 'bessarabia', name: 'Bessarabia', members: ['MDA'] },

  // ── The Russian Empire ──────────────────────────────────────────────────
  { id: 'warsaw', name: 'Warsaw & Łódź', members: ['POL:Masovian', 'POL:Łódź', 'POL:Podlachian'] },
  { id: 'lublin', name: 'Lublin & Kielce', members: ['POL:Lublin', 'POL:Świętokrzyskie'] },
  { id: 'lithuania', name: 'Lithuania', members: [{ a: 'LTU', not: ['Klaipedos'] }, 'BLR:Grodno'] },
  { id: 'courland', name: 'Courland', members: [{ a: 'LVA', r: 'Kurzeme' }, { a: 'LVA', r: 'Zemgale' }] },
  { id: 'livonia', name: 'Riga & Livonia', members: [{ a: 'LVA', r: 'Riga' }, { a: 'LVA', r: 'Vidzeme' }, { a: 'LVA', r: 'Latgale' }] },
  { id: 'estonia', name: 'Estonia', members: ['EST'] },
  { id: 'belarus', name: 'White Russia', members: names('BLR', 'Minsk|City of Minsk|Vitebsk|Mogilev|Gomel|Brest') },
  { id: 'right-bank-ukraine', name: 'Volhynia, Podolia & Kiev', members: names('UKR', "Volyn|Rivne|Zhytomyr|Khmel'nyts'kyy|Vinnytsya|Kiev|Kiev City|Cherkasy") },
  { id: 'left-bank-ukraine', name: 'Left-bank Ukraine', members: names('UKR', "Chernihiv|Sumy|Poltava|Kharkiv") },
  { id: 'south-ukraine', name: 'New Russia & the Crimea', members: [...names('UKR', "Kirovohrad|Mykolayiv|Odessa|Kherson|Dnipropetrovs'k|Zaporizhzhya|Donets'k|Luhans'k"), 'RUS:Crimea', 'RUS:Sevastopol'] },
  { id: 'petrograd', name: 'Petrograd & Novgorod', members: names('RUS', 'Leningrad|City of St. Petersburg|Novgorod|Pskov') },
  { id: 'central-russia', name: 'Moscow & Central Russia', members: names('RUS', "Moskva|Moskovskaya|Smolensk|Bryansk|Kaluga|Tula|Tver'|Orel|Kursk|Belgorod|Lipetsk|Ryazan'|Vladimir|Yaroslavl'|Ivanovo|Tambov|Voronezh") },
  { id: 'don', name: 'The Don & Kuban', members: names('RUS', "Rostov|Krasnodar|Adygey|Stavropol'") },
  { id: 'finland', name: 'Finland', members: ['FIN'] },
  { id: 'caucasus', name: 'Transcaucasia', members: ['GEO', 'ARM', 'AZE'] },

  // ── The Ottoman Empire and its borders ──────────────────────────────────
  { id: 'thrace', name: 'Constantinople & Thrace', members: names('TUR', 'Edirne|Kirklareli|Tekirdag|Istanbul') },
  { id: 'gallipoli', name: 'The Dardanelles', members: ['TUR:Çanakkale'] },
  { id: 'west-anatolia', name: 'Western Anatolia', members: [{ a: 'TUR', not: ['Edirne', 'Kirklareli', 'Tekirdag', 'Istanbul', 'Çanakkale'], clip: [25, 35, 32.5, 43] }] },
  { id: 'central-anatolia', name: 'Central Anatolia & Cilicia', members: [{ a: 'TUR', clip: [32.5, 35, 38.5, 43] }] },
  { id: 'east-anatolia', name: 'Eastern Anatolia', members: [{ a: 'TUR', clip: [38.5, 35, 45, 43] }] },
  { id: 'syria', name: 'Syria & Lebanon', members: ['SYR', 'LBN'] },
  { id: 'palestine', name: 'Palestine & Transjordan', members: ['ISR', 'PSX', 'JOR'] },
  { id: 'mosul', name: 'Mosul', members: names('IRQ', "Dihok|Arbil|Ninawa|As-Sulaymaniyah|At-Ta'mim|Sala ad-Din") },
  { id: 'baghdad', name: 'Baghdad', members: names('IRQ', "Baghdad|Diyala|Al-Anbar|Babil|Karbala'|An-Najaf|Wasit|Al-Qādisiyyah") },
  { id: 'basra', name: 'Basra', members: [...names('IRQ', 'Al-Basrah|Maysan|Dhi-Qar|Al-Muthannia'), 'KWT'] },
  { id: 'hejaz', name: 'Hejaz', members: names('SAU', 'Tabuk|Al Madinah|Makkah|Al Bahah') },
  { id: 'sinai', name: 'Sinai', members: ["EGY:Shamal Sina'", "EGY:Janub Sina'"] },
  { id: 'egypt', name: 'Egypt', members: [{ a: 'EGY', not: ["Shamal Sina'", "Janub Sina'"] }] },
  { id: 'libya', name: 'Libya', members: ['LBY'] },
  { id: 'cyprus', name: 'Cyprus', members: ['CYP'] },
  { id: 'persia', name: 'Persia', members: ['IRN'] },
];
