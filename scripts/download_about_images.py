#!/usr/bin/env python3
"""
Download images for About section pages:
- Mission hero image from Beehiiv
- Team photos from PracticeNow
"""

import os
import re
import sys
import requests
from pathlib import Path
from urllib.parse import urljoin, urlparse

# Get script directory and set paths
SCRIPT_DIR = Path(__file__).parent.resolve()
MARKETING_DIR = SCRIPT_DIR.parent
IMAGES_ABOUT_DIR = MARKETING_DIR / "images" / "about"

# Create images/about directory
IMAGES_ABOUT_DIR.mkdir(parents=True, exist_ok=True)

def download_image(url, dest_path, description):
    """Download an image from URL to destination path."""
    try:
        print(f"  Downloading {description}...")
        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
        response = requests.get(url, stream=True, timeout=30, headers=headers)
        response.raise_for_status()
        
        with open(dest_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        
        # Verify file was written and has content
        if dest_path.exists() and dest_path.stat().st_size > 0:
            print(f"  ✓ Downloaded {description} ({dest_path.stat().st_size:,} bytes)")
            return True
        else:
            print(f"  ✗ Failed: File is empty")
            return False
    except Exception as e:
        print(f"  ✗ Failed to download {description}: {e}")
        return False

def find_images_in_html(html_content, base_url, patterns=None):
    """Find image URLs in HTML content."""
    images = set()
    
    # Find all img src attributes
    img_pattern = r'<img[^>]+src=["\']([^"\']+)["\']'
    for match in re.finditer(img_pattern, html_content, re.IGNORECASE):
        img_url = match.group(1)
        # Convert relative URLs to absolute
        if img_url.startswith('//'):
            img_url = 'https:' + img_url
        elif not img_url.startswith('http'):
            img_url = urljoin(base_url, img_url)
        images.add(img_url)
    
    # Also check for background-image in CSS
    bg_pattern = r'background-image:\s*url\(["\']?([^"\'()]+)["\']?\)'
    for match in re.finditer(bg_pattern, html_content, re.IGNORECASE):
        img_url = match.group(1)
        if img_url.startswith('//'):
            img_url = 'https:' + img_url
        elif not img_url.startswith('http'):
            img_url = urljoin(base_url, img_url)
        images.add(img_url)
    
    # Filter by patterns if provided
    if patterns:
        filtered = set()
        for img_url in images:
            for pattern in patterns:
                if pattern.lower() in img_url.lower():
                    filtered.add(img_url)
                    break
        return filtered
    
    return images

def main():
    print("Downloading images for About section...\n")
    
    # 1. Download Beehiiv mission image
    print("1. Fetching Beehiiv mission image...")
    try:
        beehiiv_url = "https://sparktutor.beehiiv.com/p/spark-mission"
        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5'
        }
        response = requests.get(beehiiv_url, timeout=30, headers=headers)
        response.raise_for_status()
        
        # Look for images in the content
        images = find_images_in_html(response.text, beehiiv_url)
        
        # Filter for likely mission/TLDR images (look for beehiiv CDN images that aren't logos)
        mission_images = [
            img for img in images 
            if 'beehiiv' in img.lower() 
            and any(ext in img.lower() for ext in ['.jpg', '.jpeg', '.png', '.webp'])
            and 'logo' not in img.lower()
        ]
        
        if mission_images:
            # Prefer larger images or ones with "mission" or "summary" in the URL
            preferred = [img for img in mission_images if any(word in img.lower() for word in ['mission', 'summary', 'tldr', 'hero'])]
            target_img = preferred[0] if preferred else mission_images[0]
            
            dest_path = IMAGES_ABOUT_DIR / "spark-mission-hero.jpg"
            download_image(target_img, dest_path, "Beehiiv mission image")
        else:
            print("  ⚠ Could not find mission image in Beehiiv page")
            print(f"  Found {len(images)} total images on page")
    except Exception as e:
        print(f"  ✗ Error fetching Beehiiv page: {e}")
    
    print()
    
    # 2. Download PracticeNow team photos
    print("2. Fetching PracticeNow team photos...")
    try:
        pn_url = "https://practicenow.us/about-us/"
        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
        response = requests.get(pn_url, timeout=30, headers=headers)
        response.raise_for_status()
        
        # Find all images on the page
        images = find_images_in_html(response.text, pn_url)
        
        # Look for team member images (try different naming patterns)
        team_images = {}
        
        # Try to find by name patterns
        for img_url in images:
            img_lower = img_url.lower()
            if 'wp-content/uploads' in img_lower:
                if any(name in img_lower for name in ['vaidy', 'vaidya', 'vaidipala']):
                    team_images['vaidy'] = img_url
                elif 'leena' in img_lower:
                    team_images['leena'] = img_url
                elif any(name in img_lower for name in ['janaki', 'janaky']):
                    team_images['janaki'] = img_url
        
        # If we didn't find by name, try to get images from wp-content/uploads that look like photos
        if len(team_images) < 3:
            upload_images = [
                img for img in images 
                if 'wp-content/uploads' in img.lower()
                and any(ext in img.lower() for ext in ['.jpg', '.jpeg', '.png'])
                and 'logo' not in img.lower()
                and 'icon' not in img.lower()
                and 'favicon' not in img.lower()
            ]
            
            # Use first few upload images as team photos
            for i, name in enumerate(['vaidy', 'leena', 'janaki']):
                if name not in team_images and i < len(upload_images):
                    team_images[name] = upload_images[i]
        
        # Download team photos
        for name in ['vaidy', 'leena', 'janaki']:
            if name in team_images:
                dest_path = IMAGES_ABOUT_DIR / f"team-{name}.jpg"
                download_image(team_images[name], dest_path, f"Team photo: {name.capitalize()}")
            else:
                print(f"  ⚠ Could not find image URL for {name.capitalize()}")
        
    except Exception as e:
        print(f"  ✗ Error fetching PracticeNow page: {e}")
    
    print()
    print(f"Done! Images saved to: {IMAGES_ABOUT_DIR}")
    
    # List downloaded files
    downloaded = list(IMAGES_ABOUT_DIR.glob("*"))
    if downloaded:
        print(f"\nDownloaded files:")
        for f in sorted(downloaded):
            size = f.stat().st_size
            print(f"  - {f.name} ({size:,} bytes)")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nDownload interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n✗ Fatal error: {e}")
        sys.exit(1)

