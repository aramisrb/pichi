"""Decode every PNG and measure circular transitions. Metrics are diagnostic only."""
from pathlib import Path
import argparse,hashlib,json
import cv2
import numpy as np
from PIL import Image,ImageDraw
ROOT=Path(__file__).resolve().parents[1]

def main():
 p=argparse.ArgumentParser();p.add_argument('--tag',default='despues');args=p.parse_args()
 report={}
 for a in json.loads((ROOT/'manifest.json').read_text(encoding='utf-8')):
  assert a['fps']>=30 and 5<=a['frames']/a['fps']<=15
  assert abs(a['duration']-a['frames']/a['fps'])<1e-9
  folder=ROOT/'animaciones'/a['id'];files=sorted(folder.glob('*.png'))
  assert len(files)==a['frames'],(folder,len(files))
  frames=[];hashes=[];margins=[];centers=[];areas=[]
  for i,path in enumerate(files):
   assert path.name==f'frame_{i:04}.png'
   im=Image.open(path);im.load();assert im.mode=='RGBA' and im.size==(a['width'],a['height'])
   ar=np.array(im).astype(np.float32)/255;alpha=ar[...,3]
   assert alpha.min()==0 and alpha.max()>.9
   ys,xs=np.where(alpha>8/255);margins.append(int(min(xs.min(),ys.min(),a['width']-1-xs.max(),a['height']-1-ys.max())))
   yy,xx=np.mgrid[:a['height'],:a['width']];mass=alpha.sum();centers.append([float((xx*alpha).sum()/mass),float((yy*alpha).sum()/mass)]);areas.append(float(mass))
   ar[...,:3]*=ar[...,3:];frames.append(ar);hashes.append(hashlib.sha256(im.tobytes()).hexdigest())
  frames=np.stack(frames);vel=np.roll(frames,-1,axis=0)-frames
  difference=np.abs(vel).mean(axis=(1,2,3));acceleration=np.abs(vel-np.roll(vel,1,axis=0)).mean(axis=(1,2,3))
  center=np.array(centers);speed=np.linalg.norm(np.roll(center,-1,axis=0)-center,axis=1)
  report[a['id']]={'files':len(files),'unique_pixels':len(set(hashes)),'dimensions':[a['width'],a['height']],
    'minimum_margin_alpha_gt_8':min(margins),'identical_last_first':hashes[-1]==hashes[0],
    'adjacent_duplicates':sum(hashes[i]==hashes[(i+1)%len(hashes)] for i in range(len(hashes))),
    'seam_difference':float(difference[-1]),'internal_median_difference':float(np.median(difference[:-1])),
    'internal_p95_difference':float(np.percentile(difference[:-1],95)),
    'seam_acceleration':float(max(acceleration[0],acceleration[-1])),
    'internal_p95_acceleration':float(np.percentile(acceleration[1:-1],95)),
    'seam_centroid_speed_px':float(speed[-1]),'internal_p95_centroid_speed_px':float(np.percentile(speed[:-1],95)),
    'differences':difference.tolist(),'accelerations':acceleration.tolist(),'centroid_speeds_px':speed.tolist(),
    'alpha_mass':areas,'visual_pass':None}
  ids=list(range(a['frames']-10,a['frames']))+list(range(10))
  # All twenty frames at native resolution, three compositing backgrounds.
  for bg in ['claro','oscuro','salon']:
   sheet=Image.new('RGB',(a['width']*10,(a['height']+22)*2),'#777777');d=ImageDraw.Draw(sheet)
   for k,i in enumerate(ids):
    base=Image.open(ROOT/'fondos/salon.jpg').convert('RGBA').resize((a['width'],a['height'])) if bg=='salon' else Image.new('RGBA',(a['width'],a['height']),'#f8f8f8' if bg=='claro' else '#18212d')
    base.alpha_composite(Image.open(files[i]));x=(k%10)*a['width'];y=(k//10)*(a['height']+22)
    sheet.paste(base.convert('RGB'),(x,y));d.text((x+4,y+a['height']+3),str(i),fill='white')
   sheet.save(ROOT/'revision'/f'{a["id"]}-{args.tag}-cierre-{bg}.jpg',quality=92)
  print(a['id'],{k:v for k,v in report[a['id']].items() if not isinstance(v,list)},flush=True)
 (ROOT/'revision'/f'metricas-{args.tag}.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')

if __name__=='__main__':main()
