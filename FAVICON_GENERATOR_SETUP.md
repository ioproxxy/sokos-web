# 🎨 Sokos Favicon Generator - Setup & Usage

## ✅ Installation Status

PIL/Pillow has been installed in the Python virtual environment:
- **Location**: `/var/www/sokos/.venv/bin/python`
- **Status**: ✅ Ready to use
- **Verification**: PIL/Pillow is working

---

## 🚀 Quick Start (2 Steps)

### Step 1: Save Your Logo Image
```bash
# Save the Sokos logo as PNG
cp sokos-logo.png /tmp/sokos-logo.png

# Or download and save the logo image you provided
```

### Step 2: Generate All Favicons
```bash
# Option A: Using the easy wrapper script (Recommended)
/var/www/sokos/generate_favicons.sh sokos-logo.png

# Option B: Using Python directly
/var/www/sokos/.venv/bin/python /var/www/sokos/generate_favicons.py sokos-logo.png
```

---

## 📁 What Gets Generated

The script automatically creates **11 files** from your logo:

```
favicon.ico                      (Multi-resolution: 16, 32, 48px)
favicon-16x16.png               (Browser tab - 16x16)
favicon-32x32.png               (Browser tab - 32x32)
apple-touch-icon.png            (iOS home screen - 180x180)
android-chrome-192x192.png      (Android launcher - 192x192)
android-chrome-512x512.png      (Android splash - 512x512)
mstile-150x150.png              (Windows tile - 150x150)
maskable-192x192.png            (PWA icon - 192x192)
maskable-512x512.png            (PWA icon - 512x512)
logo-og.png                     (Social media - 1200x630)
logo.png                        (General use - 512x512)
```

---

## 📋 Complete Process

### 1. Prepare Logo
```bash
# Your logo should be PNG format with transparency
# Minimum size: 512x512 pixels
# File name: sokos-logo.png (or any PNG file)

cd /tmp
# Save or copy your logo here
```

### 2. Generate Favicons
```bash
# Navigate to a working directory
cd /tmp

# Copy the logo if not already there
# cp /path/to/sokos-logo.png ./sokos-logo.png

# Run the generator
/var/www/sokos/generate_favicons.sh sokos-logo.png

# OR use Python directly
/var/www/sokos/.venv/bin/python /var/www/sokos/generate_favicons.py sokos-logo.png
```

### 3. Deploy to Server
```bash
# Copy all generated files to public folder
cp *.png *.ico /var/www/sokos/public/

# Set proper permissions
chmod 644 /var/www/sokos/public/*.png
chmod 644 /var/www/sokos/public/*.ico

# Verify
ls -lh /var/www/sokos/public/*.{png,ico} | wc -l
# Should show: 11 files
```

### 4. Test in Browser
```bash
# Clear browser cache and hard refresh
# Visit: https://sokos.co.ke/
# Check favicon appears in browser tab
```

---

## 🔧 Environment Setup Details

### Virtual Environment
- **Path**: `/var/www/sokos/.venv/`
- **Python Version**: 3.13.12
- **Command to activate**: `source /var/www/sokos/.venv/bin/activate`

### PIL/Pillow
- **Status**: ✅ Installed
- **Test**: `/var/www/sokos/.venv/bin/python -c "from PIL import Image; print('✅ PIL is working!')"`

### Available Scripts
- **Wrapper Script** (Easy): `/var/www/sokos/generate_favicons.sh`
- **Python Script** (Direct): `/var/www/sokos/generate_favicons.py`

---

## 💡 Usage Examples

### Example 1: Using the Wrapper Script (Easiest)
```bash
# Create logo in temp directory
cd /tmp

# Copy your logo (or create one)
cp ~/Downloads/sokos-logo.png ./

# Run the wrapper script
/var/www/sokos/generate_favicons.sh sokos-logo.png

# Deploy
cp *.png *.ico /var/www/sokos/public/
chmod 644 /var/www/sokos/public/*
```

### Example 2: Using Python Directly
```bash
cd /tmp

# Activate virtual environment (optional)
source /var/www/sokos/.venv/bin/activate

# Copy logo
cp ~/logo.png sokos-logo.png

# Generate
python /var/www/sokos/generate_favicons.py sokos-logo.png

# Deploy
cp *.png *.ico /var/www/sokos/public/
chmod 644 /var/www/sokos/public/*
```

