//|====================================================|
//|                    statbar.js                      |
//|            Copyright (c) 2018 Belikhun.            |
//|      This file is licensed under MIT license.      |
//|====================================================|

statbar = {
    statcontainer: document.getElementById("status"),
    main: document.getElementById("container"),
    msgs: document.getElementById("status").getElementsByClassName("text")[0],
    close: document.getElementById("status").getElementsByClassName("close")[0],
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
    isshowing: false,

    change: function(type = 0, msgs = "Sample Text", spinner = false) {
        this.close.addEventListener("click", () => {this.hide()});
        var classlist = "";

        switch (type) {
            case 0:
                classlist += "ok";
                break;
            case 1:
                classlist += "info";
                break;
            case 2:
                classlist += "warning";
                break;
            case 3: 
                classlist += "error";
                break;
            default:
                classlist += "info";
                break;
        }

        if (spinner) {
            classlist += " spinner";
        }

        this.statcontainer.className = classlist;
        this.main.classList.add("showstatus");

        if (type == 0) this.msgs.innerText = msgs
            else this.msgs.innerText = this.type[type] + ": " + msgs;
        this.hide(-1);
        statbar.isshowing = true;

        console.log("List: " + classlist);
        return true;
    },

    hide: function(delay = 0) {
        clearTimeout(statbar.hidetimeout);
        if (delay < 0) return false;
        statbar.hidetimeout = setTimeout(() => {
            statbar.statcontainer.className = null;
            statbar.main.classList.remove("showstatus");
            statbar.isshowing = false;
        }, delay);
        return true;
    }
}