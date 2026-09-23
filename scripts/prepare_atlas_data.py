"""Project the reviewed R72 denominator amendment into atlas display data.

R71 remains immutable. R72 corrects five dates and splits the orphan aggregate.
The projection keeps source and geometry caveats attached to each row.
"""
import csv
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'data/mongol/r72/mongol_denominator_round72.csv'
TARGET = ROOT / 'src/data/denominator.json'

# The R72 source carries all historical date corrections. This is only a
# shorter display label for a long-running war bounded by the atlas window.
DATE_CORRECTIONS = {
    'mongol:qaidu-qubilai-war-atlas-window': '1260s–1294',
}
PLACEMENT_CORRECTIONS = {
    'mongol:final-merkit-campaign': 1208,
    'mongol:chormaqan-transcaucasia': 1235,
    'mongol:qaidu-qubilai-war-atlas-window': 1265,
}
with SOURCE.open(newline='', encoding='utf-8') as stream:
    rows = list(csv.DictReader(stream))

assert len(rows) == 113, f'Expected 113 candidates, got {len(rows)}'
include = [row for row in rows if row['disposition'] == 'include']
merge = [row for row in rows if row['disposition'] == 'merge']
superseded = [row for row in rows if row['disposition'] == 'superseded']
assert len(include) == 107 and len(merge) == 5 and len(superseded) == 1, 'R72 disposition count changed'
ids = [row['canonical_id'] for row in include]
assert len(set(ids)) == 107, 'Duplicate include canonical ID'
assert set(DATE_CORRECTIONS).issubset(ids), 'Date correction target missing'
orphans = [row['candidate_id'] for row in merge if row['canonical_id'] not in ids]
assert not orphans, f'Orphan merge target: {orphans}'

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
print(f'Prepared {len(result)} include records; {len(merge)} merges and {len(superseded)} superseded aggregate omitted.')
