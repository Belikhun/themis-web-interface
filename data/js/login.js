//|====================================================|
//|                      login.js                      |
//|            Copyright (c) 2018 Belikhun.            |
//|      This file is licensed under MIT license.      |
//|====================================================|

login = {
    form: {
        container: document.getElementById("form_container"),
        username: {
            container: document.getElementById("form_username"),
            input: document.getElementById("form_username_input"),
            submit: document.getElementById("form_username_submit"),
            message: document.getElementById("form_message"),
        },
        password: {
            container: document.getElementById("form_password"),
            avatar: document.getElementById("form_avatar"),
            user: document.getElementById("form_user"),
            input: document.getElementById("form_password_input"),
            submit: document.getElementById("form_password_submit")
        }
    },

    init: function () {
        this.form.username.input.focus();
        this.form.username.submit.addEventListener("click", this.checkusername);
        this.form.username.input.addEventListener("keyup", function(e) {
            e.preventDefault();
            if (event.keyCode === 13) {
                login.checkusername();
            }
        });
        this.form.container.addEventListener("submit", this.submit, false);
    },

    submit: function () {
        login.form.password.input.disabled = true;
        login.form.password.submit.disabled = true;
        setTimeout(() => {
            login.login(login.form.username.input.value, login.form.password.input.value, function(data) {
                window.location.href = data.redirect;
            }, function(ise, res, t) {
                if (ise) {
                    login.reset();
                    login.form.username.message.innerText = res;
                } else {
                    login.reset();
                    login.form.username.message.innerText = res.description;
                }
            })
        }, 1000);
    },

    checkusername: function() {
        var val = login.form.username.input.value;
        if (val == "" || val == null) {
            login.form.username.input.focus();
            return false;
        }
        login.form.username.input.disabled = true;
        login.form.username.submit.disabled = true;
        setTimeout(() => {
            login.showpassinp(val);
        }, 1000);
    },

    showpassinp: function (username) {
        console.log(username);
        login.form.username.container.classList.add("hide");
        login.form.password.avatar.src = "/api/avt/get?u=" + username;
        login.form.password.user.innerText = username;
        login.form.password.input.disabled = false;
        login.form.password.input.focus();
        login.form.password.submit.disabled = false;
    },

    login: function (username, password, callout = () => {}, error = () => {}) {
        var xhr = new XMLHttpRequest();

        xhr.addEventListener("readystatechange", function () {
            if (this.readyState === this.DONE) {
                try {
                    var res = JSON.parse(this.responseText);
                } catch (e) {
                    error(true, e);
                    return;
                }

                if (this.status != 200 || res.code != 0)
                    error(false, res, this);
                else
                    callout(res.data);
            }
        });

        xhr.open("GET", "/api/login?u=" + username + "&p=" + password, true);
        xhr.send();
    },

    reset: function () {
        login.form.username.container.classList.remove("hide");
        login.form.username.input.value = "";
        login.form.username.message.innerText = "";
        login.form.username.input.disabled = false;
        login.form.username.submit.disabled = false;
        login.form.password.avatar.src = "";
        login.form.password.user.innerText = "";
        login.form.password.input.value = "";
        login.form.password.input.disabled = true;
        login.form.password.submit.disabled = true;
    },
}