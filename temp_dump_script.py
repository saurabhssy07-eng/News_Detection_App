from pathlib import Path
lines = Path('script.js').read_text(encoding='utf-8').splitlines()
for i in range(540, 620):
    print(f"{i+1}:{lines[i]}")
