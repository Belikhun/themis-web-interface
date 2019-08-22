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
        this.ecus = fcfn(ri, "cus");
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

    get cus() {
        var t = this;
        return {
            onClick(f = () => {}) {
                t.ecus.addEventListener("click", f, true);
            },

            hide(h = true) {
                if (h)
                    t.ecus.style.display = "none";
                else
                    t.ecus.style.display = "inline";
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
    previousLogHash: "",
    previousRankHash: "",
    updateDelay: 2000,
    initialized: false,
    __logTimeout: null,
    __rankTimeout: null,

    languages: {
        "pas": "Pascal",
        "cpp": "C++",
        "c": "C",
        "py": "Python",
        "java": "Java",
        "class": "Compiled Java",
        "pp": "Pascal",
        "exe": "Windows Executable"
    },

    async init(set) {
        clog("info", "Initializing...");
        var initTime = new stopClock();

        set(0, "Initializing: core.dialog");
        this.dialog.init();

        set(5, "Applying onRatelimited");
        __connection__.onRatelimited = async o => {
            const clock = document.createElement("t");
            clock.classList.add("rateLimitedClock");

            o.onCount(left => {
                clock.innerHTML = `${left}<span class="inner">giây còn lại</span>`;

                if (left <= 0)
                    core.dialog.hide();
            })

            core.dialog.show({
                panelTitle: "Rate Limited",
                title: "Oops",
                description: `Bạn đã bị cấm yêu cầu tới máy chủ trong vòng <b>${parseInt(o.data.data.reset)} giây</b>!<br>Vui lòng chờ cho tới khi bạn hết bị cấm!`,
                level: "warning",
                additionalNode: clock,
                buttonList: {
                    close: { text: "Đã rõ!", color: "dark" }
                }
            })
        }

        set(7, "Initializing: core.wrapper");
        this.wrapper.init();

        set(10, "Fetching Rank...");
        await this.fetchRank();
        this.rankPanel.ref.onClick(() => this.fetchRank(true));
        __connection__.onStateChange((s) => { s === "online" ? this.__fetchRank() : null });
        this.__fetchRank();

        set(15, "Initializing: core.timer");
        await this.timer.init();

        set(20, "Initializing: core.userSettings");
        this.userSettings.init(LOGGED_IN);

        set(25, "Initializing: core.sound");
        await this.sound.init((p, t) => {
            set(25 + p*0.5, `Initializing: core.sounds (${t})`);
        });

        set(75, "Initializing: core.problems");
        await this.problems.init();
        
        if (LOGGED_IN) {
            this.problems.panel.clo.hide();

            set(80, "Initializing: core.submit");
            this.submit.init();

            set(85, "Fetching Logs...");
            await this.fetchLog();
            this.logPanel.ref.onClick(() => this.__fetchLog(true, false));
            this.logPanel.cus.onClick(() => this.__fetchLog(false, true));
            this.submit.onUploadSuccess = () => this.__fetchLog();
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
                text: e.data.description,
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
                rawData: true,
                changeState: false,
                reRequest: false
            });
        } catch (error) {
            clog("WARN", "Error Checking for update:", {
                text: typeof error.data === "undefined" ? error.description : error.data.description,
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
            e.innerHTML = `
                <div class="left">
                    <t>Hiện đã có phiên bản mới: <b>${tgs}</b></t>
                    <t>Nhấn vào nút dưới đây để đi tới trang tải xuống:</t>
                    <a href="${data.html_url}" target="_blank" rel="noopener" class="sq-btn dark" style="margin-top: 10px; width: 100%;">${data.tag_name} : ${data.target_commitish}</a>
                </div>
                <div class="right"></div>
            `

            this.settings.adminConfig.appendChild(e);
        }
    },

    async __fetchLog(bypass = false, clearJudging = false) {
        clearTimeout(this.__logTimeout);
        var timer = new stopClock();
        this.initialized ? await this.fetchLog(bypass, clearJudging) : null;
        
        this.__logTimeout = setTimeout(() => this.__fetchLog(), this.updateDelay - timer.stop*1000);
    },

    async __fetchRank() {
        clearTimeout(this.__rankTimeout);
        var timer = new stopClock();
        this.initialized ? await this.fetchRank() : null;
        
        this.__rankTimeout = setTimeout(() => this.__fetchRank(), this.updateDelay - timer.stop*1000);
    },

    async fetchLog(bypass = false, clearJudging = false) {
        let data = await myajax({
            url: "/api/test/logs",
            method: clearJudging ? "DELETE" : "GET",
        });

        if (data.hash === this.previousLogHash && !bypass)
            return false;

        clog("debg", "Updating Log");
        let updateLogTimer = new stopClock();

        let list = this.logPanel.main.getElementsByClassName("log-item-container")[0];
        
        if (data.judging.length === 0 && data.logs.length === 0 && data.queues.length === 0) {
            this.logPanel.main.classList.add("blank");
            this.previousLogHash = data.hash;
            list.innerHTML = "";

            clog("debg", "Log Is Blank. Took", {
                color: flatc("blue"),
                text: updateLogTimer.stop + "s"
            });

            return false;
        } else
            this.logPanel.main.classList.remove("blank");

        let out = "";
        
        for (let item of data.judging)
            out += `
                <li class="log-item judging">
                    <div class="h">
                        <div class="l">
                            <t class="t">${item.lastmodify}</t>
                            <t class="n">${item.problem}</t>
                        </div>
                        <div class="r">
                            <t class="s">Đang chấm</t>
                            <t class="l">${this.languages[item.extension] || item.extension}</t>
                        </div>
                    </div>
                    <a class="d"></a>
                </li>
            `

        for (let item of data.queues)
            out += `
                <li class="log-item queue">
                    <div class="h">
                        <div class="l">
                            <t class="t">${item.lastmodify}</t>
                            <t class="n">${item.problem}</t>
                        </div>
                        <div class="r">
                            <t class="s">Đang chờ</t>
                            <t class="l">${this.languages[item.extension] || item.extension}</t>
                        </div>
                    </div>
                    <a class="d"></a>
                </li>
            `

        for (let item of data.logs)
            out += `
                <li class="log-item ${item.status}">
                    <div class="h">
                        <div class="l">
                            <t class="t">${item.lastmodify}</t>
                            <t class="n">${item.problem}</t>
                        </div>
                        <div class="r">
                            <t class="s">${item.point} điểm</t>
                            <t class="l">${this.languages[item.extension] || item.extension}</t>
                        </div>
                    </div>
                    <a class="d${item.logFile ? ` link" onClick="core.viewLog('${item.logFile}')"` : `"`}></a>
                </li>
            `

        list.innerHTML = out;
        this.previousLogHash = data.hash;

        clog("debg", "Log Updated. Took", {
            color: flatc("blue"),
            text: updateLogTimer.stop + "s"
        });
    },

    async fetchRank(bypass = false) {
        let data = await myajax({
            url: "/api/test/rank",
            method: "GET",
        });

        if (data.hash === this.previousRankHash && !bypass)
            return false;

        clog("debg", "Updating Rank");
        let updateRankTimer = new stopClock();

        if (data.list.length === 0 && data.rank.length === 0) {
            this.rankPanel.main.classList.add("blank");
            this.previousRankHash = data.hash;
            this.rankPanel.main.innerHTML = "";
            
            clog("debg", "Rank Is Blank. Took", {
                color: flatc("blue"),
                text: updateRankTimer.stop + "s"
            });

            return false;
        } else
            this.rankPanel.main.classList.remove("blank");


        let list = data.list;
        let out = `
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th></th>
                        <th>Thí sinh</th>
                        <th>Tổng</th>
        `

        for (let i of data.list)
            out += `<th>${i}</th>`;

        out += "</tr></thead><tbody>";
        let ptotal = 0;
        let rank = 0;

        for (let i of data.rank) {
            if (ptotal !== i.total) {
                ptotal = i.total;
                rank++;
            }

            out += `
                <tr data-rank=${rank}>
                    <td>${rank}</td>
                    <td>
                        <div class="lazyload avt">
                            <img onload="this.parentNode.dataset.loaded = 1" src="/api/avt/get?u=${i.username}"/>
                            <div class="simple-spinner"></div>
                        </div>
                    </td>
                    <td><t class="name">${escapeHTML(i.name || "u:" + i.username)}</t></td>
                    <td class="number">${parseFloat(i.total).toFixed(2)}</td>
            `

            for (let j of list)
                out += `
                    <td class="number ${i.status[j] || ""}
                        ${(i.logFile[j]) ? ` link" onClick="core.viewLog('${i.logFile[j]}')` : ""}" >
                            ${(typeof i.point[j] !== "undefined") ? parseFloat(i.point[j]).toFixed(2) : "X"}</td>`;
            
            out += "</tr>";
        }

        out += "</tbody></table>";
        this.rankPanel.main.innerHTML = out;
        this.previousRankHash = data.hash;

        clog("debg", "Rank Updated. Took", {
            color: flatc("blue"),
            text: updateRankTimer.stop + "s"
        });
    },

    async viewLog(file) {
        clog("info", "Opening log file", {
            color: flatc("yellow"),
            text: file
        });

        var data = await myajax({
            url: "/api/test/viewlog",
            method: "GET",
            query: {
                "f": file
            }
        });

        let status = {
            correct: "CHÍNH XÁC",
            passed: "Chấm thành công",
            accepted: "Dịch thành công",
            failed: "Dịch thất bại"
        }

        let logLine = [];
        if (data.header.error.length !== 0)
            for (let line of data.header.error)
                logLine.push(`<li>${line}</li>`);
        else
            logLine.push(`<li>${data.header.description}</li>`)

        let testList = [];
        for (let item of data.test)
            testList.push(`
                <div class="item ${item.status}">
                    <div class="line">
                        <span class="left">
                            <t class="testid">${item.test}</t>
                            <t class="status">${item.detail || "Không rõ"}</t>
                        </span>
                        <span class="right">
                            <t class="point">${item.point} điểm</t>
                            <t class="runtime">${item.runtime.toFixed(3)}s</t>
                        </span>
                    </div>
                    ${((item.other.output) && (item.other.answer)) || (item.other.error) ? `<div class="line detail">
                        ${(item.other.output) ? `<t>Output: ${item.other.output}</t>` : ""}
                        ${(item.other.answer) ? `<t>Answer: ${item.other.answer}</t>` : ""}
                        ${(item.other.error) ? `<t>${item.other.error}</t>` : ""}
                    </div>` : ""}
                </div>
            `);

        let template = `
            <div class="viewlog-container">
                <div class="header ${data.header.status}">
                    <span class="top">
                        <div class="lazyload problemIcon">
                            <img onload="this.parentNode.dataset.loaded = 1" src="/api/test/problems/image?id=${data.header.problem}"/>
                            <div class="simple-spinner"></div>
                        </div>
                        <t class="problemName">${data.header.problemName || data.header.problem}</t>
                        <t class="point">${data.header.problemPoint ? data.header.problemPoint + " điểm" : "Không rõ"}</t>
                    </span>
                    <span class="bottom">
                        <div class="line">
                            <span class="left">
                                <div class="row problemInfo">
                                    <t class="problemid">${data.header.problem}</t>
                                    <t class="language">${this.languages[data.header.file.extension] || "Không rõ ngôn ngữ"}</t>
                                </div>
                                
                                <t class="row point">${data.header.point} điểm</t>
                                <t class="row submitTime">${(new Date(data.header.file.lastModify * 1000)).toLocaleString()}</t>
                                <t class="row status">${status[data.header.status]}</t>
                                <t class="row result">
                                    Đúng <b class="green">${data.header.testPassed}/${data.header.testPassed + data.header.testFailed}</b> tests, <b class="red">${data.header.testFailed}</b> tests sai
                                </t>
                            </span>
                            <span class="right">
                                <span class="submitter">
                                    <div class="lazyload avatar">
                                        <img onload="this.parentNode.dataset.loaded = 1" src="/api/avt/get?u=${data.header.user}"/>
                                        <div class="simple-spinner"></div>
                                    </div>
                                    <span class="info">
                                        <t class="tag">Bài làm của:</t>
                                        <t class="name">${data.header.name || "u:" + data.header.user}</t>
                                    </span>
                                </span>

                                <a href="/api/test/rawlog?f=${data.header.file.logFilename}" class="sq-btn blue" rel="noopener" target="_blank">📄 Raw Log</a>
                            </span>
                        </div>

                        <div class="line log">
                            <ul class="textview">${logLine.join("\n")}</ul>
                        </div>
                    </span>
                </div>
                <div class="testList">${testList.join("\n")}</div>
            </div>
        `;
        
        this.wrapper.panel.main.innerHTML = template;
        this.wrapper.show(file);
    },

    submit: {
        dropzone: $("#submitDropzone"),
        input: $("#submitInput"),
        state: $("#submitStatus"),
        name: $("#submitFileName"),
        bar: $("#submitProgressBar"),
        percent: $("#submitInfoProgress"),
        size: $("#submitInfoSize"),
        panel: new regPanel($("#uploadp")),
        uploadCoolDown: 1000,
        uploading: false,
        onUploadSuccess() {},

        init() {
            this.dropzone.addEventListener("dragEnter", this.dragEnter, false);
            this.dropzone.addEventListener("dragLeave", this.dragLeave, false);
            this.dropzone.addEventListener("dragOver", this.dragOver, false);
            this.dropzone.addEventListener("drop", e => this.fileSelect(e), false);
            this.input.addEventListener("change", e => this.fileSelect(e, "input"));
            this.panel.ref.onClick(() => this.reset());

            this.panel.title = "Nộp bài";

            clog("okay", "Initialised:", {
                color: flatc("red"),
                text: "core.submit"
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
            this.bar.dataset.color = "";
        },

        fileSelect(e, type = "drop") {
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
            this.bar.dataset.color = "aqua";
            setTimeout(() => this.upload(files), 1000);
        },

        dragEnter(e) {
            e.stopPropagation();
            e.preventDefault();
            this.classList.add("drag");
        },

        dragLeave(e) {
            e.stopPropagation();
            e.preventDefault();
            this.classList.remove("drag");
        },

        dragOver(e) {
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

            let p = (i / files.length) * 100;

            this.uploading = true;
            this.name.innerText = files[i].name;
            this.state.innerText = "Đang tải lên...";
            this.panel.title = "Nộp bài - Đang tải lên " + (i + 1) + "/" + files.length +"...";
            this.size.innerText = "00/00";
            this.percent.innerText = `${p.toFixed(0)}%`;
            this.bar.style.width = `${p}%`;

            setTimeout(() => {
                myajax({
                    url: "/api/test/upload",
                    method: "POST",
                    form: {
                        "token": API_TOKEN,
                        file: files[i]
                    },
                    onUpload: e => {
                        let p = (100 * ((e.loaded / e.total) + i)) / files.length;

                        this.size.innerText = e.loaded + "/" + e.total;
                        this.percent.innerText = `${p.toFixed(0)}%`;
                        this.bar.style.width = `${p}%`;
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

                    this.state.innerText = `Tải lên thành công! ${(i + 1)}/${files.length}`;
                    this.onUploadSuccess();
                    
                    setTimeout(() => {
                        this.upload(files, i + 1);
                    }, this.uploadCoolDown / 2);
                }, e => {
                    clog("info", "Upload Stopped.");

                    this.uploading = false;
                    this.input.value = "";
                    this.state.innerText = e.data.description;
                    this.panel.title = "Nộp bài - Đã dừng.";
                    this.bar.dataset.color = "red";
                })
            }, this.uploadCoolDown / 2);
        },
    },

    problems: {
        panel: new regPanel($("#problemp")),
        list: $("#problemList"),
        name: $("#problem_name"),
        point: $("#problem_point"),
        enlargeBtn: $("#problem_enlarge"),
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
        loaded: false,
        data: null,

        async init(loggedIn = false) {
            this.panel.bak.hide();
            this.panel.bak.onClick(() => {
                this.list.classList.remove("hide");
                this.panel.title = "Đề bài";
                this.panel.bak.hide();
            })

            if (loggedIn)
                this.panel.clo.hide();

            this.enlargeBtn.addEventListener("click", () => this.enlargeProblem(this.data));
            this.panel.ref.onClick(() => this.getList());
            this.panel.clo.onClick(() => this.panel.elem.classList.add("hide"));

            await this.getList();

            clog("okay", "Initialised:", {
                color: flatc("red"),
                text: "core.problems"
            });
        },

        async getList() {
            var data = Array();
            try {
                data = await myajax({
                    url: "/api/test/problems/list",
                    method: "GET"
                });
            } catch(e) {
                if (e.data.code === 103) {
                    clog("WARN", "Kì thi chưa bắt đầu");
                    this.panel.main.classList.add("blank");
                    this.list.innerHTML = "";
                } else
                    console.error(e);

                this.loaded = false;
                return false;
            }

            if (data.length === 0) {
                this.panel.main.classList.add("blank");
                this.list.innerHTML = "";
                return false;
            } else
                this.panel.main.classList.remove("blank");

            this.loaded = true;
            let html = "";
            data.forEach(item => {
                html += `
                    <li class="item" onClick="core.problems.viewProblem('${item.id}');">
                        <div class="lazyload icon">
                            <img onload="this.parentNode.dataset.loaded = 1" src="${item.image}"/>
                            <div class="simple-spinner"></div>
                        </div>
                        <ul class="title">
                            <li class="name">${item.name}</li>
                            <li class="point">${item.point} điểm</li>
                        </ul>
                    </li>
                `
            })
            this.list.innerHTML = html;
        },

        async viewProblem(id) {
            clog("info", "Opening problem", {
                color: flatc("yellow"),
                text: id
            });

            this.list.classList.add("hide");
            this.panel.bak.hide(false);
            this.panel.title = "Đang tải...";

            var data = await myajax({
                url: "/api/test/problems/get",
                method: "GET",
                query: {
                    id: id
                }
            });
            this.data = data;

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
                delete this.image.dataset.loaded;
                this.image.innerHTML = `
                    <img onload="this.parentNode.dataset.loaded = 1" src="${data.image}"/>
                    <div class="simple-spinner"></div>`
            } else
                this.image.style.display = "none";

            if (data.attachment.url) {
                this.attachment.me.style.display = "block";
                this.attachment.link.href = data.attachment.url;
                this.attachment.link.innerText = `${data.attachment.file} (${convertSize(data.attachment.size)})`;
            } else
                this.attachment.me.style.display = "none";

            this.description.innerHTML = data.description;
            testhtml = "";
            data.test.forEach(item => {
                testhtml += [
                    `<tr>`,
                        `<td>${escapeHTML(item.inp)}</td>`,
                        `<td>${escapeHTML(item.out)}</td>`,
                    `</tr>`
                ].join("\n");
            })

            this.test.innerHTML = [
                "<tr>",
                    "<th>Input</th>",
                    "<th>Output</th>",
                "</tr>"
            ].join("\n") + testhtml;
        },

        enlargeProblem(data) {
            if (!data)
                return;

            let testHtml = "";
            data.test.forEach(item => {
                testHtml += `
                    <tr>
                        <td>${escapeHTML(item.inp)}</td>
                        <td>${escapeHTML(item.out)}</td>
                    </tr>
                `
            })

            let html = `
                <div class="problemEnlarged">
                    <span class="left">
                        <t class="name">${data.name}</t>
                        <t class="point">${data.point} điểm</t>
                        <table class="simple-table type">
                            <tbody>
                                <tr class="filename">
                                    <td>Tên tệp</td>
                                    <td>${data.id}</td>
                                </tr>
                                <tr class="ext">
                                    <td>Đuôi tệp</td>
                                    <td>${data.accept.join(", ")}</td>
                                </tr>
                                <tr class="time">
                                    <td>Thời gian chạy</td>
                                    <td>${data.time} giây</td>
                                </tr>
                                <tr class="inp">
                                    <td>Dữ liệu vào</td>
                                    <td>${data.type.inp}</td>
                                    </tr>
                                <tr class="out">
                                    <td>Dữ liệu ra</td>
                                    <td>${data.type.out}</td>
                                </tr>
                            </tbody>
                        </table>

                        ${(data.attachment.url)
                            ?   `<div class="attachment" style="display: block;">
                                    <a class="link" href="${data.attachment.url}">${data.attachment.file} (${convertSize(data.attachment.size)})</a>
                                </div>`
                            :   ""
                        }

                        ${(data.test.length !== 0)
                            ?   `<table class="simple-table test">
                                    <tbody>
                                        <tr>
                                            <th>Input</th>
                                            <th>Output</th>
                                        </tr>
                                        ${testHtml}
                                    </tbody>
                                </table>`
                            :   ""
                        }
                    </span>

                    <span class="right">
                        <div class="description">${data.description}</div>
                        ${(data.image)
                            ?   `<div class="lazyload image">
                                    <img onload="this.parentNode.dataset.loaded = 1" src="${data.image}"/>
                                    <div class="simple-spinner"></div>
                                </div>`
                            :   ""
                        }
                    </span>
                </div>
            `;

            core.wrapper.panel.main.innerHTML = html;
            core.wrapper.show("Đề bài - " + data.name);
        }
    },

    timer: {
        timePanel: new regPanel($("#timep")),
        state: $("#timeState"),
        time: $("#timeClock"),
        timeMs: $("#timeClockMs"),
        bar: $("#timeProgress"),
        start: $("#timeStart"),
        end: $("#timeEnd"),
        timeData: Array(),
        enabled: true,
        interval: null,
        showMs: false,
        last: 0,

        async init() {
            this.timePanel.ref.onClick(() => this.fetchTime(true));
            this.timePanel.clo.onClick(e => this.close());

            if (LOGGED_IN)
                this.timePanel.clo.hide();

            await this.fetchTime(true);

            clog("okay", "Initialised:", {
                color: flatc("red"),
                text: "core.timer"
            });
        },

        close() {
            this.reset();
            this.timePanel.panel.classList.remove("show");
        },

        async fetchTime(init = false) {
            var data = await myajax({
                url: "/api/test/timer",
                method: "GET",
            });

            if (data.during <= 0) {
                $("#timep").classList.remove("show");
                clearInterval(this.interval);
                clog("info", "Timer Disabled: not in contest mode");

                this.enabled = false;
                return;
            }
            
            this.enabled = true;
            this.timeData = data;
            this.start.innerText = `${(new Date(data.start * 1000)).toLocaleTimeString()} tới ${(new Date((data.start + data.during) * 1000)).toLocaleTimeString()}`;

            if (init) {
                $("#timep").classList.add("show");
                this.last = 0;
                clearInterval(this.interval);
                this.startInterval();
            }
        },

        startInterval(time = 1000) {
            if (!this.enabled)
                return;

            this.timeUpdate();
            this.interval = setInterval(() => this.timeUpdate(), time);
        },

        toggleMs(show = true) {
            if (show) {
                clearInterval(this.interval);
                this.startInterval(65);
                this.showMs = true;
                this.timePanel.main.classList.add("ms");
                this.bar.classList.add("noTransition");
            } else {
                clearInterval(this.interval);
                this.startInterval(1000);
                this.showMs = false;
                this.timePanel.main.classList.remove("ms");
                this.bar.classList.remove("noTransition");
            }
        },

        reset() {
            clearInterval(this.interval);
            this.timePanel.main.dataset.color = "red";
            this.time.innerText = "--:--";
            this.bar.style.width = "0%";
            this.bar.dataset.color = "blue";
            this.start.innerText = "--:--:-- - --:--:--";
            this.end.innerText = "--:--";
            this.state.innerText = "---";
            this.last = 0;
            this.timeData.phase = 0;
        },

        timeUpdate() {
            let beginTime = this.timeData.start;
            let duringTime = this.timeData.during;
            let offsetTime = this.timeData.offset;
            let t = beginTime - time() + duringTime;

            let color = "";
            let proc = 0;
            let end = "";
            let state = "";

            if (t > duringTime) {
                t -= duringTime;
                if (this.last === 0)
                    this.last = t;

                color = "blue";
                proc = ((t) / this.last) * 100;
                end = parseTime(this.last).str;
                state = "Bắt đầu kì thi sau";
            } else if (t > 0) {
                if (!core.problems.loaded) {
                    clog("INFO", "Reloading problems list and public files list");
                    core.problems.getList();

                    if (core.userSettings.publicFilesIframe)
                        core.userSettings.publicFilesIframe.contentWindow.location.reload();
                }

                color = "green";
                proc = (t / duringTime) * 100;
                end = parseTime(duringTime).str;
                state = "Thời gian làm bài";
            } else if (t > -offsetTime) {
                t += offsetTime;
                
                color = "red";
                proc = (t / offsetTime) * 100;
                end = parseTime(offsetTime).str;
                state = "Thời gian bù";
            } else {
                t += offsetTime;

                color = "";
                proc = 0;
                end = "--:--";
                state = "ĐÃ HẾT THỜI GIAN LÀM BÀI";
            }

            let tp = parseTime(t);
            if (this.showMs)
                this.timeMs.innerText = tp.ms;

            this.timePanel.main.dataset.color = color;
            this.bar.dataset.color = color;
            this.time.innerText = tp.str;
            this.bar.style.width = proc + "%";
            this.end.innerText = end;
            this.state.innerText = state;
        }
    },

    userSettings: {
        panel: class {
            constructor(elem) {
                if (!elem.classList.contains("panel"))
                    return false;
        
                this.container = $("#user_settings");

                this.elem = elem;
                this.eToggle = null;
                this.btn_group = fcfn(elem, "btn-group");
                this.btn_reload = fcfn(this.btn_group, "reload");
                this.btn_close = fcfn(this.btn_group, "close");
                this.btn_custom = fcfn(this.btn_group, "custom")
                this.emain = fcfn(elem, "main");
                this.funcOnToggle = () => {};

                this.btn_close.addEventListener("click", () => this.hide());
            }
        
            hide() {
                this.elem.classList.remove("show");
                this.container.classList.remove("subPanel");

                if (this.eToggle)
                    this.eToggle.classList.remove("active");

                this.funcOnToggle("hide");
            }

            show() {
                this.__hideActive();
                this.elem.classList.add("show");
                this.container.classList.add("subPanel");

                if (this.eToggle)
                    this.eToggle.classList.add("active");

                this.funcOnToggle("show");
            }

            toggle() {
                let c = !this.elem.classList.contains("show");
                this.__hideActive();
                this.container.classList[c ? "add" : "remove"]("subPanel");
 
                if (c)
                    this.elem.classList.add("show");

                if (this.eToggle)
                    this.eToggle.classList[c ? "add" : "remove"]("active");

                this.funcOnToggle(c ? "show" : "hide");                
            }

            __hideActive() {
                var l = this.elem.parentElement.getElementsByClassName("show");

                for (var i = 0; i < l.length; i++)
                    l[i].classList.remove("show");
                
            }

            set toggler(e) {
                this.eToggle = e;
                e.addEventListener("click", e => this.toggle(e));
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

            get cus() {
                var t = this;
                return {
                    onClick(f = () => {}) {
                        t.btn_custom.addEventListener("click", f, true);
                    },
        
                    hide(h = true) {
                        if (h)
                            t.btn_custom.style.display = "none";
                        else
                            t.btn_custom.style.display = "block";
                    }
                }
            }
        },

        toggleSwitch: class {
            constructor(inputElement, cookieKey, onCheck = () => {}, onUncheck = () => {}, defValue = false) {
                this.input = inputElement;
                this.onCheckHandler = onCheck;
                this.onUnCheckHandler = onUncheck;

                this.input.addEventListener("change", e => {
                    cookie.set(cookieKey, e.target.checked);

                    if (e.target.checked === true)
                        this.onCheckHandler(e);
                    else
                        this.onUnCheckHandler(e);
                })
                
                this.change(cookie.get(cookieKey, defValue) === "true");
            }

            change(value) {
                this.input.checked = value;
                this.input.dispatchEvent(new Event("change"));
            }

            set onCheck(handler) {
                this.onCheckHandler = handler;
            }

            set onUnCheck(handler) {
                this.onUnCheckHandler = handler;
            }
        },

        uname: $("#user_name"),
        uavt: $("#user_avt"),
        avt: $("#usett_avt"),
        avtWrapper: $("#usett_avtw"),
        avtInput: $("#usett_avtinp"),
        name: $("#usett_name"),
        sub: {
            nameForm: $("#usett_edit_name_form"),
            passForm: $("#usett_edit_pass_form"),
            name: $("#usett_edit_name"),
            pass: $("#usett_edit_pass"),
            newPass: $("#usett_edit_npass"),
            reTypePass: $("#usett_edit_renpass"),
        },
        logoutBtn: $("#usett_logout"),
        nightModeToggler: $("#usett_nightMode"),
        transitionToggler: $("#usett_transition"),
        millisecondToggler: $("#usett_millisecond"),
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
        licenseIframe: null,

        __hideAllPanel() {
            var l = this.panelContainer.getElementsByClassName("show");

            for (var i = 0; i < l.length; i++)
                l[i].classList.remove("show");
        },
        
        init(loggedIn = true) {
            this.toggler.addEventListener("click", e => this.toggle(e), false);

            this.aboutPanel = new this.panel($("#usett_aboutPanel"));
            this.aboutPanel.toggler = $("#usett_aboutToggler");

            this.licensePanel = new this.panel($("#usett_licensePanel"));
            this.licensePanel.toggler = $("#usett_licenseToggler");
            this.licenseIframe = fcfn(this.licensePanel.main, "cpanel-container");
            this.licensePanel.ref.onClick(() => this.licenseIframe.contentWindow.location.reload());

            this.publicFilesPanel = new this.panel($("#usett_publicFilesPanel"));
            this.publicFilesPanel.toggler = $("#settings_publicFilesToggler");
            this.publicFilesIframe = fcfn(this.publicFilesPanel.main, "publicFiles-container");
            this.publicFilesPanel.ref.onClick(() => this.publicFilesIframe.contentWindow.location.reload());

            this.adminConfig.style.display = "none";

            // Night mode setting
            let nightMode = new this.toggleSwitch(this.nightModeToggler, "__darkMode", e => {
                document.body.classList.add("dark");

                this.publicFilesIframe.contentWindow.document.body.classList.add("dark");
                this.licenseIframe.contentWindow.document.body.classList.add("dark");
                if (core.settings.cPanelIframe)
                    core.settings.cPanelIframe.contentWindow.document.body.classList.add("dark");
            }, e => {
                document.body.classList.remove("dark");

                this.publicFilesIframe.contentWindow.document.body.classList.remove("dark");
                this.licenseIframe.contentWindow.document.body.classList.remove("dark");
                if (core.settings.cPanelIframe)
                    core.settings.cPanelIframe.contentWindow.document.body.classList.remove("dark");
            }, false);

            // Millisecond setting
            let milisecond = new this.toggleSwitch(this.millisecondToggler, "__showms",
                e => core.timer.toggleMs(true),
                e => core.timer.toggleMs(false),
                false
            )
            
            // Transition setting
            let transition = new this.toggleSwitch(this.transitionToggler, "__transition",
                e => document.body.classList.remove("disableTransition"),
                e => document.body.classList.add("disableTransition"),
                true
            )

            // Update delay setting
            this.updateDelaySlider.addEventListener("input", e => {
                let value = parseInt(e.target.value);

                this.updateDelayText.innerText = `${value / 1000} giây/yêu cầu`;

                if (value < 2000)
                    e.target.classList.add("pink") || e.target.classList.remove("blue");
                else
                    e.target.classList.remove("pink") || e.target.classList.add("blue");
            })
            
            this.updateDelaySlider.addEventListener("change", e => {
                let value = parseInt(e.target.value);

                this.updateDelayText.innerText = `${value / 1000} giây/yêu cầu`;
                clog("OKAY", "Set updateDelay to", `${value} ms/request`);
                cookie.set("__updateDelay", value);
                core.updateDelay = value;
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

            this.avtWrapper.addEventListener("dragEnter",  e => this.dragEnter(e), false);
            this.avtWrapper.addEventListener("dragLeave", e => this.dragLeave(e), false);
            this.avtWrapper.addEventListener("dragOver", e => this.dragOver(e), false);
            this.avtWrapper.addEventListener("drop", e => this.fileSelect(e), false);

            this.avtInput.addEventListener("change", e => this.fileSelect(e, "input"));

            this.sub.nameForm.addEventListener("submit", e => {
                this.sub.nameForm.getElementsByTagName("button")[0].disabled = true;
                this.changeName(this.sub.name.value);
            }, false)

            this.sub.passForm.addEventListener("submit", e => {
                this.sub.passForm.getElementsByTagName("button")[0].disabled = true;
                this.changePassword(this.sub.pass.value, this.sub.newPass.value, this.sub.reTypePass.value);
            }, false)

            this.logoutBtn.addEventListener("click", e => this.logout(e), false);

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
                    token: API_TOKEN
                }
            }, () => location.reload());
        },

        toggle() {
            let c = this.container.classList.contains("show");

            if (c)
                this.__hideAllPanel();

            this.container.classList.remove("subPanel");
            this.toggler.classList.toggle("active");
            this.container.classList.toggle("show");
        },

        reset() {
            this.avtWrapper.classList.remove("drop");
            this.avtWrapper.classList.remove("load");
            this.sub.nameForm.getElementsByTagName("button")[0].disabled = false;
            this.sub.passForm.getElementsByTagName("button")[0].disabled = false;
            this.sub.name.value = null;
            this.sub.pass.value = null;
            this.sub.newPass.value = null;
            this.sub.reTypePass.value = null;
        },

        reload(data, m = 0) {
            core.fetchRank(true);
            if (m === 0)
                this.uavt.src = this.avt.src = data.src;
            else
                this.uname.innerText = this.name.innerText = data;
        },
        
        async changeName(name) {
            await myajax({
                url: "/api/edit",
                method: "POST",
                form: {
                    n: name,
                    token: API_TOKEN
                }
            }, data => {
                this.reset();
                this.reload(data.name, 1);
                clog("okay", "Đã đổi tên thành", {
                    color: flatc("pink"),
                    text: name
                })
            }, () => this.reset());
        },

        async changePassword(pass, newPass, reTypePass) {
            await myajax({
                url: "/api/edit",
                method: "POST",
                form: {
                    p: pass,
                    np: newPass,
                    rnp: reTypePass,
                    token: API_TOKEN
                }
            }, () => {
                clog("okay", "Thay đổi mật khẩu thành công!");
                this.reset();
            }, () => this.reset());
        },

        fileSelect(e, type = "drop") {
            if (type === "drop") {
                e.stopPropagation();
                e.preventDefault();
                this.avtWrapper.classList.remove("drag");
            }

            var file = (type === "drop") ? e.dataTransfer.files[0] : e.target.files[0];

            this.avtWrapper.classList.add("load");
            setTimeout(() => this.avtUpload(file), 1000);
        },

        async avtUpload(file) {
            await myajax({
                url: "/api/avt/change",
                method: "POST",
                form: {
                    token: API_TOKEN,
                    file: file
                }
            }, data => {
                this.reset();
                this.reload(data);
                clog("okay", "Avatar changed.");
            }, () => this.reset());
        },

        dragEnter(e) {
            e.stopPropagation();
            e.preventDefault();
            this.avtWrapper.classList.add("drag");
        },

        dragLeave(e) {
            e.stopPropagation();
            e.preventDefault();
            this.avtWrapper.classList.remove("drag");
        },

        dragOver(e) {
            e.stopPropagation();
            e.preventDefault();
            e.dataTransfer.dropEffect = "copy";
            this.avtWrapper.classList.add("drag");
        }

    },

    settings: {
        main: $("#container"),
        navcont: $("#usett_left_panel"),
        cPanel: null,
        cPanelIframe: null,
        pPanel: null,
        lPanel: null,
        adminConfig: $("#usett_adminConfig"),

        async init() {
            this.adminConfig.style.display = "block";
            this.cPanel = new core.userSettings.panel($("#settings_controlPanel"));
            this.pPanel = new core.userSettings.panel($("#settings_problem"));
            this.lPanel = new core.userSettings.panel($("#settings_syslogs"));
            this.cPanelIframe = this.cPanel.main.getElementsByTagName("iframe")[0];
            this.cPanelIframe.src = "config.php";

            this.cPanel.toggler = $("#settings_cPanelToggler");
            this.pPanel.toggler = $("#settings_problemToggler");
            this.lPanel.toggler = $("#settings_syslogsToggler");

            await this.problems.init();
            await this.syslogs.init(this.lPanel);

            this.cPanel.ref.onClick(() => {
                this.cPanelIframe.contentWindow.location.reload();
                clog("okay", "Reloaded cPanel IFrame.");
            })

            this.pPanel.ref.onClick(() => {
                this.problems.getList();
                this.problems.resetForm();
                this.problems.showList();
                clog("okay", "Reloaded Problems Panel.");
            })

            this.lPanel.ref.onClick(() => this.syslogs.refresh());
            this.lPanel.onToggle = s => ((s === "show") ? this.syslogs.refresh() : null);

            clog("okay", "Initialised:", {
                color: flatc("red"),
                text: "core.settings"
            });
        },

        syslogs: {
            panel: null,
            container: null,
            prevHash: "",

            async init(panel) {
                this.panel = panel;
                this.container = panel.main;
                panel.cus.onClick(() => this.refresh(true))

                await this.refresh();
            },

            async refresh(clearLogs = false) {
                const data = await myajax({
                    url: "/api/logs",
                    method: "POST",
                    form: {
                        token: API_TOKEN,
                        clear: clearLogs
                    }
                });

                if (data.hash === this.prevHash)
                    return;

                this.prevHash = data.hash;
                this.container.innerHTML = "";
                var html = [];

                for (let i of data.logs)
                    html.push(`
                        <div class="log ${i.level.toLowerCase()}" onclick="this.classList.toggle('enlarge')">
                            <span class="level">${i.level}</span>
                            <span class="detail">
                                <div class="text">${i.text}</div>
                                <div class="info">
                                    <t class="client">${i.client.username}@${i.client.ip}</t>
                                    <t class="timestamp">${i.time}</t>
                                    <t class="module">${i.module}</t>
                                </div>
                            </span>
                        </div>
                    `);
                
                this.container.innerHTML = html.join("\n");
                this.container.scrollTop = this.container.scrollHeight - this.container.clientHeight;
                clog("okay", "Refreshed SysLogs.");
            }
        },

        problems: {
            title: $("#problemEdit_title"),
            headerBtn: {
                back: $("#problemEdit_btn_back"),
                add: $("#problemEdit_btn_add"),
                check: $("#problemEdit_btn_check"),
            },
            form: {
                form: $("#problemEdit_form"),
                id: $("#problemEdit_id"),
                name: $("#problemEdit_name"),
                point: $("#problemEdit_point"),
                time: $("#problemEdit_time"),
                inptype: $("#problemEdit_inptype"),
                outtype: $("#problemEdit_outtype"),
                accept: $("#problemEdit_accept"),
                image: $("#problemEdit_image"),
                desc: $("#problemEdit_desc"),
                attachment: $("#problemEdit_attachment"),
                testList: $("#problemEdit_test_list"),
                testadd: $("#problemEdit_test_add"),
                submit() {
                    $("#problemEdit_submit").click();
                }
            },
            list: $("#problemEdit_list"),
            action: null,

            hide(elem) {
                elem.style.display = "none";
            },

            show(elem) {
                elem.style.display = "inline-block";
            },

            async init() {
                this.hide(this.headerBtn.back);
                this.hide(this.headerBtn.check);
                this.headerBtn.check.addEventListener("click", e => this.form.submit());
                this.headerBtn.back.addEventListener("click", e => this.showList());
                this.headerBtn.add.addEventListener("click", e => this.newProblem());
                this.form.form.addEventListener("submit", e => this.postSubmit());

                this.form.testadd.addEventListener("click", e => {
                    html = [
                        `<div class="cell">`,
                            `<textarea placeholder="Input" required></textarea>`,
                            `<textarea placeholder="Output" required></textarea>`,
                            `<span class="delete" onClick="core.settings.problems.rmTest(this)"></span>`,
                        `</div>`
                    ].join("\n");
                    this.form.testList.insertAdjacentHTML("beforeend", html);
                });

                await this.getList();

                clog("okay", "Initialised:", {
                    color: flatc("red"),
                    text: "core.settings.problems"
                });
            },

            rmTest(elem) {
                this.form.testList.removeChild(elem.parentNode);
            },

            hideList() {
                this.list.classList.add("hide");
                this.hide(this.headerBtn.add);
                this.show(this.headerBtn.back);
                this.show(this.headerBtn.check);
            },

            showList() {
                this.list.classList.remove("hide");
                this.show(this.headerBtn.add);
                this.hide(this.headerBtn.back);
                this.hide(this.headerBtn.check);
                this.title.innerText = "Danh sách";
            },

            async getList() {
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
                                `<span class="delete" onClick="core.settings.problems.remProblem('${item.id}')"></span>`,
                                `<span class="edit" onClick="core.settings.problems.editProblem('${item.id}')"></span>`,
                            `</div>`,
                        `</li>`,
                    ].join("\n");
                    this.list.innerHTML += html;
                })
            },

            resetForm() {
                this.form.id.value = "";
                this.form.id.disabled = false;
                this.form.name.value = "";
                this.form.point.value = null;
                this.form.time.value = 1;
                this.form.inptype.value = "Bàn Phím";
                this.form.outtype.value = "Màn hình";
                this.form.accept.value = Object.keys(core.languages).join("|");
                this.form.image.value = null;
                this.form.desc.value = "";
                this.form.testList.innerHTML = "";
            },

            newProblem() {
                this.resetForm();
                this.form.id.disabled = false;
                this.title.innerText = "Thêm đề";
                this.action = "add";
                this.hideList();
                setTimeout(e => {
                    this.form.id.focus();
                }, 300);
            },

            async editProblem(id) {
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

                this.resetForm();
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
                            `<span class="delete" onClick="core.settings.problems.rmTest(this)"></span>`,
                        `</div>`
                    ].join("\n");
                })
                this.form.testList.innerHTML = html;
                
                this.hideList();
                setTimeout(e => {
                    this.form.name.focus();
                }, 300);
            },

            async remProblem(id) {
                clog("warn", "Deleting Problem", {
                    color: flatc("yellow"),
                    text: id + "."
                }, "Waiting for confirmation");

                let confirm = await core.dialog.show({
                    panelTitle: "Xác nhận",
                    title: `Xóa ${id}`,
                    description: `Bạn có chắc muốn xóa <i>${id}</i> không?<br>Hành động này <b>không thể hoàn tác</b> một khi đã thực hiện!`,
                    level: "warning",
                    buttonList: {
                        yes: { text: "XÓA!!!", color: "pink" },
                        no: { text:"Không", color: "blue" }
                    }
                })

                if (confirm !== "yes") {
                    clog("info", "Cancelled deletion of", {
                        color: flatc("yellow"),
                        text: id + "."
                    });
                    return;
                }

                core.sound.confirm(1);

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

                this.getList();
                this.showList();
                core.problems.getList();
            },

            async postSubmit() {
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
                var testList = this.form.testList.getElementsByTagName("div");

                for (var i = 0; i < testList.length; i++) {
                    var e = testList[i].getElementsByTagName("textarea");
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

                this.getList();
                this.showList();
                core.problems.getList();
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
        panel: new regPanel($("#wrapperPanel")),

        init() {
            this.panel.ref.hide();
            this.panel.clo.onClick(() => this.hide());

            clog("okay", "Initialised:", {
                color: flatc("red"),
                text: "core.wrapper"
            });
        },

        show(title = "Title") {
            this.panel.title = title;
            this.wrapper.classList.add("show");
            core.sound.select();
        },

        hide() {
            this.wrapper.classList.remove("show");
        }
    },

    dialog: {
        wrapper: $("#dialogWrapper"),
        panel: new regPanel($("#dialogPanel")),
        initialized: false,

        init() {
            this.panel.clo.onClick(() => this.hide());

            this.initialized = true;
            clog("okay", "Initialised:", {
                color: flatc("red"),
                text: "core.dialog"
            });
        },

        show({
            panelTitle = "Title",
            title = "Title",
            description = "Description",
            level = "info",
            additionalNode = null,
            buttonList = {}
        } = {}) {
            return new Promise((resolve) => {
                this.panel.title = panelTitle;
                this.panel.main.dataset.level = level;
                
                let header = `
                    <t class="title">${title}</t>
                    <t class="description">${description}</t>
                `
                this.panel.main.innerHTML = header;
                this.panel.clo.onClick(() => {
                    resolve("close");
                    this.hide();
                });

                if (additionalNode) {
                    additionalNode.classList.add("additional");
                    this.panel.main.appendChild(additionalNode);
                }

                let buttonKeyList = Object.keys(buttonList);
                if (buttonKeyList.length) {
                    let btnGroup = document.createElement("span");
                    btnGroup.classList.add("buttonGroup");
    
                    for (let key of buttonKeyList) {
                        let item = buttonList[key];
                        let button = document.createElement("button");

                        button.classList.add("sq-btn", item.color || "blue");
                        button.innerText = item.text || "Text";
                        button.onclick = item.onClick || null;
                        button.returnValue = key;
                        button.dataset.soundhover = "";
                        button.dataset.soundselect = "";
                        core.sound.applySound(button);

                        if (!(typeof item.resolve === "boolean") || item.resolve !== false)
                            button.addEventListener("mouseup", e => {
                                resolve(e.target.returnValue);
                                this.hide();
                            });

                        btnGroup.appendChild(button);
                    }
    
                    this.panel.main.appendChild(btnGroup);
                }

                this.wrapper.classList.add("show");
                core.sound.select();
            })
        },

        hide() {
            this.wrapper.classList.remove("show");
        }
    },

    sound: {
        initialized: false,
        soundsLoaded: false,

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
            this.soundsLoaded = true;

            set(95, "Scanning");
            this.scan();

            set(100, "Done");
            this.initialized = true;
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
                key: "confirm2",
                name: "generic-confirm-2.mp3"
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
            if (sound.readyState < 3 || !this.initialized)
                return false;

            if (!sound.paused)
                sound.pause();

            sound.currentTime = 0;
            sound.play()
                .catch(e => clog("errr", "Error occurred while trying to play sounds."));
        },

        select() {
            if (this.enable.master && this.enable.btnClick)
                this.__soundToggle(this.sounds.select);
        },

        confirm(variation = 0) {
            let sound = [
                this.sounds.confirm,
                this.sounds.confirm2
            ][variation]

            if (this.enable.master && this.enable.others)
                this.__soundToggle(sound);
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

                this.applySound(item);
            }
        },
        
        applySound(item) {
            if (!item.nodeType || item.nodeType <= 0 || !this.soundsLoaded)
                return false;

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