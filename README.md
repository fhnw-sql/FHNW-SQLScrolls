# SQLScrolls

[Trailer](https://tube.switch.ch/videos/xOZ13ry9OG) 

SQLScrolls is a game developed by FHNW Nordwestschweiz.
Currenty, the game consists of 162 SQL tasks (task 1-162) and 17 JSON tasks (task 200-217).

First version of the game was created by Kai Krause: [GitHub](https://https://github.com/elapustulka/FHNW-SQL-Training-Game.github.io
)
## Table of Contents

- [Installation](#installation)
  - [Windows Installation](#windows-installation)
  - [macOS Installation](#macos-installation)
- [Usage](#usage)
- [Useful Docker Commands](#useful-docker-commands)
- [Configuration](#configuration)
- [📚 Books syntax](#-books-syntax)
- [📝 Tasks syntax](#-tasks-syntax)
- [🔧Progression.js Syntax](#progressionjs-syntax)
- [How to Create Your Own Books and Tasks](#how-to-create-your-own-books-and-tasks)
- [🗣️ Acknowledgements](#-acknowledgements)
- [🙏 Credits](#-credits)


## Installation

### Windows Installation

[Tutorial Video](https://tube.switch.ch/videos/NNbxjMV49h) 
1. Download Docker Desktop from [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/) 
2. Make sure Docker Desktop opens without any errors. If you encounter any errors, please follow the instructions provided by Docker.
3. Download SQLScrolls from GitHub as a ZIP file. You can find the download link at: [<> Code -> Local -> Download ZIP](https://github.com/janwilhelmfhnw/SQLScrolls/archive/refs/heads/main.zip)
4. Unzip the downloaded file to a location where you want to store SQLScrolls.
5. Open the Command Prompt by typing "Command Prompt" into the Windows search bar.
6. Navigate to the SQLScrolls folder in the Command Prompt. Go to the "FHNW-SQL-Training-Game.github.io" folder within the extracted files. Copy the directory path, for example: `C:\Users\player\downloads\SQL-Scrolls-main\FHNW-SQL-Training-Game.github.io`. Change the Command Prompt's directory to the copied path using the following command: `cd your-copied-path`.
7. Run the following Docker command in the Command Prompt: `docker-compose up`.

### macOS Installation
[Table of Contents](#table-of-contents)
1. Download Docker Desktop for macOS from [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/) You can check which chip/processor your device has by pressing on the Apple logo in the taskbar and opening the "About this Mac" section. Docker Desktop for Mac requires a 2010 computer model or later, OS 10.13 or later, and at least 4GB of RAM.
2. Make sure Docker Desktop opens without any errors. If you encounter any errors, please follow the instructions provided by Docker.
3. Download SQLScrolls from GitHub as a ZIP file. You can find the download link at: [<> Code -> Local -> Download ZIP](https://github.com/janwilhelmfhnw/SQLScrolls/archive/refs/heads/main.zip)
4. Unzip the downloaded file to a location where you want to store SQLScrolls.
5. Open Terminal. You can find it in the Applications/Utilities folder or by using Spotlight search.
6. Navigate to the SQLScrolls folder in Terminal. Go to the "FHNW-SQL-Training-Game.github.io" folder within the extracted files. Copy the directory path, for example: `/Users/player/downloads/SQL-Scrolls-main/FHNW-SQL-Training-Game.github.io`. Change the Terminal's directory to the copied path using the following command: `cd your-copied-path`.
7. Run the following Docker command in Terminal: `docker-compose up`.

## Usage
[Table of Contents](#table-of-contents)

1. Once the Docker containers are up and running, open your web browser.
2. Access SQLScrolls by navigating to [http://localhost:80](http://localhost:80) in your web browser.
3. Create an account and test your SQL Skills!

## Useful Docker Commands
[Table of Contents](#table-of-contents)

Here are some useful Docker commands you might find helpful:

- `docker-compose up` - Start the Docker containers for SQLScrolls.
- `docker-compose down` - Stop and remove the Docker containers for SQLScrolls.
- `docker ps` - List all running containers.
- `docker images` - List all Docker images on your system.
- `docker logs <container_id>` - View the logs of a specific container.
- `docker exec -it <container_id> bash` - Start an interactive shell inside a running container.
- `docker rm <container_id>` - Remove a specific container.
- `docker rmi <image_id>` - Remove a specific Docker image.
- `docker-compose build` - Build or rebuild the Docker containers for SQLScrolls.

Please refer to the Docker documentation for more information on Docker commands and their usage.

## ⚙️ Configuration

- Tasks and books can be configured via `.task` and `.book` files located in `/tasks` or `/books`. More information can be found under 
- For translating into more languages, add a `/i18n/<lang>.js`, `/books/<lang>/Book-<>.book` files
  and `/tasks/<lang>/Task-<>.task` files, as well as an option to `language-selector` element in `index.html`
- Progression can be configured in `/tasks/progression.js`
- General configurations can be found in `/js/configuration.js` like:
    - `API_URL`
    - `FALSE_ANSWER_UNTIL_MODEL_ANSWER`
    - `EDITOR_PASSWORD`

## 📚 Books syntax
[Table of Contents](#table-of-contents)

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

## 🔧progression.js Syntax

The ´progression.js´ file is used to structrure existing book and task files. The syntax is the following:

```
    {
        id: "your-book-letter",
        tasks: ["your-task-number", "your-task-number", "your-task-number"],
        requires: ["A"],

    }
```

Example:

```
    {
        id: "X",
        tasks: ["300", "301", "302"],
        requires: ["A"],

    }
```

## How to create your own Books and Tasks 

[Tutorial Video](https://tube.switch.ch/videos/TKWT8HrGkN) 
Adding your own tasks and books to SQL Scrolls is easy and can be done with your preferred IDE or even directly through Github. Before diving into the process, let's take a quick overview of the important files involved in this process and where you can find them

### Structure
´FHNW-SQL-Training-Game.github.io/books/en´
This is where you can add a new book.

´FHNW-SQL-Training-Game.github.io/tasks/en´
This is where all the tasks are stored.

´FHNW-SQL-Training-Game.github.io/tasks/progression.js´
This is used to tell the game which book includes which tasks through the metadata-id.

### Adding a book
Adding a book can be done by copying and pasting an existing book and renaming the file or creating a new text file with the followng syntax Book-´(your-letter).book´. For example ´Book-X.book´ . The book has to follow the following syntax [📚 Books syntax](#-books-syntax)

To have the software recognize the file, progression.js has to be updated with the correct book id.

### Adding a task
Adding a task can be done by copying and pasting an existing book and renaming the file or creating a new text file with the followng syntax: Task-´(your-number).task´. For example ´Task-300.task´ . The task has to follow the following syntax [📝 Tasks syntax](#-tasks-syntax)

To have the software recognize the file, progression.js has to be updated with the correct task id.

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
SQL-Training-Game. This work is a customisation Risto Lahtela work adapoted to the needs of the FHNW. 

Sound effects have been obtained from freesound.org under the Creative Commons License. 

- book_page_turn: sound by SmartWentCody, original title "Book Page Turning.wav", license https://creativecommons.org/licenses/by/3.0/, *edited version*
- right_answer: sound by rhodesmas, original title "Coins Purchase 4.wav", license https://creativecommons.org/licenses/by/3.0/, *edited version* 
- wrong_answer: sound by Sjonas88, original title "fail-sound.wav", license https://creativecommons.org/publicdomain/zero/1.0/, *edited version* 
