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
	query = Array(),
	form = Array(),
	json = {},
	header = Array(),
	type = "json",
	onUpload = () => {},
	onDownload = () => {},
	force = false,
	changeState = true,
	reRequest = true,
	withCredentials = false,
}, callout = () => {}, error = () => {}) {
	var argumentsList = arguments;

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

		var xhr = new XMLHttpRequest();
		let formData = new FormData();

		for (let key of Object.keys(form))
			formData.append(key, form[key]);

		let queryKey = Object.keys(query);
		for (let key of queryKey)
			url += `${(queryKey[0] === key) ? "?" : ""}${key}=${query[key]}${(queryKey[queryKey.length - 1] !== key) ? "&" : ""}`;

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
					clog("errr", {
						color: flatc("red"),
						text: `HTTP ${this.status}:`
					}, this.statusText, {
						color: flatc("magenta"),
						text: method
					}, {
						color: flatc("pink"),
						text: url
					});

					let errorObj = { code: 1, description: `HTTP ${this.status}: ${this.statusText}` }
					error(errorObj);
					reject(errorObj);

					return;
				}

				if (type === "json") {
					try {
						var res = JSON.parse(this.responseText);
					} catch (data) {
						clog("errr", "Lỗi phân tích JSON");

						let errorObj = { code: 2, description: `Lỗi phân tích JSON`, data: data }
						error(errorObj);
						reject(errorObj);

						return;
					}

					if (this.status >= 400 || (res.code !== 0 && res.code < 100)) {
						clog("errr", {
							color: flatc("magenta"),
							text: method
						}, {
							color: flatc("pink"),
							text: url
						}, {
							color: flatc("red"),
							text: "HTTP " + this.status
						}, this.statusText, ` >>> ${res.description}`);

						if (this.status === 429 && res.code === 32 && reRequest === true) {
							// Waiting for :?unratelimited:?
							await __connection__.stateChange("ratelimited", res);

							clog("debg", "resending request", argumentsList);
							// Resend previous ajax request
							let r = await myajax(...argumentsList)
								.catch(d => {
									reject(d);
									return;
								})
							// Resolve promise
							resolve(r);

							return;
						} else {
							let errorObj = { code: 3, description: `HTTP ${this.status}: ${this.statusText}`, data: res }
							error(errorObj);
							reject(errorObj);

							return;
						}
					}

					data = res;
				} else {
					if (this.status >= 400) {
						let code = "HTTP" + this.status;
						let text = this.statusText;
						let resData = res;

						let header = this.getResponseHeader("output-json");

						if (header) {
							let headerJSON = JSON.parse(header);

							if (!resData)
								resData = headerJSON;

							code = `HTTP ${headerJSON.status} [${headerJSON.code}]`
							text = headerJSON.description;
						}

						clog("errr", {
							color: flatc("red"),
							text: code
						}, text, {
							color: flatc("magenta"),
							text: method
						}, {
							color: flatc("pink"),
							text: url
						});

						let errorObj = { code: 3, description: `${code}: ${text}`, data: resData }
						error(errorObj);
						reject(errorObj);

						return;
					}

					data = this.responseText;
				}

				callout(data);
				resolve(data);
			}
		})

		xhr.open(method, url);
		xhr.withCredentials = withCredentials;

		let sendData = formData;

		for (let key of Object.keys(header))
			xhr.setRequestHeader(key, header[key]);

		if (Object.keys(json).length !== 0) {
			sendData = JSON.stringify(json);
			xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
		}

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
		var retryNth = 0;
		var doCheck = true;

		const __check = async () => {
			var result = false;

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

	var map = {
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

function buildElementTree(type = "div", __class = [], data = new Array(), __keypath = "") {
	var tree = document.createElement(type);
	if (typeof __class == "string")
		__class = new Array([__class]);
	tree.classList.add.apply(tree.classList, __class);
	var objtree = tree;

	for (let i = 0; i < data.length; i++) {
		let d = data[i];

		if (typeof d.list == "object") {
			let k = __keypath + (__keypath === "" ? "" : ".") + d.name;
			var t = buildElementTree(d.type, d.class, d.list, k);

			t.tree.dataset.name = d.name;
			t.tree.dataset.path = k;
			(d.id) ? t.tree.id = d.id : 0;
			(d.for) ? t.tree.htmlFor = d.for : 0;
			(d.inpType) ? t.tree.type = d.inpType : 0;
			(d.text) ? t.tree.innerText = d.text : 0;
			tree.appendChild(t.tree);

			objtree[d.name] = t.tree;
			Object.assign(objtree[d.name], t.obj);
		} else {
			let k = __keypath + (__keypath === "" ? "" : ".") + d.name;
			var t = document.createElement(d.type);
			if (typeof d.class == "string")
				d.class = new Array([d.class]);

			t.classList.add.apply(t.classList, d.class);
			t.dataset.name = d.name;
			t.dataset.path = k;
			(d.id) ? t.id = d.id : 0;
			(d.for) ? t.htmlFor = d.for : 0;
			(d.inpType) ? t.type = d.inpType : 0;
			(d.text) ? t.innerText = d.text : 0;

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
		var xhr = new XMLHttpRequest();
		var pon = {};

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
	var time = { năm: 31536000, ngày: 86400, giờ: 3600, phút: 60, giây: 1 },
		res = [];

	if (seconds === 0)
		return "bây giờ";

	if (seconds < 0) {
		endedCallback();
		return ended;
	}

	for (var key in time)
		if (seconds >= time[key]) {
			var val = Math.floor(seconds / time[key]);
			res.push(val += " " + key);
			seconds = seconds % time[key];
		}

	return res.length > 1 ? res.join(", ").replace(/,([^,]*)$/, " và" + "$1") : res[0];
}

function liveTime(element, start = time(new Date()), { type = "full", count = "up", prefix = "", surfix = "", ended = "Đã kết thúc", endedCallback = () => {}, interval = 1000 } = {}) {
	var updateInterval = setInterval(e => {
		if (!document.body.contains(element)) {
			clog("DEBG", "Live Time Element does not exist in document. Clearing...");
			clearInterval(updateInterval);
			delete element;
			delete updateInterval;
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

				parsed = parseTime(t % 86400, { showPlus: true });
				ts = `<timer><days>${Math.floor(t / 86400)}</days>${parsed.str}<ms>${parsed.ms}</ms></timer>`;
				break;

			case "minimal":
				if (t < 0) {
					endedCallback(element);
					ts = ended;
					break;
				}
				
				parsed = parseTime(t % 86400, { showPlus: true });
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

function convertSize(bytes) {
	let sizes = ["B", "KB", "MB", "GB", "TB"];
	for (var i = 0; bytes >= 1024 && i < (sizes.length -1 ); i++)
		bytes /= 1024;

	return `${round(bytes, 2)} ${sizes[i]}`;
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
	var url = (document.currentScript) ? document.currentScript.src : "unknown";
	return url.substring(url.lastIndexOf("/") + 1);
}

/**
 * Add padding in the left of input if input length is smaller than function length arg.
 *
 * @param {string} inp Input in String
 * @param {number} inp Input in Number
 * @param {number} length Length
 */
function pleft(inp, length = 0, right = false) {
	type = typeof inp;
	inp = (type === "number") ? inp.toString() : inp;
	padd = "";

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

	padd = padd.repeat((length - inp.length < 0) ? 0 : length - inp.length);
	return (right) ? inp + padd : padd + inp;
}

/**
 * My color template
 * 
 * Return HEX string color code
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
 * Return HEX string color code
 *
 * @param	{string}	color
 * @returns	{String}
 */
function oscColor(color) {
	const clist = {
		pink: "#ff66aa",
		green: "#88b400",
		blue: "#44aadd",
		yellow: "#f6c21c",
		brown: "#231B22",
		gray: "#485e74",
		dark: "#042430"
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
	speed = 26,
	color = "gray",
	scale = 2,
	triangleCount = 38
} = {}) {
	let current = element.querySelector(".triBgContainer");
	if (current)
		element.removeChild(current);

	delete current;

	element.classList.add("triBg");
	element.dataset.triColor = color;

	let container = document.createElement("div");
	container.classList.add("triBgContainer");
	container.dataset.count = triangleCount;

	for (let i = 0; i < triangleCount; i++) {
		let randScale = randBetween(0.4, 2.0, false);
		let randBright = ["brown", "dark"].indexOf(color) !== -1
			? randBetween(1.1, 1.3, false)
			: randBetween(0.9, 1.2, false)

		let randLeftPos = randBetween(0, 98, false);
		let delay = randBetween(- speed / 2, speed / 2, false);

		let triangle = document.createElement("span");
		triangle.style.filter = `brightness(${randBright})`;
		triangle.style.transform = `scale(${randScale * scale})`;
		triangle.style.left = `${randLeftPos}%`;
		triangle.style.animationDelay = `${delay}s`;
		triangle.style.animationDuration = `${speed / randScale}s`;

		container.appendChild(triangle);
	}

	element.insertBefore(container, element.firstChild);
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

	for (var i = 0; i < len; i++) {
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
	function $ (selector) { return document.querySelector(selector) };

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
	required = false
} = {}) {
	let formGroup = document.createElement("div");
	formGroup.classList.add("formGroup", color);
	formGroup.dataset.soundhoversoft = "";
	formGroup.dataset.soundselectsoft = "";

	if (sounds)
		sounds.applySound(formGroup);

	let formField = document.createElement(type === "textarea" ? type : "input");
	formField.type = type;
	formField.id = id;
	formField.classList.add("formField");
	formField.placeholder = label;
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
 * Create Switch Element, require switch.css
 * @param	{String}	text		Switch Label
 * @param	{String}	color		Switch Color
 * @param	{String}	value		Switch Value
 * @param	{String}	type		Switch Type
 */
function createSwitch({
	label = "Sample Switch",
	color = "pink",
	value = false,
	type = "checkbox"
} = {}) {
	let container = document.createElement("div");
	container.classList.add("switchContainer");
	container.dataset.soundhoversoft = "";
	sounds.applySound(container);

	let title = document.createElement("span");
	title.innerHTML = label;

	let switchLabel = document.createElement("label");
	switchLabel.classList.add("sq-checkbox", color);

	let input = document.createElement("input");
	input.type = type;
	input.checked = value;
	input.dataset.soundcheck = "";

	if (sounds)
		sounds.applySound(input);

	let mark = document.createElement("span");
	mark.classList.add("checkmark");

	switchLabel.appendChild(input);
	switchLabel.appendChild(mark);
	container.appendChild(title);
	container.appendChild(switchLabel);

	return { group: container, input: input }
}

/**
 * Create Button Element, require button.css
 * @param	{String}	text		Button Label
 * @param	{String}	color		Button Color
 * @returns	{HTMLButtonElement}		Button Element
 */
function createBtn(text, color = "blue") {
	let btn = document.createElement("button");
	btn.type = "button";
	btn.innerText = text;
	btn.classList.add("sq-btn", color);
	btn.dataset.soundhover = "";
	btn.dataset.soundselect = "";

	if (sounds)
		sounds.applySound(btn);

	return btn;
}

cookie = {
	cookie: null,

	getAll() {
		const mycookie = document.cookie.split("; ");
		var dacookie = {};

		for (var i = 0; i < mycookie.length; i++) {
			var t = mycookie[i].split("=");
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
		var exp = "";
		if (days !== 0 && typeof days === "number") {
			var date = new Date();
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
	var date = new Date();
	const rtime = round(sc.stop, 3).toFixed(3);
	var str = "";

	level = level.toUpperCase();
	lc = flatc({
		DEBG: "blue",
		OKAY: "green",
		INFO: "magenta",
		WARN: "yellow",
		ERRR: "red",
		CRIT: "gray",
	}[level])

	text = [
		{
			color: flatc("aqua"),
			text: `${pleft(date.getHours(), 2)}:${pleft(date.getMinutes(), 2)}:${pleft(date.getSeconds(), 2)}`,
			padding: 8,
			seperate: true
		}, {
			color: flatc("blue"),
			text: rtime,
			padding: 8,
			seperate: true
		}, {
			color: flatc("red"),
			text: window.location.pathname,
			padding: 16,
			seperate: true
		}, {
			color: lc,
			text: level,
			padding: 6,
			seperate: true
		}
	]

	text = text.concat(args);
	var n = 2;
	var out = new Array();
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
			if (typeof item.text === "undefined") {
				out[n] = item;
				n += 1;

				if (item.code && item.description)
					str += `[${item.code}] ${item.description} `;
				else
					str += JSON.stringify(item) + " ";

				continue;
			}

			let t = pleft(item.text, ((item.padding) ? item.padding : 0));
			if (i > 4)
				str += `${t} `;

			out[0] += `%c${t}`;

			if (item.seperate) {
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
		const tree = [{type:"div",class:"popupWindow",name:"popup",list:[{type:"div",class:"header",name:"header",list:[{type:"span",class:"top",name:"top",list:[{type:"t",class:["windowTitle","text-overflow"],name:"windowTitle"},{type:"span",class:"close",name:"close"}]},{type:"span",class:"icon",name:"icon"},{type:"t",class:"text",name:"text"}]},{type:"div",class:"body",name:"body",list:[{type:"div",class:"top",name:"top",list:[{type:"t",class:"message",name:"message"},{type:"t",class:"description",name:"description"}]},{type:"div",class:"customNode",name:"customNode"},{type:"div",class:"buttonGroup",name:"button"}]}]}];

		this.tree = buildElementTree("div", "popupContainer", tree);
		this.popupNode = this.tree.tree;
		this.popup = this.tree.obj.popup;
		document.body.insertBefore(this.popupNode, document.body.childNodes[0]);

		this.popup.header.top.close.dataset.soundhover = "";
		this.popup.header.top.close.dataset.soundselect = "";

		if (typeof sounds !== "undefined")
			sounds.applySound(this.popup.header.top.close);

		this.initialized = true;
	},

	show({
		windowTitle = "Popup",
		title = "Title",
		message = "Message",
		description = "Description",
		level = "info",
		icon = null,
		bgColor = null,
		headerTheme = null,
		bodyTheme = null,
		additionalNode = document.createElement("div"),
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

			triBg(this.popup.header, { color: (typeof bgColor === "string") ? bgColor : template.bg });
			this.popup.header.icon.dataset.icon = (typeof icon === "string") ? icon : template.icon;
			this.popup.header.setAttribute("theme", (typeof headerTheme === "string") ? headerTheme : template.h);
			this.popup.body.setAttribute("theme", (typeof bodyTheme === "string") ? bodyTheme : template.b);

			delete template;

			//* HEADER
			this.popup.header.top.windowTitle.innerText = windowTitle;
			this.popup.header.text.innerText = title;

			//* BODY
			this.popup.body.top.message.innerText = message;
			this.popup.body.top.description.innerHTML = description;

			additionalNode.classList.add("customNode");
			this.popup.body.replaceChild(additionalNode, this.popup.body.customNode);
			this.popup.body.customNode = additionalNode;

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

					button.classList.add("sq-btn", item.color || "blue");
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
					var doCheck = true;

					clog("lcnt", "Mất kết nối tới máy chủ.");
					this.checkCount = 0;
					this.__sbarItem = (typeof sbar !== "undefined") ? sbar.additem("Đang thử kết nối lại...", "spinner", {aligin: "right"}) : null;

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
					this.__sbarItem = (sbar) ? sbar.additem(`Kết nối lại sau [${this.__checkTime}] giây`, "spinner", {aligin: "right"}) : null;

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
		for (var i of this.__listeners)
			i(state);
	}

}

//? =================
//?    SCRIPT INIT

if (typeof document.__onclog === "undefined")
	document.__onclog = (lv, t, m) => {};

var sc = new stopClock();
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