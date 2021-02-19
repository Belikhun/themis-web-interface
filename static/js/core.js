//? |-----------------------------------------------------------------------------------------------|
//? |  /static/js/core.js                                                                           |
//? |                                                                                               |
//? |  Copyright (c) 2018-2021 Belikhun. All right reserved                                         |
//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
//? |-----------------------------------------------------------------------------------------------|

class TWIPanel {
	/**
	 * @param {HTMLElement}		container 
	 */
	constructor(container) {
		if (typeof container !== "object" || !container.classList || container.tagName !== "PANEL")
			throw { code: -1, description: "twi.Panel(): not a valid panel element" }

		this.container = container;

		this.titleNode = this.container.querySelector(".header > .title");
		this.buttonsNode = this.container.querySelector(".header > .buttons");
		this.mainContent = this.container.querySelector(".main");
		this.loadingWrapper = this.mainContent.querySelector(".loadingWrapper");
	}
	
	/**
	 * @param {String}		title
	 */
	set title(title) {
		this.titleNode.innerText = title;
	}

	get panel() {
		return this.container;
	}

	get main() {
		return this.mainContent;
	}

	/**
	 * @param {Boolean}		loading
	 */
	set loading(loading) {
		this.loadingWrapper.classList[loading ? "add" : "remove"]("show");
	}

	button(icon = "circle", title) {
		let iconButton = document.createElement("icon");
		iconButton.dataset.icon = icon;
		sounds.applySound(iconButton, ["soundhover", "soundselect"]);

		if (title)
			iconButton.title = title;

		this.buttonsNode.appendChild(iconButton);
		
		return {
			button: iconButton,

			set({ icon, title } = {}) {
				if (icon)
					iconButton.dataset.icon = icon;

				if (title)
					iconButton.title = title;
			},

			show() {
				iconButton.style.display = null;
			},

			hide() {
				iconButton.style.display = "none";
			},

			onClick(f) {
				if (!f || typeof f !== "function")
					throw { code: -1, description: `twi.Panel().button(${icon}).onClick(): not a valid function` }

				return iconButton.addEventListener("click", e => f(e));
			}
		}
	}
}

