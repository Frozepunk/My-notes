// Enhanced CTF Notes Application - Main JavaScript File

class CTFNotesApp {
    constructor() {
        this.notes = this.loadNotes();
        this.currentFilter = 'all';
        this.currentSearch = '';
        this.editingNoteId = null;
        this.currentView = 'grid';
        this.currentSort = 'newest';
        this.isDarkMode = this.loadTheme();
        
        this.initializeEventListeners();
        this.applyTheme();
        this.renderNotes();
        this.updateStats();
        this.updateNotesCount();
        this.loadTemplates();
    }

    // Initialize all event listeners
    initializeEventListeners() {
        // Category filter buttons
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setActiveCategory(e.target.dataset.category);
            });
        });

        // Search input
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.currentSearch = e.target.value.toLowerCase();
            this.renderNotes();
        });

        // Search clear button
        document.getElementById('searchClear').addEventListener('click', () => {
            document.getElementById('searchInput').value = '';
            this.currentSearch = '';
            this.renderNotes();
        });

        // New note button
        document.getElementById('newNoteBtn').addEventListener('click', () => {
            this.openNoteModal();
        });

        // Template button
        document.getElementById('templateBtn').addEventListener('click', () => {
            this.openTemplatesModal();
        });

        // Export button
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportNotes();
        });

        // Import button
        document.getElementById('importBtn').addEventListener('click', () => {
            this.openImportModal();
        });

        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // View options
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setView(e.target.dataset.view);
            });
        });

        // Sort options
        document.getElementById('sortSelect').addEventListener('change', (e) => {
            this.currentSort = e.target.value;
            this.renderNotes();
        });

        // Rich text editor toolbar
        this.initializeRichTextEditor();

        // Modal close buttons
        document.getElementById('closeModal').addEventListener('click', () => {
            this.closeNoteModal();
        });

        document.getElementById('closeDeleteModal').addEventListener('click', () => {
            this.closeDeleteModal();
        });

        document.getElementById('closeTemplatesModal').addEventListener('click', () => {
            this.closeTemplatesModal();
        });

        document.getElementById('closeImportModal').addEventListener('click', () => {
            this.closeImportModal();
        });

        // Note editor buttons
        document.getElementById('backToNotes').addEventListener('click', () => {
            this.closeNoteModal();
        });

        document.getElementById('cancelNoteBtn').addEventListener('click', () => {
            this.closeNoteModal();
        });

        // Form submission - prevent default and handle with button clicks
        document.getElementById('noteForm').addEventListener('submit', (e) => {
            e.preventDefault();
            // Don't call saveNote here, let the buttons handle it
        });

        // Cancel buttons
        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.closeNoteModal();
        });

        document.getElementById('cancelDeleteBtn').addEventListener('click', () => {
            this.closeDeleteModal();
        });

        document.getElementById('cancelImportBtn').addEventListener('click', () => {
            this.closeImportModal();
        });

        // Delete confirmation
        document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
            this.confirmDeleteNote();
        });

        // Import confirmation
        document.getElementById('confirmImportBtn').addEventListener('click', () => {
            this.confirmImport();
        });

        // Import file input
        document.getElementById('importFile').addEventListener('change', (e) => {
            this.handleFileImport(e);
        });

        // Import text input
        document.getElementById('importText').addEventListener('input', (e) => {
            this.handleTextImport(e);
        });

        // Close shortcuts help
        document.getElementById('closeShortcuts').addEventListener('click', () => {
            this.closeShortcutsHelp();
        });

        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeNoteModal();
                this.closeDeleteModal();
                this.closeTemplatesModal();
                this.closeImportModal();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // Show shortcuts help on first visit
        if (!localStorage.getItem('shortcutsShown')) {
            setTimeout(() => {
                this.showShortcutsHelp();
            }, 2000);
        }
    }

    // Initialize rich text editor
    initializeRichTextEditor() {
        const toolbar = document.querySelector('.rich-text-toolbar');
        const editor = document.getElementById('richTextEditor');
        
        // Initialize undo/redo history
        this.editorHistory = [];
        this.currentHistoryIndex = -1;
        this.maxHistorySize = 50;
        
        // Add event listeners to toolbar buttons
        toolbar.addEventListener('click', (e) => {
            if (e.target.closest('.format-btn')) {
                e.preventDefault();
                const button = e.target.closest('.format-btn');
                const command = button.dataset.command;
                this.executeCommand(command, button);
            }
        });

        // Handle keyboard shortcuts in editor
        editor.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'b':
                        e.preventDefault();
                        this.executeCommand('bold');
                        break;
                    case 'i':
                        e.preventDefault();
                        this.executeCommand('italic');
                        break;
                    case 'u':
                        e.preventDefault();
                        this.executeCommand('underline');
                        break;
                    case 'z':
                        if (!e.shiftKey) {
                            e.preventDefault();
                            this.executeCommand('undo');
                        }
                        break;
                    case 'y':
                        e.preventDefault();
                        this.executeCommand('redo');
                        break;
                    case 's':
                        e.preventDefault();
                        this.saveNote();
                        break;
                }
            }
        });

        // Save editor state for undo/redo
        editor.addEventListener('input', () => {
            this.saveEditorState();
            this.updateToolbarState();
        });

        editor.addEventListener('keyup', () => {
            this.updateToolbarState();
        });

        editor.addEventListener('mouseup', () => {
            this.updateToolbarState();
        });
        
        // Save initial state
        this.saveEditorState();
    }

    // Execute formatting commands
    executeCommand(command, button = null) {
        const editor = document.getElementById('richTextEditor');
        
        try {
            switch (command) {
                case 'bold':
                case 'italic':
                case 'underline':
                    document.execCommand(command, false, null);
                    break;
                    
                case 'insertUnorderedList':
                case 'insertOrderedList':
                    document.execCommand(command, false, null);
                    break;
                    
                case 'justifyLeft':
                case 'justifyCenter':
                case 'justifyRight':
                    document.execCommand(command, false, null);
                    break;
                    
                case 'undo':
                    console.log('Executing undo command');
                    this.undo();
                    break;
                    
                case 'redo':
                    console.log('Executing redo command');
                    this.redo();
                    break;
                    
                case 'createLink':
                    this.insertLink();
                    break;
                    
                case 'insertCode':
                    this.insertCodeBlock();
                    break;
                    
                case 'insertTable':
                    this.insertTable();
                    break;
                    
                case 'formatBlock':
                    this.insertHeading();
                    break;
                    
                case 'insertBlockquote':
                    this.insertBlockquote();
                    break;
            }
        } catch (error) {
            console.error('Error executing command:', command, error);
        }
        
        editor.focus();
        this.updateToolbarState();
    }

    // Save editor state for undo/redo
    saveEditorState() {
        const editor = document.getElementById('richTextEditor');
        const currentState = editor.innerHTML;
        
        // Don't save if it's the same as the last state
        if (this.editorHistory.length > 0 && 
            this.editorHistory[this.currentHistoryIndex] === currentState) {
            return;
        }
        
        // Remove any states after current index (for redo)
        this.editorHistory = this.editorHistory.slice(0, this.currentHistoryIndex + 1);
        
        // Add new state
        this.editorHistory.push(currentState);
        this.currentHistoryIndex++;
        
        // Limit history size
        if (this.editorHistory.length > this.maxHistorySize) {
            this.editorHistory.shift();
            this.currentHistoryIndex--;
        }
        
        console.log('Editor state saved, history length:', this.editorHistory.length);
    }

    // Custom undo implementation
    undo() {
        if (this.currentHistoryIndex > 0) {
            this.currentHistoryIndex--;
            const editor = document.getElementById('richTextEditor');
            editor.innerHTML = this.editorHistory[this.currentHistoryIndex];
            console.log('Undo executed, current index:', this.currentHistoryIndex);
        } else {
            console.log('Nothing to undo');
        }
    }

    // Custom redo implementation
    redo() {
        if (this.currentHistoryIndex < this.editorHistory.length - 1) {
            this.currentHistoryIndex++;
            const editor = document.getElementById('richTextEditor');
            editor.innerHTML = this.editorHistory[this.currentHistoryIndex];
            console.log('Redo executed, current index:', this.currentHistoryIndex);
        } else {
            console.log('Nothing to redo');
        }
    }

    // Insert link
    insertLink() {
        const url = prompt('Enter URL:', 'https://');
        if (url) {
            document.execCommand('createLink', false, url);
        }
    }

    // Insert code block
    insertCodeBlock() {
        const editor = document.getElementById('richTextEditor');
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        
        const pre = document.createElement('pre');
        const code = document.createElement('code');
        code.textContent = selection.toString() || '// Your code here';
        
        pre.appendChild(code);
        range.deleteContents();
        range.insertNode(pre);
        
        // Move cursor inside code block
        const newRange = document.createRange();
        newRange.setStart(code, 0);
        newRange.setEnd(code, 0);
        selection.removeAllRanges();
        selection.addRange(newRange);
    }

    // Insert table
    insertTable() {
        const rows = prompt('Number of rows:', '3');
        const cols = prompt('Number of columns:', '3');
        
        if (rows && cols && !isNaN(rows) && !isNaN(cols)) {
            const table = document.createElement('table');
            
            for (let i = 0; i < parseInt(rows); i++) {
                const tr = document.createElement('tr');
                for (let j = 0; j < parseInt(cols); j++) {
                    const cell = i === 0 ? document.createElement('th') : document.createElement('td');
                    cell.textContent = i === 0 ? `Header ${j + 1}` : `Cell ${i}-${j + 1}`;
                    tr.appendChild(cell);
                }
                table.appendChild(tr);
            }
            
            const selection = window.getSelection();
            const range = selection.getRangeAt(0);
            range.insertNode(table);
        }
    }

    // Insert heading
    insertHeading() {
        const level = prompt('Heading level (1-6):', '3');
        if (level && !isNaN(level) && level >= 1 && level <= 6) {
            const heading = document.createElement(`h${level}`);
            const selection = window.getSelection();
            const range = selection.getRangeAt(0);
            
            if (selection.toString()) {
                heading.textContent = selection.toString();
                range.deleteContents();
            } else {
                heading.textContent = `Heading ${level}`;
            }
            
            range.insertNode(heading);
            
            // Move cursor to end of heading
            const newRange = document.createRange();
            newRange.setStartAfter(heading);
            newRange.collapse(true);
            selection.removeAllRanges();
            selection.addRange(newRange);
        }
    }

    // Insert blockquote
    insertBlockquote() {
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        
        const blockquote = document.createElement('blockquote');
        if (selection.toString()) {
            blockquote.textContent = selection.toString();
            range.deleteContents();
        } else {
            blockquote.textContent = 'Your quote here...';
        }
        
        range.insertNode(blockquote);
        
        // Move cursor inside blockquote
        const newRange = document.createRange();
        newRange.setStart(blockquote, 0);
        newRange.setEnd(blockquote, 0);
        selection.removeAllRanges();
        selection.addRange(newRange);
    }

    // Update toolbar button states
    updateToolbarState() {
        const editor = document.getElementById('richTextEditor');
        const buttons = document.querySelectorAll('.format-btn');
        
        buttons.forEach(button => {
            const command = button.dataset.command;
            
            if (['bold', 'italic', 'underline'].includes(command)) {
                if (document.queryCommandState(command)) {
                    button.classList.add('active');
                } else {
                    button.classList.remove('active');
                }
            } else if (['justifyLeft', 'justifyCenter', 'justifyRight'].includes(command)) {
                const state = document.queryCommandState(command);
                if (state) {
                    // Remove active from other alignment buttons
                    document.querySelectorAll('[data-command^="justify"]').forEach(btn => {
                        btn.classList.remove('active');
                    });
                    button.classList.add('active');
                }
            }
        });
    }

    // Handle keyboard shortcuts
    handleKeyboardShortcuts(e) {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'n':
                    e.preventDefault();
                    this.openNoteModal();
                    break;
                case 'e':
                    e.preventDefault();
                    this.exportNotes();
                    break;
                case 'i':
                    e.preventDefault();
                    this.openImportModal();
                    break;
                case 'f':
                    e.preventDefault();
                    document.getElementById('searchInput').focus();
                    break;
            }
        } else if (e.key === 'Escape') {
            this.closeAllModals();
        }
    }

    // Show shortcuts help
    showShortcutsHelp() {
        document.getElementById('shortcutsHelp').style.display = 'block';
    }

    // Close shortcuts help
    closeShortcutsHelp() {
        document.getElementById('shortcutsHelp').style.display = 'none';
        localStorage.setItem('shortcutsShown', 'true');
    }

    // Close all modals
    closeAllModals() {
        this.closeNoteModal();
        this.closeDeleteModal();
        this.closeTemplatesModal();
        this.closeImportModal();
    }

    // Theme management
    loadTheme() {
        return localStorage.getItem('theme') === 'dark';
    }

    saveTheme() {
        localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
    }

    toggleTheme() {
        this.isDarkMode = !this.isDarkMode;
        this.saveTheme();
        this.applyTheme();
    }

    applyTheme() {
        const themeIcon = document.getElementById('themeToggle').querySelector('i');
        if (this.isDarkMode) {
            document.documentElement.setAttribute('data-theme', 'dark');
            themeIcon.className = 'fas fa-sun';
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            themeIcon.className = 'fas fa-moon';
        }
    }

    // Set view mode
    setView(view) {
        this.currentView = view;
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-view="${view}"]`).classList.add('active');
        
        const notesGrid = document.getElementById('notesGrid');
        if (view === 'list') {
            notesGrid.classList.add('list-view');
        } else {
            notesGrid.classList.remove('list-view');
        }
    }

    // Set active category and update UI
    setActiveCategory(category) {
        this.currentFilter = category;
        
        // Update active button state
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-category="${category}"]`).classList.add('active');
        
        // Update notes title
        const titleMap = {
            'all': 'All Notes',
            'web': 'Web Challenges',
            'crypto': 'Crypto Challenges',
            'forensics': 'Forensics Challenges',
            'reverse': 'Reverse Engineering',
            'pwn': 'Pwn Challenges',
            'misc': 'Miscellaneous'
        };
        

    // Initialize editor event listeners once
    initEditorEventListeners() {
        // Save button in header
        const headerSaveBtn = document.getElementById('saveNoteBtn');
        if (headerSaveBtn && !headerSaveBtn.dataset.listenerAdded) {
            headerSaveBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.saveNote();
            });
            headerSaveBtn.dataset.listenerAdded = 'true';
        }
        
        // Save button in footer
        const footerSaveBtn = document.getElementById('saveNoteBtnFooter');
        if (footerSaveBtn && !footerSaveBtn.dataset.listenerAdded) {
            footerSaveBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.saveNote();
            });
            footerSaveBtn.dataset.listenerAdded = 'true';
        }
        
        // Delete button
        const deleteBtn = document.getElementById('deleteNoteBtn');
        if (deleteBtn && !deleteBtn.dataset.listenerAdded) {
            deleteBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (this.editingNoteId) {
                    this.openDeleteModal(this.editingNoteId);
                }
            });
            deleteBtn.dataset.listenerAdded = 'true';
        }
    }

    // Populate form fields with note data
    populateNoteForm(note) {
        if (!note) return;
        
        document.getElementById('noteTitle').value = note.title || '';
        document.getElementById('noteCategory').value = note.category || 'web';
        document.getElementById('noteTags').value = note.tags ? note.tags.join(', ') : '';
        document.getElementById('noteDifficulty').value = note.difficulty || 'medium';
        document.getElementById('noteStatus').value = note.status || 'not-started';
        
        // Set content
        const richTextEditor = document.getElementById('richTextEditor');
        if (richTextEditor && note.content) {
            richTextEditor.innerHTML = note.content;
        }
        
        // Set favorite status
        const favoriteBtn = document.getElementById('favoriteBtn');
        if (favoriteBtn) {
            if (note.favorite) {
                favoriteBtn.innerHTML = '<i class="fas fa-heart"></i>';
                favoriteBtn.classList.add('favorite');
            } else {
                favoriteBtn.innerHTML = '<i class="far fa-heart"></i>';
                favoriteBtn.classList.remove('favorite');
            }
        }
    }

    // Open note modal for creating/editing
    openNoteModal(noteId = null) {
        try {
            const noteEditor = document.getElementById('noteEditor');
            const editorTitle = document.getElementById('editorTitle');
            const form = document.getElementById('noteForm');
            const deleteBtn = document.getElementById('deleteNoteBtn');
            const richTextEditor = document.getElementById('richTextEditor');
            
            if (!noteEditor || !editorTitle || !form || !richTextEditor) {
                console.error('Required editor elements not found');
                return;
            }

            // Reset form and editor
            form.reset();
            richTextEditor.innerHTML = '';
            
            // Initialize event listeners once
            this.initEditorEventListeners();
            
            if (noteId) {
                // Editing existing note
                this.editingNoteId = noteId;
                const note = this.notes.find(n => n.id === noteId);
                
                if (note) {
                    editorTitle.textContent = 'Edit Note';
                    this.populateNoteForm(note);
                    
                    // Show delete button for existing notes
                    if (deleteBtn) {
                        deleteBtn.style.display = 'inline-flex';
                    }
                }
            } else {
                // Creating new note
                this.editingNoteId = null;
                editorTitle.textContent = 'New Note';
                
                // Hide delete button for new notes
                if (deleteBtn) {
                    deleteBtn.style.display = 'none';
                }
                
                // Reset favorite button
                const favoriteBtn = document.getElementById('favoriteBtn');
                if (favoriteBtn) {
                    favoriteBtn.innerHTML = '<i class="far fa-heart"></i>';
                    favoriteBtn.classList.remove('favorite');
                }
            }
            
            // Show the editor
            noteEditor.classList.remove('hide');
            noteEditor.classList.add('show');
            
            // Hide the main notes view
            const mainContent = document.querySelector('.main-content');
            if (mainContent) {
                mainContent.style.display = 'none';
            }
            
            // Set focus to title field
            const titleInput = document.getElementById('noteTitle');
            if (titleInput) {
                titleInput.focus();
            }
            
        } catch (error) {
            console.error('Error in openNoteModal:', error);
            this.showToast('An error occurred while opening the editor', 'error');
        }
    }

    // Close note modal
    closeNoteModal() {
        const noteEditor = document.getElementById('noteEditor');
        noteEditor.classList.remove('show');
        noteEditor.classList.add('hide');
        
        // Show the main notes view
        document.querySelector('.main-content').style.display = 'block';
        
        this.editingNoteId = null;
        document.getElementById('noteForm').reset();
        document.getElementById('richTextEditor').innerHTML = '';
    }

    // Save note (create or update)
    async saveNote() {
        const saveBtnHeader = document.getElementById('saveNoteBtn');
        const saveBtnFooter = document.getElementById('saveNoteBtnFooter');
        
        const btnTextHeader = saveBtnHeader.querySelector('.btn-text');
        const btnLoadingHeader = saveBtnHeader.querySelector('.btn-loading');
        const btnTextFooter = saveBtnFooter.querySelector('.btn-text');
        const btnLoadingFooter = saveBtnFooter.querySelector('.btn-loading');
        
        // Show loading state on both buttons
        saveBtnHeader.classList.add('loading');
        saveBtnHeader.disabled = true;
        saveBtnFooter.classList.add('loading');
        saveBtnFooter.disabled = true;
        
        // Simulate save delay for better UX
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const title = document.getElementById('noteTitle').value.trim();
        const category = document.getElementById('noteCategory').value;
        const tags = document.getElementById('noteTags').value
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0);
        const contentHtml = document.getElementById('richTextEditor').innerHTML;
        const content = document.getElementById('richTextEditor').textContent || document.getElementById('richTextEditor').innerText;
        const difficulty = document.getElementById('noteDifficulty').value;
        const status = document.getElementById('noteStatus').value;
        
        if (!title || !content.trim()) {
            this.showToast('Please fill in all required fields.', 'error');
            saveBtnHeader.classList.remove('loading');
            saveBtnHeader.disabled = false;
            saveBtnFooter.classList.remove('loading');
            saveBtnFooter.disabled = false;
            return;
        }
        
        if (this.editingNoteId) {
            // Update existing note
            const noteIndex = this.notes.findIndex(n => n.id === this.editingNoteId);
            if (noteIndex !== -1) {
                this.notes[noteIndex] = {
                    ...this.notes[noteIndex],
                    title,
                    category,
                    tags,
                    content,
                    contentHtml,
                    difficulty,
                    status,
                    lastModified: new Date().toISOString()
                };
            }
            this.showToast('Note updated successfully!', 'success');
        } else {
            // Create new note
            const newNote = {
                id: this.generateId(),
                title,
                category,
                tags,
                content,
                contentHtml,
                difficulty,
                status,
                favorite: false,
                created: new Date().toISOString(),
                lastModified: new Date().toISOString()
            };
            this.notes.unshift(newNote);
            this.showToast('Note created successfully!', 'success');
        }
        
        this.saveNotes();
        this.renderNotes();
        this.updateStats();
        this.updateNotesCount();
        this.closeNoteModal();
        
        // Reset button states
        saveBtnHeader.classList.remove('loading');
        saveBtnHeader.disabled = false;
        saveBtnFooter.classList.remove('loading');
        saveBtnFooter.disabled = false;
    }

    // Delete note
    deleteNote(noteId) {
        console.log('Deleting note with ID:', noteId);
        const noteIndex = this.notes.findIndex(note => note.id === noteId);
        if (noteIndex !== -1) {
            const deletedNote = this.notes[noteIndex];
            console.log('Deleting note:', deletedNote.title);
            this.notes.splice(noteIndex, 1);
            this.saveNotes();
            this.renderNotes();
            this.updateStats();
            this.updateNotesCount();
            this.showToast('Note deleted successfully!', 'success');
        } else {
            console.error('Note not found for deletion:', noteId);
        }
    }

    // Open delete confirmation modal
    openDeleteModal(noteId) {
        console.log('Opening delete modal for note:', noteId);
        this.editingNoteId = noteId;
        const deleteModal = document.getElementById('deleteModal');
        if (deleteModal) {
            deleteModal.style.display = 'block';
            console.log('Delete modal displayed');
        } else {
            console.error('Delete modal not found!');
        }
    }

    // Close delete modal
    closeDeleteModal() {
        console.log('Closing delete modal');
        const deleteModal = document.getElementById('deleteModal');
        if (deleteModal) {
            deleteModal.style.display = 'none';
        }
        this.editingNoteId = null;
    }

    // Confirm and execute note deletion
    confirmDeleteNote() {
        console.log('Confirming deletion of note:', this.editingNoteId);
        if (this.editingNoteId) {
            this.deleteNote(this.editingNoteId);
            this.closeDeleteModal();
        } else {
            console.error('No note ID to delete');
        }
    }

    // Templates functionality
    loadTemplates() {
        this.templates = [
            {
                id: 'web-sql-injection',
                title: 'SQL Injection',
                category: 'web',
                description: 'Template for SQL injection challenges',
                content: 'Challenge: [Describe the challenge]\n\nTools Used:\n- [List tools]\n\nPayloads:\n- [List payloads]\n\nSolution:\n[Explain the solution]\n\nLessons Learned:\n[Key takeaways]'
            },
            {
                id: 'crypto-caesar',
                title: 'Caesar Cipher',
                category: 'crypto',
                description: 'Template for substitution cipher challenges',
                content: 'Challenge: [Describe the challenge]\n\nCipher Type: [Caesar, ROT13, etc.]\n\nKey: [Shift value if known]\n\nTools Used:\n- [List tools]\n\nSolution:\n[Explain the solution]\n\nCode:\n[Any code used]'
            },
            {
                id: 'forensics-memory',
                title: 'Memory Analysis',
                category: 'forensics',
                description: 'Template for memory dump analysis',
                content: 'Challenge: [Describe the challenge]\n\nFile Type: [Memory dump format]\n\nTools Used:\n- Volatility\n- [Other tools]\n\nCommands:\n- imageinfo\n- pslist\n- [Other commands]\n\nFindings:\n[What you discovered]'
            }
        ];
    }

    // Open templates modal
    openTemplatesModal() {
        document.getElementById('templatesModal').style.display = 'block';
        this.renderTemplates();
    }

    // Close templates modal
    closeTemplatesModal() {
        document.getElementById('templatesModal').style.display = 'none';
    }

    // Render templates
    renderTemplates() {
        const templatesGrid = document.getElementById('templatesGrid');
        const activeCategory = document.querySelector('.template-cat-btn.active').dataset.templateCat;
        
        let filteredTemplates = this.templates;
        if (activeCategory !== 'all') {
            filteredTemplates = this.templates.filter(t => t.category === activeCategory);
        }
        
        templatesGrid.innerHTML = filteredTemplates.map(template => `
            <div class="template-card" data-template-id="${template.id}">
                <div class="template-title">${template.title}</div>
                <div class="template-description">${template.description}</div>
                <span class="template-category">${template.category}</span>
            </div>
        `).join('');
        
        // Add event listeners
        document.querySelectorAll('.template-card').forEach(card => {
            card.addEventListener('click', () => {
                this.useTemplate(card.dataset.templateId);
            });
        });
    }

    // Use template
    useTemplate(templateId) {
        const template = this.templates.find(t => t.id === templateId);
        if (template) {
            this.closeTemplatesModal();
            this.openNoteModal();
            
            // Fill in template data
            document.getElementById('noteTitle').value = template.title;
            document.getElementById('noteCategory').value = template.category;
            document.getElementById('noteContent').value = template.content;
            
            this.showToast(`Template "${template.title}" loaded!`, 'success');
        }
    }

    // Export notes
    exportNotes() {
        const dataStr = JSON.stringify(this.notes, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `ctf-notes-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        this.showToast('Notes exported successfully!', 'success');
    }

    // Open import modal
    openImportModal() {
        document.getElementById('importModal').style.display = 'block';
        document.getElementById('importPreview').style.display = 'none';
    }

    // Close import modal
    closeImportModal() {
        document.getElementById('importModal').style.display = 'none';
        document.getElementById('importFile').value = '';
        document.getElementById('importText').value = '';
    }

    // Handle file import
    handleFileImport(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    this.showImportPreview(data);
                } catch (error) {
                    this.showToast('Invalid JSON file!', 'error');
                }
            };
            reader.readAsText(file);
        }
    }

    // Handle text import
    handleTextImport(e) {
        const text = e.target.value.trim();
        if (text) {
            try {
                const data = JSON.parse(text);
                this.showImportPreview(data);
            } catch (error) {
                // Don't show error while typing
            }
        } else {
            document.getElementById('importPreview').style.display = 'none';
        }
    }

    // Show import preview
    showImportPreview(data) {
        if (Array.isArray(data) && data.length > 0) {
            const preview = document.getElementById('importPreview');
            const content = document.getElementById('importPreviewContent');
            
            content.innerHTML = `
                <p>Found ${data.length} notes to import:</p>
                <ul>
                    ${data.slice(0, 5).map(note => `<li>${note.title || 'Untitled'} (${note.category || 'Unknown'})</li>`).join('')}
                    ${data.length > 5 ? `<li>... and ${data.length - 5} more</li>` : ''}
                </ul>
            `;
            
            preview.style.display = 'block';
            this.importData = data;
        }
    }

    // Confirm import
    confirmImport() {
        if (this.importData) {
            // Merge with existing notes, avoiding duplicates
            const existingIds = new Set(this.notes.map(n => n.id));
            const newNotes = this.importData.filter(note => !existingIds.has(note.id));
            
            if (newNotes.length > 0) {
                this.notes = [...this.notes, ...newNotes];
                this.saveNotes();
                this.renderNotes();
                this.updateStats();
                this.updateNotesCount();
                this.showToast(`Imported ${newNotes.length} new notes!`, 'success');
            } else {
                this.showToast('No new notes to import!', 'warning');
            }
            
            this.closeImportModal();
        }
    }

    // Render notes based on current filter and search
    renderNotes() {
        const notesGrid = document.getElementById('notesGrid');
        let filteredNotes = this.notes;
        
        // Apply category filter
        if (this.currentFilter !== 'all') {
            filteredNotes = filteredNotes.filter(note => note.category === this.currentFilter);
        }
        
        // Apply search filter
        if (this.currentSearch) {
            filteredNotes = filteredNotes.filter(note => 
                note.title.toLowerCase().includes(this.currentSearch) ||
                note.content.toLowerCase().includes(this.currentSearch) ||
                note.tags.some(tag => tag.toLowerCase().includes(this.currentSearch))
            );
        }
        
        // Apply sorting
        filteredNotes = this.sortNotes(filteredNotes);
        
        if (filteredNotes.length === 0) {
            notesGrid.innerHTML = this.getEmptyStateHTML();
            return;
        }
        
        notesGrid.innerHTML = filteredNotes.map(note => this.getNoteCardHTML(note)).join('');
        
        // Add event listeners to note cards
        this.addNoteCardEventListeners();
    }

    // Sort notes
    sortNotes(notes) {
        switch (this.currentSort) {
            case 'newest':
                return [...notes].sort((a, b) => new Date(b.created) - new Date(a.created));
            case 'oldest':
                return [...notes].sort((a, b) => new Date(a.created) - new Date(b.created));
            case 'title':
                return [...notes].sort((a, b) => a.title.localeCompare(b.title));
            case 'category':
                return [...notes].sort((a, b) => a.category.localeCompare(b.category));
            default:
                return notes;
        }
    }

    // Get HTML for empty state
    getEmptyStateHTML() {
        const emptyMessages = {
            'all': 'No notes found. Create your first CTF challenge note!',
            'web': 'No web challenge notes found.',
            'crypto': 'No crypto challenge notes found.',
            'forensics': 'No forensics challenge notes found.',
            'reverse': 'No reverse engineering notes found.',
            'pwn': 'No pwn challenge notes found.',
            'misc': 'No miscellaneous notes found.'
        };
        
        const message = this.currentSearch 
            ? `No notes found matching "${this.currentSearch}"`
            : emptyMessages[this.currentFilter] || 'No notes found.';
        
        return `
            <div class="empty-state">
                <i class="fas fa-notes-medical"></i>
                <h3>No Notes Found</h3>
                <p>${message}</p>
            </div>
        `;
    }

    // Get HTML for a note card
    getNoteCardHTML(note) {
        const categoryColors = {
            'web': '#007bff',
            'crypto': '#28a745',
            'forensics': '#ffc107',
            'reverse': '#6f42c1',
            'pwn': '#dc3545',
            'misc': '#6c757d'
        };
        
        const categoryColor = categoryColors[note.category] || '#667eea';
        const createdDate = new Date(note.created).toLocaleDateString();
        const modifiedDate = new Date(note.lastModified).toLocaleDateString();
        
        return `
            <div class="note-card ${note.favorite ? 'favorite' : ''}" data-note-id="${note.id}">
                <div class="note-header">
                    <div>
                        <div class="note-title">${this.escapeHtml(note.title)}</div>
                        <span class="note-category" style="background-color: ${categoryColor}">
                            ${note.category.toUpperCase()}
                        </span>
                    </div>
                </div>
                
                ${note.difficulty || note.status ? `
                    <div class="note-meta">
                        ${note.difficulty ? `<span class="note-difficulty ${note.difficulty}">${note.difficulty}</span>` : ''}
                        ${note.status ? `<span class="note-status ${note.status}">${note.status}</span>` : ''}
                    </div>
                ` : ''}
                
                ${note.tags.length > 0 ? `
                    <div class="note-tags">
                        ${note.tags.map(tag => `<span class="note-tag">${this.escapeHtml(tag)}</span>`).join('')}
                    </div>
                ` : ''}
                
                <div class="note-content">${this.renderRichTextPreview(note.contentHtml || note.content)}</div>
                
                <div class="note-footer">
                    <div>
                        <small>Created: ${createdDate}</small>
                        ${createdDate !== modifiedDate ? `<br><small>Modified: ${modifiedDate}</small>` : ''}
                    </div>
                    <div class="note-actions">
                        <button class="action-btn favorite" title="Toggle favorite">
                            <i class="${note.favorite ? 'fas' : 'far'} fa-heart"></i>
                        </button>
                        <button class="action-btn edit" title="Edit note">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" title="Delete note">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Add event listeners to note cards
    addNoteCardEventListeners() {
        // Favorite buttons
        document.querySelectorAll('.action-btn.favorite').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const noteCard = btn.closest('.note-card');
                const noteId = noteCard.dataset.noteId;
                this.toggleFavorite(noteId);
            });
        });
        
        // Edit buttons
        document.querySelectorAll('.action-btn.edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const noteCard = btn.closest('.note-card');
                const noteId = noteCard.dataset.noteId;
                this.openNoteModal(noteId);
            });
        });
        
        // Delete buttons
        document.querySelectorAll('.action-btn.delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const noteCard = btn.closest('.note-card');
                const noteId = noteCard.dataset.noteId;
                this.openDeleteModal(noteId);
            });
        });
        
        // Note card click (for future expansion)
        document.querySelectorAll('.note-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.note-actions')) {
                    // Could expand to show full note content
                    // For now, just open edit modal
                    const noteId = card.dataset.noteId;
                    this.openNoteModal(noteId);
                }
            });
        });
    }

    // Toggle favorite status
    toggleFavorite(noteId) {
        const noteIndex = this.notes.findIndex(n => n.id === noteId);
        if (noteIndex !== -1) {
            this.notes[noteIndex].favorite = !this.notes[noteIndex].favorite;
            this.saveNotes();
            this.renderNotes();
            this.updateStats();
            
            const status = this.notes[noteIndex].favorite ? 'added to' : 'removed from';
            this.showToast(`Note ${status} favorites!`, 'success');
        }
    }

    // Update statistics
    updateStats() {
        const totalNotes = this.notes.length;
        const completedNotes = this.notes.filter(n => n.status === 'completed' || n.status === 'solved').length;
        const favoriteNotes = this.notes.filter(n => n.favorite).length;
        
        document.getElementById('totalNotes').textContent = totalNotes;
        document.getElementById('completedNotes').textContent = completedNotes;
        document.getElementById('favoriteNotes').textContent = favoriteNotes;
    }

    // Update notes count display
    updateNotesCount() {
        const count = this.notes.length;
        const countElement = document.getElementById('notesCount');
        countElement.textContent = `${count} note${count !== 1 ? 's' : ''}`;
    }

    // Show toast notification
    showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        toastContainer.appendChild(toast);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    // Generate unique ID for notes
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Load notes from localStorage
    loadNotes() {
        try {
            const savedNotes = localStorage.getItem('ctfNotes');
            return savedNotes ? JSON.parse(savedNotes) : [];
        } catch (error) {
            console.error('Error loading notes:', error);
            return [];
        }
    }

    // Save notes to localStorage
    saveNotes() {
        try {
            localStorage.setItem('ctfNotes', JSON.stringify(this.notes));
        } catch (error) {
            console.error('Error saving notes:', error);
        }
    }

    // Render rich text preview
    renderRichTextPreview(htmlContent) {
        if (!htmlContent) {
            return '';
        }
        
        // If it's already HTML, return it safely
        if (htmlContent.includes('<')) {
            // Create a temporary div to parse and clean the HTML
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = htmlContent;
            
            // Limit the preview to first few elements for card display
            const previewElements = [];
            let totalLength = 0;
            const maxLength = 200;
            
            for (let i = 0; i < tempDiv.children.length && totalLength < maxLength; i++) {
                const element = tempDiv.children[i];
                const text = element.textContent || element.innerText;
                if (text.trim()) {
                    previewElements.push(element.outerHTML);
                    totalLength += text.length;
                }
            }
            
            return previewElements.join('') + (totalLength >= maxLength ? '...' : '');
        }
        
        // If it's plain text, return escaped
        return this.escapeHtml(htmlContent);
    }

    // Reset editor history for a specific note
    resetEditorHistory() {
        this.editorHistory = []; // Clear all history
        this.currentHistoryIndex = -1; // Reset current index
        this.saveEditorState(); // Save the initial state
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CTFNotesApp();
});

