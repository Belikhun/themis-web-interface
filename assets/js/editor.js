//? |-----------------------------------------------------------------------------------------------|
//? |  /assets/js/editor.js                                                                         |
//? |                                                                                               |
//? |  Copyright (c) 2018-2021 Belikhun. All right reserved                                         |
//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
//? |-----------------------------------------------------------------------------------------------|

"use strict";

/**
 * My custom simple editor, inspired by the
 * Monaco editor (because I can't find any
 * clean way to implement monaco editor into
 * my project 😭😭😭)
 * 
 * `TOTAL HOURS WASTED: 15`
 * 
 * @author		@belivipro9x99
 * @version		v1.0
 */
class Editor {
	/**
	 * Initialize a new editor
	 * 
	 * @param	{HTMLTextAreaElement}		container
	 * @author	@belivipro9x99
	 */
	constructor(container, {
		value,
		language = "text",
		tabSize = 4
	} = {}) {
		//* ==================== Setup Variables ====================

		/**
		 * Store raw value as array of line
		 * @type {Array}
		 */
		this.rawValue = [];

		/**
		 * Store tab size
		 * @type {Number}
		 */
		this.__tabSize = 4;

		/**
		 * Store timeout id to turn on cavet smooth animation
		 * @type {Number}
		 */
		this.cavetTimeout;

		/**
		 * Detect if user is selecting range of text
		 */
		this.isSelecting = false;

		/**
		 * Current line that the cursor are in
		 * @type {HTMLElement}
		 */
		this.currentLine = 0;

		/** @type {String} */
		this.language = language;

		this.cStart = { line: 0, pos: 0 }
		this.cEnd = { line: 0, pos: 0 }
		this.cCursor = { line: 0, pos: 0 }

		//* ==================== Setup Editor Structure ====================
		/** @type {HTMLTextAreaElement} */
		this.container = buildElementTree("div", "editor", [
			{ type: "div", class: "check", name: "check" },
			{ type: "span", class: "lineNum", name: "lineNum", list: [
				{ type: "div", class: "content", name: "content" }
			]},

			{ type: "div", class: "main", name: "main", list: [
				{ type: "div", class: "wrapper", name: "wrapper", list: [
					{ type: "div", class: "selections", name: "selections" },
					{ type: "div", class: ["cursor", "smooth"], name: "cursor" },
					{ type: "span", class: "code", name: "code" },
					{ type: "textarea", class: "overlay", name: "overlay" }
				]}
			]},
		]).obj;

		this.container.id = container.id;

		/**
		 * Ssh... IT's JUST WORK!
		 * 
		 * @type {HTMLElement}
		 */
		this.main = this.container.main.wrapper;

		/** @type {HTMLElement} */
		this.lineNum = this.container.lineNum.content;

		container.parentElement.replaceChild(this.container, container);

		if (typeof Scrollable === "function")
			new Scrollable(this.container, { content: this.container.main, smooth: false });

		this.main.overlay.spellcheck = false;
		this.setup();

		this.value = value;
		this.tabSize = tabSize;
	}

	/**
	 * @param {String} value
	 */
	set value(value) {
		this.main.overlay.value = value;
		this.update();
	}

	get value() {
		return this.main.overlay.value;
	}

	/**
	 * @param {Number} tabSize
	 */
	set tabSize(tabSize) {
		this.main.style.tabSize = tabSize;
		this.__tabSize = tabSize;
	}

	/**
	 * @returns	{Number}
	 */
	get tabSize() {
		return this.__tabSize;
	}

	/**
	 * Return an array of line elements
	 * @type {Array}
	 */
	get lines() {
		return this.__lines;
	}

	/**
	 * Return an array of line number elements
	 * @type {Array}
	 */
	get lineNums() {
		return this.__lineNums;
	}

	get lineValues() {
		return this.__lineValues;
	}

	/**
	 * Return an array of selection elements
	 * @type {Array}
	 */
	get selections() {
		return this.main.selections.childNodes;
	}

