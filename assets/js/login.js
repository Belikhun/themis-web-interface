//? |-----------------------------------------------------------------------------------------------|
//? |  /assets/js/login.js                                                                          |
//? |                                                                                               |
//? |  Copyright (c) 2018-2020 Belikhun. All right reserved                                         |
//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
//? |-----------------------------------------------------------------------------------------------|

if (localStorage.getItem("display.nightmode") === "true")
	document.body.classList.add("dark");

const login = {
	container: $("#formContainer"),
	form: {
		title: $("#formTitle"),
		message: $("#formMessage"),
		registerBtn: $("#registerToggler"),
		loginBtn: $("#loginToggler")
	},

	allowRegister: false,

	async init() {
		if (!(/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream))
			await sounds.init();

		let server = await myajax({ url: "/api/server", method: "GET" });
		this.allowRegister = server.data.config.allowRegister;

		this.login.init();

		if (this.allowRegister) {
			this.register.init();
			this.form.registerBtn.disabled = false;
		}
		
		this.form.title.innerText = "Đăng Nhập";
		this.form.loginBtn.disabled = false;
		this.form.registerBtn.addEventListener("click", () => this.toggleRegister(true));
		this.form.loginBtn.addEventListener("click", () => this.toggleRegister(false));
		sounds.select(1);
	},

	async toggleRegister(show = true) {
		if (show) {
			this.container.classList.add("registerForm");
			this.form.title.innerText = "Đăng Kí";
			sounds.toggle(0);
			await delayAsync(500);
			await this.register.toggle(true);
		} else {
			this.container.classList.remove("registerForm");
			this.form.title.innerText = "Đăng Nhập";
			sounds.toggle(1);
			await this.register.toggle(false);
		}
		
		return show;
	},

	errored(error) {
		let e = (error.code && error.data.code)
			?	`[${error.code} ${error.data.code}]`
			:	error.code ? `[${error.code}]`
			:	error.name
			||	error.data.name
			||	`${error.data.data.file}:${error.data.data.line}`

		let d = (error.description && error.data.description)
			?	`${error.description} (${error.data.description}) ${(error.data.data.file) ? `${error.data.data.file}:${error.data.data.line}` : ""}`
			:	error.message
			||	error.data.message
			||	error.data.description
			||	error.description
	
		this.form.message.innerHTML = `<b>${e}</b> >>> ${d}`;
		clog("ERRR", error);
	},

	login: {
		container: $("#loginFormContainer"),
		username: {
			container: $("#loginUsername"),
			input: $("#loginUsernameInput"),
			submit: $("#loginUsernameSubmit"),
		},

		password: {
			container: $("#loginPassword"),
			profile: $("#loginFormProfile"),
			avatar: $("#loginFormAvatar"),
			user: $("#loginFormUser"),
			input: $("#loginPasswordInput"),
			submit: $("#loginPasswordSubmit")
		},

		complete: {
			message: $("#loginCompleteMessage")
		},

		init() {
			this.username.submit.addEventListener("click", () => this.checkUsername(), false);
			this.username.input.addEventListener("keyup", e => {
				if (e.keyCode === 13 || e.keyCode === 9) {
					e.preventDefault();
					this.checkUsername();
				}
			});

			this.password.avatar.addEventListener("load", e => e.target.parentElement.dataset.loaded = 1);
			this.container.addEventListener("submit", () => this.login(), false);
			this.password.profile.addEventListener("mouseup", () => this.reset(), false);
			this.username.input.disabled = false;
			this.username.submit.disabled = false;
			this.innerText = "Đăng nhập";
			this.container.dataset.layout = 1;
			this.username.input.focus();
		},

		async checkUsername() {
			let username = this.username.input.value;
			let userData = [];
			
			if (username === "" || username === null) {
				this.username.input.focus();
				return false;
			}
			
			this.password.avatar.onload = null;
			this.username.input.disabled = true;
			this.username.submit.disabled = true;
			sounds.confirm(0);

			try {
				userData = await myajax({
					url: "/api/info",
					method: "GET",
					query: { u: username }
				})
			} catch(e) {
				// Ignore
				clog("ERRR", e);
			}

			this.password.avatar.parentElement.removeAttribute("data-loaded");
			this.password.avatar.src = "/api/avatar?u=" + username;
			this.showPasswordForm(username, userData.data ? userData.data.name : null);
		},

		async showPasswordForm(username, name) {
			this.container.dataset.layout = 2;
			this.password.user.innerText = name || username;
			this.password.input.disabled = false;
			this.password.submit.disabled = false;

			// Wait for animation
			await delayAsync(500);

			this.password.input.focus();
			sounds.select(1);
		},

		async login() {
			let data = {}
			let username = this.username.input.value;
			let password = this.password.input.value;

			this.password.input.disabled = true;
			this.password.submit.disabled = true;
			sounds.confirm(1);

			// Cool down a little bit
			await delayAsync(500);
			
			try {
				let response = await myajax({
					url: "/api/login",
					method: "POST",
					form: { username, password }
				})

				data = response.data;
			} catch(e) {
				if (e.data.code === 14)
					this.reset(true);
				else
					this.reset(false);

				login.errored(e.data);
				return false;
			}

			gtag("event", "login");
			sounds.toggle(0);
			this.complete.message.innerHTML = `Xin chào <b>${data.user.name}</b>! Bạn sẽ được chuyến đến trang chủ trong chốc lát...`
			this.container.dataset.layout = 3;

			await delayAsync(2000);
			window.location.href = data.redirect;
		},

		reset(keepUsername = false) {
			this.username.input.disabled = false;
			this.username.submit.disabled = false;
			this.password.input.value = "";
			sounds.select(1);

			if (!keepUsername) {
				this.username.input.value = "";
				this.container.dataset.layout = 1;
				this.password.avatar.parentElement.removeAttribute("data-loaded");
				this.password.avatar.src = "";
				this.password.input.disabled = true;
				this.password.submit.disabled = true;
				this.password.user.innerText = "";
				this.username.input.focus();
			} else {
				this.password.input.disabled = false;
				this.password.submit.disabled = false;
				this.password.input.focus();
			}
		}
	},

	register: {
		container: $("#registerFormContainer"),
		username: {
			container: $("#registerUsername"),
			input: $("#registerUsernameInput"),
			submit: $("#registerUsernameSubmit"),
		},

		password: {
			container: $("#registerPassword"),
			input: $("#registerPasswordInput"),
			inputRetype: $("#registerPasswordInputRetype"),
			captcha: $("#registerCaptcha"),
			captchaRenew: $("#registerCaptchaRenew"),
			captchaInput: $("#registerCaptchaInput"),
			submit: $("#registerPasswordSubmit")
		},

		complete: {
			avatarInput: $("#userAvatarInput"),
			avatar: $("#userAvatar"),
			nameInput: $("#userNameInput"),
			submit: $("#editUserConfirm")
		},

		registerData: {},

		init() {
			this.username.submit.addEventListener("click", () => this.checkUsername(), false);
			this.username.input.addEventListener("keyup", e => {
				if (e.keyCode === 13 || e.keyCode === 9) {
					e.preventDefault();
					this.checkUsername();
				}
			});

			this.complete.submit.addEventListener("mouseup", async e => {
				e.target.disabled = true;
				sounds.confirm(0);
				await this.updateName(this.complete.nameInput.value);
				window.location.href = this.registerData.redirect;
			});

			this.complete.avatarInput.addEventListener("change", e => this.updateAvatar(e.target.files[0]));
			this.complete.avatar.addEventListener("load", e => e.target.parentElement.dataset.loaded = 1);
			this.password.inputRetype.addEventListener("keyup", e => e.target.parentElement.dataset.color = (this.password.input.value === e.target.value) ? "blue" : "red");
			this.password.captcha.addEventListener("load", e => e.target.parentElement.dataset.loaded = 1);
			this.password.captchaRenew.addEventListener("mouseup", e => this.renewCaptcha());
			this.container.addEventListener("submit", () => this.register(), false);

			this.container.dataset.layout = 1;
		},

		async toggle(show = true) {
			if (show) {
				this.username.input.disabled = false;
				this.username.submit.disabled = false;
				this.username.input.focus();
			} else {
				this.username.input.disabled = true;
				this.username.submit.disabled = true;
			}
		},

		async checkUsername() {
			let username = this.username.input.value;
			let userData = [];
			
			if (username === "" || username === null) {
				this.username.input.focus();
				return false;
			}
			
			let usernameExist = true;
			this.username.input.disabled = true;
			this.username.submit.disabled = true;
			sounds.confirm(0);
			await delayAsync(300);

			try {
				userData = await myajax({
					url: "/api/info",
					method: "GET",
					query: { u: username }
				});
			} catch(e) {
				if (e.data.code === 13)
					usernameExist = false;
				else {
					login.errored(e.data);
			
					this.reset({ username: true });
					return;
				}
			}

			if (usernameExist) {
				let e = { code: -1, description: `Tên tài khoản "${username}" đã tồn tại!`, data: { username } }
				login.errored(e);
			
				this.reset({ username: true });
				this.username.input.parentElement.dataset.color = "red";
				this.username.input.focus();
				return;
			}
			
			await this.showPasswordForm();
		},

		renewCaptcha() {
			this.password.captcha.parentElement.removeAttribute("data-loaded");
			this.password.captcha.src = "/tools/captcha?generate";
		},

		async showPasswordForm() {
			this.container.dataset.layout = 2;
			this.password.input.disabled = false;
			this.password.inputRetype.disabled = false;
			this.password.captchaInput.disabled = false;
			this.password.submit.disabled = false;
			
			// Wait for animation
			await delayAsync(500);
			this.renewCaptcha();

			this.password.input.focus();
			sounds.select(1);
		},

		async register() {
			if (this.password.input.value !== this.password.inputRetype.value) {
				this.password.inputRetype.parentElement.dataset.color = "red";
				login.errored({ code: 15, description: "Mật khẩu không khớp!" });
				this.password.inputRetype.focus();
				return;
			}

			let data = {}
			let username = this.username.input.value;
			let password = this.password.input.value;
			let captcha = this.password.captchaInput.value;
			this.password.input.disabled = true;
			this.password.inputRetype.disabled = true;
			this.password.captcha.disabled = true;
			this.password.captchaInput.disabled = true;
			this.password.captchaRenew.disabled = true;
			this.password.submit.disabled = true;
			sounds.confirm(1);

			// Cool down a little bit
			await delayAsync(500);
			
			try {
				let response = await myajax({
					url: "/api/register",
					method: "POST",
					form: { username, password, captcha }
				});

				data = response.data;
			} catch(e) {
				if (e.data.code === 8)
					this.reset({ captcha: true });
				else
					this.reset({ password: true, captcha: true });

				login.errored(e.data);
				return;
			}

			gtag("event", "register");
			sounds.toggle(0);
			this.registerData = data;
			this.registerData.user.username = username;
			this.container.dataset.layout = 3;
			this.reset({ avatar: true });
		},

		async updateAvatar(file) {
			try {
				await myajax({
					url: "/api/avatar",
					method: "POST",
					form: {
						token: this.registerData.token,
						file: file
					}
				})
			} catch(e) {
				sounds.warning();
				login.errored(e.data);
				this.reset({ avatar: true });
				return;
			}
			
			this.reset({ avatar: true });
		},

		async updateName(name) {
			if (name === "" || name === null)
				return;

			try {
				await myajax({
					url: "/api/edit",
					method: "POST",
					form: {
						name: name,
						token: this.registerData.token
					}
				})
			} catch(e) {
				sounds.warning();
				login.errored(e.data);
				return;
			}
		},

		reset({
			username = false,
			password = false,
			captcha = false,
			avatar = false
		} = {}) {
			if (username) {
				this.username.input.disabled = false;
				this.username.submit.disabled = false;
				this.username.input.parentElement.dataset.color = "blue";
			}

			if (password) {
				this.password.input.disabled = false;
				this.password.inputRetype.disabled = false;
				this.password.submit.disabled = false;
			}

			if (captcha) {
				this.password.captchaInput.disabled = false;
				this.password.captchaRenew.disabled = false;
				this.password.submit.disabled = false;

				this.renewCaptcha();
				this.password.captchaInput.value = "";
				this.password.captchaInput.focus();
			}

			if (avatar) {
				this.complete.avatar.parentElement.removeAttribute("data-loaded");
				this.complete.avatar.src = `/api/avatar?u=${this.registerData.user.username}`;
				this.complete.avatarInput.value = "";
			}
		}
	}
}

window.addEventListener(
	"DOMContentLoaded",
	(e) => login.init().catch(console.error)
);