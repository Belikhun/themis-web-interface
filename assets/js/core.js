//? |-----------------------------------------------------------------------------------------------|
//? |  /assets/js/core.js                                                                           |
//? |                                                                                               |
//? |  Copyright (c) 2018-2020 Belikhun. All right reserved                                         |
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

const core = {
    logPanel: new regPanel($("#logp")),
    rankPanel: new regPanel($("#rankp")),
    container: $("#container"),
    previousLogHash: "",
    previousRankHash: "",
    updateDelay: 2000,
    initialized: false,
    enableAutoUpdate: true,
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

    taskStatus: {
        correct: "CHÍNH XÁC",
        passed: "Chấm thành công",
        accepted: "Dịch thành công",
        failed: "Dịch thất bại",
        scored: "Đã chấm",
        skipped: "Chưa chấm"
    },

    async init(set) {
        clog("info", "Initializing...");
        var initTime = new stopClock();

        set(0, "Initializing: popup");
        popup.init();

        set(5, "Applying onRatelimited");
        __connection__.onRatelimited = async o => {
            const clock = document.createElement("t");
            clock.classList.add("rateLimitedClock");

            o.onCount(left => {
                clock.innerHTML = `${left}<span class="inner">giây còn lại</span>`;

                if (left <= 0)
                    popup.hide();
            })

            popup.show({
                windowTitle: "Rate Limited",
                title: "Oops",
                message: "Rate Limited",
                description: `Bạn đã bị cấm yêu cầu tới máy chủ trong vòng <b>${parseInt(o.data.data.reset)} giây</b>!<br>Vui lòng chờ cho tới khi bạn hết bị cấm!`,
                level: "warning",
                additionalNode: clock,
                buttonList: {
                    close: { text: "Đã rõ!", color: "dark" }
                }
            })
        }

        set(6, "Applying onDisconnected");
        __connection__.onDisconnected = async o => {
            const retry = document.createElement("t");
            retry.classList.add("disconnectedRetry");

            o.onCount(tryNth => {
                if (tryNth === "connected")
                    popup.hide();

                retry.innerHTML = `Lần thử<span class="inner">${tryNth}</span>`;
            })

            popup.show({
                windowTitle: "Disconnected",
                title: "Oops",
                description: `Bạn đã bị mất kết nối tới máy chủ!<br><b>Themis Web Interface</b> đang thử kết nối lại!`,
                level: "error",
                additionalNode: retry,
                buttonList: {
                    close: { text: "Đã rõ!", color: "dark" }
                }
            })
        }

        set(10, "Getting Server Config");
        await this.getServerConfigAsync();

        set(15, "Initializing: core.wrapper");
        this.wrapper.init();

        set(20, "Fetching Rank...");
        await this.fetchRank();
        this.rankPanel.ref.onClick(() => this.fetchRank(true));
        __connection__.onStateChange((s) => { s === "online" ? this.__fetchRank() : null });
        this.__fetchRank();

        set(25, "Initializing: core.timer");
        await this.timer.init();

        set(30, "Initializing: core.userSettings");
        this.userSettings.init(LOGGED_IN);

        set(35, "Initializing: sounds");
        await sounds.init((p, t) => {
            set(35 + p*0.5, `Initializing: sounds (${t})`);
        });

        set(80, "Initializing: core.problems");
        await this.problems.init();
        
        if (LOGGED_IN) {
            this.problems.panel.clo.hide();

            set(85, "Initializing: core.submit");
            this.submit.init();

            set(90, "Fetching Logs...");
            await this.fetchLog();
            this.logPanel.ref.onClick(() => this.__fetchLog(true, false));
            this.logPanel.cus.onClick(() => this.__fetchLog(false, true));
            this.submit.onUploadSuccess = () => this.__fetchLog();
            __connection__.onStateChange((s) => { s === "online" ? this.__fetchLog() : null });
            this.__fetchLog();

            if (IS_ADMIN) {
                clog("info", "Logged in as Admin.");
                set(95, "Initializing: core.settings");
                await this.settings.init();
            }
        } else
            clog("warn", "You are not logged in. Some feature will be disabled.");

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

    async getServerConfigAsync() {
        const response = await myajax({
            url: "/api/server",
            method: "GET",
        }).catch(e => {
            clog("WARN", "Error while getting server status:", {
                text: e.data.description,
                color: flatc("red"),
            });
        });

        window.SERVER = response.data;
    },

    async checkUpdateAsync(showMsgs = false) {
        if (!SERVER)
            return false;

        // Parse local version data
        var tl = SERVER.version.split(".");
        let data = {}

        const localVer = {
            v: parseInt(tl[0])*100 + parseInt(tl[1])*10 + parseInt(tl[2]),
            s: SERVER.versionTag
        }

        var tls = `${tl.join(".")}-${localVer.s}`;
        clog("info", "Local version:", { text: tls, color: flatc("blue") })
        $("#about_localVersion").innerText = tls;

        try {
            let response = await myajax({
                url: "https://api.github.com/repos/belivipro9x99/themis-web-interface/releases/latest",
                method: "GET",
                changeState: false,
                reRequest: false
            });

            data = response;
        } catch(error) {
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
            sbar.additem(`Có phiên bản mới: ${tgs}`, "hub", {align: "right"});

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

            popup.show({
                level: "info",
                windowTitle: "Update Checker",
                title: "Cập Nhật Hệ Thống",
                message: `🌿 ${data.target_commitish}`,
                description: `Hiện đã có phiên bản mới: <b>${tgs}</b><br>Vui lòng cập nhật lên phiên bản mới nhất để đảm bảo độ ổn định của hệ thống`,
                buttonList: {
                    contact: { text: `${data.tag_name} : ${data.target_commitish}`, color: "dark", resolve: false, onClick: () => window.open(data.html_url, "_blank") },
                    continue: { text: "Bỏ qua", color: "pink" }
                }
            })
        }
    },

    async __fetchLog(bypass = false, clearJudging = false) {
        clearTimeout(this.__logTimeout);
        var timer = new stopClock();
        
        try {
            if (this.initialized && this.enableAutoUpdate)
                await this.fetchLog(bypass, clearJudging);
        } catch(e) {
            //? IGNORE ERROR
            clog("ERRR", e);
        }
        
        this.__logTimeout = setTimeout(() => this.__fetchLog(), this.updateDelay - timer.stop*1000);
    },

    async __fetchRank() {
        clearTimeout(this.__rankTimeout);
        var timer = new stopClock();

        try {
            if (this.initialized && this.enableAutoUpdate)
                await this.fetchRank();
        } catch(e) {
            //? IGNORE ERROR
            clog("ERRR", e);
        }
        
        this.__rankTimeout = setTimeout(() => this.__fetchRank(), this.updateDelay - timer.stop*1000);
    },

    async fetchLog(bypass = false, clearJudging = false) {
        let response = await myajax({
            url: "/api/contest/logs",
            method: clearJudging ? "DELETE" : "GET",
        });

        let data = response.data;
        let hash = response.hash;
        if (hash === this.previousLogHash && !bypass)
            return false;

        clog("debg", "Updating Log", `[${hash}]`);
        let updateLogTimer = new stopClock();

        let list = this.logPanel.main;

        if (data.judging.length === 0 && data.logs.length === 0 && data.queues.length === 0) {
            this.logPanel.main.innerHTML = "";
            this.previousLogHash = hash;
            clog("debg", "Log Is Empty. Took", {
                color: flatc("blue"),
                text: updateLogTimer.stop + "s"
            });

            return false;
        }

        let out = "";
        
        for (let item of data.judging)
            out += `
                <div class="logItem judging">
                    <div class="h">
                        <div class="l">
                            <t class="t">${item.lastmodify}</t>
                            <t class="n">${item.problemName || item.problem}</t>
                        </div>
                        <div class="r">
                            <t class="s">Đang chấm</t>
                            <t class="l">${this.languages[item.extension] || item.extension}</t>
                        </div>
                    </div>
                    <a class="d"></a>
                </div>
            `

        for (let item of data.queues)
            out += `
                <div class="logItem queue">
                    <div class="h">
                        <div class="l">
                            <t class="t">${item.lastmodify}</t>
                            <t class="n">${item.problemName || item.problem}</t>
                        </div>
                        <div class="r">
                            <t class="s">Đang chờ</t>
                            <t class="l">${this.languages[item.extension] || item.extension}</t>
                        </div>
                    </div>
                    <a class="d"></a>
                </div>
            `

        for (let item of data.logs)
            out += `
                <div class="logItem ${item.status}">
                    <div class="h">
                        <div class="l">
                            <t class="t">${item.lastmodify}</t>
                            <t class="n">${item.problemName || item.problem}</t>
                        </div>
                        <div class="r">
                            <t class="s">${item.point ? ((item.problemPoint) ? `${item.point}/${item.problemPoint} điểm` : `${item.point} điểm`) : core.taskStatus[item.status]}</t>
                            <t class="l">${this.languages[item.extension] || item.extension}</t>
                        </div>
                    </div>
                    <a class="d${item.logFile ? ` link" onClick="core.viewLog('${item.logFile}')"` : `"`}></a>
                </div>
            `

        list.innerHTML = out;
        this.previousLogHash = hash;

        clog("debg", "Log Updated. Took", {
            color: flatc("blue"),
            text: updateLogTimer.stop + "s"
        });
    },

    async fetchRank(bypass = false) {
        let response = await myajax({
            url: "/api/contest/rank",
            method: "GET",
        });

        let data = response.data;
        let hash = response.hash;
        if (hash === this.previousRankHash && !bypass)
            return false;

        clog("debg", "Updating Rank", `[${hash}]`);
        let updateRankTimer = new stopClock();

        if (data.list.length === 0 && data.rank.length === 0) {
            this.rankPanel.main.innerHTML = "";
            this.previousRankHash = hash;
            clog("debg", "Rank Is Empty. Took", {
                color: flatc("blue"),
                text: updateRankTimer.stop + "s"
            });

            return false;
        }

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
            out += `<th>${data.nameList[i] || i}</th>`;

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
                            <img onload="this.parentNode.dataset.loaded = 1" src="/api/avatar?u=${i.username}"/>
                            <div class="simple-spinner"></div>
                        </div>
                    </td>
                    <td>
                        <t class="username">${i.username}</t>
                        <t class="name">${escapeHTML(i.name || "u:" + i.username)}</t>
                    </td>
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
        this.previousRankHash = hash;

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

        let response = await myajax({
            url: "/api/contest/viewlog",
            method: "GET",
            query: {
                "f": file
            }
        });

        let data = response.data;
        let logLine = [];
        if (data.header.error.length !== 0)
            for (let line of data.header.error)
                logLine.push(`<li>${line}</li>`);
        else
            for (let line of data.header.description)
                logLine.push(`<li>${line}</li>`);

        let testList = [];
        for (let item of data.test)
            testList.push(`
                <div class="item ${item.status}">
                    <div class="line">
                        <span class="left">
                            <t class="testid">${item.test}</t>
                            <t class="status">${item.detail.length === 0 ? "Không rõ" : item.detail.join("<br>")}</t>
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
            <div class="viewLog-container">
                <div class="header ${data.header.status}">
                    <span class="top">
                        <div class="lazyload problemIcon">
                            <img onload="this.parentNode.dataset.loaded = 1" src="/api/contest/problems/image?id=${data.header.problem}"/>
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
                                <t class="row submitted">${formatTime(time() - data.header.file.lastModify)} trước</t>
                                <t class="row status">${core.taskStatus[data.header.status]}</t>
                                <t class="row result">
                                    Đúng <b class="green">${data.header.testPassed}/${data.header.testPassed + data.header.testFailed}</b> test, <b class="red">${data.header.testFailed}</b> test sai
                                </t>
                            </span>
                            <span class="right">
                                <span class="submitter">
                                    <div class="lazyload avatar">
                                        <img onload="this.parentNode.dataset.loaded = 1" src="/api/avatar?u=${data.header.user}"/>
                                        <div class="simple-spinner"></div>
                                    </div>
                                    <span class="info">
                                        <t class="tag">Bài làm của</t>
                                        <t class="name">${data.header.name || "u:" + data.header.user}</t>
                                    </span>
                                </span>

                                <a href="/api/contest/rawlog?f=${data.header.file.logFilename}" class="sq-btn blue" rel="noopener" target="_blank">📄 Raw Log</a>
                            </span>
                        </div>

                        <div class="line log">
                            <ul class="textView">${logLine.join("\n")}</ul>
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
        bar: $("#submitprogressBar"),
        percent: $("#submitInfoProgress"),
        size: $("#submitInfoSize"),
        panel: new regPanel($("#uploadp")),
        uploadCoolDown: 1000,
        uploading: false,
        onUploadSuccess() {},

        init() {
            this.dropzone.addEventListener("dragenter", e => {
                e.stopPropagation();
                e.preventDefault();
                e.target.classList.add("drag");
            }, false);

            this.dropzone.addEventListener("dragleave", e => {
                e.stopPropagation();
                e.preventDefault();
                e.target.classList.remove("drag");
            }, false);

            this.dropzone.addEventListener("dragover", e => {
                e.stopPropagation();
                e.preventDefault();
                e.dataTransfer.dropEffect = "copy";
                e.target.classList.add("drag");
            }, false);


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

            sounds.confirm();

            this.state.innerText = "Chuẩn bị tải lên " + files.length + " tệp...";
            this.size.innerText = "00/00";
            this.percent.innerText = "0%";
            this.bar.style.width = "0%";
            this.bar.dataset.color = "aqua";
            setTimeout(() => this.upload(files), 1000);
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
                    url: "/api/contest/upload",
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
                }, (response) => {
                    if ([103, 104].includes(response.code)) {
                        clog("errr", "Upload Stopped:", {
                            color: flatc("red"),
                            text: response.description
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
                    sounds.notification();
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
                    sounds.warning();

                    switch(e.data.code) {
                        case 44:
                            this.name.innerText = e.data.data.file;
                            break;
                    }
                })
            }, this.uploadCoolDown / 2);
        },
    },

    problems: {
        panel: new regPanel($("#problemp")),
        list: $("#problemsList"),
        name: $("#problem_name"),
        point: $("#problem_point"),
        enlargeBtn: $("#problemViewerEnlarge"),
        closeBtn: $("#problemViewerClose"),
        type: {
            filename: $("#problemInfoFilename"),
            lang: $("#problemInfoLanguage"),
            time: $("#problemInfoRuntime"),
            mem: $("#problemInfoMemory"),
            input: $("#problemInfoInput"),
            output: $("#problemInfoOutput")
        },
        image: $("#problem_image"),
        description: $("#problemDescription"),
        test: $("#problemTests"),
        attachment: {
            container: $("#problemAttachment"),
            link: $("#problemAttachmentLink"),
            preview: $("#problemAttachmentPreview"),
            previewWrapper: $("#problemAttachmentPreviewWrapper")
        },
        loaded: false,
        data: null,
        viewInDialog: false,

        async init(loggedIn = false) {
            this.panel.bak.hide();
            this.panel.bak.onClick(() => this.closeViewer());
            this.closeBtn.addEventListener("mouseup", () => this.closeViewer());

            if (loggedIn)
                this.panel.clo.hide();

            this.enlargeBtn.addEventListener("mouseup", () => this.enlargeProblem(this.data));
            this.panel.ref.onClick(() => this.getList());
            this.panel.clo.onClick(() => this.panel.elem.classList.add("hide"));

            await this.getList();

            clog("okay", "Initialised:", {
                color: flatc("red"),
                text: "core.problems"
            });
        },

        async getList() {
            let data = {}

            try {
                let response = await myajax({
                    url: "/api/contest/problems/list",
                    method: "GET"
                });

                data = response.data;
            } catch(e) {
                if (e.data.code === 103) {
                    clog("WARN", "Kì thi chưa bắt đầu");
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
                    <span class="item" onClick="core.problems.viewProblem('${item.id}');">
                        <div class="lazyload icon">
                            <img onload="this.parentNode.dataset.loaded = 1" src="${item.image}"/>
                            <div class="simple-spinner"></div>
                        </div>
                        <ul class="title">
                            <li class="name">${item.name}</li>
                            <li class="point">${item.point} điểm</li>
                        </ul>
                    </span>
                `
            })
            this.list.innerHTML = html;
        },

        async viewProblem(id) {
            clog("info", "Opening problem", {
                color: flatc("yellow"),
                text: id
            });

            this.panel.title = "Đang tải...";
            this.attachment.previewWrapper.removeAttribute("data-loaded");
            this.attachment.previewWrapper.style.height = "0";

            let response = await myajax({
                url: "/api/contest/problems/get",
                method: "GET",
                query: { id: id }
            });

            let data = response.data;
            this.data = data;
            this.panel.title = "Đề bài - " + data.name;

            if (this.viewInDialog) {
                this.enlargeProblem(this.data);
                return;
            }

            this.list.classList.add("hide");
            this.panel.bak.hide(false);

            this.name.innerText = data.name;
            this.point.innerText = data.point + " điểm";
            this.type.filename.innerText = data.id;
            this.type.lang.innerText = data.accept.join(", ");
            this.type.time.innerText = data.time + " giây";
            this.type.mem.innerText = data.memory ? convertSize(data.memory * 1024) : "Không Rõ";
            this.type.input.innerText = data.type.inp;
            this.type.output.innerText = data.type.out;

            if (data.image) {
                this.image.style.display = "block";
                delete this.image.dataset.loaded;
                this.image.innerHTML = `
                    <img onload="this.parentNode.dataset.loaded = 1" src="${data.image}"/>
                    <div class="simple-spinner"></div>`
            } else
                this.image.style.display = "none";

            if (data.attachment.url) {
                this.attachment.container.style.display = "block";
                this.attachment.link.href = data.attachment.url;
                this.attachment.link.innerText = `${data.attachment.file} (${convertSize(data.attachment.size)})`;

                if (data.attachment.embed) {
                    this.attachment.previewWrapper.removeChild(this.attachment.preview);

                    setTimeout(() => {
                        let clone = this.attachment.preview.cloneNode();
                        clone.style.display = "block";
    
                        clone.addEventListener("load", e => {
                            this.attachment.previewWrapper.dataset.loaded = 1;
                            this.attachment.previewWrapper.style.height = this.attachment.previewWrapper.clientWidth * 1.314 + "px";
                        })
    
                        clone.src = `${data.attachment.url}&embed=true#toolbar=0&navpanes=0&scrollbar=0&statusbar=0&messages=0&scrollbar=0&page=1&view=FitH`;
                        
                        this.attachment.previewWrapper.insertBefore(clone, this.attachment.previewWrapper.childNodes[0]);
                        this.attachment.preview = clone;
                    }, 500);
                } else {
                    this.attachment.preview.style.display = "none";
                }
            } else
                this.attachment.container.style.display = "none";

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

            this.test.innerHTML = `
                <tr>
                    <th>${data.type.inp}</th>
                    <th>${data.type.out}</th>
                </tr>
            ` + testhtml;
        },

        closeViewer() {
            this.list.classList.remove("hide");
            this.panel.title = "Đề bài";
            this.panel.bak.hide();
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
                        <span class="top">
                            <div class="group">
                                <div class="col">
                                    <t class="name">${data.name}</t>
                                    <t class="point">${data.point} điểm</t>
                                </div>

                                <div class="col simpleTableWrapper">
                                    <table class="simpleTable type">
                                        <tbody>
                                            <tr class="filename">
                                                <td>Tên tệp</td>
                                                <td>${data.id}</td>
                                            </tr>
                                            <tr class="lang">
                                                <td>Loại tệp</td>
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
                                </div>
                            </div>

                            ${(data.attachment.url)
                                ?   `<div class="group attachment">
                                        <a class="link" href="${data.attachment.url}">${data.attachment.file} (${convertSize(data.attachment.size)})</a>
                                    </div>`
                                :   ""
                            }
                        </span>

                        <span class="bottom">
                            <div class="description">${data.description}</div>

                            ${(data.image)
                                ?   `<div class="lazyload image">
                                        <img onload="this.parentNode.dataset.loaded = 1" src="${data.image}"/>
                                        <div class="simple-spinner"></div>
                                    </div>`
                                :   ""
                            }

                            ${(data.test.length !== 0)
                                ?   `
                                    <div class="group simpleTableWrapper">
                                        <table class="simpleTable test">
                                            <tbody>
                                                <tr>
                                                    <th>${data.type.inp}</th>
                                                    <th>${data.type.out}</th>
                                                </tr>
                                                ${testHtml}
                                            </tbody>
                                        </table>
                                    </div>`
                                :   ""
                            }
                        </span>
                    </span>
                    <span class="right">
                        ${(data.attachment.url && data.attachment.embed)
                            ?   `<embed class="embedAttachment" src="${data.attachment.url}&embed=true#toolbar=0&navpanes=0&scrollbar=0&statusbar=0&messages=0&scrollbar=0&page=1&view=FitH"/>`
                            :   ""
                        }
                    </span>
                </div>
            `;

            core.wrapper.panel.main.innerHTML = html;
            core.wrapper.show("Đề bài - " + data.name, (data.attachment.url && data.attachment.embed) ? "large" : "small");
        }
    },

    timer: {
        container: $("#navBar"),
        state: $("#contestTimeState"),
        time: $("#contestTime"),
        reload: $("#contestTimeReload"),
        bar: $("#timeProgress"),
        start: $("#timeStart"),
        end: $("#timeEnd"),
        timeData: Array(),
        enabled: true,
        interval: null,
        showMs: false,
        last: 0,

        async init() {
            this.reload.addEventListener("mouseup", () => this.fetchTime(true));

            await this.fetchTime(true);

            clog("okay", "Initialised:", {
                color: flatc("red"),
                text: "core.timer"
            });
        },

        async fetchTime(init = false) {
            let response = await myajax({
                url: "/api/contest/timer",
                method: "GET",
            });

            let data = response.data;

            if (data.during <= 0) {
                this.container.classList.remove("showBottom");
                clearInterval(this.interval);
                clog("info", "Timer Disabled: not in contest mode");

                this.enabled = false;
                return;
            }
            
            this.enabled = true;
            this.timeData = data;
            this.start.innerText = `${(new Date(data.start * 1000)).toLocaleTimeString()} tới ${(new Date((data.start + data.during) * 1000)).toLocaleTimeString()}`;

            if (init) {
                this.container.classList.add("showBottom");
                this.last = 0;
                this.toggleMs(this.showMs);
            }
        },

        startInterval(time = 1000) {
            if (!this.enabled)
                return;

            this.timeUpdate();
            clearInterval(this.interval);
            this.interval = setInterval(() => this.timeUpdate(), time);
        },

        toggleMs(show = true) {
            clearInterval(this.interval);

            if (show) {
                this.startInterval(65);
                this.showMs = true;
                this.bar.classList.add("noTransition");
            } else {
                this.startInterval(1000);
                this.showMs = false;
                this.bar.classList.remove("noTransition");
            }
        },

        reset() {
            clearInterval(this.interval);
            this.time.dataset.color = "red";
            this.time.innerHTML = "<days>--</days>+--:--:--";
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
            let progress = 0;
            let blink = "none";
            let end = "";
            let state = "";

            if (t > duringTime) {
                t -= duringTime;
                if (this.last === 0)
                    this.last = t;

                color = "blue";
                progress = ((t) / this.last) * 100;
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
                progress = (t / duringTime) * 100;
                end = parseTime(duringTime).str;
                state = "Thời gian làm bài";
            } else if (t > -offsetTime) {
                t += offsetTime;
                
                color = "yellow";
                progress = (t / offsetTime) * 100;
                blink = "grow";
                end = parseTime(offsetTime).str;
                state = "Thời gian bù";
            } else {
                t += offsetTime;

                color = "red";
                progress = 100;
                blink = "fade"
                end = "--:--";
                state = "ĐÃ HẾT THỜI GIAN LÀM BÀI";
            }

            let days = Math.floor(t / 86400) + (t < 0 ? 1 : 0);
            let timeParsed = parseTime(t % 86400, { showPlus: true, forceShowHours: true });
            this.time.dataset.color = color;
            this.time.innerHTML = `<days>${days}</days>${timeParsed.str}${this.showMs ? `<ms>${timeParsed.ms}</ms>` : ""}`;
            
            this.bar.dataset.color = color;
            this.bar.dataset.blink = blink;
            this.bar.dataset.blinkFast = progress < 20 ? true : false;
            this.bar.style.width = `${progress}%`;

            this.end.innerText = end;
            this.state.innerText = state;
        }
    },

    userSettings: {
        panel: class {
            constructor(elem) {
                if (!elem.classList.contains("panel"))
                    return false;
        
                this.container = $("#userSettings");

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

        userName: $("#userName"),
        userAvatar: $("#userAvatar"),
        userSettingAvatar: $("#usett_avt"),
        userSettingAvatarWrapper: $("#usett_avtw"),
        userSettingAvatarInput: $("#usett_avtinp"),
        name: $("#usett_name"),
        sub: {
            nameForm: $("#usett_edit_name_form"),
            passForm: $("#usett_edit_pass_form"),
            name: $("#usett_edit_name"),
            pass: $("#usett_edit_pass"),
            newPass: $("#usett_edit_npass"),
            reNewPass: $("#usett_edit_renpass"),
        },
        soundsToggler: {
            soundToggle: $("#usett_btn_sound_toggle"),
            soundOnMouseHover: $("#usett_btn_sound_mouse_hover"),
            soundOnBtnClick: $("#usett_btn_sound_button_click"),
            soundOnPanelToggle: $("#usett_btn_sound_panel_toggle"),
            soundOthers: $("#usett_btn_sound_others"),
            soundOnNotification: $("#usett_btn_sound_notification"),
        },
        logoutBtn: $("#usett_logout"),
        nightModeToggler: $("#usett_nightMode"),
        transitionToggler: $("#usett_transition"),
        millisecondToggler: $("#usett_millisecond"),
        dialogProblemToggler: $("#usett_dialogProblem"),
        autoUpdateToggler: $("#usett_enableAutoUpdate"),
        updateDelaySlider: $("#usett_udelay_slider"),
        updateDelayText: $("#usett_udelay_text"),
        toggler: $("#userSettingsToggler"),
        container: $("#userSettings"),
        panelContainer: $("#usett_panelContainer"),
        panelUnderlay: $("#usett_panelUnderlay"),
        adminConfig: $("#usett_adminConfig"),
        publicFilesPanel: null,
        publicFilesIframe: null,
        aboutPanel: null,
        licensePanel: null,
        licenseIframe: null,

        updateDelayOptions: {
            1: 500,
            2: 1000,
            3: 2000,
            4: 10000,
            5: 60000,
            6: 120000,
            7: 240000,
            8: 300000,
            9: 600000,
            10: 3600000
        },

        __hideAllPanel() {
            var l = this.panelContainer.getElementsByClassName("show");

            for (var i = 0; i < l.length; i++)
                l[i].classList.remove("show");
        },
        
        init(loggedIn = true) {
            this.toggler.addEventListener("mouseup", () => this.toggle(), false);
            this.panelUnderlay.addEventListener("mouseup", () => this.toggle(), false);

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

            // Sounds Toggler Settings

            new this.toggleSwitch(this.soundsToggler.soundToggle, "__s_m", () => {
                sounds.enable.master = true;

                this.soundsToggler.soundOnMouseHover.disabled = false;
                this.soundsToggler.soundOnBtnClick.disabled = false;
                this.soundsToggler.soundOnPanelToggle.disabled = false;
                this.soundsToggler.soundOthers.disabled = false;
                this.soundsToggler.soundOnNotification.disabled = false;
            }, () => {
                sounds.enable.master = false;

                this.soundsToggler.soundOnMouseHover.disabled = true;
                this.soundsToggler.soundOnBtnClick.disabled = true;
                this.soundsToggler.soundOnPanelToggle.disabled = true;
                this.soundsToggler.soundOthers.disabled = true;
                this.soundsToggler.soundOnNotification.disabled = true;
            }, false);

            new this.toggleSwitch(this.soundsToggler.soundOnMouseHover, "__s_mo",
                () => sounds.enable.mouseOver = true,
                () => sounds.enable.mouseOver = false,
                true
            );

            new this.toggleSwitch(this.soundsToggler.soundOnBtnClick, "__s_bc",
                () => sounds.enable.btnClick = true,
                () => sounds.enable.btnClick = false,
                true
            );

            new this.toggleSwitch(this.soundsToggler.soundOnPanelToggle, "__s_pt",
                () => sounds.enable.panelToggle = true,
                () => sounds.enable.panelToggle = false,
                true
            );

            new this.toggleSwitch(this.soundsToggler.soundOthers, "__s_ot",
                () => sounds.enable.others = true,
                () => sounds.enable.others = false,
                true
            );

            new this.toggleSwitch(this.soundsToggler.soundOnNotification, "__s_nf",
                () => sounds.enable.notification = true,
                () => sounds.enable.notification = false,
                true
            );

            // Night mode setting
            let nightMode = new this.toggleSwitch(this.nightModeToggler, "__darkMode", e => {
                document.body.classList.add("dark");

                this.publicFilesIframe.contentWindow.document.body.classList.add("dark");
                this.licenseIframe.contentWindow.document.body.classList.add("dark");

                if (core.settings.cPanelIframe)
                    core.settings.cPanelIframe.contentWindow.document.body.classList.add("dark");

                if (core.settings.aPanelIframe)
                    core.settings.aPanelIframe.contentWindow.document.body.classList.add("dark");
            }, e => {
                document.body.classList.remove("dark");

                this.publicFilesIframe.contentWindow.document.body.classList.remove("dark");
                this.licenseIframe.contentWindow.document.body.classList.remove("dark");

                if (core.settings.cPanelIframe)
                    core.settings.cPanelIframe.contentWindow.document.body.classList.remove("dark");

                if (core.settings.aPanelIframe)
                    core.settings.aPanelIframe.contentWindow.document.body.classList.remove("dark");
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

            // view problem in dialog setting
            let dialogProblem = new this.toggleSwitch(this.dialogProblemToggler, "__diagprob",
                e => core.problems.viewInDialog = true,
                e => core.problems.viewInDialog = false,
                false
            )

            // auto update rank and logs setting
            let autoUpdate = new this.toggleSwitch(this.autoUpdateToggler, "__autoupdate",
                e => {
                    this.updateDelaySlider.disabled = false;
                    core.enableAutoUpdate = true;
                },
                e => {
                    this.updateDelaySlider.disabled = true;
                    core.enableAutoUpdate = false;
                },
                true
            )

            // Update delay setting
            this.updateDelaySlider.addEventListener("input", e => {
                let _o = parseInt(e.target.value);
                let value = this.updateDelayOptions[_o] || 2000;

                this.updateDelayText.innerText = `${value / 1000} giây/yêu cầu`;

                if (value < 2000)
                    e.target.classList.add("pink") || e.target.classList.remove("blue");
                else
                    e.target.classList.remove("pink") || e.target.classList.add("blue");
            })
            
            this.updateDelaySlider.addEventListener("change", e => {
                let _o = parseInt(e.target.value);
                let value = this.updateDelayOptions[_o] || 2000;

                this.updateDelayText.innerText = `${value / 1000} giây/yêu cầu`;

                if (value < 2000)
                    e.target.classList.add("pink") || e.target.classList.remove("blue");
                else
                    e.target.classList.remove("pink") || e.target.classList.add("blue");

                cookie.set("__updateDelay", this.updateDelayOptions[_o] ? _o : 2);
                core.updateDelay = value;

                clog("OKAY", "Set updateDelay to", `${value} ms/request`);
            })

            this.updateDelaySlider.value = parseInt(cookie.get("__updateDelay", 2));
            this.updateDelaySlider.dispatchEvent(new Event("change"));

            // If not logged in, Stop here
            if (!loggedIn) {
                $("#usett_userPanel").style.display = "none";

                clog("okay", "Initialised:", {
                    color: flatc("red"),
                    text: "core.userSettings (notLoggedIn mode)"
                });
                return;
            }

            this.userSettingAvatarWrapper.addEventListener("dragenter",  e => this.dragEnter(e), false);
            this.userSettingAvatarWrapper.addEventListener("dragleave", e => this.dragLeave(e), false);
            this.userSettingAvatarWrapper.addEventListener("dragover", e => this.dragOver(e), false);
            this.userSettingAvatarWrapper.addEventListener("drop", e => this.fileSelect(e), false);

            this.userSettingAvatarInput.addEventListener("change", e => this.fileSelect(e, "input"));

            this.sub.nameForm.addEventListener("submit", e => {
                this.sub.nameForm.getElementsByTagName("button")[0].disabled = true;
                this.changeName(this.sub.name.value);
            }, false)

            this.sub.reNewPass.addEventListener("keyup", e => e.target.parentElement.dataset.color = (this.sub.newPass.value === e.target.value) ? "blue" : "red");
            this.sub.passForm.addEventListener("submit", e => {
                if (this.sub.newPass.value !== this.sub.reNewPass.value) {
                    sounds.warning();
                    this.sub.reNewPass.parentElement.dataset.color = "red";
                    this.sub.reNewPass.focus();
                    return;
                }

                this.sub.passForm.getElementsByTagName("button")[0].disabled = true;
                this.changePassword(this.sub.pass.value, this.sub.newPass.value);
            }, false)

            this.logoutBtn.addEventListener("click", e => this.logout(e), false);

            clog("okay", "Initialised:", {
                color: flatc("red"),
                text: "core.userSettings"
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
            this.userSettingAvatarWrapper.classList.remove("drop");
            this.userSettingAvatarWrapper.classList.remove("load");
            this.sub.nameForm.getElementsByTagName("button")[0].disabled = false;
            this.sub.passForm.getElementsByTagName("button")[0].disabled = false;
            this.sub.name.value = null;
            this.sub.pass.value = null;
            this.sub.newPass.value = null;
            this.sub.reNewPass.value = null;
            this.sub.reNewPass.parentElement.dataset.color = "blue";
        },

        reload(data, reload) {
            switch (reload) {
                case "avatar":
                    core.fetchRank(true);
                    this.userAvatar.src = this.userSettingAvatar.src = `${data.src}&t=${time()}`;
                    break;
            
                case "name":
                    this.userName.innerText = this.name.innerText = data.name;
                    break;

                default:
                    break;
            }
        },
        
        async changeName(name) {
            sounds.confirm(1);

            await myajax({
                url: "/api/edit",
                method: "POST",
                form: {
                    name: name,
                    token: API_TOKEN
                }
            }, response => {
                this.reset();
                this.reload(response.data, "name");

                clog("okay", "Đã đổi tên thành", {
                    color: flatc("pink"),
                    text: response.data.name
                });
            }, () => this.reset());
        },

        async changePassword(pass, newPass) {
            sounds.confirm(2);

            await myajax({
                url: "/api/edit",
                method: "POST",
                form: {
                    password: pass,
                    newPassword: newPass,
                    token: API_TOKEN
                }
            }, () => {
                clog("okay", "Thay đổi mật khẩu thành công!");
                this.reset();
            }, () => {
                sounds.warning();
                this.reset();
            });
        },

        fileSelect(e, type = "drop") {
            if (type === "drop") {
                e.stopPropagation();
                e.preventDefault();
                this.userSettingAvatarWrapper.classList.remove("drag");
            }

            var file = (type === "drop") ? e.dataTransfer.files[0] : e.target.files[0];

            this.userSettingAvatarWrapper.classList.add("load");
            sounds.confirm();
            setTimeout(() => this.avtUpload(file), 1000);
        },

        async avtUpload(file) {
            await myajax({
                url: "/api/avatar",
                method: "POST",
                form: {
                    token: API_TOKEN,
                    file: file
                }
            }, response => {
                this.reset();
                this.reload(response.data, "avatar");
                sounds.notification();

                clog("okay", "Avatar changed.");
            }, () => {
                sounds.warning();
                this.reset();
            })
        },

        dragEnter(e) {
            e.stopPropagation();
            e.preventDefault();
            this.userSettingAvatarWrapper.classList.add("drag");
        },

        dragLeave(e) {
            e.stopPropagation();
            e.preventDefault();
            this.userSettingAvatarWrapper.classList.remove("drag");
        },

        dragOver(e) {
            e.stopPropagation();
            e.preventDefault();
            e.dataTransfer.dropEffect = "copy";
            this.userSettingAvatarWrapper.classList.add("drag");
        }

    },

    settings: {
        main: $("#container"),
        cPanel: null,
        cPanelIframe: null,
        aPanel: null,
        aPanelIframe: null,
        pPanel: null,
        lPanel: null,
        adminConfig: $("#usett_adminConfig"),

        async init() {
            this.adminConfig.style.display = "block";
            this.cPanel = new core.userSettings.panel($("#settings_controlPanel"));
            this.aPanel = new core.userSettings.panel($("#settings_accountEditor"));
            this.pPanel = new core.userSettings.panel($("#settings_problem"));
            this.lPanel = new core.userSettings.panel($("#settings_syslogs"));
            this.cPanelIframe = this.cPanel.main.getElementsByTagName("iframe")[0];
            this.aPanelIframe = this.aPanel.main.getElementsByTagName("iframe")[0];
            this.cPanelIframe.src = "config.php";
            this.aPanelIframe.src = "account.php";

            this.cPanel.toggler = $("#settings_cPanelToggler");
            this.aPanel.toggler = $("#settings_accountEditorToggler");
            this.pPanel.toggler = $("#settings_problemToggler");
            this.lPanel.toggler = $("#settings_syslogsToggler");

            await this.problems.init();
            await this.syslogs.init(this.lPanel);

            this.cPanel.ref.onClick(() => {
                this.cPanelIframe.contentWindow.update();
                clog("okay", "Reloaded controlPanel.");
            })

            this.aPanel.ref.onClick(() => {
                this.aPanelIframe.contentWindow.reloadAccountList();
                clog("okay", "Reloaded accountEditorPanel.");
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
            logsContainer: null,
            nav: {
                left: null,
                btnLeft: null,
                currentPage: null,
                btnRight: null,
                right: null
            },
            prevHash: "",
            showPerPage: 10,
            currentPage: 0,
            maxPage: 0,

            async init(panel) {
                this.panel = panel;
                this.container = panel.main;
                this.logsContainer = fcfn(this.container, "logsContainer");
                this.nav.left = fcfn(this.container, "left");
                this.nav.btnLeft = fcfn(this.container, "buttonLeft");
                this.nav.currentPage = fcfn(this.container, "currentPage");
                this.nav.btnRight = fcfn(this.container, "buttonRight");
                this.nav.right = fcfn(this.container, "right");
                this.panel.cus.onClick(() => this.refresh(true))

                await this.refresh();

                this.nav.btnLeft.addEventListener("click", e => {
                    this.currentPage--;

                    if (this.currentPage < 0)
                        this.currentPage = 0;

                    this.refresh();
                });

                this.nav.btnRight.addEventListener("click", e => {
                    this.currentPage++;

                    if (this.currentPage > this.maxPage)
                        this.currentPage = this.maxPage;

                    this.refresh();
                });
            },

            async refresh(clearLogs = false) {
                let response = await myajax({
                    url: "/api/logs",
                    method: "POST",
                    form: {
                        token: API_TOKEN,
                        clear: clearLogs,
                        show: this.showPerPage,
                        page: this.currentPage
                    }
                });

                let data = response.data;
                let hash = response.hash;
                if (hash === this.prevHash)
                    return;

                this.prevHash = hash;
                this.nav.left.innerText = `Hiển thị ${data.from} - ${data.to}`;
                this.nav.currentPage.innerText = `Trang ${data.pageNth + 1}/${data.maxPage + 1}`;
                this.nav.right.innerText = `Tổng ${data.total}`;
                this.maxPage = data.maxPage;
                var html = [];

                for (let i of data.logs)
                    html.push(`
                        <div class="log ${i.level.toLowerCase()}" onclick="this.classList.toggle('enlarge')">
                            <span class="level">${i.level}<i>#${i.nth}</i></span>
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
                
                this.logsContainer.innerHTML = html.join("\n");
                clog("info", "Refreshed SysLogs.");
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
                mem: $("#problemEdit_mem"),
                inpType: $("#problemEdit_inpType"),
                outType: $("#problemEdit_outType"),
                accept: $("#problemEdit_accept"),
                image: $("#problemEdit_image"),
                deleteImage: $("#problemEdit_deleteImage"),
                desc: $("#problemEdit_desc"),
                attachment: $("#problemEdit_attachment"),
                deleteAttachment: $("#problemEdit_deleteAttachment"),
                testList: $("#problemEdit_test_list"),
                testadd: $("#problemEdit_test_add"),
                submit() { $("#problemEdit_submit").click() }
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
                let response = await myajax({
                    url: "/api/contest/problems/list",
                    method: "GET"
                });

                let data = response.data;
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
                this.form.mem.value = 1024;
                this.form.inpType.value = "Bàn Phím";
                this.form.outType.value = "Màn Hình";
                this.form.accept.value = Object.keys(core.languages).join("|");
                this.form.image.value = null;
                this.form.desc.value = "";
                this.form.testList.innerHTML = "";
            },

            newProblem() {
                this.resetForm();
                this.form.id.disabled = false;
                this.form.deleteImage.disabled = true;
                this.form.deleteAttachment.disabled = true;
                this.title.innerText = "Thêm đề";
                this.action = "add";
                this.hideList();
                setTimeout(e => this.form.id.focus(), 300);
            },

            async editProblem(id) {
                let response = await myajax({
                    url: "/api/contest/problems/get",
                    method: "GET",
                    query: {
                        id: id
                    }
                });

                let data = response.data;
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
                this.form.time.value = data.time || 1;
                this.form.mem.value = data.memory || 1024;
                this.form.inpType.value = data.type.inp || "Bàn Phím";
                this.form.outType.value = data.type.out || "Màn Hình";
                this.form.accept.value = data.accept.join("|");
                this.form.image.value = null;
                this.form.desc.value = data.description;
                this.form.attachment.value = null;

                if (data.image) {
                    this.form.deleteImage.disabled = false;
                    this.form.deleteImage.onclick = async () => {
                        if (await this.deleteFile("image", data.id))
                            this.form.deleteImage.disabled = true;
                    }
                } else
                    this.form.deleteImage.disabled = true;

                if (data.attachment && data.attachment.file) {
                    this.form.deleteAttachment.disabled = false;
                    this.form.deleteAttachment.onclick = async () => {
                        if (await this.deleteFile("attachment", data.id, data.attachment.file))
                            this.form.deleteAttachment.disabled = true;
                    }
                } else
                    this.form.deleteAttachment.disabled = true;

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
                setTimeout(e => this.form.name.focus(), 300);
            },

            async remProblem(id) {
                clog("warn", "Deleting Problem", {
                    color: flatc("yellow"),
                    text: id + "."
                }, "Waiting for confirmation");

                let note = document.createElement("div");
                note.classList.add("note", "warning");
                note.innerHTML = `<span class="inner">Hành động này <b>không thể hoàn tác</b> một khi đã thực hiện!</span>`;

                let confirm = await popup.show({
                    level: "warning",
                    windowTitle: "Problems Editor",
                    title: `Xóa \"${id}\"`,
                    message: `Xác nhận`,
                    description: `Bạn có chắc muốn xóa đề bài <i>${id}</i> không?`,
                    additionalNode: note,
                    buttonList: {
                        delete: { text: "XÓA!!!", color: "red" },
                        cancel: { text: "Hủy Bỏ", color: "blue" }
                    }
                })

                if (confirm !== "delete") {
                    clog("info", "Cancelled deletion of", {
                        color: flatc("yellow"),
                        text: id + "."
                    });
                    return;
                }

                sounds.confirm(1);

                await myajax({
                    url: "/api/contest/problems/remove",
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
                data.memory = this.form.mem.value;
                data.inpType = this.form.inpType.value;
                data.outType = this.form.outType.value;
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
                    url: "/api/contest/problems/" + action,
                    method: "POST",
                    form: {
                        id: data.id,
                        name: data.name,
                        point: data.point,
                        time: data.time,
                        memory: data.memory,
                        inpType: data.inpType,
                        outType: data.outType,
                        acpt: JSON.stringify(data.accept),
                        img: data.image,
                        desc: data.desc,
                        attm: data.attachment,
                        test: JSON.stringify(data.test),
                        token: API_TOKEN
                    }
                });
            },

            async deleteFile(type, id, fileName = null) {
                if (!["image", "attachment"].includes(type))
                    return false;

                typeName = { image: "Ảnh Đính Kèm", attachment: "Tệp Đính Kèm" }[type]

                clog("WARN", "Preparing to delete", typeName, "of", {
                    color: flatc("yellow"),
                    text: `${id}.`
                }, "Waiting for confirmation...");

                let action = await popup.show({
                    windowTitle: "Xác nhận",
                    title: `Xóa ${typeName} của đề "${id}"`,
                    description: `Bạn có chắc muốn xóa ${fileName ? `<br><b>${fileName}</b>` : "không"}?<br>Hành động này không thể hoàn tác một khi đã thực hiện!`,
                    level: "warning",
                    buttonList: {
                        delete: { color: "pink", text: "XÓA!!!" },
                        cancel: { color: "blue", text: "Hủy" }
                    }
                })

                if (action !== "delete") {
                    clog("INFO", "Cancelled deletion", typeName, "of", {
                        color: flatc("yellow"),
                        text: id
                    })

                    return false;
                }

                await myajax({
                    url: `/api/contest/problems/${type}`,
                    method: "DELETE",
                    header: {
                        id: id,
                        token: API_TOKEN
                    }
                })

                clog("OKAY", "Deleted", typeName, "of", {
                    color: flatc("yellow"),
                    text: id
                })

                return true;
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

        show(title = "Title", size = "normal") {
            this.panel.title = title;
            this.panel.elem.dataset.size = size;
            this.wrapper.classList.add("show");
            sounds.select();
        },

        hide() {
            this.wrapper.classList.remove("show");
        }
    },

    /**
     * ========= BEGIN USELESS CODE 😁 =========
     */
    deliveringMeme: false,

    async getRandomMeme() {
        if (this.deliveringMeme)
            return;

        this.deliveringMeme = true;
        let wutMeme = await myajax({
            url: "https://meme-api.herokuapp.com/gimme",
            method: "GET"
        })

        let memeContainer = document.createElement("div");
        memeContainer.classList.add("lazyload", "image");
        memeContainer.style.overflow = "auto";
        memeContainer.innerHTML = `
            <img src="${wutMeme.url}" onload="this.parentElement.dataset.loaded = 1;"/>
            <div class="simple-spinner"></div>
        `;

        let gud = await popup.show({
            windowTitle: "Memes",
            title: "got some mweme fow yya",
            message: `<a href="${wutMeme.postLink}" target="_blank">SAUCE 🔗</a>`,
            description: wutMeme.title,
            additionalNode: memeContainer,
            buttonList: {
                moar: { text: "Plz I Need Moar", color: "rainbow" },
                stahp: { text: "Ewnough iwntewwnet fow todayy", color: "dark" }
            }
        })

        this.deliveringMeme = false;

        if (gud === "moar")
            this.getRandomMeme();
    }
}