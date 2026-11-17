"""Separate reviewed generated sheets and sample closed motion at t=i*T/N.

No endpoint duplication or global reverse playback. Interpolation uses cyclic
bidirectional dense flow, cubic displacement and premultiplied RGBA. This is an
approximation, not an anatomical simulation or a guarantee of visual quality.
"""
from pathlib import Path
import argparse
import json
import cv2
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
CONFIG = {
    'frontal': (4, 4, 3), 'lateral': (4, 4, 4),
    'dos-patas': (6, 4, 1), 'voltereta': (6, 4, 1),
    'curiosidad': (4, 3, 1), 'sacudida': (4, 4, 4), 'lamer': (4, 4, 2),
}
SIZE = 256
Y, X = np.mgrid[:SIZE, :SIZE].astype(np.float32)
GRID = np.stack((X, Y), axis=-1)

def remap(a, coords):
    return cv2.remap(a, coords[..., 0], coords[..., 1], cv2.INTER_LINEAR,
                     borderMode=cv2.BORDER_CONSTANT)

def prepare(name, cols, rows):
    if name in ('frontal', 'lateral'):
        # The generated replacement gaits were rejected after visual inspection:
        # wider pose spacing produced less reliable paw correspondences.
        result = []
        paths=sorted((ROOT/'poses'/name).glob('*.png'))
        if name=='lateral':
            # The first 18 poses contain one complete gait. Later original cells
            # drift upwards and clip the tail; exclude that incomplete second gait.
            paths=paths[:18]
        for i,path in enumerate(paths):
            a = np.array(Image.open(path).convert('RGBA')).astype(np.float32)/255
            a[..., :3] *= a[..., 3:]
            ys,xs=np.where(a[...,3]>8/255)
            tx=128-(xs.min()+xs.max())*.45 if name=='lateral' else 12.8
            lift=6*(1-np.cos(2*np.pi*i/len(paths)))/2
            ty=(224-lift)-ys.max()*.9 if name=='lateral' else 12.8
            result.append(cv2.warpAffine(a, np.float32([[.9,0,tx],[0,.9,ty]]),
                                        (SIZE,SIZE), flags=cv2.INTER_AREA))
        return result
    filename = 'dos-patas-limpio' if name == 'dos-patas' else name
    sheet = Image.open(ROOT / 'revision/generadas' / (filename + '.png')).convert('RGBA')
    cells = []
    for y in range(rows):
        for x in range(cols):
            cell = np.array(sheet.crop((round(x*sheet.width/cols), round(y*sheet.height/rows),
                                       round((x+1)*sheet.width/cols), round((y+1)*sheet.height/rows))))
            # Discard imperceptible alpha noise, never remove fur by colour key.
            cell[cell[..., 3] < 2] = 0
            ys, xs = np.where(cell[..., 3] > 8)
            if not len(xs):
                raise ValueError(f'Empty cell {name} {x} {y}')
            bounds = (xs.min(), ys.min(), xs.max()+1, ys.max()+1)
            cells.append((cell, bounds))
    # One common scale for the entire action; no per-pose stretching.
    scale = min(208/max(b[2]-b[0] for _, b in cells),
                208/max(b[3]-b[1] for _, b in cells))
    result = []
    for i, (cell, (x0,y0,x1,y1)) in enumerate(cells):
        h, w = cell.shape[:2]
        if name in ('frontal','lateral'):
            # Keep the common cell vertical coordinates, including suspension.
            cy = h / 2
            ty = 128 - cy*scale
        else:
            ty = 232-y1*scale
        matrix = np.float32([[scale, 0, 128-(x0+x1)*.5*scale], [0, scale, ty]])
        a = cell.astype(np.float32)/255
        a[..., :3] *= a[..., 3:]
        a = cv2.warpAffine(a, matrix, (SIZE,SIZE), flags=cv2.INTER_AREA)
        result.append(a)
    return result

def rgba(a):
    alpha = np.clip(a[...,3:], 0, 1)
    rgb = np.divide(a[...,:3], alpha, out=np.zeros_like(a[...,:3]), where=alpha>1/255)
    out = np.uint8(np.clip(np.concatenate((rgb,alpha),axis=-1)*255+.5,0,255))
    out[out[...,3]<2] = 0
    return Image.fromarray(out)

