import csv,subprocess
p='mongol_denominator_round71.csv';R=list(csv.DictReader(open(p)));F=R[0].keys();T=[]
def q(n,m):
 r=[dict(x) for x in R];m(r);o=open(p,'rb').read()
 try:
  with open(p,'w',newline='') as f:w=csv.DictWriter(f,fieldnames=F);w.writeheader();w.writerows(r)
  T.append((n,subprocess.run(['python3','validate_mongol_round71.py'],capture_output=True).returncode!=0))
 finally:open(p,'wb').write(o)
q('drop',lambda r:r.pop());q('duplicate id',lambda r:r[0].update(candidate_id=r[1]['candidate_id']));q('missing locator',lambda r:next(x for x in r if x['candidate_id'].endswith('tibet-qoridai')).__setitem__('primary_locator_1',''));q('invalid exclude',lambda r:r[0].__setitem__('disposition','exclude'))
for n,v in T:print('REJECTED' if v else 'MISSED',n)
raise SystemExit(not all(v for _,v in T))
