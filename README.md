# SQLScrolls

SQLScrolls is a game developed by FHNW Nordwestschweiz.

## Installation

### Windows Installation

1. Download Docker Desktop from [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)
2. Make sure Docker Desktop opens without any errors. If you encounter any errors, please follow the instructions provided by Docker.
3. Download SQLScrolls from GitHub as a ZIP file. You can find the download link at: [<> Code -> Local -> Download ZIP](https://github.com/janwilhelmfhnw/SQLScrolls/archive/refs/heads/main.zip)
4. Unzip the downloaded file to a location where you want to store SQLScrolls.
5. Open the Command Prompt by typing "Command Prompt" into the Windows search bar.
6. Navigate to the SQLScrolls folder in the Command Prompt. Go to the "FHNW-SQL-Training-Game.github.io" folder within the extracted files. Copy the directory path, for example: `C:\Users\player\downloads\SQL-Scrolls-main\FHNW-SQL-Training-Game.github.io`. Change the Command Prompt's directory to the copied path using the following command: `cd your-copied-path`.
7. Run the following Docker command in the Command Prompt: `docker-compose up`.

### macOS Installation

1. Download Docker Desktop for macOS from [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/) You can check which chip/processor your device has by pressing on the Apple logo in the taskbar and opening the "About this Mac" section.
2. Make sure Docker Desktop opens without any errors. If you encounter any errors, please follow the instructions provided by Docker.
3. Download SQLScrolls from GitHub as a ZIP file. You can find the download link at: [<> Code -> Local -> Download ZIP](https://github.com/janwilhelmfhnw/SQLScrolls/archive/refs/heads/main.zip)
4. Unzip the downloaded file to a location where you want to store SQLScrolls.
5. Open Terminal. You can find it in the Applications/Utilities folder or by using Spotlight search.
6. Navigate to the SQLScrolls folder in Terminal. Go to the "FHNW-SQL-Training-Game.github.io" folder within the extracted files. Copy the directory path, for example: `/Users/player/downloads/SQL-Scrolls-main/FHNW-SQL-Training-Game.github.io`. Change the Terminal's directory to the copied path using the following command: `cd your-copied-path`.
7. Run the following Docker command in Terminal: `docker-compose up`.

## Usage

1. Once the Docker containers are up and running, open your web browser.
2. Access SQLScrolls by navigating to [http://localhost:80](http://localhost:80) in your web browser.
3. Create an account and test your SQL Skills!

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
