//? |-----------------------------------------------------------------------------------------------|
//? |  /static/js/init.js                                                                           |
//? |                                                                                               |
//? |  Copyright (c) 2018-2021 Belikhun. All right reserved                                         |
//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
//? |-----------------------------------------------------------------------------------------------|

var updateServerHandlers = []

/**
 * Store Server Info
 * @type {Object}
 */
var SERVER = undefined;

/**
 * Store Session Info And User Details
 * @type {Object}
 */
var SESSION = undefined;

/**
 * Store API Token
 * @type {String}
 */
var API_TOKEN = undefined;

/**
 * Fetch server data and update `SERVER`
 * variable in current window
 */
async function updateServerData() {
	let response = await myajax({ url: "/api/server" });

	document.title = response.data.pageTitle;
	window.SERVER = response.data;
	window.SESSION = response.data.SESSION;
	window.API_TOKEN = SESSION.API_TOKEN;
	updateServerHandlers.forEach((f) => f(window.SERVER));
}

function onUpdateServerData(f) {
	if (typeof f !== "function")
		throw { code: -1, description: `onUpdateServerData(): not a valid function` }

	f(window.SERVER);
	return updateServerHandlers.push(f);
}