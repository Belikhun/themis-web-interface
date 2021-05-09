//? |-----------------------------------------------------------------------------------------------|
//? |  /assets/js/navbar.js                                                                         |
//? |                                                                                               |
//? |  Copyright (c) 2018-2021 Belikhun. All right reserved                                         |
//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
//? |-----------------------------------------------------------------------------------------------|

const navbar = {
	container: HTMLElement.prototype,

	block: {
		left: HTMLElement.prototype,
		middle: HTMLElement.prototype,
		right: HTMLElement.prototype
	},

	tooltip: {
		container: HTMLElement.prototype,
		title: HTMLElement.prototype,
		description: HTMLElement.prototype
	},

	subWindow: HTMLElement.prototype,
	subWindowLists: [],

	init(container) {
		if (typeof container !== "object" || !container.classList)
			throw { code: -1, description: `navbar.init(): container is not a valid node` }

		this.container = container;
		this.container.classList.add("navigationBar");
		emptyNode(this.container);

		for (let key of Object.keys(this.block)) {
			this.block[key] = document.createElement("span");
			this.block[key].classList.add("group", key);
			this.container.appendChild(this.block[key]);
		}

		this.tooltip.container = document.createElement("div");
		this.tooltip.container.classList.add("navTip");
		this.tooltip.title = document.createElement("t");
		this.tooltip.title.classList.add("title");
		this.tooltip.description = document.createElement("t");
		this.tooltip.description.classList.add("description");
		this.tooltip.container.append(this.tooltip.title, this.tooltip.description);

		this.container.appendChild(this.tooltip.container);

		window.addEventListener("resize", () => {
			for (let item of this.subWindowLists)
				if (item.showing)
					item.update();
		});
	},

	insert(component, location, order) {
		if (typeof component !== "object" || !component.container)
			throw { code: -1, description: `navbar.insert(): not a valid component` }

		if (!this.block[location])
			throw { code: -1, description: `navbar.insert(): not a valid location` }

		this.block[location].appendChild(component.container);

		if (order)
			component.container.style.order = order;
	},

	remove(component, location) {
		if (typeof component !== "object" || !component.container)
			throw { code: -1, description: `navbar.insert(): not a valid component` }

		if (!this.block[location])
			throw { code: -1, description: `navbar.insert(): not a valid location` }

		this.block[location].removeChild(component.container);
	},

	Tooltip: class {
		constructor(node, {
			title = null,
			description = null
		} = {}) {
			this.locked = false;
			this.disabled = false;
			this.tooltip = navbar.tooltip;
			this.title = title;
			this.description = description;

			node.addEventListener("mouseenter", () => {
				if (this.locked || this.disabled || !this.title || !this.description || node.classList.contains("active"))
					return;

				let leftPos = node.getBoundingClientRect().left;
				let rightPos = leftPos + node.offsetWidth;

				if ((rightPos / window.innerWidth) > 0.8) {
					this.tooltip.container.classList.add("flip");
					this.tooltip.container.style.left = null;
					this.tooltip.container.style.right = `${window.innerWidth - rightPos}px`;
				} else {
					this.tooltip.container.classList.remove("flip");
					this.tooltip.container.style.left = `${leftPos}px`;
					this.tooltip.container.style.right = null;
				}

				this.tooltip.title.innerText = this.title;
				this.tooltip.description.innerText = this.description;
				this.tooltip.container.classList.add("show");
			});

			node.addEventListener("click", () => {
				this.tooltip.container.classList.remove("show");
				this.locked = true;
			});

			node.addEventListener("mouseleave", () => {
				this.tooltip.container.classList.remove("show");
				this.locked = false;
			});
		}

		set({
			title = null,
			description = null
		}) {
			if (title)
				this.title = title;

			if (description)
				this.description = description;
		}
	},

	SubWindow: class {
		/**
		 * @param {HTMLElement}				container 
		 * @param {HTMLElement|String}		content 
		 * @param {String}					color 
		 */
		constructor(container, content = "BLANK", color = "gray") {
			this.id = randString(6);
			this.showing = false;
			this.hideTimeout = null;
			this.container = container

			this.windowNode = document.createElement("div");
			this.windowNode.classList.add("subWindow", "hide");
			this.windowNode.dataset.id = this.id;
			this.color = color;

			this.contentNode = document.createElement("div");
			this.contentNode.classList.add("content");
			this.content = content;

			new ResizeObserver(() => this.update()).observe(this.contentNode);
	
			this.windowNode.appendChild(this.contentNode);
			this.container.appendChild(this.windowNode);
			navbar.subWindowLists.push(this);
		}

		update() {
			let height = (this.showing) ? this.contentNode.offsetHeight : 0;
			this.windowNode.style.height = `${height}px`;
			
			if (this.showing) {
				let containerRect = this.container.getBoundingClientRect();
				let width = this.contentNode.offsetWidth;
				let leftPos = containerRect.left;
	
				if ((leftPos + (containerRect.width / 2) + (width / 2)) <= window.innerWidth && (leftPos + (containerRect.width / 2) > (width / 2)))
					this.windowNode.dataset.align = "center";
				else if ((width - (leftPos + containerRect.width)) < 0)
					this.windowNode.dataset.align = "right";
				else if ((leftPos + width) <= window.innerWidth)
					this.windowNode.dataset.align = "left";
				else {
					this.windowNode.dataset.align = "full";
					this.windowNode.style.width = null;
					return;
				}
	
				this.windowNode.style.width = `${width}px`;
			}
		}

		show() {
			clearTimeout(this.hideTimeout);

			for (let item of navbar.subWindowLists)
				if (item.id !== this.id)
					item.hide(false);

			if (typeof sounds === "object")
				sounds.toggle()

			this.windowNode.classList.remove("hide");
			this.windowNode.classList.add("show");
			this.container.classList.add("active");

			this.showing = true;
			this.update();
		}

		hide(sound = true) {
			clearTimeout(this.hideTimeout);

			if (sound && typeof sounds === "object")
				sounds.toggle(1)

			this.windowNode.classList.remove("show");
			this.container.classList.remove("active");

			this.showing = false;
			this.update();

			this.hideTimeout = setTimeout(() => this.windowNode.classList.add("hide"), 300);
		}

		toggle() {
			(this.showing) ? this.hide() : this.show();
		}

		/**
		 * @param {string} color	Color
		 */
		set color(color) {
			this.windowNode.dataset.color = color;
		}

		/**
		 * @param {String|Element} content
		 */
		set content(content) {
			if (typeof content === "object" && content.classList) {
				emptyNode(this.contentNode);
				this.contentNode.appendChild(content);
			} else
				this.contentNode.innerHTML = content;
		}
	},

	Clickable: class {
		constructor(container, { onlyActive = false } = {}) {
			if (typeof container !== "object" || !container.appendChild)
				throw { code: -1, description: `navbar.Clickable(): container is not a valid node` }

			this.container = container;
			this.container.classList.add("clickable");
			this.handlers = []

			this.clickBox = document.createElement("div");
			this.clickBox.classList.add("clickBox");
			this.clickBox.addEventListener("click",
				() => (onlyActive)
					? this.active = true
					: this.toggle()
			);

			if (typeof sounds === "object")
				sounds.applySound(this.clickBox, ["soundhover", "soundselect"]);

			this.container.appendChild(this.clickBox);
		}

		setHandler(handler) {
			if (typeof handler !== "function")
				throw { code: -1, description: `navbar.Clickable.setHandler(): not a valid function` }

			return this.handlers.push(handler);
		}

		removeHandler(handler) {
			if (this.handlers[handler])
				this.handlers[handler] = undefined;
		}

		/**
		 * @param {Boolean}		active
		 */
		set active(active) {
			this.setActive(active);

			requestAnimationFrame(() => {
				for (let item of this.handlers)
					if (typeof item === "function")
						item(active);
			});
		}

		show() {
			this.active = true;
		}

		hide() {
			this.active = false;
		}

		setActive(active) {
			this.container.classList[active ? "add" : "remove"]("active")
		}

		toggle() {
			let isActive = !this.container.classList.contains("active");
			this.active = isActive;
		}
	},

	//? NAVIGATION BAR COMPONENT

	title({
		icon = "/api/images/icon",
		title = "App Name"
	} = {}) {
		let container = document.createElement("span");
		container.classList.add("component", "title");

		let iconNode = new lazyload({
			source: icon,
			classes: "icon"
		})

		let titleNode = document.createElement("t");
		titleNode.classList.add("title");
		titleNode.innerHTML = title;

		container.append(iconNode.container, titleNode);

		let navtip = new this.Tooltip(container, (arguments && arguments[0] && arguments[0].tooltip) ? arguments[0].tooltip : {})
		let click = new this.Clickable(container);

		return {
			container,
			tooltip: navtip,
			click,

			set({
				icon,
				title,
			}) {
				if (icon)
					iconNode.src = icon;

				if (title)
					titleNode.innerText = title;
			}
		}
	},

	iconButton({
		icon = "circle",
		color = document.body.classList.contains("dark") ? "dark" : "whitesmoke"
	} = {}) {
		let container = document.createElement("span");
		container.classList.add("component", "iconBtn");

		let iconNode = document.createElement("icon");
		iconNode.dataset.icon = icon;

		container.appendChild(iconNode);
		let background = triBg(container, { color, scale: 1, triangleCount: 8, speed: 6 });

		let navtip = new this.Tooltip(container, (arguments && arguments[0] && arguments[0].tooltip) ? arguments[0].tooltip : {})
		let click = new this.Clickable(container);

		return {
			container,
			tooltip: navtip,
			click,

			set({
				icon,
				color
			} = {}) {
				if (icon)
					iconNode.dataset.icon = icon;

				if (color)
					background.setColor(color);
			}
		}
	},

	menuButton({} = {}) {
		let container = document.createElement("span");
		container.classList.add("component", "menuBtn");

		let iconNode = document.createElement("span");
		iconNode.classList.add("hamburger");
		iconNode.innerHTML = `<span></span><span></span><span></span>`

		container.appendChild(iconNode);

		let navtip = new this.Tooltip(container, (arguments && arguments[0] && arguments[0].tooltip) ? arguments[0].tooltip : {})
		let click = new this.Clickable(container);

		return {
			container,
			tooltip: navtip,
			click
		}
	},

	switch({
		color = document.body.classList.contains("dark") ? "dark" : "whitesmoke"
	} = {}) {
		let container = document.createElement("span");
		container.classList.add("component", "switch");

		let indicator = document.createElement("div");
		indicator.classList.add("indicator");
		container.appendChild(indicator);

		let background = triBg(container, { color, scale: 1, triangleCount: 8, speed: 6 });
		let currentActive = null;

		return {
			container,

			button({
				icon = "circle"
			} = {}) {
				let button = document.createElement("icon");
				button.dataset.icon = icon;
				button.dataset.id = randString(4);

				let navtip = new navbar.Tooltip(button, (arguments && arguments[0] && arguments[0].tooltip) ? arguments[0].tooltip : {})
				let click = new navbar.Clickable(button, { onlyActive: true });

				click.setHandler((a) => {
					if (a) {
						if (currentActive && currentActive.id !== button.dataset.id) {
							currentActive.click.active = false;
							currentActive = null;
						}
	
						indicator.style.left = button.offsetLeft + "px";
						currentActive = { id: button.dataset.id, click }
					}
				});

				container.appendChild(button);

				return {
					button,
					navtip,
					click
				}
			},

			set({
				color = null
			} = {}) {
				if (color)
					background.setColor(color);
			}
		}
	},

	account({
		id = null,
		username = null,
		name = null,
		avatar = "/api/avatar",
		color = "brown"
	} = {}) {
		let container = document.createElement("span");
		container.classList.add("component", "account");

		let background = triBg(container, { color, scale: 1, triangleCount: 8, speed: 6 });

		let avatarNode = new lazyload({
			source: avatar,
			classes: ["avatar", "light"]
		})

		let nameNode = document.createElement("t");
		nameNode.classList.add("name");
		nameNode.innerHTML = name || "Khách";

		container.append(avatarNode.container, nameNode);

		let navtip = new this.Tooltip(container, (arguments && arguments[0] && arguments[0].tooltip) ? arguments[0].tooltip : {})
		let click = new this.Clickable(container);

		if (!name || !username)
			return {
				container,
				tooltip: navtip,
				click
			}
		
		// User profile With editing functionality
		//
		// This is utterly fucking stupid and I don't
		// like it. Someone please help
		let subWindow = new this.SubWindow(container);
		click.setHandler(() => subWindow.toggle());
		subWindow.color = "blue";

		let subAvatarNode = new lazyload({
			container: document.createElement("label"),
			source: avatar,
			classes: "avatar"
		});

		let subContainer = buildElementTree("div", "accountSettings", [
			{ type: "div", class: "header", name: "header", list: [
				{ type: "input", class: "input", name: "avatarInput" },
				{ name: "avatar", node: subAvatarNode.container },
				
				{ type: "span", class: "details", name: "details", list: [
					{ type: "t", class: "id", name: "userID", text: id || "Unknown" },
					{ type: "t", class: "name", name: "name", html: name }
				]}
			]},
			{ type: "div", class: "controls", name: "controls", list: [
				{ type: "span", class: "left", name: "left", list: [
					{ type: "icon", name: "edit", data: { icon: "arrowRight" } },
					{ type: "icon", name: "name", data: { icon: "user" } },
					{ type: "icon", name: "password", data: { icon: "key" } }
				]},

				{ type: "icon", name: "logout", data: { icon: "logout" } }
			]},
			{ type: "div", class: "edit", name: "edit", list: [
				{ type: "form", class: "nameForm", name: "name", list: [
					{ type: "t", class: "title", name: "formTitle", text: "Đổi Tên" },
					{ name: "input", node: createInput({ type: "text", label: "Tên Mới", color: "blue", autofill: false, require: true }) },
					{ name: "submit", node: createButton("Xác Nhận") }
				]},

				{ type: "form", class: "passForm", name: "password", list: [
					{ type: "t", class: "title", name: "formTitle", text: "Đổi Mật Khẩu" },
					{ name: "username", node: htmlToElement(`<input type="text" autocomplete="username" value="${username}" style="display: none;"></input>`) },
					{ name: "old", node: createInput({ type: "password", label: "Mật Khẩu Cũ", color: "blue", autofill: false, require: true }) },
					{ name: "new", node: createInput({ type: "password", label: "Mật Khẩu Mới", color: "blue", autofill: false, require: true }) },
					{ name: "reType", node: createInput({ type: "password", label: "Nhập Lại Mật Khẩu", color: "blue", autofill: false, require: true }) },
					{ name: "submit", node: createButton("Xác Nhận") }
				]}
			]}
		]);

		subWindow.content = subContainer.tree;
		subContainer = subContainer.obj;

		subContainer.controls.left.edit.title = "Chỉnh Sửa Thông Tin";
		subContainer.controls.logout.title = "Đăng Xuất";
		sounds.applySound(subContainer.controls.left.edit, ["soundhover", "soundselect"]);
		sounds.applySound(subContainer.controls.left.name, ["soundhover", "soundselect"]);
		sounds.applySound(subContainer.controls.left.password, ["soundhover", "soundselect"]);
		sounds.applySound(subContainer.controls.logout, ["soundhover", "soundselect"]);

		subContainer.header.avatarInput.type = "file";
		subContainer.header.avatarInput.accept = "image/*";
		subContainer.header.avatarInput.id = randString(8);
		subContainer.header.avatarInput.style.display = "none";
		subAvatarNode.container.htmlFor = subContainer.header.avatarInput.id;

		subContainer.edit.name.action = `javascript:void(0);`;
		subContainer.edit.password.action = `javascript:void(0);`;
		subContainer.edit.name.submit.type = "submit";
		subContainer.edit.password.submit.type = "submit";
		subContainer.edit.password.new.input.autocomplete = "new-password";
		subContainer.edit.password.reType.input.autocomplete = "new-password";

		let inputFocusTimeout = null;
		let logoutHandlers = []
		let changeAvatarHandlers = []
		let changeNameHandlers = []
		let changePasswordHandlers = []

		const changeAvatar = async (e) => {
			let file = (e.dataTransfer && e.dataTransfer.files[0])
				? e.dataTransfer.files[0]
				: (e.target.files && e.target.files[0])
					? e.target.files[0]
					: null;

			if (!file) {
				subAvatarNode.container.removeAttribute("data-state");
				return;
			}

			subAvatarNode.container.dataset.state = "load";

			try {
				for (let f of changeAvatarHandlers)
					await f(file);
			} catch(e) {
				subAvatarNode.container.removeAttribute("data-state");
				sounds.warning();
				
				throw e;
			} finally {
				e.target.value = "";
			}
			
			avatarNode.src = subAvatarNode.src = avatar;
			subAvatarNode.container.removeAttribute("data-state");
			sounds.notification();
		}

		subAvatarNode.container.addEventListener("dragenter", (e) => {
			e.stopPropagation();
			e.preventDefault();
			e.target.dataset.state = "drag";
		});

		subAvatarNode.container.addEventListener("dragleave", (e) => {
			e.stopPropagation();
			e.preventDefault();
			e.target.removeAttribute("data-state");
		});

		subAvatarNode.container.addEventListener("dragover", (e) => {
			e.stopPropagation();
            e.preventDefault();
            e.dataTransfer.dropEffect = "copy";
            e.target.dataset.state = "drag";
		});

		subAvatarNode.container.addEventListener("drop", (e) => {
			e.stopPropagation();
            e.preventDefault();
			changeAvatar(e);
		});

		subContainer.header.avatarInput.addEventListener("input", async (e) => await changeAvatar(e));

		const changeLayout = (layout) => {
			clearTimeout(inputFocusTimeout);
			subContainer.controls.left.name.classList[layout === 0 ? "add" : "remove"]("active");
			subContainer.controls.left.password.classList[layout === 1 ? "add" : "remove"]("active");
			subContainer.edit.dataset.layout = layout;

			inputFocusTimeout = setTimeout(() => {
				if (layout === 0)
					subContainer.edit.name.input.input.focus();
				else
					subContainer.edit.password.old.input.focus();
			}, 400);
		}

		const subShowEdit = () => {
			changeLayout(0);
			subContainer.controls.classList.add("showEdit");
			subContainer.edit.classList.add("show");
		}

		const subHideEdit = () => {
			subContainer.controls.classList.remove("showEdit");
			subContainer.edit.classList.remove("show");
		}

		const verifyPasswordInput = () => {
			let oldPass = subContainer.edit.password.old.input.value;
			let newPass = subContainer.edit.password.new.input.value;
			let reType = subContainer.edit.password.reType.input.value;
			let button = subContainer.edit.password.submit;

			if (reType !== "" && reType !== newPass) {
				button.disabled = true;
				button.dataset.color = "red";
				button.innerText = "Mật Khẩu Nhập Lại Không Khớp";
				subContainer.edit.password.reType.group.dataset.color = "red";

				return;
			} else {
				button.dataset.color = "blue";
				button.innerText = "Xác Nhận";
				subContainer.edit.password.reType.group.dataset.color = "blue";
			}

			if (oldPass === "" || newPass === "" || reType === "") {
				button.disabled = true;
				return;
			}

			button.disabled = false;
		}

		subContainer.controls.left.name.addEventListener("click", () => changeLayout(0));
		subContainer.controls.left.password.addEventListener("click", () => changeLayout(1));
		subContainer.controls.left.edit.addEventListener("click",
			() => subContainer.controls.classList.contains("showEdit")
				? subHideEdit()
				: subShowEdit()
		);
		
		subContainer.edit.name.input.input.addEventListener("input", (e) =>
			subContainer.edit.name.submit.disabled = !(e.target.value && e.target.value !== "")
		);

		subContainer.edit.password.old.input.addEventListener("input", () => verifyPasswordInput());
		subContainer.edit.password.new.input.addEventListener("input", () => verifyPasswordInput());
		subContainer.edit.password.reType.input.addEventListener("input", () => verifyPasswordInput());
		subContainer.edit.name.input.input.dispatchEvent(new Event("input"));
		verifyPasswordInput();

		subContainer.controls.logout.addEventListener("click", (e) => logoutHandlers.forEach(f => f(e)));

		subContainer.edit.name.submit.addEventListener("click", async (e) => {
			e.target.disabled = true;

			for (let f of changeNameHandlers)
				await f(subContainer.edit.name.input.input.value);

			subContainer.edit.name.input.input.value = "";
			subContainer.edit.name.input.input.dispatchEvent(new Event("input"));
		});

		subContainer.edit.password.submit.addEventListener("click", async (e) => {
			e.target.disabled = true;

			for (let f of changePasswordHandlers)
				await f(
					subContainer.edit.password.old.input.value,
					subContainer.edit.password.new.input.value
				);

			subContainer.edit.password.old.input.value = "";
			subContainer.edit.password.new.input.value = "";
			subContainer.edit.password.reType.input.value = "";
			verifyPasswordInput();
		});

		click.setHandler((a) => (a === false) ? subHideEdit() : "");
		changeLayout(0);

		return {
			container,
			subWindow,
			tooltip: navtip,
			click,

			set({
				name = null,
				avatar = null,
				color = null
			}) {
				if (name) {
					nameNode.innerHTML = name;
					subContainer.header.details.name.innerHTML = name;
				}

				if (avatar)
					avatarNode.src = avatar;

				if (color)
					background.setColor(color);
			},

			onChangeAvatar(f) {
				if (!f || typeof f !== "function")
					throw { code: -1, description: "navbar.account().onChangeAvatar(): not a valid function" }

				changeAvatarHandlers.push(f);
			},

			onChangeName(f) {
				if (!f || typeof f !== "function")
					throw { code: -1, description: "navbar.account().onChangeName(): not a valid function" }

				changeNameHandlers.push(f);
			},

			onChangePassword(f) {
				if (!f || typeof f !== "function")
					throw { code: -1, description: "navbar.account().onChangePassword(): not a valid function" }

				changePasswordHandlers.push(f);
			},

			onLogout(f) {
				if (!f || typeof f !== "function")
					throw { code: -1, description: "navbar.account().onLogout(): not a valid function" }

				logoutHandlers.push(f);
			}
		}
	},

	announcement({
		level = null,
		message = null,
		time = null,
	} = {}) {
		let container = document.createElement("span");
		container.classList.add("component", "announcement", "hide");

		let main = document.createElement("div");
		main.classList.add("main");

		let icon = document.createElement("span");
		icon.classList.add("icon");

		let levelText = document.createElement("t");
		levelText.classList.add("level");

		let wrapper = document.createElement("span");
		wrapper.classList.add("wrapper");

		let content = document.createElement("t");
		content.classList.add("content");

		wrapper.appendChild(content);
		main.append(icon, levelText, wrapper);
		container.appendChild(main);

		let navtip = new this.Tooltip(container, (arguments && arguments[0] && arguments[0].tooltip) ? arguments[0].tooltip : {})
		let click = new this.Clickable(container);
		let subWindow = new this.SubWindow(container);
		let subNodes = buildElementTree("div", "announcementDetail", [
			{ type: "span", class: "icon", name: "icon" },
			{ type: "t", class: "level", name: "level" },
			{ type: "t", class: "detail", name: "detail" },
			{ type: "div", class: "footer", name: "footer", list: [
				{ type: "span", class: "icon", name: "icon" },
				{ type: "t", class: "time", name: "time" },

				{ type: "button", class: ["sq-btn", "blue", "read"], name: "read", text: "Đánh Dấu Đã Đọc" }
			]}
		])

		subWindow.content = subNodes.tree;
		subNodes = subNodes.obj;

		//> CONTROL
		let animationTimeout = null;
		let markAsReadHandlers = []

		let levelDetail = {
			okay: "Hoàn Thành",
			info: "Thông Báo",
			warning: "Cảnh Báo",
			error: "Lỗi"
		}

		const show = () => {
			// RESET
			clearTimeout(animationTimeout);
			wrapper.removeAttribute("style");
			content.removeAttribute("style");
			levelText.removeAttribute("style");
			container.classList.remove("hide", "detail");
			requestAnimationFrame(() => container.classList.add("show"));

			animationTimeout = setTimeout(() => {
				levelText.style.width = `${levelText.scrollWidth}px`;
				levelText.style.opacity = 1;
				levelText.style.paddingLeft = `10px`;

				if (window.innerWidth >= 900)
					animationTimeout = setTimeout(() => {
						levelText.removeAttribute("style");
						container.classList.add("detail");
						subWindow.update()
						
						if (content.scrollWidth < 200)
							wrapper.style.width = `${content.scrollWidth}px`;
						else
							animationTimeout = setTimeout(() => {
								let duration = Math.max(content.innerText.split(" ").length * 0.6, 5);
								content.style.animationName = "announcement-scrolling";
								content.style.animationDuration = `${duration}s`;

								animationTimeout = setTimeout(() => {
									wrapper.removeAttribute("style");
									content.removeAttribute("style");

									levelText.style.width = `${levelText.scrollWidth}px`;
									levelText.style.opacity = 1;
									levelText.style.paddingLeft = `10px`;
									content.style.display = "none";
									container.classList.remove("detail");

									animationTimeout = setTimeout(() => subWindow.update(), 500);
								}, duration * 1000)
							}, 2000);
					}, 1000)
			}, 900)
		}

		const hide = () => {
			clearTimeout(animationTimeout);
			wrapper.removeAttribute("style");
			content.removeAttribute("style");
			levelText.removeAttribute("style");
			container.removeAttribute("data-level");
			container.classList.remove("detail");
			container.classList.remove("show");

			subWindow.hide();
			animationTimeout = setTimeout(() => container.classList.add("hide"), 1000);
		}

		const set = ({
			level,
			message,
			time
		} = {}) => {
			if (typeof level === "string") {
				subNodes.level.innerText = levelText.innerText = levelDetail[level] || level;
				subNodes.dataset.level = container.dataset.level = level;
				subWindow.color = {
					"okay": "green",
					"info": "gray",
					"warning": "yellow",
					"error": "red"
				}[level] || "gray";
			}
	
			if (typeof message === "string") {
				subNodes.detail.innerHTML = message;

				//? A Workaround to Allow <b> tag to display in preview mode only
				message = message
					.replace(/<b>/g, "/**")
					.replace(/<\/b>/g, "**\\");

				content.innerHTML = sanitizeHTML(message)
					.replace(/\/\*\*/g, "<b>")
					.replace(/\*\*\\/g, "</b>");
			}

			subNodes.footer.time.innerText = (time) ? (new Date(time * 1000)).toLocaleString() : "Không Rõ";

			if (level && message)
				show();
		}

		subNodes.footer.read.addEventListener("click", e => {
			for (let f of markAsReadHandlers)
				f(e);

			hide();
		});

		click.setHandler(() => subWindow.toggle());
		set({ level, message, time });

		return {
			container,
			subWindow,
			tooltip: navtip,
			click,

			show,
			hide,
			set,

			onRead: (f) => {
				if (typeof f !== "function")
					throw { code: -1, description: `navbar.announcement().onRead(): not a valid function` }

				markAsReadHandlers.push(f);
			}
		}
	}
}