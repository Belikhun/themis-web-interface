//? |-----------------------------------------------------------------------------------------------|
//? |  /assets/js/belibrary.js                                                                      |
//? |                                                                                               |
//? |  Copyright (c) 2018-2020 Belikhun. All right reserved                                         |
//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
//? |-----------------------------------------------------------------------------------------------|

/**
 * An AJAX function designed for my API
 * @param	{Object}		param0		request data
 * @param	{Function}		callout		on request success handler
 * @param	{Function}		error		on errored handler
 * @returns	{Promise}					A Promise thats resolve on request complete
 */
function myajax({
	url = "/",
	method = "GET",
	query = {},
	form = {},
	json = {},
	raw = null,
	header = {},
	type = "json",
	onUpload = () => {},
	onDownload = () => {},
	force = false,
	changeState = true,
	reRequest = true,
	withCredentials = false,
	timeout = 0
}, callout = () => {}, error = () => {}) {
	let argumentsList = arguments;

	return new Promise((resolve, reject) => {
		if (__connection__.onlineState !== "online" && force === false) {
			let errorObj = {}

			switch (__connection__.onlineState) {
				case "offline":
					errorObj = { code: 106, description: "Mất kết nối tới máy chủ" }
					break;
				case "ratelimited":
					errorObj = { code: 32, description: "Rate Limited" }
					break;
			}

			reject(errorObj);
			error(errorObj);

			return;
		}

		let xhr = new XMLHttpRequest();
		let formData = null;

		if (method.toUpperCase() === "POST") {
			formData = new FormData();
			
			for (let key of Object.keys(form))
				formData.append(key, form[key]);
		}

		let queryKey = Object.keys(query);
		for (let key of queryKey)
			url += `${(queryKey[0] === key) ? "?" : ""}${key}=${query[key]}${(queryKey[queryKey.length - 1] !== key) ? "&" : ""}`;
			
		url = encodeURI(url);

		xhr.upload.addEventListener("progress", e => onUpload(e), false);
		xhr.addEventListener("progress", e => onDownload(e), false);

		xhr.addEventListener("readystatechange", async function() {
			if (this.readyState === this.DONE) {
				if (this.status === 0) {
					if (changeState === true)
						__connection__.stateChange("offline");

					let errorObj = { code: 106, description: "Mất kết nối tới máy chủ" }
					reject(errorObj);
					error(errorObj);

					return;
				}

				if ((this.responseText === "" || !this.responseText) && this.status >= 400) {
					clog("ERRR", {
						color: flatc("magenta"),
						text: method
					}, {
						color: flatc("pink"),
						text: url
					}, {
						color: flatc("red"),
						text: `HTTP ${this.status}:`
					}, this.statusText);

					let errorObj = { code: 1, description: `HTTP ${this.status}: ${this.statusText} (${method} ${url})`, data: { method, url } }
					error(errorObj);
					reject(errorObj);

					return;
				}

				let response = null;

				if (type === "json") {
					try {
						response = JSON.parse(this.responseText);
					} catch (data) {
						clog("ERRR", "Lỗi phân tích JSON");

						let errorObj = { code: 2, description: `Lỗi phân tích JSON`, data: data }
						error(errorObj);
						reject(errorObj);

						return;
					}

					if (this.status >= 400) {
						if (typeof response.code === "number" && response.code !== 0 && response.code < 100) {
							clog("ERRR", {
								color: flatc("magenta"),
								text: method
							}, {
								color: flatc("pink"),
								text: url
							}, {
								color: flatc("red"),
								text: `HTTP ${this.status}:`
							}, this.statusText, ` >>> ${response.description}`);
	
							if (this.status === 429 && response.code === 32 && reRequest === true) {
								// Wait for :?unratelimited:?
								await __connection__.stateChange("ratelimited", response);
								
								// Resend previous ajax request
								clog("DEBG", "Resending Request", argumentsList);
								let r = null;
	
								try {
									r = await myajax(...argumentsList);
								} catch(e) {
									reject(e);
									return;
								}
	
								// Resolve promise
								resolve(r);
	
								return;
							}
						}

						let errorObj = { code: 3, description: `HTTP ${this.status}: ${this.statusText} (${method} ${url})`, data: response }
						error(errorObj);
						reject(errorObj);

						return;
					}

					data = response;
				} else {
					response = this.responseText;

					if (this.status >= 400) {
						let code = `HTTP ${this.status}`;
						let text = (this.statusText === "") ? "?Unknown statusText" : this.statusText;
						let resData = response;

						let header = this.getResponseHeader("output-json");

						if (header) {
							let headerJSON = JSON.parse(header);

							if (!resData)
								resData = headerJSON;

							code = `HTTP ${headerJSON.status} [${headerJSON.code}]`
							text = headerJSON.description;
						}

						clog("ERRR", {
							color: flatc("magenta"),
							text: method
						}, {
							color: flatc("pink"),
							text: url
						}, {
							color: flatc("red"),
							text: `${code}:`
						}, text, ` >>> ${response.description}`);

						let errorObj = { code: 3, description: `${code}: ${text} (${method} ${url})`, data: resData }
						error(errorObj);
						reject(errorObj);

						return;
					}

					data = response;
				}

				callout(data);
				resolve(data);
			}
		})

		xhr.open(method, url);
		xhr.withCredentials = withCredentials;
		xhr.timeout = timeout;

		let sendData = (raw !== null) ? raw : formData;

		for (let key of Object.keys(header))
			xhr.setRequestHeader(key, header[key]);

		if (Object.keys(json).length !== 0) {
			sendData = JSON.stringify(json);
			xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
		}

		xhr.setRequestHeader("Accept", `${type === "json" ? "application/json" : "text/plain"};charset=UTF-8`);
		xhr.send(sendData);
	})
}

function delayAsync(time) {
	return new Promise((resolve, reject) => {
		setTimeout(e => {
			resolve();
		}, time);
	});
}

function waitFor(checker = async () => {}, handler = () => {}, retry = 10, timeout = 1000, onFail = () => {}) {
	return new Promise((resolve, reject) => {
		let retryNth = 0;
		let doCheck = true;

		const __check = async () => {
			let result = false;

			try {
				result = await checker(retryNth + 1).catch();
			} catch(e) {
				result = false;
			}

			if (!result) {
				retryNth++;
				clog("DEBG", `[${retryNth}] check failed`);

				if (retryNth >= retry) {
					doCheck = false;
					onFail(retryNth);
					reject(retryNth);
				}

				return;
			}

			clog("DEBG", `[${retryNth}] check passed`);
			doCheck = false;
			await handler(result);
			resolve(result);
		}

		const __checkHandler = async () => {
			if (!doCheck)
				return;

			let timeStart = time();
			await __check();
			setTimeout(() => __checkHandler(), timeout - ((time() - timeStart) * 1000));
		}

		__checkHandler();
	})
}

function escapeHTML(str) {
	if ((str === null) || (str === ""))
		return "";
	else
		str = str.toString();

	let map = {
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		"\"": "&quot;",
		"'": "&#039;"
	};

	return str.replace(/[&<>"']/g, function (m) {
		return map[m];
	});
}

