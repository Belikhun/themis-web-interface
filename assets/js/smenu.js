//? |-----------------------------------------------------------------------------------------------|
//? |  /assets/js/smenu.js                                                                          |
//? |                                                                                               |
//? |  Copyright (c) 2018-2020 Belikhun. All right reserved                                         |
//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
//? |-----------------------------------------------------------------------------------------------|

const smenu = {
	container: HTMLElement.prototype,
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
		if (typeof container !== "object" || !container.classList)
			throw { code: -1, description: `smenu.init(): container is not a valid node` }

		let tree = buildElementTree("div", ["smenuContainer", "hide"], [
			{ type: "div", class: "main", name: "main", list: [
				{ type: "div", class: "wrapper", name: "wrapper", list: [
					{ type: "div", class: "smenu", name: "smenu", list: [
						{ type: "t", class: "title", name: "menuTitle", text: title },	
						{ type: "t", class: "description", name: "menuDescription", text: description },
						{ type: "div", class: "searchBox", name: "search", list: [
							{ type: "input", class: "sq-input", name: "input" }
						]}
					]}
				]},

				{ type: "div", class: "navigator", name: "navigator" }
			]},

			{ type: "div", class: "panels", name: "panels", list: [
				{ type: "div", class: "underlay", name: "underlay" }
			]}
		])

		container.parentElement.replaceChild(tree.tree, container);
		this.container = tree.obj;
		
		let searchTimeout = null;
		
		this.container.main.wrapper.smenu.search.input.placeholder = "nhập để tìm kiếm";
		this.container.main.wrapper.smenu.search.input.addEventListener("input", (e) => {
			clearTimeout(searchTimeout);
			searchTimeout = setTimeout(() => this.filter(e.target.value), 200);
		});

		let navExpandTimeout = null;
		this.scroll = new Scrollable(this.container.main.wrapper.smenu);

		this.container.main.navigator.addEventListener("mouseenter",
			() => navExpandTimeout = setTimeout(() => {
				this.container.main.navigator.classList.add("expand");
			}, 1000)
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

	show() {
		if (!this.hiding && !this.collapsing)
			return;

		clearInterval(this.containerHideTimeout);
		this.container.classList.remove("hide");
		this.container.main.classList.remove("hide");
		this.container.main.classList.remove("collapse");

		requestAnimationFrame(() => {
			this.container.classList.add("show");
			this.hiding = false;
			this.collapsing = false;

			this.showHandlers.forEach(f => f());
		});
	},

	hide() {
		if (this.hiding)
			return;

		clearInterval(this.containerHideTimeout);
		this.container.classList.remove("show");

		if (this.activePanel)
			this.activePanel.hide(false);

		this.containerHideTimeout = setTimeout(() => this.container.classList.add("hide"), 600);
		this.hiding = true;

		this.hideHandlers.forEach(f => f());
	},

	collapse() {
		if (this.collapsing)
			return;

		clearInterval(this.mainHideTimeout);
		this.container.main.classList.add("collapse");

		this.mainHideTimeout = setTimeout(() => this.container.main.classList.add("hide"), 600);
		this.collapsing = true;
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

			this.toggler = document.createElement("span");
			this.toggler.classList.add("button");
			this.toggler.dataset.icon = icon;
			this.toggler.innerText = label;

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
			constructor({ text = "Sample Text" } = {}, child) {
				this.container = document.createElement("t");
				this.container.classList.add("component", "text");
				this.container.innerHTML = text;

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
		},

		Switch: class {
			constructor({
				label = "Sample Button",
				color = "blue",
				disabled = false,
				value = false,
				defaultValue = false
			} = {}, child) {
				this.container = document.createElement("div");
				this.container.classList.add("component", "switch");

				this.switch = createSwitch({ label, color });
				this.switch.input.disabled = disabled;
				this.container.appendChild(this.switch.group);

				this.defaultValue = defaultValue;
				this.changeHandlers = []
				this.switch.input.addEventListener("change", (e) => this.changeHandlers.forEach(f => f(e.target.checked)));

				this.onChange((value) => {
					if (value !== this.defaultValue)
						this.container.classList.add("changed");
					else
						this.container.classList.remove("changed");
				});

				this.set({ value });

				if (child) {
					if (!child.container || typeof child.insert !== "function")
						throw { code: -1, description: `smenu.components.Switch(): child is not a valid Child` }
	
					child.insert(this);
				}
			}

			set({
				label = null,
				color = null,
				disabled = null,
				value = null
			} = {}) {
				if (label)
					this.switch.title.innerText = label;

				if (color)
					this.switch.label.dataset.color = color;

				if (typeof value === "boolean") {
					this.switch.input.checked = value;
					this.switch.input.dispatchEvent(new Event("change"));
				}

				if (typeof disabled === "boolean")
					this.switch.input.disabled = disabled;
			}

			onChange(f) {
				if (!f || typeof f !== "function")
					throw { code: -1, description: "smenu.components.Switch().onChange(): not a valid function" }

				this.changeHandlers.push(f);
			}
		},

		Slider: class {
			constructor({
				label = "Sample Slider",
				color = "pink",
				value = 1,
				min = 0,
				max = 10,
				step = 1,
				valueStep = null,
				unit = null,
				defaultValue = 1,
				disabled = false
			} = {}, child) {
				this.container = document.createElement("div");
				this.container.classList.add("component", "slider");
				this.container.dataset.soundhoversoft = true;

				let header = document.createElement("div");
				header.classList.add("header");

				this.labelNode = document.createElement("t");
				this.labelNode.classList.add("label");
				this.labelNode.innerHTML = label;

				this.previewNode = document.createElement("t");
				this.previewNode.classList.add("preview");
				this.previewNode.innerText = "Unknown";

				this.slider = createSlider({ color, value, min, max, step });
				this.slider.input.disabled = disabled;
				this.onInput = this.slider.onInput;
				this.onChange = this.slider.onChange;

				this.defaultValue = defaultValue;
				this.valueStep = valueStep;
				this.unit = unit;

				this.onInput((value) => this.update(value));
				this.update(value, false);

				header.append(this.labelNode, this.previewNode);
				this.container.append(header, this.slider.group);

				if (child) {
					if (!child.container || typeof child.insert !== "function")
						throw { code: -1, description: `smenu.components.Slider(): child is not a valid Child` }
	
					child.insert(this);
				}
			}

			update(value, showTooltip = true) {
				let rVal = (this.valueStep && this.valueStep[value]) ? this.valueStep[value] : value;
				let sVal = rVal + ((this.unit) ? ` <b>${this.unit}</b>` : "");

				this.previewNode.innerHTML = sVal;

				if (value != this.defaultValue)
					this.container.classList.add("changed");
				else
					this.container.classList.remove("changed");
				
				if (showTooltip && tooltip && tooltip.initialized)
					tooltip.show(sVal, this.slider.input);
			}

			set({
				label = null,
				color = null,
				value = null,
				min = null,
				max = null,
				step = null,
				valueStep = null,
				unit = null,
				defaultValue = null,
				disabled = null
			} = {}) {
				if (label)
					this.labelNode.innerHTML = label;

				if (color)
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
				icon = null,
				complex = false
			} = {}, child) {
				this.container = document.createElement("div");
				this.container.classList.add("component", "button");

				this.button = createBtn(label, color);
				this.triBg = null;

				if (complex)
					this.triBg = triBg(this.button, { scale: 0.8, speed: 10, color: color });

				if (icon)
					this.button.appendChild(htmlToElement(`<icon class="left" data-icon="${icon}"/>`))

				this.container.appendChild(this.button);
				
				this.clickHandlers = []
				this.button.addEventListener("click", e => this.clickHandlers.forEach(f => f(e)));

				if (child) {
					if (!child.container || typeof child.insert !== "function")
						throw { code: -1, description: `smenu.components.Button(): child is not a valid Child` }
	
					child.insert(this);
				}
			}

			set({
				label = null,
				color = null,
				icon = null
			} = {}) {
				if (label)
					this.button.innerText = label;
				
				if (color)
					if (this.triBg)
						this.triBg.setColor(color);
					else
						this.button.dataset.color = color;

				if (icon)
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
		constructor(content, { type = "normal" } = {}) {
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
			this.container.dataset.size = type;

			this.hideTimeout = null;
			this.container.buttons.close.addEventListener("click", () => this.hide());
		}

		setToggler(button) {
			if (!button.container || typeof button.onClick !== "function")
				throw { code: -1, description: `smenu.Panel.getToggler(): not a valid Button` }

			button.onClick(() => this.show());
		}

		show() {
			clearTimeout(this.hideTimeout);

			if (smenu.activePanel)
				smenu.activePanel.hide();

			this.container.classList.remove("hide");
			smenu.activePanel = this;

			requestAnimationFrame(() => {
				smenu.collapse();
				this.container.classList.add("show");
			})
		}

		hide(callShowMenu = true) {
			clearTimeout(this.hideTimeout);

			this.container.classList.remove("show");
			smenu.activePanel = null;

			if (callShowMenu)
				smenu.show();

			this.hideTimeout = setTimeout(() => this.container.classList.add("hide"), 600);
		}
	}
}