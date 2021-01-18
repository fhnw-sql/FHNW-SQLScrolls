LoginStatus = {
  LOGGED_OUT: 0,
  LOGGED_IN: 1,
  ERRORED: 2,
};

const API = {
  ADDRESS: "https://fhnw-stg-api-web.dev.liqix.cc",
  loginStatus: LoginStatus.LOGGED_OUT,
  token: undefined,
  username: undefined,
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
      xhr.open("GET", `${this.ADDRESS}/users/self`, true);
      xhr.setRequestHeader("Authorization", "Bearer " + this.token);
      xhr.send();
    });
  },
  loginExisting() {
    const sessionToken = sessionStorage.getItem("fhnw-token");
    const username = sessionStorage.getItem("fhnw-username");
    // TODO: Check token request
    if (sessionToken) {
      API.loginStatus = LoginStatus.LOGGED_IN;
      API.token = sessionToken;
      API.username = username;
    }
  },
  login(username, password) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function () {
        if (this.readyState === 4) {
          if (xhr.status === 200) {
            const responseJson = JSON.parse(this.response);
            const username = responseJson.user.username;
            const token = responseJson.token;
            API.loginStatus = LoginStatus.LOGGED_IN;
            sessionStorage.setItem("fhnw-username", username);
            sessionStorage.setItem("fhnw-token", token);
            API.username = username;
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
      xhr.open("POST", `${this.ADDRESS}/users/authenticate`, true);
      xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      xhr.send(`username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`);
    });
  },
  logout() {
    this.loginStatus = LoginStatus.LOGGED_OUT;
    this.token = "";
    this.username = "";
    sessionStorage.removeItem("fhnw-token");
    sessionStorage.removeItem("fhnw-username");
  },
  async fetchCompletedTaskIDs() {
    const profile = await this.self();
    const completedTaskIDs = [];
    for (let task of tasks.asList()) {
      if (profile.history[task.id]?.map((m) => m.correct).includes(true)) {
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
      xhr.open("PATCH", `${this.ADDRESS}/users/self/answer_sql`, true);
      xhr.setRequestHeader("Authorization", "Bearer " + this.token);
      xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      xhr.send(`task=${task.id}&correct=${result}&query=${encodeURIComponent(sql)}`);
    });
  },
};
