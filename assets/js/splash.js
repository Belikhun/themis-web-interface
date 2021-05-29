//? |-----------------------------------------------------------------------------------------------|
//? |  /assets/js/splash.js                                                                         |
//? |                                                                                               |
//? |  Copyright (c) 2018-2021 Belikhun. All right reserved                                         |
//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
//? |-----------------------------------------------------------------------------------------------|

class Splash {
	get tip() {
		let tips = [
			"Thử tải lại cứng bằng tổ hợp phím <b>Ctrl + Shift + R</b> hoặc <b>Ctrl + F5</b> nếu có lỗi xảy ra",
			"Cài đặt <b>Hiển thị millisecond</b> giúp hiển thị thời gian của cuộc thi chính xác hơn"
		]

		return tips[randBetween(0, tips.length - 1, true)]
	}

	constructor({
		container,
		name = "Sample App",
		icon = "/api/images/icon",
		background = "/api/images/landing",
		onInit,
		onPostInit,
		onError
	} = {}) {
		if (!container || !container.classList)
			throw { code: -1, description: `Splash(): container is not a valid Element!` }

		/**
		 * The container will contain splash
		 * @type {HTMLElement}
		 */
		this.container = container;

		let tree = buildElementTree("div", "splash", [
			{ name: "background", node: new lazyload({
				source: background,
				classes: "background"
			})},

			{ type: "span", class: "content", name: "content", list: [
				{ type: "div", class: "logo", name: "logo", list: [
					{ name: "icon", node: new lazyload({
						source: icon,
						classes: "icon"
					})}
				]},

				{ type: "t", class: "title", name: "titleNode", text: name },
				{ type: "t", class: "tip", name: "tip", html: this.tip },
				{ type: "div", class: "load", name: "load", list: [
					{ type: "t", class: "phase", name: "phase", text: "Phase 0/0: Init Splash" },

					{ type: "div", class: "detail", name: "detail", list: [
						{ type: "t", class: "module", name: "module", text: "splash" },
						{ type: "t", class: "status", name: "status", text: "Building Up Splash Screen" }
					]},
					
					{ type: "t", class: "error", name: "error" },
					{ type: "div", class: ["progressBar", "light"], name: "progress", list: [
						{ type: "div", class: "bar", name: "bar" }
					]}
				]}
			]},

			{ type: "span", class: "browsers", name: "browsers", list: [
				{ type: "div", class: "icons", name: "icons", list: [
					{ name: "chrome", node: new lazyload({ source: "/assets/img/chrome-icon.webp" }) },
					{ name: "coccoc", node: new lazyload({ source: "/assets/img/coccoc-icon.webp" }) },
					{ name: "edge", node: new lazyload({ source: "/assets/img/edge-icon.webp" }) }
				]},

				{ type: "t", class: "text", name: "text", html: "trang web hoạt động tốt nhất trên trình duyệt <b>Chrome</b>, <b>Cốc Cốc</b> và <b>Edge</b>" }
			]}
		]);

		this.container.insertBefore(tree.tree, this.container.childNodes[0]);
		this.splash = tree.obj;

		/** @type {HTMLElement} */
		this.bar = this.splash.content.load.progress.bar;

		/** @type {HTMLElement} */
		this.phase = this.splash.content.load.phase;

		/** @type {HTMLElement} */
		this.module = this.splash.content.load.detail.module;

		/** @type {HTMLElement} */
		this.status = this.splash.content.load.detail.status;

		/** @type {HTMLElement} */
		this.error = this.splash.content.load.error;

		this.bar.dataset.color = "pink";
		this.bar.dataset.blink = "grow";
		this.onInitHandlers = []
		this.onPostInitHandlers = []
		this.onErrorHandlers = []

		if (onInit)
			this.onInit(onInit);

		if (onPostInit)
			this.onPostInit(onPostInit);

		if (onError)
			this.onError(onError);

		try {
			this.preLoad();
		} catch(e) {
			this.panic(e);
			throw e;
		}
	}

	onInit(f) {
		if (!f || typeof f !== "function")
			throw { code: -1, description: "splash.onInit(): not a valid function" }

		this.onInitHandlers.push(f);
	}

	onPostInit(f) {
		if (!f || typeof f !== "function")
			throw { code: -1, description: "splash.onPostInit(): not a valid function" }

		this.onPostInitHandlers.push(f);
	}

	onError(f) {
		if (!f || typeof f !== "function")
			throw { code: -1, description: "splash.onError(): not a valid function" }

		this.onErrorHandlers.push(f);
	}

	preLoad() {
		this.bar.dataset.slow = 30;
		this.phase.innerText = "Phase 1/3: Page Initialization";
		this.status.innerText = "Đang Tải Dữ Liệu";

		requestAnimationFrame(() => this.bar.style.width = "30%");

		if (["complete", "interactive"].includes(document.readyState))
			this.load();
		else
			window.addEventListener("load", () => this.load());
	}

	async load() {
		this.bar.removeAttribute("data-slow");
		this.preLoaded = true;
		this.loaded = false;

		this.phase.innerText = "Phase 2/3: Script Initialization";
		this.bar.style.width = `30%`;
		this.bar.dataset.color = "blue";

		let _mp = 1 / this.onInitHandlers.length;
		for (let i = 0; i < this.onInitHandlers.length; i++) {
			let f = this.onInitHandlers[i];

			await f(({ p, m, d }) => {
				if (m)
					this.module.innerText = m;
	
				if (d)
					this.status.innerText = d;
	
				if (p)
					this.bar.style.width = `${30 + ((i * _mp) + (p / 100) * _mp) * 60}%`;
			}).catch((e) => this.panic(e));
		}

		await this.post();
	}

	async post() {
		this.phase.innerText = "Phase 3/3: Post Initialization";
		this.bar.style.width = `90%`;
		this.bar.dataset.color = "green";

		let _mp = 1 / this.onPostInitHandlers.length;
		for (let i = 0; i < this.onPostInitHandlers.length; i++) {
			let f = this.onPostInitHandlers[i];

			await f(({ p, m, d }) => {
				if (m)
					this.module.innerText = m;
	
				if (d)
					this.status.innerText = d;
	
				if (p)
					this.bar.style.width = `${90 + ((i * _mp) + (p / 100) * _mp) * 10}%`;
			}).catch((e) => this.panic(e, false));
		}

		this.bar.style.width = `100%`;
		this.status.innerText = "Tải Hoàn Thành";
		cookie.set("splashInitSuccess", true, 1);
		this.splash.classList.add("hide");
	}

	async panic(error, stop = true) {
		let e = parseException(error);

		this.status.innerText = "LỖI ĐÃ XẢY RA!";
		this.error.innerText = `[${e.code}] >>> ${e.description}`;
		this.bar.dataset.color = "red";
		this.bar.dataset.blink = "fade";
		cookie.set("splashInitSuccess", false, 1);
		clog("ERRR", error);
		
		for (let f of this.onErrorHandlers)
			await f(error, e.code, e.description)

		if (stop)
			throw error;
	}
}