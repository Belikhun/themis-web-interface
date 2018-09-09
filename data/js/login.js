//|====================================================|
//|                      login.js                      |
//|            Copyright (c) 2018 Belikhun.            |
//|      This file is licensed under MIT license.      |
//|====================================================|

login = {
    form: {
        container: $("#form_container"),
        username: {
            container: $("#form_username"),
            input: $("#form_username_input"),
            submit: $("#form_username_submit"),
            message: $("#form_message"),
        },
        password: {
            container: $("#form_password"),
            avatar: $("#form_avatar"),
            user: $("#form_user"),
            input: $("#form_password_input"),
            submit: $("#form_password_submit")
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
            myajax({
                "url": "/api/login",
                "method": "POST",
                "form": {
                    "u": login.form.username.input.value,
                    "p": login.form.password.input.value
                }
            }, function(data) {
                window.location.href = data.redirect;
            }, () => {}, function(e) {
                login.reset();
                login.form.username.message.innerText = e.description;
            }, true)
        }, 500);
    },

    checkusername: function() {
        var val = login.form.username.input.value;
        if (val == "" || val == null) {
            login.form.username.input.focus();
            return false;
        }
        login.form.username.input.disabled = true;
        login.form.username.submit.disabled = true;
        login.form.password.avatar.onload = () => {
            login.showpassinp(val);
        };
        login.form.password.avatar.src = "/api/avt/get?u=" + val;
    },

    showpassinp: function (username) {
        login.form.username.container.classList.add("hide");
        login.form.password.user.innerText = username;
        login.form.password.input.disabled = false;
        login.form.password.input.focus();
        login.form.password.submit.disabled = false;
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
        login.form.username.input.focus();
    },
}