import csv,collections,sys
R=list(csv.DictReader(open('mongol_denominator_round71.csv')));c=collections.Counter(x['disposition'] for x in R);e=[]
if len(R)!=109:e+=['denominator']
if c!=collections.Counter({'hold':0,'include':103,'merge':6}):e+=[str(c)]
if len({x['candidate_id'] for x in R})!=109:e+=['duplicate']
if any(x['candidate_id'].endswith(':erzurum-kose-dag') for x in R):e+=['unsplit pair']
for x in R:
 if x['disposition']!='hold' and (not x['primary_locator_1'] or x['materiality_status'] not in ('A','B') or 'citation-only' not in x['rights_status'] or not x['geometry_status']):e+=['governance']
print(('PASS' if not e else 'FAIL')+f' 109: 103 include / 0 hold / 6 merge / 0 exclude; errors {e}');sys.exit(bool(e))
