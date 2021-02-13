# FHNW SQL Training Game
SQL training game written in Javascript

## Configuration

- Tasks and books can be configured via `.task` and `.book` files.
- For translating into more languages, add a `/i18n/<lang>.js`, `/books/<lang>/Book-<>.book` files and `/tasks/<lang>/Task-<>.task` files, as well as an option to `language-selector` element in `index.html`
- Progression can be configured in `/tasks/progression.js`

Extra information:
- [async-await-101.md](async-await-101.md) (Finnish)
- [Access editors by going to /editors.html](https://rsl1122.github.io/SQL-Training-game/editors.html)

## Deployment

- Place all files to a webserver so that `index.html` is loaded from some address.
- Prevent access to `editors.html` if you don't want students who find it to read tasks and books ahead of time.

## Acknowledgements

- [sql.js](https://github.com/sql-js/sql.js) SQLite compiled to wasm
- [canvas confetti](https://github.com/catdad/canvas-confetti) JS Confetti cannon
- [Bootstrap 4](https://getbootstrap.com/) HTML, CSS & JS toolkit 
- [Font Awesome 5](https://fontawesome.com/) SVG icons
- [RealFaviconGenerator](https://realfavicongenerator.net/) Favicon from image generator
- [Dygraphs](http://dygraphs.com/) Line graphing library
- Public domain or CC0 asset creators
- [pllk/sqltrainer](https://github.com/pllk/sqltrainer)

## Credits
The code base is based on the work of Risto Lahtela from Helsinki
- [Rsl1122/SQL-Training-Game](https://github.com/Rsl1122/SQL-Training-game)
