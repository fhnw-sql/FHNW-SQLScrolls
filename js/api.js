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
  loginExisting() {
    const sessionToken = sessionStorage.getItem("fhnw-token");
    if (sessionToken) {
      API.loginStatus = LoginStatus.LOGGED_IN;
      API.token = sessionToken;
    }
  },
  isSWITCHaaiLogin(){
    this.switchaai = (sessionStorage.getItem("switchaai") === 'true');
    return this.switchaai
  },
  getAPIAddress(){
    // select proper API address depending on login type
    if (this.isSWITCHaaiLogin()){
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
      xhr.send(body=JSON.stringify(authPayload));
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
      xhr.send(body=JSON.stringify({progression: progression}));
    });
  },
};
