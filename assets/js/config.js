//? |-----------------------------------------------------------------------------------------------|
//? |  /assets/js/config.js                                                                         |
//? |                                                                                               |
//? |  Copyright (c) 2018-2020 Belikhun. All right reserved                                         |
//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
//? |-----------------------------------------------------------------------------------------------|

var pageIcon = $("#pageIcon");
var pageIconInput = $("#pageIconInput");
var pageIconReset = $("#pageIconReset");

var landingImage = $("#landingImage");
var landingImageInput = $("#landingImageInput");
var landingImageReset = $("#landingImageReset");

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
var allowRegister = $("#allowRegister");
var edit = {
    name: $("#editName"),
    password: $("#editPassword"),
    avatar: $("#editAvatar")
}
var viewRank = $("#viewRank");
var viewRankTask = $("#viewRankTask");
var viewLog = $("#viewLog");
var viewLogOther = $("#viewLogOther");

var clientConfig = {
    sounds: $("#clientSounds"),
    nightmode: $("#clientNightmode"),
    showMs: $("#clientShowMs"),
    transition: $("#clientTransition"),
    dialogProblem: $("#clientDialogProblem"),
    rankUpdate: $("#clientRankUpdate"),
    logsUpdate: $("#clientLogsUpdate"),
    updateDelay: $("#clientUpdateDelayInput"),
    updateDelayValue: $("#clientUpdateDelayValue")
}

var ratelimit = {
    maxRequest: $("#ratelimit_maxRequest"),
    time: $("#ratelimit_time"),
    banTime: $("#ratelimit_banTime")
}

var cache = {
    contestRank: $("#cache_contestRank")
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
        allowRegister.checked = data.allowRegister;
        edit.name.checked = data.edit.name;
        edit.password.checked = data.edit.password;
        edit.avatar.checked = data.edit.avatar;
        viewRank.checked = data.viewRank;
        viewRankTask.checked = data.viewRankTask;
        viewLog.checked = data.viewLog;
        viewLogOther.checked = data.viewLogOther;
        clientConfig.sounds.checked = data.clientConfig.sounds;
        clientConfig.nightmode.checked = data.clientConfig.nightmode;
        clientConfig.showMs.checked = data.clientConfig.showMs;
        clientConfig.transition.checked = data.clientConfig.transition;
        clientConfig.dialogProblem.checked = data.clientConfig.dialogProblem;
        clientConfig.rankUpdate.checked = data.clientConfig.rankUpdate;
        clientConfig.logsUpdate.checked = data.clientConfig.logsUpdate;
        clientConfig.updateDelay.value = data.clientConfig.updateDelay;
        ratelimit.maxRequest.value = data.ratelimit.maxRequest;
        ratelimit.time.value = data.ratelimit.time;
        ratelimit.banTime.value = data.ratelimit.banTime;
        cache.contestRank.value = data.cache.contestRank;

        clientConfig.updateDelay.dispatchEvent(new Event("input"));
    }, error => errorHandler(error));
}

const sbar = new statusBar(document.body);
sbar.additem(USERNAME, "account", {space: false, align: "left"});

document.__onclog = (type, ts, msg) => {
    type = type.toLowerCase();
    const typeList = ["okay", "warn", "errr", "crit", "lcnt"]
    if (typeList.indexOf(type) === -1)
        return false;

    sbar.msg(type, msg, {time: ts, lock: (type === "crit" || type === "lcnt") ? true : false});
}