/**
 * Return the first element with the given className
 * @param	{Element}	node			Container
 * @param	{String}	className		Class
 * @returns	{Element}
 */
function fcfn(node, className) {
	return node.getElementsByClassName(className)[0];
}

/**
 * @param	{String}	HTML representing a single element
 * @return	{Element}
 */
function htmlToElement(html) {
	let template = document.createElement("template");
	template.innerHTML = html.trim();
	
	return template.content.firstChild;
}

function buildElementTree(type = "div", __class = [], data = new Array(), __keypath = "") {
	let svgTag = ["svg", "g", "path", "line", "circle", "polyline"]

	let tree = (svgTag.includes(type))
		? document.createElementNS("http://www.w3.org/2000/svg", type)
		: document.createElement(type);
	
	if (typeof __class == "string")
		__class = new Array([__class]);
	tree.classList.add.apply(tree.classList, __class);
	let objtree = tree;

	for (let i = 0; i < data.length; i++) {
		let d = data[i];
		let k = __keypath + (__keypath === "" ? "" : ".") + d.name;

		if (typeof d.list === "object") {
			let t = buildElementTree(d.type, d.class, d.list, k);

			t.tree.dataset.name = d.name;
			t.tree.dataset.path = k;
			(d.id) ? t.tree.id = d.id : 0;
			(d.for) ? t.tree.htmlFor = d.for : 0;
			(d.inpType) ? t.tree.type = d.inpType : 0;
			(d.html) ? t.tree.innerHTML = d.html : 0;
			(d.text) ? t.tree.innerText = d.text : 0;

			if (typeof d.data === "object")
				for (let key of Object.keys(d.data))
					t.tree.dataset[key] = d.data[key];
			
			tree.appendChild(t.tree);

			objtree[d.name] = t.tree;
		} else if (typeof d === "object") {
			if (typeof d.node === "object") {
				let node = (d.node.group && d.node.group.classList)
					? d.node.group
					: (d.node.container && d.node.container.classList)
						? d.node.container
						: d.node;

				node.dataset.name = d.name;
				node.dataset.path = k;

				tree.appendChild(node);
				objtree[d.name] = d.node;

				continue;
			}

			let t = (svgTag.includes(d.type))
				? document.createElementNS("http://www.w3.org/2000/svg", d.type)
				: document.createElement(d.type);

			if (typeof d.class == "string")
				d.class = new Array([d.class]);

			t.classList.add.apply(t.classList, d.class);
			t.dataset.name = d.name;
			t.dataset.path = k;
			(d.id) ? t.id = d.id : 0;
			(d.for) ? t.htmlFor = d.for : 0;
			(d.inpType) ? t.type = d.inpType : 0;
			(d.html) ? t.innerHTML = d.html : 0;
			(d.text) ? t.innerText = d.text : 0;

			if (typeof d.data === "object")
				for (let key of Object.keys(d.data))
					t.dataset[key] = d.data[key];

			tree.appendChild(t);
			objtree[d.name] = t;
		}
	}

	return {
		obj: objtree,
		tree: tree
	}
}

function checkServer(ip, callback = () => {}) {
	return new Promise((resolve, reject) => {
		let xhr = new XMLHttpRequest();
		let pon = {};

		xhr.addEventListener("readystatechange", function() {
			if (this.readyState === this.DONE) {
				if (this.status === 0) {
					pon = {
						code: -1,
						description: `Server "${ip}" is Offline`,
						online: false,
						address: ip
					}

					reject(pon);
				} else {
					pon = {
						code: 0,
						description: `Server "${ip}" is Online`,
						online: true,
						address: ip
					}

					resolve(pon);
				}

				callback(pon);
			}
		})

		xhr.open("GET", ip);
		xhr.send();
	})
}

function time(date = new Date()) {
	return date.getTime() / 1000;
}

function parseTime(t = 0, {
	forceShowHours = false,
	msDigit = 3,
	showPlus = false
} = {}) {
	let d = showPlus ? "+" : "";
	
	if (t < 0) {
		t = -t;
		d = "-";
	}
	
	let h = Math.floor(t / 3600);
	let m = Math.floor(t % 3600 / 60);
	let s = Math.floor(t % 3600 % 60);
	let ms = pleft(parseInt(t.toFixed(msDigit).split(".")[1]), msDigit);

	return {
		h: h,
		m: m,
		s: s,
		ms: ms,
		str: d + [h, m, s]
			.map(v => v < 10 ? "0" + v : v)
			.filter((v, i) => i > 0 || forceShowHours || v !== "00")
			.join(":")
	}
}

function formatTime(seconds, { ended = "Đã kết thúc", endedCallback = () => {} } = {}) {
	let time = { năm: 31536000, ngày: 86400, giờ: 3600, phút: 60, giây: 1 },
		res = [];

	if (seconds === 0)
		return "bây giờ";

	if (seconds < 0) {
		endedCallback();
		return ended;
	}

	for (let key in time)
		if (seconds >= time[key]) {
			let val = Math.floor(seconds / time[key]);
			res.push(val += " " + key);
			seconds = seconds % time[key];
		}

	return res.length > 1 ? res.join(", ").replace(/,([^,]*)$/, " và" + "$1") : res[0];
}

function liveTime(element, start = time(new Date()), { type = "full", count = "up", prefix = "", surfix = "", ended = "Đã kết thúc", endedCallback = () => {}, interval = 1000 } = {}) {
	let updateInterval = setInterval(e => {
		if (!document.body.contains(element)) {
			clog("DEBG", "Live Time Element does not exist in document. Clearing...");
			clearInterval(updateInterval);
		}

		let t = 0;
		let ts = "";
		let parsed = null;

		if (count === "up")
			t = time() - start;
		else
			t = start - time();

		switch (type) {
			case "full":
				ts = formatTime(t, { ended: ended, endedCallback: () => endedCallback(element) });
				break;

			case "simple":
				if (t < 0) {
					endedCallback(element);
					ts = ended;
					break;
				}

				parsed = parseTime(t % 86400, { forceShowHours: true, showPlus: true });
				ts = `<timer><days>${Math.floor(t / 86400)}</days>${parsed.str}<ms>${parsed.ms}</ms></timer>`;
				break;

			case "minimal":
				if (t < 0) {
					endedCallback(element);
					ts = ended;
					break;
				}
				
				parsed = parseTime(t % 86400, { forceShowHours: true, showPlus: true });
				ts = `<timer><days>${Math.floor(t / 86400)}</days>${parsed.str}</timer>`;
				break;
		
			default:
				ts = `Unknown clock type: ${type}`;
				break;
		}

		element.innerHTML = `${prefix}${ts}${surfix}`;

		if (t < 0)
			clearInterval(updateInterval);
	}, interval);
}

function setDateTimeValue(dateNode, timeNode, value = time()) {
	let date = new Date(value * 1000);
	dateNode.value = [date.getFullYear(), date.getMonth() + 1, date.getDate()].map(i => pleft(i, 2)).join("-");
	timeNode.value = [date.getHours(), date.getMinutes(), date.getSeconds()].map(i => pleft(i, 2)).join(":");
}

