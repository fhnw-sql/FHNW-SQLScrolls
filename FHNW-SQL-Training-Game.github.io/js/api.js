LoginStatus = {
  LOGGED_OUT: 0,
  LOGGED_IN: 1,
  ERRORED: 2,
};

const aipath = Config.AIPATH || "ai"; // default to ai if not set

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
  async quizzesSendRetryOnFail(task, sql, result, attempt) {
    try {
      await this.quizzesSend(task, sql, result);
    } catch (e) {
      if (attempt <= 3) {
        await this.quizzesSendRetryOnFail(task, sql, result, attempt + 1);
      } else {
        showError("Failed to send answer to server, " + e);
      }
    }
  },
  quizzesSend(task, sql, result) {
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
      xhr.send(`task=${task.id}&correct=${result}&query=${encodeURIComponent(sql)}`);
    });
  },
  /**
   * Ask the backend (/${aipath}/hint) for a hint after repeated failures.
   *
   * @param input String – the player's last SQL query
   * @returns Promise<string> hint text from an AI model
   */
  openaiGetHintStream(task, query, onData, onDone, onError) {
    const abortController = new AbortController();
    const signal = abortController.signal;

    fetch(`${this.getAPIAddress()}/${aipath}/hint`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + this.token,
      },
      body: JSON.stringify({
        input: query,
        answer: task.answer,
      }),
      signal, // Attach the abort signal to the fetch request
    })
      .then(async (response) => {
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
        }

        const reader = response.body.getReader();
        let fullResponseAccumulated = "";

        const processStream = async () => {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = new TextDecoder().decode(value);
            console.log("API.js: Raw chunk received:", chunk); // Debugging log
            const lines = chunk.split('\n').filter(line => line.length > 0);
            console.log("API.js: Lines after split (from chunk):", lines); // Debugging log

            for (const line of lines) {
              console.log("API.js: Processing line:", line); // Debugging log
              const dataMatch = line.match(/^data: (.*)$/);
              const eventMatch = line.match(/^event: (.*)$/);

              if (dataMatch) {
                try {
                  console.log("API.js: dataMatch[1]:", dataMatch[1]); // Debugging log
                  const parsedData = JSON.parse(dataMatch[1]);
                  console.log("API.js: parsedData:", parsedData); // Debugging log
                  console.log("API.js: parsedData.delta:", parsedData.delta); // Debugging log
                  if (parsedData.delta) {
                    fullResponseAccumulated += parsedData.delta;
                    onData({ delta: parsedData.delta });
                  } else {
                    console.warn("API.js: parsedData.delta is falsy:", parsedData.delta); // Debugging log
                  }
                } catch (e) {
                  console.error("Failed to parse data chunk:", e, line); // Debugging log
                }
              } else if (eventMatch && eventMatch[1].trim() === "done") {
                console.log("API.js: 'done' event received. Full response accumulated before final parsing:", fullResponseAccumulated); // Debugging log
                try {
                  const lines = fullResponseAccumulated.trim().split('\n');
                  console.log("API.js: Lines after split (from fullResponseAccumulated):", lines); // Debugging log
                  if (lines.length >= 2) {
                    const hintObject = JSON.parse(lines[0]);
                    const explanationObject = JSON.parse(lines[1]);
                    console.log("API.js: Final hint passed to onDone:", hintObject.hint); // Debugging log
                    console.log("API.js: Final explanation passed to onDone:", explanationObject.explanation); // Debugging log
                    onDone({ hint: hintObject.hint || "", explanation: explanationObject.explanation || "" });
                  } else {
                    console.warn("LLM response did not contain at least two lines for final parsing:", fullResponseAccumulated); // Debugging log
                    onDone({ hint: "", explanation: "" });
                  }
                } catch (parseError) {
                  onError(new Error("Failed to parse final LLM response: " + parseError.message)); // Debugging log
                }
                reader.cancel();
                return;
              } else if (eventMatch) {
                console.log("API.js: Ignoring other event:", eventMatch[1]); // Debugging log
              }
            }
          }
          // If stream finishes without a 'done' event, call onDone anyway
          console.warn("API.js: Stream finished without 'done' event in main loop. Calling fallback onDone."); // Debugging log
          onDone({ hint: "", explanation: "" }); // Fallback
        };

        processStream().catch((error) => {
          onError(new Error("Error during hint stream processing: " + error.message));
        });
      })
      .catch((error) => {
        onError(new Error("Network or fetch error during hint stream: " + error.message));
      });

    // Return an abort function to allow the caller to stop the stream
    return () => abortController.abort();
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
      xhr.send(body = JSON.stringify({ progression: progression }));
    });
  },
};
