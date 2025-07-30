Config = {
    API_URL: "http://localhost:3001", // API HOST
    FALSE_ANSWER_UNTIL_MODEL_ANSWER: 4, // Count of answers until the model answer is provided
    FALSE_ANSWER_UNTIL_BOOK_HINT: 3, // Count of answers after which a hint references to the theory in the books
    EDITOR_PASSWORD: "fhnw", // Password for the editors.html
    AUTH_COOKIE: "sqlscrolls-auth",
    SWITCHAAI_LOGOUT_URL: "https://www.cs.technik.fhnw.ch/Shibboleth.sso/Logout", //usr to logout if using institutional login

    LEVEL_ABOVE_WHICH_SHOW_SKELETON: 1, // Level above which the skeleton is shown
    FALSE_ANSWER_UNTIL_AI_HINT: 3, // Count of answers after which a hint references to the AI
    AIPATH: "gemini2", // can be "gemini2", "gemini", "ai"
    AI: "gemini" //can be gemini or openai
};