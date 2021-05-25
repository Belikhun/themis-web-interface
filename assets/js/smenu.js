//? |-----------------------------------------------------------------------------------------------|
//? |  /assets/js/smenu.js                                                                          |
//? |                                                                                               |
//? |  Copyright (c) 2018-2021 Belikhun. All right reserved                                         |
//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
//? |-----------------------------------------------------------------------------------------------|

/**
 * Settings Menu
 * 
 * @author	@belivipro9x99
 * @version	v1.0
 * @license	MIT
 */
const smenu = {
	container: HTMLElement.prototype,
	initialized: false,
	groupLists: [],

	hiding: true,
	collapsing: true,
	containerHideTimeout: null,
	mainHideTimeout: null,
	activePanel: null,

	showHandlers: [],
	hideHandlers: [],

	/**
	 * @param {HTMLElement}		container
	 */
	init(container, {
		title = "settings",
		description = "Change how this application behaves"
	} = {}) {
		if (typeof container !== "object" || !container.classList || !container.parentElement)
			throw { code: -1, description: `smenu.init(): container is not a valid node` }

		let tree = buildElementTree("div", ["smenuContainer", "hide"], [
			{ type: "div", class: "main", name: "main", list: [
				{ type: "div", class: "wrapper", name: "wrapper", list: [
					{ type: "div", class: "smenu", name: "smenu", list: [
						{ type: "t", class: "title", name: "menuTitle", text: title },	
						{ type: "t", class: "description", name: "menuDescription", text: description },
						{ type: "div", class: "searchBox", name: "search", list: [
							{ type: "input", class: "flatInput", name: "input" }
						]}
					]}
				]},

				{ type: "div", class: "navigator", name: "navigator" }
			]},

			{ type: "div", class: "panels", name: "panels", list: [
				{ type: "div", class: "underlay", name: "underlay" }
			]}
		])

		tree.tree.id = container.id;
		container.parentElement.replaceChild(tree.tree, container);
		this.container = tree.obj;
		
		let searchTimeout;
		let navExpandTimeout;
		
		this.container.main.wrapper.smenu.search.input.placeholder = "nhập để tìm kiếm";
		this.container.main.wrapper.smenu.search.input.addEventListener("input", (e) => {
			clearTimeout(searchTimeout);
			searchTimeout = setTimeout(() => this.filter(e.target.value), 200);
		});

		if (typeof Scrollable === "function")
			this.scroll = new Scrollable(this.container.main.wrapper, {
				content: this.container.main.wrapper.smenu,
				scrollbar: false
			});
		
		this.container.main.navigator.addEventListener("mouseenter",
			() => navExpandTimeout = setTimeout(() => {
				this.container.main.navigator.classList.add("expand");
			}, 800)
		);

		this.container.main.navigator.addEventListener("mouseleave", () => {
			clearTimeout(navExpandTimeout);
			this.container.main.navigator.classList.remove("expand");
		});

		let ticking = false;
		this.container.main.wrapper.smenu.addEventListener("scroll", () => {
			if (!ticking) {
				requestAnimationFrame(() => {
					let haveActive = false;

					for (let group of this.groupLists) {
						if (haveActive)
							group.toggler.classList.remove("active");
						else if (group.updatePos())
							haveActive = true;
					}

					ticking = false;
				})

				ticking = true;
			}
		});

		this.container.panels.underlay.addEventListener("click", () => {
			if (this.activePanel)
				this.activePanel.hide();
			else
				this.hide();
		});

		this.initialized = true;
	},

	onShow(f) {
		if (!f || typeof f !== "function")
			throw { code: -1, description: "smenu.onShow(): not a valid function" }

		this.showHandlers.push(f);
	},

	onHide(f) {
		if (!f || typeof f !== "function")
			throw { code: -1, description: "smenu.onHide(): not a valid function" }

		this.hideHandlers.push(f);
	},

	show(isBack = true) {
		if (!this.initialized)
			throw { code: -1, description: "smenu.show(): smenu is not initialized!" }

		if (!this.hiding && !this.collapsing)
			return;

		clearInterval(this.containerHideTimeout);
		this.container.classList.remove("hide");
		this.container.main.classList.remove("hide");
		this.container.main.classList.remove("collapse");

		if (isBack && typeof sounds === "object")
			sounds.toggle();

		requestAnimationFrame(() => {
			this.container.classList.add("show");
			this.hiding = false;
			this.collapsing = false;

			this.showHandlers.forEach(f => f());
		});
	},

	hide() {
		if (!this.initialized)
			throw { code: -1, description: "smenu.hide(): smenu is not initialized!" }

		if (this.hiding)
			return;

		clearInterval(this.containerHideTimeout);
		this.container.classList.remove("show");

		if (typeof sounds === "object")
			sounds.toggle(1);

		if (this.activePanel)
			this.activePanel.hide(false);

		this.containerHideTimeout = setTimeout(() => this.container.classList.add("hide"), 600);
		this.hiding = true;

		this.hideHandlers.forEach(f => f());
	},

	collapse() {
		if (!this.initialized)
			throw { code: -1, description: "smenu.collapse(): smenu is not initialized!" }

		if (this.collapsing)
			return;

		clearInterval(this.mainHideTimeout);
		this.container.main.classList.add("collapse");

		this.mainHideTimeout = setTimeout(() => this.container.main.classList.add("hide"), 600);
		this.collapsing = true;
	},

	/**
	 * 
	 * @param {HTMLElement}	button
	 */
	setToggler(button) {
		button.addEventListener("mouseup", () => {
			if (this.hiding)
				this.show();
			else 
				this.hide();
		});

		this.onShow(() => button.classList.add("active"));
		this.onHide(() => button.classList.remove("active"));
	},

	/**
	 * @param {String}		keyword
	 */
	filter(keyword) {
		let tags = keyword
			.toLocaleLowerCase()
			.split(" ");

		for (let group of this.groupLists) {
			if (group.skipFilter)
				continue;

			let list = group.container.getElementsByClassName("component");
			let hidden = 0;

			for (let item of list) {
				let text = item.innerText.toLocaleLowerCase();
	
				for (let tag of tags)
					if (!text.includes(tag)) {
						item.style.display = "none";
						hidden++;
						text = null;
						break;
					}
	
				if (text)
					item.style.display = null;
			}

			if (hidden >= list.length)
				group.hide();
			else
				group.show();
		}
	},

	Group: class {
		constructor({
			icon = "circle",
			label = "Group"
		} = {}) {
			this.id = randString(8);
			this.animator = null;

			this.container = document.createElement("div");
			this.container.classList.add("group");
			this.container.dataset.id = this.id;

			this.title = document.createElement("t");
			this.title.classList.add("title");
			this.title.innerText = label;
			this.container.appendChild(this.title);

			this.toggler = document.createElement("icon");
			this.toggler.classList.add("button");
			this.toggler.dataset.icon = icon;
			this.toggler.innerText = label;

			if (typeof sounds === "object")
				sounds.applySound(this.toggler, ["soundhoversoft", "soundselectsoft"]);

			this.toggler.addEventListener("click", () => this.scrollTo());
			smenu.container.main.wrapper.smenu.appendChild(this.container);
			smenu.container.main.navigator.appendChild(this.toggler);
			requestAnimationFrame(() => smenu.container.main.wrapper.smenu.dispatchEvent(new Event("scroll")));

			smenu.groupLists.push(this);
		}

		hide() {
			this.container.style.display = "none";
		}

		show() {
			this.container.style.display = null;
		}

		/**
		 * @param {HTMLElement}			child 
		 * @param {Number}				order 
		 */
		insert(child, order) {
			if (typeof child !== "object" || (!child.classList && !child.container))
				throw { code: -1, description: `smenu.insert(): child is not a valid node/smenu.Child` }

			if (child.container)
				child = child.container;

			child.style.order = order;
			this.container.appendChild(child);
		}

		updatePos() {
			let yPos = this.container.getBoundingClientRect().y;
			let mHeight = smenu.container.offsetHeight + smenu.container.offsetTop;
			let cHeight = this.container.offsetHeight;

			if ((yPos < 0 && (yPos + cHeight - 100) > mHeight) || (yPos >= 0 && yPos <= (mHeight + 100))) {
				this.toggler.classList.add("active");
				return true;
			} else {
				this.toggler.classList.remove("active");
				return false;
			}
		}

		scrollTo() {
			let _c = smenu.container.main.wrapper.smenu;
			let maxScroll = _c.scrollHeight - _c.offsetHeight;

			if (maxScroll === 0)
				return;

			let current = _c.scrollTop;
			let target = this.container.offsetTop - 80;

			if (current === target)
				return;

			if (target > maxScroll)
				target = maxScroll;

			smenu.scroll.disabled = true;

			for (let anm of smenu.groupLists)
				if (anm.id !== this.id && anm.animator && anm.animator.cancel)
					anm.animator.cancel();

			this.animator = Animator(0.6, Easing.OutExpo, (t) => _c.scrollTop = current + (target - current) * t);

			this.animator.onComplete(() => {
				this.animator = null;
				smenu.scroll.disabled = false;
			});
		}
	},

	Child: class {
		constructor({ label = "Child" } = {}, group) {
			this.container = document.createElement("div");
			this.container.classList.add("child");

			this.title = document.createElement("t");
			this.title.classList.add("title");
			this.title.innerText = label;
			this.container.appendChild(this.title);

			if (group) {
				if (!group.container || typeof group.insert !== "function")
					throw { code: -1, description: `smenu.Child(): group is not a valid Group` }

				group.insert(this);
			}
		}

		/**
		 * @param {HTMLElement}			element
		 * @param {Number}				order
		 */
		insert(child, order) {
			if (typeof child !== "object" || (!child.classList && !child.container))
				throw { code: -1, description: `smenu.insert(): child is not a valid node/Component` }

			if (child.container)
				child = child.container;

			child.style.order = order;
			this.container.appendChild(child);
		}
	},

	//* ================= COMPONENTS =================

	components: {
		Text: class {
			constructor({ content = "Sample Text" } = {}, child) {
				this.container = document.createElement("t");
				this.container.classList.add("component", "text");
				this.content = content;

				if (child) {
					if (!child.container || typeof child.insert !== "function")
						throw { code: -1, description: `smenu.components.Text(): child is not a valid Child` }
	
					child.insert(this);
				}
			}

			onClick(f) {
				if (!f || typeof f !== "function")
					throw { code: -1, description: "smenu.components.Text().onClick(): not a valid function" }

				this.container.addEventListener("click", e => f(e));
			}

			/**
			 * @param {HTMLElement | String}	content
			 */
			set content(content) {
				if (typeof content === "object" && content.classList) {
					emptyNode(this.container);
					this.container.appendChild(content);
				} else
					this.container.innerHTML = content;
			}
		},

		Note: class {
			constructor({
				level = "info",
				message = "Sample Note"
			} = {}, child) {
				this.container = document.createElement("div");
				this.container.classList.add("component", "note");

				this.inner = document.createElement("span");
				this.inner.classList.add("inner");

				this.container.appendChild(this.inner);
				this.set({ level, message });

				if (child) {
					if (!child.container || typeof child.insert !== "function")
						throw { code: -1, description: `smenu.components.Note(): child is not a valid Child` }
	
					child.insert(this);
				}
			}

			set({
				level,
				message
			} = {}) {
				if (typeof level === "string")
					this.container.dataset.level = level;

				if (typeof message !== "undefined")
					if (typeof message === "object" && message.classList) {
						emptyNode(this.inner);
						this.inner.appendChild(message);
					} else
						this.inner.innerHTML = message;
			}
		},

		Space: class {
			constructor(child) {
				this.container = document.createElement("div");
				this.container.classList.add("component", "space");

				if (child) {
					if (!child.container || typeof child.insert !== "function")
						throw { code: -1, description: `smenu.components.Space(): child is not a valid Child` }
	
					child.insert(this);
				}
			}
		},

		Textbox: class {
			constructor({
				label = "Sample Textbox",
				type = "text",
				value = null,
				save = null,
				defaultValue = "sample value",
				onInput = null
			} = {}, child) {
				this.container = document.createElement("div");
				this.container.classList.add("component", "textbox");
				
				this.id = `smenu.components.Textbox.${randString(16)}`;
				this.labelNode = document.createElement("label");
				this.labelNode.innerHTML = label;
				this.labelNode.htmlFor = this.id;

				this.input = document.createElement("input");
				this.input.classList.add("flatInput");
				this.input.id = this.id;
				this.input.type = type;
				this.input.placeholder = defaultValue;

				this.defaultValue = defaultValue;
				this.save = save;

				this.inputHandlers = []
				this.input.addEventListener("input", () => {
					let value = this.input.type === "number" ? parseInt(this.input.value) : this.input.value;
					this.inputHandlers.forEach(f => f(value));
				});

				this.inputHandlers.push((value) => {
					if (this.save)
						localStorage.setItem(this.save, value);

					if (value !== this.defaultValue)
						this.container.classList.add("changed");
					else
						this.container.classList.remove("changed");
				});

				if (typeof onInput === "function")
					this.inputHandlers.push(onInput);

				this.container.append(this.labelNode, this.input);

				let savedValue = localStorage.getItem(this.save);
				if (savedValue === null)
					this.set({ value: (["number", "string"].includes(typeof value)) ? value : defaultValue || "" });
				else
					this.set({ value: savedValue });

				if (child) {
					if (!child.container || typeof child.insert !== "function")
						throw { code: -1, description: `smenu.components.Textbox(): child is not a valid Child` }
	
					child.insert(this);
				}
			}

			set({
				label,
				disabled,
				value
			} = {}) {
				if (typeof label === "string")
					this.labelNode.innerHTML = label;

				if (typeof disabled === "boolean")
					this.input.disabled = disabled;

				if (typeof value !== "undefined") {
					this.input.value = value;
					this.input.dispatchEvent(new Event("input"));
				}
			}

			onInput(f) {
				if (!f || typeof f !== "function")
					throw { code: -1, description: "smenu.components.Textbox().onInput(): not a valid function" }

				this.inputHandlers.push(f);
				f(this.input.type === "number" ? parseInt(this.input.value) : this.input.value);
			}
		},

		Checkbox: class {
			constructor({
				label = "Sample Button",
				color = "blue",
				disabled = false,
				value = null,
				save = null,
				defaultValue = false,
				onChange = null
			} = {}, child) {
				this.container = document.createElement("div");
				this.container.classList.add("component", "checkbox");

				this.checkbox = createCheckbox({ label, color });
				this.checkbox.input.disabled = disabled;
				this.container.appendChild(this.checkbox.group);

				this.defaultValue = defaultValue;
				this.save = save;

				this.changeHandlers = []
				this.checkbox.input.addEventListener("change", async (e) => {
					this.checkbox.input.disabled = true;

					for (let f of this.changeHandlers)
						await f(this.checkbox.input.checked);

					this.checkbox.input.disabled = false;
				});

				this.changeHandlers.push((value) => {
					if (this.save)
						localStorage.setItem(this.save, value);

					if (value !== this.defaultValue)
						this.container.classList.add("changed");
					else
						this.container.classList.remove("changed");
				});

				if (typeof onChange === "function")
					this.changeHandlers.push(onChange);

				let savedValue = localStorage.getItem(this.save);
				if (savedValue === null)
					this.set({ value: (typeof value === "boolean") ? value : defaultValue || false });
				else
					this.set({ value: (savedValue === "true") });

				if (child) {
					if (!child.container || typeof child.insert !== "function")
						throw { code: -1, description: `smenu.components.Checkbox(): child is not a valid Child` }
	
					child.insert(this);
				}
			}

			set({
				label,
				color,
				disabled,
				value
			} = {}) {
				if (typeof label === "string")
					this.checkbox.title.innerText = label;

				if (typeof color === "string")
					this.checkbox.label.dataset.color = color;

				if (typeof value === "boolean") {
					this.checkbox.input.checked = value;
					this.checkbox.input.dispatchEvent(new Event("change"));
				}

				if (typeof disabled === "boolean")
					this.checkbox.input.disabled = disabled;
			}

			onChange(f) {
				if (!f || typeof f !== "function")
					throw { code: -1, description: "smenu.components.Checkbox().onChange(): not a valid function" }

				this.changeHandlers.push(f);
				f(this.checkbox.input.checked);
			}
		},

		Choice: class {
			constructor({
				label = "Sample Choice Box",
				color = "blue",
				choice,
				value,
				save,
				defaultValue,
				onChange
			} = {}, child) {
				this.container = document.createElement("div");
				this.container.classList.add("component", "choice");

				this.labelNode = document.createElement("t");
				this.labelNode.classList.add("label");

				this.choiceBox = document.createElement("div");
				this.choiceBox.classList.add("choiceBox");

				this.container.append(this.labelNode, this.choiceBox);
				this.choiceNodes = {}
				this.activeNode = null;
				this.activeValue = null;
				this.changeHandlers = []
				this.save = save;
				this.defaultValue = defaultValue;

				let savedValue = localStorage.getItem(this.save);
				if (savedValue === null)
					value = (typeof value === "number") ? value : defaultValue;
				else
					value = parseInt(savedValue);

				if (typeof onChange === "function")
					this.onChange(onChange);

				this.set({ label, color, choice, value });

				if (child) {
					if (!child.container || typeof child.insert !== "function")
						throw { code: -1, description: `smenu.components.Choice(): child is not a valid Child` }
	
					child.insert(this);
				}
			}

			onChange(f) {
				if (typeof f !== "function")
					throw { code: -1, description: `smenu.components.Choice().onChange(): not a valid function` }

				this.changeHandlers.push(f);
			}

			set({
				label,
				color,
				choice,
				value
			} = {}) {
				if (typeof label === "string")
					this.labelNode.innerHTML = label;

				if (typeof color === "string")
					this.container.dataset.color = color;

				if (typeof choice === "object") {
					this.choiceNodes = {}
					this.activeNode = null;
					this.activeValue = null;

					for (let key of Object.keys(choice)) {
						let node = document.createElement("icon");
						node.dataset.icon = choice[key].icon || "circle";
						
						if (typeof choice[key].title === "string")
							node.title = choice[key].title;

						this.choiceBox.appendChild(node);
						this.choiceNodes[key] = node;
						node.addEventListener("click", () => this.setValue(key));
					}
				}

				if (typeof value !== "undefined")
					this.setValue(value);
			}

			setValue(value) {
				if (value === this.activeValue)
					return;

				if (!this.choiceNodes[value])
					return;

				if (this.activeNode)
					this.activeNode.classList.remove("active");

				this.choiceNodes[value].classList.add("active");
				this.activeValue = value;
				this.activeNode = this.choiceNodes[value];
				this.changeHandlers.forEach(f => f(value, this));
			}
		},

		Slider: class {
			constructor({
				label = "Sample Slider",
				color = "pink",
				min = 0,
				max = 10,
				step = 1,
				value = null,
				save = null,
				unit = null,
				valueStep = null,
				defaultValue = 1,
				disabled = false,
				onChange = null,
				onInput = null
			} = {}, child) {
				this.container = document.createElement("div");
				this.container.classList.add("component", "slider");

				let header = document.createElement("div");
				header.classList.add("header");

				this.labelNode = document.createElement("t");
				this.labelNode.classList.add("label");
				this.labelNode.innerHTML = label;

				this.previewNode = document.createElement("t");
				this.previewNode.classList.add("preview");
				this.previewNode.innerText = "Unknown";

				this.defaultValue = defaultValue;
				this.valueStep = valueStep;
				this.unit = unit;
				this.save = save;

				let savedValue = localStorage.getItem(this.save);
				if (savedValue === null)
					value = (typeof value === "number") ? value : defaultValue;
				else
					value = parseInt(savedValue);

				this.slider = createSlider({ color, value, min, max, step });
				this.slider.input.disabled = disabled;

				/** @type {Function} */
				this.onInput = this.slider.onInput;

				/** @type {Function} */
				this.onChange = this.slider.onChange;

				header.append(this.labelNode, this.previewNode);
				this.container.append(header, this.slider.group);

				this.onInput((value) => this.update(value));
				this.update(value, false);

				if (typeof onInput === "function")
					this.onInput(onInput);

				if (typeof onChange === "function")
					this.onChange(onChange);

				if (child) {
					if (!child.container || typeof child.insert !== "function")
						throw { code: -1, description: `smenu.components.Slider(): child is not a valid Child` }
	
					child.insert(this);
				}
			}

			update(value, showTooltip = true) {
				if (this.save)
					localStorage.setItem(this.save, value);

				let rVal = (this.valueStep && (typeof this.valueStep[value] !== "undefined"))
					? this.valueStep[value]
					: value;

				let sVal = (typeof rVal === "boolean")
					? ((rVal) ? "BẬT" : "TẮT")
					: rVal + ((this.unit) ? ` <b>${this.unit}</b>` : "");

				this.previewNode.innerHTML = sVal;

				if (value != this.defaultValue)
					this.container.classList.add("changed");
				else
					this.container.classList.remove("changed");
				
				if (showTooltip && typeof tooltip === "object" && tooltip.initialized === true)
					tooltip.show(sVal, this.slider.input);
			}

			set({
				label,
				color,
				value,
				min,
				max,
				step,
				valueStep,
				unit,
				defaultValue,
				disabled
			} = {}) {
				if (typeof label === "string")
					this.labelNode.innerHTML = label;

				if (typeof color === "string")
					this.slider.group.dataset.color = color;

				for (let key of ["value", "min", "max", "step"])
					if (typeof arguments[0][key] === "number") {
						this.slider.input[key] = arguments[0][key];
						this.slider.input.dispatchEvent(new Event("input"));
					}

				for (let key of ["valueStep", "unit", "defaultValue"])
					if (arguments[0][key]) {
						this[key] = arguments[0][key];
						this.update(this.slider.input.value, false);
					}

				if (typeof disabled === "boolean")
					this.slider.input.disabled = disabled;
			}
		},

		Button: class {
			constructor({
				label = "Sample Button",
				color = "blue",
				icon,
				complex = false,
				onClick
			} = {}, child) {
				this.container = document.createElement("div");
				this.container.classList.add("component", "button");

				this.button = createButton(label, { color, icon, complex });
				this.container.appendChild(this.button);
				
				this.clickHandlers = []
				this.button.addEventListener("click", async (e) => {
					this.button.disabled = true;

					for (let f of this.clickHandlers)
						await f(e);

					this.button.disabled = false;
				});

				if (typeof onClick === "function")
					this.clickHandlers.push(onClick);

				if (child) {
					if (!child.container || typeof child.insert !== "function")
						throw { code: -1, description: `smenu.components.Button(): child is not a valid Child` }
	
					child.insert(this);
				}
			}

			set({
				label,
				color,
				icon
			} = {}) {
				if (typeof label === "string")
					this.button.innerText = label;
				
				if (typeof color === "string")
					if (this.triBg)
						this.button.dataset.triColor = color;
					else
						this.button.dataset.color = color;

				if (typeof icon === "string")
					this.button.dataset.icon = icon;
			}

			onClick(f) {
				if (!f || typeof f !== "function")
					throw { code: -1, description: "smenu.components.Button().onClick(): not a valid function" }

				this.clickHandlers.push(f);
			}
		},

		Footer: class {
			constructor({
				icon = "/assets/img/icon.webp",
				appName = "An Censored App",
				version = "1.0.0"
			} = {}, child) {
				this.container = buildElementTree("div", ["component", "footer"], [
					{ type: "img", class: "icon", name: "icon" },
					{ type: "t", class: "name", name: "name" },
					{ type: "t", class: "version", name: "version" }
				]).obj;

				this.container.icon.src = icon;
				this.container.name.innerText = appName;
				this.container.version.innerText = version;
				this.skipFilter = true;

				if (child) {
					if (!child.container || typeof child.insert !== "function")
						throw { code: -1, description: `smenu.components.Footer(): child is not a valid Child` }
	
					child.insert(this);
				}
			}
		}
	},

	Panel: class {
		constructor(content, { size = "normal" } = {}) {
			this.container = buildElementTree("div", ["panel", "hide"], [
				{ type: "span", class: "buttons", name: "buttons", list: [
					{ type: "span", class: "reload", name: "reload" },
					{ type: "span", class: "close", name: "close" },
					{ type: "span", name: "custom" }
				]},

				{ type: "span", class: "main", name: "main" }
			])

			smenu.container.panels.appendChild(this.container.tree);
			this.container = this.container.obj;
			this.container.dataset.size = size;

			/**
			 * @type {HTMLIFrameElement}
			 */
			this.iframe = undefined;

			this.hideTimeout = null;
			this.container.buttons.close.addEventListener("click", () => this.hide());

			if (content)
				this.content(content);

			this.reload.onClick(() => (this.iframe) ? this.iframe.contentWindow.location.reload() : 0);
		}

		/**
		 * @param {HTMLElement|String}	content
		 */
		set content(content) {
			this.content(content);
		}

		/**
		 * @param {HTMLElement|String}	content
		 */
		content(content) {
			return new Promise((resolve) => {
				if (this.iframe) {
					this.container.main.removeChild(this.iframe);
					delete this.iframe;
				}
	
				emptyNode(this.container.main);
				let re = null;
	
				if (typeof content === "object" && content.classList)
					this.container.main.appendChild(content);
				else if ((re = /iframe:(.+)/gm.exec(content)) !== null) {
					this.iframe = document.createElement("iframe");
					this.iframe.src = (re[1][0] === "/") ? `${location.protocol}//${location.hostname}${re[1]}` : re[1];
					this.container.main.appendChild(this.iframe);

					this.iframe.addEventListener("load", () => resolve());
					return;
				} else
					this.container.main.innerHTML = content;
				
				resolve();
				return;
			})
		}

		get reload() {
			let button = this.container.buttons.reload;

			return {
				button,

				onClick(f) {
					if (!f || typeof f !== "function")
						throw { code: -1, description: "smenu.Panel().reload.onClick(): not a valid function" }

					button.addEventListener("click", f);
				},
			}
		}

		get custom() {
			let button = this.container.buttons.custom;

			return {
				button,

				type(type) {
					button.className = `custom ${type}`;
				},

				onClick(f) {
					if (!f || typeof f !== "function")
						throw { code: -1, description: "smenu.Panel().custom.onClick(): not a valid function" }

					button.addEventListener("click", f);
				},
			}
		}

		/**
		 * @param {smenu.Button}	button
		 */
		setToggler(button) {
			if (!button.container || typeof button.onClick !== "function")
				throw { code: -1, description: `smenu.Panel.setToggler(): not a valid Button` }

			button.onClick(() => this.show());
		}

		show() {
			clearTimeout(this.hideTimeout);

			if (smenu.activePanel)
				smenu.activePanel.hide();

			this.container.classList.remove("hide");
			smenu.activePanel = this;

			if (typeof sounds === "object")
				sounds.toggle();

			requestAnimationFrame(() => {
				smenu.collapse();
				this.container.classList.add("show");
			})
		}

		hide(callShowMenu = true) {
			clearTimeout(this.hideTimeout);

			this.container.classList.remove("show");
			smenu.activePanel = null;

			if (typeof sounds === "object")
				sounds.toggle(1);

			if (callShowMenu)
				smenu.show(false);

			this.hideTimeout = setTimeout(() => this.container.classList.add("hide"), 600);
		}
	}
}