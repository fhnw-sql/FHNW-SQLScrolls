# 🕹️ FHNW SQL Training Game

This repository is the frontend for the FHNW-SQL-Training-Game which is used to determine the effectiveness and
acceptance of a learning game as an alternative learning method within the Bachelor of Business Information Technology
at the FHNW, concerning practising the structured query language (SQL) which is taught as part of the Database
Technology course.

**Technologies:**

- Javascript
- HTML
- CSS

**Supported browsers:**
The game is designed to support the latest web browsers. It supports the current versions of:

- Chrome
- Firefox
- Safari
- Microsoft Edge

## ⚙️ Configuration

- Tasks and books can be configured via `.task` and `.book` files located in `/tasks` or `/books`. More information to
  the syntax can be found below.
- For translating into more languages, add a `/i18n/<lang>.js`, `/books/<lang>/Book-<>.book` files
  and `/tasks/<lang>/Task-<>.task` files, as well as an option to `language-selector` element in `index.html`
- Progression can be configured in `/tasks/progression.js`
- General configurations can be found in `/js/configuration.js` like:
    - `API_URL`
    - `FALSE_ANSWER_UNTIL_MODEL_ANSWER`
    - `EDITOR_PASSWORD`

## 🔮 Deployment

To deploy the Frontend one can consider one of the mentioned ways below: Docker, BareboneNodeJS, We recommend to use Docker Compose. The illustration below shows a quick overview of the recommended
solution.

![Architecture-Overview](stg-architecture.png)

### ⚡ Recommended Solution Deployment (Docker Compose) 

