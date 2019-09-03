//? |-----------------------------------------------------------------------------------------------|
//? |  /assets/js/config.js                                                                         |
//? |                                                                                               |
//? |  Copyright (c) 2018-2019 Belikhun. All right reserved                                         |
//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
//? |-----------------------------------------------------------------------------------------------|

var contest = {
    name: $("#contest_name"),
    desc: $("#contest_description")
}
var uploadDir = $("#uploadDir");
var time = {
    zone: $("#time_zone"),
    beginDate: $("#time_beginDate"),
    beginTime: $("#time_beginTime"),
    during: $("#time_during"),
    offset: $("#time_offset")
}
var pageTitle = $("#pageTitle");
var publish = $("#publish");
var submit = $("#submit");
var submitInProblems = $("#submitInProblems");
var editInfo = $("#editInfo");
var viewRank = $("#viewRank");
var viewRankTask = $("#viewRankTask");
var viewLog = $("#viewLog");
var viewLogOther = $("#viewLogOther");
var ratelimit = {
    maxRequest: $("#ratelimit_maxRequest"),
    time: $("#ratelimit_time"),
    banTime: $("#ratelimit_banTime")
}

var setTimeToNow = $("#setTimeToNow");

function cvtime(h, m, s) {
    return [h, m, s]
        .map(v => v < 10 ? "0" + v : v)
        .join(":");
}

function cvdate(d, m, y) {
    return [y, m, d]
        .map(v => v < 10 ? "0" + v : v)
        .join("-");
}

function prdate(inp) {
    var t = inp.split("-");
    return {
        y: parseInt(t[0]),
        m: parseInt(t[1]),
        d: parseInt(t[2])
    }
}

function prtime(inp) {
    var t = inp.split(":");
    return {
        h: parseInt(t[0] ? t[0] : 0),
        m: parseInt(t[1] ? t[1] : 0),
        s: parseInt(t[2] ? t[2] : 0)
    }
}

function update() {
    myajax({
        url: "/api/config",
        method: "GET",
    }, response => {
        let data = response.data;

        contest.name.value = data.contest.name;
        contest.desc.value = data.contest.description;
        uploadDir.value = data.uploadDir;
        time.zone.value = data.time.zone;
        time.beginDate.value = cvdate(
            data.time.begin.days,
            data.time.begin.months,
            data.time.begin.years
        );
        time.beginTime.value = cvtime(
            data.time.begin.hours,
            data.time.begin.minutes,
            data.time.begin.seconds
        );
        time.during.value = data.time.during;
        time.offset.value = data.time.offset;
        pageTitle.value = data.pageTitle;
        publish.checked = data.publish;
        submit.checked = data.submit;
        submitInProblems.checked = data.submitInProblems;
        editInfo.checked = data.editInfo;
        viewRank.checked = data.viewRank;
        viewRankTask.checked = data.viewRankTask;
        viewLog.checked = data.viewLog;
        viewLogOther.checked = data.viewLogOther;
        ratelimit.maxRequest.value = data.ratelimit.maxRequest;
        ratelimit.time.value = data.ratelimit.time;
        ratelimit.banTime.value = data.ratelimit.banTime;
    });
}

const sbar = new statusbar(document.body);
sbar.additem(USERNAME, "account", {space: false, aligin: "left"});

document.__onclog = (type, ts, msg) => {
    type = type.toLowerCase();
    const typelist = ["okay", "warn", "errr", "crit", "lcnt"]
    if (typelist.indexOf(type) === -1)
        return false;

    sbar.msg(type, msg, {time: ts, lock: (type === "crit" || type === "lcnt") ? true : false});
}

$("body").onload = e => {
    if (cookie.get("__darkMode") === "true")
        document.body.classList.add("dark");

    if (window.frameElement)
        document.body.classList.add("embeded");

    setTimeToNow.addEventListener("mouseup", e => {
        let now = new Date();

        time.beginDate.value = cvdate(
            now.getDay() + 1,
            now.getMonth() + 1,
            now.getFullYear()
        );
        time.beginTime.value = cvtime(
            now.getHours(),
            now.getMinutes(),
            now.getSeconds()
        );
    })

    sound.init();
    update();
}

