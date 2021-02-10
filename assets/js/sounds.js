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

	sounds: {
		checkOff: { path: "check-off.mp3", require: ["btnClick"] },
		checkOn: { path: "check-on.mp3", require: ["btnClick"] },
		confirm: { path: "generic-confirm.mp3", require: ["others"] },
		confirm2: { path: "generic-confirm-2.mp3", require: ["others"] },
		confirm3: { path: "generic-confirm-3.mp3", require: ["others"] },
		hover: { path: "generic-hover.mp3", require: ["mouseOver"], volume: 0.4 },
		hoverSoft: { path: "generic-hover-soft.mp3", require: ["mouseOver"] },
		notification: { path: "notification.mp3", require: ["notification"] },
		overlayPopIn: { path: "overlay-pop-in.mp3", require: ["panelToggle"] },
		overlayPopOut: { path: "overlay-pop-out.mp3", require: ["panelToggle"] },
		select: { path: "generic-select.mp3", require: ["btnClick"] },
		selectSoft: { path: "generic-select-soft.mp3", require: ["btnClick"] },
		sliderHigh: { path: "slider-high.mp3", require: ["others"] },
		sliderLow: { path: "slider-low.mp3", require: ["others"] },
		sliderSlide: { path: "slider-slide.mp3", require: ["others"] },
		warning: { path: "generic-warning.mp3", require: ["others"] }
	},
	
	enable: {
		master: false,
		mouseOver: true,
		btnClick: true,
		panelToggle: true,
		others: true,
		notification: true,
	},

	async init(set = () => {}, {
		clog = window.clog
	} = {}) {
		if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
			clog("WARN", "Sounds does not support on iPhone devices, disabling...");
			cookie.set("__s_m", false);
			this.disabled = true;
			return false;
		}

		set({ p: 0, m: "sounds", d: `Getting Default Sound Settings` });
		for (let key of Object.keys(this.enable)) {
			let value = localStorage.getItem(`sounds.${key}`);

			if (value === null) {
				value = this.enable[key];
				localStorage.setItem(`sounds.${key}`, value);
			} else
				value = (value == "true")

			this.enable[key] = value;
		}

		set({ p: 10, m: "sounds", d: "Loading Sounds" });
		await this.loadSound((p, t) => {
			set({ p: 10 + p*0.85, m: "sounds", d: `Loading: ${t}` });
		}, { clog });

		this.soundsLoaded = true;

		set({ p: 95, m: "sounds", d: "Scanning" });
		this.scan();

		set({ p: 100, m: "sounds", d: "Done" });
		this.initialized = true;

		clog("OKAY", "Initialised:", {
			color: flatc("red"),
			text: "sounds"
		});
	},

	async loadSound(set = () => {}, {
		clog = window.clog
	} = {}) {
		if (this.disabled)
			throw { code: -1, description: "Sounds Module Disabled" }

		let keys = Object.keys(this.sounds);
		for (let i = 0; i < keys.length; i++) {
			let key = keys[i]
			let item = this.sounds[key]

			set((i / (keys.length - 1)) * 100, key);
			this.sounds[key].sound = await this.__loadSoundAsync(`${this.LOCATION}/${item.path}`, item.volume || 0.6, { clog });
		}
	},

	async __loadSoundAsync(url, volume = 0.6, {
		clog = window.clog
	} = {}) {
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

	soundToggle(sound) {
		sound = (typeof sound === "string" && this.sounds[sound] && this.sounds[sound].sound)
			? this.sounds[sound]
			: sound;

		if (!this.enable.master || !sound || !sound.sound || sound.sound.readyState < 3 || !this.initialized)
			return false;

		for (let key of sound.require)
			if (!this.enable[key])
				return false;

		if (!sound.sound.paused)
			sound.sound.pause();

		sound.sound.currentTime = 0;
		sound.sound.play()
			.catch(e => clog("ERRR", "An error occurred while trying to play sounds", e));
	},

	select(variation = 0) {
		if (this.disabled || !this.initialized)
			return;

		let sound = [
			this.sounds.select,
			this.sounds.selectSoft
		][variation]

		this.soundToggle(sound);
	},

	confirm(variation = 0) {
		if (this.disabled || !this.initialized)
			return;

		let sound = [
			this.sounds.confirm,
			this.sounds.confirm2,
			this.sounds.confirm3
		][variation]

		this.soundToggle(sound);
	},

	toggle(variation = 0) {
		if (this.disabled || !this.initialized)
			return;

		let sound = [
			this.sounds.overlayPopIn,
			this.sounds.overlayPopOut
		][variation]

		if (this.enable.others)
			this.soundToggle(sound);
	},

	notification() {
		if (this.disabled || !this.initialized)
			return;

		if (this.enable.notification)
			this.soundToggle(this.sounds.notification);
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
			this.soundToggle(sound);
	},

	warning() {
		if (this.disabled || !this.initialized)
			return;

		if (this.enable.others)
			this.soundToggle(this.sounds.warning);
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
		if (!item.nodeType || item.nodeType <= 0 || item.dataset.soundApplied || this.disabled)
			return false;

		if (flags && typeof flags === "object" && flags.length)
			for (let flag of flags)
				item.dataset[flag] = true;

		if (typeof item.dataset.soundhover !== "undefined")
			item.addEventListener("mouseenter", (e) => e.isTrusted ? this.soundToggle(this.sounds.hover) : 0);

		if (typeof item.dataset.soundhoversoft !== "undefined")
			item.addEventListener("mouseenter", (e) => e.isTrusted ? this.soundToggle(this.sounds.hoverSoft) : 0);

		if (typeof item.dataset.soundselect !== "undefined")
			item.addEventListener("mousedown", (e) => e.isTrusted ? this.soundToggle(this.sounds.select) : 0);

		if (typeof item.dataset.soundselectsoft !== "undefined")
			item.addEventListener("mousedown", (e) => e.isTrusted ? this.soundToggle(this.sounds.selectSoft) : 0);

		if (typeof item.dataset.soundchange !== "undefined")
			item.addEventListener("change", (e) => e.isTrusted ? this.soundToggle(this.sounds.sliderSlide) : 0);

		if (typeof item.dataset.soundcheck !== "undefined")
			item.addEventListener("change", (e) => {
				if (!e.isTrusted)
					return;

				if (e.target.checked === true)
					this.soundToggle(this.sounds.checkOn);
				else
					this.soundToggle(this.sounds.checkOff);
			})

		if (typeof item.dataset.soundtoggle === "string")
			new ClassWatcher(item, item.dataset.soundtoggle,
				() => this.soundToggle(this.sounds.overlayPopIn),
				() => this.soundToggle(this.sounds.overlayPopOut)
			);

		item.dataset.soundApplied = true;
	}
}