The following steps assume that a basic understanding of docker already exists. If this is not the case, the following
book is
recommended [Docker: Up & Running: Shipping Reliable Containers in Production](https://www.oreilly.com/library/view/docker-up/9781492036722/)
.

To spin-up the whole solution on docker. The repository provides a [docker-compose yml file](https://gitlab.fhnw.ch/elzbieta.pustulka/FHNW-SQL-Training-Game.github.io/-/blob/main/docker-compose.yml). It includes the setup for the
backend API, frontend interface and the databaseMongoDB container. 


- Set up the environment user variables (may require restarting your machine depending on your OS):
```
 API_URL=http://localhost:3000 
 IO_URL=http://localhost:80 
 POSTMARK_API_KEY=blank
 FROM_SENDER=stg@github.io

 ```

- Install [docker desktop](https://www.docker.com/products/docker-desktop/) (includes docker compose, recommended if you are on windows) or docker and docker compose as commandline (linux)

- Clone repos both gitlab repos in the same root directory
https://gitlab.fhnw.ch/elzbieta.pustulka/FHNW-SQL-Training-Game.github.io
https://gitlab.fhnw.ch/elzbieta.pustulka/FHNW-SQL-Training-Game-API 

- Go to a terminal, change directory to the root of the frontend repository (FHNW-Training-Game.github.io) and type the command (option -d at the end if you want it to run in the background): 
```
docker-compose up
```

- Open a browser and go to http://localhost:80 (recommended to open the developer tools to report the error in case there are any issues)

For further configuration details consider the [docker-compose file](https://gitlab.fhnw.ch/elzbieta.pustulka/FHNW-SQL-Training-Game.github.io/-/blob/main/docker-compose.yml)directly.

### 🖼️ Frontend Deployment (advanced)

#### 🐋 Docker - Frontend

The following steps assume that a basic understanding of docker already exists. If this is not the case, the following
book is
recommended [Docker: Up & Running: Shipping Reliable Containers in Production](https://www.oreilly.com/library/view/docker-up/9781492036722/)
.

To spin-up the container run the following commands, don't forget to replace the environments variables with your actual
configuration:

1. Run `docker build -t FHNW-SQL-Training-Game:1.0 --build-arg API_URL='{API_URL}' .`
2. Run `docker run -dp 80:80 FHNW-SQL-Training-Game:1.0`

The API is now exposed on the PORT 80 on the docker host.

#### 🐱 GitHub Pages

To deploy the project on github pages. Simply fork the repository and name it `{your-gh-username}.github.io` and do the
according configruation within `configuration.js`. More information concerning GH Pages can be
found [GitHub Pages](https://pages.github.com/)

## 📚 Books syntax

In the following chapter, the outline of a book is explained and according to syntax. In the end, a full example is
shown.

### METADATA

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

### PAGE

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

### Example

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

## 📝 Tasks syntax

In the following chapter, the outline of a task is explained and the according to syntax. In the end, a full example is
shown.

### METADATA

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

### DESCRIPTION

The description is used to assign instruction to the task. The content should consist of plain text.

```
DESCRIPTION {
    Assignment and instructions for completing the task. Here you can connect the task to the magical world.
    \ n force line breaks.

    Assignment: Here are more detailed instructions
}
```

### PARSONS (optional)

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

### ANSWER (optional)

The `ANSWER` section can be set if the teacher wants to allow the display of a model answer after the task is completed
successfully by the student.

```
ANSWER {
    SELECT * FROM Test;
}
```

### STRICT (optional)

The `STRICT` can be used to enable strict validation of the test result (order).

```
STRICT

TEST {
    ...    
}
```

### TEST

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

### Example

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

## 🔨 Editor (Experimental)

As mentioned within the introduction tasks and books can be edited over a handy realtime online editor
located `/editors.html`. For the purpose of the study the editor remains as experimental and needs further work for the
use of an ordinary user. However an advanced users that knows what todo if a `js` expection is thrown can make use of
this gem. Recommended browser is chrome. To edit a book or a task over the editor one needs to select the task/book from
the dropdown or load an existing task from the local environment over the upload button. As the editing is finished the
task/book needs to be saved over the save button and copied over manually into the according directory.

## 🔐 Usage of Data

The collected data and their according usage are explained within [privacy.md](privacy.md).

## 🗣️ Acknowledgements

- [sql.js](https://github.com/sql-js/sql.js) SQLite compiled to wasm
- [canvas confetti](https://github.com/catdad/canvas-confetti) JS Confetti cannon
- [Bootstrap 4](https://getbootstrap.com/) HTML, CSS & JS toolkit
- [Font Awesome 5](https://fontawesome.com/) SVG icons
- [RealFaviconGenerator](https://realfavicongenerator.net/) Favicon from image generator
- [Dygraphs](http://dygraphs.com/) Line graphing library
- Public domain or CC0 asset creators
- [pllk/sqltrainer](https://github.com/pllk/sqltrainer)
- [js-parsons](https://github.com/js-parsons/js-parsons)

## 🙏 Credits

At this point we want to say thanksa to Risto Lahtela from Helsinki who created the original codebase called
SQL-Training-Game. This work is a customisation Risto Lahtela work adapoted to the needs of the FHNW. One can diff the
changes between the original code base and the one of FHNW-SQL-Training-Game through the created tag
called `Rsl1122/SQL-Training-Game-e755cc5` representing the state of the commit `e755cc5`
.  [Compare the changes](https://github.com/FHNW-SQL-Training-Game/FHNW-SQL-Training-Game.github.io/compare/Rsl1122/SQL-Training-Game-e755cc5...main)
.

- [Rsl1122/SQL-Training-Game](https://github.com/Rsl1122/SQL-Training-game)


Sound effects have been obtained from freesound.org under the Creative Commons License. 

- book_page_turn: sound by SmartWentCody, original title "Book Page Turning.wav", license https://creativecommons.org/licenses/by/3.0/, *edited version*
- right_answer: sound by rhodesmas, original title "Coins Purchase 4.wav", license https://creativecommons.org/licenses/by/3.0/, *edited version* 
- wrong_answer: sound by Sjonas88, original title "fail-sound.wav", license https://creativecommons.org/publicdomain/zero/1.0/, *edited version* 
