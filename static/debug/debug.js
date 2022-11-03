
const debug = {
	params: {
		fonts: {},
		active: "",
		text: ""
	},

	/** @type {HTMLDivElement} */
	container: undefined,

	/** @type {Function} */
	moveHandler: undefined,

	minimized: true,

	init() {
		let fontSelect = createSelectInput({
			icon: "font",
			options: this.params.fonts,
			value: this.params.active
		});

		fontSelect.onChange((value) => {
			if (value === this.params.active)
				return;

			location.href = this.updateURLParameter(location.href, "font", value);
		});

		let clearCache = createButton("clear cache", {
			color: "pink",
			style: "round",
			complex: true
		});

		clearCache.addEventListener("click", async () => {
			clearCache.loading(true);
			let response = await myajax({ url: "/api/admin/cache", method: "DELETE" });
			clearCache.loading(false);
			clearCache.changeText(response.description);
		});

		// DEBUG PANEL
		this.container = makeTree("div", ["debug", "minimize"], {
			header: { tag: "div", class: "header", child: {
				wTitle: { tag: "span", class: "title", text: "DEBUG" },
				minimize: { tag: "span", class: "mini", text: "-" }
			}},

			dbgTexts: { tag: "pre", text: this.params.text },
			font: fontSelect,
			clearCache
		});

		this.container.header.minimize.addEventListener("click", () => {
			this.minimized = !this.minimized;
			this.container.classList[this.minimized ? "add" : "remove"]("minimize");
			this.container.header.minimize.innerText = this.minimized ? "+" : "-";
		});

		this.container.id = "debug";
		document.body.insertBefore(this.container, document.body.firstChild);

		// Make panel movable
		let lastX = localStorage.getItem("debug.posX");
		let lastY = localStorage.getItem("debug.posY");

		if (lastX && lastY) {
			this.container.style.left = `${lastX}%`;
			this.container.style.top = `${lastY}%`;
		}

		this.container.header.addEventListener("mousedown", (event) => this.startMove(event));
		this.container.addEventListener("mouseup", (event) => this.endMove(event));
	},

	/**
	 * Handle mouse move for debug box;
	 * @param	{MouseEvent}	event
	 */
	startMove(event) {
		if (this.moveHandler)
			this.endMove();

		event = event || window.event;
		let bRect = document.body.getBoundingClientRect();
		let cRect = this.container.getBoundingClientRect();

		let posX = event.clientX,
			posY = event.clientY,
			divTop = cRect.top - bRect.top,
			divLeft = cRect.left,
			eWi = this.container.clientWidth,
			eHe = this.container.clientHeight;

		let diffX = posX - divLeft,
			diffY = posY - divTop;
		
		this.moveHandler = (e) => {
			e = e || window.event;

			let posX = e.clientX,
				posY = e.clientY,
				aX = posX - diffX,
				aY = posY - diffY;

			if (aX < 0) aX = 0;
			if (aY < 0) aY = 0;
			if (aX + eWi > bRect.width) aX = bRect.width - eWi;
			if (aY + eHe > bRect.height) aY = bRect.height - eHe;

			let relX = (aX / bRect.width) * 100;
			let relY = (aY / bRect.height) * 100;

			this.container.style.left = `${relX}%`;
			this.container.style.top = `${relY}%`;
			localStorage.setItem("debug.posX", relX);
			localStorage.setItem("debug.posY", relY);
		}

		document.body.addEventListener("mousemove", this.moveHandler);
	},

	endMove() {
		if (!this.moveHandler)
			return;

		document.body.removeEventListener("mousemove", this.moveHandler);
		this.moveHandler = null;
	},

	updateURLParameter(url, param, paramVal) {
		let newAdditionalURL = "";
		let tempArray = url.split("?");
		let baseURL = tempArray[0];
		let additionalURL = tempArray[1];
		let temp = "";

		if (additionalURL) {
			tempArray = additionalURL.split("&");
			for (let i = 0; i < tempArray.length; i++) {
				if (tempArray[i].split("=")[0] != param) {
					newAdditionalURL += temp + tempArray[i];
					temp = "&";
				}
			}
		}
	
		let rows_txt = temp + "" + param + "=" + paramVal;
		return baseURL + "?" + newAdditionalURL + rows_txt;
	}
}