// Add some sample data for first-time users
function addSampleData() {
    const sampleNotes = [
        {
            id: 'sample1',
            title: 'SQL Injection Example',
            category: 'web',
            tags: ['sql', 'injection', 'web', 'example'],
            content: 'Basic SQL injection using UNION SELECT. Remember to always escape user input and use parameterized queries.',
            contentHtml: '<h3>SQL Injection Challenge</h3><p><strong>Challenge:</strong> Basic SQL injection using <code>UNION SELECT</code>.</p><p><em>Key Points:</em></p><ul><li>Always escape user input</li><li>Use parameterized queries</li><li>Test with <code>\' OR 1=1--</code></li></ul><p><strong>Solution:</strong> Use <code>UNION SELECT</code> to extract data from other tables.</p>',
            difficulty: 'medium',
            status: 'completed',
            favorite: false,
            created: new Date(Date.now() - 86400000).toISOString(),
            lastModified: new Date(Date.now() - 86400000).toISOString()
        },
        {
            id: 'sample2',
            title: 'Caesar Cipher Decoder',
            category: 'crypto',
            tags: ['caesar', 'cipher', 'substitution', 'classic'],
            content: 'Shift each letter by a fixed number of positions. Common shifts: 3, 13 (ROT13). Use frequency analysis to verify.',
            contentHtml: '<h3>Caesar Cipher Analysis</h3><p><strong>Method:</strong> Shift each letter by a fixed number of positions.</p><p><em>Common Shifts:</em></p><ul><li>Shift 3: Classic Caesar</li><li>Shift 13: ROT13</li><li>Shift 25: Reverse alphabet</li></ul><p><strong>Tools:</strong> Use frequency analysis to verify the correct shift.</p><pre><code>def caesar_decrypt(text, shift):\n    result = ""\n    for char in text:\n        if char.isalpha():\n            result += chr((ord(char) - shift - 65) % 26 + 65)\n        else:\n            result += char\n    return result</code></pre>',
            difficulty: 'easy',
            status: 'completed',
            favorite: true,
            created: new Date(Date.now() - 172800000).toISOString(),
            lastModified: new Date(Date.now() - 172800000).toISOString()
        },
        {
            id: 'sample3',
            title: 'Memory Dump Analysis',
            category: 'forensics',
            tags: ['memory', 'dump', 'volatility', 'ram'],
            content: 'Use Volatility framework to analyze memory dumps. Common commands: imageinfo, pslist, cmdline, filescan.',
            contentHtml: '<h3>Memory Dump Forensics</h3><p><strong>Tool:</strong> Volatility Framework</p><p><em>Common Commands:</em></p><ol><li><code>imageinfo</code> - Get OS information</li><li><code>pslist</code> - List running processes</li><li><code>cmdline</code> - Show command line arguments</li><li><code>filescan</code> - Scan for files in memory</li></ol><p><strong>Workflow:</strong></p><blockquote>Start with imageinfo to identify the OS profile, then use pslist to see running processes, and finally examine suspicious processes with cmdline.</blockquote>',
            difficulty: 'hard',
            status: 'in-progress',
            favorite: false,
            created: new Date(Date.now() - 259200000).toISOString(),
            lastModified: new Date(Date.now() - 259200000).toISOString()
        }
    ];
    
    // Only add sample data if no notes exist
    if (!localStorage.getItem('ctfNotes')) {
        localStorage.setItem('ctfNotes', JSON.stringify(sampleNotes));
    }
}

// Add sample data when the page loads
addSampleData();