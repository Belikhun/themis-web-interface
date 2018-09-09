//|====================================================|
//|                      core.js                       |
//|            Copyright (c) 2018 Belikhun.            |
//|      This file is licensed under MIT license.      |
//|====================================================|

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
        this.eclo = fcfn(ri, "clo");
        this.emain = fcfn(elem.childNodes, "main");
    }

    get main() {
        return this.emain;
    }

    get ref() {
        var t = this;
        return {
            onclick(f = () => {}) {
                t.eref.addEventListener("click", f, true);
            },

            hide(h = true) {
                if (h)
                    t.eref.style.display = "none";
                else
                    t.eref.style.display = "inline-block";
            }
        }
    }

    get set() {
        var t = this;
        return {
            onclick(f = () => {}) {
                t.eset.addEventListener("click", f, true);
            },

            hide(h = true) {
                if (h)
                    t.eset.style.display = "none";
                else
                    t.eset.style.display = "inline-block";
            }
        }
    }

    get clo() {
        var t = this;
        return {
            onclick(f = () => {}) {
                t.eclo.addEventListener("click", f, true);
            },

            hide(h = true) {
                if (h)
                    t.eclo.style.display = "none";
                else
                    t.eclo.style.display = "inline-block";
            }
        }
    }

    set title(str = "") {
        this.etitle.innerText = str;
    }
}

