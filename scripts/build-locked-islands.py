"""Build portable disabled-state terrain, preserving transparency and neutral RGB."""
from pathlib import Path
from PIL import Image

assets=Path(__file__).resolve().parents[1]/'assets'
for name in ['island-crescent','island-twins','island-volcanic','island-waterfall','island-atoll']:
    source=Image.open(assets/f'{name}.webp').convert('RGBA')
    gray=source.convert('L')
    locked=Image.merge('RGBA',(gray,gray,gray,source.getchannel('A')))
    locked.thumbnail((600,400),Image.Resampling.LANCZOS)
    target=assets/f'{name}-locked.webp'
    locked.save(target,lossless=True,method=6)
    print(target.name,target.stat().st_size,'bytes')
