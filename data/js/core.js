//|====================================================|
//|                      core.js                       |
//|            Copyright (c) 2018 Belikhun.            |
//|      This file is licensed under MIT license.      |
//|====================================================|

function getapi(url = null, method = "GET", callout = () => {}, file = null, onprogress = () => {}, error = function (ise, res, t) {
    if (ise)
        statbar.change(statbar.type.ERROR, res, false);
    else {
        statbar.change(statbar.type.ERROR,
            "[" + res.code + "] " + t.status + " " + t.statusText + " >> " + res.description,
            false);
    }
}) {
    var xhr = new XMLHttpRequest();
    var fd = new FormData();
    fd.append("file", file);

    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === this.DONE) {
            try {
                var res = JSON.parse(this.responseText);
            } catch (e) {
                error(true, e);
                return;
            }

            if (this.status != 200 || res.code != 0) {
                error(false, res, this);
            } else {
                callout(res.data);
            }
        }
    });

    xhr.upload.addEventListener("progress", function (e) {
        onprogress(e);
    }, false);

    xhr.open(method, url);
    xhr.send(fd);
}

function fcfn(nodes, classname) {
    for (var i = 0; i < nodes.length; i++)
        if (nodes[i].className && nodes[i].classList.contains(classname))
            return nodes[i];
}

function comparearray(arr1, arr2) {
    if (JSON.stringify(arr1) == JSON.stringify(arr2))
        return true;
    return false;
}

function parsetime(secs = 0) {
    var d = "";
    if (secs < 0) {
        secs = -secs;
        d = "-";
    }
    var sec_num = parseInt(secs, 10)    
    var hours   = Math.floor(sec_num / 3600) % 24
    var minutes = Math.floor(sec_num / 60) % 60
    var seconds = sec_num % 60
    
    return {
        "h": hours,
        "m": minutes,
        "s": seconds,
        "str": d + [hours,minutes,seconds]
        .map(v => v < 10 ? "0" + v : v)
        .filter((v,i) => v !== "00" || i > 0)
        .join(":")
    }
};

class regPanel {
    constructor(elem) {
        if (elem.tagName != "PANEL")
            return false;

        this.elem = elem;
        var ehead = fcfn(elem.childNodes, "head").childNodes;
        this.etitle = fcfn(ehead, "le");
        var ri = fcfn(ehead, "ri").childNodes;
        this.eref = fcfn(ri, "ref");
        this.eset = fcfn(ri, "set");
        this.emain = fcfn(elem.childNodes, "main");
    }

    get main() {
        return this.emain;
    }

    refonclick(f = () => {}) {
        this.eref.addEventListener("click", f, true);
    }

    setonclick(f = () => {}) {
        this.eset.addEventListener("click", f, true);
    }

    hideref(b = true) {
        if (b)
            this.eref.style.display = "none";
        else
            this.eref.style.display = "inline-block";
    }

    hideset(b = true) {
        if (b)
            this.eset.style.display = "none";
        else
            this.eset.style.display = "inline-block";
    }

    title(s = "") {
        this.etitle.innerText = s;
    }
}

