//? |-----------------------------------------------------------------------------------------------|
//? |  /data/js/belibrary.js                                                                        |
//? |                                                                                               |
//? |  Copyright (c) 2018-2019 Belikhun. All right reserved                                         |
//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
//? |-----------------------------------------------------------------------------------------------|

function myajax({
    url = "/",
    method = "GET",
    query = Array(),
    form = Array(),
    file = null,
    type = "json",
    onupload = () => {},
    ondownload = () => {},
    rawdata = false,
}, callout = () => {}, error = () => {}) {
    return new Promise((resolve, reject) => {
        if (__connection__.onlineState === false) {
            const t = {code: 105, description: "Disconnected to Server"};
            reject(t);
            error(t);
            return false;
        }

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
            if (i === 0)
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

        xhr.addEventListener("readystatechange", function() {
            if (this.readyState === this.DONE) {

                if (this.status === 0) {
                    __connection__.stateChange(false);

                    const t = {code: 105, description: "Disconnected to Server"};
                    reject(t);
                    error(t);
                    return false;
                } else if ((this.responseText === "" || !this.responseText) && this.status !== 200) {
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

                    error(null);
                    reject({code: 1, description: `HTTP ${this.status}: ${this.statusText}`});
                    return false;
                }

                if (type === "json") {
                    try {
                        var res = JSON.parse(this.responseText);
                    } catch (e) {
                        clog("errr", "Error parsing JSON.");

                        error(e);
                        reject({code: 2, description: `Error parsing JSON`, data: e});
                        return false;
                    }

                    if (this.status !== 200 || (res.code !== 0 && res.code < 100)) {
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

                        error(res);
                        reject({code: 3, description: `HTTP ${this.status}: ${this.statusText}`, data: res});
                        return false;
                    }

                    data = rawdata ? res : res.data;
                    rawdata = res;
                } else {
                    if (this.status !== 200) {
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

                        error(res);
                        reject({code: 3, description: `HTTP ${this.status}: ${this.statusText}`, data: res});
                        return false;
                    }
                    data = this.responseText;
                    rawdata = null;
                }

                if (document.lostconnect === true) {
                    document.lostconnect = false;
                    clog("okay", "Connected to server");
                }
                callout(data, rawdata);
                resolve(data, rawdata);
            }
        })
        
        xhr.open(method, url);
        xhr.send(pd);
    })
}

function delayAsync(time) {
    return new Promise((resolve, reject) => {
        setTimeout(e => {
            resolve();
        }, time);
    });
}

function comparearray(arr1, arr2) {
    if (JSON.stringify(arr1) === JSON.stringify(arr2))
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
        "'": "&#039;"
    };

    return str.replace(/[&<>"']/g, function (m) {
        return map[m];
    });
}

function fcfn(nodes, classname) {
    return nodes.getElementsByClassName(classname)[0];
}

function buildElementTree(type = "div", __class = [], data = new Array()) {
    var tree = document.createElement(type);
    if (typeof __class == "string")
        __class = new Array([__class]);
    tree.classList.add.apply(tree.classList, __class);
    var objtree = new Array();
    objtree.this = tree;

    for (var i = 0; i < data.length; i++) {
        var d = data[i];
        if (typeof d.list == "object") {
            var t = buildElementTree(d.type, d.class, d.list);
            t.tree.dataset.name = d.name;
            tree.appendChild(t.tree);
            objtree[d.name] = new Array();
            objtree[d.name].this = t.tree;
            Object.assign(objtree[d.name], t.obj);
        } else {
            var t = document.createElement(d.type);
            if (typeof d.class == "string")
                d.class = new Array([d.class]);
            t.classList.add.apply(t.classList, d.class);
            t.dataset.name = d.name;
            tree.appendChild(t);
            objtree[d.name] = t;
        }
    }

    return {
        obj: objtree,
        tree: tree
    }
}

