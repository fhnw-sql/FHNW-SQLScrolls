LoginStatus = {
    LOGGED_OUT: 0,
    LOGGED_IN: 1,
    ERRORED: 2,
};

const API = {
    ADDRESS: Config.API_URL,
    ADDRESS_PUBLIC: Config.API_URL_PUBLIC || Config.API_URL,
    loginStatus: LoginStatus.LOGGED_OUT,
    token: undefined,
    switchaai: false,
    cachedAnswerData: {
        loading: false,
        loaded: false,
        data: undefined,
    },
    self() {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (this.readyState === 4) {
                    if (this.status === 200) {
                        var jsonObj = JSON.parse(this.response);
                        resolve(jsonObj);
                    } else {
                        reject(`Bad response code '${xhr.status}' for API query`);
                    }
                }
            };

            xhr.open("GET", `${this.getAPIAddress()}/users/self`, true);
            xhr.setRequestHeader("Authorization", "Bearer " + this.token);
            xhr.send();
        });
    },
    all() {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (this.readyState === 4) {
                    if (this.status === 200) {
                        var jsonObj = JSON.parse(this.response);
                        resolve(jsonObj);
                    } else {
                        reject(`Bad response code '${xhr.status}' for API query`);
                    }
                }
            };

            xhr.open("GET", `${this.getAPIAddress()}/users/all`, true);
            xhr.setRequestHeader("Authorization", "Bearer " + this.token);
            xhr.send();
        });
    },
    allClassFiltered() {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (this.readyState === 4) {
                    if (this.status === 200) {
                        var jsonObj = JSON.parse(this.response);
                        resolve(jsonObj);
                    } else {
                        reject(`Bad response code '${xhr.status}' for API query`);
                    }
                }
            };

            xhr.open("GET", `${this.getAPIAddress()}/users/classFiltered`, true);  // Updated endpoint
            xhr.setRequestHeader("Authorization", "Bearer " + this.token);
            xhr.send();
        });
    },
    loginExisting() {
        const sessionToken = sessionStorage.getItem("fhnw-token");
        if (sessionToken) {
            API.loginStatus = LoginStatus.LOGGED_IN;
            API.token = sessionToken;
        }
    },
    isSWITCHaaiLogin() {
        this.switchaai = (sessionStorage.getItem("switchaai") === 'true');
        return this.switchaai
    },
    getAPIAddress() {
        // select proper API address depending on login type
        if (this.isSWITCHaaiLogin()) {
            return this.ADDRESS
        } else {
            return this.ADDRESS_PUBLIC
        }
    },

    loginSWITCHaai(authCookie) {

        const authPayload = {
            "username": authCookie.mail,
            "uid": authCookie.user,
            "pid": authCookie.pid,
            "org": authCookie.org,
            "givenname": authCookie.givenname,
            "surname": authCookie.surname
        }

        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (this.readyState === 4) {
                    if (xhr.status === 200) {
                        const responseJson = JSON.parse(this.response);
                        const token = responseJson.token;
                        API.loginStatus = LoginStatus.LOGGED_IN;
                        sessionStorage.setItem("fhnw-token", token);
                        sessionStorage.setItem("switchaai", true);
                        API.token = token;
                        API.switchaai = true;
                        resolve();
                    } else if (xhr.status === 400) {
                        API.loginStatus = LoginStatus.ERRORED;
                        reject(i18n.get("incorrect-login"));
                    } else {
                        API.loginStatus = LoginStatus.ERRORED;
                        reject(`Bad response code '${xhr.status}' for login`);
                    }
                }
            };
            xhr.open("POST", `${this.ADDRESS}/users/authenticateSWITCHaai`, true);
            xhr.setRequestHeader("Content-type", "application/json");
            xhr.send(body = JSON.stringify(authPayload));
        });
    },
    login(username, password) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (this.readyState === 4) {
                    if (xhr.status === 200) {
                        const responseJson = JSON.parse(this.response);
                        const token = responseJson.token;
                        API.loginStatus = LoginStatus.LOGGED_IN;
                        sessionStorage.setItem("fhnw-token", token);
                        sessionStorage.setItem("switchaai", false);
                        API.token = token;
                        resolve();
                    } else if (xhr.status === 400) {
                        API.loginStatus = LoginStatus.ERRORED;
                        reject(i18n.get("incorrect-login"));
                    } else {
                        API.loginStatus = LoginStatus.ERRORED;
                        reject(`Bad response code '${xhr.status}' for login`);
                    }
                }
            };
            xhr.open("POST", `${this.ADDRESS_PUBLIC}/users/authenticate`, true);
            xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhr.send(`username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`);
        });
    },
    register(username, password) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (this.readyState === 4) {
                    if (xhr.status === 200) {
                        resolve();
                    } else if (xhr.status === 400) {
                        const responseJson = JSON.parse(this.response);
                        reject(responseJson);
                    } else {
                        reject(`Bad response code '${xhr.status}' for registration`);
                    }
                }
            };
            xhr.open("POST", `${this.ADDRESS_PUBLIC}/users/register`, true);
            xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhr.send(`username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`);
        });
    },
    recoverPassword(username) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (this.readyState === 4) {
                    if (xhr.status === 200) {
                        resolve();
                    } else if (xhr.status === 400) {
                        const responseJson = JSON.parse(this.response);
                        reject(responseJson);
                    } else {
                        reject(`Bad response code '${xhr.status}' for recover password`);
                    }
                }
            };
            xhr.open("POST", `${this.ADDRESS_PUBLIC}/users/recover`, true);
            xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhr.send(`username=${encodeURIComponent(username)}`);
        });
    },
    resetPassword(password, token) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (this.readyState === 4) {
                    if (xhr.status === 200) {
                        resolve();
                    } else if (xhr.status === 400) {
                        const responseJson = JSON.parse(this.response);
                        reject(responseJson);
                    } else {
                        reject(`Bad response code '${xhr.status}' for recover password`);
                    }
                }
            };
            xhr.open("POST", `${this.ADDRESS_PUBLIC}/users/reset`, true);
            xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhr.send(`password=${encodeURIComponent(password)}&token=${encodeURIComponent(token)}`);
        });
    },
    logoutSWITCHaai() {
        this.logout();
        this.token = "";
        this.switchaai = false;
        sessionStorage.removeItem("switchaai");
    },
    logout() {
        this.loginStatus = LoginStatus.LOGGED_OUT;
        this.token = "";
        sessionStorage.removeItem("fhnw-token");
    },
    async fetchCompletedTaskIDs() {
        const profile = await this.self();
        const completedTaskIDs = [];
        for (let task of tasks.asList()) {
            if (profile.history && profile.history[task.id]?.map((m) => m.correct).includes(true)) {
                completedTaskIDs.push(task.id);
            }
        }
        return completedTaskIDs;
    },
    async quizzesSendRetryOnFail(task, sql, result, startTime, endTime, attempt) {
        try {
            await this.quizzesSend(task, sql, result, startTime, endTime);
        } catch (e) {
            if (attempt <= 3) {
                await this.quizzesSendRetryOnFail(task, sql, result, attempt + 1, startTime, endTime);
            } else {
                showError("Failed to send answer to server, " + e);
            }
        }
    },
    quizzesSend(task, sql, result, startTime, endTime) {
        this.cachedAnswerData.loaded = false;
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (this.readyState === 4) {
                    if (this.status === 200) {
                        resolve();
                    } else {
                        reject(`Bad response code '${xhr.status}' for quizzes send`);
                    }
                }
            };

            xhr.open("PATCH", `${this.getAPIAddress()}/users/self/answer_sql`, true);
            xhr.setRequestHeader("Authorization", "Bearer " + this.token);
            xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhr.send(`task=${task.id}&correct=${result}&query=${encodeURIComponent(sql)}&startTime=${startTime}&endTime=${endTime}`);
        });
    },
    restartUser() {
        console.log('** RESTART USER **')
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (this.readyState === 4) {
                    if (this.status === 200) {
                        resolve();
                    } else {
                        reject(`Bad response code '${xhr.status}' for user restart`);
                    }
                }
            };

            xhr.open("PATCH", `${this.getAPIAddress()}/users/self/restart`, true);
            xhr.setRequestHeader("Authorization", "Bearer " + this.token);
            xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhr.send();
        });
    },
    generateCertificate() {
        console.log('** Generate Certificate **')
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (this.readyState === 4) {
                    if (this.status === 200) {
                        var jsonObj = JSON.parse(this.response);
                        resolve(jsonObj);
                    } else {
                        reject(`Bad response code '${xhr.status}' for user restart`);
                    }
                }
            };
            xhr.open("PATCH", `${this.getAPIAddress()}/users/self/certificate`, true);
            xhr.setRequestHeader("Authorization", "Bearer " + this.token);
            xhr.setRequestHeader("Content-type", "application/json");
            xhr.send(body = JSON.stringify({progression: progression}));
        });
    },
    updateStars(stars) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (this.readyState === 4) {
                    if (this.status === 200) {
                        resolve(JSON.parse(this.response));
                    } else {
                        reject(`Bad response code '${xhr.status}' for updating stars`);
                    }
                }
            };

            xhr.open("PATCH", `${this.getAPIAddress()}/users/self/stars`, true);
            xhr.setRequestHeader("Authorization", "Bearer " + this.token);
            xhr.setRequestHeader("Content-type", "application/json");
            xhr.send(JSON.stringify({stars}));  // Send the stars value in the body as JSON
        });
    },
    updateTimeLastActive() { //Call this method when login process is finished
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (this.readyState === 4) {
                    if (this.status === 200) {
                        resolve(JSON.parse(this.response));
                    } else {
                        reject(`Bad response code '${xhr.status}' for updating timeLastActive timestamp`);
                    }
                }
            };

            xhr.open("PATCH", `${this.getAPIAddress()}/users/self/timeLastActive`, true);
            xhr.setRequestHeader("Authorization", "Bearer " + this.token);
            xhr.setRequestHeader("Content-type", "application/json");
            xhr.send(); //Send Request
        });
    },
    updateTimeStarsEarned() { //Call this method when login process is finished
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (this.readyState === 4) {
                    if (this.status === 200) {
                        resolve(JSON.parse(this.response));
                    } else {
                        reject(`Bad response code '${xhr.status}' for updating timeStarsEarned timestamp`);
                    }
                }
            };

            xhr.open("PATCH", `${this.getAPIAddress()}/users/self/timeStarsEarned`, true);
            xhr.setRequestHeader("Authorization", "Bearer " + this.token);
            xhr.setRequestHeader("Content-type", "application/json");
            xhr.send(); //Send Request
        });
    },
    async updatePrivacy() {
        try {
            // Fetch the current active user data
            const self = await this.self();
            const users = await this.getUsers();
            const currentUser = users.find(user => user.username === self.username); // Assuming 'displayName' or 'username' is used to identify the current user
            const currentAliasName = currentUser ? currentUser.aliasName : null; // Get aliasName of current user, or null if it doesn't exist

            // Fetch all users and extract alias names
            const userAliases = (await this.getUsers()).map(user => user.aliasName);

            // Determine if aliasName needs to be set or privacy updated
            const makePrivate = !('aliasName' in self) || self.isPublic === true;

            /* Set up the payload for the API request. Here is also ensured if the aliasName is generated for the first time,
            if so, the users.routes will take the aliasName from the createAlias(), if not, the old aliasName persists in the DB*/

            const payload = makePrivate
                ? currentAliasName
                    ? {makePrivate: true} // Only include makePrivate when aliasName already exists
                    : {makePrivate: true, aliasName: this.createAlias(userAliases)} // Include aliasName if it doesn't exist
                : {makePrivate: false}; // Just send makePrivate: false for public


            // Call the API to update privacy settings
            return new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.onreadystatechange = function () {
                    if (this.readyState === 4) {
                        if (this.status === 200) {
                            resolve(JSON.parse(this.response));
                        } else {
                            reject(`Bad response code '${xhr.status}' for updating privacy`);
                        }
                    }
                };

                xhr.open("PATCH", `${this.getAPIAddress()}/users/self/togglePrivacy`, true);
                xhr.setRequestHeader("Authorization", "Bearer " + this.token);
                xhr.setRequestHeader("Content-type", "application/json");
                xhr.send(JSON.stringify(payload));  // Send the payload in the body as JSON
            });
        } catch (error) {
            console.error('Failed to update privacy setting for the active user:', error);
            throw error;  // Rethrow the error for proper handling
        }
    },
    createAlias(existingAliases) {
        // Array of nouns related to wizards and mythical creatures
        const nouns = [
            "Wizard", "Dragon", "Phoenix", "Elve", "Sorcerer", "Goblin", "Warlock", "Witch", "Saruman", "Troll",
            "WhiteWalker", "NightKing", "Griffin", "Voldemort", "Sphinx", "Ogre", "Vampire", "Werewolf", "Necromancer", "Sauron",
            "Bellatrix", "Banshee", "Satyr", "Balrog", "Minotaur", "Hydra", "Ragnar", "Djinn", "Hobbit", "Nazgul"
        ];

        // Array of past participles/adjectives related to wizards and mythical activities
        const adjectives = [
            "Enchanted", "Summoned", "Conjured", "Transformed", "Bewitched", "Invoked", "Banished", "Cursed", "Hexed",
            "Levitated", "Crucified", "Transmuted", "Charmed", "Protected", "Bewildered", "Mesmerized", "Shrouded",
            "Awakened", "Envenomed", "Exorcised", "Vanquished", "Illuminated", "Guarded", "Defended", "Revived"
        ];

        let alias;
        do {
            const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
            const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
            const randomNumber = Math.floor(Math.random() * 99) + 1; // Random number between 1 and 99
            alias = `${randomAdjective}${randomNoun}${randomNumber}`;
        } while (existingAliases.includes(alias)); // Keep generating until a unique alias is found
        console.log("Created alias: " + alias);
        return alias;
    },

