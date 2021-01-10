for (let entry of Object.entries({
    "error": "Virhe",
    "username": "mooc.fi-tunnus",
    "password": "salasana",
    "welcome": "Oletko valmis lähtemään matkalle SQL-kielen maagiseen maailmaan?",
    "login": "Kirjaudu sisään",
    "login-error-no-user": "Kirjoita käyttäjätunnus",
    "login-error-no-password": "Kirjoita salasana",
    "login-error-failed-unknown": "Kirjautuminen epäonnistui.",
    "logout": "Kirjaudu ulos",
    "incorrect-password": "Väärä käyttäjänimi tai salasana",
    "forgot-password": "Unohtuiko salasana?",
    "register": "Rekisteröidy",
    "empty-table": "Taulu on tyhjä",
    "loading": "Ladataan...",
    "ok": "Selvä!",
    "close": "Sulje",
    "skip": "Ohita",
    "back": "Takaisin",
    "task": "Tehtävä {}",
    "example": "Esimerkki",
    "show-model-answer": "Näytä mallivastaus",
    "previous-answers": "Lähetyshistoria",
    "tables": "Taulut",
    "table-result": "Tulos",
    "wanted-result": "Haluttu tulos",
    "query-results": "Kyselyn tulos",
    "books-text": "Kirjat",
    "tasks-text": "Kääröt",
    "map-text": "Kartta",
    "found-books-text": "Kirjat",
    "level-unlocked": 'Suoritit kaikki tehtäväsarjan tehtävät!',
    "unlocked-more-tasks": "Avasit lisää tehtäviä",
    "skill-point-count-zero": 'Suorita tehtäviä avataksesi uusia kirjoja',
    "read": "Lue",
    "read-book": "Lue kirja",
    "previous-page": "Edellinen sivu",
    "next-page": "Seuraava sivu",
    "unlock": "Avaa",
    "unlocked": "Avattu",
    "rewatch-animation": "Katso animaatio uudelleen",
    "book-discover": "Avasit kirjan!",
    "item-00-name": 'Tervetulokirje',
    "item-00-hint":
        "Tervetuloa oppimaan SQL-kielen saloja!\n" +
        "\n" +
        "Olet saanut jo ensimmäisen käärön, jossa on kirja ja tehtäviä.\n" +
        "Kirjasta voit oppia kyselyjen teoriaa, ja kun saat ratkottua kaikki käärön tehtävät, niin pääset seuraavalle tasolle.\n" +
        "\n" +
        "Opintietäsi valaisee Sininen Liekki, johon tulet tutustumaan paremmin myöhemmin.\n" +
        "\n" +
        "Terveisin\n" +
        "Rehtori Codd",
    "item-999-name": "???",
    "write-query-first": "Kirjoita kysely",
    "multi-query-not-allowed": "Tulos täytyy saada yhdellä kyselyllä, älä tee useita kyselyitä.",
    "sub-query-not-allowed": "Tulos täytyy saada ilman alikyselyitä, älä käytä alikyselyitä.",
    "query-no-rows": "Kysely antoi nolla riviä",
    "query-placeholder": "Kirjoita kysely...",
    "query-test": "Lähetä kysely",
    "test": "Testi {}",
    "correct": "Oikein",
    "incorrect": "Väärin",
    "task-complete": "Tehtävä suoritettu",
    "task-incomplete": "Ei suoritettu",
    "animation-speech-1": "hihihi.. hihi hi.. Ehkä olisi vihdoin aika esittäytyä. Olen Kyselyx, ja" +
        " ansiostasi sain nyt käsiini kaiken SQL tietämyksen..",
    "animation-speech-2": "\n" +
        "INSERT INTO Flame (power) VALUES (SELECT power FROM Stars);",
    "animation-speech-3": "\n\n" +
        "Muahahaha Voimasi ovat minun!\n" +
        "UPDATE Flame SET color='evil' WHERE name='Kyselyx';",
    "animation-speech-4": "\n\n" +
        "MAAILMASI ON MENNYTTÄ!\n" +
        "SELECT * FROM World JOIN Flame on World.location != Flame.location;",
    "animation-speech-5": "\n\n" +
        "AHAHAHAhaahahaHAHAHAahAHAHAAHAaaa",
    "animation-explanation-6": "Ilkeä virvatuli!\n" +
        "Olet maailman ainoa toivo, sinun on estettävä Kyselyxiä tuhoamasta kaikkea SQL magialla!",
    "to-battle": "Taisteluun!",
    "end-animation-speech-1": "Luulet varmaan voittaneesi, kun vangitsit kaikki vapauttamani liekit!",
    "end-animation-speech-2": "\n\n" +
        "MUTTA MINÄ TEEN LISÄÄ! Hahahahaha!",
    "end-animation-speech-3": "\n\n" +
        "<i>Kyselyx valmistautuu taikomaan..</i>",
    "end-animation-speech-4": "\n\n" +
        "EI! Mitä te luulette tekevänne!",
    "end-animation-speech-5": "\n\n" +
        "<i>Kyselyx, et ole tarpeeksi vahva. Hän on osoittanut meille mahtinsa, jos luulet meidän tekevän likaiset hommasi, olet väärässä.</i>",
    "end-animation-speech-6": "\n\n" +
        "EIIIIIIIIIIIIIIIIiiiiiiiiiiiiiiiiiiiiiiii...........",
    "continue": "Jatka..",
    "congratulations": "Onnittelut!",
    "ending-text-1": 'Olet selvittänyt SQL taikojen salat, voittanut Kyselyxin ja pelastanut maailman!',
    "ending-text-2": 'Olet suorittanut kaikki tehtävät, sekä kurssin! Onnittelut.',
    "return-to-game": "Takaisin peliin",
    "profile": "Profiili",
    "logged-in-as": "Kirjautununeena sisään: {}",
    "download-your-data": "Lataa lähettämäsi vastaukset",
    "time": "aika",
    "completed-tasks": "suoritetut tehtävät",
    /* Screen reader only */
    "task-groups": "Pelin päänäkymä, tehtäväsarjat ja esineet",
    "tasks": "Avoimeen tehtäväsarjaan liittyvät esineet",
    "task-description": "Tehtävänanto",
    "task-area": "Tehtävä",
    "task-tests": "Tehtävän testit",
    "map-view": "Kartta, jossa on tehtäviä",
    "counters": "Tehtävien suoritusmäärä",
    "stars": "Tähtiä kerätty",
    "flames": "Liekkejä napattu",
    "right-sidebar": "Oikea sivupalkki - lisänavigaatio",
    "transformation-animation": "Animaatio, avustava liekki muuttuu pahaksi ja vapauttaa ilkeitä liekkejä maailmaan. Ohitettavissa napilla. Kesto: noin 45 sekuntia",
    "end-animation": "Animaatio, nappaamasi liekit kääntyvät isäntäänsä vastaan ja tuhoavat pahan liekin. Ohitettavissa napilla. Kesto: noin 45 sekuntia",
    "describe-letter": "Tervetulokirje",
    "describe-questionmark": "Mysteerinen symboli",
    "group-A-name": "Valintojen-kääröt",
    "group-B-name": "Yhteenvedon-kääröt",
    "group-C-name": "Ryhmittelyn-kääröt",
    "group-D-name": "Liittämisen-kääröt",
    "group-E-name": "?-kääröt", /* TODO Nimeä kääröt sokeita varten */
    "group-F-name": "Vasemman liitoksen-kääröt",
    "group-G-name": "Tyyppien-kääröt",
    "group-H-name": "Rajojen-kääröt",
    "group-I-name": "Alikyselyiden-kääröt",
    "group-J-name": "Ikkunoiden-kääröt",
    "query-input-box": "SQL-kyselyn tekstialue",
    "model-answer": "Mallivastaus",
    "display-letter": "Näytä kirje Modal",
    "display-books": "Kirjat Modal",
    "display-profile": "Profiili Modal",
    "close-modal": "Sulje modal",
    "star-count": "Kerättyjen tähtien määrä"
})) {
    i18n[entry[0]] = entry[1];
}

replaceI18nContent();
