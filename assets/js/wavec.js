//? |-----------------------------------------------------------------------------------------------|
//? |  /assets/js/wavec.js                                                                          |
//? |                                                                                               |
//? |  Copyright (c) 2018-2020 Belikhun. All right reserved                                         |
//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
//? |-----------------------------------------------------------------------------------------------|

/**
 * Short for Wave Container.
 * I'm just lazy here
 */
const wavec = {
	container: HTMLElement.prototype,
	layer: HTMLElement.prototype,
	active: null,

	init(container) {
		if (typeof container !== "object" || !container.classList || !container.parentElement)
			throw { code: -1, description: `wavec.init(): container is not a valid node` }

		this.container = container;
		this.container.classList.add("waveContainer", "hide");

		this.layer = document.createElement("div");
		this.layer.classList.add("layer");
		this.layer.addEventListener("click", () => (this.active) ? this.active.hide() : "");

		this.container.appendChild(this.layer);
	},

	Container: class {
		constructor(content, {
			color = "default",
			icon = "circle",
			title = "sample container"
		} = {}) {
			this.container = buildElementTree("div", ["container", "hide"], [
				{ type: "div", class: "wave", name: "wave", html: `<span></span>`.repeat(4) },
				{ type: "div", class: "contentBox", name: "contentBox", list: [
					{ type: "div", class: "header", name: "header", list: [
						{ type: "icon", name: "icon" },
						{ type: "t", class: "title", name: "titleNode", text: title },

						{ type: "span", class: "buttons", name: "buttons", list: [
							{ type: "icon", class: "close", name: "close" },
							{ type: "icon", class: "reload", name: "reload" }
						]}
					]},

					{ type: "div", class: "content", name: "content" }
				]}
			]);

			wavec.container.appendChild(this.container.tree);
			this.container = this.container.obj;

			this.container.dataset.color = color;
			this.container.contentBox.header.icon.dataset.icon = icon;
			this.container.contentBox.header.buttons.close.dataset.icon = "close";
			this.container.contentBox.header.buttons.reload.dataset.icon = "reload";
			
			if (typeof sounds === "object") {
				sounds.applySound(this.container.contentBox.header.buttons.close, ["soundhoversoft", "soundselectsoft"]);
				sounds.applySound(this.container.contentBox.header.buttons.reload, ["soundhoversoft", "soundselectsoft"]);
			}

			this.content = content;
			this.showing = false;
			this.hideTimeout = null;

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

		show() {
			if (this.showing)
				return;

			if (wavec.active && wavec.active.showing)
				wavec.active.hide(true);

			clearTimeout(this.hideTimeout);
			wavec.container.classList.remove("hide");
			this.container.classList.remove("hide");
			wavec.active = this;

			if (typeof sounds === "object")
				sounds.toggle();

			requestAnimationFrame(() => {
				this.container.classList.add("show");
				wavec.layer.classList.add("show");
				this.showing = true;
			});
		}

		hide(showAnother = false) {
			if (!this.showing)
				return;

			clearTimeout(this.hideTimeout);

			if (!showAnother && typeof sounds === "object")
				sounds.toggle(1);

			requestAnimationFrame(() => {
				this.container.classList.remove("show");
				wavec.layer.classList.remove("show");
	
				this.hideTimeout = setTimeout(() => {
					this.container.classList.add("hide");

					if (!showAnother)
						wavec.container.classList.add("hide");

					this.showing = false;
				}, 500);
			});
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
	}
}