function checkServer(ip, callback = () => {}) {
    return new Promise((resolve, reject) => {
        var xhr = new XMLHttpRequest();
        var pon = {};
        
        xhr.addEventListener("readystatechange", function() {
            if (this.readyState === this.DONE) {
                if (this.status === 0) {
                    pon = {
                        code: -1,
                        description: "Server Offline"
                    }
                    reject(pon);
                } else {
                    pon = {
                        code: 0,
                        description: "Server Online"
                    }
                    resolve(pon);
                }
                callback(pon);
            }
        })

        xhr.open("GET", ip);
        xhr.send();
    })
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
    var ms = pleft(parseInt(t.toString().split(".")[1]), 3);

    return {
        h: h,
        m: m,
        s: s,
        ms: ms,
        str: d + [h, m, s]
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

function randBetween(min, max, toInt = true) {
    var rand = Math.random() * (max - min + 1) + min;
    return toInt ? Math.floor(rand) : rand;
}

function $(selector) {
    return document.querySelector(selector);
}

cookie = {
    cookie: null,

    getAll() {
        const mycookie = document.cookie.split("; ");
        var dacookie = {};

        for (var i = 0; i < mycookie.length; i++) {
            var t = mycookie[i].split("=");
            dacookie[t[0]] = t[1];
        }
        
        this.cookie = dacookie;
        return dacookie;
    },

    get(key, def = null) {
        if (!this.cookie)
            this.cookie = this.getAll();

        if (def !== null && typeof this.cookie[key] === "undefined")
            this.set(key, def, 9999);

        return this.cookie[key] || def;
    },

    set(key, value = "", days = 0, path = "/") {
        var exp = "";
        if (days !== 0 && typeof days === "number") {
            var date = new Date();
            date.setTime(date.getTime() + (days*24*60*60*1000));
            exp = `; expires=${date.toUTCString()}`;
        }
        
        document.cookie = `${key}=${value}${exp}; path=${path}`;

        this.cookie = this.getAll();
        return true;
    },
}

//? |-----------------------------------------------------------------------------------------------|
//? |  from web-clog.js                                                                             |
//? |                                                                                               |
//? |  Copyright (c) 2018-2019 Belikhun. All right reserved                                         |
//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
//? |-----------------------------------------------------------------------------------------------|

function clog(level, ...args) {
    const font = "Segoe UI";
    const size = "15";
    var date = new Date();
    const rtime = round(sc.stop, 3).toFixed(3);
    var str = "";

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
            text: rtime,
            padding: 8
        }, {
            color: flatc("red"),
            text: window.location.pathname,
            padding: 16
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
            if (i > 4) str += `${item} `;
            out[0] += `%c${item} `;
            out[n] = `font-size: ${size}px; font-family: ${font}; color: ${flatc("black")}`;
            n += 1;
        } else if (typeof item === "object") {
            var t = pleft(item.text, ((item.padding) ? item.padding : 0));
            if (i > 4) str += t + " ";
            out[0] += `%c${t}`;
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

    document.__onclog(level, rtime, str);
    console.log.apply(this, out);
}

if (typeof document.__onclog === "undefined")
    document.__onclog = (lv, t, m) => {};

// Init
sc = new stopclock();
clog("info", "Log started at:", {
    color: flatc("green"),
    text: (new Date()).toString()
})

// Error handling

window.addEventListener("error", e => {
    clog("crit", {
        color: flatc("red"),
        text: e.message
    }, "at", {
        color: flatc("aqua"),
        text: `${e.filename}:${e.lineno}:${e.colno}`
    })
})

// window.addEventListener("unhandledrejection", (e) => {
//     // promise: e.promise; reason: e.reason
// })

__connection__ = {
    onlineState: true,
    checkEvery: 2000,
    checkInterval: null,
    checkCount: 0,
    __sbarItem: null,

    stateChange(isOnline = true) {
        if (!typeof isOnline === "boolean" || isOnline === this.onlineState)
            return false;

        clog("INFO", `We just went ${isOnline ? "online" : "offline"}!`);
        this.onlineState = isOnline;

        if (isOnline === true) {
            clog("okay", "Đã kết nối tới máy chủ.");
            if (this.__sbarItem)
                this.__sbarItem.remove();

            clearInterval(this.checkInterval);
        } else {
            clog("lcnt", "Mất kết nối tới máy chủ.");
            this.checkCount = 0;
            this.__sbarItem = (sbar) ? sbar.additem("Đang thử kết nối lại...", "spinner", {aligin: "right"}) : null;

            this.checkInterval = setInterval(() => {
                this.checkCount++;
                if (this.__sbarItem)
                    this.__sbarItem.change(`Đang thử kết nối lại... [Lần ${this.checkCount}]`);
                    
                await this.__checkConnectionState();
            }, this.checkEvery);
        }
    },

    async __checkConnectionState() {
        data = await checkServer(window.location.origin);

        if (data.code === 0)
            return this.stateChange(true);
    }
}