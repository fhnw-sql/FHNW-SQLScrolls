function isArrayEqual(a, b, strict) {
    if (a.length !== b.length) return false;
    const c = [...a],
        d = [...b];
    if (!strict) {
        c.sort();
        d.sort();
    }
    for (let i = 0; i < a.length; i++) {
        if (c[i] instanceof Array) {
            if (!isArrayEqual(c[i], d[i], strict)) return false;
            // Result set might parse integers, but text parsing uses Strings, intentional type coercion.
        } else if (c[i] != d[i]) {
            console.log('not equal: ', c[i], d[i]);
            return false;
        }
    }
    return true;
}

/**
 * SQL Execution utility.
 *
 * @param context SQL to execute before the query (eg. create tables).
 * @param query SQL to execute in the context.
 * @returns Promise, sql wasm result set.
 * @throws Error if SQL query fails
 */
async function runSQL(context, query, taskType = "SQL", statements = "") {

    const config = { locateFile: (filename) => `libs/sql.js/${filename}` };
    const SQL = await initSqlJs(config);
    const db = new SQL.Database();

    try {
        if (taskType == "DCL") {
            // if create table, do not create the example table
            if (query.toUpperCase().split(' ').filter(e => e.length > 0).join(' ').startsWith('CREATE TABLE')) {
                db.run(query);
                return db.exec(statements)
            } else {
                // other DCL that run after table exists
                db.run(context);
                db.run(query);
                return db.exec(statements)
            }
        } else {
            db.run(context);
            db.run(statements);
            // console.log(query)
            return db.exec(query)
        }
    } catch (error) {
        console.error("ERROR: query=", query, " context=", context)
        console.error(error);
        throw error
    } finally {
        db.close();
    }
}

/**
 * XMLHttpRequest utility for reading text files.
 *
 * @param fromPath URI path to read a file from.
 * @returns Promise, array of lines. Can throw error on non-200 response code.
 */
function readLines(fromPath) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    resolve(xhr.responseText.split("\n"));
                } else {
                    reject(`Bad response code '${xhr.status}' for file '${fromPath}'`);
                }
            }
        };
        xhr.open("GET", fromPath, true);
        xhr.send();
    });
}

/**
 * Store text file as a downloaded file.
 *
 * https://stackoverflow.com/a/33542499
 *
 * @param filename Name of the file
 * @param data Text in the file.
 */
function saveFile(filename, data) {
    const blob = new Blob([data], {type: "text/csv"});
    if (window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveBlob(blob, filename);
    } else {
        const elem = window.document.createElement("a");
        elem.href = window.URL.createObjectURL(blob);
        elem.download = filename;
        document.body.appendChild(elem);
        elem.click();
        document.body.removeChild(elem);
    }
}

/**
 * Upload text file.
 *
 * https://stackoverflow.com/a/54214913
 *
 * @returns Promise text included in the file.
 */
function uploadFile(accepts) {
    const uploader = document.createElement("input");
    uploader.type = "file";
    if (accepts) uploader.accept = accepts;
    uploader.style.display = "none";
    return new Promise((resolve) => {
        uploader.addEventListener("change", () => {
            const files = uploader.files;

            if (files.length) {
                const reader = new FileReader();
                reader.addEventListener("load", () => {
                    uploader.parentNode.removeChild(uploader);
                    resolve(reader.result);
                });
                reader.readAsText(files[0]);
            }
        });

        document.body.appendChild(uploader);
        uploader.click();
    });
}

/**
 Utility that is used for synchronizing actions done in other promises.

 @param predicateFunction Function that returns true when the execution should resume
 @return Promise that is resolved when predicateFunction returns true
 */
function awaitUntil(predicateFunction) {
    return new Promise((resolve) => {
        const handlerFunction = () => {
            if (predicateFunction.apply()) {
                resolve();
            } else {
                setTimeout(handlerFunction, 10);
            }
        };
        handlerFunction();
    });
}

/**
 * Returns a specific cookie from the document (null otherwise).
 *
 *
 * @param name Name of the cookie
 */
function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}


function getAuthCookie() {
    // check if there is a auth cookie
    const authCookie = readCookie(Config.AUTH_COOKIE)

    if (authCookie) {
        let parsedCookie = {}
        authCookie.split("|").map(pair => pair.split(":")).forEach(item => {
            parsedCookie[item[0]] = item[1]
        })
        // console.log(parsedCookie)

        // if all empty return null
        if ((parsedCookie.mail.length == 0) && (parsedCookie.user.length == 0)) {
            return null
        }

        return (parsedCookie)
    } else {
        return null
    }
}
