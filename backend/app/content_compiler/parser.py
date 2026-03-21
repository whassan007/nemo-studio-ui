import os
import json
import nbformat
from pathlib import Path
from typing import Dict, List, Any

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
NOTEBOOKS_DIR = BASE_DIR / "knowledge_source" / "notebooks"
OUTPUT_DIR = BASE_DIR / "backend" / "app" / "content_compiler"
OUTPUT_FILE = OUTPUT_DIR / "content_store.json"

def compile_notebooks() -> Dict[str, Any]:
    """
    Reads all notebooks in the knowledge_source/notebooks directory,
    extracts markdown cells and specific code cells tagged for the UI,
    and returns a structured dictionary representing the curriculum content.
    """
    content_store = {
        "lessons": {},
        "ui_panels": [],
        "math_cards": []
    }

    if not NOTEBOOKS_DIR.exists():
        print(f"Warning: Notebook directory {NOTEBOOKS_DIR} does not exist.")
        return content_store

    for nb_path in sorted(NOTEBOOKS_DIR.glob("*.ipynb")):
        print(f"Processing notebook: {nb_path.name}")
        
        with open(nb_path, "r", encoding="utf-8") as f:
            nb = nbformat.read(f, as_version=4)
        
        lesson_id = nb_path.stem
        lesson_content = {
            "title": lesson_id.replace("_", " ").title(),
            "sections": []
        }

        for i, cell in enumerate(nb.cells):
            # Extract standard markdown for the contextual Help Panel
            if cell.cell_type == "markdown":
                source = cell.source.strip()
                if source:
                    lesson_content["sections"].append({
                        "type": "markdown",
                        "content": source,
                        "cell_index": i
                    })
                    
                    # Detect MathJax/Katex equations for MathCards
                    if "$$" in source or "\\begin{equation}" in source:
                        content_store["math_cards"].append({
                            "lesson_id": lesson_id,
                            "content": source
                        })

            # Extract specific Code cells tagged for UI Context
            elif cell.cell_type == "code":
                source = cell.source.strip()
                if source.startswith("# UI_PANEL"):
                    content_store["ui_panels"].append({
                        "lesson_id": lesson_id,
                        "code": source.replace("# UI_PANEL", "").strip(),
                        "cell_index": i
                    })
        
        content_store["lessons"][lesson_id] = lesson_content

    return content_store

def main():
    print("Starting Content Compilation Pipeline...")
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    store = compile_notebooks()
    
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(store, f, indent=2)
        
    print(f"Successfully compiled {len(store['lessons'])} notebooks into {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
