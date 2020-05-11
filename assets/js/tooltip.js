//? |-----------------------------------------------------------------------------------------------|
//? |  /assets/js/tooltip.js                                                                        |
//? |                                                                                               |
//? |  Copyright (c) 2018-2020 Belikhun. All right reserved                                         |
//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
//? |-----------------------------------------------------------------------------------------------|

const tooltip = {
	initialized: false,
	node: null,
	render: false,
	prevData: null,
	nodeToShow: null,
	hideTimeout: null,
	hideTime: 1000,

	init() {
		this.node = document.createElement("div");
		this.node.classList.add("tooltip");

		document.body.insertBefore(this.node, document.body.childNodes[0]);

		//* EVENTS
		window.addEventListener("mousemove", e => this.mouseMove(e));

		this.initialized = true;
	},

	mouseMove(event) {
		if (this.nodeToShow)
			if (event.target.isSameNode(this.nodeToShow)) {
				clearTimeout(this.hideTimeout);
				this.node.classList.add("show");
			} else {
				this.nodeToShow = null;
				clearTimeout(this.hideTimeout);
				this.hideTimeout = setTimeout(() => this.node.classList.remove("show"), this.hideTime);
			}

		if (!this.node.classList.contains("show"))
			return;

		this.node.style.left = `${event.clientX}px`;
		this.node.style.top = `${event.clientY}px`;

		if (event.view.innerWidth / Math.max(event.clientX, 1) < 1.4)
			this.node.classList.add("flip");
		else
			this.node.classList.remove("flip");
	},

	show(data, showOnNode) {
		if (!this.initialized)
			return;

		if (showOnNode && showOnNode.classList)
			this.nodeToShow = showOnNode;

		this.node.classList.add("show");

		switch (typeof data) {
			case "object":
				if (data.classList && data.dataset) {
					if (this.prevData && (this.prevData.innerHTML === data.innerHTML))
						return;

					emptyNode(this.node);
					this.node.append(data);

					break;
				}

				this.node.innerText = JSON.stringify(data, null, 4);
				break;

			default:
				if (this.prevData === data)
					return;

				this.node.innerHTML = data;
				break;
		}

		//? TRIGGER REFLOW TO REPLAY ANIMATION
		this.node.style.animation = "none";

		setTimeout(() => {
			this.node.offsetHeight;
			this.node.style.animation = null;
		})

		this.prevData = data;
	}
}