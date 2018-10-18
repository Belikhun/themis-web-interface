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
        this.ebak = fcfn(ri, "bak");
        this.eclo = fcfn(ri, "clo");
        this.emain = fcfn(elem.childNodes, "main");
    }

    get panel() {
        return this.elem;
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
                    t.eref.style.display = "inline";
            }
        }
    }

    get bak() {
        var t = this;
        return {
            onclick(f = () => {}) {
                t.ebak.addEventListener("click", f, true);
            },

            hide(h = true) {
                if (h)
                    t.ebak.style.display = "none";
                else
                    t.ebak.style.display = "inline";
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
                    t.eclo.style.display = "inline";
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
    container: $("#container"),
    plogdata: new Array(),
    prankdata: new Array(),
    flogint: null,
    frankint: null,
    _this: this,

    init(done = () => {}) {
        console.time("inittime");
        console.log("%cSTOP!", "font-size: 72px; font-weight: 900;");
        console.log(
            "%cThis feature is intended for developers. Pasting something here could give strangers access to your account.",
            "font-size: 18px; font-weight: 700;"
        );
        console.log("init...");
        this.rankpanel.ref.onclick(() => {
            this.fetchrank(true);
        });
        this.fetchrank();
        this.frankint = setInterval(e => {this.fetchrank()}, 2000);
        this.timer.init();
        
        if (LOGGED_IN) {
            this.file.init();
            this.problems.init();
            this.userprofile.init();
            this.wrapper.init();
            this.fetchlog();
            this.logpanel.ref.onclick(() => {
                this.fetchlog(true);
            });
            this.file.onUploadSuccess = e => (this.fetchlog());
            this.flogint = setInterval(e => {this.fetchlog()}, 1000);
            if (IS_ADMIN) {
                this.settings.init();
                this.navlink.init();
            }
        }
        console.timeEnd("inittime");
        done();
    },

    fetchlog(bypass = false) {
        myajax({
            url: "/api/test/logs",
            method: "GET",
        }, data => {
            if (comparearray(data, this.plogdata) && !bypass)
                return false;

            var list = this.logpanel.main.getElementsByClassName("log-item-container")[0];
            if (data.judging.length == 0 && data.logs.length == 0 && data.queues.length == 0) {
                this.logpanel.main.classList.add("blank");
                this.plogdata = data;
                list.innerHTML = "";
                return false;
            } else
                this.logpanel.main.classList.remove("blank");

            var out = "";
            
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

            list.innerHTML = out;
            this.plogdata = data;
        })
    },

    fetchrank(bypass = false) {
        myajax({
            url: "/api/test/rank",
            method: "GET",
        }, data => {
            if (comparearray(data, this.prankdata) && !bypass)
                return false;

            if (data.list.length == 0 && data.rank.length == 0) {
                this.rankpanel.main.classList.add("blank");
                this.prankdata = data;
                this.rankpanel.main.innerHTML = "";
                return false;
            } else
                this.rankpanel.main.classList.remove("blank");
    

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
            this.rankpanel.main.innerHTML = out;
            this.prankdata = data;
        });
    },

    viewlog(url) {
        file = url.split("/").pop().replace("viewlog?f=", "");
        myajax({
            url: "/api/test/viewlog",
            method: "GET",
            query: {
                "f": file
            }
        }, data => {
            core.wrapper.show(file);
            var out = "<ul class=\"viewlog-container\">\n";
            for (var i = 0; i < data.length; i++) {
                out += "<li>" + escape_html(data[i]) + "</li>\n";
            }
            out += "</ul>";
            core.wrapper.panel.main.innerHTML = out;
        });
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
            this.panel.title = "Nộp bài";
        },

        reset() {
            core.file.dropzone.classList.remove("hide");
            core.file.panel.title = "Nộp bài";
            core.file.name.innerText = "null";
            core.file.state.innerText = "null";
            core.file.size.innerText = "00/00";
            core.file.percent.innerText = "0%";
            core.file.bar.style.width = "0%";
            core.file.bar.className = "";
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
                this.reset();
                return;
            }

            this.name.innerText = files[i].name;
            this.state.innerText = "Đang tải lên...";
            this.panel.title = "Nộp bài - Đang tải lên " + (i + 1) + "/" + files.length +"...";
            this.size.innerText = "00/00";
            this.percent.innerText = "0%";
            this.bar.style.width = "0%";
            this.bar.classList.remove("red");

            setTimeout(() => {
                myajax({
                    url: "/api/test/upload",
                    method: "POST",
                    form: {
                        "token": API_TOKEN,
                    },
                    file: files[i],
                    onupload: e => {
                        this.size.innerText = e.loaded + "/" + e.total;
                        this.percent.innerText = ((e.loaded / e.total) * 100).toFixed(0) + "%";
                        this.bar.style.width = (e.loaded / e.total) * 100 + "%";
                    }
                }, (data, res) => {
                    if ([103, 104].includes(res.code)) {
                        this.state.innerText = res.description;
                        this.panel.title = "Nộp bài - Đã dừng.";
                        this.bar.classList.add("red");
                        return false;
                    }
                    this.state.innerText = "Tải lên thành công! " + (i + 1) + "/" + files.length;
                    this.onUploadSuccess();
                    setTimeout(() => {
                        this.upload(files, i + 1);
                    }, this.uploadcooldown / 2);
                }, res => {
                    statbar.hide();
                    this.state.innerText = res.description;
                    this.panel.title = "Nộp bài - Đã dừng.";
                    this.bar.classList.add("red");
                })
            }, this.uploadcooldown / 2);
        },
    },

    problems: {
        panel: new regPanel($("#problemp")),
        list: $("#problem_list"),
        name: $("#problem_name"),
        point: $("#problem_point"),
        type: {
            "filename": $("#problem_type_filename"),
            "ext": $("#problem_type_ext"),
            "time": $("#problem_type_time"),
            "inp": $("#problem_type_inp"),
            "out": $("#problem_type_out")
        },
        image: $("#problem_image"),
        description: $("#problem_description"),
        test: $("#problem_test"),

        init() {
            this.panel.bak.hide();
            this.panel.bak.onclick(() => {
                this.list.classList.remove("hide");
                this.panel.title = "Đề bài"
                this.panel.bak.hide();
            })
            this.panel.ref.onclick(f => {
                this.getlist();
            });
            this.getlist();
        },

        getlist() {
            myajax({
                url: "/api/test/problems/list",
                method: "GET"
            }, data => {
                if (data.length == 0) {
                    this.panel.main.classList.add("blank");
                    this.list.innerHTML = "";
                    return false;
                } else
                    this.panel.main.classList.remove("blank");

                var html = "";
                data.forEach(item => {
                    html += [
                        "<li class=\"item\" onclick=\"core.problems.getproblem(\'" + item.id + "\');\">",
                            "<img class=\"icon\" src=\"" + item.image + "\">",
                            "<ul class=\"title\">",
                                "<li class=\"name\">" + item.name + "</li>",
                                "<li class=\"point\">" + item.point + " điểm</li>",
                            "</ul>",
                        "</li>",
                    ].join("\n");
                })
                this.list.innerHTML = html;
            })
        },

        getproblem(id) {
            myajax({
                url: "/api/test/problems/get",
                method: "GET",
                query: {
                    id: id
                }
            }, data => {
                this.name.innerText = data.name;
                this.panel.title = "Đề bài - " + data.name;
                this.point.innerText = data.point + " điểm";
                this.type.filename.innerText = data.id;
                this.type.ext.innerText = data.accept.join(", ");
                this.type.time.innerText = data.time + " giây";
                this.type.inp.innerText = data.type.inp;
                this.type.out.innerText = data.type.out;
                if (data.image) {
                    this.image.style.display = "block";
                    this.image.src = data.image;
                } else
                    this.image.style.display = "none";
                this.description.innerText = data.description;
                testhtml = "";
                data.test.forEach(item => {
                    testhtml += [
                        "<tr>",
                            "<td>" + item.inp + "</td>",
                            "<td>" + item.out + "</td>",
                        "</tr>"
                    ].join("\n");
                })
                this.test.innerHTML = [
                    "<tr>",
                        "<th>Input</th>",
                        "<th>Output</th>",
                    "</tr>"
                ].join("\n") + testhtml;
                this.list.classList.add("hide");
                this.panel.bak.hide(false);
            })
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
            this.timepanel.ref.onclick(() => {
                this.fetchtime(true);
            });
            this.timepanel.clo.onclick(e => {
                this.close();
            })
            if (LOGGED_IN)
                this.timepanel.clo.hide();
            this.fetchtime(true);
        },

        close() {
            this.reset();
            this.timepanel.panel.classList.remove("show");
        },

        fetchtime(init = false) {
            myajax({
                url: "/api/test/timer",
                method: "GET",
            }, data => {
                this.timedata = data;
                if (data.during <= 0) {
                    $("#timep").classList.remove("show");
                    clearInterval(this.interval);
                    return;
                }
                if (init) {
                    $("#timep").classList.add("show");
                    this.last = 0;
                    clearInterval(this.interval);
                    this.startinterval();
                }
            });
        },

        startinterval() {
            this.timeupdate();
            this.interval = setInterval(() => {
                this.timedata.time--;
                this.timeupdate();
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
            this.last = 0;
            this.timedata.phase = 0;
        },

        timeupdate() {
            if ((data = this.timedata).time == 0)
                switch (data.phase) {
                    case 1:
                        this.timedata.phase = 2;
                        this.timedata.time = data.during;
                        core.problems.getlist();
                        break;
                    case 2:
                        this.timedata.phase = 3;
                        this.timedata.time = data.offset;
                        break;
                    case 3:
                        this.timedata.phase = 4;
                        break;
                    default:
                        this.reset();
                        break;
                }
            data = this.timedata;
            t = data.time;

            switch(data.phase) {
                case 1:
                    if (this.last == 0)
                        this.last = t;
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
                    this.bar.style.width = (t/data.during)*100 + "%";
                    this.start.innerText = parsetime(t).str;
                    this.end.innerText = parsetime(data.during).str;
                    this.state.innerText = "Thời gian làm bài";
                    break;
                case 3:
                    this.time.classList.remove("green");
                    this.time.classList.add("red");
                    this.time.innerText = parsetime(t).str;
                    this.bar.style.width = (t/data.offset)*100 + "%";
                    this.start.innerText = parsetime(t).str;
                    this.end.innerText = parsetime(data.offset).str;
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

    userprofile: {
        uname: $("#user_name"),
        uavt: $("#user_avt"),
        avt: $("#userp_avt"),
        avtw: $("#userp_avtw"),
        name: $("#userp_name"),
        tag: $("#userp_tag"),
        body: {
            nameform: $("#userp_edit_name_form"),
            passform: $("#userp_edit_pass_form"),
            namepanel: null,
            passpanel: null,
            name: $("#userp_edit_name"),
            pass: $("#userp_edit_pass"),
            npass: $("#userp_edit_npass"),
            renpass: $("#userp_edit_renpass"),
        },
        logoutbtn: $("#userp_logout"),
        toggler: $("#upanel_toggler"),
        userprofile: $("#user_profile"),

        panel: class {
            constructor(elem) {
                if (!elem.classList.contains("panel"))
                    return false;
        
                this.elem = elem;
                this.etitle = fcfn(elem.childNodes, "title");
                this.container = $("#userp_right_panel");
                this.lpanel = $("#userp_left_panel");

                var _this = this;
                this.etitle.addEventListener("click", () => {
                    _this.close();
                })
            }
        
            close() {
                this.elem.classList.remove("show");
                this.container.classList.remove("show");
                this.lpanel.classList.remove("hide");
            }

            show() {
                this.elem.classList.add("show");
                this.container.classList.add("show");
                this.lpanel.classList.add("hide");
            }

            toggle() {
                this.elem.classList.toggle("show");
                this.container.classList.toggle("show");
                this.lpanel.classList.toggle("hide");
            }

            set toggler(e) {
                var _this = this;
                e.addEventListener("click", () => {
                    _this.elem.classList.toggle("show");
                    _this.container.classList.toggle("show");
                    _this.lpanel.classList.toggle("hide");
                });
            }
        
            set title(str = "") {
                this.etitle.innerText = str;
            }
        },

        init() {
            this.avtw.addEventListener("dragenter",  e => {this.dragenter(e)}, false);
            this.avtw.addEventListener("dragleave", e => {this.dragleave(e)}, false);
            this.avtw.addEventListener("dragover", e => {this.dragover(e)}, false);
            this.avtw.addEventListener("drop", e => {this.filesel(e)}, false);
            this.toggler.addEventListener("click", e => {this.toggle(e)}, false);

            this.body.namepanel = new this.panel($("#userp_edit_name_panel"));
            this.body.passpanel = new this.panel($("#userp_edit_pass_panel"));
            this.body.namepanel.toggler = $("#userp_edit_name_toggler");
            this.body.passpanel.toggler = $("#userp_edit_pass_toggler");

            this.body.nameform.addEventListener("submit", e => {
                this.body.nameform.getElementsByTagName("button")[0].disabled = true;
                this.changename(this.body.name.value);
            }, false)

            this.body.passform.addEventListener("submit", e => {
                this.body.passform.getElementsByTagName("button")[0].disabled = true;
                this.changepass(this.body.pass.value, this.body.npass.value, this.body.renpass.value);
            }, false)

            this.logoutbtn.addEventListener("click", e => {this.logout(e)}, false);
        },

        logout() {
            myajax({
                url: "/api/logout",
                method: "POST",
                form: {
                    "token": API_TOKEN
                }
            }, function() {
                location.reload();
            })
        },

        toggle() {
            this.toggler.classList.toggle("active");
            this.userprofile.classList.toggle("show");
        },

        reset() {
            this.avtw.classList.remove("drop");
            this.avtw.classList.remove("load");
            this.body.nameform.getElementsByTagName("button")[0].disabled = false;
            this.body.passform.getElementsByTagName("button")[0].disabled = false;
            this.body.name.value = null;
            this.body.pass.value = null;
            this.body.npass.value = null;
            this.body.renpass.value = null;
        },

        reload(data, m = 0) {
            core.fetchrank(true);
            if (m == 0)
                this.uavt.src = this.avt.src = data.src;
            else
                this.uname.innerText = this.name.innerText = data;
        },
        
        changename(name) {
            myajax({
                url: "/api/edit",
                method: "POST",
                form: {
                    "n": name,
                    "token": API_TOKEN
                }
            }, data => {
                this.reset();
                this.reload(data.name, 1);
            }, data => {
                this.reset();
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
                    "token": API_TOKEN
                }
            }, data => {
                statbar.change(statbar.type.OK, "Thay đổi mật khẩu thành công!");
                statbar.hide(2000);
                this.reset();
            }, data => {
                this.reset();
            });
        },

        filesel(e) {
            e.stopPropagation();
            e.preventDefault();
            this.avtw.classList.remove("drag");

            var file = e.dataTransfer.files[0];

            this.avtw.classList.add("load");
            setTimeout(() => {
                this.avtupload(file);
            }, 1000);
        },

        avtupload(file) {
            myajax({
                url: "/api/avt/change",
                method: "POST",
                form: {
                    "token": API_TOKEN,
                },
                file: file,
            }, data => {
                this.reset();
                this.reload(data);
            }, data => {
                this.reset();
            });
        },

        dragenter(e) {
            e.stopPropagation();
            e.preventDefault();
            this.avtw.classList.add("drag");
        },

        dragleave(e) {
            e.stopPropagation();
            e.preventDefault();
            this.avtw.classList.remove("drag");
        },

        dragover(e) {
            e.stopPropagation();
            e.preventDefault();
            e.dataTransfer.dropEffect = "copy";
            this.avtw.classList.add("drag");
        }

    },

    settings: {
        main: $("#container"),
        cont: $("#container_content"),
        sett: $("#container_settings"),
        navcont: $("#userp_left_panel"),
        navhome: $("#nav_list_home"),
        navsett: $("#nav_list_sett"),
        cpanel: new regPanel($("#settings_cpanel")),
        ppanel: new regPanel($("#settings_problem")),

        init() {
            this.problems.init();
            this.cpanel.ref.onclick(e => {
                var iframe = this.cpanel.main.getElementsByTagName("iframe")[0]; 
                iframe.contentWindow.location.reload();
            })
            this.ppanel.ref.onclick(e => {
                this.problems.getlist();
                this.problems.resetform();
                this.problems.showlist();
            })
            this.navhome.addEventListener("click", e => {
                this.hidesett();
                core.navlink.activeid(0);
            })
            this.navsett.addEventListener("click", e => {
                this.showsett();
                core.navlink.activeid(1);
            })
        },

        hidesett() {
            this.main.classList.remove("showsett");
            this.navhome.classList.add("active");
            this.navsett.classList.remove("active");
        },

        showsett() {
            this.main.classList.add("showsett");
            this.navhome.classList.remove("active");
            this.navsett.classList.add("active");
            this.problems.getlist();
        },

        problems: {
            _this: null,
            title: $("#problem_edit_title"),
            headbtn: {
                back: $("#problem_edit_btn_back"),
                add: $("#problem_edit_btn_add"),
                check: $("#problem_edit_btn_check"),
            },
            form: {
                form: $("#problem_edit_form"),
                id: $("#problem_edit_id"),
                name: $("#problem_edit_name"),
                point: $("#problem_edit_point"),
                time: $("#problem_edit_time"),
                inptype: $("#problem_edit_inptype"),
                outtype: $("#problem_edit_outtype"),
                accept: $("#problem_edit_accept"),
                image: $("#problem_edit_image"),
                desc: $("#problem_edit_desc"),
                testlist: $("#problem_edit_test_list"),
                testadd: $("#problem_edit_test_add"),
                submit() {
                    $("#problem_edit_submit").click();
                }
            },
            list: $("#problem_edit_list"),
            action: null,

            hide(elem) {
                elem.style.display = "none";
            },

            show(elem) {
                elem.style.display = "inline-block";
            },

            init() {
                this._this = core.problems;
                this.hide(this.headbtn.back);
                this.hide(this.headbtn.check);
                this.headbtn.check.addEventListener("click", e => {
                    this.form.submit();
                });
                this.headbtn.back.addEventListener("click", e => {
                    this.showlist();
                });
                this.headbtn.add.addEventListener("click", e => {
                    this.newproblem();
                });
                this.form.form.addEventListener("submit", e => {
                    this.postsubmit();
                });
                this.form.testadd.addEventListener("click", e => {
                    html = [
                        "<div class=\"cell\">",
                            "<textarea placeholder=\"Input\" required></textarea>",
                            "<textarea placeholder=\"Output\" required></textarea>",
                            "<span class=\"delete\" onclick=\"core.settings.problems.remtest(this)\"></span>",
                        "</div>"
                    ].join("\n");
                    this.form.testlist.insertAdjacentHTML("beforeend", html);
                });
            },

            remtest(elem) {
                this.form.testlist.removeChild(elem.parentNode);
            },

            hidelist() {
                this.list.classList.add("hide");
                this.hide(this.headbtn.add);
                this.show(this.headbtn.back);
                this.show(this.headbtn.check);
            },

            showlist() {
                this.list.classList.remove("hide");
                this.show(this.headbtn.add);
                this.hide(this.headbtn.back);
                this.hide(this.headbtn.check);
                this.title.innerText = "Danh sách";
            },

            getlist() {
                myajax({
                    url: "/api/test/problems/list",
                    method: "GET"
                }, data => {
                    this.list.innerHTML = "";
                    data.forEach(item => {
                        html = [
                            "<li class=\"item\">",
                                "<img class=\"icon\" src=\"" + item.image + "\">",
                                "<ul class=\"title\">",
                                    "<li class=\"id\">" + item.id + "</li>",
                                    "<li class=\"name\">" + item.name + "</li>",
                                "</ul>",
                                "<div class=\"action\">",
                                    "<span class=\"delete\" onclick=\"core.settings.problems.remproblem('" + item.id + "')\"></span>",
                                    "<span class=\"edit\" onclick=\"core.settings.problems.editproblem('" + item.id + "')\"></span>",
                                "</div>",
                            "</li>",
                        ].join("\n");
                        this.list.innerHTML += html;
                    })
                })
            },

            resetform() {
                this.form.id.value = "";
                this.form.id.disabled = false;
                this.form.name.value = "";
                this.form.point.value = null;
                this.form.time.value = 1;
                this.form.inptype.value = "Bàn Phím";
                this.form.outtype.value = "Màn hình";
                this.form.accept.value = "pas|py|cpp|java";
                this.form.image.value = null;
                this.form.desc.value = "";
                this.form.testlist.innerHTML = "";
            },

            newproblem() {
                this.resetform();
                this.form.id.disabled = false;
                this.title.innerText = "Thêm đề";
                this.action = "add";
                this.hidelist();
                setTimeout(e => {
                    this.form.id.focus();
                }, 300);
            },

            editproblem(id) {
                myajax({
                    url: "/api/test/problems/get",
                    method: "GET",
                    query: {
                        id: id
                    }
                }, data => {
                    this.resetform();
                    this.title.innerText = data.id;
                    this.action = "edit";

                    this.form.id.value = data.id;
                    this.form.id.disabled = true;
                    this.form.name.value = data.name;
                    this.form.point.value = data.point;
                    this.form.time.value = data.time;
                    this.form.inptype.value = data.type.inp;
                    this.form.outtype.value = data.type.out;
                    this.form.accept.value = data.accept.join("|");
                    this.form.image.value = null;
                    this.form.desc.value = data.description;

                    var html = "";
                    data.test.forEach(item => {
                        html += [
                            "<div class=\"cell\">",
                                "<textarea placeholder=\"Input\" required>" + item.inp + "</textarea>",
                                "<textarea placeholder=\"Output\" required>" + item.out + "</textarea>",
                                "<span class=\"delete\" onclick=\"core.settings.problems.remtest(this)\"></span>",
                            "</div>"
                        ].join("\n");
                    })
                    this.form.testlist.innerHTML = html;
                    
                    this.hidelist();
                    setTimeout(e => {
                        this.form.name.focus();
                    }, 300);
                })
            },

            remproblem(id) {
                if (!confirm("Bạn có chắc muốn xóa " + id + " không?"))
                    return false;

                myajax({
                    url: "/api/test/problems/remove",
                    method: "POST",
                    form: {
                        id: id,
                        token: API_TOKEN
                    }
                }, data => {
                    this.getlist();
                    this.showlist();
                    this._this.getlist();
                })
            },

            postsubmit() {
                var data = new Array();
                data.id = this.form.id.value;
                data.name = this.form.name.value;
                data.point = this.form.point.value;
                data.time = this.form.time.value;
                data.inptype = this.form.inptype.value;
                data.outtype = this.form.outtype.value;
                data.accept = this.form.accept.value.split("|");
                data.image = (this.form.image.files.length != 0) ? this.form.image.files[0] : null;
                data.desc = this.form.desc.value;

                var test = new Array();
                var testlist = this.form.testlist.getElementsByTagName("div");

                for (var i = 0; i < testlist.length; i++) {
                    var e = testlist[i].getElementsByTagName("textarea");
                    if (e[0].value == "" && e[1].value == "")
                        continue;

                    var t = {
                        inp: e[0].value,
                        out: e[1].value
                    }
                    test.push(t);
                }
                data.test = test;

                this.submit(this.action, data, data => {
                    this.getlist();
                    this.showlist();
                    this._this.getlist();
                })
            },

            submit(action, data, success = () => {}) {
                if (["edit", "add"].indexOf(action) == -1)
                    return false;

                myajax({
                    url: "/api/test/problems/" + action,
                    method: "POST",
                    form: {
                        id: data.id,
                        name: data.name,
                        point: data.point,
                        time: data.time,
                        inptype: data.inptype,
                        outtype: data.outtype,
                        acpt: JSON.stringify(data.accept),
                        img: data.image,
                        desc: data.desc,
                        test: JSON.stringify(data.test),
                        token: API_TOKEN
                    }
                }, success);
            }
        }
    },

    navlink: {
        container: $("#nav_list"),
        list: null,
        prev: null,

        init() {
            this.list = list = this.container.getElementsByTagName("span");
            var _this = this;
            for (var i = 0; i < list.length; i++) {
                if (list[i].dataset.default == "true") {
                    this.prev = list[i];
                    list[i].classList.add("active");
                }
                list[i].addEventListener("click", function(e) {
                    _this.active(this);
                }, false);
            }
        },

        activeid(i) {
            this.prev.classList.remove("active");
            this.list[i].classList.add("active");

            this.prev = this.list[i];
        },

        active(elem) {
            this.prev.classList.remove("active");
            //$("#" + this.prev.dataset.showid).classList.remove("show");
            elem.classList.add("active");
            //$("#" + elem.dataset.showid).classList.add("show");
            if (elem.dataset.default == "true")
                core.settings.hidesett();
            else
                core.settings.showsett();

            this.prev = elem;
        }
    },

    wrapper: {
        wrapper: $("#wrapper"),
        panel: new regPanel($("#wrapp")),

        init() {
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