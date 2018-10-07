//|====================================================|
//|                    belibrary.js                    |
//|            Copyright (c) 2018 Belikhun.            |
//|      This file is licensed under MIT license.      |
//|====================================================|


function myajax({
    url = "/",
    method = "GET",
    query = Array(),
    form = Array(),
    file = null,
    type = "json",
}, callout = () => {}, progress = () => {}, error = () => {}, disablestatbar = false) {
    query.length = Object.keys(query).length;
    form.length = Object.keys(form).length;

    var xhr = new XMLHttpRequest();
    var pd = new FormData();
    if (file)
        pd.append("file", file);

    for (var i = 0; i < form.length; i++) {
        kn = Object.keys(form)[i];
        pd.append(kn, form[kn]);
    }

    for (var i = 0; i < query.length; i++) {
        if (i == 0)
            url += "?";
        var kn = Object.keys(query)[i];
        url += kn + "=" + query[kn];
        if (i < query.length - 1)
            url += "&";
    }

    xhr.upload.addEventListener("progress", e => {
        progress(e);
    }, false);

    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === this.DONE) {

            if (this.status == 0 && disablestatbar == false) {
                document.lostconnect = true;
                if (!disablestatbar)
                    statbar.change(statbar.type.ERROR,
                        `HTTP ${this.status} ${this.statusText} >> Mất kết nối đến máy chủ. Đang thử kết nối lại...`,
                        true);
                return false;
            } else if ((this.responseText == "" || !this.responseText) && this.status != 200) {
                if (!disablestatbar)
                    statbar.change(statbar.type.ERROR,
                        `HTTP ${this.status} ${this.statusText}`,
                        false);
                error(null);
                return false;
            }

            if (type == "json") {
                try {
                    var res = JSON.parse(this.responseText);
                } catch (e) {
                    if (!disablestatbar)
                        statbar.change(statbar.type.ERROR, e, false);
                    error(e);
                    return false;
                }

                if (this.status != 200 || (res.code != 0 && res.code < 100)) {
                    if (!disablestatbar)
                        statbar.change(statbar.type.ERROR,
                            `[${res.code}] HTTP ${this.status} ${this.statusText} >> ${res.description}`,
                            false);
                    error(res);
                    return false;
                }
                resdata = res.data;
            } else {
                if (this.status != 200) {
                    if (!disablestatbar)
                        statbar.change(statbar.type.ERROR,
                            `HTTP ${this.status} ${this.statusText}`,
                            false);
                    error(res);
                    return false;
                }
                resdata = this.responseText;
            }

            if (document.lostconnect == true) {
                document.lostconnect = false;
                if (!disablestatbar) {
                    statbar.change(statbar.type.OK,
                        `HTTP ${this.status} ${this.statusText} >> Đã kết nối tới máy chủ.`,
                        false);
                    statbar.hide(3000);
                }
            }
            callout(resdata);
        }
    });

    xhr.open(method, url);
    xhr.send(pd);
}

function comparearray(arr1, arr2) {
    if (JSON.stringify(arr1) == JSON.stringify(arr2))
        return true;
    return false;
}

function escape_html(str) {

    if ((str === null) || (str === ""))
        return "";
    else
        str = str.toString();

    var map = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "\'": "&#039;"
    };

    return str.replace(/[&<>"']/g, function (m) {
        return map[m];
    });
}

function fcfn(nodes, classname) {
    for (var i = 0; i < nodes.length; i++)
        if (nodes[i].className && nodes[i].classList.contains(classname))
            return nodes[i];
}

function parsetime(t = 0) {
    var d = "";
    if (t < 0) {
        t = -t;
        d = "-";
    }
    var h = Math.floor(t / 3600);
    var m = Math.floor(t % 3600 / 60);
    var s = Math.floor(t % 3600 % 60);
    
    return {
        "h": h,
        "m": m,
        "s": s,
        "str": d + [h, m, s]
            .map(v => v < 10 ? "0" + v : v)
            .filter((v,i) => v !== "00" || i > 0)
            .join(":")
    }
};

function $(selector) {
    var n = selector.slice(1, selector.length);
    switch (selector.charAt(0)) {
        case ".":
            return document.getElementsByClassName(n);
        case "#":
            return document.getElementById(n);
        case "@":
            return document.getElementsByName(n);
        default:
            return document.getElementsByTagName(selector);
    }
}