# 🕹️ FHNW SQL Training Game

This repository contains the full-stack implementation of the **FHNW SQL Training Game**, a gamified learning platform
developed as part of multiple studies for the Bachelor of Business Information Technology at FHNW. The goal is to
evaluate the effectiveness and acceptance of a learning game as an alternative method for teaching SQL, a core part of
the "Database Technology" course.

## ✨ Features

- 🎯 **AI-based Task Recommendation System**  
  Dynamically adjusts task difficulty based on user performance to keep players challenged and engaged.

- 📚 **Books & Task System**  
  Organize lessons into themed books. Supports rich HTML, SQL examples, and JSON-style tasks.

- 🎨 **Multiple Themes**  
  Books and tasks can be styled with different visual themes for varied learning experiences.

- 🧩 **SQL & JSON Task Support**  
  Create interactive SQL or JSON-based exercises with validation logic, results, and distractors.

- 🏆 **Points & Scoring System**  
  Earn points for correct answers and progress tracking.

- 📈 **Leaderboards**  
  Global or local leaderboards for a competitive edge and classroom motivation.

- ⚙️ **Admin Tools**  
  Includes a book/task editor (experimental), configuration controls, and a summary page (WIP).

---

## 🧰 Technologies

**Built with**

- JavaScript (Vanilla)
- HTML / CSS
- Python
- MongoDB

**Infrastructure**

- Docker (Node.js, Nginx)

**Supported Browsers**

- Chrome
- Firefox
- Safari
- Microsoft Edge (Chromium)

---

## ⚙️ Configuration

- **Books & Tasks**  
  Configurable via `.task` and `.book` files in `/frontend/tasks` and `/frontend/books`.

- **Language Support**  
  Add translations via:
  - `/i18n/<lang>.js`
  - `/books/<lang>/Book-<>.book`
  - `/tasks/<lang>/Task-<>.task`
  - Update the `language-selector` in `index.html`

- **Progression Rules**  
  Found in `/frontend/tasks/progression.js`.

- **General Settings**  
  Configurable in `/frontend/js/configuration.js`:
  - `API_URL`
  - `FALSE_ANSWER_UNTIL_MODEL_ANSWER`
  - `EDITOR_PASSWORD`

---

## 🚀 Deployment with Docker

### ⚡ Quick-Start

**1. Prerequisites**

- Virtualization must be enabled in BIOS.

**2. Install Docker**

