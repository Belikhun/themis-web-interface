//? |-----------------------------------------------------------------------------------------------|
//? |  /assets/js/sounds.js                                                                         |
//? |                                                                                               |
//? |  Copyright (c) 2018-2020 Belikhun. All right reserved                                         |
//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
//? |-----------------------------------------------------------------------------------------------|


const sounds = {
	disabled: false,
	initialized: false,
	soundsLoaded: false,
	LOCATION: "/assets/sounds",

	soundsPath: {
		checkOff: "check-off.mp3",
		checkOn: "check-on.mp3",
		confirm: "generic-confirm.mp3",
		confirm2: "generic-confirm-2.mp3",
		confirm3: "generic-confirm-3.mp3",
		hover: "generic-hover.mp3",
		hoverSoft: "generic-hover-soft.mp3",
		notification: "notification.mp3",
		overlayPopIn: "overlay-pop-in.mp3",
		overlayPopOut: "overlay-pop-out.mp3",
		select: "generic-select.mp3",
		selectSoft: "generic-select-soft.mp3",
		sliderHigh: "slider-high.mp3",
		sliderLow: "slider-low.mp3",
		sliderSlide: "slider-slide.mp3",
		warning: "generic-warning.mp3"
	},

	sounds: {},
	
	enable: {
		master: false,
		mouseOver: true,
		btnClick: true,
		panelToggle: true,
		others: true,
		notification: true,
	},

	async init(set = () => {}) {
		if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
			clog("WARN", "Sounds does not support on iPhone devices, disabling...");
			cookie.set("__s_m", false);
			this.disabled = true;
			return false;
		}

		set(0, "Taking Cookies 🍪");
		this.enable.master = cookie.get("__s_m", false) == "true";
		this.enable.mouseOver = cookie.get("__s_mo", true) == "true";
		this.enable.btnClick = cookie.get("__s_bc", true) == "true";
		this.enable.panelToggle = cookie.get("__s_pt", true) == "true";
		this.enable.others = cookie.get("__s_ot", true) == "true";
		this.enable.notification = cookie.get("__s_nf", true) == "true";

		set(10, "Loading Sounds");
		await this.loadSound((p, t) => {
			set(10 + p*0.85, `Loading: ${t}`);
		});

		this.soundsLoaded = true;

		set(95, "Scanning");
		this.scan();

		set(100, "Done");
		this.initialized = true;

		clog("OKAY", "Initialised:", {
			color: flatc("red"),
			text: "sounds"
		});
	},

	async loadSound(set = () => {}) {
		if (this.disabled)
			throw { code: -1, description: "Sounds Module Disabled" }

		let keys = Object.keys(this.soundsPath);

		for (let i = 0; i < keys.length; i++) {
			let key = keys[i]
			let item = this.soundsPath[key]

			set((i / (keys.length - 1)) * 100, key);
			this.sounds[key] = await this.__loadSoundAsync(`${this.LOCATION}/${item}`);
		}
	},

	async __loadSoundAsync(url, volume = 0.6) {
		if (this.disabled)
			throw { code: -1, description: "Sounds Module Disabled" }

		let sound = new Audio();
		sound.src = (typeof chrome !== "undefined" && chrome.extension) ? chrome.extension.getURL(url) : url;
		clog("DEBG", `Loading sound: ${url}`);

		return new Promise((resolve, reject) => {
			sound.addEventListener("canplaythrough", handler = e => {
				sound.removeEventListener("canplaythrough", handler);
				sound.volume = volume;
				clog("DEBG", `Sound loaded: ${url}`);
				resolve(sound);
			});

			sound.addEventListener("error", e => {
				clog("ERRR", `Error loading sound: ${url}`, e);
				reject(e);
			})
		})
	},

	__soundToggle(sound) {
		if (!this.enable.master || !sound || sound.readyState < 3 || !this.initialized)
			return false;

		if (!sound.paused)
			sound.pause();

		sound.currentTime = 0;
		sound.play()
			.catch(e => clog("ERRR", "An error occurred while trying to play sounds", e));
	},

	select(variation = 0) {
		if (this.disabled || !this.initialized)
			return;

		let sound = [
			this.sounds.select,
			this.sounds.selectSoft
		][variation]

		if (this.enable.others)
			this.__soundToggle(sound);
	},

	confirm(variation = 0) {
		if (this.disabled || !this.initialized)
			return;

		let sound = [
			this.sounds.confirm,
			this.sounds.confirm2,
			this.sounds.confirm3
		][variation]

		if (this.enable.others)
			this.__soundToggle(sound);
	},

	toggle(variation = 0) {
		if (this.disabled || !this.initialized)
			return;

		let sound = [
			this.sounds.overlayPopIn,
			this.sounds.overlayPopOut
		][variation]

		if (this.enable.others)
			this.__soundToggle(sound);
	},

	notification() {
		if (this.disabled || !this.initialized)
			return;

		if (this.enable.notification)
			this.__soundToggle(this.sounds.notification);
	},

	slider(variation = 0) {
		if (this.disabled || !this.initialized)
			return;

		let sound = [
			this.sounds.sliderSlide,
			this.sounds.sliderHigh,
			this.sounds.sliderLow
		][variation]

		if (this.enable.others)
			this.__soundToggle(sound);
	},

	warning() {
		if (this.disabled || !this.initialized)
			return;

		if (this.enable.others)
			this.__soundToggle(this.sounds.warning);
	},

	scan() {
		if (this.disabled)
			throw { code: -1, description: "Sounds Module Disabled" }

		const list = document.getElementsByClassName("sound");

		for (var item of list) {
			if (typeof item.dataset === "undefined") {
				clog("DEBG", `sounds.scan(): Unknown element: ${e}`);
				continue;
			}

			this.applySound(item);
		}

		return true;
	},
	
	/**
	 * @param {HTMLElement}		item
	 */
	applySound(item, flags) {
		if (!item.nodeType || item.nodeType <= 0 || item.dataset.soundApplied || !this.soundsLoaded || this.disabled)
			return false;

		if (flags && typeof flags === "array")
			for (let flag of flags)
				item.dataset[flag] = true;

		if (typeof item.dataset.soundhover !== "undefined")
			item.addEventListener("mouseenter", e => {
				if (this.enable.mouseOver)
					this.__soundToggle(this.sounds.hover);
			})

		if (typeof item.dataset.soundhoversoft !== "undefined")
			item.addEventListener("mouseenter", e => {
				if (this.enable.mouseOver)
					this.__soundToggle(this.sounds.hoverSoft);
			})

		if (typeof item.dataset.soundselect !== "undefined")
			item.addEventListener("mousedown", e => {
				if (this.enable.btnClick)
					this.__soundToggle(this.sounds.select);
			})

		if (typeof item.dataset.soundselectsoft !== "undefined")
			item.addEventListener("mousedown", e => {
				if (this.enable.btnClick)
					this.__soundToggle(this.sounds.selectSoft);
			})

		if (typeof item.dataset.soundchange !== "undefined")
			item.addEventListener("change", e => {
				if (this.enable.others)
					this.__soundToggle(this.sounds.valueChange);
			})

		if (typeof item.dataset.soundcheck !== "undefined")
			item.addEventListener("change", e => {
				if (this.enable.btnClick)
					if (e.target.checked === true)
						this.__soundToggle(this.sounds.checkOn);
					else
						this.__soundToggle(this.sounds.checkOff);
			})

		if (typeof item.dataset.soundtoggle === "string")
			new ClassWatcher(item, item.dataset.soundtoggle, () => {
				if (this.enable.panelToggle)
					this.__soundToggle(this.sounds.overlayPopIn);
			}, () => {
				if (this.enable.panelToggle)
					this.__soundToggle(this.sounds.overlayPopOut);
			});

		item.dataset.soundApplied = true;
	}
}