// getUsers() handles the functionality if the username or aliasName is displayed
    async getUsers(globalLeaderboard = true) {
        try {
            // Check the value of globalLeaderboard to determine which API call to make
            const users = globalLeaderboard ? await API.all() : await API.allClassFiltered();

            return users.map((user, index) => {
                // Set default values if fields are missing
                const isPublic = user.isPublic !== undefined ? user.isPublic : true; // Default to true if isPublic is missing

                // Determine display name: use aliasName only if isPublic is false and aliasName exists; otherwise, use username
                const displayName = (isPublic === false && user.aliasName) ? user.aliasName : user.username;

                // Return an object with displayName, aliasName, and stars (default stars to 0 if not present)
                return {
                    displayName,
                    username: user.username,
                    aliasName: user.aliasName || null, // Include aliasName, default to null if not present
                    stars: user.stars || 0
                };
            });
        } catch (error) {
            console.error("Error fetching users:", error);
            throw error; // Propagate the error for further handling
        }
    },
    // the function getNameOrAlias() handles the display in the Leaderboard modal of the user or aliasName
    async getNameOrAlias() {
        const data = await API.self();

        // Check if the isPublic field exists and is set to true
        if (data.isPublic === true && data.username) {
            return data.username; // Return the username if public
        }
        // Check if the isPublic field exists and is set to false
        else if (data.isPublic === false && data.aliasName) {
            return data.aliasName; // Return the aliasName if not public
        }
        // Handle cases where neither isPublic nor aliasName is defined
        else {
            return data.username;
        }
    },
    async getTopThree(globalLeaderboard = true) {
        try {
            const users = await API.getUsers(globalLeaderboard);  // Get mapped username/aliasName array

            // Add medals to the return
            const medals = ["🥇", "🥈", "🥉"];

            // Slice to get only top 3 of the array
            return users
                .slice(0, 3) // Selects the first three entries
                .map((user, index) => `${medals[index]} ${user.displayName}<br />`) // Adds medals and line breaks
                .join(""); // Combine into a single string with no extra separator
        } catch (error) {
            console.error('Failed to fetch top 3 users:', error);
            throw error;  // Rethrows the error for error handling
        }
    },
    async getRank(globalLeaderboard = true, total = false) {
        if (total) {
            try {
                const totalCount = globalLeaderboard ? await API.all() : await API.allClassFiltered();
                return totalCount.length;
            } catch (error) {
                console.error('Failed to fetch totalCount:', error);
                throw error;  // Rethrows the error for proper error handling
            }
        } else {
            try {
                // Fetch the current active user data & all user for comparison
                const user = await this.self();
                // Check the value of globalLeaderboard to determine which API call to make
                const users = globalLeaderboard ? await API.all() : await API.allClassFiltered();

                // Find the index of the current user in the users array
                const rank = users.findIndex(u => u.username === user.username) + 1; // Here we find the index and add one for a proper rank (no 0 rank allowed)

                // Check if the user was found, if not, throw an error
                if (rank === 0) {
                    throw new Error('Current user not found in user list');
                }

                return rank;  // Return the rank (index + 1)
            } catch (error) {
                console.error('Failed to fetch rank:', error);
                throw error;  // Rethrows the error for proper error handling
            }
        }
    },
    async setClassKey() {
        const userInput = document.getElementById("user-class-input");
        const classKey = userInput.value.replace(/\s+/g, "");  // remove white spaces from classKey
        const profileView = new ProfileView(); // Instantiate the ProfileView to access renderDisplayClassKey()

        if (!classKey) {
            userInput.value = "";
            profileView.displayToast(i18n.get("toast-classkey-empty"), "error");
            return;
        }

        userInput.value = "";  // Clear the input field
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onreadystatechange = async function () {
                if (this.readyState === 4) {
                    if (this.status === 200) {
                        resolve(JSON.parse(this.response));

                        // Notify user of success
                        profileView.displayToast(i18n.get("toast-classkey-success"), "success");

                        // Call renderDisplayClassKey after successfully updating classKey
                        await profileView.renderDisplayClassKey();
                        if (!await LeaderboardView.getGlobalLeaderboard()) {
                            console.log(await LeaderboardView.getGlobalLeaderboard());
                            await RelativeLeaderboard.update(await LeaderboardView.getGlobalLeaderboard());
                        }

                    } else {
                        reject(`Bad response code '${xhr.status}' for updating classKey`);
                        // Notify user of error
                        profileView.displayToast(i18n.get("toast-classkey-error"), "error");
                    }
                }
            };

            xhr.open("PATCH", `${this.getAPIAddress()}/users/self/classKey`, true);
            xhr.setRequestHeader("Authorization", "Bearer " + this.token);
            xhr.setRequestHeader("Content-type", "application/json");
            xhr.send(JSON.stringify({classKey}));  // Send the classKey value in the body as JSON
        });
    },
    async getClassKey() {
        const data = await API.self();
        if (data.classKey) {
            return data.classKey;  // Return the classKey if it exists
        } else {
            return i18n.get("not-enrolled");  // Return this message if classKey does not exist
        }
    },
};