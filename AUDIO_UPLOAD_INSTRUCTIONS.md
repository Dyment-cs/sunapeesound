# Audio File Upload Instructions

## How to Add Your NotebookLM Podcast to the Website

The website is now set up to display your NotebookLM podcast audio file. Follow these steps to add it:

### Option 1: Upload via File System (Recommended)

1. **Locate your audio file:**
   - File name: `Sunapee_Sound_Project__Uniting_a_Town,_Launching_a_Year-Round_C.m4a`

2. **Upload to the assets folder:**
   ```bash
   # From your computer, copy the file to the project's assets folder
   cp /path/to/Sunapee_Sound_Project__Uniting_a_Town,_Launching_a_Year-Round_C.m4a /home/user/sunapeesound/assets/
   ```

3. **Verify the file:**
   ```bash
   ls -lh /home/user/sunapeesound/assets/
   ```

   You should see your audio file listed.

4. **Optional: Create an MP3 version for better compatibility:**
   ```bash
   # If you have ffmpeg installed
   ffmpeg -i assets/Sunapee_Sound_Project__Uniting_a_Town,_Launching_a_Year-Round_C.m4a assets/sunapee-sound-podcast.mp3
   ```

### Option 2: Rename and Upload

If the file name is too long or complex, you can rename it:

1. Rename your file to something simpler:
   ```bash
   mv Sunapee_Sound_Project__Uniting_a_Town,_Launching_a_Year-Round_C.m4a sunapee-sound-podcast.m4a
   ```

2. Upload to assets folder:
   ```bash
   cp sunapee-sound-podcast.m4a /home/user/sunapeesound/assets/
   ```

3. Update the HTML (if renamed):
   - Edit `index.html`
   - Find line ~1063
   - Change the source path to match your renamed file

### Option 3: Use a URL (for hosted files)

If your audio file is hosted elsewhere (like SoundCloud, Spotify, or your own server):

1. Get the direct URL to your audio file
2. Edit `index.html` around line 1063
3. Replace the `src` attribute with your URL:
   ```html
   <source src="https://your-domain.com/podcast.m4a" type="audio/mp4">
   ```

### What the Audio Player Includes

✅ **Beautiful audio player** with custom styling
✅ **Download button** for users to download the podcast
✅ **Podcast description** explaining the content
✅ **Topics covered** section
✅ **Mobile responsive** design
✅ **Fallback support** for browsers that don't support M4A

### Testing Locally

After uploading the file:

1. Start a local web server:
   ```bash
   cd /home/user/sunapeesound
   python3 -m http.server 8000
   ```

2. Open your browser to http://localhost:8000

3. Click "🎙️ Hear the Story" in the navigation menu

4. You should see and be able to play the podcast!

### File Format Notes

- **M4A (Primary)**: Good quality, smaller file size, supported by most modern browsers
- **MP3 (Fallback)**: Universal compatibility, slightly larger file size
- The HTML includes both formats for maximum compatibility

### Troubleshooting

**Audio doesn't play:**
- Check that the file is in the `assets/` folder
- Verify the file name matches exactly (case-sensitive)
- Check browser console for errors (F12)
- Try a different browser (Chrome, Firefox, Safari)

**File too large:**
- Consider compressing the audio
- Use ffmpeg to reduce bitrate:
  ```bash
  ffmpeg -i input.m4a -b:a 128k output.m4a
  ```

**Wrong file path:**
- The path is relative to index.html
- Current path: `assets/Sunapee_Sound_Project__Uniting_a_Town,_Launching_a_Year-Round_C.m4a`
- Make sure your folder structure matches:
  ```
  sunapeesound/
  ├── index.html
  └── assets/
      └── Sunapee_Sound_Project__Uniting_a_Town,_Launching_a_Year-Round_C.m4a
  ```

## Quick Command Summary

```bash
# Navigate to project
cd /home/user/sunapeesound

# Create assets folder (if not exists)
mkdir -p assets

# Copy your audio file (adjust path as needed)
cp ~/Downloads/Sunapee_Sound_Project__Uniting_a_Town,_Launching_a_Year-Round_C.m4a assets/

# Test locally
python3 -m http.server 8000
# Then visit http://localhost:8000
```

## For Production Deployment

When deploying to your live website, make sure to:
1. Upload the `assets/` folder along with your HTML files
2. Verify the audio file is publicly accessible
3. Test the podcast player on the live site

The audio player is already integrated and styled to match your website's design! 🎵
