//? |-----------------------------------------------------------------------------------------------|
//? |  /assets/js/login.js                                                                          |
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
    title: $("#login_title"),

    async init() {
        this.form.username.submit.addEventListener("click", () => this.checkUsername(), false);
        this.form.username.input.addEventListener("keyup", e => {
            if (e.keyCode === 13 || e.keyCode === 9) {
                e.preventDefault();
                this.checkUsername();
            }
        });

        sounds.init();

        this.form.container.addEventListener("submit", () => this.submit(), false);
        this.form.profile.addEventListener("click", () => this.reset(false), false);
        this.form.username.input.disabled = false;
        this.form.username.submit.disabled = false;
        this.title.innerText = "Đăng nhập";
        this.form.username.input.focus();
        sounds.select(1);
    },

    async submit() {
        let data = {}

        this.form.password.input.disabled = true;
        this.form.password.submit.disabled = true;
        sounds.confirm(1);

        // Cool down a little bit
        await delayAsync(500);
        
        try {
            let response = await myajax({
                url: "/api/login",
                method: "POST",
                form: {
                    u: this.form.username.input.value,
                    p: this.form.password.input.value
                }
            })

            data = response.data;
        } catch(e) {
            if (e.data.code === 14)
                this.reset(true);
            else
                this.reset(false);

            this.form.username.message.innerText = e.data.description;
            return false;
        }

        gtag("event", "login");
        window.location.href = data.redirect;
    },

    async checkUsername() {
        let username = this.form.username.input.value;
        
        if (username === "" || username === null) {
            login.form.username.input.focus();
            return false;
        }
        
        this.form.password.avatar.onload = null;
        sounds.confirm(0);

        let userData = await myajax({
            url: "/api/info",
            method: "GET",
            query: { u: username }
        }).catch();

        this.form.username.input.disabled = true;
        this.form.username.submit.disabled = true;
        this.form.password.avatar.onload = () => this.showPassInp(username, userData.data ? userData.data.name : null);
        this.form.password.avatar.src = "/api/avatar?u=" + username;
    },

    async showPassInp(username, name) {
        this.form.username.container.classList.add("hide");
        this.form.password.user.innerText = name || username;
        this.form.password.input.disabled = false;
        this.form.password.submit.disabled = false;

        // Wait for animation
        await delayAsync(400);

        this.form.password.input.focus();
        sounds.select(1);
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