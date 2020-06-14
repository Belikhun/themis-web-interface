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
	hideTime: 300,

	init() {
		this.container = document.createElement("div");
		this.container.classList.add("tooltip");
		this.content = document.createElement("div");
		this.content.classList.add("content");
		this.container.append(this.content);

		document.body.insertBefore(this.container, document.body.childNodes[0]);

		//* EVENTS
		window.addEventListener("mousemove", e => this.mouseMove(e));

		this.initialized = true;
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
				this.hideTimeout = setTimeout(() => this.container.classList.remove("show"), this.hideTime);
			}
		} else if (event.target.dataset.tip)
			this.show(event.target.dataset.tip, event.target);
		else if(event.target.getAttribute("tooltip"))
			this.show(event.target.getAttribute("tooltip"), event.target);
		else if (event.target.title) {
			event.target.setAttribute("tooltip", event.target.title);
			this.show(event.target.title, event.target);
			
			event.target.removeAttribute("title");
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
			return;

		if (showOnNode && showOnNode.classList)
			this.nodeToShow = showOnNode;

		this.container.classList.add("show");

		switch (typeof data) {
			case "object":
				if (data.classList && data.dataset) {
					if (this.prevData && (this.prevData.innerHTML === data.innerHTML))
						return;

					emptyNode(this.content);
					this.content.append(data);

					break;
				}

				this.content.innerText = JSON.stringify(data, null, 4);
				break;

			default:
				if (this.prevData === data)
					return;

				this.content.innerHTML = data;
				break;
		}

		//? TRIGGER REFLOW TO REPLAY ANIMATION
		this.container.style.animation = "none";

		setTimeout(() => {
			this.container.offsetHeight;
			this.container.style.animation = null;
			this.container.style.width = this.content.clientWidth + "px";
			this.container.style.height = this.content.clientHeight + "px";
		})

		this.prevData = data;
	}
}