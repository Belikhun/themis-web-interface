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
    header = Array(),
    type = "json",
    onUpload = () => {},
    onDownload = () => {},
    rawData = false,
    force = false,
    changeState = true,
    reRequest = true,
}, callout = () => {}, error = () => {}) {
    return new Promise((resolve, reject) => {
        if (__connection__.onlineState !== "online" && force === false) {
            let errorObj = {}
            switch (__connection__.onlineState) {
                case "offline":
                    errorObj = { code: 106, description: "Disconnected to Server" }
                    break;
                case "ratelimited":
                    errorObj = { code: 32, description: "Rate Limited" }
                    break;
            }

            reject(errorObj);
            error(errorObj);

            return;
        }

        var xhr = new XMLHttpRequest();
        let formData = new FormData();

        for (let key of Object.keys(form))
            formData.append(key, form[key]);

        let queryKey = Object.keys(query);
        for (let key of queryKey)
            url += `${(queryKey[0] === key) ? "?" : ""}${key}=${query[key]}${(queryKey[queryKey.length - 1] !== key) ? "&" : ""}`;

        xhr.upload.addEventListener("progress", e => onUpload(e), false);
        xhr.addEventListener("progress", e => onDownload(e), false);

        xhr.addEventListener("readystatechange", async function() {
            if (this.readyState === this.DONE) {
                if (this.status === 0) {
                    if (changeState === true)
                        __connection__.stateChange("offline");
                        
                    let errorObj = { code: 106, description: "Disconnected to Server" };
                    reject(errorObj);
                    error(errorObj);

                    return;
                }
                
                if ((this.responseText === "" || !this.responseText) && this.status !== 200) {
                    clog("errr", {
                        color: flatc("red"),
                        text: `HTTP ${this.status}:`
                    }, this.statusText, {
                        color: flatc("magenta"),
                        text: method
                    }, {
                        color: flatc("pink"),
                        text: url
                    });

                    let errorObj = { code: 1, description: `HTTP ${this.status}: ${this.statusText}` }
                    error(errorObj);
                    reject(errorObj);

                    return;
                }

                if (type === "json") {
                    try {
                        var res = JSON.parse(this.responseText);
                    } catch (data) {
                        clog("errr", "Error parsing JSON.");

                        let errorObj = { code: 2, description: `Error parsing JSON`, data: data }
                        error(errorObj);
                        reject(errorObj);

                        return;
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

                        if (this.status === 429 && res.code === 32 && reRequest === true) {
                            // Waiting for :?unratelimited:?
                            await __connection__.stateChange("ratelimited", res);

                            // Resend previous ajax request
                            let r = await myajax({
                                url: url,
                                method: method,
                                query: query,
                                form: form,
                                type: type,
                                onUpload: onUpload,
                                onDownload: onDownload,
                                rawData: rawData,
                            }, callout, error).catch(d => {
                                reject(d);
                            })
                            // Resolve promise
                            resolve(r);

                            return;
                        } else {
                            let errorObj = { code: 3, description: `HTTP ${this.status}: ${this.statusText}`, data: res }
                            error(errorObj);
                            reject(errorObj);

                            return;
                        }
                    }

                    data = rawData ? res : res.data;
                    rawData = res;
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

                        let errorObj = { code: 3, description: `HTTP ${this.status}: ${this.statusText}`, data: res }
                        error(errorObj);
                        reject(errorObj);

                        return;
                    }

                    data = this.responseText;
                    rawData = null;
                }

                callout(data, rawData);
                resolve(data, rawData);
            }
        })
        
        xhr.open(method, url);

        for (let key of Object.keys(header))
            xhr.setRequestHeader(key, header[key]);

        xhr.send(formData);
    })
}

function delayAsync(time) {
    return new Promise((resolve, reject) => {
        setTimeout(e => {
            resolve();
        }, time);
    });
}

function compareJSON(obj1, obj2) {
    if (JSON.stringify(obj1) === JSON.stringify(obj2))
        return true;
    return false;
}

