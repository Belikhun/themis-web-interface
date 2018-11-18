//|====================================================|
//|                    statbar.js                      |
//|            Copyright (c) 2018 Belikhun.            |
//|      This file is licensed under MIT license.      |
//|====================================================|

sbar = {
    main: document.getElementById("container"),
    bar: {
        bar: document.getElementById("status"),
        text: document.getElementById("status").getElementsByClassName("text")[0],
        close: document.getElementById("status").getElementsByClassName("close")[0],
    },
    hidetimeout: setTimeout(() => {}, 0),
    type: Object.freeze({
        "OK": 0,
        "INFO": 1,
        "WARNING": 2,
        "ERROR": 3,
        0: "OK",
        1: "INFO",
        2: "WARNING",
        3: "ERROR",
    }),
    showing: false,

    init () {
        this.bar.close.addEventListener("click", e => {this.hide()});
    },

    change (type = 0, msgs = "Sample Text", spinner = false) {
        var clist = "";

        switch (type) {
            case 0:
                clist += "ok";
                break;
            case 1:
                clist += "info";
                break;
            case 2:
                clist += "warning";
                break;
            case 3: 
                clist += "error";
                break;
            default:
                clist += "info";
                break;
        }

        if (spinner)
            clist += " spinner";

        this.bar.bar.className = clist;
        this.main.classList.add("sbar");

        if (type == 0)
            this.bar.text.innerText = msgs
        else
            this.bar.text.innerText = this.type[type] + ": " + msgs;

        this.hide(-1);
        this.showing = true;

        return true;
    },

    hide (delay = 0) {
        clearTimeout(this.hidetimeout);
        if (delay < 0) return false;

        this.hidetimeout = setTimeout(e => {
            this.bar.bar.className = "";
            this.main.classList.remove("sbar");
            this.showing = false;
        }, delay);

        return true;
    }
}