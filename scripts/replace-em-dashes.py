#!/usr/bin/env python3
"""
Replace em dashes (—) with " - " in HTML files within the marketing folder.
Shows a preview first before making changes.
"""

import os
import re
from pathlib import Path

# Em dash character (Unicode U+2014)
EM_DASH = "—"
REPLACEMENT = " - "

def find_html_files(root_dir):
    """Find all HTML files in the directory tree."""
    html_files = []
    root_path = Path(root_dir)
    for file_path in root_path.rglob("*.html"):
        html_files.append(file_path)
    return sorted(html_files)

def count_replacements(content):
    """Count how many em dashes are in the content."""
    return content.count(EM_DASH)

def preview_changes(root_dir):
    """Show a preview of files that would be changed."""
    html_files = find_html_files(root_dir)
    files_to_change = []
    total_replacements = 0
    
    print("Scanning HTML files for em dashes (—)...\n")
    
    for file_path in html_files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            count = count_replacements(content)
            if count > 0:
                files_to_change.append((file_path, count))
                total_replacements += count
        except Exception as e:
            print(f"Error reading {file_path}: {e}")
    
    if not files_to_change:
        print("No em dashes found in any HTML files.")
        return False
    
    print(f"Found {len(files_to_change)} file(s) with em dashes:\n")
    for file_path, count in files_to_change:
        # Show relative path from marketing folder
        rel_path = file_path.relative_to(root_dir)
        print(f"  {rel_path}: {count} replacement(s)")
    
    print(f"\nTotal: {total_replacements} replacement(s) across {len(files_to_change)} file(s)")
    return True

def apply_replacements(root_dir):
    """Apply the replacements to all HTML files."""
    html_files = find_html_files(root_dir)
    files_changed = 0
    total_replacements = 0
    
    print("\nApplying replacements...\n")
    
    for file_path in html_files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            count = count_replacements(content)
            if count > 0:
                new_content = content.replace(EM_DASH, REPLACEMENT)
                
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                
                rel_path = file_path.relative_to(root_dir)
                print(f"  Updated {rel_path}: {count} replacement(s)")
                files_changed += 1
                total_replacements += count
        except Exception as e:
            print(f"Error processing {file_path}: {e}")
    
    print(f"\nDone! Updated {files_changed} file(s) with {total_replacements} total replacement(s).")

def main():
    # Get the marketing folder path (parent of scripts folder)
    script_dir = Path(__file__).parent
    marketing_dir = script_dir.parent
    
    print(f"Marketing folder: {marketing_dir}\n")
    
    # Show preview
    has_changes = preview_changes(marketing_dir)
    
    if not has_changes:
        return
    
    # Ask for confirmation
    print("\n" + "="*60)
    response = input("\nProceed with replacements? (yes/no): ").strip().lower()
    
    if response in ['yes', 'y']:
        apply_replacements(marketing_dir)
    else:
        print("Cancelled. No changes made.")

if __name__ == "__main__":
    main()

