//? |-----------------------------------------------------------------------------------------------|
//? |  /assets/js/login.js                                                                            |
//? |                                                                                               |
//? |  Copyright (c) 2018-2019 Belikhun. All right reserved                                         |
//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
//? |-----------------------------------------------------------------------------------------------|

if (cookie.get("__darkMode") === "true")
    document.body.classList.add("dark");

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
        },
        profile: $("#form_profile")
    },

    init() {
        this.form.username.submit.addEventListener("click", () => this.checkUsername(), false);
        this.form.username.input.addEventListener("keyup", e => {
            if (e.keyCode === 13 || e.keyCode === 9) {
                e.preventDefault();
                this.checkUsername();
            }
        });

        this.form.container.addEventListener("submit", () => this.submit(), false);
        this.form.profile.addEventListener("click", () => this.reset(false), false);
        this.form.username.input.disabled = false;
        this.form.username.submit.disabled = false;
        this.form.username.input.focus();
    },

    async submit() {
        this.form.password.input.disabled = true;
        this.form.password.submit.disabled = true;

        // Cool down a little bit
        await delayAsync(500);
        
        try {
            var res = await myajax({
                "url": "/api/login",
                "method": "POST",
                "form": {
                    "u": this.form.username.input.value,
                    "p": this.form.password.input.value
                }
            })
        } catch(e) {
            if (e.data.code === 14)
                this.reset(true);
            else
                this.reset(false);
            this.form.username.message.innerText = e.data.description;

            return false;
        }

        window.location.href = res.redirect;
    },

    checkUsername() {
        var val = this.form.username.input.value;
        if (val === "" || val === null) {
            login.form.username.input.focus();
            return false;
        }

        this.form.username.input.disabled = true;
        this.form.username.submit.disabled = true;
        this.form.password.avatar.onload = () => this.showPassInp(val);
        this.form.password.avatar.src = "/api/avatar/get?u=" + val;
    },

    async showPassInp(username) {
        this.form.username.container.classList.add("hide");
        this.form.password.user.innerText = username;
        this.form.password.input.disabled = false;
        this.form.password.submit.disabled = false;

        // Wait for animation
        await delayAsync(400);

        this.form.password.input.focus();
    },

    reset(keepUsername = false) {
        this.form.username.message.innerText = "";
        this.form.username.input.disabled = false;
        this.form.username.submit.disabled = false;
        this.form.password.input.value = "";
        if (!keepUsername) {
            this.form.username.input.value = "";
            this.form.username.container.classList.remove("hide");
            this.form.password.avatar.src = "";
            this.form.password.input.disabled = true;
            this.form.password.submit.disabled = true;
            this.form.password.user.innerText = "";
            this.form.username.input.focus();
        } else {
            this.form.password.input.disabled = false;
            this.form.password.submit.disabled = false;
            this.form.password.input.focus();
        }
    },
}