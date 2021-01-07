//? |-----------------------------------------------------------------------------------------------|
//? |  /assets/js/errorHandler.js                                                                   |
//? |                                                                                               |
//? |  Copyright (c) 2018-2020 Belikhun. All right reserved                                         |
//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
//? |-----------------------------------------------------------------------------------------------|

const parseException = (error) => {
	return {
		code: (typeof error.code === "number" && error.data && error.data.code)
			?	`[${error.code} ${error.data.code}]`
			:	(typeof error.code === "number")
				?	error.code
				:	error.name
				||	error.data.name
				||	`${error.data.data.file}:${error.data.data.line}`,
	
		description: (error.description && error.data && error.data.description)
			?	`${error.description} (${error.data.description}) ${(error.data.data && error.data.data.file) ? `${error.data.data.file}:${error.data.data.line}` : ""}`
			:	error.message
			||	error.description
			||	error.data.message
			||	error.data.description
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

	let errorBox = document.createElement("pre");
	errorBox.classList.add(document.body.classList.contains("dark") ? "dark" : "light", "break");
	errorBox.innerText = `[${e.code}] >>> ${e.description}`;
	errorBox.style.fontSize = "16px";

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
    
    gtag("event", "errored", {
        event_category: "error",
        event_label: "exception",
        value: `${e.code} >>> ${e.description}`
    });
}