core = {
    logpanel: new regPanel(document.getElementById("logp")),
    rankpanel: new regPanel(document.getElementById("rankp")),
    plogdata: new Array(),
    prankdata: new Array(),
    flogint: null,
    frankint: null,

    init: function () {
        document.getElementById("loader").classList.add("done");
        this.file.init();
        this.timer.init();
        this.userpanel.init();
        this.fetchlog();
        this.fetchrank();
        this.file.fileseled = this.uploadfile;
        this.logpanel.refonclick(() => {
            core.fetchlog(true);
        });
        this.rankpanel.refonclick(() => {
            core.fetchrank(true);
        });
        core.flogint = setInterval(this.fetchlog, 5000);
        core.frankint = setInterval(this.fetchrank, 5000);
    },

    uploadfile: function (file) {
        getapi("/api/test/upload", "POST", function (d) {
            statbar.change(statbar.type.ok, "Tải tệp lên thành công!");
            core.file.state.innerText = "Tải lên thành công!";
        }, file, function (e) {
            core.file.size.innerText = e.loaded + "/" + e.total;
            core.file.percent.innerText = ((e.loaded / e.total) * 100).toFixed(0) + "%";
            core.file.bar.style.width = (e.loaded / e.total) * 100 + "%";
        }, function (ise, res, t) {
            if (ise)
                statbar.change(statbar.type.ERROR, res, false);
            else {
                statbar.change(statbar.type.ERROR,
                    "[" + res.code + "] " + t.status + " " + t.statusText + " >> " + res.description,
                    false);
            }
            core.file.state.innerText = "Tải lên thất bại";
        })
    },

    fetchlog: function (bypass = false) {
        getapi("/api/test/logs", "GET", function (data) {
            if (comparearray(data, core.plogdata) && !bypass)
                return;
            console.log("update log");

            core.logpanel.main.innerHTML = "";
            out = "<ul class=\"log-item-container\">\n";
            for (var i = 0; i < data.length; i++) {
                out += [
                    "<li class=\"log-item\">",
                    "<div class=\"h\">",
                    "<ul class=\"l\">",
                    "<li class=\"t\">" + data[i].lastmodify + "</li>",
                    "<li class=\"n\">" + data[i].name + "</li>",
                    "</ul>",
                    "<t class=\"r\">" + data[i].out + "</t>",
                    "</div>",
                    "<a class=\"d\" href=\"" + data[i].url + "\"></a>",
                    "</li>"
                ].join("\n");
            }
            out += "</ul>";
            core.logpanel.main.innerHTML = out;
            core.plogdata = data;
        })
    },

    fetchrank: function (bypass = false) {
        getapi("/api/test/rank", "GET", function (data) {
            if (comparearray(data, core.prankdata) && !bypass)
                return;
            console.log("update rank");

            core.rankpanel.main.innerHTML = "";
            var list = data.list;
            var out = [
                "<table>",
                    "<tr>",
                        "<th>#</th>",
                        "<th>Thí sinh</th>",
                        "<th>Tổng</th>",
            ].join("\n");
            console.log(list.length);
            for (var i = 0; i < list.length; i++)
                out += "<th>" + list[i] + "</th>\n";
            out += "</tr>\n";

            var ptotal = 0;
            var rank = 0;

            for (var i = 0; i < data.rank.length; i++) {
                if (ptotal != data.rank[i].total) {
                    ptotal = data.rank[i].total;
                    rank++;
                }

                out += [
                    "<tr>",
                        "<td>" + rank + "</td>",
                        "<td>",
                            "<img class=\"avt\" src=\"/api/avt/get?u=" + data.rank[i].username + "\">",
                            "<t class=\"name\">" + escape(data.rank[i].name) + "</t>",
                        "</td>",
                        "<td class=\"number\">" + parseFloat(data.rank[i].total).toFixed(2) + "</td>"
                ].join("\n");

                for (var j = 0; j < list.length; j++)
                    out += "<td class=\"number\">" + parseFloat(data.rank[i].list[list[j]]).toFixed(2) + "</td>\n";
                
                out += "</tr>";
            }
            out += "</table>";
            core.rankpanel.main.innerHTML = out;
            core.prankdata = data;
        });
    },

    file: {
        dropzone: document.getElementById("file_dropzone"),
        state: document.getElementById("file_upstate"),
        name: document.getElementById("file_name"),
        bar: document.getElementById("file_bar"),
        percent: document.getElementById("file_perc"),
        size: document.getElementById("file_size"),
        panel: new regPanel(document.getElementById("uploadp")),
        fileseled: function() {},

        init: function () {
            this.dropzone.addEventListener("dragenter", this.dragenter, false);
            this.dropzone.addEventListener("dragleave", this.dragleave, false);
            this.dropzone.addEventListener("dragover", this.dragover, false);
            this.dropzone.addEventListener("drop", this.filesel, false);
            this.panel.refonclick(this.reset);
            this.panel.hideset();
        },

        reset: function () {
            core.file.dropzone.classList.remove("hide");
            core.file.name.innerText = "null";
            core.file.state.innerText = "null";
            core.file.size.innerText = "00/00";
            core.file.percent.innerText = "0%";
            core.file.bar.style.width = "0%";
        },

        filesel: function (e) {
            e.stopPropagation();
            e.preventDefault();
            this.classList.remove("drag");

            var file = e.dataTransfer.files[0];

            this.classList.add("hide");
            core.file.name.innerText = file.name;
            core.file.state.innerText = "Đang tải lên...";
            core.file.size.innerText = "00/00";
            core.file.percent.innerText = "0%";
            core.file.bar.style.width = "0%";
            setTimeout(() => {
                core.file.fileseled(file);
            }, 1000);
        },

        dragenter: function (e) {
            e.stopPropagation();
            e.preventDefault();
            this.classList.add("drag");
        },

        dragleave: function (e) {
            e.stopPropagation();
            e.preventDefault();
            this.classList.remove("drag");
        },

        dragover: function (e) {
            e.stopPropagation();
            e.preventDefault();
            e.dataTransfer.dropEffect = "copy";
            this.classList.add("drag");
        }
    },

    timer: {
        timepanel: new regPanel(document.getElementById("timep")),
        state: document.getElementById("time_state"),
        time: document.getElementById("time_time"),
        bar: document.getElementById("time_bar"),
        start: document.getElementById("time_start"),
        end: document.getElementById("time_end"),
        timedata: Array(),
        interval: null,
        last: 0,

        init: function() {
            this.timepanel.hideset();
            this.timepanel.refonclick(core.timer.fetchtime);
            this.fetchtime(true);
        },

        fetchtime: function(init = false) {
            getapi("/api/test/timer", "GET", function(data) {
                core.timer.timedata = data;
                if (data.d == 0)
                    return;
                if (init) {
                    document.getElementById("timep").classList.add("show");
                    core.timer.last = 0;
                    clearInterval(core.timer.interval);
                    core.timer.startinterval();
                }
            });
        },

        startinterval: function() {
            core.timer.timeupdate();
            core.timer.interval = setInterval(() => {
                core.timer.timedata.t--;
                core.timer.timeupdate();
            }, 1000);
        },

        reset: function() {
            clearInterval(this.interval);
            this.time.classList.remove("red");
            this.time.classList.remove("green");
            this.time.innerText = "--:--";
            this.bar.style.width = "0%";
            this.start.innerText = "--:--";
            this.end.innerText = "--:--";
            this.state.innerText = "---";
            core.timer.last = 0;
            core.timer.timedata.stage = 0;
        },

        timeupdate: function() {
            if ((data = core.timer.timedata).t == 0)
                switch (data.stage) {
                    case 1:
                        core.timer.timedata.stage = 2;
                        core.timer.timedata.t = data.d;
                        break;
                    case 2:
                        core.timer.timedata.stage = 3;
                        core.timer.timedata.t = data.b;
                        break;
                    case 3:
                        core.timer.timedata.stage = 4;
                        break;
                    default:
                        console.warn("sth went wrong");
                        core.timer.reset();
                        break;
                }
            data = core.timer.timedata;
            t = data.t;

            switch(data.stage) {
                case 1:
                    if (core.timer.last == 0)
                        core.timer.last = t;
                    this.time.classList.remove("red");
                    this.time.classList.remove("green");
                    this.time.innerText = parsetime(t).str;
                    this.bar.style.width = ((t)/this.last)*100 + "%";
                    this.start.innerText = parsetime(t).str;
                    this.end.innerText = parsetime(this.last).str;
                    this.state.innerText = "Bắt đầu kì thi sau";
                    break;
                case 2:
                    this.time.classList.remove("red");
                    this.time.classList.add("green");
                    this.time.innerText = parsetime(t).str;
                    this.bar.style.width = (t/data.d)*100 + "%";
                    this.start.innerText = parsetime(t).str;
                    this.end.innerText = parsetime(data.d).str;
                    this.state.innerText = "Thời gian làm bài";
                    break;
                case 3:
                    this.time.classList.remove("green");
                    this.time.classList.add("red");
                    this.time.innerText = parsetime(t).str;
                    this.bar.style.width = (t/data.b)*100 + "%";
                    this.start.innerText = parsetime(t).str;
                    this.end.innerText = parsetime(data.b).str;
                    this.state.innerText = "Thời gian bù";
                    break;
                case 4:
                    this.time.classList.remove("green");
                    this.time.classList.remove("red");
                    this.time.innerText = parsetime(t).str;
                    this.bar.style.width = "0%";
                    this.start.innerText = parsetime(t).str;
                    this.end.innerText = "--:--";
                    this.state.innerText = "ĐÃ HẾT THỜI GIAN LÀM BÀI";
                    break;
                default:
                    statbar.change(statbar.type.ERROR, "Lỗi không rõ.");
                    break;
            }
        }
    },

    userpanel: {
        uname: document.getElementById("user_name"),
        uavt: document.getElementById("user_avt"),
        avt: document.getElementById("userp_avt"),
        avtw: document.getElementById("userp_avtw"),
        name: document.getElementById("userp_name"),
        tag: document.getElementById("userp_tag"),
        form: {
            nameform: document.getElementById("userp_edit_name_form"),
            passform: document.getElementById("userp_edit_pass_form"),
            name: document.getElementById("userp_edit_name"),
            pass: document.getElementById("userp_edit_pass"),
            npass: document.getElementById("userp_edit_npass"),
            renpass: document.getElementById("userp_edit_renpass"),
        },
        logoutbtn: document.getElementById("userp_logout"),
        toggler: document.getElementById("upanel_toggler"),

        init: function () {
            this.avtw.addEventListener("dragenter", this.dragenter, false);
            this.avtw.addEventListener("dragleave", this.dragleave, false);
            this.avtw.addEventListener("dragover", this.dragover, false);
            this.avtw.addEventListener("drop", this.filesel, false);
            this.toggler.addEventListener("click", function() {
                this.classList.toggle("showupanel");
            }, false);

            this.form.nameform.addEventListener("submit", function() {
                this.getElementsByTagName("button")[0].disabled = true;
                core.userpanel.changename(core.userpanel.form.name.value);
            }, false)

            this.form.passform.addEventListener("submit", function() {
                this.getElementsByTagName("button")[0].disabled = true;
                core.userpanel.changepass(core.userpanel.form.pass.value, core.userpanel.form.npass.value, core.userpanel.form.renpass.value);
            }, false)

            this.logoutbtn.addEventListener("click", this.logout);
        },

        logout: function() {
            getapi("/api/logout", "GET", function() {
                location.reload();
            })
        },

        reset: function () {
            core.userpanel.avtw.classList.remove("drop");
            core.userpanel.avtw.classList.remove("load");
            core.userpanel.form.nameform.getElementsByTagName("button")[0].disabled = false;
            core.userpanel.form.passform.getElementsByTagName("button")[0].disabled = false;
            core.userpanel.form.name.value = null;
            core.userpanel.form.pass.value = null;
            core.userpanel.form.npass.value = null;
            core.userpanel.form.renpass.value = null;
        },

        reload: function(data, m = 0) {
            core.fetchrank(true);
            if (m == 0)
                core.userpanel.uavt.src = core.userpanel.avt.src = data.src;
            else
                core.userpanel.uname.innerText = core.userpanel.name.innerText = data;
        },
        
        changename: function(name) {
            getapi("/api/edit?n=" + name, "GET", function(res) {
                statbar.change(statbar.type.OK, "Thay đổi thông tin thành công!");
                core.userpanel.reset();
                core.userpanel.reload(res.name, 1);
            }, null, () => {}, function (ise, res, t) {
                if (ise)
                    statbar.change(statbar.type.ERROR, res, false);
                else {
                    statbar.change(statbar.type.ERROR,
                        "[" + res.code + "] " + t.status + " " + t.statusText + " >> " + res.description,
                        false);
                }
                core.userpanel.reset();
            });
        },

        changepass: function(pass, npass, renpass) {
            getapi("/api/edit?p=" + pass + "&np=" + npass + "&rnp=" + renpass, "GET", function(res) {
                statbar.change(statbar.type.OK, "Thay đổi thông tin thành công!");
                core.userpanel.reset();
            }, null, () => {}, function (ise, res, t) {
                if (ise)
                    statbar.change(statbar.type.ERROR, res, false);
                else {
                    statbar.change(statbar.type.ERROR,
                        "[" + res.code + "] " + t.status + " " + t.statusText + " >> " + res.description,
                        false);
                }
                core.userpanel.reset();
            });
        },

        filesel: function (e) {
            e.stopPropagation();
            e.preventDefault();
            this.classList.remove("drag");

            var file = e.dataTransfer.files[0];

            this.classList.add("load");
            setTimeout(() => {
                core.userpanel.avtupload(file);
            }, 1000);
        },

        avtupload: function(file) {
            getapi("/api/avt/change", "POST", function (d) {
                core.userpanel.reset();
                core.userpanel.reload(d);
            }, file, () => {}, function (ise, res, t) {
                if (ise)
                    statbar.change(statbar.type.ERROR, res, false);
                else {
                    statbar.change(statbar.type.ERROR,
                        "[" + res.code + "] " + t.status + " " + t.statusText + " >> " + res.description,
                        false);
                }
                core.userpanel.reset();
            });
        },

        dragenter: function (e) {
            e.stopPropagation();
            e.preventDefault();
            this.classList.add("drag");
        },

        dragleave: function (e) {
            e.stopPropagation();
            e.preventDefault();
            this.classList.remove("drag");
        },

        dragover: function (e) {
            e.stopPropagation();
            e.preventDefault();
            e.dataTransfer.dropEffect = "copy";
            this.classList.add("drag");
        }

    }

}