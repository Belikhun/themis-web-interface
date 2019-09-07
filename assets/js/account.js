//? |-----------------------------------------------------------------------------------------------|
//? |  /assets/js/config.js                                                                         |
//? |                                                                                               |
//? |  Copyright (c) 2018-2019 Belikhun. All right reserved                                         |
//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
//? |-----------------------------------------------------------------------------------------------|

const sbar = new statusBar(document.body);
sbar.additem(USERNAME, "account", {space: false, aligin: "left"});

document.__onclog = (type, ts, msg) => {
    type = type.toLowerCase();
    const typelist = ["okay", "warn", "errr", "crit", "lcnt"]
    if (typelist.indexOf(type) === -1)
        return false;

    sbar.msg(type, msg, {time: ts, lock: (type === "crit" || type === "lcnt") ? true : false});
}

$("body").onload = e => {
    if (cookie.get("__darkMode") === "true")
        document.body.classList.add("dark");

    if (window.frameElement)
        document.body.classList.add("embeded");

    sounds.init();
}