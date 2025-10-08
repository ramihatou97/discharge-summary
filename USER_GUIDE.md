# Discharge Summary Generator - User Guide

## 📖 Complete Guide to Using the App

### Quick Start (5 Minutes)

1. **Open the App**
   - Visit: https://ramihatou97.github.io/discharge-summary-ultimate/
   - Works on desktop and mobile browsers

2. **Paste Your Clinical Notes**
   - Click in the large text area
   - Paste all your clinical notes (admission, progress, discharge, etc.)
   - The system will auto-detect note types

3. **Extract Information**
   - Click "Auto-Detect & Extract Information"
   - Wait 2-5 seconds for extraction
   - Review extracted data

4. **Generate Summary**
   - Click "Generate Summary"
   - Your discharge summary appears on the right
   - Copy, download, or print!

---

## 🎯 Features Guide

### 1. Note Input

**Supported Note Types:**
- Admission / H&P notes
- Progress notes (daily updates)
- Consultant notes
- Procedure notes
- Discharge notes

**How to Input:**

**Option A: Paste All Notes Together**
```
Patient: John Doe
Age: 45 years old
MRN: 123456

Admission Date: 01/15/2025
Chief Complaint: Severe headache

[Continue with all notes...]
```

**Option B: Use Delimiters** (Optional)
```
===================================
ADMISSION NOTE
Patient: John Doe...
===================================
PROGRESS NOTE - POD 1
Patient doing well...
===================================
DISCHARGE NOTE
Ready for discharge...
```

**Tips:**
- Paste as much detail as possible
- Include dates, vital signs, medications
- No need to format perfectly - the AI will parse it

---

### 2. Extraction Methods

#### Pattern Matching (Default - Always Works)
- Uses advanced regex patterns
- Works 100% offline
- No API keys needed
- Extracts: names, dates, diagnoses, procedures, medications

#### Multi-AI Extraction (Optional - Enhanced)
- **When to Use:** Complex notes with unusual formatting
- **How to Enable:**
  1. Click Settings
  2. Check "Use Multi-AI Extraction"
  3. Add API key (Gemini, OpenAI, or Claude)
- **Benefits:** Better accuracy with complex cases

