//? |-----------------------------------------------------------------------------------------------|
//? |  /data/js/statusbar.js                                                                        |
//? |                                                                                               |
//? |  Copyright (c) 2018-2019 Belikhun. All right reserved                                         |
//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
//? |-----------------------------------------------------------------------------------------------|

class statusbar {

    constructor(elem) {
        if (typeof elem !== "object")
            throw `statusbar.js init: elem is not an object, ${typeof elem} given.`;

        elem.classList.add("statusbar-container");

        this.bar = document.createElement("div");
        this.bar.classList.add("statusbar");

        this.left = document.createElement("span");
        this.left.classList.add("left");
        this.bar.appendChild(this.left);
        this.center = document.createElement("span");
        this.center.classList.add("center");
        this.bar.appendChild(this.center);
        this.right = document.createElement("span");
        this.right.classList.add("right");
        this.bar.appendChild(this.right);
        
        elem.insertBefore(this.bar, elem.childNodes[0]);

        this.__checksize();
        window.addEventListener("resize", e => {
            this.__checksize(e);
        })

        this.__hidetimeout = null;
    }

    __checksize(e) {
        const bw = this.bar.offsetWidth;
        const lw = this.left.offsetWidth;
        const cw = this.center.offsetWidth;
        const rw = this.right.offsetWidth;

        if (bw - (lw + rw) < cw)
            this.bar.classList.add("small");
        else
            this.bar.classList.remove("small");
    }

    __icon(elem, icon) {
        const iconlist = ["globe", "circle", "hub", "cloud", "block", "key", "desktop", "account", "server", "warning", "error", "info", "spinner"];
        
        if (iconlist.indexOf(icon) !== -1)
            elem.classList.add(`icon-${icon}`);
    }

    additem(text = null, icon = null, {aligin = "left", space = true} = {}) {
        var item = document.createElement("span");
        var t = document.createElement("text");
        const aliginlist = ["left", "right"];
        item.classList.add("item");

        if (text) {
            t.innerText = text;
            item.title = text;
            item.appendChild(t);
        }

        this.__icon(item, icon);
        
        if (!space)
            item.classList.add("no-space");
        
        if (aliginlist.indexOf(aligin) !== -1)
            this[aligin].appendChild(item);

        return {
            __item: item,

            remove() {
                this.__item.parentElement.removeChild(this.__item);
                return true;
            },

            change(text) {
                this.__item.title = text;
                this.__item.getElementsByTagName("text")[0].innerText = text;
            },

            get() {
                return this.__item.getElementsByTagName("text")[0].innerText;
            }
        };
    }

    msg(type = "okay", text = "", {
        spinner = false,
        time = null,
        lock = false,
    } = {}) {
        clearTimeout(this.__hidetimeout);
        this.bar.classList.remove(this.__lasttype);
        
        if (type === false) {
            this.__checksize();
            this.bar.classList.remove("msg");
            return true;
        }
        
        this.center.innerHTML = "";
        type = type.toLowerCase();
        const typelist = ["info", "okay", "warn", "errr", "crit", "lcnt"]

        if (!lock)
            this.__hidetimeout = setTimeout(e => {
                this.msg(false);
            }, 6000);

        if (typelist.indexOf(type) !== -1) {
            this.__lasttype = type;
            this.bar.classList.add(type);
        }

        if (spinner) {
            var spin = document.createElement("span");
            spin.classList.add("spinner");
            this.center.appendChild(spin);
        }

        if (time) {
            var t = document.createElement("span");
            t.classList.add("time");
            t.innerText = time;
            this.center.appendChild(t);
        }

        var te = document.createElement("text");

        te.innerText = text;
        this.center.appendChild(te);
        this.__checksize();
        this.bar.classList.add("msg");
    }

}