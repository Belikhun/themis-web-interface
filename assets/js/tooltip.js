//? |-----------------------------------------------------------------------------------------------|
//? |  /assets/js/tooltip.js                                                                        |
//? |                                                                                               |
//? |  Copyright (c) 2018-2020 Belikhun. All right reserved                                         |
//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
//? |-----------------------------------------------------------------------------------------------|

const tooltip = {
	initialized: false,
	container: null,
	content: null,
	render: false,
	prevData: null,
	nodeToShow: null,
	hideTimeout: null,
	showTime: 200,

	hooks: [],

	init() {
		this.container = document.createElement("div");
		this.container.classList.add("tooltip");
		this.content = document.createElement("div");
		this.content.classList.add("content");
		this.container.append(this.content);

		document.body.insertBefore(this.container, document.body.childNodes[0]);

		//* EVENTS
		window.addEventListener("mousemove", e => this.mouseMove(e));

		//* BUILT IN HOOKS
		this.addHook({
			on: "dataset",
			key: "tip"
		})

		this.addHook({
			on: "attribute",
			key: "tooltip"
		})

		this.addHook({
			on: "attribute",
			key: "title",
			handler: ({ target, value }) => {
				target.setAttribute("tooltip", value);
				target.removeAttribute("title");

				return value;
			}
		})

		this.initialized = true;
	},

	addHook({
		on = null,
		key = null,
		handler = ({ target, value }) => value,
		priority = 1
	} = {}) {
		if (typeof on !== "string" || !["dataset", "attribute"].includes(on))
			throw { code: -1, description: `tooltip.addHook(): \"on\": unexpected '${on}', expecting 'dataset'/'attribute'` }

		if (typeof key !== "string")
			throw { code: -1, description: `tooltip.addHook(): \"key\" is not a valid string` }

		if (typeof handler !== "function")
			throw { code: -1, description: `tooltip.addHook(): \"handler\" is not a valid function` }

		if (typeof priority !== "number")
			throw { code: -1, description: `tooltip.addHook(): \"priority\" is not a valid number` }

		this.hooks.push({ on, key, handler, priority });
		this.hooks.sort((a, b) => (a.priority < b.priority) ? 1 : (a.priority > b.priority) ? -1 : 0);
	},

	__checkSameNode(node1, node2) {
		while (node1) {
			if (node1.isSameNode(node2))
				return true;

			node1 = node1.parentElement || null;
		}

		return false;
	},

	mouseMove(event) {
		if (this.nodeToShow) {
			clearTimeout(this.hideTimeout);
			
			if (!this.__checkSameNode(event.target, this.nodeToShow)) {
				this.nodeToShow = null;
				clearTimeout(this.hideTimeout);
				this.hideTimeout = setTimeout(() => this.container.classList.remove("show"), this.showTime);
			}
		} else
			for (let item of this.hooks) {
				let _v = null;

				switch (item.on) {
					case "dataset":
						if (typeof event.target.dataset[item.key] === "string")
							_v = event.target.dataset[item.key];
						break;
				
					case "attribute":
						_v = event.target.getAttribute(item.key);
						break;
				}

				if (!_v)
					continue;

				let _s = item.handler({
					target: event.target,
					value: _v
				});

				if (_s) {
					this.show(_s, event.target);
					break;
				}
			}

		this.container.style.left = `${event.clientX}px`;
		this.container.style.top = `${event.clientY}px`;

		if (!this.container.classList.contains("show"))
			return;

		if ((event.view.innerWidth - this.content.clientWidth) / Math.max(event.clientX, 1) < 1.4)
			this.container.classList.add("flip");
		else
			this.container.classList.remove("flip");
	},

	show(data, showOnNode) {
		if (!this.initialized)
			return false;

		if (showOnNode && showOnNode.classList)
			this.nodeToShow = showOnNode;

		this.container.classList.add("show");

		switch (typeof data) {
			case "object":
				if (data.classList && data.dataset) {
					if (this.prevData && (this.prevData.innerHTML === data.innerHTML))
						return true;

					emptyNode(this.content);
					this.content.append(data);

					break;
				}

				this.content.innerText = JSON.stringify(data, null, 4);
				break;

			default:
				if (this.prevData === data)
					return true;

				this.content.innerHTML = data;
				break;
		}

		//? TRIGGER REFLOW TO REPLAY ANIMATION
		this.container.style.animation = "none";

		requestAnimationFrame(() => {
			this.container.offsetHeight;
			this.container.style.animation = null;
			this.container.style.width = this.content.clientWidth + "px";
			this.container.style.height = this.content.clientHeight + "px";
		})

		this.prevData = data;

		return true;
	}
}