**API Keys (Optional):**
- Get Gemini API: [Google AI Studio](https://makersuite.google.com/app/apikey)
- Get OpenAI API: [OpenAI Platform](https://platform.openai.com/api-keys)
- Stored locally in your browser only

---

### 3. Template Selection

**Standard Template** (Default)
- Complete discharge summary
- All standard sections
- Best for most cases

**Detailed Template**
- Extended sections
- More clinical detail
- Good for complex cases

**Brief Template**
- Concise summary
- Essential information only
- Quick documentation

**How to Change:**
```
Settings → Template → Select your preference
```

---

### 4. Dark Mode

**Why Use It:**
- Reduces eye strain
- Better for nighttime use
- Saves battery on mobile

**How to Toggle:**
- Click the moon/sun icon (top right)
- Instantly switches theme
- Preference saved automatically

---

### 5. Auto-Save

**How It Works:**
- Saves your notes every 2 seconds
- Stored in browser localStorage
- Survives browser refresh
- Auto-deleted after 24 hours

**Status Indicator:**
- "Auto-save on" = Active (green)
- Click database icon to toggle

**What's Saved:**
- Clinical notes input
- Timestamp
- NOT the generated summary (for privacy)

---

### 6. Copy, Download, Print

#### Copy to Clipboard
```
1. Click the copy icon
2. Paste into your EHR system
```

#### Download as File
```
1. Click download icon
2. Saves as: discharge_summary_YYYY-MM-DD.txt
3. Open with any text editor
```

#### Print
```
1. Click print icon (if available)
2. Or use browser: Ctrl+P (Windows) or Cmd+P (Mac)
3. Print or save as PDF
```

---

### 7. Clear All Data

**How:**
- Click the red trash icon
- Confirm the action
- All data cleared immediately

**What's Cleared:**
- Clinical notes
- Extracted data
- Generated summary
- Auto-saved draft

**Can't be undone!** Use with caution.

---

## 🔧 Advanced Features

### ML Learning (Automatic)

**How It Works:**
- When you edit the generated summary
- System learns your preferences
- Improves future summaries
- NO patient data stored (privacy-safe)

**What It Learns:**
- Your preferred terminology
- Section formatting preferences
- Common edits you make

### Character Count
- Shows real-time count as you type
- Helps gauge note completeness
- Located below text area

### Confidence Scores
- Shows extraction confidence (0-100%)
- Higher = more reliable
- Review low-confidence fields carefully

---

## 💡 Tips & Best Practices

### For Best Results

1. **Include Complete Information**
   ```
   ✅ Patient: John Doe, 45 y/o male
   ❌ Patient: JD

   ✅ Admission Date: 01/15/2025
   ❌ Admitted yesterday
   ```

2. **Use Standard Medical Abbreviations**
   - The system knows 500+ medical terms
   - Examples: HTN, DM, COPD, MI, CVA

3. **Include All Note Types**
   - Admission note gives baseline
   - Progress notes show hospital course
   - Discharge note completes picture

4. **Review Extracted Data**
   - Always verify accuracy
   - Edit any incorrect fields
   - Complete missing information

5. **Choose Right Template**
   - Standard for routine cases
   - Detailed for complex cases
   - Brief for quick documentation

---

## 🔒 Privacy & Security

### Your Data is Safe

**Stored Locally:**
- All data stays in YOUR browser
- Nothing sent to external servers (unless you enable AI)
- Auto-save uses localStorage only

**With AI Extraction:**
- Data sent to AI provider (Gemini/OpenAI/Claude)
- Only when you click "Extract"
- Subject to their privacy policies
- Consider using pattern matching for sensitive data

**API Keys:**
- Stored in browser localStorage
- Never sent to our servers
- Only you can see them

### Best Practices

1. **Use pattern matching** for highly sensitive data
2. **Clear data** when done (trash icon)
3. **Don't share** browser access
4. **Use HTTPS** always (automatic on GitHub Pages)
5. **Log out** of shared computers

---

## 🆘 Troubleshooting

### App Won't Load

**Problem:** Blank screen or error
**Solution:**
1. Refresh page (Ctrl+R or Cmd+R)
2. Clear browser cache
3. Try different browser
4. Check internet connection

### Extraction Not Working

**Problem:** "Extract" button disabled
**Solution:**
- Ensure you've pasted notes (not empty)
- Check for actual text content
- Refresh page and try again

### Poor Extraction Quality

**Problem:** Missing or incorrect data
**Solution:**
1. Try pattern matching mode (default)
2. Paste more complete notes
3. Use standard medical format
4. Enable AI extraction for complex cases

### Can't Copy Summary

**Problem:** Copy button not working
**Solution:**
1. Check browser clipboard permissions
2. Manually select and copy text
3. Try download instead

### Auto-Save Not Working

**Problem:** Draft not restored
**Solution:**
- Check if auto-save is enabled (green indicator)
- May have expired (24-hour limit)
- Browser localStorage might be full
- Try toggling auto-save off and on

---

## 📱 Mobile Usage

### Optimized for Mobile

**Features:**
- Responsive design
- Touch-friendly buttons
- Readable text size
- Swipe-friendly

**Best Practices:**
1. Use in landscape for easier typing
2. Zoom in if needed
3. Copy to clipboard, then paste in EHR app
4. Consider using tablet for better experience

---

## ⌨️ Keyboard Shortcuts

### Common Actions

- **Tab**: Navigate between fields
- **Ctrl+A** (Cmd+A): Select all text
- **Ctrl+C** (Cmd+C): Copy selected text
- **Ctrl+V** (Cmd+V): Paste text
- **Ctrl+Z** (Cmd+Z): Undo
- **Ctrl+Y** (Cmd+Y): Redo

---

## 🎓 Example Workflow

### Complete Example

**1. Gather Your Notes**
```
Have ready:
- Admission H&P
- Daily progress notes
- Consultant notes
- Discharge note/plan
```

**2. Open App**
```
Visit site
Enable dark mode (if desired)
Verify auto-save is on
```

**3. Input Notes**
```
Paste all notes into text area
Review character count
Ensure key information included
```

**4. Extract Data**
```
Click "Auto-Detect & Extract Information"
Wait for extraction (2-5 seconds)
Review extracted fields
```

**5. Review & Edit**
```
Check patient demographics
Verify dates and diagnoses
Correct any errors
Fill missing fields
```

**6. Generate Summary**
```
Select template (standard/detailed/brief)
Click "Generate Summary"
Review output
```

**7. Finalize**
```
Copy to clipboard OR
Download as file OR
Print directly
```

**8. Clean Up**
```
Click trash icon
Confirm clear all data
Done!
```

---

## 🎯 Use Cases

### 1. Routine Discharge
- Use Standard template
- Pattern matching extraction
- 2-3 minute process

### 2. Complex Multi-Specialty Case
- Use Detailed template
- Consider AI extraction
- Review all sections carefully
- 5-10 minute process

### 3. Quick Documentation
- Use Brief template
- Essential information only
- 1-2 minute process

### 4. Teaching/Learning
- Use any template
- Study the extraction
- See how AI parses notes
- Educational tool

---

## ❓ Frequently Asked Questions

**Q: Is this HIPAA compliant?**
A: The app runs locally in your browser. With pattern matching (default), no data leaves your device. With AI extraction, data is sent to AI providers. Consult your institution's policies.

**Q: Can I use this for real patients?**
A: This is an educational tool. Always verify all information and get appropriate approvals before clinical use.

**Q: Do I need an API key?**
A: No! Pattern matching works perfectly without any API key. AI extraction is optional for enhanced accuracy.

**Q: Does it work offline?**
A: Yes! Pattern matching mode works completely offline once the page loads.

**Q: Can I save multiple summaries?**
A: Currently saves one draft. Download summaries to keep multiple versions.

**Q: Will my data be used to train AI?**
A: We don't store any data. If using AI extraction, refer to the AI provider's privacy policy.

**Q: How accurate is the extraction?**
A: Pattern matching: 70-85% accuracy. AI extraction: 85-95%. Always verify all information.

**Q: Can I customize templates?**
A: Currently offers 3 templates. Custom templates may be added in future versions.

---

## 📧 Support

### Need Help?

1. **Check This Guide** - Most questions answered here
2. **Review Documentation** - See docs/ folder
3. **GitHub Issues** - Report bugs or request features
4. **Contact** - See repository for contact info

---

## 🔄 Updates

**The app auto-updates!**
- Refresh page to get latest version
- Check GitHub for changelog
- New features added regularly

---

*Last Updated: 2025-10-07*
*Version: 3.0 (Vite)*
*Happy Documenting! 📝*