function getDateTimeValue(dateNode, timeNode) {
	return time(new Date(`${dateNode.value}T${timeNode.value}`));
}

function convertSize(bytes) {
	let sizes = ["B", "KB", "MB", "GB", "TB"];
	for (var i = 0; bytes >= 1024 && i < (sizes.length -1 ); i++)
		bytes /= 1024;

	return `${round(bytes, 2)} ${sizes[i]}`;
}

/**
 * Compare Version
 * @param	{String}			localVersion
 * @param	{String}			remoteVersion
 * @returns {String}	"major", "minor", "patch", "latest"
 */
function versionCompare(localVersion, remoteVersion, {
	ignoreTest = false
} = {}) {
	const regex = /^(?:v|)(\d)\.(\d)\.(\d)\-(.+)$/gm;
	let testTags = ["beta", "indev", "debug", "test"]
	let value = "latest";

	let localRe = regex.exec(localVersion); regex.lastIndex = 0;
	let remoteRe = regex.exec(remoteVersion);

	if (!localRe || !remoteRe)
		throw { code: -1, description: `versionCompare(${localVersion}, ${remoteVersion}): Invalid version string` }

	let local = { major: parseInt(localRe[1]), minor: parseInt(localRe[2]), patch: parseInt(localRe[3]), tag: localRe[4] }
	let remote = { major: parseInt(remoteRe[1]), minor: parseInt(remoteRe[2]), patch: parseInt(remoteRe[3]), tag: remoteRe[4] }

	for (let key of ["major", "minor", "patch"])
		if (remote[key] > local[key]) {
			value = key;
			break;
		} else if (local[key] > remote[key])
			break;

	if (!ignoreTest && testTags.includes(remote.tag))
		return "latest";

	return value;
}

function priceFormat(num) {
	return num.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
}

function numberFormat(num) {
	return new Intl.NumberFormat().format(num);
}

function round(number, to = 2) {
	const d = Math.pow(10, to);
	return Math.round(number * d) / d;
}

class stopClock {
	__time(date = new Date()) {
		return date.getTime();
	}

	constructor(date = new Date()) {
		this.start = this.__time(date);
	}

	get stop() {
		return (this.__time() - this.start) / 1000;
	}
}

class pager {
	constructor(container, showCount = 20) {
		if (!container.classList)
			throw { code: -1, description: `pager: container is not a valid node` }

		this.container = container;
		this.listData = []
		this.renderItemHandler = () => {}
		this.updateHandler = () => {}
		this.filterHandler = null;
		this.showCount = showCount;
		this.__currentPage = 1;
		this.__maxPage = 1;
	}

	/**
	 * @param {array} list
	 */
	set list(list) {
		if (typeof list !== "object" || typeof list.length !== "number")
			throw { code: -1, description: `(set) pager.list: not a valid array` }

		this.listData = list;
		this.render();
	}

	renderItem(f) {
		if (typeof f !== "function")
			throw { code: -1, description: `pager.renderItem: not a valid function` }

		this.renderItemHandler = f;
	}

	onUpdate(f) {
		if (typeof f !== "function")
			throw { code: -1, description: `pager.onUpdate: not a valid function` }

		this.updateHandler = f;
	}

	setFilter(f) {
		if (typeof f !== "function")
			throw { code: -1, description: `pager.setFilter: not a valid function` }

		this.filterHandler = f;
	}

	next() {
		this.__currentPage++;
		this.render();
	}

	back() {
		this.__currentPage--;
		this.render();
	}

	setPage(page) {
		if (typeof page !== "number" && !["first", "last"].includes(page))
			throw { code: -1, description: `pager.setPage: ${page} is not a valid number/command` }

		this.__currentPage = page;
		this.render();
	}

	render() {
		if (this.__currentPage < 1 || this.__currentPage === "first")
			this.__currentPage = 1;

		let listData = (typeof this.filterHandler === "function") ? this.listData.filter(this.filterHandler) : this.listData;
		let total = Math.max(listData.length, 1);
		let maxPage = parseInt(Math.floor(total / this.showCount) + ((total % this.showCount === 0) ? 0 : 1));

		if (this.__currentPage > maxPage || this.__currentPage === "last")
			this.__currentPage = maxPage;

		let from = (this.__currentPage - 1) * this.showCount;
		let to = Math.min(this.__currentPage * this.showCount - 1, total - 1);

		this.updateHandler({ total, maxPage, currentPage: this.__currentPage, from, to });
		emptyNode(this.container);

		for (let i = from; i <= to; i++)
			if (listData[i])
				this.renderItemHandler(listData[i], this.container);
			else
				clog("DEBG", `pager.render: listData does not contain data at index`, { text: i, color: flatc("red") });
	}
}

class lazyload {
	constructor({
		container = undefined,
		source = undefined,
		classes = undefined,
		doLoad = true
	} = {}) {
		if (container && container.classList)
			this.container = container;
		else
			this.container = document.createElement("div");

		/**
		 * @type	{String}	Source
		 */
		this._src = null;

		switch (typeof source) {
			case "string":
				// Assume as Image Src
				this.sourceNode = document.createElement("img");
				this._src = source;
				break;
		
			case "object":
				if (source.classList)
					// Source is a Node. We just need to append it in container
					this.sourceNode = source;
				else if (source.type && source.src) {
					switch (source.type) {
						case "image":
						case "iframe":
							this.sourceNode = document.createElement(source.type);
							this._src = source.src;
							break;

						case "document":
							this.sourceNode = document.createElement("embed");
							this._src = source.src;
							break;

						default:
							throw { code: -1, description: `lazyload: source.type >>> ${source.type} is not a valid type` }
					}
				} else
					throw { code: -1, description: `lazyload: source is not a valid node/object` }
				break;

			default:
				throw { code: -1, description: `lazyload: source is not a valid string/node/object, got ${typeof source}` }
		}

		if (!this.sourceNode || !this._src)
			throw { code: -1, description: `lazyload: an unexpected error occured while creating lazyload object` }

		this.isLoaded = false;
		this.isErrored = false;
		this.onLoadedHandler = [];
		this.onErroredHandler = null;

		this.container.classList.add("lazyload");

		if (classes)
			switch (typeof classes) {
				case "object":
					if (!Array.isArray(classes))
						throw { code: -1, description: `lazyload: classes is not a valid array` }

					this.container.classList.add(...classes);
					break;
					
				case "string":
					this.container.classList.add(classes);
					break;
			}

		this.sourceNode.addEventListener("load", () => this.loaded = true);
		this.sourceNode.addEventListener("error", () => this.errored = true);

		this.spinner = document.createElement("div");
		this.spinner.classList.add("simpleSpinner");

		this.container.append(this.sourceNode, this.spinner);

		if (doLoad)
			this.load();
	}

	load(src) {
		if (src)
			this._src = src;

		this.src = this._src;
	}

	/**
	 * @param {String} src
	 */
	set src(src) {
		this.loaded = false;
		this.errored = false;
		this.sourceNode.src = src;
	}

