#!/usr/bin/env python3
"""
Generate interactive Jupyter notebooks from markdown documentation
for hands-on exploration of RAG memory backend concepts.
"""

import re
import json
from pathlib import Path
from typing import List, Dict

def extract_sections_with_code(markdown_content: str) -> List[Dict]:
    """Extract sections with their explanations and code examples."""
    sections = []
    
    # Split by main sections
    section_pattern = r'### ✅ (\d+)\. ([^#]*?)(.*?)(?=### ✅|\n## |$)'
    matches = re.findall(section_pattern, markdown_content, re.DOTALL)
    
    for number, title, content in matches:
        # Extract code examples
        code_pattern = r'#### 💡 EXAMPLE\s*\n\n```(\w+)\n(.*?)\n```'
        code_matches = re.findall(code_pattern, content, re.DOTALL)
        
        # Extract TO DO items
        todo_pattern = r'#### 📌 TO DO\s*\n\n((?:- ✅.*?\n)*)'
        todo_match = re.search(todo_pattern, content, re.DOTALL)
        todos = []
        if todo_match:
            todo_items = re.findall(r'- ✅ (.*)', todo_match.group(1))
            todos = todo_items
        
        # Extract description
        description_pattern = r'- \*\*Use\*\*: ([^-]*?)(?:\n-|\n#|$)'
        desc_match = re.search(description_pattern, content)
        description = desc_match.group(1).strip() if desc_match else ""
        
        sections.append({
            'number': number,
            'title': title.strip(),
            'description': description,
            'todos': todos,
            'code_examples': code_matches,
            'content': content
        })
    
    return sections

def generate_notebook_cells(sections: List[Dict]) -> List[Dict]:
    """Generate Jupyter notebook cells from extracted sections."""
    cells = []
    
    # Title cell
    cells.append({
        "cell_type": "markdown",
        "metadata": {},
        "source": [
            "# 🎵 Indii.Music RAG Memory Backend - Interactive Guide\n",
            "\n",
            "> This notebook provides hands-on examples for implementing the RAG-enhanced memory system.\n",
            "\n",
            "## 🎯 Prerequisites\n",
            "```bash\n",
            "pip install langchain langchain-community langgraph redis neo4j\n",
            "```"
        ]
    })
    
    for section in sections:
        # Section header
        cells.append({
            "cell_type": "markdown", 
            "metadata": {},
            "source": [
                f"## {section['number']}. {section['title']}\n",
                f"\n",
                f"**Purpose**: {section['description']}\n",
                f"\n",
                f"### Implementation Checklist\n"
            ] + [f"- ✅ {todo}\n" for todo in section['todos']]
        })
        
        # Code examples
        for lang, code in section['code_examples']:
            if lang == 'python':
                # Executable Python cell
                cells.append({
                    "cell_type": "code",
                    "execution_count": None,
                    "metadata": {},
                    "outputs": [],
                    "source": [line + "\n" for line in code.split('\n')]
                })
            else:
                # Non-Python code as markdown
                cells.append({
                    "cell_type": "markdown",
                    "metadata": {},
                    "source": [
                        f"### {lang.upper()} Example\n",
                        f"```{lang}\n",
                        f"{code}\n",
                        f"```"
                    ]
                })
        
        # Interactive exercise
        cells.append({
            "cell_type": "markdown",
            "metadata": {},
            "source": [
                f"### 🧪 Try It Yourself\n",
                f"Modify the code above to:\n",
                f"- Experiment with different parameters\n", 
                f"- Add error handling\n",
                f"- Integrate with your specific use case\n"
            ]
        })
        
        cells.append({
            "cell_type": "code",
            "execution_count": None,
            "metadata": {},
            "outputs": [],
            "source": [
                "# Your experimentation code here\n",
                "# TODO: Implement your modifications\n",
                "pass"
            ]
        })
    
    return cells

def create_notebook(cells: List[Dict]) -> Dict:
    """Create complete Jupyter notebook structure."""
    return {
        "cells": cells,
        "metadata": {
            "kernelspec": {
                "display_name": "Python 3",
                "language": "python", 
                "name": "python3"
            },
            "language_info": {
                "codemirror_mode": {"name": "ipython", "version": 3},
                "file_extension": ".py",
                "mimetype": "text/x-python",
                "name": "python",
                "nbconvert_exporter": "python",
                "pygments_lexer": "ipython3",
                "version": "3.8.0"
            }
        },
        "nbformat": 4,
        "nbformat_minor": 4
    }

def main():
    """Generate interactive documentation."""
    markdown_file = Path("docs/memory_infra.md")
    output_file = Path("docs/interactive_memory_guide.ipynb")
    
    if not markdown_file.exists():
        print(f"Error: {markdown_file} not found")
        return
    
    print("📓 Generating Interactive Jupyter Notebook...")
    
    with open(markdown_file, 'r') as f:
        content = f.read()
    
    sections = extract_sections_with_code(content)
    print(f"Extracted {len(sections)} sections")
    
    cells = generate_notebook_cells(sections)
    print(f"Generated {len(cells)} notebook cells")
    
    notebook = create_notebook(cells)
    
    with open(output_file, 'w') as f:
        json.dump(notebook, f, indent=2)
    
    print(f"✅ Interactive notebook created: {output_file}")
    print(f"🚀 Run with: jupyter notebook {output_file}")

if __name__ == "__main__":
    main()
