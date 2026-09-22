"""Project the frozen R71 disposition pack into atlas display data.

The upstream CSV is retained byte-for-byte. This projection makes explicit
UI date corrections and keeps source/geometry caveats attached to each row.
"""
import csv
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'data/mongol/r71/mongol_denominator_round71.csv'
TARGET = ROOT / 'src/data/denominator.json'

# Corrections supported by each row's disposition_reason; the frozen pack is not edited.
DATE_CORRECTIONS = {
    'mongol:wulahai-capture-1209': '1209',
    'mongol:invasion-champa-1282-1284': '1282–1284',
    'mongol:second-invasion-dai-viet-1285': '1285',
    'mongol:sambyeolcho-revolt-1270-1273': '1270–1273',
    'mongol:conquest-dali-yunnan-1253-1254': '1253–1254',
    'mongol:qaidu-qubilai-war-atlas-window': '1260s–1294',
}
PLACEMENT_CORRECTIONS = {
    'mongol:final-merkit-campaign': 1208,
    'mongol:chormaqan-transcaucasia': 1235,
    'mongol:qaidu-qubilai-war-atlas-window': 1265,
}
EXPECTED_ORPHAN_MERGE = 'mongol-cand:qarakhitai_khwarazm_central_asia:10:urgench-nishapur-herat'

with SOURCE.open(newline='', encoding='utf-8') as stream:
    rows = list(csv.DictReader(stream))

assert len(rows) == 109, f'Expected 109 candidates, got {len(rows)}'
include = [row for row in rows if row['disposition'] == 'include']
merge = [row for row in rows if row['disposition'] == 'merge']
assert len(include) == 103 and len(merge) == 6, 'R71 disposition count changed'
ids = [row['canonical_id'] for row in include]
assert len(set(ids)) == 103, 'Duplicate include canonical ID'
assert set(DATE_CORRECTIONS).issubset(ids), 'Date correction target missing'
orphans = [row['candidate_id'] for row in merge if row['canonical_id'] not in ids]
assert orphans == [EXPECTED_ORPHAN_MERGE], f'Unexpected merge target anomaly: {orphans}'

result = []
for row in include:
    ident = row['canonical_id']
    date_label = DATE_CORRECTIONS.get(ident, row['date_label'].replace('-', '–'))
    match = re.search(r'1[12]\d\d', date_label)
    assert match, f'No sortable year: {ident}'
    year = PLACEMENT_CORRECTIONS.get(ident, int(match.group()))
    primary = row['primary_locator_1'].strip()
    second = row['primary_locator_2'].strip()
    source_url = next((locator for locator in (primary, second) if locator.startswith('https://')), None)
    assert primary and row['geometry_status'] and 'citation-only' in row['rights_status'], ident
    result.append({
        'id': ident,
        'candidateId': row['candidate_id'],
        'year': year,
        'dateLabel': date_label,
        'originalDateLabel': row['date_label'],
        'partition': row['partition'],
        'description': row['candidate_description'].strip(),
        'sourceCitation': primary,
        'secondCitation': second or None,
        'sourceUrl': source_url,
        'geometryStatus': row['geometry_status'],
        'reviewReason': row['disposition_reason'],
        'materiality': row['materiality_status'],
    })

result.sort(key=lambda row: (row['year'], row['dateLabel'], row['id']))
TARGET.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(f'Prepared {len(result)} include records; {len(merge)} merges omitted; known orphan merge disclosed.')
