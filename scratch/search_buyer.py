with open(r"d:\FinalWorkWeb\js\buyer.js", "r", encoding="utf-8") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "AI_REC_SYSTEM" in line or "explainProduct" in line:
        print(f"{i+1}: {line.strip()}")
