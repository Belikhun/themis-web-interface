//? |-----------------------------------------------------------------------------------------------|
//? |  /assets/js/sounds.js                                                                         |
//? |                                                                                               |
//? |  Copyright (c) 2018-2020 Belikhun. All right reserved                                         |
//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
//? |-----------------------------------------------------------------------------------------------|


const sounds = {
    initialized: false,
    soundsLoaded: false,
    ROOT_DIR: "/assets/sounds",

    btn: {
        soundToggle: $("#usett_btn_sound_toggle"),
        soundOnMouseHover: $("#usett_btn_sound_mouse_hover"),
        soundOnBtnClick: $("#usett_btn_sound_button_click"),
        soundOnPanelToggle: $("#usett_btn_sound_panel_toggle"),
        soundOthers: $("#usett_btn_sound_others"),
        soundOnNotification: $("#usett_btn_sound_notification"),
    },

    soundList: [{
        key: "checkOff",
        name: "check-off.mp3"
    }, {
        key: "checkOn",
        name: "check-on.mp3"
    }, {
        key: "hover",
        name: "generic-hover.mp3"
    }, {
        key: "hoverSoft",
        name: "generic-hover-soft.mp3"
    }, {
        key: "select",
        name: "generic-select.mp3"
    }, {
        key: "selectSoft",
        name: "generic-select-soft.mp3"
    }, {
        key: "overlayPopIn",
        name: "overlay-pop-in.mp3"
    }, {
        key: "overlayPopOut",
        name: "overlay-pop-out.mp3"
    }, {
        key: "confirm",
        name: "generic-confirm.mp3"
    }, {
        key: "confirm2",
        name: "generic-confirm-2.mp3"
    }, {
        key: "confirm3",
        name: "generic-confirm-3.mp3"
    }, {
        key: "warning",
        name: "generic-warning.mp3"
    }, {
        key: "notification",
        name: "notification.mp3"
    }, {
        key: "valueChange",
        name: "generic-value-change.mp3"
    }],

    sounds: {
        checkOff: null,
        checkOn: null,
        hover: null,
        hoverSoft: null,
        select: null,
        selectSoft: null,
        overlayPopIn: null,
        overlayPopOut: null,
        confirm: null,
        notification: null,
    },
    
    enable: {
        master: false,
        mouseOver: true,
        btnClick: true,
        panelToggle: true,
        others: true,
        notification: true,
    },

    async init(set = () => {}) {
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
        clog("okay", "Initialised:", {
            color: flatc("red"),
            text: "sounds"
        });
    },

    async loadSound(set = () => {}) {
        for (var i = 0; i < this.soundList.length; i++) {
            const item = this.soundList[i];
            set((i / (this.soundList.length - 1)) * 100, item.name);
            this.sounds[item.key] = await this.__loadSoundAsync(`${this.ROOT_DIR}/${item.name}`);
        }
    },

    async __loadSoundAsync(url, volume = 0.6) {
        var sound = new Audio();
        sound.src = chrome.extension ? chrome.extension.getURL(url) : url;
        clog("DEBG", `Loading sound: ${url}`);

        return new Promise((resolve, reject) => {
            sound.addEventListener("canplaythrough", handler = e => {
                sound.removeEventListener("canplaythrough", handler);
                sound.volume = volume;
                clog("DEBG", `Sound loaded: ${url}`);
                resolve(sound);
            });

            sound.addEventListener("error", e => {
                clog("ERRR", `Error loading sound: ${url}`);
                console.log(e);
                reject(e);
            })
        })
    },

    __soundToggle(sound) {
        if (!sound || sound.readyState < 3 || !this.initialized)
            return false;

        if (!sound.paused)
            sound.pause();

        sound.currentTime = 0;
        sound.play()
            .catch(e => clog("errr", "Error occurred while trying to play sounds."));
    },

    select(variation = 0) {
        let sound = [
            this.sounds.select,
            this.sounds.selectSoft
        ][variation]

        if (this.enable.master && this.enable.others)
            this.__soundToggle(sound);
    },

    confirm(variation = 0) {
        let sound = [
            this.sounds.confirm,
            this.sounds.confirm2,
            this.sounds.confirm3
        ][variation]

        if (this.enable.master && this.enable.others)
            this.__soundToggle(sound);
    },

    toggle(variation = 0) {
        let sound = [
            this.sounds.overlayPopIn,
            this.sounds.overlayPopOut
        ][variation]

        if (this.enable.master && this.enable.others)
            this.__soundToggle(sound);
    },

    notification() {
        if (this.enable.master && this.enable.notification)
            this.__soundToggle(this.sounds.notification);
    },

    warning() {
        if (this.enable.master && this.enable.others)
            this.__soundToggle(this.sounds.warning);
    },

    scan() {
        const list = document.getElementsByClassName("sound");

        for (var item of list) {
            if (typeof item.dataset === "undefined") {
                clog("DEBG", `Unknown element: ${e} in sounds.scan`);
                continue;
            }

            this.applySound(item);
        }

        return true;
    },
    
    applySound(item) {
        if (!item.nodeType || item.nodeType <= 0 || item.dataset.soundApplied || !this.soundsLoaded)
            return false;

        if (typeof item.dataset.soundhover !== "undefined")
            item.addEventListener("mouseenter", e => {
                if (this.enable.master && this.enable.mouseOver)
                    this.__soundToggle(this.sounds.hover);
            })

        if (typeof item.dataset.soundhoversoft !== "undefined")
            item.addEventListener("mouseenter", e => {
                if (this.enable.master && this.enable.mouseOver)
                    this.__soundToggle(this.sounds.hoverSoft);
            })

        if (typeof item.dataset.soundselect !== "undefined")
            item.addEventListener("mousedown", e => {
                if (this.enable.master && this.enable.btnClick)
                    this.__soundToggle(this.sounds.select);
            })

        if (typeof item.dataset.soundselectsoft !== "undefined")
            item.addEventListener("mousedown", e => {
                if (this.enable.master && this.enable.btnClick)
                    this.__soundToggle(this.sounds.selectSoft);
            })

        if (typeof item.dataset.soundchange !== "undefined")
            item.addEventListener("change", e => {
                if (this.enable.master && this.enable.others)
                    this.__soundToggle(this.sounds.valueChange);
            })

        if (typeof item.dataset.soundcheck !== "undefined")
            item.addEventListener("change", e => {
                if (this.enable.master && this.enable.btnClick)
                    if (e.target.checked === true)
                        this.__soundToggle(this.sounds.checkOn);
                    else
                        this.__soundToggle(this.sounds.checkOff);
            })

        if (typeof item.dataset.soundtoggle === "string")
            new ClassWatcher(item, item.dataset.soundtoggle, () => {
                if (this.enable.master && this.enable.panelToggle)
                    this.__soundToggle(this.sounds.overlayPopIn);
            }, () => {
                if (this.enable.master && this.enable.panelToggle)
                    this.__soundToggle(this.sounds.overlayPopOut);
            });

        item.dataset.soundApplied = true;
    }
}