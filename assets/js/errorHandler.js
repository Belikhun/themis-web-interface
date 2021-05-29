//? |-----------------------------------------------------------------------------------------------|
//? |  /assets/js/errorHandler.js                                                                   |
//? |                                                                                               |
//? |  Copyright (c) 2018-2021 Belikhun. All right reserved                                         |
//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
//? |-----------------------------------------------------------------------------------------------|

/**
 * Parse error stack
 * @param {Error|Object} error
 */
function parseException(error, inStack = false) {
	/** @type {Number|String} */
	let code = (typeof error === "object")
		? (typeof error.code === "number")
			? (typeof error.status === "number")
				? `${error.code} ${error.status}`
				: error.code
			: (typeof error.name === "string")
				? error.name
				: "ERRR"
		: "ERRR";

	/** @type {String} */
	let description = (typeof error === "object")
		? (typeof error.description === "string")
			? error.description
			: (typeof error.message === "string")
				? error.message
				: "Unknown"
		: "Unknown";

	// File location parser specifically for
	// Error object and my custom api error
	// format (see BLibException)
	let file = undefined;
	if (error instanceof Error) {
		let stack = error.stack;
		file = stack.split("\n")[1];
		file = file.slice(file.indexOf("at ") + 3, file.length);
	} else if (typeof error.data === "object" && typeof error.data.file === "string" && typeof error.data.line === "number")
		file = `${error.data.file}:${error.data.line}`;

	if (file)
		description += ` tại ${file}`;

	// Create a copy of error object without
	// referencing to it
	let _e = { ...error };

	/** @type {Array} */
	let stack = []

	if (!inStack) {
		while (typeof _e.data === "object") {
			let err = parseException(_e.data, true);

			// If no error detail found in the end of the
			// stack, we can stop executing now
			if (!err || err.description === "Unknown")
				break;

			stack.push(`\t[${err.code}] >>> ${err.description}`);
			_e = _e.data;
		}
	}

	return {
		code,
		description,
		stack
	}
}

const errorHandler = async (error, returnable = true) => {
	clog("ERRR", error);

	if (!popup || !popup.initialized)
		return;

	let e = parseException(error);
	let returnBtn = {}

	if (returnable)
		returnBtn.back = { text: "Quay lại", color: "green" }

	let errorLines = [`[${e.code}] >>> ${e.description}`]
	if (e.stack.length > 0)
		errorLines = [ ...errorLines, "", "Stack Trace:", ...e.stack ]

	let errorBox = document.createElement("ul");
	errorBox.classList.add("textView");
	errorBox.innerHTML = errorLines.map(i => `<li>${i}</li>`).join("");

	await popup.show({
		windowTitle: "Error Handler",
		title: "Toang rồi ông Giáo ạ!",
		message: "ERROR OCCURED",
		description: "Một lỗi không mong muốn đã sảy ra!",
		level: "error",
		customNode: errorBox,
		buttonList: {
			contact: { text: "Báo Lỗi", color: "pink", resolve: false, onClick: () => window.open(SERVER.REPORT_ERROR, "_blank") },
			...returnBtn
		}
    })
    
	if (typeof gtag === "function")
		gtag("event", "errored", {
			event_category: "error",
			event_label: "exception",
			value: `${e.code} >>> ${e.description}`
		});
}