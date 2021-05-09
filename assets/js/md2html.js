//? |-----------------------------------------------------------------------------------------------|
//? |  /assets/js/md2html.js                                                                        |
//? |                                                                                               |
//? |  Copyright (c) 2018-2021 Belikhun. All right reserved                                         |
//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
//? |-----------------------------------------------------------------------------------------------|

/**
 * Simple Markdown to HTML (md2html)
 * 
 * @author	@belivipro9x99
 * @version	v1.0
 */
const md2html = {
	/**
	 * List of function for handing line parsing
	 * @type {Array}
	 */
	customLineHandlers: [],

	/**
	 * Parse Markdown text to HTML Element
	 * 
	 * @param	{String}		text	Markdown text to parse
	 * @returns	{HTMLElement}
	 */
	parse(text) {
		if (text === "") {
			let dummy = document.createElement("div");
			dummy.classList.add("md2html");
			return dummy;
		}

		try {
			// Process simple tokens
			text = this.processTokens(text, {
				"(c)": "©", "(C)": "©",
				"(r)": "®", "(R)": "®",
				"(tm)": "™", "(TM)": "™",
				"(p)": "§", "(P)": "§"
			});
	
			// Line by line parsing
			let lines = text.split("\n");
			let currentBlockQuoteLevel = 0;
			let currentListLevel = 0;
			let listLevelType = []
			let nodeInsertList = []
			let nodeInsertLine = []
	
			let isInsideBlock = false;
			let blockType;
			let blockValue;
			let blockLines = []
	
			let isInsideParagraph = false;
			let isInsideTable = false;
			let tableAlign = []

			const addInsList = (node, line) => {
				nodeInsertList.push(node);
				nodeInsertLine[nodeInsertList.length - 1] = line;

				return {
					pos: nodeInsertList.length - 1,
					node
				}
			}
	
			for (let i = 0; i < lines.length; i++) {
				let doWrapParagraph = true;
	
				//* ==================== Horizontal Rules ====================
				if (lines[i] === "___" || lines[i] === "---" || lines[i] === "***") {
					lines[i] = `<hr>`;
					continue;
				}

				//* ==================== Sanitize unfinished open html tag ====================
				lines[i] = this.processRegex(lines[i], /\<[a-zA-Z_:]*[^\>]+(?:\>|$)/gm, (line, item) => {
						if (item[0][item[0].length - 1] !== ">")
							return line.replace(item[0], escapeHTML(item[0]))
						else
							return line;
					}
				);
	
				//* ==================== Heading ====================
				lines[i] = this.processRegex(lines[i], /^(\#{1,6})\s(.*)$/gm, (line, item) =>
					line.replace(item[0], `<h${item[1].length}>${item[2]}</h${item[1].length}>`)
				);
	
				//* ==================== Bold Text ====================
				lines[i] = this.processRegex(lines[i], /([^*_]|^)((\*{2}|\_{2})([^*_]+)\3)/g, (line, item) =>
					line.replace(item[2], `<b>${item[4]}</b>`)
				);
	
				//* ==================== Italic Text ====================
				lines[i] = this.processRegex(lines[i], /(^|[^*_])((\*|\_)([^*_]+)\3)/gm, (line, item) =>
					line.replace(item[2], `<i>${item[4]}</i>`)
				);
	
				//* ==================== Strikethrough Text ====================
				lines[i] = this.processRegex(lines[i], /([^\~]|^)(\~{2})([^\~]+)\2/gm, (line, item) =>
					line.replace(item[0], `<s>${item[3]}</s>`)
				);
	
				//* ==================== Inline Code ====================
				lines[i] = this.processRegex(lines[i], /(\`)([^`]+)\1/g, (line, item) =>
					line.replace(item[0], `<pre>${item[2]}</pre>`)
				);

				//* ==================== Inline Math ====================
				lines[i] = this.processRegex(lines[i], /\\\\\(\s(.+)\s\\\\\)/gm, (line, item) => {
					let node = document.createElement("span");
					katex.render(item[1], node, {
						throwOnError: false
					});

					return line.replace(item[0], `<custom pos="${addInsList(node, i + 1).pos}"></custom>`)
				});

				//? ==================== Call to custom line handlers ====================
	
				for (let f of this.customLineHandlers)
					lines[i] = f(lines[i], i);

				//* ==================== Blockquotes ====================
				let blockQuoteLevel = 0;
				let blockQuoteEndPos = 0;
	
				for (let p = 0; p < lines[i].length; p++)
					if (lines[i][p] === ">") {
						blockQuoteLevel++;
						blockQuoteEndPos = p + 1;
						continue;
					} else if (lines[i][p] !== " " || p === 0)
						break;
	
				// Remove all blockquote chars
				if (blockQuoteEndPos > 0)
					lines[i] = lines[i]
						.substring(blockQuoteEndPos, lines[i].length)
						.trim();
	
				// Count upward to add start tag
				for (let p = currentBlockQuoteLevel; p < blockQuoteLevel; p++)
					lines[i] = `<blockquote>\n${lines[i]}`;
	
				// Count downward to add end tag
				for (let p = currentBlockQuoteLevel; p > blockQuoteLevel; p--)
					lines[i] = `\n</blockquote>${lines[i]}`;
	
				if (blockQuoteLevel > 0 || currentBlockQuoteLevel > 0)
					doWrapParagraph = false;
	
				currentBlockQuoteLevel = blockQuoteLevel;
	
				//* ==================== Multiline Code/Note ====================
				
				let blockRe = /^(\`{3}|\:{3})(?:$|\s(.+)$)/gm.exec(lines[i]);
				if (blockRe) {
					// Block opening
					if (!isInsideBlock) {
						isInsideBlock = true;
						switch (blockRe[1]) {
							case ":::":
								blockType = "note";
								break;
						
							default:
								blockType = "code";
								break;
						}
		
						blockValue = blockRe[2] || null;
						lines[i] = "";
						continue;
					} else {
						// Block closing
						let node;
	
						switch (blockType) {
							case "note":
								node = createNote({
									level: blockValue || "info",
									message: blockLines.join("\n")
								});
								break;
						
							default:
								if (blockValue === "tex") {
									node = document.createElement("div");
									katex.render(blockLines.join("\n"), node, {
										throwOnError: false
									});
								} else
									node = new Editor("none", {
										value: blockLines.join("\n"),
										language: blockValue || "text",
										readonly: true
									});
								break;
						}
	
						lines[i] = `<custom pos="${addInsList(node, i + 1).pos}"></custom>`;
						isInsideBlock = false;
						blockValue = null;
						blockLines = []
	
						continue;
					}
				}
	
				if (isInsideBlock) {
					blockLines.push(lines[i]);
					lines[i] = "";
					continue;
				}
	
				//* ==================== Lists ====================
				let listLevel = 0;
				let listEndPos = 0;
				let listContinueLine = false;
	
				for (let p = 0; p < lines[i].length; p++)
					if (lines[i][p] === "\t") {
						listLevel++;
						continue;
					} else if (["+", "-", "*"].includes(lines[i][p]) && lines[i][p + 1] === " ") {
						listLevel++;
						listLevelType[listLevel] = "unordered";
						listEndPos = p + 1;
						continue;
					} else if (!isNaN(lines[i][p])) {
						while (!isNaN(lines[i][p]))
							p++;
	
						if (lines[i][p] !== "." || lines[i][p + 1] !== " ")
							break;
	
						listLevel++;
						listLevelType[listLevel] = "ordered";
						listEndPos = p + 1;
					} else if (lines[i][p] !== "" && currentListLevel > 0) {
						listContinueLine = true;
						listLevel = currentListLevel;
						break;
					} else if (lines[i][p] !== " " || p === 0)
						break;
	
				// Remove all list start chars
				if (listEndPos > 0)
					lines[i] = lines[i].substring(listEndPos, lines[i].length);
	
				if (listLevel > 0)
					if (listContinueLine) {
						lines[i - 1] = lines[i - 1].replace("</li>", "");
						lines[i] = `${lines[i]}</li>`;
					} else
						lines[i] = `<li>${lines[i]}</li>`;
	
				// Count upward to add start tag
				for (let p = currentListLevel; p < listLevel; p++)
					if (listLevelType[p + 1] === "unordered")
						lines[i] = `<ul>\n${lines[i]}`;
					else
						lines[i] = `<ol>\n${lines[i]}`;
	
				// Count downward to add end tag
				for (let p = currentListLevel; p > listLevel; p--)
					if (listLevelType[p] === "unordered")
						lines[i] = `</ul>\n${lines[i]}`;
					else
						lines[i] = `</ol>\n${lines[i]}`;
	
				if (currentListLevel > 0 || listLevel > 0 || listContinueLine === true)
					doWrapParagraph = false;
	
				currentListLevel = listLevel;
				
				//* ==================== Link/Image ====================
	
				lines[i] = this.processRegex(lines[i], /(\!|^|)\[([^\[\](\)\)]+)\]\(([^\[\](\)\)]*)\)/gm, (line, item) => {
					// Check if link contain title
					let title = item[3];
					let ltRe = /^(.+)\s\"(.+)\"$/gm.exec(item[3]);
	
					if (ltRe) {
						title = ltRe[2];
						item[3] = ltRe[1];
					}
					
					if (item[1] === "!") {
						let ins = addInsList(new lazyload({ source: item[3], classes: "image" }), i + 1);
						ins.node.container.title = title;
						return line.replace(item[0], `<custom pos="${ins.pos}"></custom>`);
					} else
						return line.replace(item[0], `<a title="${title}" href="${item[3]}">${item[2]}</a>`)
				});
	
				//* ==================== Table ====================
	
				if (lines[i][0] === "|") {
					if (!isInsideTable) {
						let headers = this.parseTableLine(lines[i]);
						let aligns = this.parseTableLine(lines[i + 1]);
	
						for (let i = 0; i < aligns.length; i++) {
							let left = aligns[i][0] === ":";
							let right = aligns[i][aligns[i].length - 1] === ":";
	
							if (left) {
								if (right)
									tableAlign[i] = "center";
								else
									tableAlign[i] = "left";
							} else {
								if (right)
									tableAlign[i] = "right";
								else
									tableAlign[i] = "left"
							}
						}
	
						lines[i] = `<table class="simpleTable">`;
						lines[i + 1] = `<tr>${
							headers
								.map((v, i) => `<th align="${tableAlign[i]}">${v}</th>`)
								.join("")
						}</tr>`;
	
						isInsideTable = true;
	
						// Jump to next line so next loop will be
						// the first row in the table
						i++;
						continue;
					} else {
						lines[i] = `<tr>${
							this.parseTableLine(lines[i])
								.map((v, i) => `<td align="${tableAlign[i]}">${v}</td>`)
								.join("")
						}</tr>`;
	
						continue;
					}
				} else if (isInsideTable) {
					lines[i] = "</table>" + lines[i];
					isInsideTable = false;
					tableAlign = []
				}
	
				//? ======================= END =======================
				if (doWrapParagraph && lines[i].trim()[0] !== "<") {
					if (isInsideParagraph) {
						if (lines[i] === "" || lines.length === (i + 1)) {
							lines[i] = `${lines[i]}</p>`;
							isInsideParagraph = false;
						}
					} else if (lines[i + 1] === "" || lines.length === (i + 1)) {
						lines[i] = `<p>${lines[i]}</p>`;
					} else {
						lines[i] = `<p>${lines[i]}`;
						isInsideParagraph = true;
					}
				}
			}
	
			let container = document.createElement("div");
			container.classList.add("md2html");
			container.innerHTML = lines.join("\n");
	
			//* ==================== Custom Nodes Insertion ====================
			for (let i = 0; i < nodeInsertList.length; i++){
				let item = nodeInsertList[i];
				let line = nodeInsertLine[i];

				let target = container.querySelector(`custom[pos="${i}"]`);
	
				try {
					if (target) {
						if (item.container && item.container.classList)
							target.parentElement.replaceChild(item.container, target);
						else if (item.group && item.group.classList)
							target.parentElement.replaceChild(item.group, target);
						else
							target.parentElement.replaceChild(item, target);
					} else
						clog("WARN", `md2html.parse(): Custom element with position ${i} cannot be found!`)
				} catch(e) {
					let error = parseException(e);
					throw { code: error.code, description: `Lỗi xử lí chèn node tại dòng ${line}: ${error.description} (Có thể do một thẻ html nào đó chưa được đóng đúng cách hoặc khối đang nằm trong một thẻ html khác)`, data: e }
				}
			}
	
			return container;
		} catch(e) {
			let error = parseException(e);
			clog("ERRR", "md2html.parse():", e);

			return createNote({
				level: "error",
				message: `<pre class="break">md2html.parse(): Lỗi đã xảy ra khi xử lí dữ liệu!\nCode: ${error.code}\nDescription: ${error.description}</pre>
					<br>Powered by <pre>belivipro9x99/md2html.js</pre>: A simple markdown to html converter`
			}).group;
		}
	},

	parseLineHandler(f) {
		if (typeof f !== "function")
			throw { code: -1, description: `md2html(): not a valid function` }

		this.customLineHandlers.push(f);
	},

	/**
	 * @param	{String}	line
	 * @returns	{Array}
	 */
	parseTableLine(line) {
		let tokens = line.split("|")
			.map(i => i.trim())
			.filter(i => i !== "");

		return tokens;
	},

	/**
	 * @param	{String}	line
	 * @param	{RegExp}	regex
	 * @param	{Function}	process
	 * @returns	{String}
	 */
	processRegex(line, regex, process = () => {}) {
		let matches = [ ...line.matchAll(regex) ]
		for (let item of matches)
			line = process(line, item) || "";

		return line;
	},

	/**
	 * @param	{String}	text
	 * @param	{Object}	tokens
	 * @returns	{String}
	 */
	processTokens(text, tokens) {
		for (let token of Object.keys(tokens))
			text = text.replaceAll(token, tokens[token]);

		return text;
	}
}