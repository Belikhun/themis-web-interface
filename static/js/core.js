//? |-----------------------------------------------------------------------------------------------|
//? |  /static/js/core.js                                                                           |
//? |                                                                                               |
//? |  Copyright (c) 2018-2021 Belikhun. All right reserved                                         |
//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
//? |-----------------------------------------------------------------------------------------------|

/**
 * TWI Panel
 * 
 * Create an object that control the panel in TWI
 * main contianer (or somewhere else)
 * 
 * Template:
 * ```html
 *	<panel>
 *		<div class="header">
 *			<t class="title">Title</t>
 *			<span class="buttons"></span>
 *		</div>
 *
 *		<div class="main">Panel Content Goes Here</div>
 *	</panel>
 * ```
 * 
 * @copyright	`2018-2021` **Belikhun**
 * @license		**MIT**
 * @version		1.0
 */
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
		set({ p: 0, m: name, d: `Scanning Modules Of ${name}` });

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

		if (modulesList.length === 0)
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
			}, `(initialize from top to bottom)`);
	
			for (let [i, module] of modulesList.entries())
				clog("DEBG", {
					color: oscColor("pink"),
					text: truncateString(name, 34),
					padding: 34,
					separate: true
				}, " + ", pleft(i, 2), pleft(module.__NAME__, 38), pleft(module.priority || 0, 3));
		}

		// Initialize modules
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
		priority: 3,

		__set: () => {},
		__clog: window.clog,
		/** @type	{Function[]} */
		handlers: [],

		async init(set, { clog } = {}) {
			if (typeof set === "function")
				this.__set = set;

			if (typeof clog === "function")
				this.__clog = clog;

			await sounds.init(({ p, m, d, c } = {}) => {
				this.__set({ p, m, d });
				this.handlers.forEach(f => f({ p, m, d, c }));
			}, { clog: this.__clog });
		},

		attach(f) {
			if (typeof f !== "function")
				throw { code: -1, description: `twi.sounds.attach(): not a valid function` }

			return this.handlers.push(f);
		}
	},

	popup: {
		priority: 1,
		init: () => popup.init()
	},

	https: {
		priority: 0,

		init() {
			if (location.protocol !== "https:") {
				this.log("WARN", "Page is not served through https! Anyone can easily alter your data!");
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

		async init(set = () => {}) {
			//! THIS MODULE IS TEMPORARY DISABLED DUE TO NO USE
			//! HOPEFULLY I CAN MAKE USE OF THIS IN THE FUTURE
			return false;

			let oldResult = parseFloat(localStorage.getItem("performance"));

			if (oldResult > 0) {
				this.log("OKAY", "Found Previous Performance Score");
				this.score = oldResult;
			} else {
				set({ p: 0, d: "Running Performance Test" });
				this.log("INFO", "Running Performance Test");

				this.score = await this.runTest();
				localStorage.setItem("performance", this.score);
				set({ p: 0, d: "Performance Test Completed" });
			}

			this.log("OKAY", "Performance Score: ", {
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
		heartbeatAnm: null,

		folding: {},
		timeout: null,
		hash: null,

		enabled: true,
		updateDelay: 2,

		async init() {
			this.refreshButton.addEventListener("click", () => this.update(true));
			new Scrollable(this.container.parentElement, {
				content: this.container,
				overrideScroll: false
			});

			await this.updater();
			this.update();
		},

		beat({ color = "green", beat = true } = {}) {
			if (color && typeof color === "string")
				this.heartbeatDot.dataset.color = color;
			
			if (!this.heartbeatAnm)
				this.heartbeatAnm = this.heartbeatDot.getAnimations()[0];

			if (this.heartbeatAnm && beat)
				this.heartbeatAnm.play();
		},

		async updater() {
			clearTimeout(this.timeout);
			let start = time();

			try {
				if (twi.initialized && this.enabled)
					await this.update();
			} catch(e) {
				//? IGNORE ERROR
				this.log("ERRR", e);
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
	
			this.log("DEBG", "Updating Rank", `[${hash}]`);
			this.beat({ color: "green" });
			let timer = new StopClock();
	
			if (data.list.length === 0 && data.rank.length === 0) {
				emptyNode(this.container);
				
				this.hash = hash;
				this.log("DEBG", "Rank Is Empty. Took", {
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
	
			this.log("DEBG", "Rank Updated. Took", {
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
				this.log("ERRR", e);
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
	
			this.log("DEBG", "Updating Logs", `[${hash}]`);
			let timer = new StopClock();
	
			if (data.judging.length === 0 && data.logs.length === 0 && data.queues.length === 0) {
				emptyNode(this.panel.main);
	
				this.hash = hash;
				this.log("DEBG", "Logs Is Empty. Took", {
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
	
			this.log("DEBG", "Logs Updated. Took", {
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
	
								{ name: "rawLog", node: createButton("Raw Log", { color: "blue", element: "a", complex: true, icon: "scroll" }) },
								{ name: "reJudge", node: createButton("Chấm Lại", { color: "pink", complex: true, icon: "gavel" }) },
								{ name: "delete", node: createButton("Xóa Điểm", { color: "red", complex: true, icon: "trash" }) }
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
			this.log("INFO", "Opening log file", {
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
							<td data-icon="clock">Thời Gian Còn</td>
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
		priority: 2,
		container: $("#problemsPanel"),
		listContainer: $("#problemsListContainer"),
		list: $("#problemsList"),

		search: {
			container: $("#problemSearch"),
			input: $("#problemSearchInput"),
			clear: $("#problemSearchClear")
		},

		problem: {
			container: $("#problemViewContainer"),
			view: $("#problemView")
		},

		loaded: false,

		/** @type {TWIPanel} */
		panel: null,

		/** @type {Pager} */
		pager: null,

		/**
		 * Store the elements structure of Problem Viewer
		 * @type {HTMLElement}
		 */
		viewer: null,

		/**
		 * User setting to toggle open an problem
		 * in a new window
		 * @type	{Boolean}
		 */
		viewInDialog: false,

		wavec: wavec.Container.prototype,

		/**
		 * Current Opening Problem ID
		 * @type {String}
		 */
		id: null,

		backButton: null,
		searchDelay: null,
		currentActiveItem: null,
		itemTimeout: {},

		async init() {
			this.pager = new Pager(this.list, -1);
			this.panel = new TWIPanel(this.container);

			// Initialize searchbar
			this.search.input.addEventListener("input", (e) => {
				if (e.target.value !== "")
					this.search.container.classList.add("typing");
				else
					this.search.container.classList.remove("typing");

				clearTimeout(this.searchDelay);
				this.searchDelay = setTimeout(() => this.pager.render(), 500);
			});

			this.search.clear.addEventListener("click", () => {
				this.search.input.value = "";
				this.search.input.dispatchEvent(new Event("input"));
			});

			// Set up pager handler
			this.pager.renderItem((i) => this.__renderItem(i));
			this.pager.setFilter((i) => {
				let searchKeyword = this.search.input.value
					.toLowerCase()
					.split(" ");

				if (searchKeyword.length > 0 && searchKeyword[0] !== "") {
					let match = false;
					for (let field of [
						i.id,
						i.name,
						i.tags.join(" "),
						(i.author ? `${i.author.username} ${i.author.name}` : "")
					])
						if (field.toLowerCase().includes(...searchKeyword)) {
							match = true;
							break;
						}
	
					if (!match)
						return false;
				}

				return true;
			});

			// Set up scrollable
			new Scrollable(this.listContainer, {
				content: this.list
			});

			new Scrollable(this.problem.container, {
				content: this.problem.view
			});

			// Build Problem Viewer Tree
			this.viewer = makeTree("div", "problemViewer", {
				backgroundWrapper: { tag: "div", class: "backgroundWrapper", child: {
					background: new lazyload({ classes: "background" }),
				}},

				content: { tag: "div", class: "content", child: {
					header: { tag: "div", class: "header", child: {
						left: { tag: "span", class: "left", child: {
							pTitle: { tag: "t", class: "title", text: "Sample Title" },
							point: { tag: "span", class: "point", text: "0 điểm" },
	
							author: { tag: "div", class: "author", child: {
								avatar: new lazyload({ classes: ["avatar", "light"] }),
								details: { tag: "span", class: "detail", child: {
									uTitle: { tag: "t", class: "title", text: "Được Tạo Bởi" },
									uName: { tag: "t", class: "name", text: "dummy" },
									updated: { tag: "t", class: "updated", html: "cập nhật lúc <b>00/00/0000</b>" }
								}}
							}},
	
							buttons: { tag: "div", class: "buttons", child: {
								love: createButton("icon", {
									color: "blue",
									icon: "heart",
									style: "round",
									complex: true
								}),

								enlarge: createButton("Mở Rộng", {
									color: "blue",
									icon: "externalLink",
									style: "round",
									complex: true
								})
							}}
						}},
	
						right: { tag: "span", class: "right", child: {
							loved: { tag: "span", class: "loved", child: {
								lTitle: { tag: "t", class: "title", text: "Yêu Thích" },
								list: { tag: "div", class: "list" }
							}},
	
							status: { tag: "span", class: "status", child: {
								sTitle: { tag: "t", class: "title", text: "Tình Trạng" },
								bar: { tag: "div", class: ["progressBar", "judgeStatusBar", "stackable"], child: {
									correct: { tag: "div", class: "bar", data: { color: "green" } },
									passed: { tag: "div", class: "bar", data: { color: "blue" } },
									accepted: { tag: "div", class: "bar", data: { color: "yellow" } },
									failed: { tag: "div", class: "bar", data: { color: "red" } },
									skipped: { tag: "div", class: "bar", data: { color: "gray" } }
								}},
	
								detail: { tag: "div", class: "detail", child: {
									correct: { tag: "div", class: "item", child: {
										wrapper: { tag: "span", class: "wrapper", child: {
											status: {
												tag: "span",
												class: ["status", "judgeStatus"],
												data: { status: "correct" },
												text: twi.taskStatus.correct
											},
										}},
	
										value: { tag: "t", class: "value", text: "0" }
									}},
	
									passed: { tag: "div", class: "item", child: {
										wrapper: { tag: "span", class: "wrapper", child: {
											status: {
												tag: "span",
												class: ["status", "judgeStatus"],
												data: { status: "passed" },
												text: twi.taskStatus.passed
											},
										}},
	
										value: { tag: "t", class: "value", text: "0" }
									}},
	
									accepted: { tag: "div", class: "item", child: {
										wrapper: { tag: "span", class: "wrapper", child: {
											status: {
												tag: "span",
												class: ["status", "judgeStatus"],
												data: { status: "accepted" },
												text: twi.taskStatus.accepted
											},
										}},
	
										value: { tag: "t", class: "value", text: "0" }
									}},
	
									failed: { tag: "div", class: "item", child: {
										wrapper: { tag: "span", class: "wrapper", child: {
											status: {
												tag: "span",
												class: ["status", "judgeStatus"],
												data: { status: "failed" },
												text: twi.taskStatus.failed
											},
										}},
	
										value: { tag: "t", class: "value", text: "0" }
									}},
	
									skipped: { tag: "div", class: "item", child: {
										wrapper: { tag: "span", class: "wrapper", child: {
											status: {
												tag: "span",
												class: ["status", "judgeStatus"],
												data: { status: "skipped" },
												text: twi.taskStatus.skipped
											},
										}},
	
										value: { tag: "t", class: "value", text: "0" }
									}}
								}}
							}}
						}}
					}},
	
					details: { tag: "div", class: "details", child: {
						left: { tag: "span", class: "left", child: {
							tTitle: { tag: "t", class: "title", text: "thông tin" },
	
							items: { tag: "div", class: "items", child: {
								pID: { tag: "span", class: ["item", "id"], child: {
									label: { tag: "t", class: "label", text: "Mã Đề" },
									value: { tag: "t", class: "value", text: "sample" }
								}},
		
								runtime: { tag: "span", class: ["item", "runtime"], child: {
									label: { tag: "t", class: "label", text: "Thời Gian Chạy" },
									value: { tag: "t", class: "value", text: "0 giây" }
								}},
		
								memory: { tag: "span", class: ["item", "memory"], child: {
									label: { tag: "t", class: "label", text: "Bộ Nhớ" },
									value: { tag: "t", class: "value", text: "0 B" }
								}},
		
								input: { tag: "span", class: ["item", "input"], child: {
									label: { tag: "t", class: "label", text: "Input" },
									value: { tag: "t", class: "value", text: "Bàn Phím" }
								}},
		
								output: { tag: "span", class: ["item", "output"], child: {
									label: { tag: "t", class: "label", text: "Output" },
									value: { tag: "t", class: "value", text: "Màn Hình" }
								}},

								disabled: { tag: "span", class: ["item", "disabled"], child: {
									label: { tag: "t", class: "label", text: "Ẩn Đề Bài" },
									value: { tag: "t", class: "value", text: "tắt" }
								}},

								canSubmit: { tag: "span", class: ["item", "canSubmit"], child: {
									label: { tag: "t", class: "label", text: "Nộp Bài" },
									value: { tag: "t", class: "value", text: "bật" }
								}}
							}}
						}},
	
						right: { tag: "span", class: "right", child: {
							lTitle: { tag: "t", class: "title", text: "ngôn ngữ" },
							languages: { tag: "div", class: "languages" },

							tTitle: { tag: "t", class: "title", text: "tag" },
							tags: { tag: "div", class: "tags" }
						}}
					}},
	
					info: { tag: "div", class: "info", child: {
						header: { tag: "div", class: "header", child: {
							content: { tag: "t", text: "Chi Tiết" },
							ranking: { tag: "t", text: "Xếp Hạng" },
						}},

						ranking: { tag: "div", class: "ranking", child: {
							spotlight: { tag: "div", class: "spotlight" },
							table: { tag: "table", child: {
								thead: { tag: "thead", child: {
									row: { tag: "tr", child: {
										rank: { tag: "th", text: "Xếp Hạng" },
										status: { tag: "th" },
										point: { tag: "th", text: "Điểm" },

										sp: { tag: "th", child: {
											text: { tag: "content", text: "SP" },
											tip: { tag: "tip", title: "Submission Point" }
										}},

										avatar: { tag: "th", text: "" },
										uName: { tag: "th", text: "Tên" },

										submitNth: { tag: "th", child: {
											text: { tag: "content", text: "Thứ Hạng Chấm" },
											tip: { tag: "tip", title: "Thứ hạng ghi nhận có kết quả chấm" }
										}},

										reSubmit: { tag: "th", text: "Chấm Lại" },

										remainTime: { tag: "th", child: {
											text: { tag: "content", text: "Thời Gian Còn" },
											tip: { tag: "tip", title: "Thời gian còn lại của kì thi sau khi nộp bài lên hệ thống" }
										}},

										time: { tag: "th", text: "Thời Gian Nộp" },
									}}
								}},

								tbody: { tag: "tbody" }
							}}
						}},

						description: { tag: "div", class: "description", child: {
							dTitle: { tag: "t", class: "title", text: "Nội Dung" },
							switch: { tag: "div", class: "switch", child: {
								markdown: { tag: "tag", class: "markdown", text: "markdown" },
								code: { tag: "tag", class: "code", text: "code" }
							}},
	
							content: { tag: "div", class: "content", child: {
								markdown: { tag: "div", class: "markdown" },
								editor: new Editor("none", {
									language: "md",
									readonly: true
								})
							}}
						}},
	
						tests: { tag: "div", class: "tests" }
					}}
				}}
			});

			this.problem.view.appendChild(this.viewer);
			this.viewer.content.info.description.switch.markdown.addEventListener("click", () => this.descSwitchView("markdown"));
			this.viewer.content.info.description.switch.code.addEventListener("click", () => this.descSwitchView("code"));
			this.viewer.content.info.header.content.addEventListener("click", () => this.mainSwitchView("content"));
			this.viewer.content.info.header.ranking.addEventListener("click", () => this.mainSwitchView("ranking"));
			this.viewer.content.header.left.buttons.enlarge.addEventListener("click", () => this.viewProblem(this.id, true));
			this.viewer.content.header.left.buttons.love.addEventListener("click", () => this.toggleLoved());

			// Register Panel Buttons / Viewer Buttons Handler
			this.reloadButton = this.panel.button("reload");
			this.reloadButton.onClick(() => this.updateLists());

			this.backButton = this.panel.button("close");
			this.backButton.onClick(() => this.closeViewer());
			this.backButton.hide();

			this.wavec = new wavec.Container(undefined, {
				icon: "book",
				title: "Đề Bài"
			});

			await this.updateLists();
		},

		itemMouseOver(t) {
			let id = t.dataset.id;
			clearTimeout(this.itemTimeout[id]);

			if (this.currentActiveItem)
				this.currentActiveItem.classList.remove("active");

			this.currentActiveItem = t;
			t.classList.add("active");
			t.classList.remove("hide");

			this.itemTimeout[id] = setTimeout(() => {
				t.classList.add("show");
			}, 200);
		},

		itemMouseOut(t) {
			let id = t.dataset.id;
			clearTimeout(this.itemTimeout[id]);
			t.classList.remove("show");

			this.itemTimeout[id] = setTimeout(() => {
				t.classList.add("hide");
			}, 200);
		},

		/**
		 * Render Item With Pager
		 * @param	{Object}			item
		 * @returns {HTMLSpanElement}
		 */
		__renderItem(item) {
			this.log("DEBG", "__renderItem(): Rendering", item);

			let t = makeTree("span", ["item", "hide"], {
				content: { tag: "div", class: "content", child: {
					thumbnail: new lazyload({ source: item.thumbnail, classes: "thumbnail" }),

					icons: { tag: "span", class: "icons", child: {
						attachment: {
							tag: "icon",
							class: "attachment",
							data: { icon: "file" },
							title: "Có Tệp Đính Kèm"
						},

						disabled: {
							tag: "icon",
							class: "disabled",
							data: { icon: "userCog" },
							title: "Chỉ Quản Trị Viên Mới Có Thể Nhìn Thấy"
						},

						noSubmit: {
							tag: "icon",
							class: "noSubmit",
							data: { icon: "ban" },
							title: "Không Cho Phép Nộp Bài"
						},

						status: { tag: "span", class: ["status", "judgeStatus"], text: "Chưa Nộp" },
					}},

					tags: { tag: "span", class: "tags", name: "tags" },
					point: { tag: "span", class: "point", text: item.point },
					pName: { tag: "t", class: "name", text: item.name },

					detail: { tag: "div", class: "detail", child: {
						left: { tag: "span", class: "left", name: "left", child: {
							pID: { tag: "t", class: "id", text: item.id },
							submitted: { tag: "t", class: "submitted", text: item.status.total }
						}},

						middle: { tag: "span", class: "middle", child: {
							modify: { tag: "t", class: "modify", text: (new Date(item.modify * 1000)).toLocaleDateString() },
							author: { tag: "t", class: "author", text: item.author ? item.author.name : "không rõ" },
						}},
	
						right: { tag: "span", class: "right", child: {
							loved: { tag: "t", class: "loved", text: item.loved.length || 0 },
						}},

						bar: { tag: "div", class: ["progressBar", "judgeStatusBar", "stackable"], child: {
							correct: { tag: "div", class: "bar", data: { color: "green" } },
							passed: { tag: "div", class: "bar", data: { color: "blue" } },
							accepted: { tag: "div", class: "bar", data: { color: "yellow" } },
							failed: { tag: "div", class: "bar", data: { color: "red" } },
							skipped: { tag: "div", class: "bar", data: { color: "gray" } },
							right: { tag: "t", class: "right", name: "right" }
						}}
					}}
				}},

				background: { tag: "div", class: "background" }
			});

			t.dataset.id = item.id;
			t.content.detail.bar.correct.style.width = `${(item.status.correct.length / item.status.total) * 100}%`;
			t.content.detail.bar.passed.style.width = `${(item.status.passed.length / item.status.total) * 100}%`;
			t.content.detail.bar.accepted.style.width = `${(item.status.accepted.length / item.status.total) * 100}%`;
			t.content.detail.bar.failed.style.width = `${(item.status.failed.length / item.status.total) * 100}%`;
			t.content.detail.bar.skipped.style.width = `${(item.status.skipped.length / item.status.total) * 100}%`;
			t.content.detail.bar.right.innerText = [
				`${item.status.correct.length} CR`,
				`${item.status.passed.length} PA`,
				`${item.status.accepted.length} AC`,
				`${item.status.failed.length} FA`,
				`${item.status.skipped.length} SK`,
			].join(" / ");

			if (item.attachment) {
				t.content.icons.attachment.style.display = null;
				t.content.icons.attachment.title = item.attachment;
			} else
				t.content.icons.attachment.style.display = "none";

			if (item.disabled)
				t.content.icons.disabled.style.display = null;
			else
				t.content.icons.disabled.style.display = "none";
	
			if (item.canSubmit)
				t.content.icons.noSubmit.style.display = "none";
			else
				t.content.icons.noSubmit.style.display = null;

			for (let key of Object.keys(item.status)) {
				let value = item.status[key];

				if (key === "total" || value.length === 0)
					continue;

				if (SESSION.username && value.includes(SESSION.username)) {
					t.content.icons.status.dataset.status = key;
					t.content.icons.status.innerText = twi.taskStatus[key];
				}

				let con = document.createElement("div");
				con.classList.add("container");

				let status = document.createElement("span");
				status.classList.add("status", "judgeStatus");
				status.dataset.status = key;
				status.innerText = twi.taskStatus[key];

				let sw = document.createElement("span");
				sw.classList.add("wrapper");
				sw.appendChild(status);

				let list = document.createElement("span");
				list.classList.add("list");

				con.append(sw, list);
				
				for (let i = 0; i < Math.min(value.length, 14); i++) {
					let img = new lazyload({
						source: `/api/avatar?u=${value[i]}`,
						classes: "user"
					}).container;

					img.setAttribute("username", value[i]);
					list.appendChild(img);
				}

				if (value.length - 14 > 0) {
					let m = document.createElement("span");
					m.classList.add("more");
					m.innerText = `${value.length - 14}+`;
					list.appendChild(m);
				}
				
				t.background.appendChild(con);
			}

			if (item.author)
				t.content.detail.middle.author.setAttribute("username", item.author.username);

			t.addEventListener("mouseenter", () => this.itemMouseOver(t));
			t.addEventListener("mouseleave", () => this.itemMouseOut(t));
			t.addEventListener("click", () => this.viewProblem(item.id, this.viewInDialog));

			return t;
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
						this.log("WARN", "Kì thi chưa bắt đầu");
						emptyNode(this.list);
						this.loaded = false;
						break;
					case 109:
						this.log("WARN", "Danh sách đề bài bị ẩn vì bạn chưa đăng nhập");
						emptyNode(this.list);
						this.loaded = true;
						break;
					default:
						this.log("ERRR", e);
						this.loaded = false;
						break;
				}

				this.panel.loading = false;
				return false;
			}

			this.pager.list = data;
			this.loaded = true;
			this.panel.loading = false;
		},

		descSwitchView(view) {
			this.viewer.content.info.description.switch.dataset.active = view;
			this.viewer.content.info.description.content.dataset.active = view;
		},

		mainSwitchView(view) {
			this.viewer.content.info.dataset.active = view;
		},

		parseTags(tags) {
			if (typeof tags === "string")
				tags = tags.replaceAll("\n", " ").split(" ");

			let html = "";

			for (let tag of tags) {
				let token = tag.split("#");

				if (token[0] === "")
					continue;

				if (token[1])
					html += `<tag style="--color: #${token[1]}">${token[0]}</tag>`
				else
					html += `<tag>${token[0]}</tag>`
			}

			return html;
		},

		createTestViewer(test, title) {
			let container = makeTree("div", "test", {
				header: { tag: "div", class: "header", child: {
					tTitle: { tag: "t", class: "title", text: title },
					copy: { tag: "icon", class: "copy", data: { icon: "clipboard" } }
				}},

				content: { tag: "ul", class: "textView" }
			});

			let lines = test.split("\n");
			for (let line of lines) {
				let ln = document.createElement("li");
				ln.innerText = line;
				container.content.appendChild(ln);
			}

			// Copy test data into clipboard
			container.header.copy.title = "Nhấn Để Sao Chép";
			container.header.copy.addEventListener("click", () => {
				navigator.clipboard.writeText(test);
				tooltip.show("Đã Sao Chép Vào Clipboard!", container.header.copy);
			});

			return container;
		},

		createSpotlight(item, rank = 1) {
			let container = makeTree("div", "item", {
				left: { tag: "span", class: "left", child: {
					rank: { tag: "span", class: "rank", child: {
						value: { tag: "t", class: "value", text: rank },
						status: { tag: "td", html: `<span class="judgeStatus" data-status="${item.status}">${twi.taskStatus[item.status]}</span>` },
					}},

					avatar: { tag: "span", class: "avatar", attribute: { username: item.username }, child: {
						image: new lazyload({ source: `/api/avatar?u=${item.username}`, classes: "image" }),
						indicator: { tag: "div", class: "onlineIndicator", data: { online: item.online } }
					}},

					user: { tag: "span", class: "user", attribute: { username: item.username }, child: {
						name: { tag: "t", class: "name", text: item.name || item.username },
						
					}},
				}},

				right: { tag: "span", class: "right", child: {
					top: { tag: "span", class: "top", child: {
						point: { tag: "span", class: "item", child: {
							label: { tag: "t", class: "label", text: "Điểm" },
							value: { tag: "t", class: "value", text: item.point }
						}},

						sp: { tag: "span", class: "item", child: {
							label: { tag: "t", class: "label", child: {
								text: { tag: "content", text: "SP" },
								tip: { tag: "tip", title: "Submission Point" }
							}},

							value: {
								tag: "t",
								class: "value",
								text: (item.sp && typeof item.sp.point === "number")
									? round(item.sp.point, 3)
									: ""
							}
						}},

						time: { tag: "span", class: "item", child: {
							label: { tag: "t", class: "label", text: "Thời Gian Nộp" },
							value: {
								tag: "t",
								class: "value",
								text: formatTime(time() - item.lastSubmit, { minimal: true, surfix: " trước" })
							}
						}}
					}},

					bottom: { tag: "span", class: "bottom", child: {
						submitNth: { tag: "span", class: ["item", item.statistic ? ["green", "yellow"][item.statistic.submitNth - 1] || "red" : "gray"], child: {
							label: { tag: "t", class: "label", child: {
								text: { tag: "content", text: "Thứ Hạng Chấm" },
								tip: { tag: "tip", title: "Thứ hạng ghi nhận có kết quả chấm" }
							}},

							value: { tag: "t", class: "value", child: {
								left: { tag: "t", text: item.statistic ? (item.statistic.submitNth || "") : "" },
								right: {
									tag: "t",
									text: (item.sp)
										? (- ((1 - item.sp.detail.submitNth) * item.point)).toFixed(3)
										: ""
								}
							}}
						}},

						reSubmit: { tag: "span", class: ["item", item.statistic ? ["green", "yellow"][item.statistic.reSubmit - 1] || "red" : "gray"], child: {
							label: { tag: "t", class: "label", text: "Chấm Lại" },
							value: { tag: "t", class: "value", child: {
								left: { tag: "t", text: item.statistic ? (item.statistic.reSubmit || "") : "" },
								right: {
									tag: "t",
									text: (item.sp)
										? (- ((1 - item.sp.detail.reSubmit) * item.point)).toFixed(3)
										: ""
								}
							}}
						}},

						remainTime: {
							tag: "span",
							class: [
								"item",
								(item.sp)
									? ((item.sp.detail.time > 0.8)
										? "green"
										: ((item.sp.detail.time > 0.6)
											? "yellow"
											: "red"))
									: "gray"
							],
							child: {
								label: { tag: "t", class: "label", child: {
									text: { tag: "content", text: "Thời Gian Còn" },
									tip: { tag: "tip", title: "Thời gian còn lại của kì thi sau khi nộp bài lên hệ thống" }
								}},

								value: { tag: "t", class: "value", child: {
									left: {
										tag: "t",
										text: (item.statistic && item.statistic.remainTime)
											? parseTime(item.statistic.remainTime).str
											: ""
									},

									right: {
										tag: "t",
										text: (item.sp)
											? (- ((1 - item.sp.detail.time) * item.point)).toFixed(3)
											: ""
									}
								}}
							}
						},
					}}
				}}
			});

			this.viewer.content.info.ranking.spotlight.appendChild(container);
		},

		async updateLoved() {
			let response;

			try {
				response = await myajax({
					url: "/api/contest/problems/loved",
					method: "GET",
					query: {
						id: this.id
					}
				});
			} catch(error) {
				this.log("ERRR", `Lỗi đã xảy ra khi lấy danh sách yêu thích đề bài ${this.id}:`, error);
				return;
			}

			if (SESSION && SESSION.username && response.data.includes(SESSION.username)) {
				this.viewer.content.header.left.buttons.love.dataset.active = true;
				this.viewer.content.header.left.buttons.love.dataset.triColor = "pink";
			} else {
				this.viewer.content.header.left.buttons.love.dataset.active = false;
				this.viewer.content.header.left.buttons.love.dataset.triColor = "blue";
			}

			emptyNode(this.viewer.content.header.right.loved.list);
			for (let user of response.data) {
				let avatar = new lazyload({
					source: `/api/avatar?u=${user}`,
					classes: "user"
				});

				avatar.container.setAttribute("username", user);
				this.viewer.content.header.right.loved.list.appendChild(avatar.container);
			}
		},

		async toggleLoved() {
			this.viewer.content.header.left.buttons.love.disabled = true;

			try {
				await myajax({
					url: "/api/contest/problems/loved",
					method: "POST",
					form: {
						id: this.id,
						token: API_TOKEN,
						loved: !(this.viewer.content.header.left.buttons.love.dataset.active === "true")
					}
				});
			} catch (error) {
				this.log("ERRR", `Lỗi đã xảy ra khi yêu thích đề bài ${this.id}:`, error);
				errorHandler(error);
			}

			await this.updateLoved();
			this.viewer.content.header.left.buttons.love.disabled = false;
		},

		async updateRanking() {
			let response = await myajax({
				url: "/api/contest/problems/rank",
				method: "GET",
				query: {
					id: this.id
				}
			});

			let data = response.data;
			this.log("DEBG", `updateRanking():`, data);

			let status = {
				correct: 0,
				passed: 0,
				accepted: 0,
				failed: 0,
				skipped: 0
			}

			emptyNode(this.viewer.content.info.ranking.spotlight);
			emptyNode(this.viewer.content.info.ranking.table.tbody);

			for (let i = 0; i < data.rank.length; i++) {
				let item = data.rank[i];
				status[item.status]++;

				if (i === 0 || item.username === SESSION.username)
					this.createSpotlight(item, i + 1);

				let row = makeTree("tr", "row", {
					rank: { tag: "td", text: `#${(i + 1)}` },
					status: { tag: "td", html: `<span class="judgeStatus" data-status="${item.status}">${twi.taskStatus[item.status]}</span>` },
					point: { tag: "td", text: item.point.toFixed(2) },

					sp: {
						tag: "td",
						text: (item.sp && typeof item.sp.point === "number")
							? item.sp.point.toFixed(3)
							: ""
					},

					avatar: { tag: "td", attribute: { username: item.username }, child: {
						image: new lazyload({ source: `/api/avatar?u=${item.username}`, classes: "avatar" })
					}},

					uName: { tag: "td", text: item.name || item.username, attribute: { username: item.username } },
					submitNth: { tag: "td", text: item.statistic ? (item.statistic.submitNth || "") : "" },
					reSubmit: { tag: "td", text: item.statistic ? (item.statistic.reSubmit || "") : "" },

					remainTime: {
						tag: "td",
						text: (item.statistic && item.statistic.remainTime)
							? parseTime(item.statistic.remainTime).str
							: ""
					},
					
					time: {
						tag: "td",
						text: formatTime(time() - item.lastSubmit, { minimal: true, surfix: " trước" })
					}
				});

				this.viewer.content.info.ranking.table.tbody.appendChild(row);
			}

			this.viewer.content.header.right.status.detail.correct.value.innerText = status.correct + " bài";
			this.viewer.content.header.right.status.detail.passed.value.innerText = status.passed + " bài";
			this.viewer.content.header.right.status.detail.accepted.value.innerText = status.accepted + " bài";
			this.viewer.content.header.right.status.detail.failed.value.innerText = status.failed + " bài";
			this.viewer.content.header.right.status.detail.skipped.value.innerText = status.skipped + " bài";

			this.viewer.content.header.right.status.bar.correct.style.width = `${(status.correct / data.rank.length) * 100}%`;
			this.viewer.content.header.right.status.bar.passed.style.width = `${(status.passed / data.rank.length) * 100}%`;
			this.viewer.content.header.right.status.bar.accepted.style.width = `${(status.accepted / data.rank.length) * 100}%`;
			this.viewer.content.header.right.status.bar.failed.style.width = `${(status.failed / data.rank.length) * 100}%`;
			this.viewer.content.header.right.status.bar.skipped.style.width = `${(status.skipped / data.rank.length) * 100}%`;
		},

		async updateViewer(id, loadingProgress = false) {
			if (loadingProgress)
				if (this.problem.view.contains(this.viewer))
					this.panel.loading = true;
				else
					this.wavec.loading = true;

			let response = await myajax({
				url: "/api/contest/problems/get",
				method: "GET",
				query: { id: id }
			});

			let data = response.data;
			this.log("DEBG", "updateViewer():", data);

			// Update Header
			this.panel.title = `Đề Bài - ${data.name}`;
			this.wavec.set({ title: `đề bài - ${data.name}` });
			this.viewer.backgroundWrapper.background.source = data.thumbnail;
			this.viewer.backgroundWrapper.background.load();
			this.viewer.content.header.left.pTitle.innerText = data.name;
			this.viewer.content.header.left.point.innerHTML = `<b>${data.point}</b> điểm`;
			this.viewer.content.header.left.buttons.love.disabled = !SESSION.username;

			// Only show author details when author is actually present
			// in problem data
			if (data.author) {
				this.viewer.content.header.left.author.avatar.source = `/api/avatar?u=${data.author.username}`;
				this.viewer.content.header.left.author.avatar.load();
				this.viewer.content.header.left.author.details.uName.innerText = data.author.name;
				this.viewer.content.header.left.author.details.uName.setAttribute("username", data.author.username);
				this.viewer.content.header.left.author.details.updated.innerHTML = `đã chỉnh sửa <b>${(new Date(data.modify * 1000)).toLocaleString()}</b>`;
				this.viewer.content.header.left.author.style.display = null;
			} else
				this.viewer.content.header.left.author.style.display = "none";

			this.viewer.content.details.left.items.pID.value.innerText = data.id;
			this.viewer.content.details.left.items.runtime.value.innerText = `${data.time} giây`;
			this.viewer.content.details.left.items.memory.value.innerText = convertSize(data.memory);
			this.viewer.content.details.left.items.input.value.innerText = data.type.input || "không rõ";
			this.viewer.content.details.left.items.output.value.innerText = data.type.output || "không rõ";
			this.viewer.content.details.left.items.disabled.value.innerText = data.disabled ? "bật" : "tắt";
			this.viewer.content.details.left.items.canSubmit.value.innerText = data.canSubmit ? "bật" : "tắt";
			this.viewer.content.details.right.languages.innerText = data.accept.join(", ");
			this.viewer.content.details.right.tags.innerHTML = this.parseTags(data.tags);

			// Update Description
			let mdNode = md2html.parse(data.description);
			this.viewer.content.info.description.content.replaceChild(mdNode, this.viewer.content.info.description.content.markdown);
			this.viewer.content.info.description.content.markdown = mdNode;
			this.viewer.content.info.description.content.editor.value = data.description;
			this.descSwitchView("markdown");

			emptyNode(this.viewer.content.info.tests);
			for (let ti = 0; ti < data.test.length; ti++) {
				let item = data.test[ti];
				let container = makeTree("div", "testContainer", {
					tTitle: { tag: "t", class: "title", text: `ví dụ ${ti + 1}` },
					content: { tag: "div", class: "content", child: {
						input: this.createTestViewer(item.input || "", data.type.input),
						output: this.createTestViewer(item.output || "", data.type.output)
					}}
				})

				this.viewer.content.info.tests.appendChild(container);
			}

			if (loadingProgress)
				if (this.problem.view.contains(this.viewer))
					this.panel.loading = false;
				else
					this.wavec.loading = false;
		},

		async viewProblem(id, viewInDialog = false) {
			if (this.id === id)
				if (viewInDialog) {
					if (this.problem.view.contains(this.viewer))
						this.wavec.content = this.viewer;

					this.viewer.content.header.left.buttons.enlarge.disabled = true;
					this.listContainer.classList.remove("hide");
					this.wavec.show();
					return;
				} else {
					if (!this.problem.view.contains(this.viewer))
						this.problem.view.appendChild(this.viewer);

					this.viewer.content.header.left.buttons.enlarge.disabled = false;
					this.backButton.show();
					this.listContainer.classList.add("hide");
					return;
				}

			this.log("INFO", "Opening problem", {
				color: flatc("yellow"),
				text: id
			});

			this.id = id;
			this.panel.title = "Đang Tải";
			this.backButton.show();

			if (viewInDialog) {
				if (this.problem.view.contains(this.viewer))
					this.wavec.content = this.viewer;

				this.viewer.content.header.left.buttons.enlarge.disabled = true;
				this.wavec.loading = true;
				this.wavec.show();
			} else {
				if (!this.problem.view.contains(this.viewer))
					this.problem.view.appendChild(this.viewer);

				this.viewer.content.header.left.buttons.enlarge.disabled = false;
				this.panel.loading = true;
				this.listContainer.classList.add("hide");
			}

			await this.updateViewer(id);
			await this.updateRanking();
			await this.updateLoved();

			if (viewInDialog) {
				this.mainSwitchView("ranking");
				this.wavec.loading = false;
			} else {
				this.mainSwitchView("content");
				this.panel.loading = false;
			}
		},

		closeViewer() {
			this.listContainer.classList.remove("hide");
			this.panel.title = "Đề bài";
			this.backButton.hide();
		},
	},

	submit: {
		priority: 3,

		panelContainer: $("#submitPanel"),
		container: $("#submitContainer"),
		dropzone: $("#submitDropzone"),
		input: $("#submitInput"),
		queue: $("#submitQueue"),

		panel: TWIPanel.prototype,
		reloadButton: null,

		/** @type {Scrollable} */
		scrollable: null,

		uploadAtOnce: 2,
		uploadQueue: [],
		uploading: 0,
		cooldown: 1000,

		init() {
			if (!SESSION || !SESSION.username) {
				this.panelContainer.style.display = "none";
				return false;
			}

			this.dropzone.addEventListener("dragenter", (e) => {
				e.stopPropagation();
				e.preventDefault();
				e.target.classList.add("drag");
			});

			this.dropzone.addEventListener("dragleave", (e) => {
				e.stopPropagation();
				e.preventDefault();
				e.target.classList.remove("drag");
			});

			this.dropzone.addEventListener("dragover", (e) => {
				e.stopPropagation();
				e.preventDefault();
				e.dataTransfer.dropEffect = "copy";
				e.target.classList.add("drag");
			});

			this.panel = new TWIPanel(this.panelContainer);
			this.reloadButton = this.panel.button("reload");
			this.reloadButton.onClick(() => this.reset());
			this.scrollable = new Scrollable(this.container, { content: this.queue });

			this.dropzone.addEventListener("drop", (e) => this.fileSelect(e));
			this.input.addEventListener("change", (e) => this.fileSelect(e, "input"));
			this.panel.title = "Nộp bài";
		},

		reset() {
			for (let i = 0; i < this.uploadQueue.length; i++)
				if (!this.uploadQueue[i].handling) {
					this.queue.removeChild(this.uploadQueue[i].node);
					this.uploadQueue.splice(i, 1);
				}
		},

		fileSelect(e, from = "drop") {
			if (from === "drop") {
				e.stopPropagation();
				e.preventDefault();
				e.target.classList.remove("drag");
			}

			let files = (from === "drop")
				? e.dataTransfer.files
				: e.target.files;

			for (let file of files)
				this.addQueue(file);
		},
		
		/**
		 * Add File To Upload Queue
		 * @param	{File}	file 
		 */
		addQueue(file) {
			let node = makeTree("div", "item", {
				header: { tag: "div", class: "header", child: {
					fName: { tag: "t", class: "name", text: file.name },
					status: { tag: "t", class: "status", text: "Trong Hàng Chờ" }
				}},

				detail: { tag: "div", class: "detail", child: {
					progress: { tag: "span", class: "progressBar", child: {
						bar: { tag: "div", class: "bar" }
					}},

					value: { tag: "span", class: "value", text: "0B" },
					size: { tag: "span", class: "size", text: convertSize(file.size) }
				}}
			});

			node.dataset.status = "wait";
			this.queue.appendChild(node);
			this.uploadQueue.push({
				file,
				node,
				handing: false
			});

			this.scrollable.toBottom();
			this.updateQueue();
		},

		updateQueue() {
			if (this.uploading >= this.uploadAtOnce)
				return;

			for (let i = 0; i < this.uploadQueue.length; i++) {
				let item = this.uploadQueue[i];

				if (item.handing)
					continue;

				item.handing = true;
				this.upload(item.file, item.node)
					.then(() => {
						this.uploadQueue.splice(i, 1);
						this.updateQueue();
					});

				break;
			}
		},

		/**
		 * Upload File
		 * @param	{File}			file
		 * @param	{HTMLElement}	node
		 */
		async upload(file, node) {
			this.log("INFO", "Uploading", {
				color: flatc("yellow"),
				text: file.name
			});

			node.dataset.status = "uploading";
			node.header.status.innerText = "Đang Nộp";
			await delayAsync(this.cooldown);

			let response
			
			try {
				response = await myajax({
					url: "/api/contest/upload",
					method: "POST",
					form: {
						"token": API_TOKEN,
						file
					},
					onUpload: (e) => {
						node.detail.value.innerText = convertSize(e.loaded);
						node.detail.progress.bar.style.width = `${(e.loaded / e.total) * 100}%`;
					}
				});
			} catch (error) {
				this.log("ERRR", {
					color: flatc("yellow"),
					text: file.name
				}, error);

				let e = parseException(error);
				node.dataset.status = "error";
				node.header.status.innerText = error.data.description || e.description;

				return false;
			}

			node.dataset.status = "complete";
			node.header.status.innerText = "Đã Nộp";
			this.log("OKAY", "Uploaded", {
				color: flatc("yellow"),
				text: file.name
			});

			sounds.notification();
		}
	},

	timer: {
		priority: 3,
		enabled: false,

		container: HTMLElement.prototype,
		navProgress: htmlToElement(`<span class="bar"></span>`),
		tooltip: navbar.Tooltip.prototype,
		navTimer: null,

		timeData: {},
		timeout: null,
		subWindow: null,
		window:  navbar.SubWindow.prototype,
		currentState: null,
		tickAnimation: null,
		currentSecond: null,
		autoCorrect: true,

		interval: 1,

		/**
		 * Time Difference between Client and Server
		 * @type {Number}
		 */
		delta: 0,

		showMs: false,
		last: 0,

		async init(set) {
			set({ p: 0, d: `Setting Up Timer Component` });
			this.container = document.createElement("span");
			this.container.classList.add("component", "timer");
			this.navTimer = createTimer(0, { style: "small" });

			let icon = document.createElement("icon");
			icon.dataset.icon = "clock";
			
			let progressBar = document.createElement("div");
			progressBar.classList.add("progressBar");
			progressBar.appendChild(this.navProgress);

			this.container.append(icon, this.navTimer.group, progressBar);

			this.tooltip = new navbar.Tooltip(this.container, {
				title: "timer",
				description: "thời gian của kì thì"
			});

			let click = new navbar.Clickable(this.container);
			this.window = new navbar.SubWindow(this.container);
			this.window.color = "blue";
			
			this.subWindow = makeTree("div", "timerDetails", {
				progress: { tag: "div", class: "progress", child: {
					start: { tag: "span", class: ["point", "start"], child: {
						value: { tag: "t", class: "value", text: "00:00:00" }	
					}},

					during: { tag: "span", class: "progressBar", child: {
						bar: { tag: "div", class: "bar", data: { color: "green" } }
					}},

					end: { tag: "span", class: ["point", "end"], child: {
						value: { tag: "t", class: "value", text: "00:00:00" }
					}},

					offset: { tag: "span", class: "progressBar", child: {
						bar: { tag: "div", class: "bar", data: { color: "yellow" } }
					}},

					ticker: { tag: "div", class: "ticker", child: {
						inner: { tag: "div", class: "inner" }
					}}
				}},

				timer: { tag: "div", class: "timer", child: {
					time: { tag: "span", class: "time", child: {
						value: { tag: "div", class: "value", child: {
							h: { tag: "h", class: "seg", text: "00" },
							s1: { tag: "sep" },
							m: { tag: "m", class: "seg", text: "00" },
							s2: { tag: "sep" },
							s: { tag: "s", class: "seg", text: "00" },
							dot: { tag: "dot" },
							ms: { tag: "ms", class: "seg", text: "000" }
						}},

						status: { tag: "span", class: "status", text: "Đang Khởi Động" },
					}},
					
					bottom: { tag: "div", class: "bottom", child: {
						mid: { tag: "span" }
					}},
				}},

				note: createNote()
			});

			this.window.content = this.subWindow;
			click.setHandler(() => this.window.toggle());
			navbar.insert({ container: this.container }, "right");
			onUpdateServerData((s) => this.setDelta(s.TIME - time()));
			twi.hash.onUpdate("config.timer", () => this.updateData(true));

			this.window.onToggle((a) => {
				if (!a)
					this.tickAnimation = null;
			});
			
			set({ p: 0, d: `Starting Timer` });
			this.setDelta();
			this.updateData(true);
		},

		set({
			state,
			time,
			progress
		} = {}) {
			if (typeof time === "number") {
				let t = parseTime(time);
				this.navTimer.set({ time: t });
				
				if (this.window.showing) {
					if (t.h > 0) { 
						this.subWindow.timer.time.value.h.style.display = null;
						this.subWindow.timer.time.value.s1.style.display = null;
						this.subWindow.timer.time.value.h.innerText = pleft(t.h, 2);
					} else {
						this.subWindow.timer.time.value.s1.style.display = "none";
						this.subWindow.timer.time.value.h.style.display = "none";
					}
		
					if (t.m > 0 || t.h > 0) {
						this.subWindow.timer.time.value.s2.style.display = null;
						this.subWindow.timer.time.value.m.style.display = null;
						this.subWindow.timer.time.value.m.innerText = pleft(t.m, 2);
					} else {
						this.subWindow.timer.time.value.s2.style.display = "none";
						this.subWindow.timer.time.value.m.style.display = "none";
					}
		
					this.subWindow.timer.time.value.s.innerText = pleft(t.s, 2);
	
					if (!this.tickAnimation) {
						this.tickAnimation = this.subWindow.progress.ticker.inner.getAnimations();
						this.tickAnimation = this.tickAnimation[this.tickAnimation.length - 1];
					}
	
					if (this.tickAnimation && t.s !== this.currentSecond) {
						this.tickAnimation.finish();
						this.tickAnimation.play();
						this.currentSecond = t.s;
					}
	
					if (this.showMs) {
						this.subWindow.timer.time.value.dot.style.display = null;
						this.subWindow.timer.time.value.ms.style.display = null;
						this.subWindow.timer.time.value.ms.innerText = pleft(t.ms, 3);
					} else {
						this.subWindow.timer.time.value.dot.style.display = "none";
						this.subWindow.timer.time.value.ms.style.display = "none";
					}
				}
			}

			if (typeof state === "string" && this.currentState !== state) {
				this.subWindow.timer.time.status.dataset.status = state;

				switch (state) {
					case "begin":
						if (this.window.showing) {
							this.subWindow.progress.during.bar.style.width = `0%`;
							this.subWindow.progress.offset.bar.style.width = `0%`;
							this.subWindow.timer.time.status.innerText = `Kì Thi Sắp Bắt Đầu`;
						}

						this.navProgress.dataset.color = "blue";
						break;

					case "during":
						if (this.window.showing) {
							this.subWindow.progress.during.bar.style.width = `${progress || 0}%`;
							this.subWindow.progress.offset.bar.style.width = `0%`;
							this.subWindow.timer.time.status.innerText = `Thời Gian Làm Bài`;
						}

						this.navProgress.dataset.color = "green";
						break;

					case "offset":
						if (this.window.showing) {
							this.subWindow.progress.during.bar.style.width = `100%`;
							this.subWindow.progress.offset.bar.style.width = `${progress || 0}%`;
							this.subWindow.timer.time.status.innerText = `Thời Gian Bù Giờ`;
						}

						this.navProgress.dataset.color = "yellow";
						this.navProgress.dataset.blink = "grow";
						break;

					case "ended":
						if (this.window.showing) {
							this.subWindow.progress.during.bar.style.width = `100%`;
							this.subWindow.progress.offset.bar.style.width = `100%`;
							this.subWindow.timer.time.status.innerText = `ĐÃ HẾT THỜI GIAN LÀM BÀI`;
						}

						this.navProgress.dataset.color = "red";
						this.navProgress.dataset.blink = "fade";
						break;
				}
		
				if (this.window.showing)
					this.currentState = state;
			}

			if (typeof progress === "number") {
				this.navProgress.style.width = `${progress}%`;

				switch (state) {
					case "during":
						if (this.window.showing)
							this.subWindow.progress.during.bar.style.width = `${progress}%`;
						break;
			
					case "offset":
						if (this.window.showing)
							this.subWindow.progress.offset.bar.style.width = `${progress}%`;

						this.navProgress.dataset.blinkFast = (progress < 20);
						break;
				}
			}
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
				this.log("INFO", "Timer Disabled: not in contest mode");
				this.container.style.display = "none";

				return;
			}
			
			this.enabled = true;
			this.timeData = data;
			this.container.style.display = null;

			let start = new Date(this.timeData.start * 1000);
			this.subWindow.progress.start.value.innerText = start.toLocaleTimeString();

			let end = new Date((this.timeData.start + this.timeData.during) * 1000);
			this.subWindow.progress.end.value.innerText = end.toLocaleTimeString();

			if (reload) {
				this.last = 0;
				this.updater();
			}
		},

		async doCorrectTime(bool) {
			this.autoCorrect = bool;

			if (this.initialized) {
				if (bool)
					await updateServerData();
				else
					this.setDelta(0);
			}
		},

		setDelta(delta) {
			if (!delta)
				delta = this.delta;

			this.log("INFO", `Δt = ${delta}`);

			if (this.autoCorrect)
				this.delta = delta;
			else
				this.delta = 0;

			if (this.delta !== 0) {
				this.subWindow.note.group.style.display = null;
				this.subWindow.note.set({
					level: "warning",
					message:
						`
							Thời gian trên máy của bạn <b>${delta > 0 ? "trễ" : "sớm"}</b> hơn so với máy chủ <b>${Math.abs(delta).toFixed(3)} giây!</b>
							<br>Đồng hồ đã được tinh chỉnh để phù hợp với thời gian của máy chủ!
						`
				});
			} else
				this.subWindow.note.group.style.display = "none";
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

			this.timeUpdate();
		},

		timeUpdate() {
			if (!this.enabled)
				return;

			let beginTime = this.timeData.start;
			let duringTime = this.timeData.during;
			let offsetTime = this.timeData.offset;
			let t = beginTime - (time() + this.delta) + duringTime;

			if (t > duringTime) {
				t -= duringTime;
				if (this.last === 0)
					this.last = t;

				this.set({
					state: "begin",
					time: t,
					progress: ((t) / this.last) * 100
				});
			} else if (t > 0) {
				// if (!twi.problems.loaded) {
				// 	this.log("INFO", "Reloading problems list and public files list");
					
				// }

				this.set({
					state: "during",
					time: t,
					progress: 100 - (t / duringTime) * 100
				});
			} else if (t > -offsetTime) {
				t += offsetTime;

				this.set({
					state: "offset",
					time: t,
					progress: 100 - (t / offsetTime) * 100
				});
			} else {
				t += offsetTime;

				this.set({
					state: "ended",
					time: t,
					progress: 100
				});
			}
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
			twi.userSettings.admin.localVersion.content = `Phiên Bản Hiện Tại: <br>${localVersion}</br>`;

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
				this.log("WARN", "Error Checking for update:", error);
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

		sliderStep: {
			1: 0.5,		2: 1,		3: 2,		4: 10,
			5: 60,		6: 120,		7: 240,		8: 300,
			9: 600,		10: 3600,
			11: false
		},

		ratelimitWarning: {
			level: "warning",
			windowTitle: "Cảnh Báo",
			title: "Cảnh Báo",
			message: "Thời gian làm mới quá nhỏ!",
			description: "Việc đặt giá trị này quá nhỏ sẽ làm cho máy chủ hiểu nhầm rằng bạn đang tấn công máy chủ và sẽ chặn bạn trong một khoảng thời gian nhất định!",
			buttonList: {
				cancel: { color: "blue", text: "Bấm Lộn! Trả Về Cũ Đi!" },
				ignore: { color: "red", text: "Máy Chủ Là Gì? Có Ăn Được Không?" }
			}
		},

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

		display: {
			group: smenu.Group.prototype,

			init() {
				this.group = new smenu.Group({ label: "hiển thị", icon: "window" });

				let ux = new smenu.Child({ label: "Giao Diện" }, this.group);
				
				new smenu.components.Checkbox({
					label: "Chế độ ban đêm",
					color: "pink",
					save: "display.nightmode",
					defaultValue: SERVER.clientSettings.nightmode,
					onChange: (v) => twi.darkmode.set(v)
				}, ux);

				new smenu.components.Checkbox({
					label: "Hoạt ảnh",
					color: "blue",
					save: "display.transition",
					defaultValue: SERVER.clientSettings.transition,
					onChange: (v) => document.body.classList[v ? "remove" : "add"]("disableTransition")
				}, ux);

				let other = new smenu.Child({ label: "Khác" }, this.group);

				new smenu.components.Checkbox({
					label: "Thông báo",
					color: "pink",
					save: "display.notification",
					defaultValue: false,
					disabled: true
				}, other);

				new smenu.components.Checkbox({
					label: "Super Triangles!",
					color: "blue",
					save: "display.triangles",
					defaultValue: (twi.performance.score > 30),
					disabled: false
				}, other);
			}
		},

		sounds: {
			group: smenu.Group.prototype,

			init() {
				this.group = new smenu.Group({ label: "âm thanh", icon: "volume" });
	
				let status = new smenu.Child({ label: "Trạng Thái" }, this.group);
				let loadDetail = new smenu.components.Text({ content: "Chưa khởi tạo âm thanh" });
				status.insert(loadDetail, -3);

				twi.sounds.attach(({ c } = {}) => {
					if (typeof c === "string")
						loadDetail.content = c
				});

				let volume = new smenu.components.Slider({
					label: "Âm lượng",
					color: "blue",
					save: "sounds.volume",
					min: 0,
					max: 100,
					unit: "%",
					defaultValue: 60
				});

				status.insert(volume, -1);
				volume.onInput((v) => {
					sounds.volume = (v / 100);
					volume.set({ color: (v >= 80) ? "red" : "blue" })
				});
	
				let cat = new smenu.Child({ label: "Loại" }, this.group);
				let mouseOver = new smenu.components.Checkbox({
					label: "Mouse Over",
					color: "blue",
					save: "sounds.mouseOver",
					defaultValue: true,
					onChange: (v) => sounds.enable.mouseOver = v
				}, cat);
	
				let btnClick = new smenu.components.Checkbox({
					label: "Button Click/Toggle",
					color: "blue",
					save: "sounds.btnClick",
					defaultValue: true,
					onChange: (v) => sounds.enable.btnClick = v
				}, cat);
	
				let panelToggle = new smenu.components.Checkbox({
					label: "Panel Show/Hide",
					color: "blue",
					save: "sounds.panelToggle",
					defaultValue: true,
					onChange: (v) => sounds.enable.panelToggle = v
				}, cat);
	
				let others = new smenu.components.Checkbox({
					label: "Others",
					color: "blue",
					save: "sounds.others",
					defaultValue: true,
					onChange: (v) => sounds.enable.others = v
				}, cat);
	
				let notification = new smenu.components.Checkbox({
					label: "Notification",
					color: "blue",
					save: "sounds.notification",
					defaultValue: true,
					onChange: (v) => sounds.enable.notification = v
				}, cat);
	
				let master = new smenu.components.Checkbox({
					label: "Bật âm thanh",
					color: "pink",
					save: "sounds.master",
					defaultValue: SERVER.clientSettings.sounds,
					onChange: async (v) => {
						sounds.enable.master = v;
						mouseOver.set({ disabled: !v });
						btnClick.set({ disabled: !v });
						panelToggle.set({ disabled: !v });
						others.set({ disabled: !v });
						notification.set({ disabled: !v });

						if (v)
							sounds.soundToggle(sounds.sounds.checkOn);
	
						if (twi.initialized && !sounds.initialized)
							await twi.sounds.init();
					}
				});

				status.insert(master, -2);
			}
		},

		ranking: {
			group: smenu.Group.prototype,

			init() {
				this.group = new smenu.Group({ label: "xếp hạng", icon: "chart" });

				let general = new smenu.Child({ label: "Chung" }, this.group);

				let updateRank = new smenu.components.Slider({
					label: "Thời gian cập nhật xếp hạng",
					color: "blue",
					save: "ranking.updateRank",
					min: 1,
					max: 11,
					unit: "giây",
					defaultValue: SERVER.clientSettings.rankUpdate,
					valueStep: this.super.sliderStep
				}, general);

				updateRank.onInput((v) => updateRank.set({ color: (v <= 2) ? "red" : "blue" }));
				updateRank.onChange(async (v, e) => {
					if (v < 3 && e.isTrusted)
						if (await popup.show(this.super.ratelimitWarning) === "cancel") {
							updateRank.set({ value: 3 });
							return;
						}

					if (this.super.sliderStep[v] === false)
						twi.rank.enabled = false;
					else {
						twi.rank.enabled = true;
						twi.rank.updateDelay = this.super.sliderStep[v];
					}
				});

				let display = new smenu.Child({ label: "Hiển Thị" }, this.group);

				let type = new smenu.components.Choice({
					label: "Kiểu Bảng",
					choice: {
						full: { icon: "list", title: "Đầy Đủ" },
						compact: { icon: "listC", title: "Thu Gọn" }
					},
					defaultValue: "full",
					save: "ranking.type",
					onChange: (v) => twi.rank.container.dataset.type = v
				}, display);
			}
		},

		problemViewer: {
			group: smenu.Group.prototype,

			init() {
				this.group = new smenu.Group({ label: "đề bài", icon: "book" });

				let general = new smenu.Child({ label: "Chung" }, this.group);
				new smenu.components.Checkbox({
					label: "Xem đề bài trong cửa sổ mở rộng",
					color: "blue",
					save: "others.popupProblem",
					defaultValue: false,
					onChange: (v) => twi.problems.viewInDialog = v
				}, general);
			}
		},

		clock: {
			group: smenu.Group.prototype,

			init() {
				this.group = new smenu.Group({ label: "thời gian", icon: "clock" });

				let general = new smenu.Child({ label: "Chung" }, this.group);

				new smenu.components.Checkbox({
					label: "Hiện MilliSecond",
					color: "blue",
					save: "clock.showMs",
					defaultValue: SERVER.clientSettings.showMs,
					onChange: (v) => twi.timer.toggleMs(v)
				}, general);

				new smenu.components.Checkbox({
					label: "Tự động chỉnh giờ chuẩn với máy chủ",
					color: "pink",
					save: "clock.autoCorrect",
					defaultValue: true,
					onChange: async (v) => await twi.timer.doCorrectTime(v)
				}, general);
			}
		},

		submit: {
			group: smenu.Group.prototype,

			init() {
				this.group = new smenu.Group({ label: "nộp bài", icon: "upload" });

				let general = new smenu.Child({ label: "Chung" }, this.group);

				let uploadAtOnce = new smenu.components.Slider({
					label: "Số bài tải lên cùng lúc",
					color: "blue",
					save: "submit.uploadAtOnce",
					min: 1,
					max: 10,
					unit: "bài",
					defaultValue: 2
				}, general);

				uploadAtOnce.onInput((v) => uploadAtOnce.set({ color: (v >= 5) ? "red" : "blue" }));
				uploadAtOnce.onChange((v) => twi.submit.uploadAtOnce = v);

				let cooldown = new smenu.components.Slider({
					label: "Thời gian nghỉ",
					color: "blue",
					save: "submit.cooldown",
					min: 0,
					max: 10,
					unit: "giây",
					defaultValue: 2
				}, general);

				cooldown.onInput((v) => cooldown.set({ color: (v <= 1) ? "red" : "blue" }));
				cooldown.onChange((v) => twi.submit.cooldown = (v * 1000));
			}
		},

		others: {
			group: smenu.Group.prototype,

			init() {
				this.group = new smenu.Group({ label: "khác", icon: "circle" });

				let update = new smenu.Child({ label: "Làm Mới" }, this.group);
				let sliderStep = this.super.sliderStep;
				let ratelimitWarning = this.super.ratelimitWarning;

				let updateLogs = new smenu.components.Slider({
					label: "Thời gian cập nhật nhật kí",
					color: "blue",
					save: "others.logsUpdate",
					min: 1,
					max: 11,
					unit: "giây",
					defaultValue: SERVER.clientSettings.logsUpdate,
					valueStep: sliderStep
				}, update);

				updateLogs.onInput((v) => updateLogs.set({ color: (v <= 2) ? "red" : "blue" }));
				updateLogs.onChange(async (v, e) => {
					if (v < 3 && e.isTrusted)
						if (await popup.show(ratelimitWarning) === "cancel") {
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

				let updateHash = new smenu.components.Slider({
					label: "Thời gian cập nhật dữ liệu và cài đặt",
					color: "blue",
					save: "others.hashUpdate",
					min: 1,
					max: 11,
					unit: "giây",
					defaultValue: SERVER.clientSettings.hashUpdate,
					valueStep: sliderStep
				}, update);

				updateHash.onInput((v) => updateHash.set({ color: (v <= 2) ? "red" : "blue" }));
				updateHash.onChange(async (v, e) => {
					if (v < 3 && e.isTrusted)
						if (await popup.show(ratelimitWarning) === "cancel") {
							updateHash.set({ value: 3 });
							return;
						}

					if (v === 11)
						if (await popup.show({
							level: "warning",
							windowTitle: "Cảnh Báo",
							title: "Cảnh Báo",
							message: "Tắt tự động cập nhật dữ liệu và cài đặt",
							description: "Việc này sẽ tắt tự động cập nhật thông báo, thời gian, danh sách đề bài, ...<br>Bạn có chắc muốn tắt tính năng này không?",
							buttonList: {
								cancel: { color: "blue", text: "Bấm Lộn 😅 Trả Về Cũ Đi!" },
								ignore: { color: "red", text: "TẮT! TẮT HẾT!" }
							}
						}) === "cancel") {
							updateHash.set({ value: 3 });
							return;
						}

					if (sliderStep[v] === false)
						twi.hash.enabled = false;
					else {
						twi.hash.enabled = true;
						twi.hash.updateDelay = sliderStep[v];
					}
				});
			}
		},

		admin: {
			group: smenu.Group.prototype,

			async init() {
				if (SESSION.id !== "admin") {
					this.log("INFO", "Current Session Does Not Have Admin Privileges. Admin Features Will Not Be ENABLED!");
					return false;
				}

				this.group = new smenu.Group({ icon: "userCog", label: "quản trị" });

				this.update();
				this.settings();
				this.data();
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

			settings() {
				this.settingsChild = new smenu.Child({ label: "Cài Đặt" }, this.group);

				let controlPanelButton = new smenu.components.Button({
					label: "Admin Control Panel",
					color: "blue",
					icon: "arrowLeft",
					complex: true
				}, this.settingsChild);

				this.controlPanel = new smenu.Panel(undefined, { size: "large" });
				this.controlPanel.setToggler(controlPanelButton);
				this.controlPanel.content("iframe:/config.php");
				twi.darkmode.onToggle((enabled) => this.controlPanel.iframe.contentDocument.body.classList[enabled ? "add" : "remove"]("dark"));

				let accountsButton = new smenu.components.Button({
					label: "Quản Lí Tài Khoản",
					color: "blue",
					icon: "arrowLeft",
					complex: true
				}, this.settingsChild);

				this.accountsPanel = new smenu.Panel(undefined, { size: "large" });
				this.accountsPanel.setToggler(accountsButton);
				this.accountsPanel.content("iframe:/account.php");
				twi.darkmode.onToggle((enabled) => this.accountsPanel.iframe.contentDocument.body.classList[enabled ? "add" : "remove"]("dark"));
			},

			dataChild: smenu.Child.prototype,

			data() {
				this.dataChild = new smenu.Child({ label: "Dữ Liệu" }, this.group);

				new smenu.components.Button({
					label: "Xóa Cache",
					color: "red",
					icon: "trash",
					complex: true,
					onClick: async () => {
						try {
							await myajax({
								url: "/api/delete",
								method: "POST",
								form: {
									type: "cache",
									token: API_TOKEN
								}
							});
						} catch(e) {
							errorHandler(e);
							return;
						}
					}
				}, this.dataChild);

				new smenu.components.Button({
					label: "Xóa Toàn Bộ Dữ Liệu Bài Làm",
					color: "red",
					icon: "trash",
					complex: true,
					onClick: async () => {
						if (await popup.show({
							level: "warning",
							windowTitle: "Xác Nhận",
							title: "Xóa Dữ Liệu Bài Làm",
							message: "Xác Nhận",
							description: "Bạn có chắc muốn xóa toàn bộ dữ liệu bài làm không? Những dữ liệu này bao gồm kết quả chấm, code và nhật ký chấm của toàn bộ tài khoản.",
							note: "Hành động này <b>không thể hoàn tác</b> một khi đã thực hiện!",
							noteLevel: "warning",
							buttonList: {
								proceed: { color: "red", text: "XÓA" },
								cancel: { color: "blue", text: "Hủy Bỏ" }
							}
						}) !== "proceed")
							return;

						try {
							let response = await myajax({
								url: "/api/contest/delete",
								method: "POST",
								form: {
									type: "submission",
									token: API_TOKEN
								}
							});

							await popup.show({
								level: "okay",
								windowTitle: "Thành Công",
								title: "Xóa Dữ Liệu Bài Làm",
								message: "Thành Công",
								description: `Đã xóa tổng cộng ${response.data.amount} tệp`,
								buttonList: {
									close: { color: "blue", text: "OK" }
								}
							})
						} catch(e) {
							errorHandler(e);
							return;
						}
					}
				}, this.dataChild);
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
					twi.hash.onUpdate("syslogs", () => this.refresh());
	
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
							this.log("WARN", `Không tồn tại trang ${this.currentPage} của nhật ký hệ thống`, e.data.data);
							this.currentPage = 1;
							this.maxPage = e.data.data.maxPage;
							await this.refresh();
	
							return;
						}
	
						errorHandler(e);
						return;
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
					this.log("info", `Refreshed SysLogs [${hash}]`);
				}
			},

			problemEditor: {
				/** @type {HTMLElement} */
				container: null,
				
				id: null,
				action: null,
				updateTimeout: null,
				addButton: null,
				editButton: null,
				deleteButton: null,
				languages: {},
				
				/** @type {wavec.Container} */
				wavec: wavec.Container.prototype,

				async init() {
					this.container = makeTree("form", "problemEditor", {
						header: { tag: "div", class: "header", child: {
							left: { tag: "span", class: "left", child: {
								main: { tag: "t", class: "main", html: `<icon data-icon="pencil"></icon>thông tin` },

								description: { tag: "t", class: "description", html: `<icon data-icon="book"></icon>nội dung` }
							}},

							right: { tag: "span", class: "right", child: {
								delete: createButton("Xóa", {
									color: "red",
									classes: "delete",
									style: "round",
									icon: "trash",
									complex: true
								}),

								cancel: createButton("Hủy", {
									color: "yellow",
									classes: "cancel",
									style: "round",
									icon: "close",
									complex: true
								}),

								submit: createButton("LƯU", {
									color: "blue",
									type: "submit",
									classes: "submit",
									style: "round",
									icon: "save",
									complex: true
								})
							}}
						}},

						main: { tag: "div", class: "main", child: {
							thumbnail: createImageInput({
								id: "problemEditorThumbnail",
								src: "/api/contest/problems/thumbnail",
								resetText: "Xóa Ảnh Hiện Tại"
							}),
							
							top: { tag: "div", class: "row", child: {
								left: { tag: "span", class: "column", child: {
									pID: createInput({
										label: "Mã Đề Bài",
										type: "text",
										id: "problemEditorID",
										required: true
									}),

									pTitle: createInput({
										label: "Tên Đề Bài",
										type: "text",
										id: "problemEditorTitle",
										required: true
									}),

									author: createInput({
										type: "select",
										label: "Tác Giả",
										id: "problemEditorAuthor",
										required: true
									}),

									point: createInput({
										type: "number",
										label: "Điểm",
										id: "problemEditorPoint",
										required: true
									}),

									input: createInput({
										type: "text",
										label: "Input",
										id: "problemEditorInput",
										required: true
									}),

									output: createInput({
										type: "text",
										label: "Output",
										id: "problemEditorOutput",
										required: true
									}),

									attachment: createInput({
										type: "file",
										label: "Tệp Đính Kèm",
										id: "problemEditorAttachment",
										required: false
									}),

									removeAttachment: createButton("Xóa Tệp Đính Kèm Hiện Tại", {
										color: "pink",
										icon: "trash",
										complex: true
									}),

									disabled: createSwitch({
										label: "Ẩn Đề Bài (Chỉ Quản Trị Viên Mới Có Thể Xem Đề Bài Này)",
										color: "pink",
										value: false
									}),

									canSubmit: createSwitch({
										label: "Cho Phép Nộp Bài",
										color: "blue",
										value: true
									}),

									test: { tag: "div", class: "test", child: {
										label: { tag: "t", class: "label", text: "Test Ví Dụ" },
										list: { tag: "div", class: "list" },
										add: createButton("THÊM", {
											icon: "plus",
											classes: "add",
											complex: true
										})
									}}
								}},

								right: { tag: "span", class: "column", child: {
									time: createInput({
										type: "number",
										label: "Thời Gian Chạy",
										id: "problemEditorTime",
										required: true
									}),

									memory: createInput({
										type: "number",
										label: "Giới Hạn Bộ Nhớ",
										id: "problemEditorMemory",
										required: true
									}),

									limit: createInput({
										type: "number",
										label: "Số Lần Nộp Lại Tối Đa",
										id: "problemEditorLimit",
										required: true
									}),

									tags: createInput({
										type: "textarea",
										label: "Thẻ",
										id: "problemEditorTags",
										required: false
									}),

									tagsPreview: { tag: "div", class: "tagsPreview" },

									accept: { tag: "div", class: "accept", child: {
										label: { tag: "t", class: "label", text: "Ngôn Ngữ Cho Phép" }
									}}
								}}
							}}
						}},

						description: { tag: "div", class: "description", child: {
							editor: new Editor("none", {
								language: "md"
							}),

							preview: { tag: "span", class: "preview", child: {
								dummy: { tag: "t", text: "Nhập Để Bắt Đầu" }
							}}
						}}
					});

					// Add Languages Switch
					for (let key of Object.keys(twi.languages)) {
						this.languages[key] = createCheckbox({
							label: `${twi.languages[key]} (${key})`,
							value: true
						});

						this.container.main.top.right.accept.appendChild(this.languages[key].group);
					}

					this.wavec = new wavec.Container(this.container);
					this.container.addEventListener("submit", () => {});
					this.container.action = "javascript:void(0);";
					this.container.dataset.active = "main";
					this.container.addEventListener("submit", () => this.postSubmit());
					this.container.header.left.main.addEventListener("click", () => this.changeScreen("main"));
					this.container.header.left.description.addEventListener("click", () => this.changeScreen("description"));
					this.container.main.top.left.test.add.addEventListener("click", () => this.addTest());
					this.container.header.right.cancel.addEventListener("click", () => this.wavec.hide());
					this.container.header.right.delete.addEventListener("click", () => this.delete(this.id));

					this.container.main.top.right.tags.onInput((v) => {
						this.container.main.top.right.tagsPreview.innerHTML = twi.problems.parseTags(v);
					});

					this.container.description.editor.onInput((value) => {
						clearTimeout(this.updateTimeout);

						this.updateTimeout = setTimeout(() => {
							this.container.description.preview.replaceChild(md2html.parse(value), this.container.description.preview.firstChild);
						}, 200);
					});

					this.container.description.editor.onScroll(
						e => this.container.description.preview.scrollTop
							= (e.target.scrollTop / (e.target.scrollHeight - e.target.offsetHeight))
								* (this.container.description.preview.scrollHeight - this.container.description.preview.offsetHeight)
					);

					this.container.main.thumbnail.onReset(async () => {
						if (this.id && await this.deleteFile("thumbnail", this.id))
							this.container.main.thumbnail.clear();
					});

					// Inject Button Into Problem Viewer
					this.addButton = twi.problems.panel.button("plus", "Thêm Đề Bài");

					this.editButton = createButton("Chỉnh Sửa", {
						color: "green",
						icon: "pencil",
						style: "round",
						complex: true
					});

					this.deleteButton = createButton("Xóa", {
						color: "red",
						icon: "trash",
						style: "round",
						complex: true
					});

					twi.problems.viewer.content.header.left.buttons.append(this.editButton, this.deleteButton);
					this.addButton.onClick(() => this.create());
					this.editButton.addEventListener("click", () => this.edit(twi.problems.id));
					this.deleteButton.addEventListener("click", () => this.delete(twi.problems.id));
				},

				changeScreen(screen) {
					this.container.dataset.active = screen;
					this.wavec.content.scrollTop = 0;
				},

				async resetForm() {
					// Get Account List
					let response = await myajax({
						url: `/api/account/get`,
						method: "POST",
						form: {
							token: API_TOKEN
						}
					});

					let accounts = {}
					for (let item of response.data)
						accounts[item.username] = `(${item.username} #${item.id}) ${item.name}`;

					this.container.main.top.left.author.set({
						value: null,
						options: accounts
					});

					this.container.main.top.left.pID.input.value = "";
					this.container.main.top.left.pID.input.disabled = false;
					this.container.main.top.left.pTitle.input.value = "";
					this.container.main.top.left.point.input.value = "";
					this.container.main.top.left.input.input.value = "Bàn Phím";
					this.container.main.top.left.output.input.value = "Màn Hình";
					this.container.main.top.right.time.input.value = 1;
					this.container.main.top.right.memory.input.value = 1024;
					this.container.main.top.right.limit.input.value = 0;
					this.container.main.top.right.tags.input.value = "";
					this.container.main.top.left.attachment.input.value = null;
					this.container.main.top.left.disabled.input.checked = false;
					this.container.main.top.left.canSubmit.input.checked = true;
					this.container.description.editor.value = "";
					this.container.main.thumbnail.clear();
					emptyNode(this.container.main.top.left.test.list);
					this.changeScreen("main");
					this.action = null;

					for (let item of Object.values(this.languages))
						item.input.checked = true;
				},

				addTest({ input = "", output = "" } = {}) {
					let node = htmlToElement(`
						<div class="cell">
							<textarea placeholder="Input" required>${input}</textarea>
							<textarea placeholder="Output" required>${output}</textarea>
							<span class="delete"></span>
						</div>
					`);

					node.querySelector(".delete").addEventListener("click", () => {
						node.remove();
						delete node;
					});

					this.container.main.top.left.test.list.appendChild(node);
				},

				getTest() {
					let testNodes = this.container.main.top.left.test.list.querySelectorAll("div.cell");
					let test = []
	
					for (let item of testNodes) {
						let inputs = item.getElementsByTagName("textarea");

						if (inputs[0].value === "" || inputs[1].value === "")
							continue;

						test.push({
							input: inputs[0].value,
							output: inputs[1].value
						});
					}

					return test;
				},

				async create() {
					this.wavec.set({ title: "đề bài - Tạo Mới" });
					this.wavec.show();
					this.wavec.loading = true;

					await this.resetForm();
					this.container.main.top.left.attachment.input.disabled = false;
					this.action = "add";

					this.wavec.loading = false;
					setTimeout(() => this.container.main.top.left.pID.input.focus(), 600);
				},

				async edit(id) {
					this.wavec.show();
					this.wavec.loading = true;
					this.wavec.set({ title: `đề bài - ${id}` });

					let response = await myajax({
						url: "/api/contest/problems/get",
						method: "GET",
						query: {
							id: id
						}
					});
	
					let data = response.data;
					this.log("INFO", "Editing problem", {
						color: flatc("yellow"),
						text: id
					}, data);

					this.id = data.id;
	
					await this.resetForm();
					this.container.main.top.left.pID.input.value = data.id;
					this.container.main.top.left.pID.input.disabled = true;
					this.container.main.top.left.pTitle.input.value = data.name;
					this.container.main.top.left.point.input.value = data.point;
					this.container.main.top.left.input.input.value = data.type.input;
					this.container.main.top.left.output.input.value = data.type.output;
					this.container.main.top.right.time.input.value = data.time;
					this.container.main.top.right.memory.input.value = data.memory;
					this.container.main.top.right.limit.input.value = data.limit;
					this.container.main.top.right.tags.input.value = data.tags.join(" ");
					this.container.main.top.left.disabled.input.checked = data.disabled;
					this.container.main.top.left.canSubmit.input.checked = data.canSubmit;
					this.container.description.editor.value = data.description;
					this.container.main.thumbnail.src(data.thumbnail);

					this.container.main.top.left.author.input.value = (data.author && data.author.username)
						? data.author.username
						: null;

					if (data.attachment && data.attachment.file) {
						this.container.main.top.left.removeAttachment.disabled = false;

						this.container.main.top.left.removeAttachment.onclick = async () => {
							this.container.main.top.left.removeAttachment.disabled = true;

							if (!await this.deleteFile("attachment", data.id, data.attachment.file))
								this.container.main.top.left.removeAttachment.disabled = false;
						}
					} else
						this.container.main.top.left.removeAttachment.disabled = true;

					for (let key of Object.keys(this.languages))
						if (data.accept.includes(key))
							this.languages[key].input.checked = true;
						else
							this.languages[key].input.checked = false;

					for (let item of data.test)
						this.addTest(item);

					this.action = "edit";
					this.wavec.loading = false;
				},

				async postSubmit() {
					this.wavec.loading = true;
	
					let data = {
						id: this.container.main.top.left.pID.input.value,
						name: this.container.main.top.left.pTitle.input.value,
						author: this.container.main.top.left.author.input.value,
						point: parseFloat(this.container.main.top.left.point.input.value),
						time: parseInt(this.container.main.top.right.time.input.value),
						memory: parseInt(this.container.main.top.right.memory.input.value),
						limit: parseInt(this.container.main.top.right.limit.input.value),
						type: {
							input: this.container.main.top.left.input.input.value,
							output: this.container.main.top.left.output.input.value,
						},
						accept: [],
						disabled: this.container.main.top.left.disabled.input.checked,
						canSubmit: this.container.main.top.left.canSubmit.input.checked,
						tags: this.container.main.top.right.tags.input.value.replaceAll("\n", " ").split(" "),
						description: this.container.description.editor.value,
						test: this.getTest()
					}
	
					let thumbnail = this.container.main.thumbnail.input.files[0] || null;
					let attachment =  this.container.main.top.left.attachment.input.files[0] || null;

					for (let key of Object.keys(this.languages))
						if (this.languages[key].input.checked)
							data.accept.push(key);
					
					await this.submit(this.action, data, thumbnail, attachment);

					await twi.problems.updateLists();
					if (twi.problems.id)
						twi.problems.updateViewer(twi.problems.id, true);

					this.wavec.loading = false;
					this.wavec.hide();
				},
	
				async submit(action, data, thumbnail = null, attachment = null) {
					if (!["edit", "add"].includes(action))
						throw { code: -1, description: `twi.userSettings.admin.problemEditor.submit(${action}): not a valid action!` }
	
					this.log("INFO", "Problem Submit:", {
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
								data: JSON.stringify(data),
								thumbnail,
								attachment,
								token: API_TOKEN
							}
						});
					} catch(e) {
						errorHandler(e);
						throw e;
					}

					return true;
				},

				async delete(id) {
					this.log("WARN", "Deleting Problem", {
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
						this.log("INFO", "Cancelled deletion of", {
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
	
					this.log("OKAY", "Deleted Problem", {
						color: flatc("yellow"),
						text: id
					});
	
					this.wavec.hide();
				},

				async deleteFile(type, id, fileName = null) {
					if (!["thumbnail", "attachment"].includes(type))
						throw { code: -1, description: `twi.userSettings.admin.problemEditor.deleteFile(${type}): not a valid type!` }
	
					typeName = { thumbnail: "Ảnh Nền", attachment: "Tệp Đính Kèm" }[type]
	
					this.log("WARN", "Preparing to delete", typeName, "of", {
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
						this.log("INFO", "Cancelled deletion", typeName, "of", {
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
	
					this.log("OKAY", "Deleted", typeName, "of", {
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

		/**
		 * Title component
		 * 
		 * Page title and description
		 * 
		 * @var navbar.title
		 */
		title: navbar.title({
			tooltip: {
				title: "contest",
				description: "xem thông tin kì thi này"
			}
		}),

		/**
		 * Hamburger icon
		 * 
		 * User Settings Panel Toggler
		 * 
		 * @var navbar.menuButton
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
			this.menu.click.setHandler((active) => (active) ? smenu.show() : smenu.hide());
			smenu.onShow(() => this.menu.click.setActive(true));
			smenu.onHide(() => this.menu.click.setActive(false));

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

					this.log("OKAY", "Avatar changed");
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
						this.log("ERRR", e);

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
					this.log("OKAY", `Changed Name To`, {
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
						this.log("ERRR", e);

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

					this.log("OKAY", `Password Changed`);
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

	contestInfo: {
		priority: 3,

		/** @type {HTMLElement} */
		container: null,
		
		wavec: wavec.Container.prototype,

		init() {
			this.container = makeTree("div", "contestInfo", {
				header: { tag: "div", class: "header", child: {
					landing: new lazyload({ source: "/api/images/landing", classes: "landing" }),
					icon: new lazyload({ source: "/api/images/icon", classes: "icon" }),
					cTitle: { tag: "t", class: "title", text: SERVER.contest.name }
				}},

				description: { tag: "div", class: "description", child: {
					dummy: { tag: "span" }	
				}}
			});

			// Update title and description if
			// changed on the server
			twi.hash.onUpdate("config.contest.basicInfo", async () => {
				await updateServerData();
				this.update();
			});

			this.wavec = new wavec.Container(this.container, {
				icon: "book",
				title: "thông tin kì thi"
			});

			this.update();
			twi.navbar.title.click.setHandler((active) => (active) ? this.wavec.show() : this.wavec.hide());
			this.wavec.onToggle((value) => twi.navbar.title.click.setActive(value));
			this.wavec.onReload(() => this.reload());
		},

		update() {
			this.wavec.loading = true;
			this.container.header.landing.src = "/api/images/landing";
			this.container.header.icon.src = "/api/images/icon";
			this.container.header.cTitle.innerText = SERVER.contest.name;
			this.container.description.replaceChild(md2html.parse(SERVER.contest.description), this.container.description.firstChild);
			this.wavec.loading = false;

			twi.navbar.title.set({
				icon: "/api/images/icon",
				title: SERVER.contest.name,
			});
		}
	},

	publicFile: {
		priority: 3,

		/** @type {HTMLIFrameElement} */
		container: null,
		
		wavec: wavec.Container.prototype,
		loaded: false,

		button: navbar.iconButton({
			icon: "upload",
			tooltip: {
				title: "public",
				description: `danh sách các tệp công khai`
			}
		}),

		init() {
			this.container = document.createElement("iframe");
			this.container.classList.add("fullIframe");
			this.container.src = "/public";

			this.wavec = new wavec.Container(this.container, {
				icon: "upload",
				title: "các tệp công khai"
			});

			this.button.click.setHandler((active) => {
				if (!this.loaded)
					this.load();

				active ? this.wavec.show() : this.wavec.hide();
			});

			twi.darkmode.onToggle((dark) => this.button.set({ color: dark ? "dark" : "whitesmoke" }));
			this.wavec.onToggle((value) => this.button.click.setActive(value));
			this.wavec.onReload(() => this.reload());

			navbar.insert(this.button, "right");
		},

		load() {
			this.container.src = "/public";
			this.loaded = true;
		},

		reload() {
			this.container.contentWindow.location.reload();
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
				key: "ranking-cell",
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

		async init(set = () => {}) {
			await this.update(set = () => {});
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
				this.log("ERRR", e);
			}
			
			this.timeout = setTimeout(() => this.updater(), (this.updateDelay - (time() - start)) * 1000);
		},

		async update(set = () => {}) {
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
					let doUpdate = (typeof this.hashes[key] === "string");
					
					this.log("INFO", "Hash Changed:",
						{ text: hash, color: oscColor("green") },
						{ text: key, color: oscColor("blue") }
					);

					this.hashes[key] = hash;

					if (doUpdate) {
						if (!this.changeHandlers[key] || this.changeHandlers[key].length === 0) {
							this.log("DEBG", `No handlers for ${key}. Skipping`);
							continue;
						}
	
						for (let f of this.changeHandlers[key])
							await f(hash);
					} else
						this.log("DEBG", "Hash Initialized:", { text: key, color: oscColor("blue") });
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