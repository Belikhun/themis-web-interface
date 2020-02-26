//? |-----------------------------------------------------------------------------------------------|
//? |  /assets/js/config.js                                                                         |
//? |                                                                                               |
//? |  Copyright (c) 2018-2020 Belikhun. All right reserved                                         |
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
        allowRegister.checked = data.allowRegister;
        edit.name.checked = data.edit.name;
        edit.password.checked = data.edit.password;
        edit.avatar.checked = data.edit.avatar;
        viewRank.checked = data.viewRank;
        viewRankTask.checked = data.viewRankTask;
        viewLog.checked = data.viewLog;
        viewLogOther.checked = data.viewLogOther;
        ratelimit.maxRequest.value = data.ratelimit.maxRequest;
        ratelimit.time.value = data.ratelimit.time;
        ratelimit.banTime.value = data.ratelimit.banTime;
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

$("body").onload = e => {
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
            "ratelimit.maxRequest": parseInt(ratelimit.maxRequest.value),
            "ratelimit.time": parseInt(ratelimit.time.value),
            "ratelimit.banTime": parseInt(ratelimit.banTime.value),
            "token": API_TOKEN
        }
    }, () => {
        clog("okay", "Thay đổi cài đặt thành công");
        update();
    }, error => errorHandler(error));
}, false);