core = {
    logpanel: new regPanel($("#logp")),
    rankpanel: new regPanel($("#rankp")),
    plogdata: new Array(),
    prankdata: new Array(),
    flogint: null,
    frankint: null,

    init() {
        console.log("Core init...");
        $("#loader").classList.add("done");
        this.file.init();
        this.timer.init();
        this.userpanel.init();
        this.wrapper.init();
        this.fetchlog();
        this.fetchrank();
        this.logpanel.ref.onclick(() => {
            core.fetchlog(true);
        });
        this.rankpanel.ref.onclick(() => {
            core.fetchrank(true);
        });
        core.file.onUploadSuccess = this.fetchlog;
        core.flogint = setInterval(this.fetchlog, 1000);
        core.frankint = setInterval(this.fetchrank, 2000);
    },

    fetchlog(bypass = false) {
        myajax({
            url: "/api/test/logs",
            method: "GET",
        }, function (data) {
            if (comparearray(data, core.plogdata) && !bypass)
                return;

            core.logpanel.main.innerHTML = "";
            out = "<ul class=\"log-item-container\">\n";

            for (var i = 0; i < data.judging.length; i++) {
                out += [
                    "<li class=\"log-item judging\">",
                        "<div class=\"h\">",
                            "<ul class=\"l\">",
                                "<li class=\"t\">" + data.judging[i].lastmodify + "</li>",
                                "<li class=\"n\">" + data.judging[i].name + "</li>",
                            "</ul>",
                            "<t class=\"r\">Đang chấm</t>",
                        "</div>",
                        "<a class=\"d\"></a>",
                    "</li>"
                ].join("\n");
            }

            for (var i = 0; i < data.queues.length; i++) {
                out += [
                    "<li class=\"log-item queue\">",
                        "<div class=\"h\">",
                            "<ul class=\"l\">",
                                "<li class=\"t\">" + data.queues[i].lastmodify + "</li>",
                                "<li class=\"n\">" + data.queues[i].name + "</li>",
                            "</ul>",
                            "<t class=\"r\">Đang chờ</t>",
                        "</div>",
                        "<a class=\"d\"></a>",
                    "</li>"
                ].join("\n");
            }

            for (var i = 0; i < data.logs.length; i++) {
                out += [
                    "<li class=\"log-item\">",
                    "<div class=\"h\">",
                    "<ul class=\"l\">",
                    "<li class=\"t\">" + data.logs[i].lastmodify + "</li>",
                    "<li class=\"n\">" + data.logs[i].name + "</li>",
                    "</ul>",
                    "<t class=\"r\">" + data.logs[i].out + "</t>",
                    "</div>",
                    "<span class=\"d\" onclick=\"core.viewlog(\'" + data.logs[i].url + "\')\"></span>",
                    "</li>"
                ].join("\n");
            }
            out += "</ul>";
            core.logpanel.main.innerHTML = out;
            core.plogdata = data;
        })
    },

    fetchrank(bypass = false) {
        myajax({
            url: "/api/test/rank",
            method: "GET",
        }, function (data) {
            if (comparearray(data, core.prankdata) && !bypass)
                return;

            core.rankpanel.main.innerHTML = "";
            var list = data.list;
            var out = [
                "<table>",
                    "<tr>",
                        "<th>#</th>",
                        "<th>Thí sinh</th>",
                        "<th>Tổng</th>",
            ].join("\n");

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
                            "<t class=\"name\">" + escape_html(data.rank[i].name) + "</t>",
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

    viewlog(url) {
        file = url.split("/").pop().replace("getlog?f=", "");
        myajax({
            url: "/api/test/getlog",
            method: "GET",
            query: {
                "f": file
            }
        }, function(res) {
            core.wrapper.show(file);
            var out = "<ul class=\"viewlog-container\">\n";
            for (var i = 0; i < res.length; i++) {
                out += "<li>" + escape_html(res[i]) + "</li>\n";
            }
            out += "</ul>";
            core.wrapper.panel.main.innerHTML = out;
        });
    },

    showcp() {
        core.userpanel.toggler.classList.remove("showupanel");
        core.wrapper.show("Admin CPanel");
        core.wrapper.panel.main.innerHTML = "<iframe class=\"cpanel-container\" src=\"config.php\"></iframe>"
    },

    file: {
        dropzone: $("#file_dropzone"),
        state: $("#file_upstate"),
        name: $("#file_name"),
        bar: $("#file_bar"),
        percent: $("#file_perc"),
        size: $("#file_size"),
        panel: new regPanel($("#uploadp")),
        uploadcooldown: 1000,
        onUploadSuccess() {},

        init() {
            this.dropzone.addEventListener("dragenter", this.dragenter, false);
            this.dropzone.addEventListener("dragleave", this.dragleave, false);
            this.dropzone.addEventListener("dragover", this.dragover, false);
            this.dropzone.addEventListener("drop", this.filesel, false);
            this.panel.ref.onclick(this.reset);
            this.panel.set.hide();
        },

        reset() {
            core.file.dropzone.classList.remove("hide");
            core.file.name.innerText = "null";
            core.file.state.innerText = "null";
            core.file.size.innerText = "00/00";
            core.file.percent.innerText = "0%";
            core.file.bar.style.width = "0%";
        },

        filesel(e) {
            e.stopPropagation();
            e.preventDefault();
            this.classList.remove("drag");

            var files = e.dataTransfer.files;

            this.classList.add("hide");
            core.file.state.innerText = "Chuẩn bị tải lên " + files.length + " tệp...";
            core.file.size.innerText = "00/00";
            core.file.percent.innerText = "0%";
            core.file.bar.style.width = "0%";
            setTimeout(() => {
                core.file.upload(files);
            }, 1000);
        },

        dragenter(e) {
            e.stopPropagation();
            e.preventDefault();
            this.classList.add("drag");
        },

        dragleave(e) {
            e.stopPropagation();
            e.preventDefault();
            this.classList.remove("drag");
        },

        dragover(e) {
            e.stopPropagation();
            e.preventDefault();
            e.dataTransfer.dropEffect = "copy";
            this.classList.add("drag");
        },

        upload(files, i = 0) {
            if (i > files.length - 1) {
                core.file.reset();
                return;
            }

            core.file.name.innerText = files[i].name;
            core.file.state.innerText = "Đang tải lên " + (i + 1) + "/" + files.length +"...";
            core.file.size.innerText = "00/00";
            core.file.percent.innerText = "0%";
            core.file.bar.style.width = "0%";

            setTimeout(() => {
                myajax({
                    url: "/api/test/upload",
                    method: "POST",
                    form: {
                        "t": API_TOKEN,
                    },
                    file: files[i],
                }, function (d) {
                    core.file.state.innerText = "Tải lên thành công! " + (i + 1) + "/" + files.length;
                    core.file.onUploadSuccess();
                    setTimeout(() => {
                        core.file.upload(files, i + 1);
                    }, core.file.uploadcooldown / 2);
                }, function (e) {
                    core.file.size.innerText = e.loaded + "/" + e.total;
                    core.file.percent.innerText = ((e.loaded / e.total) * 100).toFixed(0) + "%";
                    core.file.bar.style.width = (e.loaded / e.total) * 100 + "%";
                }, function (res) {
                    core.file.state.innerText = "Tải lên thất bại";
                    setTimeout(core.file.reset, 2000);
                })
            }, core.file.uploadcooldown / 2);
        },
    },

    timer: {
        timepanel: new regPanel($("#timep")),
        state: $("#time_state"),
        time: $("#time_time"),
        bar: $("#time_bar"),
        start: $("#time_start"),
        end: $("#time_end"),
        timedata: Array(),
        interval: null,
        last: 0,

        init() {
            this.timepanel.set.hide();
            this.timepanel.ref.onclick(core.timer.fetchtime);
            this.fetchtime(true);
        },

        fetchtime(init = false) {
            myajax({
                url: "/api/test/timer",
                method: "GET",
            }, function(data) {
                core.timer.timedata = data;
                if (data.d == 0)
                    return;
                if (init) {
                    $("#timep").classList.add("show");
                    core.timer.last = 0;
                    clearInterval(core.timer.interval);
                    core.timer.startinterval();
                }
            });
        },

        startinterval() {
            core.timer.timeupdate();
            core.timer.interval = setInterval(() => {
                core.timer.timedata.t--;
                core.timer.timeupdate();
            }, 1000);
        },

        reset() {
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

        timeupdate() {
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
        uname: $("#user_name"),
        uavt: $("#user_avt"),
        avt: $("#userp_avt"),
        avtw: $("#userp_avtw"),
        name: $("#userp_name"),
        tag: $("#userp_tag"),
        form: {
            nameform: $("#userp_edit_name_form"),
            passform: $("#userp_edit_pass_form"),
            name: $("#userp_edit_name"),
            pass: $("#userp_edit_pass"),
            npass: $("#userp_edit_npass"),
            renpass: $("#userp_edit_renpass"),
        },
        logoutbtn: $("#userp_logout"),
        toggler: $("#upanel_toggler"),

        init() {
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

        logout() {
            myajax({
                url: "/api/logout",
                method: "POST",
                form: {
                    "t": API_TOKEN
                }
            }, function() {
                location.reload();
            })
        },

        reset() {
            core.userpanel.avtw.classList.remove("drop");
            core.userpanel.avtw.classList.remove("load");
            core.userpanel.form.nameform.getElementsByTagName("button")[0].disabled = false;
            core.userpanel.form.passform.getElementsByTagName("button")[0].disabled = false;
            core.userpanel.form.name.value = null;
            core.userpanel.form.pass.value = null;
            core.userpanel.form.npass.value = null;
            core.userpanel.form.renpass.value = null;
        },

        reload(data, m = 0) {
            core.fetchrank(true);
            if (m == 0)
                core.userpanel.uavt.src = core.userpanel.avt.src = data.src;
            else
                core.userpanel.uname.innerText = core.userpanel.name.innerText = data;
        },
        
        changename(name) {
            myajax({
                url: "/api/edit",
                method: "POST",
                form: {
                    "n": name,
                    "t": API_TOKEN
                }
            }, function(res) {
                statbar.change(statbar.type.OK, "Thay đổi thông tin thành công!");
                core.userpanel.reset();
                core.userpanel.reload(res.name, 1);
            }, () => {}, function (res) {
                core.userpanel.reset();
            });
        },

        changepass(pass, npass, renpass) {
            myajax({
                url: "/api/edit",
                method: "POST",
                form: {
                    "p": pass,
                    "np": npass,
                    "rnp": renpass,
                    "t": API_TOKEN
                }
            }, function(res) {
                statbar.change(statbar.type.OK, "Thay đổi thông tin thành công!");
                core.userpanel.reset();
            }, () => {}, function (res) {
                core.userpanel.reset();
            });
        },

        filesel(e) {
            e.stopPropagation();
            e.preventDefault();
            this.classList.remove("drag");

            var file = e.dataTransfer.files[0];

            this.classList.add("load");
            setTimeout(() => {
                core.userpanel.avtupload(file);
            }, 1000);
        },

        avtupload(file) {
            myajax({
                url: "/api/avt/change",
                method: "POST",
                form: {
                    "t": API_TOKEN,
                },
                file: file,
            }, function (d) {
                core.userpanel.reset();
                core.userpanel.reload(d);
            }, () => {}, function (res) {
                core.userpanel.reset();
            });
        },

        dragenter(e) {
            e.stopPropagation();
            e.preventDefault();
            this.classList.add("drag");
        },

        dragleave(e) {
            e.stopPropagation();
            e.preventDefault();
            this.classList.remove("drag");
        },

        dragover(e) {
            e.stopPropagation();
            e.preventDefault();
            e.dataTransfer.dropEffect = "copy";
            this.classList.add("drag");
        }

    },

    wrapper: {
        wrapper: $("#wrapper"),
        panel: new regPanel($("#wrapp")),

        init() {
            this.panel.set.hide();
            this.panel.ref.hide();
            this.panel.clo.onclick(this.hide);
        },

        show(title = "") {
            core.wrapper.wrapper.classList.add("show");
            core.wrapper.panel.title = title;
        },

        hide() {
            core.wrapper.wrapper.classList.remove("show");
        }
    }

}