function escapeHTML(str) {
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

function buildElementTree(type = "div", __class = [], data = new Array(), __keypath = "") {
    var tree = document.createElement(type);
    if (typeof __class == "string")
        __class = new Array([__class]);
    tree.classList.add.apply(tree.classList, __class);
    var objtree = tree;

    for (var i = 0; i < data.length; i++) {
        var d = data[i];
        if (typeof d.list == "object") {
            let k = __keypath + (__keypath === "" ? "" : ".") + d.name;
            var t = buildElementTree(d.type, d.class, d.list, k);

            t.tree.dataset.name = d.name;
            t.tree.dataset.path = k;
            tree.appendChild(t.tree);
            objtree[d.name] = t.tree;
            Object.assign(objtree[d.name], t.obj);
        } else {
            let k = __keypath + (__keypath === "" ? "" : ".") + d.name;
            var t = document.createElement(d.type);
            if (typeof d.class == "string")
                d.class = new Array([d.class]);

            t.classList.add.apply(t.classList, d.class);
            t.dataset.name = d.name;
            t.dataset.path = k;
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

function time(date = new Date()) {
    return date.getTime() / 1000;
}

function parseTime(t = 0, padding = 3) {
    var d = "";
    if (t < 0) {
        t = -t;
        d = "-";
    }
    var h = Math.floor(t / 3600);
    var m = Math.floor(t % 3600 / 60);
    var s = Math.floor(t % 3600 % 60);
    var ms = pleft(parseInt(t.toFixed(padding).split(".")[1]), padding);

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

function convertSize(bytes) {
    let sizes = ["B", "KB", "MB", "GB", "TB"];
    for (var i = 0; bytes >= 1024 && i < (sizes.length -1 ); i++)
        bytes /= 1024;

    return `${round(bytes, 2)} ${sizes[i]}`;
}

function round(number, to = 2) {
    const d = Math.pow(10, to);
    return Math.round(number * d) / d;
}

class stopClock {
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

function currentScript() {
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
 * My color template
 * Return HEX string color code.
 * 
 * @param {string} color 
 */
function flatc(color) {
    const clist = {
        green: "#A8CC8C",
        red: "#E88388",
        blue: "#71BEF2",
        aqua: "#66C2CD",
        yellow: "#DBAB79",
        orange: "#e67e22",
        gray: "#6B737E",
        magenta: "#D290E4",
        black: "#282D35",
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
sc = new stopClock();
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
//      promise: e.promise; reason: e.reason
// })

__connection__ = {
    onlineState: "online",
    checkEvery: 2000,
    checkInterval: null,
    checkCount: 0,
    __checkTime: 0,
    __sbarItem: null,
    __listeners: [],

    async stateChange(state = "online", data = {}) {
        return new Promise((resolve, reject) => {
            const s = ["online", "offline", "ratelimited"];
            if (!typeof state === "string" || state === this.onlineState || s.indexOf(state) === -1) {
                let t = {code: -1, description: `Unknown state or rejected: ${state}`}
                reject(t);
                return;
            }

            clog("INFO", `We just went`, {
                text: state,
                color: flatc("yellow")
            });

            this.onlineState = state;
            this.__triggerOnStateChange(state);
            clearInterval(this.checkInterval);

            switch(state) {
                case "online":
                    clog("okay", "Đã kết nối tới máy chủ.");
                    if (this.__sbarItem)
                        this.__sbarItem.remove();
                    resolve();
                    break;

                case "offline":
                    clog("lcnt", "Mất kết nối tới máy chủ.");
                    this.checkCount = 0;
                    this.__sbarItem = (sbar) ? sbar.additem("Đang thử kết nối lại...", "spinner", {aligin: "right"}) : null;

                    this.checkInterval = setInterval(() => {
                        this.checkCount++;
                        if (this.__sbarItem)
                            this.__sbarItem.change(`Đang thử kết nối lại... [Lần ${this.checkCount}]`);
                            
                        checkServer(window.location.origin).then((data) => {
                            if (data.code === 0) {
                                this.stateChange("online");
                                resolve();
                            }
                        });
                    }, this.checkEvery);
                    break;

                case "ratelimited":
                    clog("lcnt", data.description);
                    this.__checkTime = parseInt(data.data.reset);
                    this.__sbarItem = (sbar) ? sbar.additem(`Kết nối lại sau [${this.__checkTime}] giây`, "spinner", {aligin: "right"}) : null;

                    this.checkInterval = setInterval(() => {
                        this.__checkTime--;
                        if (this.__sbarItem)
                            this.__sbarItem.change(`Kết nối lại sau [${this.__checkTime}] giây`);

                        if (this.__checkTime <= 0) {
                            this.stateChange("online");
                            resolve();
                        }
                    }, 1000);
                break;
            }
        });
    },

    onStateChange(f) {
        if (typeof f === "function")
            this.__listeners.push(f);
    },

    __triggerOnStateChange(state) {
        for (var i of this.__listeners)
            i(state);
    }

}