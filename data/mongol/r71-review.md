# R71 pack review (atlas build, 2026-09-23)

The R71 CSV is the frozen denominator and is left byte-for-byte unchanged. `npm run validate`
checks that every one of its 103 `include` rows renders as exactly one event, and that each
event carries the row's primary locators verbatim.

While turning the rows into events, three authoring passes checked every row against the sources it cites. They
found the problems below. The atlas events already use the corrected dates or readings, and each
event's `uncertaintyNote` gives the reason. The pack rows themselves are untouched, so the pack
owner can decide what to adopt.

## Probable errors in rows

**Lunar months read as Western months.** Chinese and Vietnamese chronicle months run about four to six weeks behind the Western months of the same number.
- `diaoyu-siege-mongke-death-1259`: "June/July 1259". Möngke died on 11 August 1259.
- `first-invasion-dai-viet-1257-1258`: "12 Dec 1257 … 24 Dec". These are days of the 12th lunar month, about 17–29 January 1258.
- `ezhou-siege-withdrawal-1259` and `song-war-council-mobilisation-1256-1257`: the same slip.
- `siege-kaifeng-1232-1233`: the March 1232, January 1233 and April 1233 dates, which become about April 1232, February 1233 and May 1233.
- `toluid-civil-war-1260-1264`: "March/April 1260". Qubilai was proclaimed on 5 May 1260.
- `yuan-mian-frontier-battle-1277`: "March 1277" should be about April 1277.
- `yuan-java-expedition-1292-1293`: the "April" withdrawal should be late May 1293.
- `third-invasion-dai-viet-bach-dang-1287-1288`: Bạch Đằng was on 9 April 1288.
- `invasion-champa-1282-1284`: the dates may carry the same slip. This is flagged but not changed.

**An id or label that disagrees with its own reasoning:**
- `wulahai-capture-1209`: the label says 1207. The Yuanshi records a capture in both campaigns, so the event runs 1207–1209.
- `invasion-champa-1282-1284`: the label says 1284–1285.
- `second-invasion-dai-viet-1285`: the label says 1283–1285, but the reasoning says 1285.
- `sambyeolcho-revolt-1270-1273`: the label says 1269–1273, but the revolt began in 1270.
- `conquest-dali-yunnan-1253-1254`: the label says 1252–1254. The atlas follows the label.

**Likely misdatings or misreadings:**
- `first-zhongdu-siege-settlement-1211`: the Yuanshi and Jinshi date the princess-and-tribute settlement to spring 1214.
- `eastern-capital-submission-1213-1214`: the Secret History's "Beiging" is usually read as the Jin *Northern* Capital, which fell in 1215, not Liaoyang.
- `western-xia-submission-1211`: most chronologies put the submission in early 1210.
- `final-merkit-campaign`: the Yuanshi biography of Sübe'etei gives 1217.
- `jin-tong-pass-daohuigu-defence-1230-1231`: Dachangyuan is usually dated early 1228.
- `battle-between-hamath-emesa-1281`: the Mamluk sources give 29 October; Bar Hebraeus gives 30 October.

## Coverage gaps a next round could consider

Serious histories name these, but no row covers them.
- **Deaths and successions:** the death of Chinggis Qan (1227); Ögedei's election (1229) and death (1241); Güyük's enthronement (1246) and death (1248); Möngke's election and purge (1251).
- **Central Asia:** the sieges of Gurganj/Urgench, Nishapur, Herat, Khujand and Balkh.
- **The western campaign:** Vladimir, Kolomna and Torzhok (1238); Chmielnik and Kraków (1241); the founding of Sarai.
- **China and Mongolia:** the Song advance on Luoyang (1234); the founding of Qaraqorum (1235) and the 1235 kurultai.
- **Embassies:** Carpini (1246) and Rubruck (1253–55).
- **Syria:** Mayyafariqin (1258–60).

Adding any of these would change the frozen count of 109, so they belong in a new round.