	/**
	 * @returns {String}
	 */
	get src() {
		return this.sourceNode.src;
	}

	/**
	 * @param {Boolean} val
	 */
	set loaded(val) {
		if (typeof val !== "boolean")
			throw { code: -1, description: `lazyload.loaded: not a valid boolean` }

		this.isLoaded = val;
		this.container.removeAttribute("data-errored");

		this.isLoaded
			? this.container.dataset.loaded = true
			: this.container.removeAttribute("data-loaded");

		for (let f of this.onLoadedHandler)
			f();
	}

	get loaded() {
		return this.isLoaded;
	}

	/**
	 * @param {Boolean} val
	 */
	set errored(val) {
		if (typeof val !== "boolean")
			throw { code: -1, description: `lazyload.errored: not a valid boolean` }

		this.isErrored = val;
		this.container.removeAttribute("data-loaded");

		this.isErrored
			? this.container.dataset.errored = true
			: this.container.removeAttribute("data-errored");
	}

	get errored() {
		return this.isErrored;
	}

	/**
	 * @param {Function}	f	Handler
	 */
	onLoaded(f) {
		if (typeof f !== "function")
			throw { code: -1, description: `pager.onLoaded: not a valid function` }

		this.onLoadedHandler.push(f);
	}

	wait() {
		return new Promise((resolve, reject) => {
			if (this.loaded) {
				resolve();
				return;
			}

			this.onLoaded(() => resolve());
		});
	}

	/**
	 * @param {Function}	f	Handler
	 */
	onErrored(f) {
		if (typeof f !== "function")
			throw { code: -1, description: `lazyload.onErrored: not a valid function` }

		this.onErroredHandler = f;
	}
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

function currentScript() {
	let url = (document.currentScript) ? document.currentScript.src : "unknown";
	return url.substring(url.lastIndexOf("/") + 1);
}

/**
 * Add padding to the left of input
 * 
 * Example:
 * 
 * + 21 with length 3: 021
 * + "sample" with length 8: "  sample"
 *
 * @param	{string/number}		input Input
 * @param	{number}			length Length
 */
function pleft(inp, length = 0, right = false) {
	let type = typeof inp;
	let padd = "";

	inp = (type === "number") ? inp.toString() : inp;

	switch (type) {
		case "number":
			padd = "0";
			break;

		case "string":
			padd = " ";
			break;

		default:
			console.error(`error: pleft() first arg is ${type}`);
			return false;
	}

	padd = padd.repeat(Math.max(0, length - inp.length));
	return (right) ? inp + padd : padd + inp;
}

/**
 * My color template
 * 
 * Return color in HEX string
 *
 * @param	{string}	color
 * @returns	{String}
 */
function flatc(color) {
	const clist = {
		green: "#A8CC8C",
		red: "#E88388",
		blue: "#71BEF2",
		aqua: "#66C2CD",
		yellow: "#DBAB79",
		orange: "#e67e22",
		gray: "#6B737E",
		magenta: "#D290E4",
		black: "#282D35",
		pink: "#f368e0",
	}

	return (clist[color]) ? clist[color] : clist.black;
}

/**
 * Color template from OSC package
 * 
 * Return color in HEX string
 *
 * @param	{string}	color
 * @returns	{String}
 */
function oscColor(color) {
	const clist = {
		pink:			"#ff66aa",
		green:			"#88b400",
		blue:			"#44aadd",
		yellow:			"#f6c21c",
		orange:			"#ffa502",
		red:			"#dd2d44",
		brown:			"#3f313d",
		gray:			"#485e74",
		dark:			"#1E1E1E",
		purple:			"#593790",
		darkGreen:		"#0c4207",
		darkBlue:		"#053242",
		darkYellow:		"#444304",
		darkRed:		"#440505",
		navyBlue:		"#333D79",
	}

	return (clist[color]) ? clist[color] : clist.dark;
}

/**
 * Triangle Background
 * 
 * Create alot of triangle in the background of element
 *
 * @param	{Element}	element	Target Element
 * @param	{String}	color	Color
 */
function triBg(element, {
	speed = 34,
	color = "gray",
	scale = 2,
	triangleCount = 38
} = {}) {
	const DARKCOLOR = ["brown", "dark", "darkRed", "darkGreen", "darkBlue"]
	let current = element.querySelector(".triBgContainer");

	if (current)
		element.removeChild(current);

	element.classList.add("triBg");
	element.dataset.triColor = color;

	let container = document.createElement("div");
	container.classList.add("triBgContainer");
	container.dataset.count = triangleCount;

	const updateSize = () => {
		let scaleStep = [50, 60, 70, 80, 90, 100, 120, 140, 160, 180, 200, 250, 300, 350, 400, 500, 600, 700, 800, 900, 1000]

		for (let i = 0; i < scaleStep.length; i++)
			if (scaleStep[i] >= (container.offsetHeight + (0.866 * 30 * 2 * scale))) {
				container.dataset.anim = scaleStep[i];
				return;
			}

		container.dataset.anim = "full";
	}

	(new ResizeObserver(() => updateSize())).observe(container);
	updateSize();

	for (let i = 0; i < triangleCount; i++) {
		let randScale = randBetween(0.4, 2.0, false) * scale;
		let width = 15 * randScale;
		let height = 0.866 * (30 * randScale);

		let randBright = DARKCOLOR.includes(color)
			? randBetween(1.1, 1.3, false)
			: randBetween(0.9, 1.2, false)

		let randLeftPos = randBetween(0, 98, false);
		let delay = randBetween(-speed / 2, speed / 2, false);

		let triangle = document.createElement("span");
		triangle.style.filter = `brightness(${randBright})`;
		triangle.style.borderWidth = `0 ${width}px ${height}px`;
		triangle.style.left = `calc(${randLeftPos}% - ${width}px)`;
		triangle.style.animationDelay = `${delay}s`;
		triangle.style.animationDuration = `${speed / randScale}s`;

		container.appendChild(triangle);
	}

	element.insertBefore(container, element.firstChild);

	return {
		setColor(color) {
			element.dataset.triColor = color;

			for (let triangle of container.childNodes) {
				let randBright = DARKCOLOR.includes(color)
					? randBetween(1.1, 1.3, false)
					: randBetween(0.9, 1.2, false)

				triangle.style.filter = `brightness(${randBright})`;
			}
		}
	}
}

/**
 * Generate Random Number
 * @param	{Number}		min		Minimum Random Number
 * @param	{Number}		max		Maximum Random Number
 * @param	{Boolean}		toInt	Return an Integer Value
 * @returns	{Number}
 */
function randBetween(min, max, toInt = true) {
	return toInt
		? Math.floor(Math.random() * (max - min + 1) + min)
		: (Math.random() * (max - min) + min)
}

const Easing = {
	/**
	 * @param	{Number}	t	Point [0, 1]
	 * @return	{Number}		Point [0, 1]
	 */
	Linear: t => t,

	/**
	 * @param	{Number}	t	Point [0, 1]
	 * @return	{Number}		Point [0, 1]
	 */
	InSine: t => 1 - Math.cos((t * Math.PI) / 2),

	/**
	 * @param	{Number}	t	Point [0, 1]
	 * @return	{Number}		Point [0, 1]
	 */
	OutSine: t => Math.sin((t * Math.PI) / 2),

	/**
	 * @param	{Number}	t	Point [0, 1]
	 * @return	{Number}		Point [0, 1]
	 */
	InOutSine: t => -(Math.cos(Math.PI * t) - 1) / 2,

	/**
	 * @param	{Number}	t	Point [0, 1]
	 * @return	{Number}		Point [0, 1]
	 */
	InQuad: t => t*t,

	/**
	 * @param	{Number}	t	Point [0, 1]
	 * @return	{Number}		Point [0, 1]
	 */
	OutQuad: t => t*(2-t),

	/**
	 * @param	{Number}	t	Point [0, 1]
	 * @return	{Number}		Point [0, 1]
	 */
	InOutQuad: t => (t < .5) ? 2*t*t : -1+(4-2*t)*t,

	/**
	 * @param	{Number}	t	Point [0, 1]
	 * @return	{Number}		Point [0, 1]
	 */
	InCubic: t => t*t*t,

	/**
	 * @param	{Number}	t	Point [0, 1]
	 * @return	{Number}		Point [0, 1]
	 */
	OutCubic: t => (--t)*t*t+1,

	/**
	 * @param	{Number}	t	Point [0, 1]
	 * @return	{Number}		Point [0, 1]
	 */
	InOutCubic: t => (t < .5) ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1,

	/**
	 * @param	{Number}	t	Point [0, 1]
	 * @return	{Number}		Point [0, 1]
	 */
	InExpo: t => t === 0 ? 0 : Math.pow(2, 10 * t - 10),

	/**
	 * @param	{Number}	t	Point [0, 1]
	 * @return	{Number}		Point [0, 1]
	 */
	OutExpo: t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),