- On Windows/macOS install [Docker Desktop](https://www.docker.com/products/docker-desktop)
  - Please refer to https://docs.docker.com/desktop/setup/install/windows-install/ for installation instructions
  - Make sure to enable and use WSL 2.0 for the virtualization engine
- On Linux CLI install `docker` and `docker-compose` through your package manager

**3. Download the Repository**

- Use the `main` branch for stable builds.

**4. Create a `.env` File**

```env
API_URL=http://localhost:3000
IO_URL=http://localhost:80
POSTMARK_API_KEY=blank
FROM_SENDER=stg@github.io
```

**5. Build and Run**

```bash
    docker-compose build
    docker-compose up
```

---

### 💻 Development Setup

#### 🧪 Quickstart with `dev-compose.yml`

This is the fastest way to start the development environment. It follows the same steps as the regular deployment, **but
you can skip step 4 (setting environment variables)**.

```bash
    docker-compose build
    docker-compose -f dev-compose.yml up
```

#### 💡 JetBrains WebStorm

Includes a preconfigured [Dev_Compose.xml](.idea/runConfigurations/Dev_Compose.xml) to start via UI.

#### 🐞 Debugging

- Use browser dev tools (`F12`) for live feedback
- Use container logs for backend issues

---

## 🖼️Frontend

**[Dockerfile](frontend/Dockerfile)**

### 📚 Books syntax

In the following chapter, the outline of a book is explained and according to syntax. In the end, a full example is
shown.

#### METADATA

Within the `METADATA` one can specify:

- `id` of the book which should follow the naming convention `book-[id]`
- `name` of the book
- `title` of the book -> shown on the cover
- `author` of the book
- `color` of the book a.e green, purple, red

```
METADATA {
     id: Book-A
     name: Example book
     title: Awesome Example Book
     author: Author of the Book
     color: purple
}
```

#### PAGE

Representation of a page within the book. Within one can use plain text or HTML syntax to describe the content of the
page. A page further supports the `EXAMPLE` tag, which can be used to display a theoretical example. Consider the
snippet below for the usage:

```
PAGE {
    Sample of a page. You can write several paragraphs on the page.
    EXAMPLE {
        TABLE {
            Examples
            id | name | field
            1 | Example | From the table
            2 | Here | Fits
            3 | Three | Rows
        }

        QUERY {
            SELECT name FROM Examples;
        }
    }
}
```

#### Example

```
METADATA {
     id: Example
     name: Example book
     title: Awesome Example Book
     author: Author of the Book
     color: purple
}

PAGE {
     Example of the first page. You can write several songs on the page.
     A newline does not end the paragraph. \ N Forces a newline.

     The double line break starts a new song.

     <ul><li> <b> Supports html tags </b> </li> </ul>
}

PAGE {
     EXAMPLE {
         TABLE {
             Examples
             id | name | field
             1 | Example | From the table
             2 | Here | Fits
             3 | Three | Rows
         }

         QUERY {
             SELECT name FROM Examples;
         }
     }
}
```

### 📝 Tasks syntax

In the following chapter, the outline of a task is explained and the according to syntax. In the end, a full example is
shown.

#### METADATA

Within the `METADATA` one can specify:

- `id` of the task which should follow the naming convention `task-001`
- `name` of the task
- `title` of the task
- `author` of the book
- `color` of the book a.e green, purple, red

```
METADATA {
     id: Book-A
     name: Example book
     title: Awesome Example Book
     author: Author of the Book
     color: purple
}
```

#### DESCRIPTION

The description is used to assign instruction to the task. The content should consist of plain text.

```
DESCRIPTION {
    Assignment and instructions for completing the task. Here you can connect the task to the magical world.
    \ n force line breaks.

    Assignment: Here are more detailed instructions
}
```

#### PARSONS (optional)

The `PARSONS` Section is optional and specifies whether a task needs to be solved by using
the  [Parsons Programming Puzzle](https://github.com/js-parsons/js-parsons) (if set). The outline needs to follow the
model solution. This means that a concatenation of all entries from index 0-n and filtering out the `#discractor` needs
to result in the model solution.

```
PARSONS {   
  SELECT name, year 
  FROM Ghosts   
  SELECT name and yearOfBirth #distractor   
  SELECT * #distractor  
  SELECT name #distractor   
}   
```

#### ANSWER (optional)

The `ANSWER` section can be set if the teacher wants to allow the display of a model answer after the task is completed
successfully by the student.

```
ANSWER {
    SELECT * FROM Test;
}
```

#### STRICT (optional)

The `STRICT` can be used to enable strict validation of the test result (order).

```
STRICT

TEST {
    ...    
}
```

#### TEST

The section `TEST` is used to validate the task. A teacher can specify multiple `TEST` if needed in order to validate
the answer. There are two possible approaches, on the one hand, by defining a DB scheme by using the `TABLE` section
recommended for SELECT operations and on the other hand by using `SQL` section mostly suited for queries containing
statements like CREATE and INSERT. Consider the pre-implementation tasks for further and more complex examples.

#### Predefined Table Example

```
TEST {
    TABLE {
        Ghosts
        id|name
        1|Arthur
        2|Desiree
        3|Siegfried
        4|Sieglinde
        5|Kaaleppi
    }

    TABLE {
        Places
        id|name
        1|school
        2|forest
        3|mill
    }

    TABLE {
        Hauntings
        ghost_id|place_id
        1|1
        2|2
        2|3
        3|2
        4|2
    }

    RESULT {
        Desiree
        Siegfried
        Sieglinde
    }
}

```

#### SQL Example

```
TEST {
    SQL {
        CREATE TABLE Parts (head TEXT, tail TEXT);
        INSERT INTO Parts (head, tail) VALUES ('🐟','🐍')    
    }

    RESULT {
        🐟|🐍
    }
}
```

#### Example

```
METADATA {
    id: task-001
    name: Example task
    color: purple
}

DESCRIPTION {
    Assignment and instructions for completing the task. Here you can connect the task to the magical world.
    \ n force line breaks.

    Assignment: Here are more detailed instructions
}

PARSONS {   
  SELECT name, year 
  FROM Ghosts   
  SELECT name and yearOfBirth #distractor   
  SELECT * #distractor  
  SELECT name #distractor   
}   


ANSWER {
    SELECT * FROM Test;
}

TEST {
    TABLE {
        Pets
        id | animal | feeling
        1 | 😻 | in love
        2 | 🦑 | satisfied
        3 | 🦎 | angry
    }

    TABLE {
        Pets_copy
        id | animal | feeling
        1 | 😻 | in love
        2 | 🦑 | satisfied
        3 | 🦎 | angry
    }

    SQL {
        CREATE TABLE Runes (id INTEGER PRIMARY KEY, rune TEXT, name TEXT);
        INSERT INTO Runes (name, rune) VALUES ('Fe', 'ᚠ'), ('Thurs', 'ᚦ'), ('Kaun', 'ᚲ'), ('Algiz', 'ᛉ'), ( 'Berkanan', 'ᛒ'), ('Yngvi', 'ᛝ');
    }

    STRICT
    RESULT {
        1 | 😻 | in love
        2 | 🦑 | satisfied
        3 | 🦎 | angry
    }
}
```

### 🔨 Experimental Editor

Located at `/html/editors.html`, this in-browser editor allows advanced users to edit `.task` and `.book` files.
Experimental features may crash and require JS troubleshooting.

---

## 🌐 Backend: REST API (Node.js + MongoDB)

**[Dockerfile](backend/api/Dockerfile)**

### 💾 Getting Started

```bash
npm i
npm run start        # production
npm run start:dev    # dev with nodemon
npm run test         # run jest tests
npm run test:watch   # jest with livereload
npm run test:coverage
```

### ⚡ API Overview

**Status Codes**

- `200 OK`
- `400 Bad Request`
- `401 Unauthorized`
- `500 Server Error`

#### /users Endpoints

- `POST /register`: `{username, password}`
- `POST /authenticate`: `{username, password}`
- `POST /recover`: `{username}`
- `POST /reset`: `{token, password}`
- `GET /self`
- `PATCH /self/answer_sql`: `{task, correct, query}`

### 📦 Dependencies

- `bcryptjs`, `body-parser`, `cors`, `dotenv`, `express`, `express-jwt`
- `joi`, `jsonwebtoken`, `mongodb`, `postmark`, `rootpath`, `winston`

---

## 🧠 Backend: Python Recommendation Model (FastAPI)

**[Dockerfile](backend/model/Dockerfile)**

### 🧰 Python Dependencies

```
MarkupSafe==2.1.3
flasgger==0.9.7.1
pymongo==4.7.2
gunicorn==22.0.0
scikit-learn==1.4.2 
fastapi==0.114.0
uvicorn==0.30.6
numpy==2.1.1
pandas==2.2.2
requests==2.26.0
```

### 🚀 Serving the Model

Start locally with:

```bash
    uvicorn app:app --host 0.0.0.0 --port 8000
```

Or using Gunicorn:

```bash
    gunicorn -w 4 -k uvicorn.workers.UvicornWorker app:app
```

---

## 🔐 Usage of Data

The collected data and their according usage are explained within [PRIVACY.md](PRIVACY.md).


---

## 🙏 Credits

At this point we want to say thanks to Aurora Lahtela from Helsinki who created the original codebase called
SQL-Training-Game. This work is a customization of Aurora Lahtela's work, adapted to the needs of the FHNW. One can diff
the
changes between the original code base and the one of FHNW-SQL-Training-Game through the created tag
called `AuroraLS3/SQL-Training-Game-e755cc5` representing the state of the commit `e755cc5`
.  [Compare the changes](https://github.com/FHNW-SQL-Training-Game/FHNW-SQL-Training-Game.github.io/compare/AuroraLS3/SQL-Training-Game-e755cc5...main)
.

- [AuroraLS3/SQL-Training-Game](https://github.com/AuroraLS3/SQL-Training-game)

Sound effects have been obtained from freesound.org under the Creative Commons License.

- book_page_turn: sound by SmartWentCody, original title "Book Page Turning.wav",
  license https://creativecommons.org/licenses/by/3.0/, *edited version*
- right_answer: sound by rhodesmas, original title "Coins Purchase 4.wav",
  license https://creativecommons.org/licenses/by/3.0/, *edited version*
- wrong_answer: sound by Sjonas88, original title "fail-sound.wav",
  license https://creativecommons.org/publicdomain/zero/1.0/, *edited version* 



