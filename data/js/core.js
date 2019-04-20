//? |-----------------------------------------------------------------------------------------------|
//? |  /data/js/core.js                                                                             |
//? |                                                                                               |
//? |  Copyright (c) 2018-2019 Belikhun. All right reserved                                         |
//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
//? |-----------------------------------------------------------------------------------------------|

class regPanel {
    constructor(elem) {
        if (elem.tagName !== "PANEL")
            return false;

        this.elem = elem;
        var ehead = fcfn(elem, "head");
        this.etitle = fcfn(ehead, "le");
        var ri = fcfn(ehead, "ri");
        this.eref = fcfn(ri, "ref");
        this.ebak = fcfn(ri, "bak");
        this.eclo = fcfn(ri, "clo");
        this.emain = fcfn(elem, "main");
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
            onClick(f = () => {}) {
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
            onClick(f = () => {}) {
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
            onClick(f = () => {}) {
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
    logPanel: new regPanel($("#logp")),
    rankPanel: new regPanel($("#rankp")),
    container: $("#container"),
    pLogData: new Array(),
    pRankData: new Array(),
    updateDelay: 2000,
    initialized: false,
    __logTimeout: null,
    __rankTimeout: null,

    async init(set) {
        clog("info", "Initializing...");
        var initTime = new stopclock();

        set(5, "Fetching Rank...");
        await this.fetchRank();
        this.rankPanel.ref.onClick(() => { this.fetchRank(true) });
        __connection__.onStateChange((s) => { s === "online" ? this.__fetchRank() : null });
        this.__fetchRank();

        set(10, "Initializing: core.timer");
        await this.timer.init();

        set(15, "Initializing: core.wrapper");
        this.wrapper.init();

        set(20, "Initializing: core.userSettings");
        this.userSettings.init(LOGGED_IN);

        set(25, "Initializing: core.sounds");
        await this.sound.init((p, t) => {
            set(25 + p*0.5, `Initializing: core.sounds (${t})`);
        });
        
        if (LOGGED_IN) {
            set(75, "Initializing: core.file");
            this.file.init();

            set(80, "Initializing: core.problems");
            await this.problems.init();

            set(85, "Fetching Logs...");
            await this.fetchLog();
            this.logPanel.ref.onClick(() => { this.fetchLog(true) });
            this.file.onUploadSuccess = () => { this.fetchLog() };
            __connection__.onStateChange((s) => { s === "online" ? this.__fetchLog() : null });
            this.__fetchLog();

            if (IS_ADMIN) {
                clog("info", "Logged in as Admin.");
                set(90, "Initializing: core.settings");
                await this.settings.init();
            }
        } else
            clog("warn", "You are not logged in. Some feature will be disabled.");

        set(95, "Getting Server Status...");
        await this.getServerStatusAsync();

        clog("debg", "Initialisation took:", {
            color: flatc("blue"),
            text: initTime.stop + "s"
        })

        set(100, "Initialized");
        clog("okay", "core.js Initialized.");
        this.initialized = true;

        console.log("%cSTOP!", "font-size: 72px; font-weight: 900;");
        console.log(
            "%cThis feature is intended for developers. Pasting something here could give strangers access to your account.",
            "font-size: 18px; font-weight: 700;"
        );
    },

    async getServerStatusAsync() {
        const data = await myajax({
            url: "/api/status",
            method: "GET",
        }).catch(e => {
            clog("WARN", "Error while getting server status:", {
                text: e.description,
                color: flatc("red"),
            });
        });

        window.serverStatus = data;
    },

    async checkUpdateAsync(showMsgs = false) {
        if (!window.serverStatus)
            return false;

        // Parse local version data
        var tl = window.serverStatus.version.split(".");
        let data = {};

        const localVer = {
            v: parseInt(tl[0])*100 + parseInt(tl[1])*10 + parseInt(tl[2]),
            s: window.serverStatus.versionTag
        }

        var tls = `${tl.join(".")}-${localVer.s}`;
        clog("info", "Local version:", { text: tls, color: flatc("blue") })
        $("#about_localVersion").innerText = tls;

        try {
            data = await myajax({
                url: "https://api.github.com/repos/belivipro9x99/themis-web-interface/releases/latest",
                method: "GET",
                rawdata: true,
                changeState: false,
                reRequest: false
            });
        } catch (error) {
            clog("WARN", "Error Checking for update:", {
                text: error.description,
                color: flatc("red"),
            });

            return;
        }

        // Parse lastest github release data
        var tg = data.tag_name.split("-")[0].replace("v", "").split(".");
        const githubVer = {
            v: parseInt(tg[0])*100 + parseInt(tg[1])*10 + parseInt(tg[2]),
            s: data.tag_name.split("-")[1]
        }

        var tgs = `${tg.join(".")}-${githubVer.s}`;
        clog("info", "Github latest release:", { text: tgs, color: flatc("blue") })
        $("#about_githubVersion").innerText = tgs;
        
        // Check for new version
        if (((githubVer.v > localVer.v && ["beta", "indev", "debug", "test"].indexOf(githubVer.s) === -1) || (githubVer.v === localVer.v && githubVer.s !== localVer.s)) && showMsgs === true) {
            clog("WARN", "Hiện đã có phiên bản mới:", tgs);
            sbar.additem(`Có phiên bản mới: ${tgs}`, "hub", {aligin: "right"});

            let e = document.createElement("div");
            e.classList.add("item", "lr", "warning");
            e.innerHTML = [
                `<div class="left">`,
                    `<t>Hiện đã có phiên bản mới: <b>${tgs}</b></t>`,
                    `<t>Nhấn vào nút dưới đây để đi tới trang tải xuống:</t>`,
                    `<a href="${data.html_url}" target="_blank" rel="noopener"><button class="sq-btn dark" style="margin-top: 10px; width: 100%;">${data.tag_name} : ${data.target_commitish}</button></a>`,
                `</div>`,
                `<div class="right"></div>`
            ].join("\n");

            this.settings.adminConfig.appendChild(e);
        }
    },

    async __fetchLog() {
        clearTimeout(this.__logTimeout);
        var timer = new stopclock();
        this.initialized ? await this.fetchLog() : null;
        
        this.__logTimeout = setTimeout(() => { this.__fetchLog() }, this.updateDelay - timer.stop*1000);
    },

    async __fetchRank() {
        clearTimeout(this.__rankTimeout);
        var timer = new stopclock();
        this.initialized ? await this.fetchRank() : null;
        
        this.__rankTimeout = setTimeout(() => { this.__fetchRank() }, this.updateDelay - timer.stop*1000);
    },

    async fetchLog(bypass = false) {
        var data = await myajax({
            url: "/api/test/logs",
            method: "GET",
        });

        if (compareJSON(data, this.pLogData) && !bypass)
            return false;

        clog("debg", "Updating Log");
        var updatelog = new stopclock();

        var list = this.logPanel.main.getElementsByClassName("log-item-container")[0];
        
        if (data.judging.length === 0 && data.logs.length === 0 && data.queues.length === 0) {
            this.logPanel.main.classList.add("blank");
            this.pLogData = data;
            list.innerHTML = "";

            clog("debg", "Log Is Blank. Took", {
                color: flatc("blue"),
                text: updatelog.stop + "s"
            });

            return false;
        } else
            this.logPanel.main.classList.remove("blank");

        var out = "";
        
        for (var i = 0; i < data.judging.length; i++)
            out += [
                `<li class="log-item judging">`,
                    `<div class="h">`,
                        `<ul class="l">`,
                            `<li class="t">${data.judging[i].lastmodify}</li>`,
                            `<li class="n">${data.judging[i].name}</li>`,
                        `</ul>`,
                        `<t class="r">Đang chấm</t>`,
                    `</div>`,
                    `<a class="d"></a>`,
                `</li>`
            ].join("\n");

        for (var i = 0; i < data.queues.length; i++)
            out += [
                `<li class="log-item queue">`,
                    `<div class="h">`,
                        `<ul class="l">`,
                            `<li class="t">${data.queues[i].lastmodify}</li>`,
                            `<li class="n">${data.queues[i].name}</li>`,
                        `</ul>`,
                        `<t class="r">Đang chờ</t>`,
                    `</div>`,
                    `<a class="d"></a>`,
                `</li>`
            ].join("\n");

        for (var i = 0; i < data.logs.length; i++)
            out += [
                `<li class="log-item">`,
                    `<div class="h">`,
                        `<ul class="l">`,
                            `<li class="t">${data.logs[i].lastmodify}</li>`,
                            `<li class="n">${data.logs[i].name}</li>`,
                        `</ul>`,
                        `<t class="r">${data.logs[i].out}</t>`,
                    `</div>`,
                    `<a class="d" onClick="core.viewLog('${data.logs[i].url}')"></a>`,
                `</li>`
            ].join("\n");

        list.innerHTML = out;
        this.pLogData = data;

        clog("debg", "Log Updated. Took", {
            color: flatc("blue"),
            text: updatelog.stop + "s"
        });
    },

    async fetchRank(bypass = false) {
        var data = await myajax({
            url: "/api/test/rank",
            method: "GET",
        });

        if (compareJSON(data, this.pRankData) && !bypass)
            return false;

        clog("debg", "Updating Rank");
        var updaterank = new stopclock();

        if (data.list.length === 0 && data.rank.length === 0) {
            this.rankPanel.main.classList.add("blank");
            this.pRankData = data;
            this.rankPanel.main.innerHTML = "";
            
            clog("debg", "Rank Is Blank. Took", {
                color: flatc("blue"),
                text: updaterank.stop + "s"
            });

            return false;
        } else
            this.rankPanel.main.classList.remove("blank");


        var list = data.list;
        var out = [
            "<table>",
                "<thead>",
                    "<tr>",
                        "<th>#</th>",
                        "<th>Thí sinh</th>",
                        "<th>Tổng</th>",
        ].join("\n");

        for (var i = 0; i < list.length; i++)
            out += "<th>" + list[i] + "</th>\n";
        out += "</tr>\n</thead>\n";

        var ptotal = 0;
        var rank = 0;
        out += "<tbody>\n"

        for (var i = 0; i < data.rank.length; i++) {
            if (ptotal !== data.rank[i].total) {
                ptotal = data.rank[i].total;
                rank++;
            }

            out += [
                `<tr>`,
                    `<td>${rank}</td>`,
                    `<td>`,
                        `<img class="avt" src="/api/avt/get?u=${data.rank[i].username}">`,
                        `<t class="name">${escape_html(data.rank[i].name)}</t>`,
                    `</td>`,
                    `<td class="number">${parseFloat(data.rank[i].total).toFixed(2)}</td>`
            ].join("\n");

            for (var j = 0; j < list.length; j++)
                out += `<td class="number${(data.rank[i].log[list[j]]) ? ` link" onClick="core.viewLog('${data.rank[i].log[list[j]]}')` : ""}" >${parseFloat(data.rank[i].list[list[j]]).toFixed(2)}</td>\n`;
            
            out += "</tr>";
        }

        out += "</tbody>\n</table>";
        this.rankPanel.main.innerHTML = out;
        this.pRankData = data;

        clog("debg", "Rank Updated. Took", {
            color: flatc("blue"),
            text: updaterank.stop + "s"
        });
    },

    async viewLog(url) {
        clog("info", "Opening log file", {
            color: flatc("yellow"),
            text: url
        });

        core.sound.select();
        file = url.split("/").pop().replace("viewlog?f=", "");

        var data = await myajax({
            url: "/api/test/viewlog",
            method: "GET",
            query: {
                "f": file
            }
        });

        this.wrapper.show(file);
        var out = [`<ul class="viewlog-container">`];

        for (var i = 0; i < data.length; i++)
            out.push(`<li>${escape_html(data[i])}</li>`);
        
        out.push("</ul>");
        this.wrapper.panel.main.innerHTML = out.join("\n");
    },

    file: {
        dropzone: $("#file_dropzone"),
        input: $("#file_input"),
        state: $("#file_upstate"),
        name: $("#file_name"),
        bar: $("#file_bar"),
        percent: $("#file_perc"),
        size: $("#file_size"),
        panel: new regPanel($("#uploadp")),
        uploadCoolDown: 1000,
        uploading: false,
        onUploadSuccess() {},

        init() {
            this.dropzone.addEventListener("dragenter", this.dragenter, false);
            this.dropzone.addEventListener("dragleave", this.dragleave, false);
            this.dropzone.addEventListener("dragover", this.dragover, false);
            this.dropzone.addEventListener("drop", (e) => this.filesel(e), false);
            this.input.addEventListener("change", (e) => this.filesel(e, "input"));
            this.panel.ref.onClick(() => this.reset());

            this.panel.title = "Nộp bài";

            clog("okay", "Initialised:", {
                color: flatc("red"),
                text: "core.file"
            });
        },

        reset() {
            if (this.uploading)
                return false;

            this.dropzone.classList.remove("hide");
            this.input.value = "";
            this.panel.title = "Nộp bài";
            this.name.innerText = "null";
            this.state.innerText = "null";
            this.size.innerText = "00/00";
            this.percent.innerText = "0%";
            this.bar.style.width = "0%";
            this.bar.className = "";
        },

        filesel(e, type = "drop") {
            if (type === "drop") {
                e.stopPropagation();
                e.preventDefault();
                e.target.classList.remove("drag");
            }

            if (this.uploading)
                return;

            var files = (type === "drop") ? e.dataTransfer.files : e.target.files;

            this.dropzone.classList.add("hide");

            clog("info", "Started uploading", {
                color: flatc("blue"),
                text: files.length
            }, "files");

            core.sound.confirm();

            this.state.innerText = "Chuẩn bị tải lên " + files.length + " tệp...";
            this.size.innerText = "00/00";
            this.percent.innerText = "0%";
            this.bar.style.width = "0%";
            setTimeout(() => {
                this.upload(files);
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
                this.uploading = false;
                this.reset();
                return;
            }

            clog("info", "Uploading", {
                color: flatc("yellow"),
                text: files[i].name
            });

            this.uploading = true;
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
                        clog("errr", "Upload Stopped:", {
                            color: flatc("red"),
                            text: res.description
                        });

                        this.uploading = false;
                        this.input.value = "";
                        this.state.innerText = res.description;
                        this.panel.title = "Nộp bài - Đã dừng.";
                        this.bar.classList.add("red");
                        return false;
                    }

                    clog("okay", "Uploaded ", {
                        color: flatc("yellow"),
                        text: files[i].name
                    });

                    this.state.innerText = "Tải lên thành công! " + (i + 1) + "/" + files.length;
                    this.onUploadSuccess();
                    
                    setTimeout(() => {
                        this.upload(files, i + 1);
                    }, this.uploadCoolDown / 2);
                }, res => {
                    clog("info", "Upload Stopped.");

                    this.uploading = false;
                    this.input.value = "";
                    this.state.innerText = res.description;
                    this.panel.title = "Nộp bài - Đã dừng.";
                    this.bar.classList.add("red");
                })
            }, this.uploadCoolDown / 2);
        },
    },