	/**
	 * @param	{Number}	t	Point [0, 1]
	 * @return	{Number}		Point [0, 1]
	 */
	InOutExpo: t => t === 0
				? 0
				: t === 1
					? 1
					: t < 0.5
						? Math.pow(2, 20 * t - 10) / 2
						: (2 - Math.pow(2, -20 * t + 10)) / 2,

	/**
	 * @param	{Number}	t	Point [0, 1]
	 * @return	{Number}		Point [0, 1]
	 */
	InQuart: t => t*t*t*t,

	/**
	 * @param	{Number}	t	Point [0, 1]
	 * @return	{Number}		Point [0, 1]
	 */
	OutQuart: t => 1-(--t)*t*t*t,

	/**
	 * @param	{Number}	t	Point [0, 1]
	 * @return	{Number}		Point [0, 1]
	 */
	InOutQuart: t => (t < .5) ? 8*t*t*t*t : 1-8*(--t)*t*t*t,

	/**
	 * @param	{Number}	t	Point [0, 1]
	 * @return	{Number}		Point [0, 1]
	 */
	InQuint: t => t*t*t*t*t,

	/**
	 * @param	{Number}	t	Point [0, 1]
	 * @return	{Number}		Point [0, 1]
	 */
	OutQuint: t => 1 - Math.pow(1 - t, 5),

	/**
	 * @param	{Number}	t	Point [0, 1]
	 * @return	{Number}		Point [0, 1]
	 */
	InOutQuint: t => (t < 0.5) ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2,

	/**
	 * @param	{Number}	t	Point [0, 1]
	 * @return	{Number}		Point [0, 1]
	 */
	InElastic: t => {
		const c4 = (2 * Math.PI) / 3;
		
		return t === 0
			? 0
			: t === 1
				? 1
				: -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
	},

	/**
	 * @param	{Number}	t	Point [0, 1]
	 * @return	{Number}		Point [0, 1]
	 */
	OutElastic: t => {
		const c4 = (2 * Math.PI) / 3;

		return t === 0
			? 0
			: t === 1
				? 1
				: Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
	}
}

/**
 * Animate a value
 * @param {Number}		duration 			Animation Duration
 * @param {Function}	timingFunction 		Animation Timing Function
 * @param {Function}	animate 			Function To Animate
 */
function Animator(duration, timingFunction, animate) {
	let completeHandlers = []
	let start = time();
	let rAID = null;

	let update = () => {
		let tPoint = (time() - start) / duration;
		animate(Math.min(timingFunction(tPoint), 1));

		if (tPoint <= 1)
			rAID = requestAnimationFrame(update);
		else {
			animate(1);
			completeHandlers.forEach(f => f());
		}
	}

	rAID = requestAnimationFrame(() => update());

	return {
		cancel() {
			cancelAnimationFrame(rAID);
		},

		onComplete(f) {
			if (!f || typeof f !== "function")
				throw { code: -1, description: "Animator().onComplete(): not a valid function" }

			completeHandlers.push(f);
		}
	}
}

/**
 * Generate Random String
 * @param	{Number}	len		Length of the randomized string
 * @param	{String}	charSet
 * @returns	{String}
 */
function randString(len = 16, charSet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789") {
	let randomString = "";

	for (let i = 0; i < len; i++) {
		let p = Math.floor(Math.random() * charSet.length);
		randomString += charSet.substring(p, p + 1);
	}

	return randomString;
}

if (typeof $ !== "function")
	/**
	 * A shorthand of querySelector
	 * @param	{String}	selector	Selector
	 * @returns	{Element}
	 */
	function $(query) {
		let r = document.querySelector(query);

		if (!r)
			clog("WARN", `Could not find any element with query: ${query}`);

		return r;
	}

/**
 * Remove all child in a Node
 * 
 * eq: node.innerHTML = ""
 * @param	{Element}	node	Node to empty
 */
function emptyNode(node) {
	while (node.firstChild)
		node.firstChild.remove();
}

function sanitizeHTML(html) {
	let decoder = document.createElement("div");
	decoder.innerHTML = html;
	
	return decoder.textContent;
}

/**
 * Create Input Element, require input.css
 * @param	{Object}
 */
function createInput({
	type = "text",
	id = randString(6),
	label = "Sample Input",
	value = "",
	color = "default",
	required = false,
	autofill = true
} = {}) {
	let formGroup = document.createElement("div");
	formGroup.classList.add("formGroup");
	formGroup.dataset.color = color;
	formGroup.dataset.soundhoversoft = "";
	formGroup.dataset.soundselectsoft = "";

	if (typeof sounds === "object")
		sounds.applySound(formGroup);

	let formField = document.createElement(type === "textarea" ? type : "input");
	formField.type = type;
	formField.id = id;
	formField.classList.add("formField");
	formField.placeholder = label;
	formField.autocomplete = autofill ? "on" : "off";
	formField.value = value;

	if (required)
		formField.required = true;

	if (type === "textarea") {
		formField.style.fontFamily = "Consolas";
		formField.style.fontWeight = "bold";
		formField.style.fontSize = "15px";
	}

	let formLabel = document.createElement("label");
	formLabel.htmlFor = id;
	formLabel.classList.add("formLabel");
	formLabel.innerText = label;

	formGroup.appendChild(formField);
	formGroup.appendChild(formLabel);

	return { group: formGroup, input: formField }
}