$("#formContainer").addEventListener("submit", e => {
    var bd = prdate(time.beginDate.value);
    var bt = prtime(time.beginTime.value);
    myajax({
        url: "/api/config",
        method: "POST",
        form: {
            "contest.name": contest.name.value,
            "contest.description": contest.desc.value,
            "uploadDir": uploadDir.value,
            "time.zone": time.zone.value,
            "time.begin.seconds": bt.s,
            "time.begin.minutes": bt.m,
            "time.begin.hours": bt.h,
            "time.begin.days": bd.d,
            "time.begin.months": bd.m,
            "time.begin.years": bd.y,
            "time.during": time.during.value,
            "time.offset": time.offset.value,
            "pageTitle": pageTitle.value,
            "publish": publish.checked,
            "submit": submit.checked,
            "submitInProblems": submitInProblems.checked,
            "editInfo": editInfo.checked,
            "viewRank": viewRank.checked,
            "viewRankTask": viewRankTask.checked,
            "viewLog": viewLog.checked,
            "viewLogOther": viewLogOther.checked,
            "ratelimit.maxRequest": parseInt(ratelimit.maxRequest.value),
            "ratelimit.time": parseInt(ratelimit.time.value),
            "ratelimit.banTime": parseInt(ratelimit.banTime.value),
            "token": API_TOKEN
        }
    }, () => {
        clog("okay", "Thay đổi cài đặt thành công.");
        update();
    })
}, false)


sound = {
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

    async init() {
        this.enable.master = cookie.get("__s_m", false) == "true";

        if (!this.enable.master)
            return;

        this.enable.mouseOver = cookie.get("__s_mo", true) == "true";
        this.enable.btnClick = cookie.get("__s_bc", true) == "true";
        this.enable.panelToggle = cookie.get("__s_pt", true) == "true";
        this.enable.others = cookie.get("__s_ot", true) == "true";
        this.enable.notification = cookie.get("__s_nf", true) == "true";

        await this.loadSound();
        this.scan();

        clog("okay", "Initialised:", {
            color: flatc("red"),
            text: "sound"
        });
    },

    async loadSound() {
        this.sounds.checkOff = await this.__loadSoundAsync(`/assets/sounds/check-off.mp3`);
        this.sounds.checkOn = await this.__loadSoundAsync(`/assets/sounds/check-on.mp3`);
        this.sounds.hover = await this.__loadSoundAsync(`/assets/sounds/generic-hover.mp3`);
        this.sounds.hoverSoft = await this.__loadSoundAsync(`/assets/sounds/generic-hover-soft.mp3`);
        this.sounds.select = await this.__loadSoundAsync(`/assets/sounds/generic-select.mp3`);
        this.sounds.selectSoft = await this.__loadSoundAsync(`/assets/sounds/generic-select-soft.mp3`);
        this.sounds.overlayPopIn = await this.__loadSoundAsync(`/assets/sounds/overlay-pop-in.mp3`);
        this.sounds.overlayPopOut = await this.__loadSoundAsync(`/assets/sounds/overlay-pop-out.mp3`);
    },

    async __loadSoundAsync(url, volume = 0.1) {
        sound = new Audio(url);
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
        if (sound.readyState < 3)
            return false;

        if (!sound.paused)
            sound.pause();
        sound.currentTime = 0;
        sound.play().catch(e => {
            clog("errr", "Play prevented by Chrome Autoplay Policy.");
        });
    },

    select() {
        if (this.enable.master && this.enable.btnClick)
            this.__soundToggle(this.sounds.select);
    },

    confirm() {
        if (this.enable.master && this.enable.others)
            this.__soundToggle(this.sounds.confirm);
    },

    notification() {
        if (this.enable.master && this.enable.notification)
            this.__soundToggle(this.sounds.notification);
    },

    scan() {
        const list = document.getElementsByClassName("sound");

        for (var item of list) {
            if (typeof item.dataset === "undefined") {
                clog("DEBG", `Unknown element: ${e} in core.userSettings.sound.scan`);
                continue;
            }

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
            
        }
    }
}