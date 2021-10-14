//? |-----------------------------------------------------------------------------------------------|
//? |  /assets/js/belibrary.js                                                                      |
//? |                                                                                               |
//? |  Copyright (c) 2018-2021 Belikhun. All right reserved                                         |
//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
//? |-----------------------------------------------------------------------------------------------|

const HTTP_STATUS_MESSAGES = {
	100: `Continue`,
	101: `Switching Protocols`,
	102: `Processing`,

	// 2×× Success
	200: `OK`,
	201: `Created`,
	202: `Accepted`,
	203: `Non-authoritative Information`,
	204: `No Content`,
	205: `Reset Content`,
	206: `Partial Content`,
	207: `Multi-Status`,
	208: `Already Reported`,
	226: `IM Used`,

	// 3×× Redirection
	300: `Multiple Choices`,
	301: `Moved Permanently`,
	302: `Found`,
	303: `See Other`,
	304: `Not Modified`,
	305: `Use Proxy`,
	307: `Temporary Redirect`,
	308: `Permanent Redirect`,

	// 4×× Client Error
	400: `Bad Request`,
	401: `Unauthorized`,
	402: `Payment Required`,
	403: `Forbidden`,
	404: `Not Found`,
	405: `Method Not Allowed`,
	406: `Not Acceptable`,
	407: `Proxy Authentication Required`,
	408: `Request Timeout`,
	409: `Conflict`,
	410: `Gone`,
	411: `Length Required`,
	412: `Precondition Failed`,
	413: `Payload Too Large`,
	414: `Request-URI Too Long`,
	415: `Unsupported Media Type`,
	416: `Requested Range Not Satisfiable`,
	417: `Expectation Failed`,
	418: `I'm a teapot`,
	421: `Misdirected Request`,
	422: `Unprocessable Entity`,
	423: `Locked`,
	424: `Failed Dependency`,
	426: `Upgrade Required`,
	428: `Precondition Required`,
	429: `Too Many Requests`,
	431: `Request Header Fields Too Large`,
	444: `Connection Closed Without Response`,
	451: `Unavailable For Legal Reasons`,
	499: `Client Closed Request`,

	// 5×× Server Error
	500: `Internal Server Error`,
	501: `Not Implemented`,
	502: `Bad Gateway`,
	503: `Service Unavailable`,
	504: `Gateway Timeout`,
	505: `HTTP Version Not Supported`,
	506: `Variant Also Negotiates`,
	507: `Insufficient Storage`,
	508: `Loop Detected`,
	510: `Not Extended`,
	511: `Network Authentication Required`,
	599: `Network Connect Timeout Error`,
}

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
	timeout = 0,
	formEncodeURL = false
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
			if (formEncodeURL) {
				formData = Array();

				for (let key of Object.keys(form))
					formData.push(`${key}=${encodeURIComponent(form[key])}`);

				formData = formData.join("&");
			} else {
				formData = new FormData();
				
				for (let key of Object.keys(form))
					formData.append(key, form[key]);
			}
		}

		let queryKey = Object.keys(query);
		for (let key of queryKey)
			url += `${(queryKey[0] === key) ? "?" : ""}${key}=${query[key]}${(queryKey[queryKey.length - 1] !== key) ? "&" : ""}`;
			
		url = encodeURI(url);

		xhr.upload.addEventListener("progress", e => onUpload(e), false);
		xhr.addEventListener("progress", e => onDownload(e), false);

		xhr.addEventListener("readystatechange", async function() {
			let statusText = (typeof HTTP_STATUS_MESSAGES[this.status] !== "undefined")
				? HTTP_STATUS_MESSAGES[this.status]
				: this.statusText;

			if (this.readyState === this.DONE) {
				if (this.status === 0 && this.responseText === "") {
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
					}, statusText);

					let errorObj = { code: 1, description: `HTTP ${this.status}: ${statusText} (${method} ${url})`, data: { status: this.status, method, url } }
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

					if (!response.status)
						response.status = this.status;

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
							}, statusText, ` >>> ${response.description}`);
	
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

						let errorObj = { code: 3, description: `HTTP ${this.status}: ${statusText} (${method} ${url})`, data: response }
						error(errorObj);
						reject(errorObj);

						return;
					}

					data = response;
				} else {
					response = this.responseText;

					if (this.status >= 400) {
						let code = `HTTP ${this.status}`;
						let text = (statusText === "") ? "?Unknown statusText" : statusText;
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

		let sendData = (raw !== null)
			? raw
			: formData;

		for (let key of Object.keys(header))
			xhr.setRequestHeader(key, header[key]);

		if (method === "POST") {
			if (formEncodeURL)
				xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	
			if (Object.keys(json).length !== 0) {
				sendData = JSON.stringify(json);
				xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
			}
		}

		if (typeof header["Accept"] !== "string")
			xhr.setRequestHeader("Accept", `${type === "json" ? "application/json" : "text/plain"};charset=UTF-8`);

		xhr.send(sendData);
	});
}

function delayAsync(time) {
	return new Promise((resolve, reject) => {
		setTimeout(() => resolve(), time);
	});
}