	setup() {
		this.main.overlay.addEventListener("keydown", (e) => {
			switch (e.keyCode) {
				case 13:
					// Enter Key
					this.insertNewLine(this.cCursor.line + 1);
					break;

				case 8:
					// Backspace Key
					// Remove the line the cursor is currently on if
					// the cursor is in the first position
					if (this.cCursor.pos === 0)
						this.removeLine(this.cCursor.line);
					
					break;

				case 46:
					// Delete Key
					// Remove the next line the cursor is currently on
					// if the cursor is in the last position
					if (this.cCursor.pos === this.lines[this.cCursor.line].innerText.length)
						this.removeLine(this.cCursor.line + 1);

					break;
			
				default:
					break;
			}
		});

		this.main.overlay.addEventListener("input", (e) => {
			switch (e.inputType) {
				case "historyUndo":
				case "insertFromPaste":
				case "historyRedo":
					this.update();
					break;
			
				default:
					this.update({
						from: Math.max(this.cStart.line - 1, 0)
					});
					break;
			}
		});

		this.main.overlay.addEventListener("click", () => this.updateCaret());
		this.main.overlay.addEventListener("keydown", () => this.updateCaret());

		this.main.overlay.addEventListener("mousedown", () => this.isSelecting = true);
		window.addEventListener("mouseup", () => this.isSelecting = false);
		window.addEventListener("mousemove", () => {
			if (this.isSelecting)
				this.updateCaret();
		});

		this.main.overlay.addEventListener("touchstart", () => this.isSelecting = true);
		window.addEventListener("touchend", () => this.isSelecting = false);
		window.addEventListener("touchmove", () => {
			if (this.isSelecting)
				this.updateCaret();
		});

		this.container.main.addEventListener("scroll", () => {
			this.container.lineNum.scrollTop = this.container.main.scrollTop;
		});

		new ResizeObserver(() => this.updateSizing()).observe(this.main);
	}

	async updateCaret() {
		// Some events happend before the input update new value so we
		// need to wait for next frame to get updated information
		await nextFrameAsync();
		
		clearTimeout(this.cavetTimeout);
		this.main.cursor.classList.remove("smooth");

		// Calculate cStart and cEnd
		this.cStart = this.calcPoint(this.main.overlay.selectionStart);
		this.cEnd = this.calcPoint(this.main.overlay.selectionEnd);
		this.cCursor = (this.main.overlay.selectionDirection === "forward")
			? this.cEnd
			: this.cStart;

		// Draw Selection Area
		if (this.main.overlay.selectionStart !== this.main.overlay.selectionEnd)
			this.updateSelection(this.cStart, this.cEnd);
		else
			emptyNode(this.main.selections);

		// Update active line
		if (this.currentLine !== this.cCursor.line) {
			if (typeof this.currentLine === "number") {
				this.lines[this.currentLine].classList.remove("active");
				this.lineNums[this.currentLine].classList.remove("active");
			}
	
			this.currentLine = this.cCursor.line;
			this.lines[this.currentLine].classList.add("active");
			this.lineNums[this.currentLine].classList.add("active");
		}

		// Calculate caret position
		let topPos = this.lines[this.cCursor.line].offsetTop;
		let leftPos = this.stringWidth(this.lineValue(this.cCursor.line).slice(0, this.cCursor.pos));

		this.main.cursor.style.top = `${topPos}px`;
		this.main.cursor.style.left = `${leftPos}px`;

		// Update caret style and inline character
		this.main.cursor.style.height = `${this.lines[this.cCursor.line].getBoundingClientRect().height}px`;
		this.main.cursor.innerText = this.lineValue(this.cCursor.line)[this.cCursor.pos] || " ";

		this.cavetTimeout = setTimeout(() => {
			this.main.cursor.classList.add("smooth");
		}, 500);
	}

	updateSelection(start = { line: 0, pos: 0 }, end = { line: 0, pos: 0 }) {
		let t0 = performance.now();
		emptyNode(this.main.selections);

		for (let line = start.line; line <= end.line; line++) {
			let lineRect = this.lines[line].getBoundingClientRect();
			let top = this.lines[line].offsetTop;
			
			let r = document.createElement("div");
			r.style.top = `${top}px`;
			r.style.height = `${lineRect.height}px`;

			let l = this.lineValue(line);
			if (start.line === end.line) {
				// Only 1 line is selected
				r.style.left = `${this.stringWidth(l.slice(0, start.pos))}px`;
				r.style.width = `${this.stringWidth(l.slice(start.pos, end.pos))}px`;
			} else if (line === start.line) {
				// First line
				r.style.left = `${this.stringWidth(l.slice(0, start.pos))}px`;
				r.style.width = `${this.stringWidth(l.slice(start.pos, l.length) + " ")}px`;
			} else if (line === end.line) {
				r.style.left = 0;
				r.style.width = `${this.stringWidth(l.slice(0, end.pos))}px`;
			} else {
				r.style.left = 0;
				r.style.width = `${this.stringWidth(l + " ")}px`;
			}

			this.main.selections.appendChild(r);
		}

		let t1 = performance.now();
		clog("DEBG", `editor.updateSelection(): took ${(t1 - t0).toFixed(3)}ms`);
	}

