// Historical regions assembled from Natural Earth admin-1 units.
// Modern provincial boundaries are a proxy: they give believable coastlines and
// rivers-as-borders, but 13th-century frontiers were zones rather than lines. The UI
// says so. Each member is 'ADM0' (every unit of a country), 'ADM0:Unit name', or
// { a: 'ADM0', n: 'Unit name' | undefined, clip: [minLon, minLat, maxLon, maxLat] }.

export const REGIONS = [
  // ── Steppe heartland ────────────────────────────────────────────────────────
  { id: 'mongolia', name: 'Mongolia', members: ['MNG'] },
  { id: 'transbaikal', name: 'Transbaikalia', members: ['RUS:Buryat', 'RUS:Chita'] },
  { id: 'inner-mongolia', name: 'Ongud & Tatar steppe', members: [{ a: 'CHN', n: 'Inner Mongol', clip: [106.8, 30, 130, 60] }] },
  { id: 'yenisei', name: 'Yenisei Kirghiz & Oirat', members: ['RUS:Tuva', 'RUS:Khakass', 'RUS:Gorno-Altay', 'RUS:Altay'] },
  { id: 'naiman-irtysh', name: 'Upper Irtysh', members: ['KAZ:East Kazakhstan'] },

  // ── North China (Jin) ───────────────────────────────────────────────────────
  { id: 'manchuria', name: 'Manchuria', members: ['CHN:Heilongjiang', 'CHN:Jilin', 'RUS:Amur', 'RUS:Yevrey', 'RUS:Primor\'ye'] },
  { id: 'liaodong', name: 'Liaodong', members: ['CHN:Liaoning'] },
  { id: 'hebei', name: 'Hebei & Zhongdu', members: ['CHN:Hebei', 'CHN:Beijing', 'CHN:Tianjin'] },
  { id: 'shanxi', name: 'Shanxi', members: ['CHN:Shanxi'] },
  { id: 'shandong', name: 'Shandong', members: ['CHN:Shandong'] },
  { id: 'henan', name: 'Henan', members: ['CHN:Henan'] },
  { id: 'guanzhong', name: 'Guanzhong', members: [{ a: 'CHN', n: 'Shaanxi', clip: [100, 33.55, 120, 45] }] },

  // ── Tangut & Tibet ──────────────────────────────────────────────────────────
  {
    id: 'xia', name: 'Western Xia',
    members: ['CHN:Ningxia', { a: 'CHN', n: 'Gansu', clip: [90, 34.3, 110, 45] }, { a: 'CHN', n: 'Inner Mongol', clip: [95, 30, 106.8, 60] }],
  },
  { id: 'qinghai', name: 'Amdo', members: ['CHN:Qinghai'] },
  { id: 'tibet', name: 'Tibet', members: ['CHN:Xizang'] },

  // ── South China (Song) ──────────────────────────────────────────────────────
  { id: 'hanzhong', name: 'Hanzhong', members: [{ a: 'CHN', n: 'Shaanxi', clip: [100, 20, 120, 33.55] }, { a: 'CHN', n: 'Gansu', clip: [90, 20, 110, 34.3] }] },
  { id: 'sichuan', name: 'Sichuan', members: ['CHN:Sichuan', 'CHN:Chongqing'] },
  { id: 'jinghu', name: 'Jinghu (Hubei)', members: ['CHN:Hubei'] },
  { id: 'huainan', name: 'Huainan', members: ['CHN:Jiangsu', 'CHN:Anhui', 'CHN:Shanghai'] },
  { id: 'liangzhe', name: 'Liangzhe', members: ['CHN:Zhejiang'] },
  { id: 'jiangxi', name: 'Jiangxi', members: ['CHN:Jiangxi'] },
  { id: 'hunan', name: 'Hunan', members: ['CHN:Hunan'] },
  { id: 'fujian', name: 'Fujian', members: ['CHN:Fujian'] },
  { id: 'guangdong', name: 'Guangdong', members: ['CHN:Guangdong', 'CHN:Hainan'] },
  { id: 'guangxi', name: 'Guangxi', members: ['CHN:Guangxi', 'CHN:Guizhou'] },
  { id: 'yunnan', name: 'Dali', members: ['CHN:Yunnan'] },

  // ── Tarim & Central Asia ────────────────────────────────────────────────────
  { id: 'uyghuria', name: 'Uyghur Qocho', members: [{ a: 'CHN', n: 'Xinjiang', clip: [85.5, 30, 100, 50] }] },
  { id: 'kashgaria', name: 'Kashgaria', members: [{ a: 'CHN', n: 'Xinjiang', clip: [70, 30, 85.5, 50] }] },
  { id: 'semirechye', name: 'Semirechye', members: ['KAZ:Almaty', 'KAZ:Almaty City', 'KAZ:Zhambyl', 'KGZ'] },
  { id: 'transoxiana', name: 'Transoxiana', members: ['UZB:Ferghana', 'UZB:Tashkent', 'UZB:Namangan', 'UZB:Andijon', 'UZB:Sirdaryo', 'UZB:Jizzakh', 'UZB:Samarkand', 'UZB:Kashkadarya', 'UZB:Surkhandarya', 'UZB:Navoi', 'UZB:Bukhoro', 'TJK', 'TKM:Chardzhou'] },
  { id: 'khwarazm', name: 'Khwarazm', members: ['UZB:Khorezm', 'UZB:Karakalpakstan', 'TKM:Tashauz'] },
  { id: 'otrar', name: 'Middle Syr Darya', members: ['KAZ:South Kazakhstan'] },
  { id: 'lower-syr', name: 'Lower Syr Darya', members: ['KAZ:Qyzylorda'] },
  { id: 'kangli-steppe', name: 'Kangli steppe', members: ['KAZ:Qaraghandy', 'KAZ:Aqmola', 'KAZ:Astana', 'KAZ:North Kazakhstan', 'KAZ:Pavlodar', 'RUS:Omsk', 'RUS:Novosibirsk'] },
  { id: 'kipchak-steppe', name: 'Kipchak steppe', members: ['KAZ:Aqtöbe', 'KAZ:Qostanay', 'KAZ:West Kazakhstan', 'KAZ:Atyrau', 'KAZ:Mangghystau', 'RUS:Orenburg', 'RUS:Chelyabinsk', 'RUS:Kurgan'] },
  { id: 'bashkiria', name: 'Bashkiria', members: ['RUS:Bashkortostan'] },

  // ── Volga, Pontic steppe & Rus ──────────────────────────────────────────────
  { id: 'volga-bulgaria', name: 'Volga Bulgaria', members: ['RUS:Tatarstan', 'RUS:Chuvash', 'RUS:Ul\'yanovsk', 'RUS:Samara', 'RUS:Mariy-El', 'RUS:Udmurt'] },
  { id: 'lower-volga', name: 'Lower Volga', members: ['RUS:Astrakhan\'', 'RUS:Volgograd', 'RUS:Saratov', 'RUS:Kalmyk', 'RUS:Rostov'] },
  { id: 'pontic', name: 'Pontic steppe', members: ['UKR:Kherson', 'UKR:Zaporizhzhya', 'UKR:Dnipropetrovs\'k', 'UKR:Donets\'k', 'UKR:Luhans\'k', 'UKR:Mykolayiv', 'UKR:Odessa', 'UKR:Kirovohrad', 'RUS:Krasnodar', 'RUS:Stavropol\'', 'RUS:Adygey'] },
  { id: 'crimea', name: 'Crimea', members: ['RUS:Crimea', 'RUS:Sevastopol', 'UKR:Crimea', 'UKR:Sevastopol'] },
  { id: 'alania', name: 'Alania & Dagestan', members: ['RUS:Karachay-Cherkess', 'RUS:Kabardin-Balkar', 'RUS:North Ossetia', 'RUS:Ingush', 'RUS:Chechnya', 'RUS:Dagestan'] },
  { id: 'ryazan', name: 'Ryazan', members: ['RUS:Ryazan\'', 'RUS:Lipetsk', 'RUS:Tambov', 'RUS:Penza', 'RUS:Mordovia'] },
  { id: 'vladimir', name: 'Vladimir-Suzdal', members: ['RUS:Vladimir', 'RUS:Moskva', 'RUS:Moskovskaya', 'RUS:Ivanovo', 'RUS:Yaroslavl\'', 'RUS:Kostroma', 'RUS:Nizhegorod', 'RUS:Tver\'', 'RUS:Kaluga', 'RUS:Tula'] },
  { id: 'novgorod', name: 'Novgorod', members: ['RUS:Novgorod', 'RUS:Leningrad', 'RUS:City of St. Petersburg', 'RUS:Pskov', 'RUS:Vologda', 'RUS:Karelia'] },
  { id: 'smolensk', name: 'Smolensk', members: ['RUS:Smolensk'] },
  { id: 'chernigov', name: 'Chernigov', members: ['UKR:Chernihiv', 'UKR:Sumy', 'RUS:Bryansk', 'RUS:Orel', 'RUS:Kursk', 'RUS:Belgorod', 'RUS:Voronezh'] },
  { id: 'pereyaslavl', name: 'Pereyaslavl', members: ['UKR:Poltava', 'UKR:Kharkiv', 'UKR:Cherkasy'] },
  { id: 'kiev', name: 'Kiev', members: ['UKR:Kiev', 'UKR:Kiev City', 'UKR:Zhytomyr', 'UKR:Vinnytsya'] },
  { id: 'galicia', name: 'Galicia-Volhynia', members: ['UKR:L\'viv', 'UKR:Volyn', 'UKR:Rivne', 'UKR:Ternopil\'', 'UKR:Ivano-Frankivs\'k', 'UKR:Khmel\'nyts\'kyy', 'UKR:Chernivtsi'] },
  { id: 'polotsk', name: 'Polotsk & Black Ruthenia', members: ['BLR'] },
  { id: 'lithuania', name: 'Lithuania', members: ['LTU'] },
  { id: 'livonia', name: 'Livonia', members: ['LVA', 'EST'] },

  // ── Central Europe ──────────────────────────────────────────────────────────
  { id: 'lesser-poland', name: 'Lesser Poland', members: ['POL:Lesser Poland', 'POL:Subcarpathian', 'POL:Lublin', 'POL:Świętokrzyskie'] },
  { id: 'silesia', name: 'Silesia', members: ['POL:Lower Silesian', 'POL:Opole', 'POL:Silesian'] },
  { id: 'greater-poland', name: 'Greater Poland & Masovia', members: ['POL:Greater Poland', 'POL:Masovian', 'POL:Łódź', 'POL:Kuyavian-Pomeranian', 'POL:Podlachian', 'POL:Lubusz', 'POL:Pomeranian', 'POL:West Pomeranian', 'POL:Warmian-Masurian'] },
  { id: 'bohemia', name: 'Bohemia & Moravia', members: ['CZE'] },
  { id: 'austria', name: 'Austria', members: ['AUT'] },
  { id: 'germany', name: 'German lands', members: ['DEU'] },
  {
    id: 'hungary-plain', name: 'Great Hungarian Plain',
    members: ['HUN:Szabolcs-Szatmár-Bereg', 'HUN:Békés', 'HUN:Hajdú-Bihar', 'HUN:Csongrád', 'HUN:Bács-Kiskun', 'HUN:Szeged', 'HUN:Borsod-Abaúj-Zemplén', 'HUN:Nógrád', 'HUN:Salgótarján', 'HUN:Pest', 'HUN:Jász-Nagykun-Szolnok', 'HUN:Szolnok', 'HUN:Budapest', 'HUN:Heves', 'HUN:Eger', 'HUN:Miskolc', 'HUN:Hódmezôvásárhely', 'HUN:Kecskemét', 'HUN:Békéscsaba', 'HUN:Debrecen', 'HUN:Nyíregyháza', 'HUN:Érd', 'SRB:Severno-Backi', 'SRB:Zapadno-Backi', 'SRB:Severno-Banatski', 'SRB:Južno-Backi', 'SRB:Srednje-Banatski', 'SRB:Južno-Banatski', 'SRB:Sremski'],
  },
  { id: 'upper-hungary', name: 'Upper Hungary', members: ['SVK'] },
  {
    id: 'transdanubia', name: 'Transdanubia',
    members: ['HUN:Gyor-Moson-Sopron', 'HUN:Sopron', 'HUN:Vas', 'HUN:Zala', 'HUN:Somogy', 'HUN:Baranya', 'HUN:Komárom-Esztergom', 'HUN:Fejér', 'HUN:Veszprém', 'HUN:Tolna', 'HUN:Dunaújváros', 'HUN:Tatabánya', 'HUN:Gyôr', 'HUN:Szombathely', 'HUN:Zalaegerszeg', 'HUN:Nagykanizsa', 'HUN:Kaposvár', 'HUN:Pécs', 'HUN:Szekszárd', 'HUN:Székesfehérvár'],
  },
  {
    id: 'transylvania', name: 'Transylvania',
    members: ['ROU:Satu Mare', 'ROU:Arad', 'ROU:Bihor', 'ROU:Timis', 'ROU:Caras-Severin', 'ROU:Maramures', 'ROU:Cluj', 'ROU:Bistrita-Nasaud', 'ROU:Salaj', 'ROU:Hunedoara', 'ROU:Covasna', 'ROU:Brasov', 'ROU:Sibiu', 'ROU:Mures', 'ROU:Harghita', 'ROU:Alba'],
  },
  { id: 'croatia', name: 'Croatia & Dalmatia', members: ['HRV', 'SVN', 'BIH'] },
  { id: 'moldavia', name: 'Moldavia', members: ['ROU:Botosani', 'ROU:Iasi', 'ROU:Vaslui', 'ROU:Galati', 'ROU:Suceava', 'ROU:Neamt', 'ROU:Bacau', 'ROU:Vrancea', 'MDA'] },
  {
    id: 'wallachia', name: 'Wallachia',
    members: ['ROU:Mehedinti', 'ROU:Dolj', 'ROU:Calarasi', 'ROU:Teleorman', 'ROU:Giurgiu', 'ROU:Constanta', 'ROU:Olt', 'ROU:Tulcea', 'ROU:Dâmbovita', 'ROU:Ilfov', 'ROU:Arges', 'ROU:Gorj', 'ROU:Vâlcea', 'ROU:Prahova', 'ROU:Buzau', 'ROU:Braila', 'ROU:Ialomita', 'ROU:Bucharest'],
  },
  { id: 'bulgaria', name: 'Bulgaria', members: ['BGR', 'MKD'] },
  {
    id: 'serbia', name: 'Serbia',
    members: ['SRB:Pcinjski', 'SRB:Borski', 'SRB:Zajecarski', 'SRB:Pirotski', 'SRB:Jablanicki', 'SRB:Raški', 'SRB:Pomoravski', 'SRB:Toplicki', 'SRB:Zlatiborski', 'SRB:Macvanski', 'SRB:Branicevski', 'SRB:Grad Beograd', 'SRB:Podunavski', 'SRB:Nišavski', 'SRB:Šumadijski', 'SRB:Moravicki', 'SRB:Kolubarski', 'MNE', 'KOS'],
  },
  { id: 'thrace', name: 'Thrace & Greece', members: ['GRC', 'ALB', 'TUR:Edirne', 'TUR:Kirklareli', 'TUR:Tekirdag', 'TUR:Istanbul'] },

  // ── Caucasus, Iran & Mesopotamia ────────────────────────────────────────────
  { id: 'georgia', name: 'Georgia', members: ['GEO'] },
  { id: 'armenia', name: 'Greater Armenia', members: ['ARM', 'TUR:Kars', 'TUR:Ardahan', 'TUR:Iğdir', 'TUR:Agri'] },
  { id: 'azerbaijan', name: 'Azerbaijan & Arran', members: ['AZE', 'IRN:East Azarbaijan', 'IRN:West Azarbaijan', 'IRN:Ardebil', 'IRN:Zanjan'] },
  { id: 'mazandaran', name: 'Mazandaran & Gilan', members: ['IRN:Mazandaran', 'IRN:Gilan', 'IRN:Golestan'] },
  { id: 'daylam', name: 'Daylam (Alamut)', members: ['IRN:Qazvin', 'IRN:Alborz'] },
  { id: 'jibal', name: 'Persian Iraq (Jibal)', members: ['IRN:Tehran', 'IRN:Qom', 'IRN:Markazi', 'IRN:Hamadan', 'IRN:Esfahan', 'IRN:Semnan', 'IRN:Kermanshah', 'IRN:Lorestan', 'IRN:Kordestan', 'IRN:Chahar Mahall and Bakhtiari', 'IRN:Kohgiluyeh and Buyer Ahmad'] },
  { id: 'khorasan', name: 'Khorasan', members: ['IRN:Razavi Khorasan', 'IRN:North Khorasan', 'TKM:Mary', 'TKM:Ahal', 'TKM:Balkan', 'AFG:Hirat', 'AFG:Badghis', 'AFG:Faryab', 'AFG:Jawzjan', 'AFG:Balkh', 'AFG:Samangan', 'AFG:Sari Pul'] },
  { id: 'quhistan', name: 'Quhistan', members: ['IRN:South Khorasan'] },
  {
    id: 'ghur', name: 'Ghur & Ghazna',
    members: ['AFG:Ghor', 'AFG:Bamyan', 'AFG:Kabul', 'AFG:Parwan', 'AFG:Kapisa', 'AFG:Wardak', 'AFG:Logar', 'AFG:Ghazni', 'AFG:Kandahar', 'AFG:Zabul', 'AFG:Uruzgan', 'AFG:Hilmand', 'AFG:Farah', 'AFG:Nimroz', 'AFG:Paktya', 'AFG:Paktika', 'AFG:Khost', 'AFG:Nangarhar', 'AFG:Laghman', 'AFG:Kunar', 'AFG:Nuristan', 'AFG:Badakhshan', 'AFG:Takhar', 'AFG:Kunduz', 'AFG:Baghlan'],
  },
  { id: 'sistan', name: 'Sistan & Makran', members: ['IRN:Sistan and Baluchestan'] },
  { id: 'kerman', name: 'Kerman', members: ['IRN:Kerman', 'IRN:Yazd'] },
  { id: 'fars', name: 'Fars', members: ['IRN:Fars', 'IRN:Bushehr', 'IRN:Hormozgan'] },
  { id: 'khuzestan', name: 'Khuzestan', members: ['IRN:Khuzestan', 'IRN:Ilam'] },
  {
    id: 'iraq', name: 'Arab Iraq',
    members: ['IRQ:Baghdad', 'IRQ:Babil', 'IRQ:Karbala\'', 'IRQ:An-Najaf', 'IRQ:Al-Qādisiyyah', 'IRQ:Wasit', 'IRQ:Maysan', 'IRQ:Dhi-Qar', 'IRQ:Al-Basrah', 'IRQ:Al-Muthannia', 'IRQ:Al-Anbar', 'IRQ:Diyala', 'IRQ:Sala ad-Din', 'KWT'],
  },
  {
    id: 'jazira', name: 'Jazira & Mosul',
    members: ['IRQ:Ninawa', 'IRQ:Dihok', 'IRQ:Arbil', 'IRQ:As-Sulaymaniyah', 'IRQ:At-Ta\'mim', 'SYR:Hasaka (Al Haksa)', 'SYR:Ar Raqqah', 'SYR:Dayr Az Zawr', 'TUR:Mardin', 'TUR:Sanliurfa', 'TUR:Diyarbakir', 'TUR:Batman', 'TUR:Siirt', 'TUR:Sirnak', 'TUR:Hakkari', 'TUR:Van', 'TUR:Bitlis'],
  },
  {
    id: 'syria', name: 'Syria',
    members: ['SYR:Aleppo', 'SYR:Idlib', 'SYR:Hamah', 'SYR:Homs (Hims)', 'SYR:Lattakia', 'SYR:Tartus', 'SYR:Damascus', 'SYR:Rif Dimashq', 'SYR:Dar`a', 'SYR:As Suwayda\'', 'SYR:Quneitra', 'SYR:UNDOF', 'JOR', 'TUR:Kilis', 'TUR:Gaziantep'],
  },
  { id: 'outremer', name: 'Outremer', members: ['LBN', 'ISR', 'PSX', 'PSE', 'CYP', 'CYN'] },
  { id: 'egypt', name: 'Egypt', members: ['EGY'] },
  { id: 'arabia', name: 'Arabia', members: ['SAU', 'YEM', 'OMN', 'ARE', 'QAT', 'BHR'] },

  // ── Anatolia ────────────────────────────────────────────────────────────────
  { id: 'cilicia', name: 'Cilicia', members: ['TUR:Adana', 'TUR:Mersin', 'TUR:Osmaniye', 'TUR:Hatay'] },
  { id: 'trebizond', name: 'Trebizond', members: ['TUR:Trabzon', 'TUR:Rize', 'TUR:Giresun', 'TUR:Artvin', 'TUR:Gümüshane', 'TUR:Ordu'] },
  {
    id: 'nicaea', name: 'Western Anatolia',
    members: ['TUR:Izmir', 'TUR:Aydin', 'TUR:Mugla', 'TUR:Manisa', 'TUR:Balikesir', 'TUR:Çanakkale', 'TUR:Bursa', 'TUR:Kocaeli', 'TUR:Yalova', 'TUR:Sakarya', 'TUR:Bilecik', 'TUR:Düzce'],
  },
  {
    id: 'rum', name: 'Rum',
    members: ['TUR:Ankara', 'TUR:Konya', 'TUR:Karaman', 'TUR:Nigde', 'TUR:Kayseri', 'TUR:Isparta', 'TUR:Denizli', 'TUR:Burdur', 'TUR:Aksaray', 'TUR:Nevsehir', 'TUR:Yozgat', 'TUR:Kirsehir', 'TUR:Usak', 'TUR:Afyonkarahisar', 'TUR:Kinkkale', 'TUR:Kütahya', 'TUR:Eskisehir', 'TUR:Antalya', 'TUR:Bolu', 'TUR:Çankiri', 'TUR:Karabük', 'TUR:Zinguldak', 'TUR:Bartın', 'TUR:Kastamonu', 'TUR:Sinop', 'TUR:Samsun', 'TUR:Çorum', 'TUR:Amasya', 'TUR:Tokat', 'TUR:Sivas', 'TUR:K. Maras', 'TUR:Malatya', 'TUR:Adiyaman', 'TUR:Elazig', 'TUR:Tunceli', 'TUR:Erzincan', 'TUR:Bayburt', 'TUR:Erzurum', 'TUR:Bingöl', 'TUR:Mus'],
  },

  // ── India ───────────────────────────────────────────────────────────────────
  { id: 'punjab', name: 'Punjab & the Indus', members: ['PAK:Punjab', 'PAK:K.P.', 'PAK:F.A.T.A.', 'PAK:F.C.T.', 'PAK:Azad Kashmir', 'IND:Punjab', 'IND:Chandigarh'] },
  { id: 'sindh', name: 'Sindh & Multan', members: ['PAK:Sind', 'PAK:Baluchistan'] },
  { id: 'kashmir', name: 'Kashmir', members: ['IND:Jammu and Kashmir', 'IND:Ladakh', 'PAK:Northern Areas', 'IND:Himachal Pradesh'] },
  { id: 'hindustan', name: 'Hindustan', members: ['IND:Delhi', 'IND:Haryana', 'IND:Uttar Pradesh', 'IND:Uttarakhand', 'IND:Rajasthan', 'IND:Bihar', 'IND:Madhya Pradesh', 'IND:Gujarat', 'IND:West Bengal', 'IND:Jharkhand'] },

  // ── Korea, Japan & Southeast Asia ───────────────────────────────────────────
  { id: 'korea', name: 'Goryeo', members: ['KOR', 'PRK'] },
  { id: 'kyushu', name: 'Kyushu, Tsushima & Iki', members: ['JPN:Fukuoka', 'JPN:Saga', 'JPN:Nagasaki', 'JPN:Kumamoto', 'JPN:Ōita', 'JPN:Miyazaki', 'JPN:Kagoshima'] },
  {
    id: 'japan', name: 'Japan',
    members: ['JPN:Tokushima', 'JPN:Kagawa', 'JPN:Ehime', 'JPN:Kōchi', 'JPN:Shimane', 'JPN:Yamaguchi', 'JPN:Tottori', 'JPN:Hyōgo', 'JPN:Kyōto', 'JPN:Fukui', 'JPN:Ishikawa', 'JPN:Toyama', 'JPN:Niigata', 'JPN:Yamagata', 'JPN:Akita', 'JPN:Aomori', 'JPN:Iwate', 'JPN:Miyagi', 'JPN:Fukushima', 'JPN:Ibaraki', 'JPN:Chiba', 'JPN:Tokyo', 'JPN:Kanagawa', 'JPN:Shizuoka', 'JPN:Aichi', 'JPN:Mie', 'JPN:Wakayama', 'JPN:Ōsaka', 'JPN:Okayama', 'JPN:Hiroshima', 'JPN:Gunma', 'JPN:Nagano', 'JPN:Tochigi', 'JPN:Gifu', 'JPN:Shiga', 'JPN:Saitama', 'JPN:Yamanashi', 'JPN:Nara'],
  },
  { id: 'dai-viet', name: 'Đại Việt', members: [{ a: 'VNM', clip: [100, 17.6, 110, 24] }] },
  { id: 'champa', name: 'Champa', members: [{ a: 'VNM', clip: [106.3, 10.9, 110, 17.6] }] },
  { id: 'angkor', name: 'Khmer Empire', members: ['KHM', 'THA', 'LAO', { a: 'VNM', clip: [100, 8, 106.3, 17.6] }, { a: 'VNM', clip: [100, 8, 110, 10.9] }] },
  { id: 'pagan', name: 'Pagan', members: ['MMR'] },
  { id: 'java', name: 'Java', members: ['IDN:Jawa Timur', 'IDN:Jawa Tengah', 'IDN:Jawa Barat', 'IDN:Yogyakarta', 'IDN:Banten', 'IDN:Jakarta Raya', 'IDN:Bali'] },
];