function nextFrameAsync() {
	return new Promise((resolve, reject) => {
		requestAnimationFrame(() =>  resolve());
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

/**
 * Replace some special character with printable
 * character in html. Mainly use to avoid code
 * execution
 * 
 * @param 	{*} 	string	Input String
 * @returns	New String
 */
function escapeHTML(string) {
	if (typeof string !== "string")
		string = String(string);

	let map = {
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		"\"": "&quot;",
		"'": "&#039;"
	}

	return string.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Truncate String if String's length is too large
 * @param {String}	string	String to truncate 
 * @param {Number}	length	Maximum length of string
 * @returns {String}
 */
function truncateString(string, length = 20, {
	surfix = "..."
} = {}) {
	return (string.length > length)
		? string.substr(0, length - surfix.length - 1) + surfix
		: string;
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

/**
 * This function is Deprecated!. We should avoid using
 * this function as much as possible.
 * 
 * Please use `makeTree()` instead!
 * 
 * @param {*} type 
 * @param {*} __class 
 * @param {*} data 
 * @param {*} __keypath 
 */
function buildElementTree(type = "div", __class = [], data = new Array(), __keypath = "") {
	let svgTag = ["svg", "g", "path", "line", "circle", "polyline"]

	/** @type {HTMLElement|SVGElement} */
	let tree = (svgTag.includes(type))
		? document.createElementNS("http://www.w3.org/2000/svg", type)
		: document.createElement(type);
	
	if (typeof __class == "string")
		__class = new Array([__class]);
	tree.classList.add.apply(tree.classList, __class);

	/** @type {HTMLElement} */
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

/**
 * This is the replacement of `buildElementTree()`
 * 
 * @param	{String}		tag			Tag Name
 * @param	{String|Array}	classes		Classes
 * @param	{Object}		child		Child List
 * @param	{String}		path		Path (optional)
 * @returns	{HTMLElement}
 */
function makeTree(tag, classes, child = {}, path = "") {
	let container = document.createElement(tag);
	
	switch (typeof classes) {
		case "string":
			container.classList.add(classes);
			break;
		
		case "object":
			if (classes.length && classes.length > 0)
				container.classList.add(...classes);
			else
				throw { code: -1, description: `makeTree(${path}): Invalid or empty "classes" type: ${typeof classes}` }

			break;
	}

	// If child list is invalid, we can just stop parsing
	// now
	if (typeof child !== "object")
		return container;

	let keys = Object.keys(child);

	for (let key of keys) {
		let item = child[key];
		let currentPath = (path === "")
			? key
			: `${path}.${key}`

		if (typeof container[key] !== "undefined")
			throw { code: -1, description: `makeTree(${currentPath}): Illegal key name: "${key}"` }

		/**
		 * If node key is defined and is an object, this is
		 * possibility a custom element data
		 * 
		 * Example: `createInput()`
		 */
		let customNode;

		try {
			customNode = (item.group && item.group.classList)
				? item.group
				: (item.container && item.container.classList)
					? item.container
					: (item.classList)
						? item
						: null;
		} catch(e) {
			throw { code: -1, description: `makeTree(${currentPath}): Custom node parse failed!`, data: e }
		}

		if (customNode) {
			customNode.setAttribute("key", key);
			customNode.dataset.path = currentPath;
			container.appendChild(customNode);
			container[key] = item;
			continue;
		}

		// Normal Building
		if (typeof item.tag !== "string")
			throw { code: -1, description: `makeTree(${currentPath}): Invalid or undefined "tag" value` }

		/** @type {HTMLElement} */
		let node = makeTree(item.tag, item.class, item.child, currentPath);
		node.dataset.path = currentPath;

		if (typeof item.html === "string")
			node.innerHTML = item.html;

		if (typeof item.text !== "undefined")
			node.innerText = item.text;

		if (typeof item.for === "string")
			node.htmlFor = item.for;

		if (typeof item.data === "object")
			for (let key of Object.keys(item.data))
				node.dataset[key] = item.data[key];

		if (typeof item.attribute === "object")
			for (let key of Object.keys(item.attribute))
				node.setAttribute(key, item.attribute[key]);

		for (let key of Object.keys(item))
			if (!["tag", "class", "child", "html", "for", "text", "data", "attribute"].includes(key) && typeof node[key] !== "undefined")
				node[key] = item[key];

		node.setAttribute("key", key);
		container.appendChild(node);
		container[key] = node;
	}

	return container;
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

/**
 * Is date today??
 * @param	{Date}	date
 * @param	{Date}	today	Date to compare to
 */
function isToday(date, today = new Date()) {
	return (date.getDate() === today.getDate() &&
			date.getMonth() === today.getMonth() &&
			date.getFullYear() === today.getFullYear())
}

/**
 * Get current Week in a year
 * @returns {Number}	Current Week
 */
Date.prototype.getWeek = function() {
	let date = new Date(Date.UTC(this.getFullYear(), this.getMonth(), this.getDate()));
	let dayNum = date.getUTCDay() || 7;
	date.setUTCDate(date.getUTCDate() + 4 - dayNum);
	let yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
	return Math.ceil((((date - yearStart) / 86400000) + 1) / 7)
}

function parseTime(t = 0, {
	forceShowHours = false,
	msDigit = 3,
	showPlus = false,
	strVal = true,
	calcDays = false
} = {}) {
	let d = showPlus ? "+" : "";
	let days = 0;
	
	if (t < 0) {
		t = -t;
		d = "-";
	}

	if (calcDays) {
		days = Math.floor(t / 86400);
		t %= 86400;
	}
	
	let h = Math.floor(t / 3600);
	let m = Math.floor(t % 3600 / 60);
	let s = Math.floor(t % 3600 % 60);
	let ms = pleft(parseInt(t.toFixed(msDigit).split(".")[1]), msDigit);

	return {
		h, m, s, ms, d,
		days,
		str: (strVal)
			? d + [h, m, s]
				.map(v => v < 10 ? "0" + v : v)
				.filter((v, i) => i > 0 || forceShowHours || v !== "00")
				.join(":")
			: null
	}
}

/**
 * Date to human readable time
 * @param {Date} date 
 */
function humanReadableTime(date) {
	let timeString = `${date.getHours()}:${pleft(date.getMinutes(), 2)}`;

	if (date.getSeconds() > 0)
		timeString += `:${pleft(date.getSeconds(), 2)}`;

	let dateString = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
	return `${timeString} ${dateString}`;
}

function formatTime(seconds, {
	ended = "Đã kết thúc",
	surfix = "",
	minimal = false,
	endedCallback = () => {}
} = {}) {
	let time = { năm: 31536000, ngày: 86400, giờ: 3600, phút: 60, giây: 1 },
		res = [];

	if (seconds === 0)
		return "bây giờ";

	if (seconds < 0) {
		endedCallback();
		return ended;
	}

	for (let key in time)
		if (minimal) {
			if (seconds > time[key]) {
				res[0] = `${Math.floor(seconds / time[key])} ${key}${surfix}`
				break;
			}
		} else {
			if (seconds >= time[key]) {
				let val = Math.floor(seconds / time[key]);
				res.push(`${val} ${key}${surfix}`);
				seconds = seconds % time[key];
			}
		}

	return (res.length > 1)
		? res.join(", ").replace(/,([^,]*)$/, " và" + "$1")
		: res[0];
}

function liveTime(element, start = time(new Date()), {
	type = "full",
	count = "up",
	prefix = "",
	surfix = "",
	ended = "Đã kết thúc",
	endedCallback = () => {},
	interval = 1000
} = {}) {
	let updateInterval = setInterval(() => {
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

/**
 * Set date and time input to a specified time
 * @param	{HTMLInputElement}		dateNode	Date Input
 * @param	{HTMLInputElement}		timeNode	Time Input
 * @param	{Number}				value		UNIX Time
 */
 function setDateTimeValue(dateNode, timeNode, value = time()) {
	let date = new Date(value * 1000);

	if (typeof dateNode === "object" && dateNode)
		dateNode.value = [date.getFullYear(), date.getMonth() + 1, date.getDate()].map(i => pleft(i, 2)).join("-");

	if (typeof timeNode === "object" && timeNode)
		timeNode.value = [date.getHours(), date.getMinutes(), date.getSeconds()].map(i => pleft(i, 2)).join(":");
}

function getDateTimeValue(dateNode, timeNode) {
	return time(new Date(`${dateNode.value}T${timeNode.value}`));
}

/**
 * Return number of days between two dates
 * @param	{Date}	start	Start date
 * @param	{Date}	end		End date
 * @returns {Number}
 */
function daysBetween(start, end) {
	return (start.getTime() - end.getTime()) / (1000 * 3600 * 24);
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

/**
 * Returns a number whose value is limited to the given range.
 *
 * Example: limit the output of this computation to between 0 and 255
 * (x * 255).clamp(0, 255)
 *
 * @param		{Number}	value	The input value
 * @param		{Number}	min		The lower boundary of the output range
 * @param		{Number}	max		The upper boundary of the output range
 * @returns		{Number}	A number in the range [min, max]
 */
function clamp(value, min, max) {
	return Math.min(Math.max(value, min), max);
}

class StopClock {
	__time(date) {
		return (typeof date !== "undefined")
			? date.getTime()
			: performance.now();
	}

	/**
	 * Create a new StopClock instance
	 * @param {Date} date 
	 */
	constructor(date) {
		this.start = this.__time(date);
	}

	get stop() {
		return (this.__time() - this.start) / 1000;
	}

	tick() {
		return this.stop;
	}
}

class Pager {
	constructor(container, showCount = 20) {
		if (!container.classList)
			throw { code: -1, description: `Pager: container is not a valid node` }

		this.container = container;
		this.listData = []
		this.renderItemHandler = () => {}
		this.updateHandler = () => {}
		this.filterHandler = null;
		this.showCount = showCount;
		this.apiEndpoint = null;
		this.apiToken = null;
		this.__currentPage = 1;
		this.__maxPage = 1;
	}

	/**
	 * @param {array} list
	 */
	set list(list) {
		if (typeof list !== "object" || typeof list.length !== "number")
			throw { code: -1, description: `(set) Pager.list: not a valid array` }

		this.listData = list;
		this.render();
	}

	/**
	 * @param {String|Object} api
	 */
	set api(api) {
		if ((typeof api !== "string" && typeof api !== "object") || !api.url || !api.token || api === null)
			throw { code: -1, description: `(set) Pager.api: not a valid string|data` }

		this.apiEndpoint = api.url || api;
		if (api.token)
			this.apiToken = api.token;
	}

	renderItem(f) {
		if (typeof f !== "function")
			throw { code: -1, description: `Pager.renderItem(): not a valid function` }

		this.renderItemHandler = f;
	}

	onUpdate(f) {
		if (typeof f !== "function")
			throw { code: -1, description: `Pager.onUpdate(): not a valid function` }

		this.updateHandler = f;
	}

	setFilter(f) {
		if (typeof f !== "function")
			throw { code: -1, description: `Pager.setFilter(): not a valid function` }

		this.filterHandler = f;
	}

	async next() {
		this.__currentPage++;
		await this.render();
	}

	async back() {
		this.__currentPage--;
		await this.render();
	}

	async setPage(page) {
		if (typeof page !== "number" && !["first", "last"].includes(page))
			throw { code: -1, description: `Pager.setPage(${page}): not a valid number/command` }

		this.__currentPage = page;
		await this.render();
	}

	async render() {
		if (this.__currentPage < 1 || this.__currentPage === "first")
			this.__currentPage = 1;

		if (this.apiEndpoint) {
			if (this.__currentPage > this.__maxPage || this.__currentPage === "last")
				this.__currentPage = this.__maxPage;

			let response = {}
			try {
				response = await myajax({
					url: this.apiEndpoint,
					method: "POST",
					form: {
						action: "getData",
						token: this.apiToken,
						show: this.showCount,
						page: this.__currentPage
					}
				});
			} catch(e) {
				if (e.data.code === 6) {
					clog("WARN", `Không tồn tại trang ${this.currentPage} của nhật ký hệ thống.`, e.data.data);
					this.__currentPage = 1;
					this.__maxPage = e.data.data.maxPage;
					await this.render();

					return;
				}

				throw e;
			}

			this.__maxPage = response.data.maxPage
			this.updateHandler({
				total: response.data.total,
				maxPage: this.__maxPage,
				currentPage: this.__currentPage,
				from: response.data.from,
				to: response.data.to
			});

			emptyNode(this.container);
	
			for (let i = 0; i <= response.data.lists.length; i++)
				if (response.data.lists[i]) {
					let node = null;

					try {
						node = this.renderItemHandler(response.data.lists[i], this.container);
					} catch(e) {
						clog("ERRR", `Pager.render(): An error occured while processing handler for item`, response.data.lists[i], e);
						continue;
					}

					if (typeof node === "object" && node.classList && node.tagName)
						this.container.appendChild(node);
				} else
					clog("DEBG", `Pager.render(): listData does not contain data at index`, { text: i, color: flatc("red") });
		} else {
			let listData = (typeof this.filterHandler === "function")
				? this.listData.filter(this.filterHandler)
				: this.listData;

			let total = Math.max(listData.length, 1);
			let showCount = (this.showCount > 0)
				? this.showCount
				: total;

			let maxPage = parseInt(Math.floor(total / showCount) + ((total % showCount === 0) ? 0 : 1));
	
			if (this.__currentPage > maxPage || this.__currentPage === "last")
				this.__currentPage = maxPage;
	
			let from = (this.__currentPage - 1) * showCount;
			let to = Math.min(this.__currentPage * showCount - 1, total - 1);
	
			this.updateHandler({ total, maxPage, currentPage: this.__currentPage, from, to });
			emptyNode(this.container);
	
			for (let i = from; i <= to; i++)
				if (listData[i]) {
					let node = null;

					try {
						node = this.renderItemHandler(listData[i], this.container);
					} catch(e) {
						clog("ERRR", `Pager.render(): An error occured while processing handler for item`, listData[i], e);
						continue;
					}

					if (typeof node === "object" && node.classList && node.tagName)
						this.container.appendChild(node);
				} else
					clog("DEBG", `Pager.render(): listData does not contain data at index`, { text: i, color: flatc("red") });
		}
	}
}

class lazyload {
	constructor({
		container,
		source,
		classes,
		tagName = "div",
		spinner = "simpleSpinner",
		doLoad = true
	} = {}) {
		/** @type {HTMLElement} */
		this.container

		if (container && container.classList)
			this.container = container;
		else
			this.container = document.createElement(tagName);

		/** @type	{String}	Source */
		this._src = null;
		this.isLoaded = false;
		this.isErrored = false;
		this.onLoadedHandler = []
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

		this.source = source;
		this.spinner = document.createElement("div");
		this.spinner.classList.add(spinner);
		this.spinner.setAttribute("spinner", "true");
		this.container.append(this.spinner);

		if (doLoad)
			this.load();
	}

	load(src) {
		if (!this._src)
			return false;

		if (src)
			this._src = src;

		this.src = this._src;
		return true;
	}

	/**
	 * @param {String|Object} source
	 */
	set source(source) {
		let node;

		switch (typeof source) {
			case "string":
				// Assume as Image Src
				node = document.createElement("img");
				this._src = source;
				break;
		
			case "object":
				if (source.classList)
					// Source is a Node. We just need to append it in container
					node = source;
				else if (source.type && source.src) {
					switch (source.type) {
						case "image":
						case "iframe":
							node = document.createElement(source.type);
							this._src = source.src;
							break;

						case "document":
							node = document.createElement("embed");
							this._src = source.src;
							break;

						default:
							throw { code: -1, description: `lazyload: source.type >>> ${source.type} is not a valid type` }
					}
				} else
					throw { code: -1, description: `lazyload: source is not a valid node/object` }
				break;

			default:
				break;
		}

		if (node) {
			node.addEventListener("load", () => this.loaded = true);
			node.addEventListener("error", () => this.errored = true);

			if (this.sourceNode) {
				this.container.replaceChild(node, this.sourceNode);
				this.sourceNode = node;
			} else {
				this.container.insertBefore(node, this.container.firstChild);
				this.sourceNode = node;
			}
		}
	}

	/**
	 * @param {String} src
	 */
	set src(src) {
		if (!this.sourceNode)
			throw { code: -1, description: `lazyload: cannot load source because sourceNode hasn't been initialized properly` }

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

	/** @returns {Boolean} */
	get errored() {
		return this.isErrored;
	}

	/**
	 * @param {Function}	f	Handler
	 */
	onLoaded(f) {
		if (typeof f !== "function")
			throw { code: -1, description: `lazyload.onLoaded: not a valid function` }

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

class Queue {
	/**
	 * 
	 * @param {Array}	list 
	 */
	constructor(list) {
		this.queueList = []
		this.handlers = []
		this.completeHandlers = []
		this.queuePos = 0;
		this.handlerPos = 0;
	
		/**
		 * @type {Boolean}
		 */
		this.isLooping = true;

		/**
		 * @type {Boolean}	Running state of Queue
		 */
		this.running = false;

		this.list = list;
	}

	/**
	 * @param {Array}	list
	 */
	set list(list) {
		if (typeof list !== "object" || !list.length)
			throw { code: -1, description: `Queue.list: not a valid array` }

		this.queueList = list;

		if (this.queuePos > list.length - 1)
			this.queuePos = list.length - 1;
	}

	addHandler(f) {
		if (typeof f !== "function")
			throw { code: -1, description: `Queue.addHandler(): not a valid function` }

		let insPos = this.handlers.push({
			free: true,
			handler: f
		});

		this.assign();
		return insPos;
	}

	removeHandler(pos) {
		if (typeof pos !== "number" || !this.queueList[pos])
			throw { code: -1, description: `Queue.removeHandler(${pos}): not a valid number or hander does not exist` }

		this.handlers = this.handlers.splice(pos, 1);
	}

	start() {
		if (this.running)
			throw { code: -1, description: `Queue.start(): Queue is still running` }

		this.running = true;
		this.assign();
	}

	stop() {
		this.running = false;
		this.queuePos = 0;
		this.handlerPos = 0;
	}

	assign() {
		if (!this.running)
			return { code: 0, description: `Queue: Stopped` }

		let assigned = 0;

		for (let item of this.handlers)
			if (item.free && this.queuePos < this.queueList.length) {
				item.free = false;
				item.handler(this.queueList[this.queuePos++])
					.then(() => {
						item.free = true;
						this.assign();
					})
					.catch((error) => {
						clog("ERRR", `Queue.assign(): handler returned an error:`, error);
						item.free = true;
						this.assign();
					});

				assigned++;

				if (this.queuePos >= this.queueList.length - 1 && this.isLooping)
					this.queuePos = 0;
			}

		if (!this.isLooping && assigned === 0 && this.handlers.length > 0) {
			this.stop();
			this.completeHandlers.forEach(f => f());
		}
	}

	onComplete(f) {
		if (typeof f !== "function")
			throw { code: -1, description: `Queue.onComplete(): not a valid function` }

		this.completeHandlers.push(f);
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
	const LIGHTCOLOR = ["lightBlue"]

	let getRandBright = (color) => DARKCOLOR.includes(color)
		? randBetween(1.1, 1.3, false)
		: (LIGHTCOLOR.includes(color)
			? randBetween(0.96, 1.05, false)
			: randBetween(0.9, 1.2, false))

	let current = element.querySelector(":scope > .triBgContainer");

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
		let randBright = getRandBright(color);
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
				let randBright = getRandBright(color);
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

/**
 * Pick a random item in an Array
 * @param {Array} array 
 */
function randItem(array) {
	if (typeof array.length !== "number")
		throw { code: -1, description: `randItem(): not a valid array` }

	return array[randBetween(0, array.length - 1, true)];
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

		// Safe executing update function to prevent stopping
		// animation entirely
		try {
			if (animate(Math.min(timingFunction(tPoint), 1)) === false)
				// Stop Animator
				tPoint = 1.1;
		} catch (e) {
			let error = parseException(e);
			clog("WARN", `Animator().update(): [${error.code}] ${error.description}`);
		}

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

if (typeof $ !== "function")
	/**
	 * A shorthand of querySelector
	 * @param	{String}	selector	Selector
	 * @returns	{HTMLElement}
	 */
	function $(query) {
		let r = document.querySelector(query);

		if (!r)
			clog("WARN", `Could not find any element with query: ${query}`);

		return r;
	}

/**
 * Remove all childs in a Node
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
 * Create Input Element, require `input.css`
 * @param	{Object}
 */
function createInput({
	type = "text",
	id = randString(6),
	label = "Sample Input",
	value = "",
	color = "blue",
	required = false,
	autofill = true,
	spellcheck = false,
	options = {}
} = {}) {
	// Check valid input type can be used in this api. Will throw an error when input type is invalid
	// Some types are not included because there are api to create that specific input
	//
	// See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#input_types
	if (!["text", "textarea", "email", "password", "color", "number", "date", "time", "select", "file", "datetime-local", "month", "week", "tel", "url"].includes(type))
		throw { code: -1, description: `createInput(${type}): Invalid type: ${type}` }

	let container = makeTree("span", "sq-input", {
		input: {
			tag: ["textarea", "select"].includes(type) ? type : "input",
			class: "input",
			type,
			id,
			placeholder: label,
			autocomplete: autofill ? "on" : "off",
			spellcheck: !!spellcheck,
			required
		},

		outline: { tag: "div", class: "outline", child: {
			leading: { tag: "span", class: ["notch", "leading"] },

			label: { tag: "span", class: ["notch", "label"], child: {
				label: { tag: "label", htmlFor: id, text: label }
			}},

			trailing: { tag: "span", class: ["notch", "trailing"] }
		}}
	});

	container.dataset.color = color;
	container.dataset.soundhoversoft = "";
	container.dataset.soundselectsoft = "";

	if (typeof sounds === "object")
		sounds.applySound(container, ["soundhoversoft", "soundselectsoft"]);

	switch(type) {
		case "textarea":
			container.input.style.fontFamily = "Consolas";
			container.input.style.fontWeight = "bold";
			container.input.style.fontSize = "15px";
			break;

		case "select": {
			for (let key of Object.keys(options)) {
				let option = document.createElement("option");
				option.value = key;
				option.innerHTML = options[key];

				container.input.appendChild(option);
			}

			break;
		}
	}

	// Events
	let onInputHandlers = [];
	let onChangeHandlers = [];

	container.input.addEventListener("input", (e) => onInputHandlers.forEach(f => f(container.input.value, e)));
	container.input.addEventListener("change", (e) => onChangeHandlers.forEach(f => f(container.input.value, e)));
	container.input.value = value;

	return {
		group: container,

		/** @type {HTMLInputElement} */
		input: container.input,

		set({
			value,
			label,
			options
		}) {
			if (typeof options === "object" && container.input.tagName.toLowerCase() === "select") {
				emptyNode(container.input);

				for (let key of Object.keys(options)) {
					let option = document.createElement("option");
					option.value = key;
					option.innerHTML = options[key];

					container.input.appendChild(option);
				}
			}

			if (typeof value !== "undefined") {
				container.input.value = value;
				container.input.dispatchEvent(new Event("input"));
				container.input.dispatchEvent(new Event("change"));
			}

			if (label)
				container.input.innerText = label;
		},

		/**
		 * @param {function} f
		 */
		onInput: (f) => {
			if (typeof f !== "function")
				throw { code: -1, description: `createInput(${type}).onInput(): Not a valid function` }

			onInputHandlers.push(f);
			f(container.input.value, null);
		},

		/**
		 * @param {function} f
		 */
		onChange: (f) => {
			if (typeof f !== "function")
				throw { code: -1, description: `createInput(${type}).onChange(): Not a valid function` }

			onChangeHandlers.push(f);
			f(container.input.value, null);
		}
	}
}

/**
 * Create Checkbox Element, require switch.css
 */
function createCheckbox({
	label = "Sample Checkbox",
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

/**
 * Create Switch Element, require switch.css
 */
 function createSwitch({
	label = "Sample Switch",
	value = false,
	color = "blue",
	type = "checkbox",
	id = `switch_${randString(8)}`
} = {}) {
	let container = document.createElement("div");
	container.classList.add("checkboxContainer");
	sounds.applySound(container, ["soundhoversoft"]);

	let title = document.createElement("span");
	title.innerHTML = label;

	let switchLabel = document.createElement("div");
	switchLabel.classList.add("sq-switch");
	switchLabel.dataset.color = color;

	let input = document.createElement("input");
	input.classList.add("checkbox");
	input.id = id;
	input.type = type;
	input.checked = value;

	if (typeof sounds === "object")
		sounds.applySound(input, ["soundcheck"]);

	let track = document.createElement("label");
	track.classList.add("track");
	track.htmlFor = id;

	switchLabel.appendChild(input);
	switchLabel.appendChild(track);
	container.appendChild(title);
	container.appendChild(switchLabel);

	return {
		group: container,
		input,
		title,
		label: switchLabel
	}
}

function createSelectInput({
	icon,
	color = "blue",
	fixed = false,
	options = {},
	value
} = {}) {
	let container = makeTree("div", "sq-selector", {
		current: { tag: "div", class: "current", child: {
			icon: { tag: "icon", class: "icon" },
			value: { tag: "t", class: "value" },
			arrow: { tag: "icon", class: "arrow", data: { icon: "arrowDown" } }
		}},

		select: { tag: "div", class: "select", child: {
			list: { tag: "div", class: "list" }
		}}
	});

	container.current.icon.style.display = "none";

	if (typeof sounds === "object")
		sounds.applySound(container.current, ["soundhover"]);

	if (typeof Scrollable === "function")
		new Scrollable(container.select, {
			content: container.select.list
		});

	/** @type {HTMLDivElement} */
	let activeNode = undefined;
	let activeValue = undefined;
	let currentOptions = {}
	let changeHandlers = []
	let showing = false;

	const show = () => {
		if (typeof sounds === "object")
			sounds.select(1);

		showing = true;
		container.classList.add("show");
		container.select.style.height = `${Math.min(150, container.select.list.scrollHeight)}px`;
	}

	const hide = (isSelected = false) => {
		if (typeof sounds === "object" && !isSelected)
			sounds.select(1);
		
		showing = false;
		container.classList.remove("show");
		container.select.style.height = null;
	}

	const toggle = () => {
		if (showing)
			hide();
		else
			show();
	}

	const set = ({
		icon,
		color,
		options,
		fixed,
		value
	} = {}) => {
		if (typeof color === "string")
			container.dataset.color = color;

		if (typeof icon === "string") {
			container.current.icon.style.display = null;
			container.current.icon.dataset.icon = icon;
		} else if (typeof icon !== "undefined")
			container.current.icon.style.display = "none";

		if (typeof options === "object") {
			emptyNode(container.select.list);
			activeNode = undefined;
			activeValue = undefined;
			currentOptions = {}

			for (let key of Object.keys(options)) {
				let item = document.createElement("div");
				item.classList.add("item");
				item.dataset.value = key;
				item.innerText = options[key];
				options[key] = item;

				if (typeof sounds === "object")
					sounds.applySound(item, ["soundhoversoft"]);

				item.addEventListener("click", () => {
					if (activeNode)
						activeNode.classList.remove("active");
					
					activeNode = item;
					activeValue = item.dataset.value;
					item.classList.add("active");
					container.current.value.innerText = item.innerText;
					changeHandlers.forEach(f => f(item.dataset.value));

					if (typeof sounds === "object")
						sounds.soundToggle(sounds.sounds.valueChange);

					hide(true);
				});

				container.select.list.appendChild(item);
			}

			currentOptions = options;
		}

		if (typeof fixed === "boolean") {
			container.classList[fixed ? "add" : "remove"]("fixed");
		}

		if (typeof value === "string" && currentOptions[value]) {
			if (activeNode)
				activeNode.classList.remove("active");

			activeNode = currentOptions[value];
			activeNode.classList.add("active");
			activeValue = value;
			container.current.value.innerText = activeNode.innerText;
			changeHandlers.forEach(f => f(activeValue));
		}
	}

	set({ icon, color, options, fixed, value });

	container.current.addEventListener("click", () => toggle());

	return {
		group: container,
		showing,
		value: () => activeValue,
		show,
		hide,
		set,

		onChange: (f) => {
			if (typeof f !== "function")
				throw { code: -1, description: `createSelectInput().onChange(): not a valid function` }

			changeHandlers.push(f);

			if (activeValue)
				f(activeValue);
		}
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

	let mouseDownTick = 0;
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
		mouseDownTick++;
		if (mouseDownTick > 1)
			o.classList.add("dragging");

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

	// Event train
	o.input.addEventListener("input", (e) => {
		inputHandlers.forEach(f => f(parseFloat(e.target.value), e));
		update(e);
	});

	o.input.addEventListener("change", (e) => changeHandlers.forEach(f => f(parseFloat(e.target.value), e)));
	o.addEventListener("mouseup", () => {
		o.classList.remove("dragging");
		mouseDownTick = 0;
	});

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
function createButton(text, {
	color = "blue",
	element = "button",
	type = "button",
	style = "default",
	classes,
	icon = null,
	align = "left",
	complex = false,
	triangleCount = 16,
	disabled = false
} = {}) {
	let button = document.createElement(element);
	button.type = type;
	button.dataset.style = style;
	button.dataset.color = color;
	button.disabled = disabled;
	button.classList.add("sq-btn");

	switch (typeof classes) {
		case "string":
			button.classList.add(classes);
			break;
		
		case "object":
			if (classes.length && classes.length > 0)
				button.classList.add(...classes);
			else
				throw { code: -1, description: `createButton(): Invalid or empty "classes" type: ${typeof classes}` }

			break;
	}

	if (icon)
		button.innerHTML = `<icon class="${align}" data-icon="${icon}"></icon>`;

	let textNode = document.createElement("span");
	textNode.classList.add("text");
	button.changeText = (text) => textNode.innerText = text;

	if (typeof text === "undefined" || text === null || text === "icon") {
		button.classList.add("empty");
	} else {
		textNode.innerText = text;

		if (align === "left")
			button.appendChild(textNode);
		else
			button.insertBefore(textNode, button.firstChild);
	}

	let spinner = document.createElement("div");
	spinner.classList.add("simpleSpinner");
	button.appendChild(spinner);

	button.loading = (loading) => {
		if (loading) {
			button.disabled = true;
			button.dataset.loading = true;
		} else {
			button.disabled = false;
			button.removeAttribute("data-loading");
		}
	}

	if (complex && style !== "flat")
		button.background = triBg(button, {
			scale: 1.6,
			speed: 8,
			color: color,
			triangleCount
		});

	if (typeof sounds === "object")
		sounds.applySound(button, ["soundhover", "soundselect"]);

	return button;
}

function createImageInput({
	id = randString(6),
	resetText = "Đặt Lại",
	accept = "image/*",
	src = "//:0"
} = {}) {
	if (!src)
		src = "//:0";

	let container = makeTree("div", "imageInput", {
		input: { tag: "input", type: "file", id, accept },
		image: { tag: "label", htmlFor: id, title: "Chọn Ảnh" },

		clear: { tag: "icon", class: "clear", title: "Loại Bỏ Ảnh", data: { icon: "close" } },
		reset: createButton(resetText, { color: "pink", complex: true })
	});

	let resetHandlers = []
	let image = new lazyload({
		container: container.image,
		source: src,
		classes: ["imageBox", item.display || "square"]
	});

	container.input.addEventListener("change", (e) => {
		let file = e.target.files[0];

		if (file) {
			image.src = URL.createObjectURL(file);
			container.clear.classList.add("show");
		} else
			container.clear.classList.remove("show");
	});

	container.clear.addEventListener("click", () => {
		container.clear.classList.remove("show");
		container.input.value = null;
		image.src = src;
	});

	container.reset.addEventListener("click", async (e) => {
		container.reset.disabled = true;

		for (let f of resetHandlers)
			await f(e);

		container.reset.disabled = false;
	});

	container.input.dispatchEvent(new Event("change"));

	return {
		group: container,
		input: container.input,
		image,

		src(src = "//:0") {
			if (!src)
				src = "//:0";

			image.src = src;
			container.reset.disabled = (src === "//:0");
		},

		clear() {
			container.clear.classList.remove("show");
			container.input.value = null;
			image.src = src;
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
	message = "Smaple Note",
	style = "flat"
} = {}) {
	let container = document.createElement("div");
	container.classList.add("note");
	container.dataset.level = level;
	container.dataset.style = style;

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

/**
 * Create Timer Element
 * @param	{Number|Object}	time	Time in seconds or object from parseTime()
 */
function createTimer(time = 0, {
	style = "normal"
} = {}) {
	let timer = document.createElement("timer");
	timer.dataset.style = style;

	let days = document.createElement("days");
	let inner = document.createElement("span");
	let ms = document.createElement("ms");

	timer.append(days, inner, ms);

	const set = ({
		time,
		style
	}) => {
		if (typeof time === "number")
			time = parseTime(time);

		if (typeof time === "object") {
			days.innerText = (time.days != 0) ? `${time.d}${time.days}` : "";
			inner.innerText = time.str;
			ms.innerText = time.ms;
		}

		if (typeof style === "string")
			timer.dataset.style = style;
	}

	set({ time, style });

	return {
		group: timer,
		set,

		toggleMs: (show) => {
			ms.style.display = (show) ? null : "none";
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
//? |  Copyright (c) 2018-2021 Belikhun. All right reserved                                         |
//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
//? |-----------------------------------------------------------------------------------------------|

function clog(level, ...args) {
	const font = "Consolas";
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

	out[0] = "%c ";
	out[1] = `padding-left: ${["INFO", "OKAY", "DEBG"].includes(level) ? 10 : 0}px`;

	// i | 1   2   3   4   5     6
	// j | 0   1   2   3   4     5
	// n | 1 2 3 4 5 6 7 8 9 10 11
	for (let i = 1; i <= text.length; i++) {
		item = text[i - 1];
		if (typeof item === "string" || typeof item === "number") {
			if (i > 4)
				str += `${item} `;

			out[0] += `%c${item} `;
			out[n++] = `font-size: ${size}px; font-family: ${font}; color: ${flatc("black")}`;
		} else if (typeof item === "object") {
			if (item === null || item === undefined || typeof item.text === "undefined") {
				out[n++] = item;

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
				out[n++] = out[n++] = `font-size: ${size}px; color: ${item.color}; font-weight: bold;`;
			} else {
				out[0] += " ";
				out[n++] = `font-size: ${size}px; font-family: ${font}; color: ${item.color}`;
			}
		} else
			console.error(`clog(): unknown type ${typeof item}`, item);
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
		this.popup.body.note.style.display = "none";

		if (typeof sounds !== "undefined")
			sounds.applySound(this.popup.header.top.close, ["soundhover", "soundselect"]);

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
			
			for (let key of buttonKeyList) {
				let item = buttonList[key];

				let button = createButton(item.text || "Text", {
					color: item.color,
					icon: item.icon || null,
					complex: !!item.complex
				});

				button.classList.add(item.full ? "full" : "normal");
				button.onclick = item.onClick || null;
				button.returnValue = key;

				if (!(typeof item.resolve === "boolean") || item.resolve !== false)
					button.addEventListener("mouseup", () => {
						resolve(key);
						this.hide();
					});

				this.popup.body.button.appendChild(button);
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
						let timer = new StopClock();

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

const mouseCursor = {
	/**
	 * X Position of Mouse cursor in the screen
	 * @type {Number}
	 */
	x: 0,

	/**
	 * Y Position of Mouse cursor in the screen
	 * @type {Number}
	 */
	y: 0,

	/**
	 * The change amount in X coordinates between current position
	 * and last position
	 * @type {Number}
	 */
	deltaX: 0,

	/**
	 * The change amount in Y coordinates between current position
	 * and last position
	 * @type {Number}
	 */
	deltaY: 0,

	/**
	 * Current element under the cursor
	 * @type {HTMLElement}
	 */
	target: null,

	/**
	 * Update Function
	 * @param {MouseEvent} event 
	 */
	update(event) {
		this.x = event.clientX;
		this.y = event.clientY;
		this.deltaX = event.movementX;
		this.deltaY = event.movementY;
	}
}

//? =================
//?    SCRIPT INIT

if (typeof document.__onclog === "undefined")
	document.__onclog = (lv, t, m) => {}

window.addEventListener("mousemove", (e) => mouseCursor.update(e), { passive: true });

let sc = new StopClock();
clog("INFO", "Log started at:", {
	color: flatc("green"),
	text: (new Date()).toString()
})

// Error handling
window.addEventListener("error", e => {
	clog("CRIT", {
		color: flatc("red"),
		text: e.message
	}, "at", {
		color: flatc("aqua"),
		text: `${e.filename}:${e.lineno}:${e.colno}`
	})
});

if (typeof String.prototype.replaceAll !== "function")
	/**
	 * Returns a new string with all matches
	 * of a `search` replaced by a `replacement`
	 * 
	 * @param	{String}	search
	 * A String that is to be replaced by replacement.
	 * It is treated as a literal string and is not
	 * interpreted as a regular expression.
	 * 
	 * @param	{String}	replacement
	 * The String that replaces the substring specified
	 * by the specified search parameter.
	 */
	String.prototype.replaceAll = function(search, replacement) {
		return this.replace(new RegExp(search, "g"), replacement);
	}

// window.addEventListener("unhandledrejection", (e) => {
//      promise: e.promise; reason: e.reason
// })