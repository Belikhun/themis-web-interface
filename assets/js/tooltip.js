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

	__wait: false,
	__handlingMouseEvent: false,

	init() {
		this.container = document.createElement("div");
		this.container.classList.add("tooltip");
		this.content = document.createElement("div");
		this.content.classList.add("content");
		this.container.append(this.content);

		document.body.insertBefore(this.container, document.body.childNodes[0]);

		//* EVENTS
		window.addEventListener("mousemove", e => {
			//? THROTTLE MOUSE EVENT
			if (!this.__wait && !this.__handlingMouseEvent) {
				this.__handlingMouseEvent = true;

				this.mouseMove(e);
				this.__wait = true;

				setTimeout(() => this.__wait = false, 50);
				this.__handlingMouseEvent = false;
			}
		});

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
		priority = 1,
		backtrace = 1
	} = {}) {
		if (typeof on !== "string" || !["dataset", "attribute"].includes(on))
			throw { code: -1, description: `tooltip.addHook(): \"on\": unexpected '${on}', expecting 'dataset'/'attribute'` }

		if (typeof key !== "string")
			throw { code: -1, description: `tooltip.addHook(): \"key\" is not a valid string` }

		if (typeof handler !== "function")
			throw { code: -1, description: `tooltip.addHook(): \"handler\" is not a valid function` }

		if (typeof priority !== "number")
			throw { code: -1, description: `tooltip.addHook(): \"priority\" is not a valid number` }

		this.hooks.push({ on, key, handler, priority, backtrace });
		this.hooks.sort((a, b) => (a.priority < b.priority) ? 1 : (a.priority > b.priority) ? -1 : 0);
	},

	__checkSameNode(node1, node2, maxCheck = 3) {
		let check = 1;

		while (node1) {
			if (check > maxCheck)
				return false;

			if (node1.isSameNode(node2))
				return true;

			check++;
			node1 = node1.parentElement || null;
		}

		return false;
	},

	mouseMove(event) {
		let checkNode = true;

		if (this.nodeToShow) {
			clearTimeout(this.hideTimeout);
			checkNode = false;
			
			if (!this.__checkSameNode(event.target, this.nodeToShow)) {
				this.nodeToShow = null;
				checkNode = true;

				this.hideTimeout = setTimeout(() => this.container.classList.remove("show"), this.showTime);
			}
		}

		if (checkNode)
			for (let item of this.hooks) {
				let _e = event.target;
				let _v = null;
				let _t = 0;

				while (_e && _t <= item.backtrace) {
					switch (item.on) {
						case "dataset":
							if (typeof _e.dataset[item.key] === "string")
								_v = _e.dataset[item.key];
							break;
					
						case "attribute":
							_v = _e.getAttribute(item.key);
							break;
					}

					if (_v)
						break;
					
					_e = _e.parentElement;
					_t++;
				}

				if (!_v)
					continue;

				let _s = item.handler({
					target: _e,
					value: _v
				});

				if (_s) {
					this.show(_s, _e);
					break;
				}
			}

		this.container.style.left = `${event.clientX}px`;
		this.container.style.top = `${event.clientY}px`;

		if (!this.container.classList.contains("show"))
			return;

		if ((event.view.innerWidth - this.content.clientWidth) / Math.max(event.clientX, 1) < 1.4 && (tRightPos = event.clientX - this.content.clientWidth))
			this.container.classList.add("flip");
		else
			this.container.classList.remove("flip");
	},

	show(data, showOnNode) {
		if (!this.initialized)
			return false;
		
		if (showOnNode && showOnNode.style)
			this.nodeToShow = showOnNode;
		
		clearTimeout(this.hideTimeout);
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