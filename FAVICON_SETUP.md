# 🎨 Sokos Logo & Favicon Setup Guide

## 📋 Overview

This guide explains how to generate and configure favicon and logo files from the Sokos logo image for use across the web and apps.

## 📁 Required Files

All logo files should be placed in `/var/www/sokos/public/`:

### Favicon Files (Browser Tabs)
- `favicon.ico` - Classic favicon format (primary)
- `favicon-16x16.png` - Browser tab (16x16)
- `favicon-32x32.png` - Browser tab (32x32)

### Apple/iOS
- `apple-touch-icon.png` - iOS home screen (180x180)

### Android/PWA
- `android-chrome-192x192.png` - Android launcher
- `android-chrome-512x512.png` - Android splash screen

### Windows
- `mstile-150x150.png` - Windows tile (150x150)

### Maskable Icons (PWA - modern)
- `maskable-192x192.png` - Progressive Web App icon (192x192)
- `maskable-512x512.png` - Progressive Web App icon (512x512)

### Open Graph (Social Sharing)
- `logo-og.png` - Social media preview (1200x630)

### Optional
- `logo.png` - General logo (high quality)

## 🔧 How to Generate Favicon

### Option 1: Using RealFaviconGenerator (Online - Recommended)

1. Visit: https://realfavicongenerator.net/
2. Click "Select a picture"
3. Upload your Sokos logo image (PNG or SVG)
4. Configure:
   - Favicon Generator Settings
   - Path: `/` (root of your site)
5. Generate the favicon package
6. Download the ZIP file
7. Extract and copy all files to `/var/www/sokos/public/`
8. Copy the generated HTML and update `frontend/index.html` if needed

### Option 2: Using ImageMagick (CLI)

```bash
cd /var/www/sokos/public

# Assume you have sokos-logo.png (original high-res image)

# Generate favicon.ico (16x16, 32x32, 48x48)
convert sokos-logo.png -background transparent -define icon:auto-resize=16,32,48 favicon.ico

# Generate standard PNGs
convert sokos-logo.png -resize 16x16 favicon-16x16.png
convert sokos-logo.png -resize 32x32 favicon-32x32.png
convert sokos-logo.png -resize 180x180 apple-touch-icon.png
convert sokos-logo.png -resize 192x192 android-chrome-192x192.png
convert sokos-logo.png -resize 512x512 android-chrome-512x512.png
convert sokos-logo.png -resize 150x150 mstile-150x150.png

# Maskable icons (PWA - add padding)
convert sokos-logo.png -resize 192x192 -background '#16a34a' -gravity center -extent 192x192 maskable-192x192.png
convert sokos-logo.png -resize 512x512 -background '#16a34a' -gravity center -extent 512x512 maskable-512x512.png

# Social media (1200x630)
convert sokos-logo.png -resize 1200x630 -background '#ffffff' -gravity center -extent 1200x630 logo-og.png
```

### Option 3: Using Python PIL

```python
from PIL import Image
import os

os.chdir('/var/www/sokos/public')

# Open original logo
img = Image.open('sokos-logo.png')

# Ensure RGBA mode
if img.mode != 'RGBA':
    img = img.convert('RGBA')

# Generate favicon sizes
sizes = [
    (16, 'favicon-16x16.png'),
    (32, 'favicon-32x32.png'),
    (180, 'apple-touch-icon.png'),
    (192, 'android-chrome-192x192.png'),
    (512, 'android-chrome-512x512.png'),
    (150, 'mstile-150x150.png'),
]

for size, filename in sizes:
    resized = img.resize((size, size), Image.Resampling.LANCZOS)
    resized.save(filename)

print("✅ All favicon files generated successfully!")
```

### Option 4: Using FFmpeg

```bash
cd /var/www/sokos/public

# Convert to required sizes
ffmpeg -i sokos-logo.png -vf scale=16:16 favicon-16x16.png
ffmpeg -i sokos-logo.png -vf scale=32:32 favicon-32x32.png
ffmpeg -i sokos-logo.png -vf scale=180:180 apple-touch-icon.png
ffmpeg -i sokos-logo.png -vf scale=192:192 android-chrome-192x192.png
ffmpeg -i sokos-logo.png -vf scale=512:512 android-chrome-512x512.png
ffmpeg -i sokos-logo.png -vf scale=150:150 mstile-150x150.png
```

## 📝 Manual Steps (If uploading directly)

1. Save the Sokos logo image to: `/var/www/sokos/public/sokos-logo.png`
2. Resize to generate all required sizes (see above)
3. Copy all files to `/var/www/sokos/public/`

## ✅ Verification

After setting up, verify files are in place:

```bash
ls -lh /var/www/sokos/public/*.png /var/www/sokos/public/*.ico 2>/dev/null

# Expected output:
# favicon.ico
# favicon-16x16.png
# favicon-32x32.png
# apple-touch-icon.png
# android-chrome-192x192.png
# android-chrome-512x512.png
# mstile-150x150.png
# maskable-192x192.png
# maskable-512x512.png
# logo-og.png
# logo.png
# site.webmanifest
# browserconfig.xml
```

