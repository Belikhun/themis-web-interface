const login = {
	params: {
		action: "login"
	},

	root: $("#app"),
	overlay: $("#overlay"),
	left: $("#left"),
	right: $("#right"),

	changing: false,

	/** @type {HTMLFormElement} */
	currentForm: undefined,
	
	/** @type {HTMLFormElement} */
	loginForm: undefined,
	
	/** @type {HTMLFormElement} */
	passwordRecoverForm: undefined,
	
	/** @type {HTMLFormElement} */
	registerStartForm: undefined,
	
	/** @type {HTMLFormElement} */
	registerMainForm: undefined,

	/** @type {HTMLDivElement} */
	container: undefined,

	init() {
		let logo = new lazyload({ source: "/assets/img/logo.png", classes: "logo", tagName: "a" });
		logo.container.href = "/";
		this.initForms();

		this.container = makeTree("div", "container", {
			mainTitle: { tag: "div", class: ["title", "animated", "show"] },
			subTitle: { tag: "div", class: ["sub", "animated", "show"] },

			note: createNote({
				level: "warning",
				message: "sample warning",
				style: "round"
			}),

			forms: { tag: "div", class: "forms" }
		});

		let footer = document.createElement("div");
		footer.classList.add("footer");
		footer.innerText = `(c) ${APP_NAME}. All Right Reserved`;

		// Setup form
		if (this.params.action === "register") {
			this.changeForm(this.registerStartForm, {
				title: "Đăng Kí",
				sub: `Nhập tên tài khoản mới mà bạn muốn đăng kí!<br>Tên tài khoản chỉ được phép chứa các kí tự tiếng anh và số!`,
				animated: false
			});
		} else {
			this.container.forms.appendChild(this.loginForm);
			this.changeForm(this.loginForm, {
				title: "Đăng Nhập",
				sub: `Để tiếp tục với <b>${APP_NAME}</b>`,
				animated: false
			});
		}

		this.left.append(logo.container, this.container, footer);
		this.reset();
	},

	initForms() {
		this.loginForm = makeTree("form", "loginForm", {
			usernameInput: createInput({
				type: "text",
				id: "username",
				label: "tên tài khoản",
				required: true,
				autofill: false,
				animated: true
			}),

			passwordInput: createInput({
				type: "password",
				id: "password",
				label: "mật khẩu",
				required: true,
				autofill: false,
				animated: true
			}),

			buttons: { tag: "div", class: "buttons", child: {
				submit: createButton("ĐĂNG NHẬP", {
					type: "submit",
					style: "round",
					icon: "signin"
				})
			}}
		});

		this.loginForm.autocomplete = "off";
		this.loginForm.addEventListener("submit", () => this.login());
		this.loginForm.action = "javascript:void(0);";
	},

	/**
	 * Focus into first visible input in a form.
	 * @param	{HTMLFormElement}	form
	 */
	focusFirstInput(form) {
		for (let input of form.elements) {
			if (input instanceof HTMLInputElement && input.type !== "hidden") {
				input.focus();
				break;
			}
		}
	},

	/**
	 * Switch to different form
	 * @param	{HTMLFormElement}		form
	 */
	async changeForm(form, {
		title,
		sub,
		animated = true
	}) {
		// Check what need to be changed
		if (form === this.currentForm || this.changing)
			return;
		
		this.changing = true;
		this.reset();

		let changeTitle = (title && this.container.mainTitle.innerText !== title);
		let changeSub = (sub && this.container.subTitle.innerText !== sub);

		if (!animated) {
			if (this.currentForm) {
				this.container.forms.removeChild(this.currentForm);
				this.currentForm.classList.remove("show", "hide");
			}

			if (changeTitle) {
				this.container.mainTitle.innerText = title;
				this.container.mainTitle.classList.remove("hide");
			}
	
			if (changeSub) {
				this.container.subTitle.innerHTML = sub;
				this.container.subTitle.classList.remove("hide");
			}

			this.container.forms.appendChild(form);
			await nextFrameAsync();

			this.container.forms.style.height = `${form.clientHeight}px`;
			form.classList.add("show");
			this.currentForm = form;
			
			this.changing = false;

			await delayAsync(600);
			this.focusFirstInput(form);
			return;
		}

		this.container.forms.appendChild(form);

		if (changeTitle)
			this.container.mainTitle.classList.add("hide");

		if (changeSub)
			this.container.subTitle.classList.add("hide");

		// Wait for browser to render next frame to update target
		// form's size.
		await nextFrameAsync();

		// Start animation
		if (this.currentForm)
			this.currentForm.classList.add("hide");

		await delayAsync(200);
		form.classList.add("show");
		this.container.forms.style.height = `${form.clientHeight}px`;

		await delayAsync(250);
		if (changeTitle) {
			this.container.mainTitle.innerText = title;
			this.container.mainTitle.classList.remove("hide");
		}

		if (changeSub) {
			this.container.subTitle.innerHTML = sub;
			this.container.subTitle.classList.remove("hide");
		}

		await delayAsync(100);
		if (this.currentForm) {
			this.currentForm.classList.remove("show", "hide");
			this.container.forms.removeChild(this.currentForm);
		}

		this.focusFirstInput(form);
		this.currentForm = form;
		this.changing = false;
	},

	activeLoginForm() {
		this.changeForm(this.loginForm, {
			title: "Đăng Nhập",
			sub: `Để tiếp tục với <b>${APP_NAME}</b>`
		});
	},

	reset() {
		this.container.note.group.style.display = "none";
		this.loginForm.reset();
		this.loading = false;
	},

	/**
	 * Set form loading state
	 * @param	{Boolean}	loading
	 */
	set loading(loading) {
		this.overlay.style.display = loading ? null : "none";
	},
	
	async login() {
		this.loginForm.buttons.submit.loading(true);
		disableInputs(this.loginForm);
		let username = this.loginForm.usernameInput.input.value;
		let password = this.loginForm.passwordInput.input.value;

		try {
			let response = await myajax({
				url: "/api/login",
				method: "POST",
				form: { username, password }
			});

			this.container.note.group.style.display = null;
			this.container.note.set({
				level: "okay",
				message: `Đăng nhập thành công! Đang chuyển hướng bạn tới trang chủ...`
			});

			console.log(response);
			location.href = response.data.redirect;
		} catch(e) {
			this.loginForm.buttons.submit.loading(false);
			enableInputs(this.loginForm);

			switch (e.data.code) {
				case CODE.INVALID_USERNAME:
					this.loginForm.usernameInput.input.value = "";
					this.loginForm.passwordInput.input.value = "";
					this.loginForm.usernameInput.input.focus();
					this.loginForm.usernameInput.set({
						message: `Tên người dùng không tồn tại trong hệ thống!`
					});
					break;
			
				case CODE.INVALID_PASSWORD:
					this.loginForm.passwordInput.input.value = "";
					this.loginForm.passwordInput.input.focus();
					this.loginForm.passwordInput.set({
						message: `Mật khẩu không chính xác!`
					});
					break;

				default:
					this.container.note.group.style.display = null;
					this.container.note.set({ message: e.data.description });
					break;
			}
		}
	}
}