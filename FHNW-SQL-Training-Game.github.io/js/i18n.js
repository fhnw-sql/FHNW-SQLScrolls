const inStore = sessionStorage.getItem("currentLang");
let currentLang = inStore ? inStore : "en";
let i18n = {
  get: function (key) {
    if (!key) return key;
    // Some calls to this function have i18n- prefix.
    const cleanKey = key.startsWith("i18n-") ? key.substr(5) : key;
    const value = this[cleanKey];
    if (value instanceof Function) return value();
    return value ? value.split("\n").join("<br>") : key;
  },
  getWith: function (key, replacements) {
    let returnValue = this.get(key);
    for (let replacement of replacements) {
      if (replacement || replacement === 0) {
        returnValue = returnValue.replace(
          "{}",
          ("" + replacement).includes("i18n-") ? this.get(replacement) : replacement
        );
      }
    }
    return returnValue;
  },
};

function replaceI18nContent() {
  function replaceInnerHtml(identifier, replacement) {
    for (let element of document.querySelectorAll(`.i18n-${identifier}`)) {
      if (element instanceof HTMLInputElement) {
        element.placeholder = replacement.split("\n").join("<br>");
      } else {
        element.innerHTML = replacement.split("\n").join("<br>");
      }
    }
  }

  function replaceAriaLabel(identifier, replacement) {
    for (let element of document.querySelectorAll(`.i18n-aria-${identifier}`)) {
      element.setAttribute("aria-label", replacement.split("\n").join(" "));
    }
  }

  for (let entry of Object.entries(i18n)) {
    const identifier = entry[0];
    const replacement = entry[1];
    if (!(replacement instanceof Function)) {
      replaceInnerHtml(identifier, replacement);
      replaceAriaLabel(identifier, replacement);
    }
  }
}

async function loadLanguage(langCode) {
  const lines = await readLines(`i18n/${langCode}.js`);
  try {
    eval(lines.join(""));
    currentLang = langCode;
    sessionStorage.setItem("currentLang", langCode);
  } catch (e) {
    console.error(`Failed to parse lang ${langCode}`, e, lines.join(""));
    throw new Error(`Failed to parse lang ${langCode}: ${e}`);
  }
}

const selector = document.getElementById("language-selector");

for (let option of selector.options) {
  if (currentLang === option.value.toLowerCase()) {
    option.selected = "selected";
  } else {
    option.selected = "";
  }
}

if (selector)
  selector.oninput = async (event) => {
    const langCode = event.target.value.toLowerCase();
    await loadLanguage(langCode);
  };
