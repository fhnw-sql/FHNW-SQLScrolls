# 🖼️Frontend: Webclient through NGinx

**[Dockerfile](../../frontend/Dockerfile)**

## 📂 Component Folder Structure

```
frontend/
├── admin/                                  # WIP admin pages such as the editor, summary and certificate
├── assets/                                 # Image assets
├── books/                                  # Books (json-format)
├── css/
│ ├── style.css                             # Styling for application and books
│ └── endgame.css                           # Styling for endgame
├── i18n/                                   # Translations
├── js/                                     # Application javascript files
├── libs/                                   # NPM managed libraries / dependencies
├── nginx/                                  # Webserver configuration
├── sounds/                                 # Sound assets
├── tasks/                                  # Tasks for books (json-format)
├── vendor/                                 # Manually managed libraries / dependencies
├── docs/                                   # Documentation hub (technical docs, development docs, etc.)
├── frontend/                               # Frontend web client (HTML, CSS, JS, localization, books and tasks)
├── Dockerfile                              # Docker configuration
├── index.html                              # Main application entry point
├── package.json                            # NPM management file
└── package-lock.json                       # NPM generated source file (do not manually edit)
```

---

## ⚙️ Configuration

- **Books & Tasks**  
  Configurable via `.task` and `.book` files in `/frontend/tasks` and `/frontend/books`.

- **Language Support**  
  Add translations via:
    - `/frontend/i18n/<lang>.js`
    - `/frontend/books/<lang>/Book-<>.book`
    - `/frontend/tasks/<lang>/Task-<>.task`
    - Update the `language-selector` in `index.html`

- **Progression Rules**  
  Found in `/frontend/tasks/progression.js`.

- **General Settings**  
  Configurable in `/frontend/js/configuration.js`:
    - `API_URL`
    - `FALSE_ANSWER_UNTIL_MODEL_ANSWER`
    - `EDITOR_PASSWORD`

---

## 🗺️ Overview

### JavaScript Core (`/js`)

- **main.js**: Application bootstrapping and initialization
- **api.js**: Backend API communication layer
- **views.js**: View management and rendering system
- **tasks.js**: Task handling and validation logic
- **editors.js**: SQL and content editing capabilities
- **i18n.js**: Internationalization support
- **saveState.js**: Game state persistence management
- **configuration.js**: Application configuration management

### Styling (`/css`)

- **style.css**: Main application styling
- **endgame.css**: Specific styles for end-game scenarios

### Content (`/books` and `/tasks`)

- **books/**: Contains structured learning materials
    - Individual book folders with content
    - Shared resources across books

- **tasks/**: Exercise definitions
    - SQL tasks with validation rules
    - JSON-based task configurations

### Administrative Tools (`/admin`)

- Content management interface
- Administrative dashboard
- Editor tools for books and tasks

### Configuration (`/nginx`)

- Web server configuration
- Routing rules
- Server optimization settings

### Media Assets (`/sounds`)

- Sound effects for interactions
- Background music
- Audio feedback system

---

## 📦 Dependencies

- All frontend dependencies are managed via `package.json` and installed using `npm install`.
- Third-party libraries are copied into `/frontend/libs/` for static delivery by the webserver.

**Managing dependencies:**

- Use `npm install <package>` to add or update libraries.
- The `prepare` script (`npm run prepare`) automatically copies updated files from `node_modules/` into `libs/`.

**Special case:**

- `js-parsons` (Parsons Puzzle) is included directly in `/frontend/vendor/` rather than as an npm package.  
  This is because it does not have an official npm release or requires custom integration.

**Key Libraries (installed via npm):**

- `jquery`, `jquery-ui`, `jquery-ui-touch-punch` – DOM manipulation and UI elements.
- `bootstrap` – Responsive HTML/CSS components.
- `@fortawesome/fontawesome-free` – Icon library.
- `sql.js` – SQLite compiled to WebAssembly, used for executing SQL in the browser.
- `canvas-confetti` – Confetti animations for gamification.
- `dygraphs` – Interactive graphing/charting library.
- `lodash`, `moment` – Utility and date/time libraries.
- `html2pdf.js` – Export web pages as PDFs.






