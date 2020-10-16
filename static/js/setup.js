//? |-----------------------------------------------------------------------------------------------|
//? |  /static/js/setup.js                                                                          |
//? |                                                                                               |
//? |  Copyright (c) 2018-2020 Belikhun. All right reserved                                         |
//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
//? |-----------------------------------------------------------------------------------------------|

const setup = {
	container: $("#screens"),
	index: 9999,

	Screen: class {
		constructor({
			name = "sample",
			title = "sample title",
			description = "A sample Screen with sample title and sample description"
		} = {}) {
			this.container = buildElementTree("div", ["screen", "hidden"], [
				{ type: "span", class: "left", name: "left", list: [
					{ type: "icon", name: "icon" },
					{ type: "t", class: "title", name: "titleNode", text: title },
					{ type: "t", class: "description", name: "description", html: description }
				]},

				{ type: "span", class: "right", name: "right" }
			]);

			setup.container.appendChild(this.container.tree);

			/** @type {HTMLDivElement} */
			this.container = this.container.obj;

			this.container.dataset.screen = name;
			this.container.style.zIndex = setup.index--;

			this.setupHandlers = []
			this.completeHandlers = []
		}

		setup(f) {
			if (!f || typeof f !== "function")
				throw { code: -1, description: `setup.Screen().setup(): not a valid function` }

			this.setupHandlers.push(f);
		}

		onComplete(f) {
			if (!f || typeof f !== "function")
				throw { code: -1, description: `setup.Screen().setup(): not a valid function` }

			this.completeHandlers.push(f);
		}

		async run() {
			this.container.classList.remove("hidden");
			this.container.classList.add("show");

			for (let f of this.setupHandlers)
				await f({
					screen: this,
					container: this.container,
					left: this.container.left,
					right: this.container.right
				});
		}

		async hide() {
			this.container.classList.add("hide");

			await delayAsync(600);
			this.container.classList.add("hidden");
			this.container.classList.remove("show", "run");

			for (let f of this.completeHandlers)
				await f();
		}

		linkNext(screen) {
			if (!screen || typeof screen.run !== "function")
				throw { code: -1, description: `setup.Screen().linkNext(): not a valid Screen` }

			this.onComplete(() => screen.run());
		}
	},

	async init() {
		//? ============================ INTRO SCREEN ============================
		const intro = new this.Screen({
			name: "intro",
			title: "chào mừng!",
			description: "Cảm ơn bạn đã tin dùng <b>Themis Web Interface</b>! Chỉ còn vài bước nữa là bạn đã hoàn thành việc cài đặt hệ thống!"
		});

		intro.setup(async ({ screen, container, left, right }) => {
			let icon = new lazyload({
				source: "/assets/img/icon.webp",
				classes: "icon"
			});

			let title = document.createElement("t");
			title.classList.add("title");
			title.innerText = "Themis Web Interface";

			let nextButton = createBtn("Tiếp Theo", "blue", { complex: true });
			nextButton.classList.add("nextBtn");

			left.appendChild(nextButton);
			right.append(icon.container, title);
			await icon.wait();

			$("#loadingScreen").classList.add("hide");

			await delayAsync(1600);
			container.classList.add("showIcon");

			await delayAsync(5000);
			$("#header").classList.add("show");

			await delayAsync(400);
			container.classList.add("run");

			nextButton.addEventListener("mouseup", () => screen.hide());
		});

		//? ============================ LICENSE SCREEN ============================

		const licenseScreen = new this.Screen({
			name: "license",
			title: "bản quyền",
			description: `Mã nguồn mở của hệ thống này được cấp phép theo bản quyền <b>MIT</b>. Hãy đọc kĩ trước khi sử dụng hệ thống!`
		});

		licenseScreen.setup(({ screen, container, left, right }) => {
			let iframe = document.createElement("iframe");
			iframe.src = "/licenseInfo.php";
			
			let button = createBtn("Tiếp Theo", "green", { complex: true });
			button.addEventListener("mouseup", () => screen.hide());

			left.appendChild(button);
			right.appendChild(iframe);
			container.classList.add("run");
		});

		//? ============================ ACCOUNT SCREEN ============================
		const accountSetup = new this.Screen({
			name: "account",
			title: "tài khoản",
			description: "Đây sẽ là tài khoản quản trị của bạn. Với tài khoản có quyền quản trị bạn có thể thay đổi cài đặt hệ thống, chỉnh sửa tài khoản và cấp quyền quản trị cho tài khoản khác!"
		})

		accountSetup.setup(({ screen, container, left, right }) => {
			let form = buildElementTree("form", [], [
				{ name: "note", node: createNote({
					level: "warning",
					message: "Tên đăng nhập chỉ được phép chứa các kí tự từ <b>a-z, A-Z và 0-9</b>"
				}) },
				{ name: "errorNote", node: createNote() },
				{ name: "username", node: createInput({ label: "Tên Người Dùng", color: "blue", required: true, autofill: false }) },
				{ name: "password", node: createInput({ label: "Mật Khẩu", type: "password", color: "blue", required: true, autofill: false }) },
				{ name: "verifyPassword", node: createInput({ label: "Nhập Lại Mật Khẩu", type: "password", color: "blue", required: true, autofill: false }) },
				{ name: "submit", node: createBtn("Tạo Tài Khoản", "green", { type: "submit", complex: true }) }
			]);

			right.appendChild(form.tree);
			form = form.obj;

			form.autocomplete = "off";
			form.action = "javascript:void(0);";
			form.submit.disabled = true;
			form.errorNote.group.style.display = "none";

			const update = () => {
				let u = form.username.input.value;
				let p = form.password.input.value;
				let rp = form.verifyPassword.input.value;

				if (p !== "" && rp !== "" && rp !== p) {
					form.submit.changeText(`Mật Khẩu Không Khớp!`);
					form.submit.dataset.triColor = "red";
					form.submit.disabled = true;
					return;
				}

				if (u !== "" && p !== "" && rp !== "") {
					form.submit.changeText(`Tạo Tài Khoản`);
					form.submit.dataset.triColor = "green";
					form.submit.disabled = false;
					return;
				}

				form.submit.changeText(`Tạo Tài Khoản`);
				form.submit.dataset.triColor = "blue";
				form.submit.disabled = true;
			}

			const createAccount = async (username, password) => {
				form.submit.disabled = true;
				form.username.input.disabled = true;
				form.password.input.disabled = true;
				form.verifyPassword.input.disabled = true;
				form.errorNote.group.style.display = "none";

				let response = null;

				try {
					response = await myajax({
						url: "/api/register",
						method: "POST",
						form: {
							username,
							password
						}
					});
				} catch(e) {
					form.errorNote.group.style.display = null;
					form.errorNote.set({ level: "error", message: `<b>[${e.data.code}]</b> ${e.data.description}` });

					form.username.input.disabled = false;
					form.password.input.disabled = false;
					form.verifyPassword.input.disabled = false;
					update();
					return;
				}

				screen.hide();
			}

			form.username.input.addEventListener("input", () => update());
			form.password.input.addEventListener("input", () => update());
			form.verifyPassword.input.addEventListener("input", () => update());
			form.submit.addEventListener("click", () => createAccount(form.username.input.value, form.password.input.value));
			
			container.classList.add("run");
		});

		//? ============================ CONFIG SCREEN ============================
		
		const configScreen = new this.Screen({
			name: "config",
			title: "cài đặt",
			description: `Bạn có thể thay đổi cài đặt hệ thống về sau tại <b>Menu > quản trị > Admin Control Panel</b>`
		});

		configScreen.setup(({ screen, container, left, right }) => {
			let iframe = document.createElement("iframe");
			iframe.src = "/config.php";
			
			let button = createBtn("Tiếp Theo", "green", { complex: true });
			button.addEventListener("mouseup", () => screen.hide());

			left.appendChild(button);
			right.appendChild(iframe);
			container.classList.add("run");
		});

		//? ============================ COMPLETE SCREEN ============================

		const completeScreen = new this.Screen({
			name: "complete",
			title: "hoàn thành!",
			description: `Bạn đã hoàn thành việc thiết lập <b>Themis Web Interface</b>! Nếu có bất kì vướng mắc gì hãy tìm kiếm trên trang <b>Wiki</b> hoặc đặt câu hỏi trên trang Github của dự án!`
		});

		completeScreen.setup(async ({ screen, container, left, right }) => {
			let redirect = document.createElement("div");
			redirect.classList.add("redirect");
			redirect.innerHTML = `<span class="simpleSpinner"></span>Đang chuyển hướng tới Trang Chủ...`;

			left.appendChild(redirect);
			container.classList.add("run");

			await delayAsync(5000);
			window.location = "/";
		});
		
		if (VALID_SETUP) {
			intro.linkNext(licenseScreen);
			licenseScreen.linkNext(accountSetup);
			accountSetup.linkNext(configScreen);
			configScreen.linkNext(completeScreen);
			intro.run();
		} else {
			intro.linkNext(completeScreen);
			intro.run();
		}
	}
}

window.addEventListener("load", () => setup.init());