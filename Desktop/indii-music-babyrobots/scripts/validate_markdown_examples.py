#!/usr/bin/env python3
"""
Script to validate code examples in markdown files.
Checks Python syntax, JSON formatting, and basic Cypher syntax.
"""

import re
import json
import ast
import sys
from pathlib import Path

def extract_code_blocks(file_path):
    """Extract all code blocks from a markdown file."""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find all code blocks with language specifiers
    pattern = r'```(\w+)\n(.*?)\n```'
    matches = re.findall(pattern, content, re.DOTALL)
    
    return matches

def validate_python_code(code):
    """Validate Python code syntax."""
    try:
        ast.parse(code)
        return True, "Valid Python syntax"
    except SyntaxError as e:
        return False, f"Python syntax error: {e}"

def validate_json_code(code):
    """Validate JSON code."""
    try:
        json.loads(code)
        return True, "Valid JSON"
    except json.JSONDecodeError as e:
        return False, f"JSON error: {e}"

def validate_cypher_code(code):
    """Basic Cypher syntax validation."""
    # Basic check for Cypher keywords and structure
    cypher_keywords = ['CREATE', 'MATCH', 'RETURN', 'WHERE', 'WITH']
    has_keyword = any(keyword in code.upper() for keyword in cypher_keywords)
    
    if has_keyword:
        return True, "Basic Cypher structure detected"
    else:
        return False, "No Cypher keywords found"

def validate_markdown_file(file_path):
    """Validate all code examples in a markdown file."""
    print(f"\nValidating: {file_path}")
    print("=" * 50)
    
    code_blocks = extract_code_blocks(file_path)
    
    if not code_blocks:
        print("No code blocks found")
        return True
    
    all_valid = True
    
    for i, (language, code) in enumerate(code_blocks, 1):
        print(f"\nCode block {i} ({language}):")
        print("-" * 30)
        
        if language.lower() == 'python':
            valid, message = validate_python_code(code)
        elif language.lower() == 'json':
            valid, message = validate_json_code(code)
        elif language.lower() == 'cypher':
            valid, message = validate_cypher_code(code)
        else:
            valid, message = True, f"Skipping validation for {language}"
        
        status = "✅ PASS" if valid else "❌ FAIL"
        print(f"{status}: {message}")
        
        if not valid:
            all_valid = False
            print(f"Code snippet:\n{code[:200]}...")
    
    return all_valid

def main():
    """Main validation function."""
    if len(sys.argv) > 1:
        file_path = Path(sys.argv[1])
    else:
        file_path = Path("docs/memory_infra.md")
    
    if not file_path.exists():
        print(f"Error: File {file_path} not found")
        sys.exit(1)
    
    print("🧪 Markdown Code Examples Validator")
    print("Testing all code blocks for syntax validity...")
    
    success = validate_markdown_file(file_path)
    
    if success:
        print("\n🎉 All code examples are valid!")
        sys.exit(0)
    else:
        print("\n❌ Some code examples have issues")
        sys.exit(1)

if __name__ == "__main__":
    main()