/**
 * Create Checkbox Element, require switch.css
 */
function createCheckbox({
	label = "Sample Switch",
	color = "pink",
	value = false,
	type = "checkbox"
} = {}) {
	let container = document.createElement("div");
	container.classList.add("checkboxContainer");
	container.dataset.soundhoversoft = "";
	sounds.applySound(container);

	let title = document.createElement("span");
	title.innerHTML = label;

	let switchLabel = document.createElement("label");
	switchLabel.classList.add("sq-checkbox");
	switchLabel.dataset.color = color;

	let input = document.createElement("input");
	input.type = type;
	input.checked = value;
	input.dataset.soundcheck = "";

	if (typeof sounds === "object")
		sounds.applySound(input);

	let mark = document.createElement("span");
	mark.classList.add("checkmark");

	switchLabel.appendChild(input);
	switchLabel.appendChild(mark);
	container.appendChild(title);
	container.appendChild(switchLabel);

	return {
		group: container,
		input,
		title,
		label: switchLabel
	}
}

function createSlider({
	color = "pink",
	value = 0,
	min = 0,
	max = 10,
	step = 1
} = {}) {
	let container = buildElementTree("div", "osc-slider", [
		{ type: "input", name: "input" },
		{ type: "span", class: "leftTrack", name: "left" },
		{ type: "span", class: "thumb", name: "thumb" },
		{ type: "span", class: "rightTrack", name: "right" }
	]);

	let o = container.obj;
	o.dataset.color = color;
	o.dataset.soundhover = true;

	if (typeof sounds === "object")
		sounds.applySound(o);

	o.input.type = "range";
	o.input.min = min;
	o.input.max = max;
	o.input.step = step;
	o.input.value = value;

	const update = (e) => {
		let valP = (e.target.value - min) / (max - min);

		o.thumb.style.left = `calc(20px + (100% - 40px) * ${valP})`;
		o.left.style.width = `calc((100% - 40px) * ${valP})`;
		o.right.style.width = `calc(100% - (100% - 40px) * ${valP} - 40px)`;

		if (e.isTrusted && sounds)
			if (valP === 0)
				sounds.slider(2);
			else if (valP === 1)
				sounds.slider(1);
			else
				sounds.slider(0);
	}

	requestAnimationFrame(() => update({ target: o.input }));

	let inputHandlers = []
	let changeHandlers = []

	o.input.addEventListener("input", (e) => {
		inputHandlers.forEach(f => f(parseFloat(e.target.value), e));
		update(e);
	});

	o.input.addEventListener("change", (e) => changeHandlers.forEach(f => f(parseFloat(e.target.value), e)));

	return {
		group: container.tree,
		input: o.input,

		setValue(value) {
			o.input.value = value;
			o.input.dispatchEvent(new Event("input"));
		},

		onInput(f) {
			if (!f || typeof f !== "function")
				throw { code: -1, description: "createSlider().onInput(): not a valid function" }

			inputHandlers.push(f);
			f(parseFloat(o.input.value));
		},

		onChange(f) {
			if (!f || typeof f !== "function")
				throw { code: -1, description: "createSlider().onChange(): not a valid function" }

			changeHandlers.push(f);
			f(parseFloat(o.input.value));
		}
	}
}

/**
 * Create Button Element, require button.css
 * @param	{String}	text		Button Label
 * @param	{String}	color		Button Color
 * @returns	{HTMLButtonElement}		Button Element
 */
function createBtn(text, color = "blue", {
	element = "button",
	type = "button",
	icon = null,
	align = "left",
	complex = false
} = {}) {
	let button = document.createElement(element);
	button.classList.add("sq-btn");
	button.type = type;
	button.dataset.color = color;
	button.dataset.soundhover = "";
	button.dataset.soundselect = "";

	let textNode = document.createElement("span");
	textNode.classList.add("text");
	textNode.innerText = text;

	if (icon)
		button.innerHTML = `<icon class="${align}" data-icon="${icon}"></icon>`;

	button.appendChild(textNode);
	button.changeText = (text) => textNode.innerText = text;

	if (complex)
		triBg(button, {
			scale: 1.6,
			speed: 12,
			color: color,
			triangleCount: 8
		});

	if (typeof sounds === "object")
		sounds.applySound(button);

	return button;
}

function createImageInput({
	id = randString(6),
	label = "Sample Image",
	resetLabel = "Đặt Lại",
	accept = "image/*",
	src = "//:0"
} = {}) {
	if (!src)
		src = "//:0";

	let container = document.createElement("div");
	container.classList.add("imageInput");

	let input = document.createElement("input");
	input.type = "file";
	input.id = id;
	input.accept = accept;

	let labelNode = document.createElement("t");
	labelNode.classList.add("label");
	labelNode.innerText = label;

	let resetHandlers = []

	let imageContainer = document.createElement("label");
	imageContainer.htmlFor = id;
	imageContainer.title = "Chọn Ảnh";
	sounds.applySound(imageContainer, ["soundhover", "soundselect"]);

	let lazyloadImage = new lazyload({
		container: imageContainer,
		source: src,
		classes: ["imageBox", item.display || "square"]
	});

	let resetButton = document.createElement("button");
	resetButton.type = "button";
	resetButton.classList.add("sq-btn", "pink", "sound");
	resetButton.innerText = resetLabel;
	sounds.applySound(resetButton, ["soundhover", "soundselect"]);
	
	let clearButton = document.createElement("icon");
	clearButton.classList.add("clear");
	clearButton.dataset.icon = "close";
	sounds.applySound(clearButton, ["soundhoversoft", "soundselectsoft"]);

	input.addEventListener("change", (e) => {
		let file = e.target.files[0];

		if (file) {
			lazyloadImage.src = URL.createObjectURL(file);
			clearButton.classList.add("show");
		} else
			clearButton.classList.remove("show");
	});

	clearButton.addEventListener("click", () => {
		clearButton.classList.remove("show");
		input.value = null;
		lazyloadImage.src = src;
	});

	resetButton.addEventListener("click", async (e) => {
		resetButton.disabled = true;

		for (let f of resetHandlers)
			await f(e);
	});

	input.dispatchEvent(new Event("change"));
	container.append(input, labelNode, imageContainer, clearButton, resetButton);

	return {
		group: container,
		input,
		image: lazyloadImage,

		src(src = "//:0") {
			if (!src)
				src = "//:0";

			lazyloadImage.src = src;
			resetButton.disabled = (src === "//:0");
		},

		onReset(f) {
			if (typeof f !== "function")
				throw { code: -1, description: `createImageInput().onReset(): not a valid function` }

			resetHandlers.push(f);
		}
	}
}

function createNote({
	level = "info",
	message = "Smaple Note"
} = {}) {
	let container = document.createElement("div");
	container.classList.add("note");
	container.dataset.level = level;

	let inner = document.createElement("span");
	inner.classList.add("inner");
	inner.innerHTML = message;

	container.appendChild(inner);

	return {
		group: container,

		set({ level, message } = {}) {
			if (level)
				container.dataset.level = level;

			if (message)
				inner.innerHTML = message;
		}
	}
}

