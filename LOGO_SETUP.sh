#!/bin/bash

# 🎨 SOKOS LOGO & FAVICON SETUP
# =====================================
# This script helps you set up the Sokos logo and favicon

cat << 'EOF'

╔════════════════════════════════════════════════════════════════╗
║      🎨 SOKOS LOGO & FAVICON SETUP - QUICK GUIDE             ║
║             Complete Branding for sokos.co.ke                ║
╚════════════════════════════════════════════════════════════════╝

✅ WHAT HAS BEEN CONFIGURED
──────────────────────────────────────────────────────────────────

Updated Files:
  ✅ frontend/index.html         - Added comprehensive metadata
  ✅ public/site.webmanifest     - PWA manifest created
  ✅ public/browserconfig.xml    - Windows tile config created

Metadata Includes:
  ✅ Open Graph (OG) tags for Facebook, LinkedIn, WhatsApp
  ✅ Twitter Card tags for Twitter/X
  ✅ Favicon links (multiple formats)
  ✅ Apple iOS configuration
  ✅ Android PWA configuration
  ✅ Theme color (#16a34a - Sokos green)


🚀 QUICK START (3 STEPS)
──────────────────────────────────────────────────────────────────

STEP 1: Prepare Your Sokos Logo Image
  - Save as: sokos-logo.png
  - Format: PNG (with transparency preferred)
  - Quality: High resolution (at least 512x512)
  - Location: Your working directory

STEP 2: Generate Favicon Files
  
  Option A - Using Python (Recommended):
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    python3 /var/www/sokos/generate_favicons.py sokos-logo.png
    
  Option B - Online (RealFaviconGenerator):
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    1. Go to: https://realfavicongenerator.net/
    2. Upload sokos-logo.png
    3. Configure and download
    4. Extract all files

STEP 3: Copy Files to Server
  
    cp *.png *.ico /var/www/sokos/public/ 2>/dev/null
    chmod 644 /var/www/sokos/public/*


📁 FILES TO GENERATE
──────────────────────────────────────────────────────────────────

Favicon Files (Required):
  favicon.ico                     - Browser tab favicon
  favicon-16x16.png              - 16x16 browser icon
  favicon-32x32.png              - 32x32 browser icon

iOS/Apple (Required):
  apple-touch-icon.png           - iPhone/iPad home screen (180x180)

Android (Required):
  android-chrome-192x192.png     - Android launcher
  android-chrome-512x512.png     - Android splash screen

Windows (Optional):
  mstile-150x150.png             - Windows 11 tiles

PWA Modern (Optional):
  maskable-192x192.png           - Maskable PWA icon
  maskable-512x512.png           - Maskable PWA icon

Social Media (Required):
  logo-og.png                    - Social sharing preview (1200x630)

General Purpose:
  logo.png                       - High-quality logo


✅ VERIFY SETUP
──────────────────────────────────────────────────────────────────

1. Check metadata is in place:
   grep "og:title" /var/www/sokos/frontend/index.html

2. Verify files generated:
   ls -lh /var/www/sokos/public/*.{png,ico} 2>/dev/null | wc -l
   # Should show 11 files

3. Check PWA manifest:
   cat /var/www/sokos/public/site.webmanifest

4. Browser test:
   - Visit https://sokos.co.ke/
   - Check favicon appears in tab
   - Look for Sokos green logo

5. Social media test:
   Facebook:  https://developers.facebook.com/tools/debug/
   Twitter:   https://cards-dev.twitter.com/validator
   LinkedIn:  https://www.linkedin.com/post-inspector/
   
   Paste: https://sokos.co.ke/


📊 FILE SIZES (Typical)
──────────────────────────────────────────────────────────────────

favicon.ico                    ~1-2 KB
favicon-16x16.png              ~0.5 KB
favicon-32x32.png              ~0.7 KB
apple-touch-icon.png           ~5 KB
android-chrome-192x192.png     ~8 KB
android-chrome-512x512.png     ~25 KB
mstile-150x150.png             ~5 KB
maskable-192x192.png           ~8 KB
maskable-512x512.png           ~25 KB
logo-og.png                    ~30 KB
logo.png                       ~20 KB
──────────────────────────────────────────────────────────────────
Total                          ~130 KB


🎨 COLOR CONFIGURATION
──────────────────────────────────────────────────────────────────

Sokos Brand Colors:
  Primary Green:    #16a34a
  Light Green:      #22c55e
  Dark Green:       #15803d
  Background:       #ffffff (white)
  
These are configured in:
  - index.html (theme-color meta tag)
  - site.webmanifest (theme_color)
  - browserconfig.xml (TileColor)


📝 METADATA SUMMARY
──────────────────────────────────────────────────────────────────

✅ Page Title:
   "Sokos - Kenya's Local P2P Marketplace | Buy & Sell Locally"

✅ Description:
   "Sokos is a peer-to-peer marketplace connecting buyers and 
    sellers across Kenya. Trade locally with verified merchants, 
    secure payments, and real-time location tracking."

✅ Keywords:
   P2P marketplace, Kenya, local trade, buy and sell, etc.

✅ Open Graph (Facebook/LinkedIn/WhatsApp):
   og:title, og:description, og:image, og:url, og:site_name

✅ Twitter Card:
   twitter:card, twitter:title, twitter:description, twitter:image

✅ Apple:
   apple-mobile-web-app-capable: yes
   apple-touch-icon: 180x180

✅ Android/PWA:
   manifest: site.webmanifest
   android-chrome icons: 192x192, 512x512


🔧 ADVANCED SETUP (Optional)
──────────────────────────────────────────────────────────────────

Nginx Configuration:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
location ~ ^/(favicon\.ico|site\.webmanifest|browserconfig\.xml)$ {
    root /var/www/sokos/public;
    access_log off;
    expires 30d;
    add_header Cache-Control "public, immutable";
}

Express.js Configuration:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.use(express.static('public', {
    maxAge: '30d',
    etag: false
}));


🧪 TESTING CHECKLIST
──────────────────────────────────────────────────────────────────

Browser Tests:
  [ ] Favicon appears in browser tab
  [ ] Logo appears in iOS home screen (if saved)
  [ ] Correct color on Windows tile
  [ ] PWA install prompt appears

Social Media Tests:
  [ ] Facebook shows correct preview image
  [ ] Twitter shows card with image
  [ ] LinkedIn shows proper preview
  [ ] WhatsApp shows image and title

Device Tests:
  [ ] iOS: Safari and home screen
  [ ] Android: Chrome and launcher
  [ ] Windows: Tile in start menu
  [ ] Desktop: Chrome, Firefox, Safari, Edge


🐛 TROUBLESHOOTING
──────────────────────────────────────────────────────────────────

Favicon not showing?
  → Clear browser cache: Ctrl+Shift+Delete
  → Hard refresh: Ctrl+Shift+R
  → Check file exists: ls -lh /var/www/sokos/public/favicon.ico
  → Verify permissions: chmod 644 /var/www/sokos/public/favicon.ico

Wrong size appearing?
  → Browser cached old version
  → Check image dimensions: file /var/www/sokos/public/favicon-32x32.png
  → Regenerate all files

Social media not showing?
  → Verify og:image URL is accessible
  → Use debuggers to clear social media cache
  → Image must be 1200x630 minimum
  → Wait 24 hours for updates to propagate

PWA not recognizing manifest?
  → Validate JSON: jsonlint site.webmanifest
  → Check paths are absolute (start with /)
  → Icons must be PNG format
  → Browser DevTools > Application > Manifest


📚 DOCUMENTATION
──────────────────────────────────────────────────────────────────

Full Setup Guide:
  /var/www/sokos/FAVICON_SETUP.md

Python Generator:
  /var/www/sokos/generate_favicons.py

Frontend Config:
  /var/www/sokos/frontend/index.html

PWA Manifest:
  /var/www/sokos/public/site.webmanifest

Windows Config:
  /var/www/sokos/public/browserconfig.xml


🎯 NEXT STEPS
──────────────────────────────────────────────────────────────────

1. Save Sokos logo as sokos-logo.png
2. Run Python generator:
   python3 /var/www/sokos/generate_favicons.py sokos-logo.png
3. Copy generated files to /var/www/sokos/public/
4. Test in browser and on devices
5. Test social media sharing
6. Done! ✅


📞 HELP & RESOURCES
──────────────────────────────────────────────────────────────────

Tools:
  RealFaviconGenerator: https://realfavicongenerator.net/
  Favicon Converter:    https://favicon.io/
  OG Preview:           https://www.opengraph.xyz/

Validators:
  Facebook OG:  https://developers.facebook.com/tools/debug/
  Twitter Card: https://cards-dev.twitter.com/validator
  PWA:          Chrome DevTools > Application

Documentation:
  Favicon Guide:        https://web.dev/favicon-best-practices/
  Open Graph:           https://ogp.me/
  Web App Manifest:     https://web.dev/add-manifest/
  Twitter Cards:        https://developer.twitter.com/en/docs/twitter-for-websites/cards


╔════════════════════════════════════════════════════════════════╗
║                    READY TO SET UP! 🚀                        ║
║                                                                ║
║  1. Prepare sokos-logo.png                                    ║
║  2. Run generate_favicons.py                                  ║
║  3. Copy files to /var/www/sokos/public/                      ║
║  4. Test and enjoy! 🎉                                        ║
╚════════════════════════════════════════════════════════════════╝

Version: 1.0
Status: Ready to Use
Last Updated: June 12, 2026

EOF
