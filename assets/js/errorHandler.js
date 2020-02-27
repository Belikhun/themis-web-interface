//? |-----------------------------------------------------------------------------------------------|
//? |  /assets/js/errorHandler.js                                                                   |
//? |                                                                                               |
//? |  Copyright (c) 2018-2020 Belikhun. All right reserved                                         |
//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
//? |-----------------------------------------------------------------------------------------------|

const errorHandler = async (error, returnable = true) => {
	clog("ERRR", error);

	if (!popup || !popup.initialized)
		return;

	let e = (error.code && error.data.code)
		?	`[${error.code} ${error.data.code}]`
		:	error.code ? `[${error.code}]`
		:	error.name
		||	error.data.name
		||	`${error.data.data.file}:${error.data.data.line}`

	let d = (error.description && error.data.description)
		?	`${error.description} (${error.data.description}) ${(error.data.data.file) ? `${error.data.data.file}:${error.data.data.line}` : ""}`
		:	error.message
		||	error.data.message
		||	error.data.description
		||	error.description
		
	let returnBtn = {}

	if (returnable)
		returnBtn.back = { text: "Quay lại", color: "green" }

	let errorBox = document.createElement("pre");
	errorBox.classList.add("dark", "break");
	errorBox.innerText = `${e} >>> ${d}`;
	errorBox.style.fontSize = "16px";

	splash.change({ description: "Lỗi đã sảy ra!" });
	await popup.show({
		windowTitle: "Error Handler",
		title: "Oops!",
		message: "ERROR OCCURED",
		description: "Một lỗi không mong muốn đã sảy ra!",
		level: "error",
		additionalNode: errorBox,
		buttonList: {
			contact: { text: "Báo Lỗi", color: "pink", resolve: false, onClick: () => window.open(SERVER.REPORT_ERROR, "_blank") },
			...returnBtn
		}
    })
    
    gtag("event", "errored", {
        event_category: "error",
        event_label: "exception",
        value: `${e} >>> ${d}`
    });
}