const cookie = {
	cookie: null,

	getAll() {
		const mycookie = document.cookie.split("; ");
		let dacookie = {};

		for (let i = 0; i < mycookie.length; i++) {
			let t = mycookie[i].split("=");
			dacookie[t[0]] = t[1];
		}

		this.cookie = dacookie;
		return dacookie;
	},

	get(key, def = null) {
		if (!this.cookie)
			this.cookie = this.getAll();

		if (def !== null && typeof this.cookie[key] === "undefined")
			this.set(key, def, 9999);

		return this.cookie[key] || def;
	},

	set(key, value = "", days = 0, path = "/") {
		let exp = "";
		if (days !== 0 && typeof days === "number") {
			let date = new Date();
			date.setTime(date.getTime() + (days*24*60*60*1000));
			exp = `; expires=${date.toUTCString()}`;
		}

		document.cookie = `${key}=${value}${exp}; path=${path}`;

		this.cookie = this.getAll();
		return true;
	},
}

//? |-----------------------------------------------------------------------------------------------|
//? |  from web-clog.js                                                                             |
//? |                                                                                               |
//? |  Copyright (c) 2018-2020 Belikhun. All right reserved                                         |
//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
//? |-----------------------------------------------------------------------------------------------|

function clog(level, ...args) {
	const font = "Calibri";
	const size = "12";
	let date = new Date();
	const rtime = round(sc.stop, 3).toFixed(3);
	let str = "";

	level = level.toUpperCase();
	lc = flatc({
		DEBG: "blue",
		OKAY: "green",
		INFO: "magenta",
		WARN: "yellow",
		ERRR: "red",
		CRIT: "gray",
	}[level])

	let text = [
		{
			color: flatc("aqua"),
			text: `${pleft(date.getHours(), 2)}:${pleft(date.getMinutes(), 2)}:${pleft(date.getSeconds(), 2)}`,
			padding: 8,
			separate: true
		}, {
			color: flatc("blue"),
			text: rtime,
			padding: 8,
			separate: true
		}, {
			color: flatc("red"),
			text: window.location.pathname,
			padding: 16,
			separate: true
		}, {
			color: lc,
			text: level,
			padding: 6,
			separate: true
		}
	]

	text = text.concat(args);
	let n = 2;
	let out = new Array();
	out[0] = "%c";
	out[1] = "padding-left: 10px";
	// i | 1   2   3   4   5     6
	// j | 0   1   2   3   4     5
	// n | 1 2 3 4 5 6 7 8 9 10 11

	for (let i = 1; i <= text.length; i++) {
		item = text[i-1];
		if (typeof item === "string" || typeof item === "number") {
			if (i > 4)
				str += `${item} `;

			out[0] += `%c${item} `;
			out[n] = `font-size: ${size}px; font-family: ${font}; color: ${flatc("black")}`;
			n += 1;
		} else if (typeof item === "object") {
			if (item === null || item === undefined || typeof item.text === "undefined") {
				out[n] = item;
				n += 1;

				if (item && item.code && item.description)
					str += `[${item.code}] ${item.description} `;
				else if (item && item.name && item.message)
					str += `${item.name} >>> ${item.message} `;
				else
					str += JSON.stringify(item) + " ";

				continue;
			}

			let t = pleft(item.text, ((item.padding) ? item.padding : 0));
			if (i > 4)
				str += `${t} `;

			out[0] += `%c${t}`;

			if (item.separate) {
				out[0] += "%c| ";
				out[n] = `font-size: ${size}px; color: ${item.color};`;
				out[n+1] = `font-size: ${size}px; color: ${item.color}; font-weight: bold;`;
				n += 2;
			} else {
				out[0] += " ";
				out[n] = `font-size: ${size}px; font-family: ${font}; color: ${item.color}`;
				n += 1;
			}
		} else
			console.error(`error: type ${typeof item}`)
	}

	document.__onclog(level, rtime, str);

	switch (level) {
		case "DEBG":
			console.debug.apply(this, out);
			break;

		case "WARN":
			console.warn.apply(this, out);
			break;

		case "ERRR":
			console.error.apply(this, out);
			break;

		case "CRIT":
			console.error.apply(this, out);
			break;

		default:
			console.log.apply(this, out);
			break;
	}
}

