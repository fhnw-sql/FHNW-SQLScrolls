function isArrayEqual(a, b, strict) {
    if (a.length !== b.length) return false;
    const c = [...a], d = [...b];
    if (!strict) {
        c.sort();
        d.sort();
    }
    for (let i = 0; i < a.length; i++) {
        if (c[i] instanceof Array) {
            if (!isArrayEqual(c[i], d[i], strict)) return false;
            // Result set might parse integers, but text parsing uses Strings, intentional type coercion.
        } else if (c[i] != d[i]) {
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
async function runSQL(context, query) {
    const config = {locateFile: filename => `dist/${filename}`};
    const SQL = await initSqlJs(config);
    const db = new SQL.Database();
    try {
        db.run(context);
        return db.exec(query);
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
        }
        xhr.open("GET", fromPath, true);
        xhr.send();
    })
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
    const blob = new Blob([data], {type: 'text/csv'});
    if (window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveBlob(blob, filename);
    } else {
        const elem = window.document.createElement('a');
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
    const uploader = document.createElement('input');
    uploader.type = 'file';
    if (accepts) uploader.accept = accepts;
    uploader.style.display = 'none';
    return new Promise((resolve) => {
        uploader.addEventListener('change', () => {
            const files = uploader.files;

            if (files.length) {
                const reader = new FileReader();
                reader.addEventListener('load', () => {
                    uploader.parentNode.removeChild(uploader);
                    resolve(reader.result);
                });
                reader.readAsText(files[0]);
            }
        })

        document.body.appendChild(uploader);
        uploader.click();
    })
}

/**
 Utility that is used for synchronizing actions done in other promises.

 @param predicateFunction Function that returns true when the execution should resume
 @return Promise that is resolved when predicateFunction returns true
 */
function awaitUntil(predicateFunction) {
    return new Promise((resolve => {
        const handlerFunction = () => {
            if (predicateFunction.apply()) {
                resolve();
            } else {
                setTimeout(handlerFunction, 10)
            }
        };
        handlerFunction();
    }))
}