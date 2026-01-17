#!/bin/bash
# Script to download images for About section pages

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MARKETING_DIR="$(dirname "$SCRIPT_DIR")"
IMAGES_ABOUT_DIR="$MARKETING_DIR/images/about"

# Create images/about directory if it doesn't exist
mkdir -p "$IMAGES_ABOUT_DIR"

echo "Downloading images for About section..."

# 1. Download Beehiiv mission image
# First, let's try to get the image URL from the page
echo "Fetching Beehiiv mission image..."
BEEHIIV_HTML=$(curl -s "https://sparktutor.beehiiv.com/p/spark-mission" || echo "")

if [ -n "$BEEHIIV_HTML" ]; then
    # Try to find image URLs in the HTML
    BEEHIIV_IMAGE=$(echo "$BEEHIIV_HTML" | grep -o 'https://[^"]*cdn\.beehiiv\.com[^"]*' | grep -E '\.(jpg|jpeg|png|webp)' | head -1)
    
    if [ -z "$BEEHIIV_IMAGE" ]; then
        # Try alternative pattern - look for img src
        BEEHIIV_IMAGE=$(echo "$BEEHIIV_HTML" | grep -oP 'src="https://[^"]*\.(jpg|jpeg|png|webp)' | sed 's/src="//' | head -1)
    fi
    
    if [ -n "$BEEHIIV_IMAGE" ]; then
        echo "  Found image: $BEEHIIV_IMAGE"
        curl -s -L "$BEEHIIV_IMAGE" -o "$IMAGES_ABOUT_DIR/spark-mission-hero.jpg" || echo "  Failed to download Beehiiv image"
        if [ -f "$IMAGES_ABOUT_DIR/spark-mission-hero.jpg" ] && [ -s "$IMAGES_ABOUT_DIR/spark-mission-hero.jpg" ]; then
            echo "  ✓ Downloaded spark-mission-hero.jpg"
        fi
    else
        echo "  ⚠ Could not find Beehiiv mission image URL in page"
    fi
else
    echo "  ⚠ Could not fetch Beehiiv page"
fi

# 2. Download PracticeNow team photos
echo ""
echo "Fetching PracticeNow team photos..."

PRACTICENOW_HTML=$(curl -s "https://practicenow.us/about-us/" || echo "")

if [ -n "$PRACTICENOW_HTML" ]; then
    # Extract all image URLs from the page
    IMAGE_URLS=$(echo "$PRACTICENOW_HTML" | grep -oP 'src="https://[^"]*\.(jpg|jpeg|png|webp)' | sed 's/src="//' | sort -u)
    
    # Look for specific team member images (common patterns on WordPress sites)
    # Vaidy
    VAIDY_IMG=$(echo "$PRACTICENOW_HTML" | grep -oP 'https://[^"]*practicenow\.us[^"]*(vaidy|vaidya)[^"]*\.(jpg|jpeg|png|webp)' | head -1)
    if [ -z "$VAIDY_IMG" ]; then
        # Try wp-content pattern
        VAIDY_IMG=$(echo "$IMAGE_URLS" | grep -i "vaidy\|vaidya" | head -1)
    fi
    if [ -z "$VAIDY_IMG" ]; then
        # Try to find images in wp-content/uploads that might be team photos
        VAIDY_IMG=$(echo "$IMAGE_URLS" | grep "wp-content/uploads" | grep -v "logo\|icon" | head -1)
    fi
    
    # Leena
    LEENA_IMG=$(echo "$PRACTICENOW_HTML" | grep -oP 'https://[^"]*practicenow\.us[^"]*leena[^"]*\.(jpg|jpeg|png|webp)' | head -1)
    if [ -z "$LEENA_IMG" ]; then
        LEENA_IMG=$(echo "$IMAGE_URLS" | grep -i "leena" | head -1)
    fi
    if [ -z "$LEENA_IMG" ]; then
        # Get second image if first was Vaidy
        LEENA_IMG=$(echo "$IMAGE_URLS" | grep "wp-content/uploads" | grep -v "logo\|icon" | sed -n '2p')
    fi
    
    # Janaki
    JANAKI_IMG=$(echo "$PRACTICENOW_HTML" | grep -oP 'https://[^"]*practicenow\.us[^"]*janaki[^"]*\.(jpg|jpeg|png|webp)' | head -1)
    if [ -z "$JANAKI_IMG" ]; then
        JANAKI_IMG=$(echo "$IMAGE_URLS" | grep -i "janaki\|janaki" | head -1)
    fi
    if [ -z "$JANAKI_IMG" ]; then
        # Get third image
        JANAKI_IMG=$(echo "$IMAGE_URLS" | grep "wp-content/uploads" | grep -v "logo\|icon" | sed -n '3p')
    fi
    
    # Download Vaidy
    if [ -n "$VAIDY_IMG" ]; then
        echo "  Found Vaidy image: $VAIDY_IMG"
        curl -s -L "$VAIDY_IMG" -o "$IMAGES_ABOUT_DIR/team-vaidy.jpg" || echo "  Failed to download Vaidy image"
        if [ -f "$IMAGES_ABOUT_DIR/team-vaidy.jpg" ] && [ -s "$IMAGES_ABOUT_DIR/team-vaidy.jpg" ]; then
            echo "  ✓ Downloaded team-vaidy.jpg"
        fi
    else
        echo "  ⚠ Could not find Vaidy image URL"
    fi
    
    # Download Leena
    if [ -n "$LEENA_IMG" ]; then
        echo "  Found Leena image: $LEENA_IMG"
        curl -s -L "$LEENA_IMG" -o "$IMAGES_ABOUT_DIR/team-leena.jpg" || echo "  Failed to download Leena image"
        if [ -f "$IMAGES_ABOUT_DIR/team-leena.jpg" ] && [ -s "$IMAGES_ABOUT_DIR/team-leena.jpg" ]; then
            echo "  ✓ Downloaded team-leena.jpg"
        fi
    else
        echo "  ⚠ Could not find Leena image URL"
    fi
    
    # Download Janaki
    if [ -n "$JANAKI_IMG" ]; then
        echo "  Found Janaki image: $JANAKI_IMG"
        curl -s -L "$JANAKI_IMG" -o "$IMAGES_ABOUT_DIR/team-janaki.jpg" || echo "  Failed to download Janaki image"
        if [ -f "$IMAGES_ABOUT_DIR/team-janaki.jpg" ] && [ -s "$IMAGES_ABOUT_DIR/team-janaki.jpg" ]; then
            echo "  ✓ Downloaded team-janaki.jpg"
        fi
    else
        echo "  ⚠ Could not find Janaki image URL"
    fi
else
    echo "  ⚠ Could not fetch PracticeNow page"
fi

echo ""
echo "Done! Images saved to: $IMAGES_ABOUT_DIR"