def flows(poses):
    # Alpha contributes to silhouette tracking; luminance tracks facial detail.
    grey = [np.uint8(np.clip(cv2.cvtColor(p[...,:3], cv2.COLOR_RGB2GRAY)*.8 + p[...,3]*.2,0,1)*255) for p in poses]
    estimator = cv2.DISOpticalFlow_create(cv2.DISOPTICAL_FLOW_PRESET_MEDIUM)
    estimator.setUseSpatialPropagation(True)
    estimator.setVariationalRefinementIterations(12)
    n = len(poses)
    forward = [estimator.calc(grey[i],grey[(i+1)%n],None) for i in range(n)]
    backward = [estimator.calc(grey[i],grey[(i-1)%n],None) for i in range(n)]
    return forward, backward

def warped(source, displacement):
    # Stable first-order inverse. Fixed-point inversion folded at occlusions and
    # created holes and detached pixels near feet; do not iterate through folds.
    return remap(source,GRID-displacement)

def interpolate(poses, forward, backward, phase):
    n=len(poses); k=int(phase)%n; j=(k+1)%n; t=phase-int(phase)
    if t < 1e-8:
        return poses[k].copy()
    def trajectory(k,j,t,fwd,bwd):
        d=fwd[k]
        m0=.5*(d-bwd[k])
        m1=.5*(d+remap(fwd[j],GRID+d))
        return (t**3-2*t*t+t)*m0+(-2*t**3+3*t*t)*d+(t**3-t*t)*m1
    da=trajectory(k,j,t,forward,backward)
    db=trajectory(j,k,1-t,backward,forward)
    a=warped(poses[k],da); b=warped(poses[j],db)
    # Blend only after geometric registration, not a crossfade of two static dogs.
    u=t*t*(3-2*t)
    output = a*(1-u)+b*u
    # Background flow is unconstrained. Bound it to the swept foreground region
    # plus eight pixels for cubic overshoot, instead of letting background pixels
    # sample the dog from far away. This never crops either endpoint silhouette.
    ys,xs=np.where(np.maximum(poses[k][...,3],poses[j][...,3])>2/255)
    support=(X>=xs.min()-8)&(X<=xs.max()+8)&(Y>=ys.min()-8)&(Y<=ys.max()+8)
    output[~support]=0
    return output

def main():
    parser=argparse.ArgumentParser(); parser.add_argument('--only', choices=CONFIG)
    args=parser.parse_args()
    manifest=json.loads((ROOT/'manifest.json').read_text(encoding='utf-8'))
    for entry in manifest:
        name=entry['id']
        if args.only and name!=args.only: continue
        cols,rows,cycles=CONFIG[name]; poses=prepare(name,cols,rows)
        keydir=ROOT/'poses/refinadas'/name; keydir.mkdir(parents=True,exist_ok=True)
        for stale in keydir.glob('[0-9][0-9][0-9][0-9].png'):
            if int(stale.stem)>=len(poses):
                assert stale.resolve().is_relative_to((ROOT/'poses/refinadas').resolve())
                stale.unlink()
        for i,p in enumerate(poses): rgba(p).save(keydir/f'{i:04}.png')
        forward,backward=flows(poses)
        provenance=[]
        for i in range(entry['frames']):
            phase=(i*cycles*len(poses)/entry['frames'])%len(poses)
            output=interpolate(poses,forward,backward,phase)
            rgba(output).save(ROOT/'animaciones'/name/f'frame_{i:04}.png')
            provenance.append({'frame':i,'time':i/entry['fps'],'pose0':int(phase),
                               'pose1':(int(phase)+1)%len(poses),'fraction':phase-int(phase),
                               'kind':'generated-pose' if abs(phase-round(phase))<1e-8 else 'interpolated'})
        entry.update(keyframes=len(poses), duration=entry['frames']/entry['fps'],
                     width=SIZE,height=SIZE,cycles=cycles,poseDirectory=f'poses/refinadas/{name}',
                     sampling='t=i*T/N; i=0..N-1',interpolation='cyclic DIS flow, cubic motion, premultiplied RGBA',
                     poseSource='existing generated poses' if name in ('frontal','lateral') else 'imagegen from reference photos',
                     visualApproval='pending-playback-review')
        (ROOT/'revision'/f'{name}-procedencia.json').write_text(json.dumps(provenance,indent=2)+'\n',encoding='utf-8')
        print(name, len(poses), 'poses;',entry['frames'],'frames',flush=True)
    data=json.dumps(manifest,ensure_ascii=False,indent=2)
    (ROOT/'manifest.json').write_text(data+'\n',encoding='utf-8')
    (ROOT/'manifest.js').write_text('window.PEQUI = '+data+';\n',encoding='utf-8')

if __name__=='__main__': main()
