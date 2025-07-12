#!/usr/bin/env python3
"""
Comprehensive markdown format checker for the memory infrastructure plan.
Validates structure, formatting, links, and common issues.
"""

import re
import sys
from pathlib import Path

def check_headers(content):
    """Check header structure and hierarchy."""
    issues = []
    lines = content.split('\n')
    
    header_pattern = re.compile(r'^(#{1,6})\s+(.+)$')
    headers = []
    
    for i, line in enumerate(lines, 1):
        match = header_pattern.match(line)
        if match:
            level = len(match.group(1))
            text = match.group(2)
            headers.append((i, level, text))
    
    # Check for h1 at start
    if not headers or headers[0][1] != 1:
        issues.append("Document should start with a single H1 header")
    
    # Check header hierarchy
    prev_level = 0
    for line_num, level, text in headers:
        if level > prev_level + 1:
            issues.append(f"Line {line_num}: Header level jumps from {prev_level} to {level}")
        prev_level = level
    
    return issues

def check_code_blocks(content):
    """Check code block formatting."""
    issues = []
    
    # Count opening and closing code fences
    fence_count = content.count('```')
    if fence_count % 2 != 0:
        issues.append("Unmatched code block fences (``` count is odd)")
    
    # Check for proper language tags on opening fences only
    lines = content.split('\n')
    in_code_block = False
    
    for i, line in enumerate(lines, 1):
        if line.strip().startswith('```'):
            if not in_code_block:
                # Opening fence - check for language
                lang = line.strip()[3:].strip()
                if not lang:
                    issues.append(f"Line {i}: Code block without language specification")
                in_code_block = True
            else:
                # Closing fence
                in_code_block = False
    
    return issues

def check_tables(content):
    """Check table formatting."""
    issues = []
    lines = content.split('\n')
    
    in_table = False
    table_start = 0
    
    for i, line in enumerate(lines):
        if '|' in line and line.strip().startswith('|'):
            if not in_table:
                in_table = True
                table_start = i + 1
            
            # Check pipe alignment
            if not line.strip().endswith('|'):
                issues.append(f"Line {i+1}: Table row should end with |")
        elif in_table and line.strip() == '':
            in_table = False
        elif in_table and '|' not in line:
            in_table = False
    
    return issues

def check_links(content):
    """Check link formatting."""
    issues = []
    
    # Check for malformed links
    link_patterns = [
        r'\[([^\]]+)\]\(([^)]+)\)',  # [text](url)
        r'<([^>]+)>',                # <url>
    ]
    
    for pattern in link_patterns:
        matches = re.findall(pattern, content)
        for match in matches:
            if isinstance(match, tuple):
                text, url = match
                if not url.strip():
                    issues.append(f"Empty URL in link: [{text}]()")
            else:
                url = match
                if not url.strip():
                    issues.append(f"Empty URL in link: <{url}>")
    
    return issues

def check_lists(content):
    """Check list formatting."""
    issues = []
    lines = content.split('\n')
    
    for i, line in enumerate(lines, 1):
        stripped = line.strip()
        
        # Skip horizontal rules
        if stripped == '---' or stripped.startswith('---'):
            continue
        
        # Check for inconsistent list markers
        if stripped.startswith('- ') or stripped.startswith('* ') or stripped.startswith('+ '):
            if line.startswith(' ') and not line.startswith('  '):
                issues.append(f"Line {i}: Inconsistent list indentation")
        
        # Check for missing space after list marker (but not horizontal rules)
        if re.match(r'^[\s]*[-*+][^\s]', line) and not re.match(r'^[\s]*---', line):
            issues.append(f"Line {i}: Missing space after list marker")
    
    return issues

def check_emoji_usage(content):
    """Check emoji usage consistency."""
    issues = []
    
    # Common emoji patterns in the document
    emoji_pattern = r'[\U0001F600-\U0001F64F\U0001F300-\U0001F5FF\U0001F680-\U0001F6FF\U0001F1E0-\U0001F1FF\u2600-\u26FF\u2700-\u27BF]'
    
    lines = content.split('\n')
    for i, line in enumerate(lines, 1):
        if re.search(emoji_pattern, line):
            # Check if emoji is used in headers appropriately
            if line.startswith('#') and not re.match(r'^#+\s+[^\w]*\w', line):
                issues.append(f"Line {i}: Header might have emoji formatting issues")
    
    return issues

def validate_markdown_file(file_path):
    """Run all validation checks on a markdown file."""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    print(f"🔍 Validating markdown format: {file_path}")
    print("=" * 60)
    
    all_issues = []
    
    checks = [
        ("Headers", check_headers),
        ("Code Blocks", check_code_blocks),
        ("Tables", check_tables),
        ("Links", check_links),
        ("Lists", check_lists),
        ("Emoji Usage", check_emoji_usage),
    ]
    
    for check_name, check_function in checks:
        print(f"\n🔎 Checking {check_name}...")
        issues = check_function(content)
        
        if issues:
            print(f"  ❌ Found {len(issues)} issue(s):")
            for issue in issues:
                print(f"    • {issue}")
            all_issues.extend(issues)
        else:
            print(f"  ✅ {check_name} look good!")
    
    return len(all_issues) == 0, all_issues

def main():
    """Main validation function."""
    if len(sys.argv) > 1:
        file_path = Path(sys.argv[1])
    else:
        file_path = Path("docs/memory_infra.md")
    
    if not file_path.exists():
        print(f"Error: File {file_path} not found")
        sys.exit(1)
    
    success, issues = validate_markdown_file(file_path)
    
    print("\n" + "=" * 60)
    if success:
        print("🎉 All markdown formatting checks passed!")
        sys.exit(0)
    else:
        print(f"❌ Found {len(issues)} formatting issues that should be addressed")
        sys.exit(1)

if __name__ == "__main__":
    main()