const popup = {
	tree: {},
	popup: {},
	popupNode: null,
	initialized: false,
	showing: false,

	levelTemplate: {
		light: {
			okay: { bg: "green", icon: "check", h: "dark", b: "light" },
			warning: { bg: "yellow", icon: "exclamation", h: "dark", b: "light" },
			error: { bg: "red", icon: "bomb", h: "light", b: "light" },
			offline: { bg: "gray", icon: "unlink", h: "light", b: "light" },
			confirm: { bg: "blue", icon: "question", h: "dark", b: "light" },
			info: { bg: "purple", icon: "info", h: "light", b: "light" }
		},
		dark: {
			okay: { bg: "darkGreen", icon: "check", h: "light", b: "dark" },
			warning: { bg: "darkYellow", icon: "exclamation", h: "light", b: "dark" },
			error: { bg: "darkRed", icon: "bomb", h: "light", b: "dark" },
			offline: { bg: "gray", icon: "unlink", h: "light", b: "dark" },
			confirm: { bg: "darkBlue", icon: "question", h: "light", b: "dark" },
			info: { bg: "purple", icon: "info", h: "light", b: "dark" }
		}
	},

	init() {
		const tree = [{type:"div",class:"popupWindow",name:"popup",list:[{type:"div",class:"header",name:"header",list:[{type:"span",class:"top",name:"top",list:[{type:"t",class:["windowTitle","text-overflow"],name:"windowTitle"},{type:"span",class:"close",name:"close"}]},{type:"icon",name:"icon"},{type:"t",class:"text",name:"text"}]},{type:"div",class:"body",name:"body",list:[{type:"div",class:"top",name:"top",list:[{type:"t",class:"message",name:"message"},{type:"t",class:"description",name:"description"}]},{type:"div",class:"note",name:"note",list:[{type:"span",class:"inner",name:"inner"}]},{type:"div",class:"customNode",name:"customNode"},{type:"div",class:"buttonGroup",name:"button"}]}]}];

		this.tree = buildElementTree("div", "popupContainer", tree);
		this.popupNode = this.tree.tree;
		this.popup = this.tree.obj.popup;
		document.body.insertBefore(this.popupNode, document.body.childNodes[0]);

		this.popup.header.top.close.title = "Đóng";
		this.popup.header.top.close.dataset.soundhover = "";
		this.popup.header.top.close.dataset.soundselect = "";
		this.popup.body.note.style.display = "none";

		if (typeof sounds !== "undefined")
			sounds.applySound(this.popup.header.top.close);

		this.initialized = true;
	},

	show({
		windowTitle = "Popup",
		title = "Title",
		message = "Message",
		description = "Description",
		note = null,
		noteLevel = null,
		level = "info",
		icon = null,
		bgColor = null,
		headerTheme = null,
		bodyTheme = null,
		customNode = null,
		buttonList = {}
	} = {}) {
		return new Promise((resolve, reject) => {
			if (!this.initialized) {
				reject({ code: -1, description: "popup not initialized. Please initialize it first by using popup.init()" });
				return;
			}

			this.popup.dataset.level = level;

			//* THEME
			let template = document.body.classList.contains("dark") ? this.levelTemplate.dark : this.levelTemplate.light;

			if (template[level])
				template = template[level];
			else
				reject({ code: -1, description: `Unknown level: ${level}` })

			triBg(this.popup.header, {
				scale: 4,
				speed: 64,
				color: (typeof bgColor === "string") ? bgColor : template.bg
			});

			this.popup.header.icon.dataset.icon = (typeof icon === "string") ? icon : template.icon;
			this.popup.header.setAttribute("theme", (typeof headerTheme === "string") ? headerTheme : template.h);
			this.popup.body.setAttribute("theme", (typeof bodyTheme === "string") ? bodyTheme : template.b);

			//* HEADER
			this.popup.header.top.windowTitle.innerText = windowTitle;
			this.popup.header.text.innerText = title;

			//* BODY
			this.popup.body.top.message.innerHTML = message;
			this.popup.body.top.description.innerHTML = description;

			if (note) {
				this.popup.body.note.style.display = "flex";
				this.popup.body.note.className = `note ${noteLevel || level}`;
				this.popup.body.note.inner.innerHTML = note;
			} else
				this.popup.body.note.style.display = "none";

			if (customNode && customNode.classList) {
				customNode.classList.add("customNode");
				this.popup.body.replaceChild(customNode, this.popup.body.customNode);
				this.popup.body.customNode = customNode;
			} else
				this.popup.body.customNode.style.display = "none";

			//* BODY BUTTON

			this.popup.header.top.close.onclick = () => {
				resolve("close");
				this.hide();
			}

			emptyNode(this.popup.body.button);
			let buttonKeyList = Object.keys(buttonList);
			if (buttonKeyList.length) {
				for (let key of buttonKeyList) {
					let item = buttonList[key];
					let button = document.createElement("button");

					button.classList.add("sq-btn", item.color || "blue", item.full ? "full" : "normal");
					button.innerText = item.text || "Text";
					button.onclick = item.onClick || null;
					button.returnValue = key;
					button.dataset.soundhover = "";
					button.dataset.soundselect = "";

					if (typeof sounds !== "undefined")
						sounds.applySound(button);

					if (!(typeof item.resolve === "boolean") || item.resolve !== false)
						button.addEventListener("mouseup", e => {
							resolve(e.target.returnValue);
							this.hide();
						});

					this.popup.body.button.appendChild(button);
				}
			}

			this.popupNode.classList.add("show");
			this.showing = true;

			if (typeof sounds !== "undefined")
				sounds.select();
		})
	},

	hide() {
		this.popupNode.classList.remove("show");

		if (this.showing)
			this.popup.header.removeChild(fcfn(this.popup.header, "triBgContainer"));

		this.showing = false;
		emptyNode(this.popup.body.button);
	}
}

const __connection__ = {
	enabled: true,
	onlineState: "online",
	checkEvery: 2000,
	checkInterval: null,
	checkCount: 0,
	onDisconnected: () => {},
	onRatelimited: () => {},
	__checkTime: 0,
	__sbarItem: null,
	__listeners: [],

	async stateChange(state = "online", data = {}) {
		return new Promise((resolve, reject) => {
			if (!this.enabled) {
				resolve({ code: 0, description: "Module Disabled", data: { disabled: true } });
				return;
			}

			const s = ["online", "offline", "ratelimited"];
			if (!typeof state === "string" || state === this.onlineState || s.indexOf(state) === -1) {
				let t = {code: -1, description: `Unknown state or rejected: ${state}`}
				reject(t);
				return;
			}

			clog("INFO", `We just went`, {
				text: state,
				color: flatc("yellow")
			});

			this.onlineState = state;
			this.__triggerOnStateChange(state);
			clearInterval(this.checkInterval);

			switch(state) {
				case "online":
					clog("okay", "Đã kết nối tới máy chủ.");
					if (this.__sbarItem)
						this.__sbarItem.remove();
					resolve();
					break;

				case "offline":
					let checkerHandler = () => {}
					let checkTimeout = null;
					let doCheck = true;

					clog("lcnt", "Mất kết nối tới máy chủ.");
					this.checkCount = 0;
					this.__sbarItem = (typeof sbar !== "undefined") ? sbar.additem("Đang thử kết nối lại...", "spinner", {align: "right"}) : null;

					// Bind check handler
					this.onDisconnected({ onCount: (f) => checkerHandler = f });

					let checker = async () => {
						this.checkCount++;
						if (this.__sbarItem)
							this.__sbarItem.change(`Đang thử kết nối lại... [Lần ${this.checkCount}]`);

						checkerHandler(this.checkCount);

						let data = await checkServer(window.location.origin);

						if (data.online) {
							doCheck = false;
							this.stateChange("online");
							checkerHandler("connected");
							resolve();
						}
					}

					let checkHandle = async () => {
						clearTimeout(checkTimeout);

						if (!doCheck)
							return;

						// Start time
						let timer = new stopClock();

						try {
							await checker();
						} catch(e) {}

						checkTimeout = setTimeout(() => checkHandle(), this.checkEvery - timer.stop * 1000);
					}

					checkHandle();
					break;

				case "ratelimited":
					let counterer = () => {}

					clog("lcnt", data.description);
					this.__checkTime = parseInt(data.data.reset);
					this.__sbarItem = (sbar) ? sbar.additem(`Kết nối lại sau [${this.__checkTime}] giây`, "spinner", {align: "right"}) : null;

					this.onRatelimited({
						onCount: (f) => counterer = f,
						data: data
					});

					this.checkInterval = setInterval(() => {
						this.__checkTime--;
						counterer(this.__checkTime);

						if (this.__sbarItem)
							this.__sbarItem.change(`Kết nối lại sau [${this.__checkTime}] giây`);

						if (this.__checkTime <= 0) {
							this.stateChange("online");
							resolve();
						}
					}, 1000);
					break;
			}
		});
	},

	onStateChange(f) {
		if (typeof f === "function")
			this.__listeners.push(f);
	},

	__triggerOnStateChange(state) {
		for (let i of this.__listeners)
			i(state);
	}

}

//? =================
//?    SCRIPT INIT

if (typeof document.__onclog === "undefined")
	document.__onclog = (lv, t, m) => {};

let sc = new stopClock();
clog("info", "Log started at:", {
	color: flatc("green"),
	text: (new Date()).toString()
})

// Error handling

window.addEventListener("error", e => {
	clog("crit", {
		color: flatc("red"),
		text: e.message
	}, "at", {
		color: flatc("aqua"),
		text: `${e.filename}:${e.lineno}:${e.colno}`
	})
})

// window.addEventListener("unhandledrejection", (e) => {
//      promise: e.promise; reason: e.reason
// })