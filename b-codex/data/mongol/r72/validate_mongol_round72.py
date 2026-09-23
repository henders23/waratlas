"""Check the R72 amendment against the immutable R71 denominator."""

import collections
import csv
from pathlib import Path

HERE = Path(__file__).resolve().parent


def read(path):
    with path.open(newline='', encoding='utf-8') as stream:
        return list(csv.DictReader(stream))


old = read(HERE.parent / 'r71/mongol_denominator_round71.csv')
new = read(HERE / 'mongol_denominator_round72.csv')
errors = []
expected_counts = {'include': 107, 'merge': 5, 'superseded': 1}
counts = dict(collections.Counter(row['disposition'] for row in new))
if len(new) != 113 or counts != expected_counts:
    errors.append(f'counts: {len(new)} {counts}')

old_by_candidate = {row['candidate_id']: row for row in old}
new_by_candidate = {row['candidate_id']: row for row in new}
if len(new_by_candidate) != len(new):
    errors.append('duplicate candidate ID')
if not set(old_by_candidate).issubset(new_by_candidate):
    errors.append('lost R71 candidate')

corrected_dates = {
    'mongol:wulahai-capture-1209': '1209',
    'mongol:invasion-champa-1282-1284': '1282-1284',
    'mongol:second-invasion-dai-viet-1285': '1285',
    'mongol:sambyeolcho-revolt-1270-1273': '1270-1273',
    'mongol:conquest-dali-yunnan-1253-1254': '1253-1254',
}
split = 'mongol-cand:qarakhitai_khwarazm_central_asia:10:urgench-nishapur-herat'
children = {
    'mongol:capture-gurganj-1221',
    'mongol:capture-nishapur-1221',
    'mongol:first-capture-herat-1221',
    'mongol:recapture-herat-1222',
}
for candidate_id, original in old_by_candidate.items():
    current = new_by_candidate.get(candidate_id)
    if current is None:
        continue
    if candidate_id == split:
        if current['disposition'] != 'superseded' or current['canonical_id']:
            errors.append('aggregate must be superseded without a canonical ID')
        if not all(ident in current['disposition_reason'] for ident in children):
            errors.append('aggregate lacks child links')
        continue
    allowed = {'date_label'} if original['canonical_id'] in corrected_dates else set()
    for field, value in original.items():
        if field not in allowed and current[field] != value:
            errors.append(f'unexpected R71 edit: {candidate_id} {field}')
    if original['canonical_id'] in corrected_dates and current['date_label'] != corrected_dates[original['canonical_id']]:
        errors.append(f'date not corrected: {candidate_id}')

additions = set(new_by_candidate) - set(old_by_candidate)
if len(additions) != 4 or {new_by_candidate[key]['canonical_id'] for key in additions} != children:
    errors.append('child candidate set differs from R72 amendment')

included_ids = [row['canonical_id'] for row in new if row['disposition'] == 'include']
if len(included_ids) != len(set(included_ids)):
    errors.append('duplicate include canonical ID')
for row in new:
    disposition = row['disposition']
    if disposition == 'merge' and row['canonical_id'] not in included_ids:
        errors.append(f'orphan merge: {row["candidate_id"]}')
    if disposition == 'include' and not row['canonical_id']:
        errors.append(f'include without canonical ID: {row["candidate_id"]}')
    if disposition != 'superseded' and (
        not row['primary_locator_1']
        or row['materiality_status'] not in ('A', 'B')
        or 'citation-only' not in row['rights_status']
        or not row['geometry_status']
    ):
        errors.append(f'governance: {row["candidate_id"]}')

if errors:
    raise SystemExit('FAIL R72: ' + '; '.join(errors))
print('PASS R72: 113 candidates / 107 include / 5 merge / 1 superseded; five dates corrected; all merge targets exist')
