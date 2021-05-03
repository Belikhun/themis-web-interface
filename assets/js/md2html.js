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
	 * Parse Markdown text to HTML Text
	 * 
	 * @param	{String}		text	Markdown text to parse
	 * @returns	{String}
	 */
	parse(text) {
		// Process tokens
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

		for (let i = 0; i < lines.length; i++) {
			let doWrapParagraph = true;

			//* ==================== Horizontal Rules ====================
			if (lines[i] === "___" || lines[i] === "---" || lines[i] === "***") {
				lines[i] = `<hr>`;
				continue;
			}

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
				lines[i] = lines[i].substring(blockQuoteEndPos, lines[i].length);

			// Count upward to add start tag
			for (let p = currentBlockQuoteLevel; p < blockQuoteLevel; p++)
				lines[i] = `<blockquote>\n${lines[i]}`;

			// Count downward to add end tag
			for (let p = currentBlockQuoteLevel; p > blockQuoteLevel; p--)
				lines[i] = `\n</blockquote>${lines[i]}`;

			if (blockQuoteLevel > 0 || currentBlockQuoteLevel > 0)
				doWrapParagraph = false;

			currentBlockQuoteLevel = blockQuoteLevel;

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
				} else if (lines[i][p] !== "") {
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
			

			//? ======================= END =======================
			if (doWrapParagraph)
				lines[i] = `<p>${lines[i]}</p>`;
		}

		console.log(lines);
		return lines.join("\n");
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
			line = process(line, item);

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