#!/var/www/sokos/.venv/bin/python
"""
Sokos Favicon Generator
Generates all required favicon and logo files from a source image.

Usage:
    /var/www/sokos/.venv/bin/python generate_favicons.py sokos-logo.png
    
    Or:
    
    python3 generate_favicons.py sokos-logo.png (if in virtual environment)
    
    Then copy all generated files to /var/www/sokos/public/
"""

import sys
import os
from pathlib import Path
from PIL import Image, ImageDraw

def generate_favicons(source_image_path):
    """Generate all required favicon and logo files."""
    
    # Check if source image exists
    if not os.path.exists(source_image_path):
        print(f"❌ Error: Image file not found: {source_image_path}")
        sys.exit(1)
    
    # Open and convert to RGBA
    print(f"📂 Loading image: {source_image_path}")
    img = Image.open(source_image_path)
    
    if img.mode != 'RGBA':
        print(f"🔄 Converting {img.mode} → RGBA")
        img = img.convert('RGBA')
    
    print(f"✅ Image loaded: {img.size[0]}x{img.size[1]}")
    
    # Define all favicon sizes needed
    favicon_specs = [
        (16, 'favicon-16x16.png', False),
        (32, 'favicon-32x32.png', False),
        (180, 'apple-touch-icon.png', False),
        (192, 'android-chrome-192x192.png', False),
        (512, 'android-chrome-512x512.png', False),
        (150, 'mstile-150x150.png', False),
        (192, 'maskable-192x192.png', True),  # Maskable for PWA
        (512, 'maskable-512x512.png', True),  # Maskable for PWA
    ]
    
    # Generate favicon files
    print("\n🎨 Generating favicon files...")
    for size, filename, is_maskable in favicon_specs:
        print(f"  📐 {filename} ({size}x{size})...", end=' ')
        
        # Create new image
        new_img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        
        # Calculate centered position
        # Resize with padding to maintain aspect ratio
        aspect_ratio = img.width / img.height
        if aspect_ratio >= 1:
            # Wider image
            new_width = int(size * 0.8)
            new_height = int(new_width / aspect_ratio)
        else:
            # Taller image
            new_height = int(size * 0.8)
            new_width = int(new_height * aspect_ratio)
        
        resized = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
        
        # If maskable, add background color
        if is_maskable:
            bg = Image.new('RGBA', (size, size), (22, 163, 74, 255))  # #16a34a
            x = (size - new_width) // 2
            y = (size - new_height) // 2
            bg.paste(resized, (x, y), resized)
            new_img = bg
        else:
            # Paste centered
            x = (size - new_width) // 2
            y = (size - new_height) // 2
            new_img.paste(resized, (x, y), resized)
        
        new_img.save(filename, 'PNG')
        print("✅")
    
    # Generate Open Graph image (1200x630)
    print(f"\n📱 Generating social media image...")
    print(f"  🖼️ logo-og.png (1200x630)...", end=' ')
    og_img = Image.new('RGB', (1200, 630), (255, 255, 255))
    
    # Resize logo to fit on OG image
    og_size = min(1200, 630) - 100  # Leave 50px margin
    og_aspect = img.width / img.height
    if og_aspect >= 1:
        og_width = int(og_size)
        og_height = int(og_width / og_aspect)
    else:
        og_height = int(og_size)
        og_width = int(og_height * og_aspect)
    
    resized_og = img.resize((og_width, og_height), Image.Resampling.LANCZOS)
    
    # Convert resized to RGB if needed
    if resized_og.mode == 'RGBA':
        # Create white background
        bg = Image.new('RGB', (og_width, og_height), (255, 255, 255))
        bg.paste(resized_og, (0, 0), resized_og)
        resized_og = bg
    
    x = (1200 - og_width) // 2
    y = (630 - og_height) // 2
    og_img.paste(resized_og, (x, y))
    og_img.save('logo-og.png', 'PNG')
    print("✅")
    
    # Generate favicon.ico (multi-resolution)
    print(f"\n📌 Generating favicon.ico (16x16, 32x32, 48x48)...")
    ico_sizes = [16, 32, 48]
    ico_images = []
    
    for size in ico_sizes:
        new_img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        aspect_ratio = img.width / img.height
        
        if aspect_ratio >= 1:
            new_width = int(size * 0.8)
            new_height = int(new_width / aspect_ratio)
        else:
            new_height = int(size * 0.8)
            new_width = int(new_height * aspect_ratio)
        
        resized = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
        x = (size - new_width) // 2
        y = (size - new_height) // 2
        new_img.paste(resized, (x, y), resized)
        
        ico_images.append(new_img.convert('RGB'))
    
    ico_images[0].save('favicon.ico', 'ICO', sizes=[(16, 16), (32, 32), (48, 48)])
    print("  ✅ favicon.ico created")
    
    # Generate general logo.png (high quality)
    print(f"\n🎨 Generating high-resolution logo...")
    print(f"  🖼️ logo.png (512x512)...", end=' ')
    logo_size = 512
    logo_img = Image.new('RGBA', (logo_size, logo_size), (0, 0, 0, 0))
    
    aspect_ratio = img.width / img.height
    if aspect_ratio >= 1:
        new_width = int(logo_size * 0.9)
        new_height = int(new_width / aspect_ratio)
    else:
        new_height = int(logo_size * 0.9)
        new_width = int(new_height * aspect_ratio)
    
    resized = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
    x = (logo_size - new_width) // 2
    y = (logo_size - new_height) // 2
    logo_img.paste(resized, (x, y), resized)
    logo_img.save('logo.png', 'PNG')
    print("✅")
    
    # Summary
    print("\n" + "="*60)
    print("✅ All favicon files generated successfully!")
    print("="*60)
    
    print("\n📁 Generated files:")
    files = [
        'favicon.ico',
        'favicon-16x16.png',
        'favicon-32x32.png',
        'apple-touch-icon.png',
        'android-chrome-192x192.png',
        'android-chrome-512x512.png',
        'mstile-150x150.png',
        'maskable-192x192.png',
        'maskable-512x512.png',
        'logo-og.png',
        'logo.png',
    ]
    
    for f in files:
        size = os.path.getsize(f) / 1024  # KB
        print(f"  ✅ {f:<35} ({size:>6.1f} KB)")
    
    print("\n📋 Next steps:")
    print("  1. Copy all generated PNG and ICO files to: /var/www/sokos/public/")
    print("  2. Run: chmod 644 /var/www/sokos/public/*")
    print("  3. Verify in browser and test social media sharing")
    print("  4. Done! 🎉")
    
    print("\n💡 Copy command:")
    print("  cp *.png *.ico /var/www/sokos/public/ 2>/dev/null && chmod 644 /var/www/sokos/public/*.{png,ico}")

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python3 generate_favicons.py <source_image.png>")
        print("\nExample:")
        print("  python3 generate_favicons.py sokos-logo.png")
        sys.exit(1)
    
    generate_favicons(sys.argv[1])
