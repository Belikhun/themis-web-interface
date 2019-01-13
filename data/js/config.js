//? |-----------------------------------------------------------------------------------------------|
//? |  /data/js/config.js                                                                           |
//? |                                                                                               |
//? |  Copyright (c) 2019 Belikhun. All right reserved                                              |
//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
//? |-----------------------------------------------------------------------------------------------|

contest = {
    "name": $("#contest-name"),
    "desc": $("#contest-description")
}
uploaddir = $("#uploaddir");
time = {
    zone: $("#time-zone"),
    begindate: $("#time-begindate"),
    begintime: $("#time-begintime"),
    during: $("#time-during"),
    offset: $("#time-offset")
}
publish = $("#publish");
submit = $("#submit");
editinfo = $("#editinfo");
viewlog = $("#viewlog");

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
        "y": parseInt(t[0]),
        "m": parseInt(t[1]),
        "d": parseInt(t[2])
    }
}

function prtime(inp) {
    var t = inp.split(":");
    return {
        "h": parseInt(t[0] ? t[0] : 00),
        "m": parseInt(t[1] ? t[1] : 00),
        "s": parseInt(t[2] ? t[2] : 00)
    }
}

function update() {
    myajax({
        "url": "/api/config",
        "method": "GET",
    }, data => {
        contest.name.value = data.contest.name;
        contest.desc.value = data.contest.description;
        uploaddir.value = data.uploaddir;
        time.zone.value = data.time.zone;
        time.begindate.value = cvdate(
            data.time.begin.days,
            data.time.begin.months,
            data.time.begin.years
        );
        time.begintime.value = cvtime(
            data.time.begin.hours,
            data.time.begin.minutes,
            data.time.begin.seconds
        );
        time.during.value = data.time.during;
        time.offset.value = data.time.offset;
        publish.checked = data.publish;
        submit.checked = data.submit;
        editinfo.checked = data.editinfo;
        viewlog.checked = data.viewlog;
    });
}

const sbar = new statusbar(document.body);
sbar.additem(API_TOKEN, "key", {space: false});
sbar.additem(USERNAME, "account", {space: false, aligin: "right"});

$("body").onload = update();

$("#form-container").addEventListener("submit", e => {
    var bd = prdate(time.begindate.value);
    var bt = prtime(time.begintime.value);
    myajax({
        "url": "/api/config",
        "method": "POST",
        "form": {
            "contest.name": contest.name.value,
            "contest.description": contest.desc.value,
            "uploaddir": uploaddir.value,
            "time.zone": time.zone.value,
            "time.begin.seconds": bt.s,
            "time.begin.minutes": bt.m,
            "time.begin.hours": bt.h,
            "time.begin.days": bd.d,
            "time.begin.months": bd.m,
            "time.begin.years": bd.y,
            "time.during": time.during.value,
            "time.offset": time.offset.value,
            "publish": publish.checked,
            "submit": submit.checked,
            "editinfo": editinfo.checked,
            "viewlog": viewlog.checked,
            "token": API_TOKEN
        }
    }, data => {
        sbar.msg("okay", "Thay đổi cài đặt thành công.");
        update();
    })
}, false)