	setCaret({
		line = 0,
		pos = 0
	} = {}) {
		let r = document.createRange();
		let s = window.getSelection();

		r.setStart(this.lines[line].childNodes[0], pos);
		r.collapse(true);

		s.removeAllRanges();
		s.addRange(r);
		this.updateCaret();
	}

	stringWidth(string) {
		this.container.check.innerText = string;
		return this.container.check.getBoundingClientRect().width;
	}

	lineValue(i) {
		return this.lines[i].innerText;
	}

	calcMaxC() {
		return this.main.getBoundingClientRect().width / this.stringWidth(" ");
	}

	calcPoint(offset) {
		let lines = this.value.split("\n");
		let line = 0;

		while ((lines[line].length + 1) <= offset) {
			offset -= (lines[line].length + 1);
			line++;
		}

		return {
			line,
			pos: offset
		}
	}

	insertString(insert) {
		let s = window.getSelection();
		let r = s.getRangeAt(0);
		
		let iNode = document.createTextNode(insert);

		r.deleteContents();
		r.insertNode(iNode);
		r.collapse(false);
		r.setStartAfter(iNode);
		r.setEndAfter(iNode);

		s.removeAllRanges();
		s.addRange(r);

		this.updateCaret();
	}

	/**
	 * Backtrace to find line element
	 * @param {HTMLElement}	e 
	 */
	getLine(e) {
		while ((!e.classList || !e.classList.contains("line")) && e.parentElement)
			e = e.parentElement;

		return e;
	}

	getLineNth(e) {
		for (let i = 0; i < this.main.code.childNodes.length; i++)
			if (this.main.code.childNodes[i] === e)
				return i;
		
		return null;
	}

	insertNewLine(pos) {
		let l = document.createElement("div");
		l.classList.add("line");

		if (this.lines[pos - 1] && this.lines[pos - 1].nextSibling)
			this.main.code.insertBefore(l, this.lines[pos - 1].nextSibling);
		else
			this.main.code.appendChild(l);

		return l;
	}

	removeLine(pos) {
		this.main.code.removeChild(this.lines[pos]);
		this.updateValues();
	}

	insertLineNum() {
		let ln = document.createElement("div");
		let p = this.lineNums.length;

		ln.innerText = (p + 1);
		ln.setAttribute("line", p);

		let n = this.lineNum.querySelector(`div[line="${p - 1}"]`);
		if (n && n.nextSibling)
			this.lineNum.insertBefore(ln, n.nextSibling);
		else
			this.lineNum.appendChild(ln);

		return ln;
	}

	removeLineNum() {
		this.lineNum.removeChild(this.lineNum.lastChild);
	}

	updateSizing() {
		this.main.overlay.style.width = `${this.container.main.wrapper.clientWidth}px`;
		this.main.overlay.style.height = `${this.container.main.wrapper.clientHeight}px`;
	}

	updateValues() {
		this.__lines = this.main.code.childNodes;
		this.__lineNums = this.lineNum.childNodes;
		this.__lineValues = this.main.overlay.value.split("\n");
		this.main.code.setAttribute("language", this.language);
		this.container.lineNum.scrollTop = this.container.main.scrollTop;
	}

	parseTokens(line) {
		// Check for empty string
		if (line.length === 0 || /^\s+$/gm.test(line))
			return line;

		line = escapeHTML(line);
		
		if (editorLanguages[this.language])
			return editorLanguages[this.language](line);
		else
			return line;
	}

	update({
		from,
		full = false
	} = {}) {
		let t0 = performance.now();

		this.updateValues();
		this.updateSizing();
		editorLanguages.reset();

		if (!from)
			from = 0;

		let inModified = false;

		for (let i = from; i < this.lineValues.length; i++) {
			if (!this.lines[i])
				this.insertNewLine(i);

			const doUpdate = () => {
				let p = this.parseTokens(this.lineValues[i]);
				
				if (this.lines[i].innerText !== sanitizeHTML(p)) {
					this.lines[i].innerHTML = p;
					clog("DEBG", `editor.update(): line ${i + 1} updated`);
					return true;
				}

				if (this.lineValues[i].length < 4)
					return true;

				return false;
			}

			// When full update is not applied,
			// scan for a specific zone that got
			// modified
			if (!full) {
				// If not in modified zone, scan until
				// found line different
				if (!inModified) {
					if (this.lines[i].innerText !== this.lineValues[i]) {
						inModified = true;
						doUpdate();
					}
				} else {
					// If there is no further line update
					// stop updating all the other lines
					if (!doUpdate())
						break;
				}
			} else
				doUpdate();
			
			let ln = this.lineNum.querySelector(`div[line="${i}"]`);
			if (!ln)
				ln = this.insertLineNum();

			ln.style.height = `${this.lines[i].getBoundingClientRect().height}px`;
		}

		while (this.lines.length > this.lineValues.length)
			this.main.code.removeChild(this.main.code.lastChild);

		while (this.lineNums.length <= this.lineValues.length)
			this.insertLineNum();

		while (this.lineNums.length > this.lineValues.length)
			this.removeLineNum();

		if (this.currentLine > this.lineValues.length - 1)
			this.currentLine = null;

		this.updateCaret();

		let t1 = performance.now();
		clog("DEBG", `editor.update(): took ${(t1 - t0).toFixed(3)}ms`);
	}
}

