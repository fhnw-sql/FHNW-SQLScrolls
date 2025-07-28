# 📚 Books & Tasks

[**Documentation Hub**](../index.md) | [**Example Book**](../../frontend/books/example.book) | | [**Example Task**](../../frontend/tasks/example.task) 

## 🔨 Experimental Editor

Located at `/frontend/admin/editors.html`, this in-browser editor allows advanced users to edit `.task` and `.book`
files.
Experimental features may crash and require JS troubleshooting.

---

## 📝 Books syntax

In the following chapter, the outline of a book is explained and according to syntax. In the end, a full example is
shown.

### METADATA

Within the `METADATA` one can specify:

- `id` of the book which should follow the naming convention `book-[id]`
- `name` of the book
- `title` of the book -> shown on the cover
- `author` of the book
- `color` of the book a.e green, purple, red (can also be a name such as color: music2)

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

---

## 📝 Tasks syntax

In the following chapter, the outline of a task is explained and the according to syntax. In the end, a full example is
shown.

## METADATA

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

### Predefined Table Example

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

### SQL Example

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