### Example 3: From Any Directory
```bash
# You can run from anywhere
/var/www/sokos/generate_favicons.sh /path/to/your/logo.png

# Output files will be created in current directory
# Then copy them to public folder
cp *.png *.ico /var/www/sokos/public/
```

---

## 🐛 Troubleshooting

### "PIL not found" Error
**Solution**:
```bash
# PIL/Pillow is already installed in the venv
# Make sure to use the venv Python:
/var/www/sokos/.venv/bin/python generate_favicons.py sokos-logo.png

# Or use the wrapper script:
/var/www/sokos/generate_favicons.sh sokos-logo.png
```

### Script Permission Denied
**Solution**:
```bash
chmod +x /var/www/sokos/generate_favicons.sh
```

### File Not Found Error
**Solution**:
```bash
# Make sure your logo file exists and path is correct
ls -lh sokos-logo.png

# Use absolute path if in different directory
/var/www/sokos/generate_favicons.sh /full/path/to/sokos-logo.png
```

### Image Format Error
**Solution**:
```bash
# Ensure logo is PNG format with proper dimensions
# Recommended: 1024x1024 or larger
# Convert if needed:
convert sokos-logo.jpg sokos-logo.png
```

---

## 📊 Output File Information

### File Sizes (Typical)
- **favicon.ico**: 1-2 KB
- **favicon-16x16.png**: 0.5 KB
- **favicon-32x32.png**: 0.7 KB
- **apple-touch-icon.png**: 5 KB
- **android-chrome-192x192.png**: 8 KB
- **android-chrome-512x512.png**: 25 KB
- **mstile-150x150.png**: 5 KB
- **maskable-192x192.png**: 8 KB
- **maskable-512x512.png**: 25 KB
- **logo-og.png**: 30 KB
- **logo.png**: 20 KB
- **Total**: ~130 KB

---

## ✅ Verification Checklist

- [ ] Sokos logo saved as PNG file
- [ ] Logo is 512x512 pixels or larger
- [ ] PIL/Pillow is installed: `/var/www/sokos/.venv/bin/python -c "from PIL import Image"`
- [ ] Wrapper script is executable: `ls -l /var/www/sokos/generate_favicons.sh`
- [ ] Generate command runs without errors
- [ ] 11 PNG and ICO files are created
- [ ] Files are copied to `/var/www/sokos/public/`
- [ ] Permissions are set: `chmod 644 /var/www/sokos/public/*.{png,ico}`
- [ ] Favicon appears in browser tab
- [ ] Social media preview shows correct image

---

## 🔗 Command Reference

### Quick Commands
```bash
# Generate favicons (easy)
/var/www/sokos/generate_favicons.sh sokos-logo.png

# Deploy
cp *.png *.ico /var/www/sokos/public/ && chmod 644 /var/www/sokos/public/*

# Verify
ls -lh /var/www/sokos/public/*.{png,ico}

# Test PIL
/var/www/sokos/.venv/bin/python -c "from PIL import Image; print('✅ PIL working')"

# Check venv
which python
source /var/www/sokos/.venv/bin/activate
which python
```

---

## 📞 Support

**Issue**: PIL/Pillow installation failed
```bash
# Already installed in: /var/www/sokos/.venv/
# Always use: /var/www/sokos/.venv/bin/python
```

**Issue**: Script not running
```bash
# Make executable
chmod +x /var/www/sokos/generate_favicons.sh

# Run with full path
/var/www/sokos/generate_favicons.sh sokos-logo.png
```

**Issue**: Files not generating
```bash
# Check image file exists
file sokos-logo.png

# Test directly
/var/www/sokos/.venv/bin/python /var/www/sokos/generate_favicons.py sokos-logo.png
```

---

## 🎉 Success Indicators

✅ **All Working**:
- 11 files generated (PNG + ICO)
- Files copied to `/var/www/sokos/public/`
- Favicon appears on https://sokos.co.ke/
- Social media preview works
- No PIL/Pillow errors

---

**Status**: ✅ PIL/Pillow Installed & Ready  
**Python**: 3.13.12 (Virtual Environment)  
**Next Step**: Run the favicon generator script!
