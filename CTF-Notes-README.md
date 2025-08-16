# CTF Notes - Capture The Flag Note Taking Application

A clean, responsive web application designed specifically for organizing and managing notes related to CTF (Capture The Flag) challenges. Built with vanilla HTML, CSS, and JavaScript with no external dependencies.

## Features

### 📝 Note Management
- **Create, Edit, Delete** notes for CTF challenges
- **Categorize** notes by challenge type (Web, Crypto, Forensics, Reverse Engineering, Pwn, Misc)
- **Tag system** for easy organization and search
- **Timestamps** for creation and modification dates

### 🎯 CTF-Specific Categories
- **Web**: Web application vulnerabilities, XSS, SQL injection, etc.
- **Crypto**: Cryptography challenges, ciphers, hash functions
- **Forensics**: Digital forensics, file analysis, memory dumps
- **Reverse**: Reverse engineering, binary analysis, malware analysis
- **Pwn**: Binary exploitation, buffer overflows, ROP chains
- **Misc**: Miscellaneous challenges, steganography, etc.

### 🔍 Search & Filter
- **Category filtering** to view notes by challenge type
- **Search functionality** across titles, content, and tags
- **Real-time search** with instant results

### 💾 Data Persistence
- **Local storage** - all data saved in your browser
- **No server required** - works completely offline
- **Data persistence** across browser sessions

### 📱 Responsive Design
- **Mobile-first** responsive layout
- **Desktop optimized** with sidebar navigation
- **Touch-friendly** interface for mobile devices

## Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- No additional software or dependencies required

### Installation
1. Download all three files to a folder:
   - `index.html` - Main application file
   - `styles.css` - Styling and responsive design
   - `script.js` - Application functionality

2. Open `index.html` in your web browser
3. Start creating your CTF challenge notes!

### First Time Setup
The application comes with sample notes to help you get started:
- SQL Injection Example (Web category)
- Caesar Cipher Decoder (Crypto category)
- Memory Dump Analysis (Forensics category)

## Usage Guide

### Creating a New Note
1. Click the **"New Note"** button in the sidebar
2. Fill in the required fields:
   - **Title**: Descriptive name for your note
   - **Category**: Select the appropriate CTF challenge type
   - **Tags**: Comma-separated tags for easy searching
   - **Content**: Your detailed notes and findings
3. Click **"Save Note"** to create the note

### Editing a Note
1. Click on any note card to open it for editing
2. Or click the **edit icon** (pencil) on a note card
3. Modify the fields as needed
4. Click **"Save Note"** to update

### Deleting a Note
1. Click the **delete icon** (trash) on a note card
2. Confirm deletion in the popup dialog
3. Note: This action cannot be undone

### Filtering Notes
- Use the **category buttons** in the sidebar to filter by challenge type
- Click **"All"** to view all notes
- The notes count updates automatically

### Searching Notes
- Use the **search box** in the sidebar
- Search across note titles, content, and tags
- Results update in real-time as you type

### Organizing with Tags
- Add relevant tags to your notes (e.g., "sql", "injection", "web")
- Tags are automatically parsed from comma-separated input
- Use tags to group related concepts and techniques

## Data Storage

### Local Storage
- All notes are stored in your browser's localStorage
- Data persists between browser sessions
- No data is sent to external servers

### Backup & Export
- To backup your notes, you can export the localStorage data
- Open browser DevTools → Application → Local Storage
- Copy the `ctfNotes` value and save it as a backup

### Import Notes
- To restore from backup, replace the `ctfNotes` value in localStorage
- Refresh the page to see your restored notes

## Browser Compatibility

- **Chrome**: 60+ ✅
- **Firefox**: 55+ ✅
- **Safari**: 12+ ✅
- **Edge**: 79+ ✅

## File Structure

```
CTF-Notes/
├── index.html          # Main HTML file
├── styles.css          # CSS styling and responsive design
├── script.js           # JavaScript functionality
└── CTF-Notes-README.md # This documentation
```

## Customization

### Adding New Categories
To add new CTF challenge categories:
1. Update the category buttons in `index.html`
2. Add category logic in `script.js`
3. Update the CSS for new category colors

### Modifying the Theme
- Edit `styles.css` to change colors, fonts, and layout
- The app uses CSS custom properties for easy theming
- Responsive breakpoints can be adjusted in the media queries

### Extending Functionality
The modular JavaScript structure makes it easy to add features:
- Export/import functionality
- Note sharing
- Rich text editing
- File attachments
- Note templates

## Troubleshooting

### Notes Not Saving
- Check if localStorage is enabled in your browser
- Ensure you have sufficient disk space
- Try clearing browser cache and cookies

### App Not Loading
- Verify all three files are in the same directory
- Check browser console for JavaScript errors
- Ensure JavaScript is enabled in your browser

### Mobile Issues
- The app is designed to be mobile-responsive
- If issues persist, try refreshing the page
- Ensure you're using a modern mobile browser

## Contributing

This is a simple, single-file application designed for personal use. Feel free to:
- Modify the code for your own needs
- Share improvements with the community
- Report bugs or suggest features

## License

This project is open source and available under the MIT License.

## Support

For questions or issues:
1. Check the browser console for error messages
2. Verify all files are present and properly named
3. Test in a different browser to isolate issues

---

**Happy CTF-ing! 🚩**

*Use this app to keep track of your learning, techniques, and solutions as you tackle various Capture The Flag challenges.*