## 🔗 Update Server Configuration

### Nginx

Add to your Nginx config to serve favicons with proper caching:

```nginx
# In your server block:
location ~ ^/(favicon\.ico|site\.webmanifest|browserconfig\.xml)$ {
    root /var/www/sokos/public;
    access_log off;
    log_not_found off;
    expires 30d;
    add_header Cache-Control "public, immutable";
}

location ~ ^/.*\.(png|svg|ico)$ {
    root /var/www/sokos/public;
    expires 30d;
    add_header Cache-Control "public, immutable";
}
```

### Express.js (Backend)

```javascript
// Serve public files
app.use(express.static('public', {
    maxAge: '30d',
    etag: false
}));

// Specific favicon handling
app.get('/favicon.ico', (req, res) => {
    res.sendFile(__dirname + '/public/favicon.ico', {
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });
});
```

## 🧪 Test Your Favicon

### Browser Testing
1. Visit: https://sokos.co.ke/ (or your local domain)
2. Check browser tab - you should see the Sokos logo
3. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R) if not visible

### Social Media Preview
Test Open Graph metadata:
- Facebook: https://developers.facebook.com/tools/debug/
- Twitter: https://cards-dev.twitter.com/validator
- LinkedIn: https://www.linkedin.com/post-inspector/

### PWA Testing
```bash
# Visit your site in Chrome
# Open DevTools (F12)
# Go to Application > Manifest
# Should show green check mark
```

## 📊 Favicon Specifications

| Use Case | Size | Format | Purpose |
|----------|------|--------|---------|
| Browser Tab | 16x16, 32x32 | PNG, ICO | Desktop browsers |
| iOS Home | 180x180 | PNG | iPhone/iPad |
| Android | 192x192, 512x512 | PNG | Android devices |
| Windows Tile | 150x150 | PNG | Windows 11 tiles |
| PWA Maskable | 192x192, 512x512 | PNG | Modern PWA |
| Social Media | 1200x630 | PNG/JPG | Facebook, Twitter, etc. |

## 🎨 Design Specifications

**Color Scheme**:
- Primary Green: `#16a34a`
- Background: White/Transparent
- Margin: 10% padding around logo

**Font**:
- Typography should be clean and readable at small sizes
- Works well at 16x16 pixels

## 🚀 Deployment

1. Generate all favicon files
2. Place in `/var/www/sokos/public/`
3. Verify `frontend/index.html` has correct links (already updated)
4. Update `site.webmanifest` with your domain
5. Test with real devices and social media

## 📋 Checklist

- [ ] Download/receive Sokos logo image (PNG recommended)
- [ ] Generate favicon files using one of the methods above
- [ ] Copy all files to `/var/www/sokos/public/`
- [ ] Verify all files are present
- [ ] Test favicon appears in browser
- [ ] Test social media sharing
- [ ] Test PWA installation
- [ ] Hard refresh browsers to clear cache
- [ ] Test on multiple devices (iOS, Android, Windows)

## 🔗 Useful Resources

- **RealFaviconGenerator**: https://realfavicongenerator.net/
- **Favicon Cheat Sheet**: https://github.com/audreyr/favicon-cheat-sheet
- **PWA Manifest Generator**: https://tomitm.github.io/appmanifest/
- **Social Media Image Sizes**: https://sproutsocial.com/insights/social-media-image-sizes/
- **ImageMagick Docs**: https://imagemagick.org/
- **Web.dev Favicon Guide**: https://web.dev/favicon-best-practices/

## 💡 Pro Tips

1. **Test Before Deployment**: Use a local testing environment first
2. **Cache Busting**: Add version query params if updating: `/favicon.ico?v=2`
3. **Favicon.ico Priority**: This file is requested first, keep it lightweight
4. **Mobile Optimization**: Ensure icons look good on home screens
5. **Dark Mode**: Consider providing dark variant icons
6. **PNG vs ICO**: PNG has better compression, but older browsers prefer ICO

## 🐛 Troubleshooting

### Favicon not showing in browser
- Clear browser cache (Ctrl+Shift+Delete)
- Hard refresh (Ctrl+Shift+R)
- Check file exists: `curl -I https://sokos.co.ke/favicon.ico`
- Verify permissions: `chmod 644 /var/www/sokos/public/favicon.ico`

### Wrong size appearing
- Browser cached old version
- Image file corrupted, regenerate
- Wrong dimensions, verify with: `file /var/www/sokos/public/favicon-32x32.png`

### PWA not recognizing icons
- Verify manifest.json syntax: `npm install -g jsonlint && jsonlint site.webmanifest`
- Check file paths are absolute URLs or start with `/`
- Icons must be PNG (not ICO) for PWA

### Social media not showing image
- Use debuggers (Facebook, Twitter tools)
- Verify og:image URL is accessible
- Image must be 1200x630 minimum
- Clear social media cache

---

**Next Step**: Follow one of the generation methods above to create all favicon files, then place them in `/var/www/sokos/public/`.

The metadata in `frontend/index.html` is already configured and ready to use!
