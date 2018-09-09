//|====================================================|
//|                     config.js                      |
//|            Copyright (c) 2018 Belikhun.            |
//|      This file is licensed under MIT license.      |
//|====================================================|

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
        .filter((v,i) => v !== "00" || i > 0)
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
        "h": parseInt(t[0]),
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

$("body").onload = update();

$("#form-container").addEventListener("submit", e => {
    var bd = prdate(time.begindate.value);
    var bt = prtime(time.begintime.value);
    myajax({
        "url": "/api/config",
        "method": "POST",
        "form": {
            "cn": contest.name.value,
            "cd": contest.desc.value,
            "ud": uploaddir.value,
            "tz": time.zone.value,
            "tbsec": bt.s,
            "tbmin": bt.m,
            "tbhrs": bt.h,
            "tbday": bd.d,
            "tbmth": bd.m,
            "tnyrs": bd.y,
            "td": time.during.value,
            "to": time.offset.value,
            "pu": publish.checked,
            "su": submit.checked,
            "ed": editinfo.checked,
            "vi": viewlog.checked,
            "t": API_TOKEN
        }
    }, res => {
        statbar.change(statbar.type.OK, "Thay đổi cài đặt thành công.");
        statbar.hide(3000);
    })
}, false)