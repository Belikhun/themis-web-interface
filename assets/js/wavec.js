//? |-----------------------------------------------------------------------------------------------|
//? |  /assets/js/wavec.js                                                                          |
//? |                                                                                               |
//? |  Copyright (c) 2018-2021 Belikhun. All right reserved                                         |
//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
//? |-----------------------------------------------------------------------------------------------|

/**
 * Wave Container.
 * (Very Epic)
 * 
 * Require wavec.css
 */
const wavec = {
	container: HTMLElement.prototype,
	layer: HTMLElement.prototype,
	active: [],

	init(container) {
		if (typeof container !== "object" || !container.classList || !container.parentElement)
			throw { code: -1, description: `wavec.init(): container is not a valid node` }

		this.container = container;
		this.container.classList.add("waveContainer", "hide");

		this.layer = document.createElement("div");
		this.layer.classList.add("layer");
		this.layer.addEventListener("click", () => (this.active.length > 0) ? this.active[this.active.length - 1].hide() : "");

		this.container.appendChild(this.layer);
	},

	Container: class {
		constructor(content, {
			color = "default",
			icon = "circle",
			title = "sample container"
		} = {}) {
			/**
			 * Handlers for toggle event
			 * @type {Array}
			 */
			this.toggleHandlers = []

			/**
			 * Handlers for reload event
			 * @type {Array}
			 */
			this.reloadHandlers = []

			this.container = makeTree("div", ["container", "hide"], {
				wave: { tag: "div", class: "wave", html: `<span></span>`.repeat(4) },
				contentBox: { tag: "div", class: "contentBox", child: {
					wrapper: { tag: "div", class: "wrapper", child: {
						spinner: { tag: "span", class: "simpleSpinner" }
					}},

					header: { tag: "div", class: "header", child: {
						icon: { tag: "icon" },
						titleNode: { tag: "t", class: "title", text: title },

						buttons: { tag: "span", class: "buttons", child: {
							close: { tag: "icon", class: "close" },
							reload: { tag: "icon", class: "reload" }
						}}
					}},

					content: { tag: "div", class: "content" }
				}}
			});

			wavec.container.appendChild(this.container);
			this.container.dataset.color = color;
			this.container.contentBox.header.icon.dataset.icon = icon;
			this.container.contentBox.header.buttons.close.dataset.icon = "close";
			this.container.contentBox.header.buttons.reload.dataset.icon = "reload";
			
			if (typeof sounds === "object") {
				sounds.applySound(this.container.contentBox.header.buttons.close, ["soundhoversoft", "soundselectsoft"]);
				sounds.applySound(this.container.contentBox.header.buttons.reload, ["soundhoversoft", "soundselectsoft"]);
			}
			
			if (typeof Scrollable === "function")
				new Scrollable(this.container.contentBox, {
					content: this.container.contentBox.content
				});
			
			this.content = content;
			this.showing = false;
			this.stackPos = null;
			this.hideTimeout = null;

			this.container.contentBox.header.buttons.reload.addEventListener("click", () => this.reloadHandlers.forEach(f => f()));
			this.container.contentBox.header.buttons.close.addEventListener("click", () => this.hide());
		}

		set({
			color = undefined,
			icon = undefined,
			title = undefined
		} = {}) {
			if (color)
				this.container.dataset.color = color;

			if (icon)
				this.container.contentBox.header.icon.dataset.icon = icon;

			if (title)
				this.container.contentBox.header.titleNode.innerText = title;
		}

		onToggle(f) {
			if (typeof f !== "function")
				throw { code: -1, description: `wavec.Container().onToggle(): not a valid function` }

			return this.toggleHandlers.push(f);
		}

		onReload(f) {
			if (typeof f !== "function")
				throw { code: -1, description: `wavec.Container().onReload(): not a valid function` }

			return this.reloadHandlers.push(f);
		}

		show() {
			if (this.showing)
				return;

			clearTimeout(this.hideTimeout);
			this.showing = true;

			wavec.container.classList.remove("hide");
			this.container.classList.remove("hide");
			this.stackPos = wavec.active.push(this) - 1;
			this.container.style.zIndex = this.stackPos;

			if (typeof sounds === "object")
				sounds.toggle();

			this.toggleHandlers.forEach(f => f(true));
			requestAnimationFrame(() => {
				this.container.classList.add("show");
				wavec.layer.classList.add("show");
			});
		}

		async hide() {
			if (!this.showing)
				return;

			clearTimeout(this.hideTimeout);
			this.showing = false;

			if (typeof sounds === "object")
				sounds.toggle(1);

			await nextFrameAsync();
			this.container.classList.remove("show");

			// Only hide the wavec layer if there is one active
			// container left
			if (wavec.active.length === 1)
				wavec.layer.classList.remove("show");
	
			this.toggleHandlers.forEach(f => f(false));
			this.hideTimeout = setTimeout(() => {
				this.container.classList.add("hide");

				// Only hide the wavec main container if there
				// is one active container left
				if (wavec.active.length === 1)
					wavec.container.classList.add("hide");
				
				wavec.active.splice(this.stackPos, 1);
			}, 600);
		}

		setToggler(button) {
			if (!button.container || typeof button.onClick !== "function")
				throw { code: -1, description: `wavec.Container.setToggler(): not a valid Button` }

			button.onClick((a) => a ? this.show() : this.hide());
		}

		/**
		 * @param {String | Node} content
		 */
		set content(content) {
			emptyNode(this.container.contentBox.content);

			if (typeof content === "object" && content.classList)
				this.container.contentBox.content.appendChild(content);
			else
				this.container.contentBox.content.innerHTML = content;
		}

		/**
		 * @param {Boolean} loading
		 */
		set loading(loading) {
			if (loading)
				this.container.classList.add("loading");
			else
				this.container.classList.remove("loading");
		}

		/**
		 * @returns {HTMLDivElement}
		 */
		get content() {
			return this.container.contentBox.content;
		}
	}
}