/**
 * Simple line by line syntax highlighting
 * function for a specific languages
 */
const editorLanguages = {
	processToken(line, type, words = []) {
		for (let word of words)
			line = this.processRegex(line, type, new RegExp(`(?:\\s+|\\t+|\\(|^)(${word})`, "gm"), 1);

		return line;
	},

	processRegex(line, type, regex, index = 0) {
		let matches = [ ...line.matchAll(regex) ]
		for (let item of matches)
			line = line.replace(item[index], `<${type}>${item[index]}</${type}>`);

		return line;
	},

	reset() {
		this.inMultiLineComment = false;
	},

	inMultiLineComment: false,

	/**
	 * Parse javascript
	 * @param	{String}	line 
	 * @returns	{String}
	 */
	js(line) {
		if (line[0] === "/" && line[1] === "/")
			return `<ed-comment>${line}</ed-comment>`;

		if (this.inMultiLineComment) {
			// Check for end of multilime comment doc
			let emlCDoc = /^([^*/]*\*\/)/gm.exec(line);
			if (emlCDoc) {
				line = line.replace(emlCDoc[1], `<ed-comment>${emlCDoc[1]}</ed-comment>`);
				this.inMultiLineComment = false;
			} else
				return `<ed-comment>${line}</ed-comment>`;
		}

		// Check for start of multiline comments
		let mlCDoc = /(?:\s+|\t+|^)(\/\*\*[^*/]*$)/gm.exec(line);
		if (mlCDoc) {
			line = line.replace(mlCDoc[1], `<ed-comment>${mlCDoc[1]}</ed-comment>`);
			this.inMultiLineComment = true;
			return line;
		}

		// Parse Comment
		line = this.processRegex(line, "ed-comment", /(?:\s+|\t+|^)(\/\*\*.*\*\/)/g);
		
		// Parse Comment
		line = this.processRegex(line, "ed-comment", /\/\/.*$/g);

		// Parse String
		line = this.processRegex(line, "ed-string", /([bruf]*)(&quot;|&#039;|"""|'''|"|'|`)(?:(?!\2)(?:\\.|[^\\]))*\2/g);
		
		// Parse Function
		line = this.processRegex(line, "ed-function", /(?:\s+|\.|^)([a-zA-Z0-9_]+)\s*\(.*/gm, 1);
		
		// Parse Keyword
		line = this.processToken(line, "ed-keyword", [
			"if",
			"else",
			"return",
			"function",
			"for",
			"var",
			"let",
			"const",
			"try",
			"catch",
			"class"
		]);

		// Parse Constant
		line = this.processToken(line, "ed-constant", [
			"this",
			"window",
			"self",
			"document",
			"location",
			"frames",
			"navigator",
			"sessionStorage",
			"localStorage",
			"Math"
		]);

		return line;
	},

	/**
	 * Parse markdown
	 * @param	{String}	line 
	 * @returns	{String}
	 */
	md(line) {
		// Quote
		line = this.processRegex(line, "ed-mdquotes", /^(?:&gt\;)+.*/g);

		// Heading
		line = this.processRegex(line, "ed-mdheading", /\#{1,6}\s.*/g);

		// Bold Text
		line = this.processRegex(line, "ed-mdbold", /([bruf]*)(\*\*|\_\_)(?:(?!\2)(?:\\.|[^\\]))*\2/g);

		// Italic Text
		line = this.processRegex(line, "ed-mditalic", /([^*_]|^)(\*|\_)[^*_]+\1/g);

		// Link
		let mdLinks = [ ...line.matchAll(/(\[[^\[\](\)\)]+\])(\([^\[\](\)\)]*\))/g) ]
		for (let item of mdLinks)
			line = line.replace(item[0], `<ed-mdlinktext>${item[1]}</ed-mdlinktext><ed-mdlink>${item[2]}</ed-mdlink>`);

		// String
		line = this.processRegex(line, "ed-mdstring", /([bruf]*)(&quot;|&#039;|"""|'''|"|'|`)(?:(?!\2)(?:\\.|[^\\]))*\2/g);

		return line;
	}
}