    problems: {
        panel: new regPanel($("#problemp")),
        list: $("#problem_list"),
        name: $("#problem_name"),
        point: $("#problem_point"),
        type: {
            filename: $("#problem_type_filename"),
            ext: $("#problem_type_ext"),
            time: $("#problem_type_time"),
            inp: $("#problem_type_inp"),
            out: $("#problem_type_out")
        },
        image: $("#problem_image"),
        description: $("#problem_description"),
        test: $("#problem_test"),
        attachment: {
            me: $("#problem_attachment"),
            link: $("#problem_attachment_link"),
            size: $("#problem_attachment_size")
        },

        async init() {
            this.panel.bak.hide();
            this.panel.bak.onClick(() => {
                this.list.classList.remove("hide");
                this.panel.title = "Đề bài"
                this.panel.bak.hide();
            })

            this.panel.ref.onClick(() => {
                this.getlist();
            });

            await this.getlist();

            clog("okay", "Initialised:", {
                color: flatc("red"),
                text: "core.problems"
            });
        },

        async getlist() {
            var data = Array();
            try {
                data = await myajax({
                    url: "/api/test/problems/list",
                    method: "GET"
                });
            } catch(e) {
                clog("WARN", "Kì thi chưa bắt đầu");
                this.panel.main.classList.add("blank");
                this.list.innerHTML = "";
                return false;
            }

            if (data.length === 0) {
                this.panel.main.classList.add("blank");
                this.list.innerHTML = "";
                return false;
            } else
                this.panel.main.classList.remove("blank");

            var html = "";
            data.forEach(item => {
                html += [
                    `<li class="item" onClick="core.problems.getproblem('${item.id}');">`,
                        `<img class="icon" src="${item.image}">`,
                        `<ul class="title">`,
                            `<li class="name">${item.name}</li>`,
                            `<li class="point">${item.point} điểm</li>`,
                        "</ul>",
                    "</li>",
                ].join("\n");
            })
            this.list.innerHTML = html;
        },

        async getproblem(id) {
            clog("info", "Opening problem", {
                color: flatc("yellow"),
                text: id
            });

            this.list.classList.add("hide");
            this.panel.bak.hide(false);

            var data = await myajax({
                url: "/api/test/problems/get",
                method: "GET",
                query: {
                    id: id
                }
            });

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
                this.image.title = "Nhấn để phóng to ảnh";
                core.wrapper.panel.main.innerHTML = `<img class="full" src="${data.image}">`;
                this.image.onclick = () => core.wrapper.show(`Ảnh đính kèm: ${data.name}`);
            } else
                this.image.style.display = "none";

            if (data.attachment.url) {
                this.attachment.me.style.display = "block";
                this.attachment.link.href = data.attachment.url;
                this.attachment.link.innerText = data.attachment.file;
            } else
                this.attachment.me.style.display = "none";

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

        async init() {
            this.timepanel.ref.onClick(() => {
                this.fetchtime(true);
            });

            this.timepanel.clo.onClick(e => {
                this.close();
            })

            if (LOGGED_IN)
                this.timepanel.clo.hide();

            await this.fetchtime(true);

            clog("okay", "Initialised:", {
                color: flatc("red"),
                text: "core.timer"
            });
        },

        close() {
            this.reset();
            this.timepanel.panel.classList.remove("show");
        },

        async fetchtime(init = false) {
            var data = await myajax({
                url: "/api/test/timer",
                method: "GET",
            });

            this.timedata = data;
            if (data.during <= 0) {
                $("#timep").classList.remove("show");
                clearInterval(this.interval);
                clog("info", "Timer Disabled: not in contest mode");
                return;
            }

            if (init) {
                $("#timep").classList.add("show");
                this.last = 0;
                clearInterval(this.interval);
                this.startinterval();
            }
        },

        startinterval() {
            this.timeUpdate();
            this.interval = setInterval(() => {
                this.timedata.time--;
                this.timeUpdate();
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

        timeUpdate() {
            if ((data = this.timedata).time <= 0 && data.phase !== 4)
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
                    if (this.last === 0)
                        this.last = t;

                    let p1 = ((t) / this.last) * 100;

                    this.time.classList.remove("red");
                    this.time.classList.remove("green");
                    this.time.innerText = parsetime(t).str;
                    this.bar.style.width = p1 + "%";
                    this.start.innerText = p1.toFixed(2) + "%";
                    this.end.innerText = parsetime(this.last).str;
                    this.state.innerText = "Bắt đầu kì thi sau";
                    break;
                case 2:
                    let p2 = (t / data.during) * 100;

                    this.time.classList.remove("red");
                    this.time.classList.add("green");
                    this.time.innerText = parsetime(t).str;
                    this.bar.style.width = p2 + "%";
                    this.start.innerText = p2.toFixed(2) + "%";
                    this.end.innerText = parsetime(data.during).str;
                    this.state.innerText = "Thời gian làm bài";
                    break;
                case 3:
                    let p3 = (t / data.offset) * 100;

                    this.time.classList.remove("green");
                    this.time.classList.add("red");
                    this.time.innerText = parsetime(t).str;
                    this.bar.style.width = p3 + "%";
                    this.start.innerText = p3.toFixed(2) + "%";
                    this.end.innerText = parsetime(data.offset).str;
                    this.state.innerText = "Thời gian bù";
                    break;
                case 4:
                    this.time.classList.remove("green");
                    this.time.classList.remove("red");
                    this.time.innerText = parsetime(t).str;
                    this.bar.style.width = "0%";
                    this.start.innerText = "---%";
                    this.end.innerText = "--:--";
                    this.state.innerText = "ĐÃ HẾT THỜI GIAN LÀM BÀI";
                    break;
                default:
                    clog("errr", "Unknown data.phase in core.timer.timeUpdate: " + data.phase);
                    break;
            }
        }
    },

    userSettings: {
        panel: class {
            constructor(elem) {
                if (!elem.classList.contains("panel"))
                    return false;
        
                this.elem = elem;
                this.eToggle = null;
                this.btn_group = fcfn(elem, "btn-group");
                this.btn_reload = fcfn(this.btn_group, "reload");
                this.btn_close = fcfn(this.btn_group, "close");
                this.emain = fcfn(elem, "main");
                this.funcOnToggle = () => {};

                this.btn_close.addEventListener("click", () => {
                    this.hide();
                })
            }
        
            hide() {
                this.elem.classList.remove("show");
                if (this.eToggle)
                    this.eToggle.classList.remove("active");

                this.funcOnToggle("hide");
            }

            show() {
                this.__hideActive();

                this.elem.classList.add("show");
                if (this.eToggle)
                    this.eToggle.classList.add("active");

                this.funcOnToggle("show");
            }

            toggle() {
                let c = this.elem.classList.contains("show");
                this.__hideActive();
 
                if (c === false)
                    this.elem.classList.add("show");

                if (this.eToggle)
                    this.eToggle.classList[c === false ? "add" : "remove"]("active");

                this.funcOnToggle(this.elem.classList.contains("show") ? "show" : "hide");                
            }

            __hideActive() {
                var l = this.elem.parentElement.getElementsByClassName("show");

                for (var i = 0; i < l.length; i++)
                    l[i].classList.remove("show");
                
            }

            set toggler(e) {
                this.eToggle = e;
                e.addEventListener("click", e => {
                    this.toggle(e);
                })
            }

            set onToggle(f) {
                this.funcOnToggle = f;
            }

            get main() {
                return this.emain;
            }

            get ref() {
                var t = this;
                return {
                    onClick(f = () => {}) {
                        t.btn_reload.addEventListener("click", f, true);
                    },
        
                    hide(h = true) {
                        if (h)
                            t.btn_reload.style.display = "none";
                        else
                            t.btn_reload.style.display = "block";
                    }
                }
            }
        },

        uname: $("#user_name"),
        uavt: $("#user_avt"),
        avt: $("#usett_avt"),
        avtw: $("#usett_avtw"),
        avtinp: $("#usett_avtinp"),
        name: $("#usett_name"),
        sub: {
            nameForm: $("#usett_edit_name_form"),
            passForm: $("#usett_edit_pass_form"),
            name: $("#usett_edit_name"),
            pass: $("#usett_edit_pass"),
            nPass: $("#usett_edit_npass"),
            renPass: $("#usett_edit_renpass"),
        },
        logoutBtn: $("#usett_logout"),
        nightModeToggle: $("#usett_nightMode"),
        updateDelaySlider: $("#usett_udelay_slider"),
        updateDelayText: $("#usett_udelay_text"),
        toggler: $("#usett_toggler"),
        container: $("#user_settings"),
        adminConfig: $("#usett_adminConfig"),
        panelContainer: $("#usett_panelContainer"),
        publicFilesPanel: null,
        publicFilesIframe: null,
        aboutPanel: null,
        licensePanel: null,

        __hideAllPanel() {
            var l = this.panelContainer.getElementsByClassName("show");

            for (var i = 0; i < l.length; i++) {
                l[i].classList.remove("show");
            }
        },
        
        init(loggedIn = true) {
            this.toggler.addEventListener("click", e => {this.toggle(e)}, false);

            this.aboutPanel = new this.panel($("#usett_aboutPanel"));
            this.aboutPanel.toggler = $("#usett_aboutToggler");

            this.licensePanel = new this.panel($("#usett_licensePanel"));
            this.licensePanel.toggler = $("#usett_licenseToggler");

            this.publicFilesPanel = new this.panel($("#usett_publicFilesPanel"));
            this.publicFilesPanel.toggler = $("#settings_publicFilesToggler");
            this.publicFilesIframe = fcfn(this.publicFilesPanel.main, "publicFiles-container");
            this.publicFilesPanel.ref.onClick(() => {
                this.publicFilesIframe.contentWindow.location.reload();
            })

            this.adminConfig.style.display = "none";

            // Night mode setting
            this.nightModeToggle.addEventListener("change", (e) => {
                if (e.target.checked === true) {
                    cookie.set("__darkMode", true);
                    document.body.classList.add("dark");
                } else {
                    cookie.set("__darkMode", false);
                    document.body.classList.remove("dark");
                }

                this.publicFilesIframe.contentWindow.location.reload();
                if (core.settings.cpanelIframe)
                    core.settings.cpanelIframe.contentWindow.location.reload();
            })
            
            this.nightModeToggle.checked = cookie.get("__darkMode", false) == "true";
            this.nightModeToggle.dispatchEvent(new Event("change"));

            // Update delay setting
            this.updateDelaySlider.addEventListener("input", (e) => {
                this.updateDelayText.innerText = `${e.target.value / 1000} giây/yêu cầu`;

                if (e.target.value < 2000)
                    e.target.classList.add("pink") || e.target.classList.remove("blue");
                else
                    e.target.classList.remove("pink") || e.target.classList.add("blue");
            })
            
            this.updateDelaySlider.addEventListener("change", e => {
                const v = e.target.value;
                this.updateDelayText.innerText = `${v / 1000} giây/yêu cầu`;
                clog("OKAY", "Set updateDelay to", `${v} ms/request`);
                cookie.set("__updateDelay", v);
                core.updateDelay = v;
            })

            this.updateDelaySlider.value = parseInt(cookie.get("__updateDelay", 2000));
            this.updateDelaySlider.dispatchEvent(new Event("change"));

            // If not logged in, Stop here
            if (!loggedIn) {
                $("#usett_userPanel").style.display = "none";

                clog("okay", "Initialised:", {
                    color: flatc("red"),
                    text: "core.usersettings (notLoggedIn mode)"
                });
                return;
            }

            this.avtw.addEventListener("dragenter",  e => this.dragenter(e), false);
            this.avtw.addEventListener("dragleave", e => this.dragleave(e), false);
            this.avtw.addEventListener("dragover", e => this.dragover(e), false);
            this.avtw.addEventListener("drop", e => this.filesel(e), false);

            this.avtinp.addEventListener("change", e => this.filesel(e, "input"));

            this.sub.nameForm.addEventListener("submit", e => {
                this.sub.nameForm.getElementsByTagName("button")[0].disabled = true;
                this.changename(this.sub.name.value);
            }, false)

            this.sub.passForm.addEventListener("submit", e => {
                this.sub.passForm.getElementsByTagName("button")[0].disabled = true;
                this.changepass(this.sub.pass.value, this.sub.nPass.value, this.sub.renPass.value);
            }, false)

            this.logoutBtn.addEventListener("click", e => {this.logout(e)}, false);

            clog("okay", "Initialised:", {
                color: flatc("red"),
                text: "core.usersettings"
            });

        },

        logout() {
            myajax({
                url: "/api/logout",
                method: "POST",
                form: {
                    "token": API_TOKEN
                }
            }, () => {
                location.reload();
            })
        },

        toggle() {
            if (this.container.classList.contains("show"))
                this.__hideAllPanel();

            this.toggler.classList.toggle("active");
            this.container.classList.toggle("show");
        },

        reset() {
            this.avtw.classList.remove("drop");
            this.avtw.classList.remove("load");
            this.sub.nameForm.getElementsByTagName("button")[0].disabled = false;
            this.sub.passForm.getElementsByTagName("button")[0].disabled = false;
            this.sub.name.value = null;
            this.sub.pass.value = null;
            this.sub.nPass.value = null;
            this.sub.renPass.value = null;
        },

        reload(data, m = 0) {
            core.fetchRank(true);
            if (m === 0)
                this.uavt.src = this.avt.src = data.src;
            else
                this.uname.innerText = this.name.innerText = data;
        },
        
        async changename(name) {
            await myajax({
                url: "/api/edit",
                method: "POST",
                form: {
                    "n": name,
                    "token": API_TOKEN
                }
            }, data => {
                this.reset();
                this.reload(data.name, 1);
                clog("okay", "Changed name to", {
                    color: flatc("pink"),
                    text: name
                })
            }, () => {
                this.reset();
            });
        },

        async changepass(pass, nPass, renPass) {
            await myajax({
                url: "/api/edit",
                method: "POST",
                form: {
                    "p": pass,
                    "np": nPass,
                    "rnp": renPass,
                    "token": API_TOKEN
                }
            }, () => {
                clog("okay", "Thay đổi mật khẩu thành công!");
                this.reset();
            }, () => {
                this.reset();
            });
        },

        filesel(e, type = "drop") {
            if (type === "drop") {
                e.stopPropagation();
                e.preventDefault();
                this.avtw.classList.remove("drag");
            }

            var file = (type === "drop") ? e.dataTransfer.files[0] : e.target.files[0];

            this.avtw.classList.add("load");
            setTimeout(() => {
                this.avtupload(file);
            }, 1000);
        },

        async avtupload(file) {
            await myajax({
                url: "/api/avt/change",
                method: "POST",
                form: {
                    "token": API_TOKEN,
                },
                file: file,
            }, data => {
                this.reset();
                this.reload(data);
                clog("okay", "Avatar changed.");
            }, () => {
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
        navcont: $("#usett_left_panel"),
        cpanel: null,
        cpanelIframe: null,
        ppanel: null,
        lpanel: null,
        adminConfig: $("#usett_adminConfig"),

        async init() {
            this.adminConfig.style.display = "block";
            this.cpanel = new core.userSettings.panel($("#settings_controlPanel"));
            this.ppanel = new core.userSettings.panel($("#settings_problem"));
            this.lpanel = new core.userSettings.panel($("#settings_syslogs"));
            this.cpanelIframe = this.cpanel.main.getElementsByTagName("iframe")[0];
            this.cpanelIframe.src = "config.php";

            this.cpanel.toggler = $("#settings_cpanelToggler");
            this.ppanel.toggler = $("#settings_problemToggler");
            this.lpanel.toggler = $("#settings_syslogsToggler");

            await this.problems.init();
            await this.syslogs.init(this.lpanel);

            this.cpanel.ref.onClick(() => {
                this.cpanelIframe.contentWindow.location.reload();
                clog("okay", "Reloaded CPanel IFrame.");
            })

            this.ppanel.ref.onClick(() => {
                this.problems.getlist();
                this.problems.resetform();
                this.problems.showlist();
                clog("okay", "Reloaded Problems Panel.");
            })

            this.lpanel.ref.onClick(() => {
                this.syslogs.refresh();
            })

            this.lpanel.onToggle = s => {
                if (s === "show")
                    this.syslogs.refresh();
            }

            clog("okay", "Initialised:", {
                color: flatc("red"),
                text: "core.settings"
            });
        },

        syslogs: {
            container: null,
            prevData: null,

            async init(panel) {
                this.container = panel.main;

                await this.refresh();
            },

            async refresh() {
                const data = await myajax({
                    url: "/api/logs",
                    method: "POST",
                    form: {
                        token: API_TOKEN
                    }
                });

                if (compareJSON(data, this.prevData))
                    return;

                this.prevData = data;
                this.container.innerHTML = "";
                var html = [];

                for (let i of data)
                    html.push([
                        `<div class="log ${i.level.toLowerCase()}">`,
                            `<span class="level">${i.level}</span>`,
                            `<span class="detail">`,
                                `<div class="top">`,
                                    `<t class="timestamp">${i.time}</t>`,
                                    `<t class="module">${i.module}</t>`,
                                    `<t class="client">${i.client.username}@${i.client.ip}</t>`,
                                `</div>`,
                                `<div class="text">${i.text}</div>`,
                            `</span>`,
                        `</div>`
                    ].join("\n"));
                
                this.container.innerHTML = html.join("\n");
                this.container.scrollTop = this.container.scrollHeight - this.container.clientHeight;
                clog("okay", "Refreshed SysLogs.");
            }
        },

        problems: {
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
                attachment: $("#problem_edit_attachment"),
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

            async init() {
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
                        `<div class="cell">`,
                            `<textarea placeholder="Input" required></textarea>`,
                            `<textarea placeholder="Output" required></textarea>`,
                            `<span class="delete" onClick="core.settings.problems.remtest(this)"></span>`,
                        `</div>`
                    ].join("\n");
                    this.form.testlist.insertAdjacentHTML("beforeend", html);
                });

                await this.getlist();

                clog("okay", "Initialised:", {
                    color: flatc("red"),
                    text: "core.settings.problems"
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

            async getlist() {
                var data = await myajax({
                    url: "/api/test/problems/list",
                    method: "GET"
                });

                this.list.innerHTML = "";
                data.forEach(item => {
                    html = [
                        `<li class="item">`,
                            `<img class="icon" src="${item.image}">`,
                            `<ul class="title">`,
                                `<li class="id">${item.id}</li>`,
                                `<li class="name">${item.name}</li>`,
                            `</ul>`,
                            `<div class="action">`,
                                `<span class="delete" onClick="core.settings.problems.remproblem('${item.id}')"></span>`,
                                `<span class="edit" onClick="core.settings.problems.editproblem('${item.id}')"></span>`,
                            `</div>`,
                        `</li>`,
                    ].join("\n");
                    this.list.innerHTML += html;
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

            async editproblem(id) {
                var data = await myajax({
                    url: "/api/test/problems/get",
                    method: "GET",
                    query: {
                        id: id
                    }
                });

                clog("info", "Editing problem", {
                    color: flatc("yellow"),
                    text: id
                });

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
                this.form.attachment.value = null;

                var html = "";
                data.test.forEach(item => {
                    html += [
                        `<div class="cell">`,
                            `<textarea placeholder="Input" required>${item.inp}</textarea>`,
                            `<textarea placeholder="Output" required>${item.out}</textarea>`,
                            `<span class="delete" onClick="core.settings.problems.remtest(this)"></span>`,
                        `</div>`
                    ].join("\n");
                })
                this.form.testlist.innerHTML = html;
                
                this.hidelist();
                setTimeout(e => {
                    this.form.name.focus();
                }, 300);
            },

            async remproblem(id) {
                clog("warn", "Deleting Problem", {
                    color: flatc("yellow"),
                    text: id + "."
                }, "Waiting for confirmation");

                if (!confirm("Bạn có chắc muốn xóa " + id + " không?"))
                    return false;

                await myajax({
                    url: "/api/test/problems/remove",
                    method: "POST",
                    form: {
                        id: id,
                        token: API_TOKEN
                    }
                });

                clog("okay", "Deleted Problem", {
                    color: flatc("yellow"),
                    text: id
                });

                this.getlist();
                this.showlist();
                core.problems.getlist();
            },

            async postsubmit() {
                this.title.innerText = "Đang lưu...";

                var data = new Array();
                data.id = this.form.id.value;
                data.name = this.form.name.value;
                data.point = this.form.point.value;
                data.time = this.form.time.value;
                data.inptype = this.form.inptype.value;
                data.outtype = this.form.outtype.value;
                data.accept = this.form.accept.value.split("|");
                data.image = (this.form.image.files.length !== 0) ? this.form.image.files[0] : null;
                data.desc = this.form.desc.value;
                data.attachment = (this.form.attachment.files.length !== 0) ? this.form.attachment.files[0] : null;

                var test = new Array();
                var testlist = this.form.testlist.getElementsByTagName("div");

                for (var i = 0; i < testlist.length; i++) {
                    var e = testlist[i].getElementsByTagName("textarea");
                    if (e[0].value === "" && e[1].value === "")
                        continue;

                    var t = {
                        inp: e[0].value,
                        out: e[1].value
                    }
                    test.push(t);
                }
                data.test = test;

                await this.submit(this.action, data);

                this.getlist();
                this.showlist();
                core.problems.getlist();
            },

            async submit(action, data) {
                if (["edit", "add"].indexOf(action) === -1)
                    return false;

                clog("info", "Problem Submit: ", {
                    color: flatc("green"),
                    text: action
                }, {
                    color: flatc("yellow"),
                    text: data.id
                });

                await myajax({
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
                        attm: data.attachment,
                        test: JSON.stringify(data.test),
                        token: API_TOKEN
                    }
                });
            }
        }
    },

    wrapper: {
        wrapper: $("#wrapper"),
        panel: new regPanel($("#wrapp")),

        init() {
            this.panel.ref.hide();
            this.panel.clo.onClick(this.hide);
            clog("okay", "Initialised:", {
                color: flatc("red"),
                text: "core.wrapper"
            });
        },

        show(title = "Title") {
            core.wrapper.wrapper.classList.add("show");
            core.wrapper.panel.title = title;
        },

        hide() {
            core.wrapper.wrapper.classList.remove("show");
        }
    },

    sound: {
        btn: {
            soundToggle: $("#usett_btn_sound_toggle"),
            soundOnMouseHover: $("#usett_btn_sound_mouse_hover"),
            soundOnBtnClick: $("#usett_btn_sound_button_click"),
            soundOnPanelToggle: $("#usett_btn_sound_panel_toggle"),
            soundOthers: $("#usett_btn_sound_others"),
            soundOnNotification: $("#usett_btn_sound_notification"),
        },

        sounds: {
            checkOff: null,
            checkOn: null,
            hover: null,
            hoverSoft: null,
            select: null,
            selectSoft: null,
            overlayPopIn: null,
            overlayPopOut: null,
            confirm: null,
            notification: null,
        },
        
        enable: {
            master: false,
            mouseOver: true,
            btnClick: true,
            panelToggle: true,
            others: true,
            notification: true,
        },

        async init(set = () => {}) {
            set(0, "Taking Cookies 🍪");
            this.enable.master = cookie.get("__s_m", false) == "true";
            this.enable.mouseOver = cookie.get("__s_mo", true) == "true";
            this.enable.btnClick = cookie.get("__s_bc", true) == "true";
            this.enable.panelToggle = cookie.get("__s_pt", true) == "true";
            this.enable.others = cookie.get("__s_ot", true) == "true";
            this.enable.notification = cookie.get("__s_nf", true) == "true";

            set(5, "Setting Events");
            this.__btnApplyEvent([{
                    e: this.btn.soundToggle,
                    k: "master"
                }, {
                    e: this.btn.soundOnMouseHover,
                    k: "mouseOver"
                }, {
                    e: this.btn.soundOnBtnClick,
                    k: "btnClick"
                }, {
                    e: this.btn.soundOnPanelToggle,
                    k: "panelToggle"
                }, {
                    e: this.btn.soundOthers,
                    k: "others"
                }, {
                    e: this.btn.soundOnNotification,
                    k: "notification"
                }]
            );
            this.updateSettings(true);

            set(10, "Loading Sounds");
            await this.loadSound((p, t) => {
                set(10 + p*0.85, `Loading: ${t}`);
            });

            set(95, "Scanning");
            this.scan();

            set(100, "Done");
            clog("okay", "Initialised:", {
                color: flatc("red"),
                text: "core.usersettings.sound"
            });
        },

        __btnApplyEvent(list) {
            for (var item of list) {
                item.e.item = item;
                item.e.addEventListener("change", (e) => {
                    var i = e.target.item;
                    this.enable[i.k] = i.e.checked;
                    this.updateSettings();
                })
            }
        },

        updateSettings(init = false) {
            if (init) {
                this.btn.soundToggle.checked = this.enable.master;
                this.btn.soundOnMouseHover.checked = this.enable.mouseOver;
                this.btn.soundOnBtnClick.checked = this.enable.btnClick;
                this.btn.soundOnPanelToggle.checked = this.enable.panelToggle;
                this.btn.soundOthers.checked = this.enable.others;
                this.btn.soundOnNotification.checked = this.enable.notification;
            }

            if (this.enable.master === false) {
                this.btn.soundOnMouseHover.disabled = true;
                this.btn.soundOnBtnClick.disabled = true;
                this.btn.soundOnPanelToggle.disabled = true;
                this.btn.soundOthers.disabled = true;
                this.btn.soundOnNotification.disabled = true;
            } else {
                this.btn.soundOnMouseHover.disabled = false;
                this.btn.soundOnBtnClick.disabled = false;
                this.btn.soundOnPanelToggle.disabled = false;
                this.btn.soundOthers.disabled = false;
                this.btn.soundOnNotification.disabled = false;
            }

            cookie.set("__s_m", this.enable.master, 9999);
            cookie.set("__s_mo", this.enable.mouseOver, 9999);
            cookie.set("__s_bc", this.enable.btnClick, 9999);
            cookie.set("__s_pt", this.enable.panelToggle, 9999);
            cookie.set("__s_ot", this.enable.others, 9999);
            cookie.set("__s_nf", this.enable.notification, 9999);
        },

        async loadSound(set = () => {}) {
            const soundList = [{
                key: "checkOff",
                name: "check-off.mp3"
            }, {
                key: "checkOn",
                name: "check-on.mp3"
            }, {
                key: "hover",
                name: "generic-hover.mp3"
            }, {
                key: "hoverSoft",
                name: "generic-hover-soft.mp3"
            }, {
                key: "select",
                name: "generic-select.mp3"
            }, {
                key: "selectSoft",
                name: "generic-select-soft.mp3"
            }, {
                key: "overlayPopIn",
                name: "overlay-pop-in.mp3"
            }, {
                key: "overlayPopOut",
                name: "overlay-pop-out.mp3"
            }, {
                key: "confirm",
                name: "generic-confirm.mp3"
            }, {
                key: "notification",
                name: "notification.mp3"
            }, {
                key: "valueChange",
                name: "generic-value-change.mp3"
            }]

            for (var i = 0; i < soundList.length; i++) {
                const o = soundList[i];
                set((i/(soundList.length - 1))*100, o.name);
                this.sounds[o.key] = await this.__loadSoundAsync(`/data/sounds/${o.name}`);
            }
        },

        async __loadSoundAsync(url, volume = 0.5) {
            sound = new Audio(url);
            clog("DEBG", `Loading sound: ${url}`);

            return new Promise((resolve, reject) => {
                sound.addEventListener("canplaythrough", handler = e => {
                    sound.removeEventListener("canplaythrough", handler);
                    sound.volume = volume;
                    clog("DEBG", `Sound loaded: ${url}`);
                    resolve(sound);
                });

                sound.addEventListener("error", e => {
                    clog("ERRR", `Error loading sound: ${url}`);
                    console.log(e);
                    reject(e);
                })
            })
        },

        __soundToggle(sound) {
            if (sound.readyState < 3)
                return false;

            if (!sound.paused)
                sound.pause();
            sound.currentTime = 0;
            sound.play().catch(e => {
                clog("errr", "Error occurred while trying to play sounds.");
            });
        },

        select() {
            if (this.enable.master && this.enable.btnClick)
                this.__soundToggle(this.sounds.select);
        },

        confirm() {
            if (this.enable.master && this.enable.others)
                this.__soundToggle(this.sounds.confirm);
        },

        notification() {
            if (this.enable.master && this.enable.notification)
                this.__soundToggle(this.sounds.notification);
        },

        scan() {
            const list = document.getElementsByClassName("sound");

            for (var item of list) {
                if (typeof item.dataset === "undefined") {
                    clog("DEBG", `Unknown element: ${e} in core.userSettings.sound.scan`);
                    continue;
                }

                if (typeof item.dataset.soundhover !== "undefined")
                    item.addEventListener("mouseenter", e => {
                        if (this.enable.master && this.enable.mouseOver)
                            this.__soundToggle(this.sounds.hover);
                    })

                if (typeof item.dataset.soundhoversoft !== "undefined")
                    item.addEventListener("mouseenter", e => {
                        if (this.enable.master && this.enable.mouseOver)
                            this.__soundToggle(this.sounds.hoverSoft);
                    })

                if (typeof item.dataset.soundselect !== "undefined")
                    item.addEventListener("mousedown", e => {
                        if (this.enable.master && this.enable.btnClick)
                            this.__soundToggle(this.sounds.select);
                    })

                if (typeof item.dataset.soundselectsoft !== "undefined")
                    item.addEventListener("mousedown", e => {
                        if (this.enable.master && this.enable.btnClick)
                            this.__soundToggle(this.sounds.selectSoft);
                    })

                if (typeof item.dataset.soundchange !== "undefined")
                    item.addEventListener("change", e => {
                        if (this.enable.master && this.enable.others)
                            this.__soundToggle(this.sounds.valueChange);
                    })

                if (typeof item.dataset.soundcheck !== "undefined")
                    item.addEventListener("change", e => {
                        if (this.enable.master && this.enable.btnClick)
                            if (e.target.checked === true)
                                this.__soundToggle(this.sounds.checkOn);
                            else
                                this.__soundToggle(this.sounds.checkOff);
                    })

                if (typeof item.dataset.soundtoggle === "string")
                    new ClassWatcher(item, item.dataset.soundtoggle, () => {
                        if (this.enable.master && this.enable.panelToggle)
                            this.__soundToggle(this.sounds.overlayPopIn);
                    }, () => {
                        if (this.enable.master && this.enable.panelToggle)
                            this.__soundToggle(this.sounds.overlayPopOut);
                    });
                
            }
        }
    },

}

class ClassWatcher {

    constructor(targetNode, classToWatch, classAddedCallback, classRemovedCallback) {
        this.targetNode = targetNode;
        this.classToWatch = classToWatch;
        this.classAddedCallback = classAddedCallback;
        this.classRemovedCallback = classRemovedCallback;
        this.observer = null;
        this.lastClassState = targetNode.classList.contains(this.classToWatch);

        this.mutationCallback = mutationsList => {
            for (let mutation of mutationsList) {
                if (mutation.type === "attributes" && mutation.attributeName === "class") {
                    let currentClassState = mutation.target.classList.contains(this.classToWatch);
                    if (this.lastClassState !== currentClassState) {
                        this.lastClassState = currentClassState;
                        if (currentClassState)
                            this.classAddedCallback();
                        else
                            this.classRemovedCallback();
                    }
                }
            }
        }

        this.init();
    }

    init() {
        this.observer = new MutationObserver(this.mutationCallback);
        this.observe();
    }

    observe() {
        this.observer.observe(this.targetNode, { attributes: true });
    }

    disconnect() {
        this.observer.disconnect();
    }
}