const twi = {
	container: $("#mainContainer"),
	content: $("#content"),
	initialized: false,

	languages: {
		"pas": "Pascal",
		"cpp": "C++",
		"c": "C",
		"cs": "C Sharp",
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

	/**
	 * Initialize Themis Web Interface
	 * @param {Function}	set			Report Progress to Initializer
	 */
	async init(set = () => {}) {
		let start = time();

		await this.initGroup(this, "twi", ({ p, m, d }) => {
			clog("DEBG", {
				color: oscColor("pink"),
				text: truncateString(m, 34),
				padding: 34,
				separate: true
			}, d);

			set({ p, m, d });
		});
		
		set({ p: 100, m: "twi", d: "Themis Web Interface Core Loaded" });
		this.initialized = true;

		clog("OKAY", {
			color: oscColor("pink"),
			text: "twi",
			padding: 34,
			separate: true
		}, `Themis Web Interface Core Loaded In ${time() - start}s`);
	},

	/**
	 * Initialize A Group Object
	 * @param {Object}		group			The Target Object
	 * @param {String}		name			Group Name
	 * @param {Function}	set				Report Progress to Initializer
	 */
	async initGroup(group, name, set = () => {}) {
		let modulesList = []

		// Search for modules and initialize it
		set({ p: 0, m: name, d: name === "twi" ? `Scanning Local Modules` : `Scanning Modules Of ${name}` });

		for (let key of Object.keys(group)) {
			if (key === "super")
				continue;

			let item = group[key];
			if (item && !item.initialized && typeof item.init === "function") {
				// Set Up Module Constants
				item.__NAME__ = key;
				item.super = group;

				item.log = (level, ...args) => clog(level, {
					color: oscColor("pink"),
					text: truncateString(`${name}.${item.__NAME__}`, 34),
					padding: 34,
					separate: true
				}, ...args);

				// Push To Queues
				modulesList.push(item);
			}
		}

		if (modulesList.length < 0)
			return;

		// Sort modules by priority
		// The lower the value is, the higher the priority
		set({ p: 5, m: name, d: `Sorting Modules By Priority` });
		modulesList = modulesList.sort((a, b) => (a.priority || 0) - (b.priority || 0));
		
		if (modulesList.length > 0) {
			clog("DEBG", {
				color: oscColor("pink"),
				text: truncateString(name, 34),
				padding: 34,
				separate: true
			}, `Modules of`, {
				text: name,
				color: oscColor("pink")
			});
	
			for (let [i, module] of modulesList.entries())
				clog("DEBG", {
					color: oscColor("pink"),
					text: truncateString(name, 34),
					padding: 34,
					separate: true
				}, " + ", pleft(i, 2), pleft(module.__NAME__, 38), pleft(module.priority || 0, 3));
		}

		// Inititlize modules
		for (let i = 0; i < modulesList.length; i++) {
			let moduleStart = time();
			let item = modulesList[i];
			let path = `${name}.${item.__NAME__}`;
			let mP = 5 + (i / modulesList.length) * 95;

			set({ p: mP, m: path, d: `Initializing` });
			try {
				let returnValue = await item.init(({ p, m, d }) => set({
					p: mP + (p * (1 / modulesList.length) * 0.95),
					m: (m) ? `${path}.${m}` : path,
					d
				}), { clog: item.log });

				if (returnValue === false) {
					clog("INFO", {
						color: oscColor("pink"),
						text: truncateString(path, 34),
						padding: 34,
						separate: true
					}, `Module DISABLED! Skipping all Submodules`);

					item.initialized = false;
					continue;
				}

				item.initialized = true;

				// Try to find and initialize submodules
				await this.initGroup(item, path, ({ p, m, d }) => set({ m, d }));
			} catch(error) {
				if (error.code === 12)
					throw error;

				let e = parseException(error);
				throw { code: 12, description: `twi.initGroup(${path}): ${e.description}`, data: error }
			}

			clog("OKAY", {
				color: oscColor("pink"),
				text: truncateString(path, 34),
				padding: 34,
				separate: true
			}, `Initialized in ${time() - moduleStart}s`);
		}

		delete modulesList;
	},

	sounds: {
		priority: 1,
		init: async (set = () => {}, {
			clog = window.clog
		} = {}) => await sounds.init(set, { clog })
	},

	popup: {
		priority: 1,
		init: () => popup.init()
	},

	https: {
		priority: 0,

		init(set = () => {}, {
			clog = window.clog
		} = {}) {
			if (location.protocol !== "https:") {
				clog("WARN", "Page is not served through https! Someone can easily alter your data!");
				return false;
			}

			let upgradeInsecure = document.createElement("meta");
			upgradeInsecure.httpEquiv = "Content-Security-Policy";
			upgradeInsecure.content = "upgrade-insecure-requests";
			document.head.appendChild(upgradeInsecure);
		}
	},

	performance: {
		priority: 1,
		score: null,

		async init(set = () => {}, {
			clog = window.clog
		} = {}) {
			//! THIS MODULE IS TEMPORARY DISABLED DUE TO NO USE
			//! HOPEFULLY I CAN MAKE USE OF THIS LATER
			return false;

			let oldResult = parseFloat(localStorage.getItem("performance"));

			if (oldResult > 0) {
				clog("OKAY", "Found Previous Performance Score");
				this.score = oldResult;
			} else {
				set({ p: 0, d: "Running Performance Test" });
				clog("INFO", "Running Performance Test");

				this.score = await this.runTest();
				localStorage.setItem("performance", this.score);
				set({ p: 0, d: "Performance Test Completed" });
			}

			clog("OKAY", "Performance Score: ", {
				text: this.score,
				color: oscColor("green")
			});
		},

		runTest() {
			return new Promise((resolve) => {
				let tick = 0;
				let start = performance.now();

				while (tick < 1000)
					tick++;

				resolve(1 / (performance.now() - start));
			});
		}
	},

	rank: {
		priority: 3,
		container: $("#ranking"),
		refreshButton: $("#rankingRefresh"),
		heartbeatDot: $("#rankingUpdateHeartbeat"),		

		folding: {},
		timeout: null,
		hash: null,

		enabled: true,
		updateDelay: 2,

		async init() {
			this.refreshButton.addEventListener("click", () => this.update(true));
			await this.updater();
		},

		beat({ color = "green", beat = true } = {}) {
			if (color && typeof color === "string")
				this.heartbeatDot.dataset.color = color;

			this.heartbeatDot.style.animation = "none";
			
			if (beat) {
				//? Trigger Reflow
				this.heartbeatDot.offsetHeight;
				this.heartbeatDot.style.animation = null;
			}
		},

		async updater() {
			clearTimeout(this.timeout);
			let start = time();

			try {
				if (twi.initialized && this.enabled)
					await this.update();
			} catch(e) {
				//? IGNORE ERROR
				clog("ERRR", e);
			}
			
			this.timeout = setTimeout(() => this.updater(), (this.updateDelay - (time() - start)) * 1000);
		},

		async update(hard = false) {
			let response = await myajax({
				url: "/api/contest/rank",
				method: "GET",
			});
	
			let data = response.data;
			let hash = response.hash;

			if (hash === this.hash && !hard) {
				this.beat({ color: "blue" });
				return false;
			}
	
			clog("DEBG", "Updating Rank", `[${hash}]`);
			this.beat({ color: "green" });
			let timer = new stopClock();
	
			if (data.list.length === 0 && data.rank.length === 0) {
				emptyNode(this.container);
				
				this.hash = hash;
				clog("DEBG", "Rank Is Empty. Took", {
					color: flatc("blue"),
					text: timer.stop + "s"
				});
	
				return false;
			}
	
			let out = `
				<table>
					<thead>
						<tr>
							<th>#</th>
							<th></th>
							<th>Thí sinh</th>
							<th>Tổng</th>
							<th>SP</th>
			`
	
			for (let i of data.list)
				out += `
					<th
						class="problem"
						tooltip="<b>${i}</b><dot class='light'></dot>${data.nameList[i] || "?"}"
						problem-id="${i}"
						data-folding="${this.folding[i] ? true : false}"
					>
						<t class="name">${data.nameList[i] || i}</t>
						<span class="toggler" onclick="twi.rank.foldRankCol(this.parentElement)"></span>
					</th>`; 
	
			out += "</tr></thead><tbody>";
			let __point = 0;
			let rank = 0;
	
			for (let i of data.rank) {
				if (data.spRanking) {
					if (__point !== i.sp) {
						__point = i.sp;
						rank++;
					}
				} else {
					if (__point !== i.total) {
						__point = i.total;
						rank++;
					}
				}
	
				out += `
					<tr data-rank=${rank}>
						<td>${rank}</td>
						<td username="${i.username}">
							<div class="lazyload avatar">
								<img onload="this.parentNode.dataset.loaded = 1" src="/api/avatar?u=${i.username}"/>
								<div class="simpleSpinner"></div>
							</div>
						</td>
						<td username="${i.username}">
							<t class="username">${i.username}</t>
							<t class="name">${escapeHTML(i.name || "u:" + i.username)}</t>
						</td>
						<td class="number">${parseFloat(i.total).toFixed(2)}</td>
						<td class="number">${parseFloat(i.sp).toFixed(3)}</td>
				`
	
				for (let j of data.list)
					out += `
						<td
							class="number ${i.status[j] || ""}${(i.logFile[j]) ? ` link" onClick="twi.logViewer.view('${i.username}', '${j}')` : ""}"
							problem-id="${j}"
							data-folding="${this.folding[j] ? true : false}"
							${(typeof i.point[j] === "number") ? `data-ranking-cell="${j}|${data.nameList[j] || "undefined"}|${i.status[j]}|${i.point[j]}|${(i.sps && i.sps[j]) ? i.sps[j] : "undefined"}|${i.username}|${i.name ? escapeHTML(i.name) : null}"` : ""}
						>
							${data.spRanking
								? `
									<t class="big">${(i.sps && i.sps[j]) ? parseFloat(i.sps[j]).toFixed(3) : "---"}</t>
									<t>${(typeof i.point[j] !== "undefined") ? parseFloat(i.point[j]).toFixed(2) : "X"}</t>
								`
								: `
									<t class="big">${(typeof i.point[j] !== "undefined") ? parseFloat(i.point[j]).toFixed(2) : "X"}</t>
									${(i.sps && i.sps[j]) ? `<t>${parseFloat(i.sps[j]).toFixed(3)}</t>` : ""}
								`
							}
						</td>`;
				
				out += "</tr>";
			}
	
			out += "</tbody></table>";
			this.container.innerHTML = out;
			this.hash = hash;
	
			clog("DEBG", "Rank Updated. Took", {
				color: flatc("blue"),
				text: timer.stop + "s"
			});
		},

		foldRankCol(target) {
			let f = (target.dataset.folding === "true");
			let i = target.getAttribute("problem-id");
	
			target.dataset.folding = !f;
			this.folding[i] = !f;

			//* 👀 💥
			let pointList = target
				.parentElement
				.parentElement
				.parentElement
				.querySelectorAll(`tbody > tr > td[problem-id="${i}"]`);
	
			for (let item of pointList)
				item.dataset.folding = !f;
		}
	},

	logs: {
		priority: 3,
		container: $("#logsPanel"),
		panel: TWIPanel.prototype,

		timeout: null,
		hash: null,

		enabled: true,
		updateDelay: 2,

		refreshButton: null,
		clearJudgingButton: null,

		async init() {
			if (!SESSION || !SESSION.username) {
				this.container.style.display = "none";
				return false;
			}

			this.panel = new TWIPanel(this.container);
			this.refreshButton = this.panel.button("reload");
			this.refreshButton.onClick(() => this.update({ bypass: true }));

			this.clearJudgingButton = this.panel.button("gavel");
			this.clearJudgingButton.onClick(() => this.update({ clearJudging: true }));

			await this.update();
			await this.updater();
		},

		async updater() {
			clearTimeout(this.timeout);
			let start = time();

			try {
				if (twi.initialized && this.enabled)
					await this.update();
			} catch(e) {
				//? IGNORE ERROR
				clog("ERRR", e);
			}
			
			this.timeout = setTimeout(() => this.updater(), (this.updateDelay - (time() - start)) * 1000);
		},

		async update({
			bypass = false,
			clearJudging = false
		} = {}) {
			let response = await myajax({
				url: "/api/contest/logs",
				method: clearJudging ? "DELETE" : "GET",
			});
	
			let data = response.data;
			let hash = response.hash;

			if (hash === this.hash && !bypass)
				return;
	
			clog("DEBG", "Updating Logs", `[${hash}]`);
			let timer = new stopClock();
	
			if (data.judging.length === 0 && data.logs.length === 0 && data.queues.length === 0) {
				emptyNode(this.panel.main);
	
				this.hash = hash;
				clog("DEBG", "Logs Is Empty. Took", {
					color: flatc("blue"),
					text: timer.stop + "s"
				});
	
				return;
			}
	
			let out = "";
			
			for (let item of data.judging)
				out += `
					<div class="logItem judging">
						<div class="h">
							<div class="l">
								<t class="t">${(new Date(item.lastModify * 1000)).toLocaleString()}</t>
								<t class="n">${item.problemName || item.problem}</t>
							</div>
							<div class="r">
								<t class="s">Đang chấm</t>
								<t class="l">${twi.languages[item.extension] || item.extension}</t>
							</div>
						</div>
						<icon data-icon="gavel"></icon>
					</div>
				`
	
			for (let item of data.queues)
				out += `
					<div class="logItem queue">
						<div class="h">
							<div class="l">
								<t class="t">${(new Date(item.lastModify * 1000)).toLocaleString()}</t>
								<t class="n">${item.problemName || item.problem}</t>
							</div>
							<div class="r">
								<t class="s">Đang chờ</t>
								<t class="l">${twi.languages[item.extension] || item.extension}</t>
							</div>
						</div>
						<icon data-icon="sync"></icon>
					</div>
				`
	
			for (let item of data.logs)
				out += `
					<div class="logItem ${item.status}">
						<div class="h">
							<div class="l">
								<t class="t">${(new Date(item.lastModify * 1000)).toLocaleString()}</t>
								<t class="n">${item.problemName || item.problem}</t>
							</div>
							<div class="r">
								<t class="s">${item.point ? ((item.problemPoint) ? `${item.point}/${item.problemPoint} điểm` : `${item.point} điểm`) : twi.taskStatus[item.status]}</t>
								<t class="l">${twi.languages[item.extension] || item.extension}</t>
							</div>
						</div>
						<icon data-icon="envelope" class="${item.logFile ? `link" onClick="twi.logViewer.view('${response.user}', '${item.problem}')"` : `"`}></a>
					</div>
				`
	
			this.panel.main.innerHTML = out;
			this.hash = hash;
	
			clog("DEBG", "Logs Updated. Took", {
				color: flatc("blue"),
				text: timer.stop + "s"
			});
		}
	},

	logViewer: {
		priority: 3,

		viewLog: wavec.Container.prototype,
		viewLogNode: null,

		problemIcon: new lazyload({ source: "//:0", classes: "problemIcon" }),
		submitterAvatar: new lazyload({ source: "//:0", classes: "avatar" }),

		init() {
			this.viewLogNode = buildElementTree("div", "logViewer", [
				{ type: "div", class: "header", name: "header", list: [
					{ type: "span", class: "top", name: "top", list: [
						{ type: "span", class: "problem", name: "problem", list: [
							{ name: "icon", node: this.problemIcon.container },

							{ type: "span", class: "info", name: "info", list: [
								{ type: "t", class: "name", name: "name" },
								{ type: "t", class: "point", name: "point" }
							]},
						]},

						{ type: "span", class: "pointContainer", name: "pointInfo", list: [
							{ type: "span", class: "pointBox", name: "point", list: [
								{ type: "t", class: "title", name: "boxTitle", text: "Điểm" },
								{ type: "span", class: "point", name: "value", text: "NA" }
							]},

							{ type: "span", class: "pointBox", name: "sp", list: [
								{ type: "t", class: "title", name: "boxTitle", text: "SP" },
								{ type: "span", class: "point", name: "value", text: "NA" }
							]}
						]}
					]},

					{ type: "span", class: "bottom", name: "bottom", list: [
						{ type: "div", class: "line", name: "line", list: [
							{ type: "span", class: "left", name: "left", list: [
								{ type: "div", class: ["row", "problemInfo"], name: "info", list: [
									{ type: "t", class: "problemID", name: "problemID" },
									{ type: "t", class: "language", name: "language" }
								]},

								{ type: "div", class: "sp", name: "sp", text: "Submission Point không khả dụng cho bài làm này" },

								{ type: "t", class: ["row", "submitTime"], name: "submitTime" },
								{ type: "t", class: ["row", "submitted"], name: "submitted" },
								{ type: "t", class: ["row", "status"], name: "status" },
								{ type: "t", class: ["row", "result"], name: "result" }
							]},
	
							{ type: "span", class: "right", name: "right", list: [
								{ type: "span", class: "submitter", name: "submitter", list: [
									{ name: "avatar", node: this.submitterAvatar.container },
									{ type: "span", class: "info", name: "info", list: [
										{ type: "t", class: "tag", name: "tag", text: "Bài làm của" },
										{ type: "t", class: "name", name: "name" }
									]}
								]},
	
								{ name: "rawLog", node: createBtn("Raw Log", "blue", { element: "a", complex: true, icon: "scroll" }) },
								{ name: "reJudge", node: createBtn("Chấm Lại", "pink", { complex: true, icon: "gavel" }) },
								{ name: "delete", node: createBtn("Xóa Điểm", "red", { complex: true, icon: "trash" }) }
							]}
						]},
	
						{ type: "ul", class: ["textView", "breakWord", "line", "log"], name: "log" }
					]},
				]},

				{ type: "div", class: "testList", name: "testList" }
			]);

			this.viewLog = new wavec.Container(this.viewLogNode.tree, {
				icon: "scroll",
				title: "nhật kí"
			});
			
			this.viewLogNode = this.viewLogNode.obj;
			this.viewLogNode.header.bottom.line.right.rawLog.target = "_blank";
			sounds.applySound(this.viewLogNode.header.bottom.line.right.rawLog, ["soundhover", "soundactive"]);
		},

		async view(username, id) {
			clog("INFO", "Opening log file", {
				color: flatc("yellow"),
				text: username
			}, ":", {
				color: flatc("red"),
				text: id
			});
	
			let response = await myajax({
				url: "/api/contest/viewlog",
				method: "GET",
				query: {
					u: username,
					id
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
								<t class="testID">${item.test}</t>
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

			// NIGHTMARE \/
			this.viewLogNode.header.dataset.level = data.header.status;
			this.problemIcon.src = `/api/contest/problems/image?id=${data.header.problem}`;
			this.viewLogNode.header.top.problem.info.name.innerText = data.header.problemName || data.header.problem;
			this.viewLogNode.header.top.problem.info.point.innerText = data.header.problemPoint ? data.header.problemPoint + " điểm" : "Không rõ";
			this.viewLogNode.header.top.pointInfo.dataset.type = (data.meta.sp) ? "sp" : "point";
			this.viewLogNode.header.top.pointInfo.point.value.innerText = numberFormat(data.header.point);
			this.viewLogNode.header.top.pointInfo.sp.value.innerText = (data.meta.sp) ? numberFormat(data.meta.sp.point) : "---";
			this.viewLogNode.header.bottom.line.left.info.problemID.innerText = data.header.problem;
			this.viewLogNode.header.bottom.line.left.info.language.innerText = twi.languages[data.header.file.extension] || data.header.file.extension;
			this.viewLogNode.header.bottom.line.left.submitTime.innerText = (new Date(data.header.file.lastModify * 1000)).toLocaleString();
			this.viewLogNode.header.bottom.line.left.submitted.innerText = `${formatTime(time() - data.header.file.lastModify)} trước`;
			this.viewLogNode.header.bottom.line.left.status.innerText = twi.taskStatus[data.header.status];
			this.viewLogNode.header.bottom.line.left.result.innerHTML = `Đúng <b class="green">${data.header.testPassed}/${data.header.testPassed + data.header.testFailed}</b> test, <b class="red">${data.header.testFailed}</b> test sai`;
			this.submitterAvatar.src = `/api/avatar?u=${data.header.user}`;
			this.viewLogNode.header.bottom.line.right.submitter.info.name.innerText = data.header.name || "u:" + data.header.user;
			this.viewLogNode.header.bottom.line.right.rawLog.href = `/api/contest/rawlog?u=${data.header.user}&id=${data.header.problem}`;
			this.viewLogNode.header.bottom.log.innerHTML = logLine.join("\n");
			this.viewLogNode.testList.innerHTML = testList.join("\n");

			this.viewLogNode.header.top.problem.info.name.onclick = (data.header.problemName)
				? () => twi.problems.viewProblem(data.header.problem, true)
				: undefined;

			this.viewLogNode.header.bottom.line.left.sp.innerHTML = (data.meta.sp) ? `
				<table>
					<tbody>
						<tr class="${(data.meta.sp.detail.time > 0.8) ? "green" : ((data.meta.sp.detail.time > 0.6) ? "yellow" : "red")}">
							<td data-icon="clock">Thời Gian Nộp</td>
							<td>${data.meta.statistic.remainTime
									? parseTime(data.meta.statistic.remainTime).str
									: "X"
								}</td>
							<td>${(- ((1 - data.meta.sp.detail.time) * data.meta.point)).toFixed(3)}</td>
						</tr>
						<tr class="${["green", "yellow"][data.meta.statistic.reSubmit - 1] || "red"}">
							<td data-icon="gavel">Chấm Lại</td>
							<td>${data.meta.statistic.reSubmit}</td>
							<td>${(- ((1 - data.meta.sp.detail.reSubmit) * data.meta.point)).toFixed(3)}</td>
						</tr>
						<tr class="${["green", "yellow"][data.meta.statistic.submitNth - 1] || "red"}">
							<td data-icon="line">Thứ Hạng Chấm</td>
							<td>${data.meta.statistic.submitNth}</td>
							<td>${(- ((1 - data.meta.sp.detail.submitNth) * data.meta.point)).toFixed(3)}</td>
						</tr>
					</tbody>
				</table>
			` : "";

			this.viewLog.set({ title: data.header.file.logFilename });
			this.viewLog.show();
		}
	},

	problems: {
		priority: 3,
		container: $("#problemsPanel"),
		list: $("#problemsList"),
		name: $("#problemName"),
		point: $("#problemPoint"),
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
		image: lazyload.prototype,
		description: $("#problemDescription"),
		test: $("#problemTests"),
		attachment: {
			container: $("#problemAttachment"),
			link: $("#problemAttachmentLink"),
			preview: $("#problemAttachmentPreview"),
			previewWrapper: $("#problemAttachmentPreviewWrapper")
		},

		data: null,
		loaded: false,
		problemImage: lazyload.prototype,

		/**
		 * @type {TWIPanel}
		 */
		panel: null,
		backButton: null,
		reloadButton: null,
		viewInDialog: false,

		wavec: wavec.Container.prototype,

		async init() {
			this.panel = new TWIPanel(this.container);

			this.reloadButton = this.panel.button("reload");
			this.reloadButton.onClick(() => this.updateLists());

			this.backButton = this.panel.button("close");
			this.backButton.onClick(() => this.closeViewer());
			this.backButton.hide();
			
			this.closeBtn.addEventListener("mouseup", () => this.closeViewer());
			this.enlargeBtn.addEventListener("mouseup", () => this.enlargeProblem(this.data));

			this.image = new lazyload({
				container: $("#problemImage"),
				source: "//:0",
				classes: "image"
			});

			this.wavec = new wavec.Container(undefined, {
				icon: "book",
				title: "Đề Bài"
			});

			await this.updateLists();
		},

		async updateLists() {
			this.panel.loading = true;
			let data = {}

			try {
				let response = await myajax({
					url: "/api/contest/problems/list",
					method: "GET"
				});

				data = response.data;
			} catch(e) {
				switch (e.data.code) {
					case 103:
						clog("WARN", "Kì thi chưa bắt đầu");
						emptyNode(this.list);
						this.loaded = false;
						break;
					case 109:
						clog("WARN", "Danh sách đề bài bị ẩn vì bạn chưa đăng nhập");
						emptyNode(this.list);
						this.loaded = true;
						break;
					default:
						clog("ERRR", e);
						this.loaded = false;
						break;
				}

				this.panel.loading = false;
				return false;
			}

			this.loaded = true;

			let html = "";
			data.forEach(item => {
				html += `
					<span class="item" onClick="twi.problems.viewProblem('${item.id}');" disabled=${item.disabled}>
						<div class="lazyload icon">
							<img onload="this.parentNode.dataset.loaded = 1" src="${item.image}"/>
							<div class="simpleSpinner"></div>
						</div>
						<ul class="title">
							<li class="name">${item.name}</li>
							<li class="point">${item.point} điểm</li>
						</ul>
					</span>
				`
			});

			this.list.innerHTML = html;
			this.panel.loading = false;
		},

		async viewProblem(id, viewInDialog = false) {
			clog("INFO", "Opening problem", {
				color: flatc("yellow"),
				text: id
			});

			this.panel.loading = true;
			this.panel.title = "Đang Tải";
			this.attachment.previewWrapper.removeAttribute("data-loaded");
			this.attachment.previewWrapper.style.height = "0";

			let response = await myajax({
				url: "/api/contest/problems/get",
				method: "GET",
				query: { id: id }
			});

			let data = response.data;
			this.data = data;
			this.panel.title = `Đề bài - ${data.name}`;
			this.panel.loading = false;

			if (this.viewInDialog || viewInDialog) {
				this.enlargeProblem(this.data);
				return;
			}

			this.list.classList.add("hide");
			this.backButton.show();

			this.name.innerText = data.name;
			this.point.innerText = data.point + " điểm";
			this.type.filename.innerText = data.id;
			this.type.lang.innerText = data.accept.join(", ");
			this.type.time.innerText = data.time + " giây";
			this.type.mem.innerText = data.memory ? convertSize(data.memory * 1024) : "Không Rõ";
			this.type.input.innerText = data.type.inp;
			this.type.output.innerText = data.type.out;

			if (data.image) {
				this.image.container.style.display = null;
				this.image.src = data.image;
			} else
				this.image.container.style.display = "none";

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

			let testHtml = data.test
				.map(item => `
					<tr>
						<td>${escapeHTML(item.inp)}</td>
						<td>${escapeHTML(item.out)}</td>
					</tr>
				`)
				.join("");

			this.test.innerHTML = `
				<tr>
					<th>${data.type.inp}</th>
					<th>${data.type.out}</th>
				</tr>
			${testHtml}`;
		},

		closeViewer() {
			this.list.classList.remove("hide");
			this.panel.title = "Đề bài";
			this.backButton.hide();
		},

		enlargeProblem(data) {
			if (!data)
				return;

			let haveEmbeded = data.attachment.url && data.attachment.embed;	
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
				<div class="problemEnlarged ${haveEmbeded ? "embed" : ""}">
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
										<div class="simpleSpinner"></div>
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

					<span class="right"></span>
				</div>
			`;

			this.wavec.set({ title: "Đề bài - " + data.name })
			this.wavec.content = html;
			this.wavec.show();

			let embedDoc = new lazyload({
				container: this.wavec.content.querySelector(".problemEnlarged > .right"),
				source: {
					type: "document",
					src: `${data.attachment.url}&embed=true#toolbar=0&navpanes=0&scrollbar=0&statusbar=0&messages=0&scrollbar=0&page=1&view=FitH`
				},
				
				classes: "embedAttachment",
				doLoad: false
			});

			if (haveEmbeded)
				setTimeout(() => embedDoc.load(), 800);
		}
	},

	submit: {
		priority: 3,

		container: $("#submitPanel"),
		dropzone: $("#submitDropzone"),
		input: $("#submitInput"),
		state: $("#submitStatus"),
		name: $("#submitFileName"),
		bar: $("#submitprogressBar"),
		percent: $("#submitInfoProgress"),
		size: $("#submitInfoSize"),

		panel: TWIPanel.prototype,
		submitCooldown: 1000,
		uploading: false,

		reloadButton: null,

		init() {
			if (!SESSION || !SESSION.username) {
				this.container.style.display = "none";
				return false;
			}

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

			this.panel = new TWIPanel(this.container);
			this.reloadButton = this.panel.button("reload");
			this.reloadButton.onClick(() => this.reset());

			this.dropzone.addEventListener("drop", e => this.fileSelect(e), false);
			this.input.addEventListener("change", e => this.fileSelect(e, "input"));
			this.panel.title = "Nộp bài";
		},

		reset() {
			if (this.uploading)
				return;

			this.dropzone.classList.remove("hide");
			this.input.value = "";
			this.panel.title = "Nộp bài";
			this.name.innerText = "Unknown";
			this.state.innerText = "Unknown";
			this.size.innerText = "00B/00B";
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
			this.size.innerText = "00B/00B";
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

			clog("INFO", "Uploading", {
				color: flatc("yellow"),
				text: files[i].name
			});

			let p = (i / files.length) * 100;

			this.uploading = true;
			this.name.innerText = files[i].name;
			this.state.innerText = "Đang tải lên";
			this.panel.title = "Nộp bài - Đang tải lên " + (i + 1) + "/" + files.length;
			this.size.innerText = "00B/00B";
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

						this.size.innerText = `${convertSize(e.loaded)}/${convertSize(e.total)}`;
						this.percent.innerText = `${p.toFixed(0)}%`;
						this.bar.style.width = `${p}%`;
					}
				}, (response) => {
					if ([103, 104].includes(response.code)) {
						clog("ERRR", "Upload Stopped:", {
							color: flatc("red"),
							text: response.description
						});

						this.uploading = false;
						this.input.value = "";
						this.state.innerText = res.description;
						this.panel.title = "Nộp bài - ĐÃ XẢY RA LỖI!";
						this.bar.dataset.color = "red";

						return false;
					}

					clog("okay", "Uploaded", {
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
					clog("ERRR", "Upload Stopped", e);

					this.uploading = false;
					this.input.value = "";
					this.state.innerText = e.data.description;
					this.panel.title = "Nộp bài - ĐÃ XẢY RA LỖI!";
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

	timer: {
		priority: 3,
		enabled: false,

		/**
		 * Time Difference between Client and Server
		 */
		deltaT: 0,

		container: HTMLElement.prototype,
		navTimer: htmlToElement(`<timer class="small"><days>--</days>+--:--:--</timer>`),
		navProgress: htmlToElement(`<span class="bar"></span>`),
		tooltip: navbar.Tooltip.prototype,

		timeData: {},
		timeout: null,
		subWindow: null,
		interval: 1,

		showMs: false,
		last: 0,

		async init(set) {
			set({ p: 0, d: `Setting Up Timer Component` });
			this.container = document.createElement("span");
			this.container.classList.add("component", "timer");

			let icon = document.createElement("icon");
			icon.dataset.icon = "clock";
			
			let progressBar = document.createElement("div");
			progressBar.classList.add("progressBar");
			progressBar.appendChild(this.navProgress);

			this.container.append(icon, this.navTimer, progressBar);

			this.tooltip = new navbar.Tooltip(this.container, {
				title: "timer",
				description: "thời gian của kì thì"
			});

			let click = new navbar.Clickable(this.container);
			let subWindow = new navbar.SubWindow(this.container);
			subWindow.color = "blue";
			
			this.subWindow = buildElementTree("div", "timerDetails", [
				{ type: "timer", class: "big", name: "timer", html: "<days>0</days>+00:00:00" },
				{ type: "t", class: "state", name: "state", text: "Đang Khởi Động Đồng Hồ" },
				{ type: "div", class: "timeline", name: "timeline", list: [
					{ type: "span", class: "box", name: "begin", list: [
						{ type: "t", class: "time", name: "time", text: "00:00:00" },
						{ type: "t", class: "date", name: "date", text: "00/00/0000" }
					]},

					{ type: "span", class: "line", name: "during", list: [
						{ type: "t", class: "type", name: "type", text: "Làm Bài" },
						{ type: "div", class: "progressBar", name: "progress", list: [
							{ type: "div", class: "bar", name: "bar" }
						]},

						{ type: "t", class: "amount", name: "amount", text: "0 phút" }
					]},

					{ type: "span", class: "box", name: "end", list: [
						{ type: "t", class: "time", name: "time", text: "00:00:00" },
						{ type: "t", class: "date", name: "date", text: "00/00/0000" }
					]},

					{ type: "span", class: "line", name: "offset", list: [
						{ type: "t", class: "type", name: "type", text: "Bù Giờ" },
						{ type: "div", class: "progressBar", name: "progress", list: [
							{ type: "div", class: "bar", name: "bar" }
						]},

						{ type: "t", class: "amount", name: "amount", text: "0 phút" }
					]},

					{ type: "span", class: "box", name: "over", list: [
						{ type: "t", class: "time", name: "time", text: "00:00:00" },
						{ type: "t", class: "date", name: "date", text: "00/00/0000" }
					]},
				]}
			]);

			subWindow.content = this.subWindow.tree;
			this.subWindow = this.subWindow.obj;

			this.subWindow.timeline.during.progress.bar.dataset.color = "green";
			this.subWindow.timeline.offset.progress.bar.dataset.color = "red";
			this.subWindow.timeline.offset.progress.bar.dataset.blink = "grow";

			click.setHandler(() => subWindow.toggle());
			navbar.insert({ container: this.container }, "right");

			set({ p: 0, d: `Starting Timer` });
			await this.updateData(true);
		},

		async updateData(reload = false) {
			let response = await myajax({
				url: "/api/contest/timer",
				method: "GET",
			});

			let data = response.data;

			if (data.during <= 0) {
				clearInterval(this.interval);
				
				this.enabled = false;
				clog("INFO", "Timer Disabled: not in contest mode");
				this.container.style.display = "none";

				return;
			}
			
			this.enabled = true;
			this.timeData = data;
			
			this.container.style.display = null;
			this.subWindow.timeline.dataset.box = 0;

			let start = new Date(this.timeData.start * 1000);
			this.subWindow.timeline.begin.time.innerText = start.toLocaleTimeString();
			this.subWindow.timeline.begin.date.innerText = start.toLocaleDateString();

			let end = new Date((this.timeData.start + this.timeData.during) * 1000);
			this.subWindow.timeline.end.time.innerText = end.toLocaleTimeString();
			this.subWindow.timeline.end.date.innerText = end.toLocaleDateString();

			let over = new Date((this.timeData.start + this.timeData.during + this.timeData.offset) * 1000);
			this.subWindow.timeline.over.time.innerText = over.toLocaleTimeString();
			this.subWindow.timeline.over.date.innerText = over.toLocaleDateString();

			this.subWindow.timeline.during.amount.innerText = `${Math.round(this.timeData.during / 60 * 100) / 100} phút`;
			this.subWindow.timeline.offset.amount.innerText = `${Math.round(this.timeData.offset / 60 * 100) / 100} phút`;

			if (start.toDateString() == end.toDateString())
				this.subWindow.timeline.classList.add("hideDate");
			else
				this.subWindow.timeline.classList.remove("hideDate");

			if (reload) {
				this.last = 0;
				this.updater();
			}
		},

		updater() {
			clearTimeout(this.timeout);
			let start = time();

			this.timeUpdate();
			this.timeout = setTimeout(() => this.updater(), (this.interval - (time() - start)) * 1000);
		},

		toggleMs(show) {
			clearInterval(this.interval);

			if (show) {
				this.showMs = true;
				this.interval = 0.065;
				this.navProgress.classList.add("noTransition");
			} else {
				this.showMs = false;
				this.interval = 1;
				this.navProgress.classList.remove("noTransition");
			}
		},

		timeUpdate() {
			if (!this.enabled)
				return;

			let beginTime = this.timeData.start;
			let duringTime = this.timeData.during;
			let offsetTime = this.timeData.offset;
			let t = beginTime - time() + duringTime;

			let color = "";
			let progress = 0;
			let blink = "none";
			let state = "";

			if (t > duringTime) {
				t -= duringTime;
				if (this.last === 0)
					this.last = t;

				color = "blue";
				progress = ((t) / this.last) * 100;
				state = "Kì Thi Sắp Bắt Đầu";

				this.subWindow.timeline.dataset.box = 0;
				this.subWindow.timeline.during.progress.bar.style.width = null;
				this.subWindow.timeline.offset.progress.bar.style.width = null;
			} else if (t > 0) {
				// if (!twi.problems.loaded) {
				// 	clog("INFO", "Reloading problems list and public files list");
					
				// }

				color = "green";
				progress = (t / duringTime) * 100;
				state = "Thời Gian Làm Bài";

				this.subWindow.timeline.dataset.box = 1;
				this.subWindow.timeline.during.progress.bar.style.width = `${100 - progress}%`;
				this.subWindow.timeline.offset.progress.bar.style.width = null;
			} else if (t > -offsetTime) {
				t += offsetTime;
				
				color = "yellow";
				progress = (t / offsetTime) * 100;
				blink = "grow";
				state = "Thời Gian Bù";

				this.subWindow.timeline.dataset.box = 2;
				this.subWindow.timeline.during.progress.bar.style.width = `100%`;
				this.subWindow.timeline.offset.progress.bar.style.width = `${100 - progress}%`;
			} else {
				t += offsetTime;

				color = "red";
				progress = 100;
				blink = "fade"
				state = "ĐÃ HẾT THỜI GIAN LÀM BÀI";

				this.subWindow.timeline.dataset.box = 3;
				this.subWindow.timeline.during.progress.bar.style.width = `100%`;
				this.subWindow.timeline.offset.progress.bar.style.width = `100%`;
			}

			let days = Math.floor(t / 86400) + (t < 0 ? 1 : 0);
			let timeParsed = parseTime(t % 86400, { showPlus: (days !== 0), forceShowHours: true });
			this.subWindow.timer.dataset.color = this.navTimer.dataset.color = color;
			this.subWindow.timer.innerHTML = this.navTimer.innerHTML = `${days !== 0 ? `<days>${days}</days>` : ""}${timeParsed.str}${this.showMs ? `<ms>${timeParsed.ms}</ms>` : ""}`;
			
			this.navProgress.dataset.color = color;
			this.navProgress.dataset.blink = blink;
			this.navProgress.dataset.blinkFast = progress < 20 ? true : false;
			this.navProgress.style.width = `${progress}%`;

			this.subWindow.state.innerText = state;
		}
	},

	updateChecker: {
		priority: 5,

		optInBeta: false,

		async init() {
			if (SESSION.id !== "admin")
				return;

			await this.check();
		},

		async check(set = () => {}) {
			if (!SERVER)
				throw { code: -1, description: `SERVER Data Not Found!` }
			
			let localVersion = `${SERVER.version}-${SERVER.versionTag}`;
			twi.userSettings.admin.localVersion.content = `Phiên Bản Hiện Tại: <b>${localVersion}</b>`;

			let remoteData = null;
			let remoteVersion = `0.0.0-unknown`;
			twi.userSettings.admin.remoteVersion.content = `Phiên Bản Mới Nhất: <b>${remoteVersion}</b>`;

			try {
				let response = await myajax({
					url: "https://api.github.com/repos/belivipro9x99/themis-web-interface/releases/latest",
					method: "GET",
					changeState: false,
					reRequest: false
				});
	
				remoteData = response;
			} catch(error) {
				clog("WARN", "Error Checking for update:", error);
				return;
			}

			remoteVersion = remoteData.tag_name;
			twi.userSettings.admin.remoteVersion.content = `Phiên Bản Mới Nhất: <b>${remoteVersion}</b>`;
			let state = versionCompare(localVersion, "1.0.1-release", { ignoreTest: this.optInBeta });

			switch (state) {
				case "latest":
					twi.userSettings.admin.updateNote.set({
						level: "okay",
						message: "Phiên bản hiện tại là phiên bản mới nhất!"
					});

					break;

				case "major":
					twi.userSettings.admin.updateNote.set({
						level: "warning",
						message: `
							<t>Hiện đã có một bản cập nhật LỚN: <b>${remoteVersion}</b></t>
							<t>Nhấn vào nút dưới đây để đi tới trang tải xuống:</t>
							<a href="${remoteData.html_url}" target="_blank" rel="noopener" class="sq-btn dark" style="margin-top: 10px; width: 100%;">${remoteData.tag_name} : ${remoteData.target_commitish}</a>
						`
					});

					sounds.warning();
					popup.show({
						level: "warning",
						windowTitle: "Update Checker",
						title: "Cập Nhật Hệ Thống",
						message: `Major Update`,
						description: `Hiện đã có một bản cập nhật LỚN! <b>${remoteVersion}</b><br>Vui lòng cập nhật lên phiên bản mới nhất để đảm bảo độ ổn định của hệ thống`,
						buttonList: {
							contact: { text: `${remoteData.tag_name} : ${remoteData.target_commitish}`, color: "dark", resolve: false, onClick: () => window.open(remoteData.html_url, "_blank") },
							continue: { text: "Bỏ qua", color: "pink" }
						}
					});

					break;
			
				case "minor":
					twi.userSettings.admin.updateNote.set({
						level: "warning",
						message: `
							<t>Hiện đã có một bản cập nhật: <b>${remoteVersion}</b></t>
							<t>Nhấn vào nút dưới đây để đi tới trang tải xuống:</t>
							<a href="${remoteData.html_url}" target="_blank" rel="noopener" class="sq-btn dark" style="margin-top: 10px; width: 100%;">${remoteData.tag_name} : ${remoteData.target_commitish}</a>
						`
					});

					break;

				case "patch":
					twi.userSettings.admin.updateNote.set({
						level: "info",
						message: `
							<t>Hiện đã có một bản vá lỗi: <b>${remoteVersion}</b></t>
							<t>Nhấn vào nút dưới đây để đi tới trang tải xuống:</t>
							<a href="${remoteData.html_url}" target="_blank" rel="noopener" class="sq-btn dark" style="margin-top: 10px; width: 100%;">${remoteData.tag_name} : ${remoteData.target_commitish}</a>
						`
					});

					break;

				default:
					twi.userSettings.admin.updateNote.set({
						level: "error",
						message: `Unknown Version: ${state}`
					});

					break;
			}
		}
	},

	userSettings: {
		priority: 2,

		container: $("#userSettings"),

		/**
		 * Initialize User Settings Module
		 * @param {Function}	set		Report Progress to Initializer
		 */
		init(set) {
			set({ p: 0, d: "Setting Up User Settings Panel" });
			smenu.init(this.container, {
				title: "cài đặt",
				description: "thay đổi cách Themis Web Interface hoạt động"
			});

			smenu.onShow(() => twi.content.classList.add("parallax"));
			smenu.onHide(() => twi.content.classList.remove("parallax"));

			if (["beta", "indev", "debug", "test"].includes(SERVER.versionTag)) {
				new smenu.components.Note({
					level: "warning",
					message: `
						Đây là bản thử nghiệm không ổn định dùng để kiểm tra tính ổn định trước khi xuất bản! Vui lòng không tổ chức kì thi nào trên phiên bản này!<br>
						Nếu bạn tìm thấy lỗi, hãy báo cáo lỗi tại link ở phần <b>LIÊN KẾT NGOÀI</b> bên dưới!
					`
				},
					new smenu.Child({ label: "Cảnh Báo" },
						new smenu.Group({
							icon: "exclamation",
							label: "thử nghiệm"
						})
					)
				)
			}
		},

		download: {
			group: smenu.Group.prototype,
			publicFilesPanel: smenu.Panel.prototype,

			async init() {
				this.group = new smenu.Group({ label: "tải về", icon: "file" });

				let publicChild = new smenu.Child({ label: "Công Khai" }, this.group);
				let publicFilesButton = new smenu.components.Button({
					label: "Các Tệp Công Khai",
					color: "blue",
					icon: "arrowLeft",
					complex: true
				}, publicChild);

				this.publicFilesPanel = new smenu.Panel(undefined, { size: "large" });
				this.publicFilesPanel.setToggler(publicFilesButton);
				await this.publicFilesPanel.content("iframe:/public");
				twi.darkmode.onToggle((enabled) => this.publicFilesPanel.iframe.contentDocument.body.classList[enabled ? "add" : "remove"]("dark"));
			}
		},

		settings: {
			group: smenu.Group.prototype,

			init() {
				this.group = new smenu.Group({ label: "cài đặt", icon: "tools" });

				this.display();
				this.sounds();
				this.others();
			},

			display() {
				let display = new smenu.Child({ label: "Hiển Thị" }, this.group);

				new smenu.components.Checkbox({
					label: "Chế độ ban đêm",
					color: "pink",
					save: "display.nightmode",
					defaultValue: SERVER.clientConfig.nightmode,
					onChange: (v) => twi.darkmode.set(v)
				}, display);

				new smenu.components.Checkbox({
					label: "Hoạt ảnh",
					color: "blue",
					save: "display.transition",
					defaultValue: SERVER.clientConfig.transition,
					onChange: (v) => document.body.classList[v ? "remove" : "add"]("disableTransition")
				}, display);

				new smenu.components.Checkbox({
					label: "Hiện MilliSecond trong đồng hồ",
					color: "blue",
					save: "display.showMs",
					defaultValue: SERVER.clientConfig.showMs,
					onChange: (v) => twi.timer.toggleMs(v)
				}, display);

				new smenu.components.Checkbox({
					label: "Thông báo",
					color: "pink",
					save: "display.notification",
					defaultValue: false,
					disabled: true
				}, display);

				new smenu.components.Checkbox({
					label: "Super Triangles!",
					color: "blue",
					save: "display.triangles",
					defaultValue: (twi.performance.score > 30),
					disabled: false
				}, display);
			},

			sounds() {
				let soundsChild = new smenu.Child({ label: "Âm Thanh" }, this.group);

				let mouseOver = new smenu.components.Checkbox({
					label: "Mouse Over",
					color: "blue",
					save: "sounds.mouseOver",
					defaultValue: true,
					onChange: (v) => sounds.enable.mouseOver = v
				}, soundsChild);

				let btnClick = new smenu.components.Checkbox({
					label: "Button Click/Toggle",
					color: "blue",
					save: "sounds.btnClick",
					defaultValue: true,
					onChange: (v) => sounds.enable.btnClick = v
				}, soundsChild);

				let panelToggle = new smenu.components.Checkbox({
					label: "Panel Show/Hide",
					color: "blue",
					save: "sounds.panelToggle",
					defaultValue: true,
					onChange: (v) => sounds.enable.panelToggle = v
				}, soundsChild);

				let others = new smenu.components.Checkbox({
					label: "Others",
					color: "blue",
					save: "sounds.others",
					defaultValue: true,
					onChange: (v) => sounds.enable.others = v
				}, soundsChild);

				let notification = new smenu.components.Checkbox({
					label: "Notification",
					color: "blue",
					save: "sounds.notification",
					defaultValue: true,
					onChange: (v) => sounds.enable.notification = v
				}, soundsChild);

				let master = new smenu.components.Checkbox({
					label: "Bật âm thanh",
					color: "pink",
					save: "sounds.master",
					defaultValue: SERVER.clientConfig.sounds,
					onChange: (v) => {
						sounds.enable.master = v;
						mouseOver.set({ disabled: !v });
						btnClick.set({ disabled: !v });
						panelToggle.set({ disabled: !v });
						others.set({ disabled: !v });
						notification.set({ disabled: !v });
					}
				});

				soundsChild.insert(master, -1);
			},

			others() {
				let others = new smenu.Child({ label: "Khác" }, this.group);
				let sliderStep = {
					1: 0.5,		2: 1,		3: 2,		4: 10,
					5: 60,		6: 120,		7: 240,		8: 300,
					9: 600,		10: 3600,
					11: false
				}

				let lowWarningSettings = {
					level: "warning",
					windowTitle: "Cảnh Báo",
					title: "Cảnh Báo",
					message: "Thời gian làm mới quá nhỏ!",
					description: "Việc đặt giá trị này quá nhỏ sẽ làm cho máy chủ hiểu nhầm rằng bạn đang tấn công máy chủ và sẽ chặn bạn trong một khoảng thời gian nhất định!",
					buttonList: {
						cancel: { color: "blue", text: "Bấm Lộn! Trả Về Cũ Đi!" },
						ignore: { color: "red", text: "Máy Chủ Là Gì? Có Ăn Được Không?" }
					}
				}

				new smenu.components.Checkbox({
					label: "Xem đề bài trong cửa sổ mở rộng",
					color: "blue",
					save: "others.popupProblem",
					defaultValue: false,
					onChange: (v) => twi.problems.viewInDialog = v
				}, others);

				let updateRank = new smenu.components.Slider({
					label: "Thời gian cập nhật xếp hạng",
					color: "blue",
					save: "others.updateRank",
					min: 1,
					max: 11,
					unit: "giây",
					defaultValue: SERVER.clientConfig.rankUpdate,
					valueStep: sliderStep
				}, others);

				updateRank.onInput((v) => updateRank.set({ color: (v <= 2) ? "red" : "blue" }));
				updateRank.onChange(async (v, e) => {
					if (v < 3 && e.isTrusted)
						if (await popup.show(lowWarningSettings) === "cancel") {
							updateRank.set({ value: 3 });
							return;
						}

					if (sliderStep[v] === false)
						twi.rank.enabled = false;
					else {
						twi.rank.enabled = true;
						twi.rank.updateDelay = sliderStep[v];
					}
				});

				let updateLogs = new smenu.components.Slider({
					label: "Thời gian cập nhật nhật kí",
					color: "blue",
					save: "others.logsUpdate",
					min: 1,
					max: 11,
					unit: "giây",
					defaultValue: SERVER.clientConfig.logsUpdate,
					valueStep: sliderStep
				}, others);

				updateLogs.onInput((v) => updateLogs.set({ color: (v <= 2) ? "red" : "blue" }));
				updateLogs.onChange(async (v, e) => {
					if (v < 3 && e.isTrusted)
						if (await popup.show(lowWarningSettings) === "cancel") {
							updateLogs.set({ value: 3 });
							return;
						}

					if (v === 11)
						if (await popup.show({
							level: "warning",
							windowTitle: "Cảnh Báo",
							title: "Cảnh Báo",
							message: "Tắt tự động cập nhật nhật ký",
                            description: "Việc này sẽ làm cho tình trạng nộp bài của bạn không được tự động cập nhật.<br>Bạn có chắc muốn tắt tính năng này không?",
							buttonList: {
								cancel: { color: "blue", text: "Bấm Lộn! Trả Về Cũ Đi!" },
								ignore: { color: "red", text: "TẮT! TẮT HẾT!" }
							}
						}) === "cancel") {
							updateLogs.set({ value: 3 });
							return;
						}

					if (sliderStep[v] === false)
						twi.logs.enabled = false;
					else {
						twi.logs.enabled = true;
						twi.logs.updateDelay = sliderStep[v];
					}
				});
			}
		},

		admin: {
			group: smenu.Group.prototype,

			async init() {
				if (SESSION.id !== "admin") {
					clog("INFO", "Current Session Does Not Have Admin Privileges. Admin Features Will Not Be ENABLED!");
					return false;
				}

				this.group = new smenu.Group({ icon: "userCog", label: "quản trị" });

				this.update();
				await this.settings();
			},

			localVersion: smenu.components.Text.prototype,
			remoteVersion: smenu.components.Text.prototype,
			updateNote: smenu.components.Note.prototype,

			update() {
				let child = new smenu.Child({ label: "Phiên Bản" }, this.group);

				this.localVersion = new smenu.components.Text({
					content: "Phiên Bản Hiện Tại: <b>UPDATING</b>"
				}, child);

				this.remoteVersion = new smenu.components.Text({
					content: "Phiên Bản Mới Nhất: <b>UPDATING</b>"
				}, child);

				this.updateNote = new smenu.components.Note({
					level: "info",
					message: "Đang Kiểm Tra Phiên Bản Mới"
				}, child);

				new smenu.components.Space(child);

				new smenu.components.Checkbox({
					label: "Thông báo khi có bản thử nghiệm mới",
					color: "blue",
					save: "optInBeta",
					defaultValue: false,
					onChange: (v) => twi.updateChecker.optInBeta = v
				}, child);

				new smenu.components.Button({
					label: "Kiểm Tra Phiên Bản Mới",
					color: "yellow",
					icon: "upload",
					complex: true,
					onClick: async () => await twi.updateChecker.check()
				}, child);
			},

			settingsChild: smenu.Child.prototype,
			controlPanel: smenu.Panel.prototype,
			accountsPanel: smenu.Panel.prototype,

			async settings() {
				this.settingsChild = new smenu.Child({ label: "Cài Đặt" }, this.group);

				let controlPanelButton = new smenu.components.Button({
					label: "Admin Control Panel",
					color: "blue",
					icon: "arrowLeft",
					complex: true
				}, this.settingsChild);

				this.controlPanel = new smenu.Panel(undefined, { size: "large" });
				this.controlPanel.setToggler(controlPanelButton);
				await this.controlPanel.content("iframe:/config.php");
				twi.darkmode.onToggle((enabled) => this.controlPanel.iframe.contentDocument.body.classList[enabled ? "add" : "remove"]("dark"));

				let accountsButton = new smenu.components.Button({
					label: "Quản Lí Tài Khoản",
					color: "blue",
					icon: "arrowLeft",
					complex: true
				}, this.settingsChild);

				this.accountsPanel = new smenu.Panel(undefined, { size: "large" });
				this.accountsPanel.setToggler(accountsButton);
				await this.accountsPanel.content("iframe:/account.php");
				twi.darkmode.onToggle((enabled) => this.accountsPanel.iframe.contentDocument.body.classList[enabled ? "add" : "remove"]("dark"));
			},

			syslogs: {
				panel: smenu.Panel.prototype,
				container: HTMLElement.prototype,
				logsContainer: HTMLElement.prototype,

				nav: {
					left: HTMLElement.prototype,
					btnLeft: HTMLElement.prototype,
					currentPage: HTMLElement.prototype,
					btnRight: HTMLElement.prototype,
					right: HTMLElement.prototype
				},

				prevHash: undefined,
				showPerPage: 20,
				currentPage: 1,
				maxPage: 1,
	
				async init() {
					this.panel = new smenu.Panel($("#syslogs"), { size: "large" });
					this.panel.setToggler(new smenu.components.Button({
						label: "Nhật Kí Hệ Thống",
						color: "blue",
						icon: "arrowLeft",
						complex: true
					}, this.super.settingsChild));

					this.panel.custom.type("delete");
					this.panel.custom.onClick(() => this.refresh(true));

					this.container = this.panel.container;
					this.logsContainer = fcfn(this.container, "logsContainer");
					this.nav.left = fcfn(this.container, "left");
					this.nav.btnLeft = fcfn(this.container, "buttonLeft");
					this.nav.currentPage = fcfn(this.container, "currentPage");
					this.nav.btnRight = fcfn(this.container, "buttonRight");
					this.nav.right = fcfn(this.container, "right");
	
					await this.refresh();
	
					this.nav.btnLeft.addEventListener("click", e => {
						this.currentPage--;
	
						if (this.currentPage < 1)
							this.currentPage = 1;
	
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
					let response = {}
	
					try {
						response = await myajax({
							url: "/api/logs",
							method: "POST",
							form: {
								token: API_TOKEN,
								clear: clearLogs,
								show: this.showPerPage,
								page: this.currentPage
							}
						})
					} catch(e) {
						if (e.data.code === 6) {
							clog("WARN", `Không tồn tại trang ${this.currentPage} của nhật ký hệ thống`, e.data.data);
							this.currentPage = 1;
							this.maxPage = e.data.data.maxPage;
							await this.refresh();
	
							return;
						}
	
						throw e;
					}
	
					let data = response.data;
					let hash = response.hash;
					if (hash === this.prevHash)
						return;
	
					this.prevHash = hash;
					this.nav.left.innerText = `Hiển thị ${data.from} - ${data.to}`;
					this.nav.currentPage.innerText = `Trang ${data.pageNth}/${data.maxPage}`;
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
					clog("info", `Refreshed SysLogs [${hash}]`);
				}
			},

			problemsEditor: {
				container: HTMLElement.prototype,
				panel: smenu.Panel.prototype,

				id: null,
				action: null,
				form: HTMLFormElement.prototype,

				async init() {
					this.container = buildElementTree("div", "problemsEditor", [
						{ type: "div", class: "header", name: "header", list: [
							{ type: "icon", class: "back", name: "back", data: { icon: "arrowLeft" } },
							{ type: "t", class: "title", name: "titleNode", text: "Chỉnh Sửa Đề Bài" },
							{ type: "span", class: "right", name: "right", list: [
								{ type: "icon", name: "add", data: { icon: "plus" } },
								{ type: "icon", name: "save", data: { icon: "save" } }
							]},
						]},

						{ type: "div", class: "main", name: "main", list: [
							{ type: "div", class: "list", name: "list" },
							{ type: "form", class: "editor", name: "editor", list: [
								{ name: "pID", node: createInput({ color: "blue", label: "Mã Đề", required: true }) },
								{ name: "pName", node: createInput({ color: "blue", label: "Tên Bài", required: true }) },
								{ name: "point", node: createInput({ type: "number", color: "blue", label: "Điểm", required: true }) },
								{ name: "time", node: createInput({ type: "number", color: "blue", label: "Thời Gian Chạy", required: true }) },
								{ name: "memory", node: createInput({ type: "number", color: "blue", label: "Giới Hạn Bộ Nhớ", required: true }) },
								{ name: "inputType", node: createInput({ color: "blue", label: "Dữ Liệu Vào", required: true }) },
								{ name: "outputType", node: createInput({ color: "blue", label: "Dữ Liệu Ra", required: true }) },
								{ name: "extensions", node: createInput({ color: "blue", label: "Đuôi Tệp (dùng | để ngăn cách)", required: true }) },
								{ name: "image", node: createImageInput({ label: "Ảnh Đính Kèm", resetLabel: "Xóa Ảnh Đính Kèm Hiện Tại" }) },
								{ name: "attachment", node: createInput({ type: "file", label: "Tệp Đính Kèm", color: "blue" }) },
								{ name: "removeAttachment", node: createBtn("Xóa Tệp Đính Kèm Hiện Tại", "pink") },
								{ name: "description", node: createInput({ type: "textarea", color: "blue", label: "Nội Dung", required: true }) },
								{ type: "div", class: "tests", name: "tests", list: [
									{ type: "t", class: "label", name: "label", text: "Test Ví Dụ" },
									{ type: "div", class: "list", name: "list" },
									{ type: "div", class: "add", name: "add" }
								]},
								{ name: "submitButton", node: createBtn("LƯU", "blue", { icon: "save", complex: "true" }) }
							]}
						]}
					]);

					this.panel = new smenu.Panel(this.container.tree);
					this.panel.setToggler(new smenu.components.Button({
						label: "Chỉnh Sửa Đề Bài",
						color: "blue",
						icon: "arrowLeft",
						complex: true
					}, this.super.settingsChild));

					this.container = this.container.obj;
					this.form = this.container.main.editor;
					
					this.panel.reload.onClick(() => this.updateLists());
					this.container.header.back.addEventListener("click", () => this.hideEditor());
					this.container.header.right.add.addEventListener("click", () => this.add());
					this.container.header.right.save.addEventListener("click", () => this.form.submitButton.click());
					this.form.tests.add.addEventListener("click", () => this.addTest());
					this.form.addEventListener("submit", () => this.postSubmit());
					this.form.action = "javascript:void(0);";
					this.form.submitButton.type = "submit";

					this.form.image.onReset(async () => {
						if (this.id && await this.deleteFile("image", this.id))
							this.form.image.src();
					});

					this.hideEditor(false);
					await this.updateLists();
				},

				async updateLists() {
					let response = await myajax({
						url: "/api/contest/problems/list",
						method: "GET"
					});
	
					let data = response.data;
					let html = "";

					emptyNode(this.container.main.list);
					
					for (let item of data)
						html += `
							<li class="item">
								<img class="icon" src="${item.image}">
								<ul class="title">
									<li class="id">${item.id}</li>
									<li class="name">${item.name}</li>
								</ul>
								<div class="action">
									<span class="sq-switch">
										<input
											id="problemToggler_${item.id}"
											class="checkbox"
											type="checkbox"
											${!item.disabled ? "checked" : ""}
											onchange="twi.userSettings.admin.problemsEditor.disable('${item.id}', this)"
										></input>

										<label for="problemToggler_${item.id}" class="track"></label>
									</span>

									<span class="delete" onclick="twi.userSettings.admin.problemsEditor.delete('${item.id}')"></span>
									<span class="edit" onclick="twi.userSettings.admin.problemsEditor.edit('${item.id}')"></span>
								</div>
							</li>
						`
	
					this.container.main.list.innerHTML = html;
				},

				showEditor(sound = true) {
					this.container.main.classList.add("editor");
					this.container.header.back.style.display = null;
					this.container.header.right.add.style.display = "none";
					this.container.header.right.save.style.display = null;

					if (sound)
						sounds.toggle()
				},
	
				hideEditor(sound = true) {
					this.container.main.classList.remove("editor");
					this.container.header.back.style.display = "none";
					this.container.header.right.add.style.display = null;
					this.container.header.right.save.style.display = "none";
					this.container.header.titleNode.innerText = "Chỉnh Sửa Đề Bài";
					this.action = null;

					if (sound)
						sounds.toggle(1);
				},

				resetForm() {
					this.form.pID.input.value = "";
					this.form.pID.input.disabled = false;
					this.form.pName.input.value = "";
					this.form.point.input.value = null;
					this.form.time.input.value = 1;
					this.form.memory.input.value = 1024;
					this.form.inputType.input.value = "Bàn Phím";
					this.form.outputType.input.value = "Màn Hình";
					this.form.extensions.input.value = Object.keys(twi.languages).join("|");
					this.form.image.src("//:0");
					this.form.attachment.input.value = null;
					this.form.description.input.value = "";

					emptyNode(this.form.tests.list);
				},

				addTest({ inp = "", out = "" } = {}) {
					let node = htmlToElement(`
						<div class="cell">
							<textarea placeholder="Input" required>${inp}</textarea>
							<textarea placeholder="Output" required>${out}</textarea>
							<span class="delete"></span>
						</div>
					`)

					node.querySelector(".delete").addEventListener("click", () => {
						node.remove();
						delete node;
					});

					this.form.tests.list.appendChild(node);
				},

				add() {
					this.resetForm();
					this.container.header.titleNode.innerText = "Thêm Đề Bài";
					this.form.removeAttachment.disabled = true;
					this.action = "add";

					this.showEditor();
					setTimeout(() => this.form.pID.input.focus(), 600);
				},

				async edit(id) {
					let response = await myajax({
						url: "/api/contest/problems/get",
						method: "GET",
						query: {
							id: id
						}
					});
	
					let data = response.data;
					clog("INFO", "Editing problem", {
						color: flatc("yellow"),
						text: id
					});
	
					this.resetForm();
					this.container.header.titleNode.innerText = "Đề Bài: " + data.id;
					this.action = "edit";
					this.id = id;

					this.form.pID.input.value = data.id;
					this.form.pID.input.disabled = true;
					this.form.pName.input.value = data.name;
					this.form.point.input.value = data.point;
					this.form.time.input.value = data.time || 1;
					this.form.memory.input.value = data.memory || 1024;
					this.form.inputType.input.value = data.type.inp || "Bàn Phím";
					this.form.outputType.input.value = data.type.out || "Màn Hình";
					this.form.extensions.input.value = data.accept.join("|");
					this.form.description.input.value = data.description;
					this.form.image.src(data.image || "//:0");
	
					if (data.attachment && data.attachment.file) {
						this.form.removeAttachment.disabled = false;

						this.form.removeAttachment.onclick = async () => {
							this.form.removeAttachment.disabled = true;

							if (!await this.deleteFile("attachment", data.id, data.attachment.file))
								this.form.removeAttachment.disabled = false;
						}
					} else
						this.form.removeAttachment.disabled = true;
	
					for (let item of data.test)
						this.addTest(item);
					
					this.showEditor();
					setTimeout(() => this.form.pName.input.focus(), 600);
				},

				async postSubmit() {
					this.container.header.titleNode.innerText = "Đang Lưu";
	
					let data = {
						id: this.form.pID.input.value,
						name: this.form.pName.input.value,
						point: this.form.point.input.value,
						time: this.form.time.input.value,
						memory: this.form.memory.input.value,
						inpType: this.form.inputType.input.value,
						outType: this.form.outputType.input.value,
						accept: this.form.extensions.input.value.split("|"),
						image: this.form.image.input.files[0] || null,
						description: this.form.description.input.value,
						attachment: this.form.attachment.input.files[0] || null,
						tests: []
					}
	
					let testNodes = this.form.tests.list.getElementsByTagName("div.cell");
	
					for (let item of testNodes) {
						let inputs = item.getElementsByTagName("textarea");

						if (inputs[0] === "" || inputs[1] === "")
							continue;

						data.tests.push({
							inp: inputs[0],
							out: inputs[1]
						});
					}
					
					await this.submit(this.action, data);
					await this.updateLists();
					this.hideEditor();
				},
	
				async submit(action, data) {
					if (!["edit", "add"].includes(action))
						throw { code: -1, description: `twi.userSettings.admin.problemsEditor.submit(${action}): not a valid action!` }
	
					clog("INFO", "Problem Submit:", {
						color: flatc("green"),
						text: action
					}, {
						color: flatc("yellow"),
						text: data.id
					});
	
					try {
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
								accept: JSON.stringify(data.accept),
								image: data.image,
								description: data.description,
								attachment: data.attachment,
								test: JSON.stringify(data.tests),
								token: API_TOKEN
							}
						});
					} catch(e) {
						errorHandler(e);
						throw e;
					}

					return true;
				},

				async disable(id, targetSwitch) {
					sounds.select(1);
					targetSwitch.disabled = true;
	
					await myajax({
						url: "/api/contest/problems/edit",
						method: "POST",
						form: {
							id: id,
							disabled: !targetSwitch.checked,
							token: API_TOKEN
						}
					})
	
					targetSwitch.disabled = false;
				},

				async delete(id) {
					clog("WARN", "Deleting Problem", {
						color: flatc("yellow"),
						text: id + "."
					}, "Waiting for confirmation");
	
					let confirm = await popup.show({
						level: "warning",
						windowTitle: "Problems Editor",
						title: `Xóa \"${id}\"`,
						message: `Xác nhận`,
						description: `Bạn có chắc muốn xóa đề bài <i>${id}</i> không?`,
						note: `Hành động này <b>không thể hoàn tác</b> một khi đã thực hiện!`,
						noteLevel: "warning",
						buttonList: {
							delete: { text: "XÓA!!!", color: "red" },
							cancel: { text: "Hủy Bỏ", color: "blue" }
						}
					})
	
					if (confirm !== "delete") {
						clog("INFO", "Cancelled deletion of", {
							color: flatc("yellow"),
							text: id + "."
						});

						return;
					}
	
					sounds.confirm(1);
	
					try {
						await myajax({
							url: "/api/contest/problems/remove",
							method: "POST",
							form: {
								id: id,
								token: API_TOKEN
							}
						});
					} catch(e) {
						errorHandler(e);
						throw e;
					}
	
					clog("OKAY", "Deleted Problem", {
						color: flatc("yellow"),
						text: id
					});
	
					await this.updateLists();
				},

				async deleteFile(type, id, fileName = null) {
					if (!["image", "attachment"].includes(type))
						throw { code: -1, description: `twi.userSettings.admin.problemsEditor.deleteFile(${type}): not a valid type!` }
	
					typeName = { image: "Ảnh Đính Kèm", attachment: "Tệp Đính Kèm" }[type]
	
					clog("WARN", "Preparing to delete", typeName, "of", {
						color: flatc("yellow"),
						text: `${id}.`
					}, "Waiting for confirmation...");
	
					let action = await popup.show({
						windowTitle: "Xác nhận",
						title: `Xóa ${typeName} của đề "${id}"`,
						description: `Bạn có chắc muốn xóa ${fileName ? `<b>${fileName}</b>` : "không"}?`,
						note: `Hành động này <b>không thể hoàn tác</b> một khi đã thực hiện!`,
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
	
					try {
						await myajax({
							url: `/api/contest/problems/${type}`,
							method: "DELETE",
							header: {
								id: id,
								token: API_TOKEN
							}
						})
					} catch(e) {
						errorHandler(e);
						throw e;
					}
	
					clog("OKAY", "Deleted", typeName, "of", {
						color: flatc("yellow"),
						text: id
					})
	
					return true;
				}
			}
		},

		projectInfo: {
			group: smenu.Group.prototype,
			licensePanel: smenu.Panel.prototype,

			async init() {
				this.group = new smenu.Group({ label: "thông tin", icon: "info" });
				let links = new smenu.Child({ label: "Liên Kết Ngoài" }, this.group);

				new smenu.components.Button({
					label: "Báo Lỗi",
					color: "pink",
					icon: "externalLink",
					complex: true,
					onClick: () => window.open(SERVER.REPORT_ERROR, "_blank")
				}, links);
				
				new smenu.components.Button({
					label: "Wiki",
					color: "pink",
					icon: "externalLink",
					complex: true,
					onClick: () => window.open(SERVER.REPO_ADDRESS + "/wiki", "_blank")
				}, links);
				
				new smenu.components.Button({
					label: "Mã Nguồn Mở",
					color: "pink",
					icon: "externalLink",
					complex: true,
					onClick: () => window.open(SERVER.REPO_ADDRESS, "_blank")
				}, links);

				let project = new smenu.Child({ label: "Dự Án" }, this.group);

				let detailsButton = new smenu.components.Button({
					label: "Thông Tin",
					color: "blue",
					icon: "arrowLeft",
					complex: true
				}, project);

				(new smenu.Panel($("#mainFooter"))).setToggler(detailsButton);

				let licenseButton = new smenu.components.Button({
					label: "LICENSE",
					color: "blue",
					icon: "arrowLeft",
					complex: true
				}, project);

				this.licensePanel = new smenu.Panel(undefined, { size: "large" });
				this.licensePanel.setToggler(licenseButton);
				await this.licensePanel.content("iframe:/licenseInfo.php");
				twi.darkmode.onToggle((enabled) => this.licensePanel.iframe.contentDocument.body.classList[enabled ? "add" : "remove"]("dark"));

				new smenu.components.Footer({
					icon: "/assets/img/icon.webp",
					appName: SERVER.APPNAME,
					version: SERVER.version
				}, project);
			}
		}
	},

	darkmode: {
		priority: 4,
		enabled: false,
		toggleHandlers: [],

		init() {
			this.update();
		},

		set(dark) {
			this.enabled = dark;

			if (this.initialized)
				this.update();
		},

		onToggle(f) {
			if (!f || typeof f !== "function")
				throw { code: -1, description: `twi.Panel().button(${icon}).onClick(): not a valid function` }

			this.toggleHandlers.push(f);
			f(this.enabled);
		},

		update() {
			this.toggleHandlers.forEach(f => f(this.enabled));
			document.body.classList[this.enabled ? "add" : "remove"]("dark");
		}
	},

	wavec: {
		priority: 1,
		container: $("#waveContainer"),

		init(set) {
			set({ p: 0, d: "Setting Up Wave Container" });
			wavec.init(this.container);
		}
	},

	navbar: {
		priority: 1,

		container: $("#navbar"),

		title: navbar.title({
			tooltip: {
				title: "contest",
				description: "xem thông tin kì thi này"
			}
		}),

		/**
		 * Hamburger Icon.
		 * User Settings Panel Toggler
		 */
		menu: navbar.menuButton({
			tooltip: {
				title: "settings",
				description: "thay đổi cài đặt của Themis Web Interface"
			}
		}),

		/**
		 * Initialize Navigation Bar Module
		 * @param {Function}	set		Report Progress to Initializer
		 */
		init(set) {
			set({ p: 0, d: "Setting Up Navigation Bar" });
			navbar.init(this.container);

			set({ p: 20, d: "Adding Default Navigation Bar Modules" });
			this.title.set({
				icon: "/api/images/icon",
				background: "/api/images/landing",
				title: SERVER.contest.name,
				description: SERVER.contest.description
			});

			this.menu.click.setHandler((active) => (active) ? smenu.show() : smenu.hide());
			smenu.onShow(() => this.menu.click.active = true);
			smenu.onHide(() => this.menu.click.active = false);

			navbar.insert(this.title, "left");
			navbar.insert(this.menu, "right");
		},

		switch: {
			component: navbar.switch(),
			home: null,
			ranking: null,

			init() {
				navbar.insert(this.component, "left");
				twi.darkmode.onToggle((dark) => this.component.set({ color: dark ? "dark" : "whitesmoke" }));

				this.home = this.component.button({
					icon: "home",
					tooltip: {
						title: "home",
						description: "xem đề bài và nộp bài làm!"
					}
				});

				this.home.click.setHandler((a) => (a) ? twi.content.dataset.layout = 1 : "");

				this.ranking = this.component.button({
					icon: "table",
					tooltip: {
						title: "ranking",
						description: "xem những người khác thực hiện tốt như thế nào!"
					}
				});

				this.ranking.click.setHandler((a) => (a) ? twi.content.dataset.layout = 2 : "");

				if (SESSION && SESSION.username)
					this.home.click.active = true;
				else
					this.ranking.click.active = true;
			}
		},

		announcement: {
			component: navbar.announcement(),
			currentHash: null,

			init() {
				navbar.insert(this.component, "left");
				this.component.onRead(() => localStorage.setItem("config.announcement", this.currentHash));
				twi.hash.onUpdate("config.announcement", (h) => this.update(h));
			},

			async update(hash) {
				let lastReadHash = localStorage.getItem("config.announcement");

				if (lastReadHash === hash) {
					this.log("DEBG", `Announcement Read`);
					return;
				}

				let response = await myajax({
					url: `/api/announcement`,
					method: "GET"
				});

				if (!response.data.enabled) {
					this.log("INFO", `Announcement Disabled`);
					this.component.hide();
					return;
				}

				sounds.notification();
				this.currentHash = hash;
				this.component.set({
					level: response.data.level,
					message: response.data.message,
					time: time()
				});
			}
		},

		account: {
			component: null,
			username: null,

			async init() {
				this.username = SESSION.username;

				if (!this.username) {
					this.component = navbar.account({
						color: "darkRed",
						tooltip: {
							title: "account",
							description: "nhấn để đăng nhập!"
						}
					});

					this.component.click.setHandler(() => window.location ="/login.php");
					navbar.insert(this.component, "right");
					return;
				}

				let accountData = await myajax({
					url: "/api/info",
					query: {
						u: SESSION.username
					}
				});

				this.component = navbar.account({
					id: accountData.data.id,
					username: SESSION.username,
					name: accountData.data.name,
					avatar: `/api/avatar?u=${this.username}`,
					tooltip: {
						title: "account",
						description: "chỉnh sửa hoặc đăng xuất khỏi tài khoản hiện tại!"
					}
				});

				this.component.onChangeAvatar(async (file) => {
					try {
						await myajax({
							url: "/api/avatar",
							method: "POST",
							form: {
								token: API_TOKEN,
								file
							}
						});
					} catch(e) {
						sounds.warning();
						errorHandler(e);
						throw e;
					}

					clog("OKAY", "Avatar changed");
				});

				this.component.onChangeName(async (name) => {
					let response = null;

					try {
						response = await myajax({
							url: "/api/edit",
							method: "POST",
							form: {
								name,
								token: API_TOKEN
							}
						})
					} catch(e) {
						clog("ERRR", e);

						await popup.show({
							windowTitle: "Đổi Tên",
							title: "Thất Bại",
							message: "Đổi tên không thành công",
							description: `[${e.data.code}] ${e.data.description}`,
							level: "info",
							buttonList: {
								close: { text: "Đóng" }
							}
						});

						return false;
					}

					this.component.set({ name: response.data.name });
					clog("OKAY", `Changed Name To`, {
						text: name,
						color: oscColor("pink")
					})
				});

				this.component.onChangePassword(async (password, newPassword) => {
					let response = null;

					try {
						response = await myajax({
							url: "/api/edit",
							method: "POST",
							form: {
								password,
								newPassword,
								token: API_TOKEN
							}
						})
					} catch(e) {
						clog("ERRR", e);

						await popup.show({
							windowTitle: "Đổi Mật Khẩu",
							title: "Thất Bại",
							message: "Đổi mật khẩu không thành công",
							description: `[${e.data.code}] ${e.data.description}`,
							level: "info",
							buttonList: {
								close: { text: "Đóng" }
							}
						});

						return false;
					}

					popup.show({
						windowTitle: "Đổi Mật Khẩu",
						title: "Thành Công",
						description: `Mật khẩu của bạn đã được đổi`,
						level: "okay",
						buttonList: {
							close: { text: "Đóng" }
						}
					});

					clog("OKAY", `Password Changed`);
				});

				this.component.onLogout(async () => {
					let response = await myajax({
						url: "/api/logout",
						method: "POST",
						form: {
							token: API_TOKEN
						}
					});

					window.location = response.data.redirect;
				});

				twi.darkmode.onToggle((e) => this.component.set({ color: e ? "darkBlue" : "blue" }));
				navbar.insert(this.component, "right");
			}
		}
	},

	tooltip: {
		priority: 4,

		init(set) {
			set({ p: 0, d: `Initializing Tooltip` });
			tooltip.init();

			//? ================= USERCARD =================
			set({ p: 20, d: `Setting Up Usercard` });

			tooltip.addHook({
				on: "attribute",
				key: "username",
				handler: ({ target, value }) => {
					let userInfo = buildElementTree("div", "userCard", [
						{ type: "div", class: "loadingWrapper", name: "loading", list: [
							{ type: "div", class: ["simpleSpinner", "light"], name: "spinner" },
							{ type: "t", class: "error", name: "error" }
						]},
	
						{ type: "div", class: "header", name: "header", list: [
							{ type: "span", class: "left", name: "left", list: [
								{ type: "div", class: ["avatar", "light"], name: "avatar" },
								{ type: "div", class: "status", name: "status" }
							]},
	
							{ type: "div", class: "right", name: "right", list: [
								{ type: "t", class: "username", name: "username" },
								{ type: "span", class: "detail", name: "detail", list: [
									{ type: "t", class: "name", name: "name" },
									{ type: "t", class: "id", name: "userID" }
								]},
								{ type: "t", class: "status", name: "status" }
							]}
						]},
	
						{ type: "div", class: "submissions", name: "submissions", list: [
							{ type: "div", class: "bar", name: "bar", list: [
								{ type: "span", class: "inner", name: "inner", list: [
									{ type: "span", class: "skipped", name: "skipped" },
									{ type: "span", class: "failed", name: "failed" },
									{ type: "span", class: "accepted", name: "accepted" },
									{ type: "span", class: "passed", name: "passed" },
									{ type: "span", class: "correct", name: "correct" }
								]}
							]},
							{ type: "div", class: "list", name: "list" }
						]}
					])
	
					myajax({
						url: "/api/info",
						method: "GET",
						query: { u: value }
					}, (response) => {
						let data = response.data;
						let e = userInfo.obj;
	
						e.classList.add("loaded");
	
						new lazyload({
							container: e.header.left.avatar,
							source: `/api/avatar?u=${data.username}`
						});
	
						e.header.right.username.innerText = data.username;
						e.header.right.detail.name.innerText = data.name;
						e.header.right.detail.userID.innerText = data.id;
	
						if (data.online) {
							e.header.right.status.innerText = `Trực Tuyến`;
							e.header.left.status.dataset.status = "online";
						} else {
							e.header.right.status.innerText = `Ngoại Tuyến`
							e.header.left.status.dataset.status = "offline";
	
							liveTime(e.header.right.status, data.lastAccess, {
								prefix: "Truy cập ",
								surfix: " trước"
							});
						}
	
						for (item of ["skipped", "failed", "accepted", "passed", "correct"]) {
							if (data.submissions[item] === 0)
								continue;
	
							e.submissions.bar.inner[item].style.width = `${(data.submissions[item] / data.submissions.total) * 100}%`;
							e.submissions.bar.inner[item].innerText = data.submissions[item];
						}
	
						requestAnimationFrame(() => e.submissions.bar.inner.style.width = "100%");
	
						let topSubmissions = data.submissions.list
							.sort((a, b) => (a.sp && b.sp) ? (b.sp - a.sp) : (b.point - a.point))
							.slice(0, 5);
						
						for (let i = 0; i < topSubmissions.length; i++) {
							let item = topSubmissions[i];
	
							let element = htmlToElement(`
								<div class="item" data-status="${item.status}">
									<span class="left">
										<t class="title">${item.problemName || item.problem}</t>
										<div class="detail">
											<t class="id">${item.problem}</t>
											<t class="extension">${twi.languages[item.extension]}</t>
										</div>	
									</span>
	
									<span class="right">
										<t class="point">${item.point}<sub>điểm</sub></t>
										<t class="sp">${item.sp ? `${item.sp.toFixed(3)}<sub>SP</sub>` : "NA"}</t>
									</span>
								</div>
							`);
	
							e.submissions.list.appendChild(element);
							setTimeout(() => element.classList.add("show"), 100 * (i + 1));
						}
					}).catch((reason) => {
						let e = userInfo.obj;
	
						e.loading.dataset.type = "errored";
	
						switch (reason.data.code) {
							case 13:
								e.loading.error.innerHTML = `Không tìm thấy tài khoản <b>${reason.data.data.username}</b>`;
								break;
						
							default:
								e.loading.error.innerText = reason.data.description;
								break;
						}
					})
	
					return userInfo.tree;
				},
				priority: 2,
				backtrace: 3,
				noPadding: true
			});

			//? ================= RANKING CELL =================
			set({ p: 30, d: `Setting Up Ranking Cell` });

			tooltip.addHook({
				on: "dataset",
				key: "rankingCell",
				handler: ({ target, value }) => {
					let v = value.split("|");
					let id = v[0],
						problem = (v[1] === "undefined") ? null : v[1],
						status = v[2],
						point = (v[3] === "undefined") ? null : parseFloat(v[3]),
						sp = (v[4] === "undefined") ? null : parseFloat(v[4]),
						username = v[5],
						name = (v[6] === "null") ? null : v[6]
	
					return `
						<div class="rankingCellTooltip" data-status="${status}">
							<div class="header">
								<t class="name">${name || username}</t>
								<dot class="light"></dot>
								<t class="problem">${problem || id}</t>
								<dot class="light"></dot>
								<t class="status">${twi.taskStatus[status] || status}</t>
							</div>
	
							<table class="point">
								<tbody>
									<tr>
										<td>Điểm</td>
										<td>${point}</td>
									</tr>
									<tr>
										<td>SP</td>
										<td>${(sp) ? sp.toFixed(3) : "Không Khả Dụng"}</td>
									</tr>
								</tbody>
							</table>
						</div>
					`;
				},
				priority: 2,
				backtrace: 2
			});
		}
	},

	hash: {
		priority: 6,
		changeHandlers: {},
		hashes: {},

		timeout: null,

		enabled: true,
		updateDelay: 2,

		async init(set = () => {}, {
			clog = window.clog
		} = {}) {
			await this.update(set, { clog });
			await this.updater();
		},

		async updater() {
			clearTimeout(this.timeout);
			let start = time();

			try {
				if (twi.initialized && this.enabled)
					await this.update();
			} catch(e) {
				//? IGNORE ERROR
				clog("ERRR", e);
			}
			
			this.timeout = setTimeout(() => this.updater(), (this.updateDelay - (time() - start)) * 1000);
		},

		async update(set = () => {}, {
			clog = window.clog
		} = {}) {
			set({ p: 0, d: "Receiving Hash List" });
			let response = await myajax({
				url: `/api/hash`,
				method: "GET"
			});

			let keys = Object.keys(response.data);
			for (let [i, key] of keys.entries()) {
				set({ p: 10 + ((i + 1) / keys.length) * 0.9, d: `Processing ${key}` });

				if (this.hashes[key] !== response.data[key]) {
					let hash = response.data[key];
					
					clog("INFO", "Hash Changed:",
						{ text: hash, color: oscColor("green") },
						{ text: key, color: oscColor("blue") }
					);

					this.hashes[key] = hash;

					if (!this.changeHandlers[key] || this.changeHandlers[key].length === 0) {
						clog("DEBG", `No handlers for ${key}. Skipping`);
						continue;
					}

					for (let f of this.changeHandlers[key])
						await f(hash);
				}
			}
		},

		onUpdate(key, f) {
			if (typeof key !== "string")
				throw { code: -1, description: `twi.hash.onUpdate(${key}): key is not a valid string` }

			if (typeof f !== "function")
				throw { code: -1, description: `twi.hash.onUpdate(${key}): not a valid function` }

			if (!this.changeHandlers[key])
				this.changeHandlers[key] = new Array();

			return this.changeHandlers[key].push(f);
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
			<div class="simpleSpinner"></div>
		`;

		let gud = await popup.show({
			windowTitle: "MEME REVIEW 👏👏",
			title: "got some mweme fow yya",
			message: `r/${wutMeme.subreddit} u/${wutMeme.author} (${wutMeme.ups} 🔼) <a href="${wutMeme.postLink}" target="_blank">SAUCE 🔗</a>`,
			description: wutMeme.title,
			customNode: memeContainer,
			buttonList: {
				moar: { text: "👏 NEXT 👏 MEME 👏", color: "rainbow" },
				stahp: { text: "THIS MEME IS ALREADY DEAD", color: "dark" }
			}
		})

		this.deliveringMeme = false;

		if (gud === "moar")
			this.getRandomMeme();
	}
}