$("body").onload = () => {
    if (cookie.get("__darkMode") === "true")
        document.body.classList.add("dark");

    if (window.frameElement)
        document.body.classList.add("embeded");

    setTimeToNow.addEventListener("mouseup", e => {
        let now = new Date();

        time.beginDate.value = cvdate(
            now.getDate(),
            now.getMonth() + 1,
            now.getFullYear()
        );

        time.beginTime.value = cvtime(
            now.getHours(),
            now.getMinutes(),
            now.getSeconds()
        );
    })

    // =========== IMAGE MODIFY EVENT ===========

    pageIcon.addEventListener("load", e => e.target.parentElement.dataset.loaded = 1);
    landingImage.addEventListener("load", e => e.target.parentElement.dataset.loaded = 1);

    pageIconInput.addEventListener("change", async e => {
        sounds.confirm(0);
        let file = e.target.files[0];

        try {
            await myajax({
                url: "/api/images/icon",
                method: "POST",
                form: {
                    token: API_TOKEN,
                    file: file
                }
            })
        } catch(e) { sounds.warning() }

        e.target.value = "";
        pageIcon.parentElement.removeAttribute("data-loaded");
        pageIcon.src = "/api/images/icon";
    })

    landingImageInput.addEventListener("change", async e => {
        sounds.confirm(2);
        let file = e.target.files[0];

        try {
            await myajax({
                url: "/api/images/landing",
                method: "POST",
                form: {
                    token: API_TOKEN,
                    file: file
                }
            })
        } catch(e) { sounds.warning() }

        e.target.value = "";
        landingImage.parentElement.removeAttribute("data-loaded");
        landingImage.src = "/api/images/landing";
    })

    pageIconReset.addEventListener("mouseup", async () => {
        sounds.notification();

        try {
            await myajax({
                url: "/api/images/icon",
                method: "DELETE",
                header: { token: API_TOKEN }
            })
        } catch(e) { sounds.warning() }

        pageIcon.parentElement.removeAttribute("data-loaded");
        pageIcon.src = "/api/images/icon";
    })

    landingImageReset.addEventListener("mouseup", async () => {
        sounds.notification();

        try {
            await myajax({
                url: "/api/images/landing",
                method: "DELETE",
                header: { token: API_TOKEN }
            })
        } catch(e) { sounds.warning() }

        landingImage.parentElement.removeAttribute("data-loaded");
        landingImage.src = "/api/images/landing";
    })

    // =========== END IMAGE MODIFY EVENT ===========

    // =========== UPDATE DELAY SLIDER ===========

    clientConfig.updateDelay.addEventListener("input", e => {
        let _o = parseInt(e.target.value);
        let v = { 1: 500, 2: 1000, 3: 2000, 4: 10000, 5: 60000, 6: 120000, 7: 240000, 8: 300000, 9: 600000, 10: 3600000 }
        let value = v[_o] || 2000;

        clientConfig.updateDelayValue.innerText = `${value / 1000} giây/yêu cầu`;

        if (value < 2000)
            e.target.classList.add("pink") || e.target.classList.remove("blue");
        else
            e.target.classList.remove("pink") || e.target.classList.add("blue");
    })

    // =========== END UPDATE DELAY SLIDER ===========

    pageIcon.src = "/api/images/icon";
    landingImage.src = "/api/images/landing";
    sounds.init();
    popup.init();
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
            "allowRegister": allowRegister.checked,
            "edit.name": edit.name.checked,
            "edit.password": edit.password.checked,
            "edit.avatar": edit.avatar.checked,
            "viewRank": viewRank.checked,
            "viewRankTask": viewRankTask.checked,
            "viewLog": viewLog.checked,
            "viewLogOther": viewLogOther.checked,
            "clientConfig.sounds": clientConfig.sounds.checked,
            "clientConfig.nightmode": clientConfig.nightmode.checked,
            "clientConfig.showMs": clientConfig.showMs.checked,
            "clientConfig.transition": clientConfig.transition.checked,
            "clientConfig.dialogProblem": clientConfig.dialogProblem.checked,
            "clientConfig.rankUpdate": clientConfig.rankUpdate.checked,
            "clientConfig.logsUpdate": clientConfig.logsUpdate.checked,
            "clientConfig.updateDelay": parseInt(clientConfig.updateDelay.value),
            "ratelimit.maxRequest": parseInt(ratelimit.maxRequest.value),
            "ratelimit.time": parseInt(ratelimit.time.value),
            "ratelimit.banTime": parseInt(ratelimit.banTime.value),
            "cache.contestRank": parseInt(cache.contestRank.value),
            "token": API_TOKEN
        }
    }, () => {
        clog("okay", "Thay đổi cài đặt thành công");
        update();
    }, error => errorHandler(error));
}, false);