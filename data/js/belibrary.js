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
    onupload = e => {},
    ondownload = e => {},
}, callout = () => {}, error = () => {}, disablesbar = false) {
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
        onupload(e);
    }, false);

    xhr.addEventListener("progress", e => {
        ondownload(e);
    })

    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === this.DONE) {

            if (this.status == 0 && disablesbar == false) {
                document.lostconnect = true;
                clog("errr", "Lost connection to server.");
                if (!disablesbar)
                    sbar.change(sbar.type.ERROR,
                        `HTTP ${this.status} ${this.statusText} >> Mất kết nối đến máy chủ. Đang thử kết nối lại...`,
                        true);
                return false;
            } else if ((this.responseText == "" || !this.responseText) && this.status != 200) {
                clog("errr", {
                    color: flatc("red"),
                    text: "HTTP" + this.status
                }, this.statusText, {
                    color: flatc("magenta"),
                    text: method
                }, {
                    color: flatc("pink"),
                    text: url
                });

                if (!disablesbar)
                    sbar.change(sbar.type.ERROR,
                        `HTTP ${this.status} ${this.statusText} ${url}`,
                        false);
                error(null);
                return false;
            }

            if (type == "json") {
                try {
                    var res = JSON.parse(this.responseText);
                } catch (e) {
                    clog("errr", e);

                    if (!disablesbar)
                        sbar.change(sbar.type.ERROR, e, false);
                    error(e);
                    return false;
                }

                if (this.status != 200 || (res.code != 0 && res.code < 100)) {
                    clog("errr", {
                        color: flatc("magenta"),
                        text: method
                    }, {
                        color: flatc("pink"),
                        text: url
                    }, {
                        color: flatc("red"),
                        text: "HTTP " + this.status
                    }, this.statusText, ` >>> ${res.description}`);

                    if (!disablesbar)
                        sbar.change(sbar.type.ERROR,
                            `[${res.code}] HTTP ${this.status} ${this.statusText} >> ${res.description}`,
                            false);
                    error(res);
                    return false;
                }
                data = res.data;
                rawdata = res;
            } else {
                if (this.status != 200) {
                    clog("errr", {
                        color: flatc("red"),
                        text: "HTTP" + this.status
                    }, this.statusText, {
                        color: flatc("magenta"),
                        text: method
                    }, {
                        color: flatc("pink"),
                        text: url
                    });

                    if (!disablesbar)
                        sbar.change(sbar.type.ERROR,
                            `HTTP ${this.status} ${this.statusText}`,
                            false);
                    error(res);
                    return false;
                }
                data = this.responseText;
                rawdata = null;
            }

            if (document.lostconnect == true) {
                document.lostconnect = false;
                if (!disablesbar) {
                    sbar.change(sbar.type.OK,
                        `HTTP ${this.status} ${this.statusText} >> Đã kết nối tới máy chủ.`,
                        false);
                    sbar.hide(3000);
                }
            }
            callout(data, rawdata);
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
            .filter((v, i) => v !== "00" || i > 0)
            .join(":")
    }
}

function round(number, to = 2) {
    const d = Math.pow(10, to);
    return Math.round(number * d) / d;
}

class stopclock {
    __time(date = new Date()) {
        return date.getTime();
    }

    constructor(date = new Date()) {
        this.start = this.__time(date);
    }

    get stop() {
        return (this.__time() - this.start) / 1000;
    }
}

function currentscript() {
    var url = (document.currentScript) ? document.currentScript.src : "unknown";
    return url.substring(url.lastIndexOf("/") + 1);
}

/**
 * Add padding in the left of input if input length is smaller than function length arg.
 *  
 * @param {string} inp Input in String
 * @param {number} inp Input in Number
 * @param {number} length Length
 */
function pleft(inp, length = 0) {
    type = typeof inp;
    inp = (type === "number") ? inp.toString() : inp;
    padd = "";

    switch (type) {
        case "number":
            padd = "0";
            break;

        case "string":
            padd = " ";
            break;

        default:
            console.error(`error: pleft() first arg is ${type}`);
            return false;
    }

    padd = padd.repeat((length - inp.length < 0) ? 0 : length - inp.length);
    return padd + inp;
}

/**
 * Flat Color list from https://flatuicolors.com/palette/defo
 * Return HEX string color code.
 * 
 * @param {string} color 
 */
function flatc(color) {
    const clist = {
        green: "#27ae60",
        red: "#c0392b",
        blue: "#2980b9",
        aqua: "#16a085",
        yellow: "#f39c12",
        orange: "#e67e22",
        gray: "#2c3e50",
        magenta: "#8854d0",
        black: "#2C3A47",
        pink: "#f368e0"
    }

    return (clist[color]) ? clist[color] : clist.black;
}

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

//|====================================================|
//|                 from web-clog.js                   |
//|            Copyright (c) 2018 Belikhun.            |
//|      This code is licensed under MIT license.      |
//|====================================================|

function clog(level, ...args) {
    const font = "Comic Sans MS";
    const size = "15";
    var date = new Date();
    level = level.toUpperCase();
    lc = flatc({
        DEBG: "blue",
		OKAY: "green",
		INFO: "magenta",
		WARN: "yellow",
		ERRR: "red",
		CRIT: "gray",
    }[level])

    text = [{
            color: flatc("aqua"),
            text: `${pleft(date.getHours(), 2)}:${pleft(date.getMinutes(), 2)}:${pleft(date.getSeconds(), 2)}`,
            padding: 8
        }, {
            color: flatc("blue"),
            text: round(sc.stop, 3).toFixed(3),
            padding: 8
        }, {
            color: lc,
            text: level,
            padding: 6
        }
    ]

    text = text.concat(args);
    var out = new Array();
    out[0] = "";
    var n = 1;
    // i | 1   2   3   4   5     6
    // j | 0   1   2   3   4     5
    // n | 1 2 3 4 5 6 7 8 9 10 11

    for (var i = 1; i <= text.length; i++) {
        item = text[i-1];
        if (typeof item === "string" || typeof item === "number") {
            out[0] += `%c${item} `;
            out[n] = `font-size: ${size}px; font-family: ${font}; color: ${flatc("black")}`;
            n += 1;
        } else if (typeof item === "object") {
            out[0] += `%c${pleft(item.text, ((item.padding) ? item.padding : 0))}`
            if (item.padding) {
                out[0] += "%c| ";
                out[n] = `font-size: ${size}px; color: ${item.color};`;
                out[n+1] = `font-size: ${size}px; color: ${item.color}; font-weight: bold;`;
                n += 2;
            } else {
                out[0] += " ";
                out[n] = `font-size: ${size}px; font-family: ${font}; color: ${item.color}`;
                n += 1;
            }
        } else
            console.error(`error: type ${typeof item}`)
    }

    console.log.apply(this, out);
}

// Init
sc = new stopclock();
clog("info", "Log started at:", {
    color: flatc("green"),
    text: (new Date()).toString()
})

window.onerror = function(message, source, line, col) {
    clog("crit", {
        color: flatc("red"),
        text: message
    }, "at", {
        color: flatc("aqua"),
        text: `${source}:${line}`
    }, {
        color: flatc("yellow"),
        text: `column ${col}.`
    })
}