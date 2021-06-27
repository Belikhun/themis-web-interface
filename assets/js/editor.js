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
 * `TOTAL HOURS WASTED: 21`
 * 
 * @author	@belivipro9x99
 * @version	v1.0
 * @license	MIT
 */
class Editor {
	/**
	 * Initialize a new editor
	 * 
	 * @param	{HTMLTextAreaElement|String}		container
	 * @author	@belivipro9x99
	 */
	constructor(container, {
		value,
		language = "txt",
		tabSize = 4,
		readonly = false,
		title,
		debug = false,
		style = "default"
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
		this.__language = "txt";

		/**
		 * Scrollable instance
		 * @type {Scrollable}
		 */
		this.scrollable = null;

		/**
		 * Editor Readonly Mode
		 * @type {Boolean}
		 */
		this.__readonly = false;

		/**
		 * Debug Mode
		 * Currently didn't do anything much
		 * 
		 * @type {Boolean}
		 */
		this.debug = debug;

		/**
		 * Store list of input listeners. Will trigger when
		 * editor input is changed
		 * @type {Array}
		 */
		this.inputHandlers = []

		/**
		 * Store list of scroll listeners. Will trigger when
		 * editor input is being scrolled
		 * @type {Array}
		 */
		this.scrollHandlers = []

		/**
		 * Current line indicator inside vartical scrollbar
		 * @type {HTMLElement}
		 */
		this.sIndicator = null;

		this.cStart = { line: 0, pos: 0 }
		this.cEnd = { line: 0, pos: 0 }
		this.cCursor = { line: 0, pos: 0 }

		//* ==================== Setup Editor Structure ====================
		/** @type {HTMLTextAreaElement} */
		this.container = makeTree("div", "editor", {
			check: { tag: "div", class: "check" },
			header: { tag: "div", class: "header", child: {
				left: { tag: "span", class: "left", child: {
					icon: { tag: "icon", data: { icon: "txt" }, title: "txt" },
					eTitle: { tag: "t", class: "editorTitle" }
				}},

				right: { tag: "span", class: "right", child: {
					pos: { tag: "span", class: "pos" },
					warn: { tag: "span", class: "warn", child: {
						icon: { tag: "icon", data: { icon: "exclamation" } },
						note: createNote()
					}},

					info: { tag: "tip", title: `This editor is in beta stage!\nFor more information: <pre>belivipro9x99/editor.js</pre>` }
				}}
			}},
			
			lineNum: { tag: "span", class: "lineNum", child: {
				content: { tag: "div", class: "content" }
			}},

			main: { tag: "div", class: "main", child: {
				wrapper: { tag: "div", class: "wrapper", child: {
					selections: { tag: "div", class: "selections" },
					cursor: { tag: "div", class: ["cursor", "smooth"] },
					code: { tag: "span", class: "code", name: "code" },
					overlay: { tag: "textarea", class: "overlay" }
				}}
			}},
		});

		this.container.dataset.style = style;

		/**
		 * Ssh... IT's JUST WORK!
		 * 
		 * @type {HTMLElement}
		 */
		this.main = this.container.main.wrapper;

		/** @type {HTMLElement} */
		this.lineNum = this.container.lineNum.content;

		if (typeof container === "string") {
			let _c = document.getElementById(container);

			if (_c)
				container = _c;
			else
				clog("WARN", `Editor(): element with id ${container} does not exist!`);
		}

		if (typeof container === "object" && container.parentElement) {
			if (typeof container.value === "string" && !value)
				value = container.value;

			if (container.id && container.id !== "")
				this.container.id = container.id;

			if (container.name && container.name !== "")
				this.container.main.wrapper.overlay.name = container.name;

			container.parentElement.replaceChild(this.container, container);
		}

		// Check if the Scrollable library exist in
		// current scope.
		// If so, use Scrollable's custom scrollbar
		// to have monaco style scrollbar and features
		if (typeof Scrollable === "function") {
			this.scrollable = new Scrollable(this.container, {
				content: this.container.main,
				smooth: false,
				barSize: 15
			});

			this.sIndicator = document.createElement("div");
			this.sIndicator.classList.add("indicator");
			this.scrollable.vBar.appendChild(this.sIndicator);
		}

		this.main.overlay.spellcheck = false;
		this.language = language;

		this.setup();
		this.value = value || "";
		this.tabSize = tabSize;
		this.readonly = readonly;

		if (title)
			this.title = title;
	}

	/**
	 * Add listener for input event
	 * 
	 * @param	{Function}	f	Listener Function
	 * 
	 * This function will receive 3 arguments
	 * 	- `value`: Editor text value
	 * 	- `event`: InputEvent object
	 * 	- `editor`: Reference to editor instance
	 * 
	 * Listener will be called once first with `event` set to null
	 */
	onInput(f) {
		if (typeof f !== "function")
			throw { code: -1, description: `Editor.onInput(): not a valid function` }

		f(this.value, null, this);
		return this.inputHandlers.push(f);
	}

	/**
	 * Add listener for scroll event
	 * 
	 * @param	{Function}	f	Listener Function
	 * 
	 * This function will receive 2 arguments
	 * 	- `event`: InputEvent object
	 * 	- `editor`: Reference to editor instance
	 */
	onScroll(f) {
		if (typeof f !== "function")
			throw { code: -1, description: `Editor.onScroll(): not a valid function` }

		return this.scrollHandlers.push(f);
	}

	/**
	 * @param {String} value
	 */
	set value(value) {
		this.main.overlay.value = value;
		this.update();

		this.inputHandlers
			.forEach((f) => f(value, null, this));
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
	 * Editor Title
	 * @param {String} title
	 */
	set title(title) {
		this.container.header.left.eTitle.innerText = title;
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

	/**
	 * Set Editor Readonly
	 * @param	{Boolean}	value
	 */
	set readonly(value) {
		if (typeof value !== "boolean")
			throw { code: -1, description: `Editor.readonly: not a valid boolean` }

		this.container.dataset.readonly = value;
		this.main.overlay.readOnly = value;
		this.__readonly = value;
	}

	get readonly() {
		return this.__readonly;
	}

	/**
	 * Editor's Language
	 * @param {String} language
	 */
	set language(language) {
		this.__language = language;
		this.container.header.left.icon.dataset.icon = language;
		this.container.header.left.icon.setAttribute("tooltip", `Ngôn ngữ: <b>${language}</b>`);

		if (typeof editorLanguages[language] !== "function") {
			this.container.header.right.warn.style.display = null;
			this.container.header.right.warn.note.set({
				level: "warning",
				message: `Không tìm thấy hàm sử lí ngôn ngữ cho ${language}!<br>Một số tính năng như Syntax Highlighting sẽ không được hỗ trợ!`
			});
		} else
			this.container.header.right.warn.style.display = "none";

		this.update();
	}

	get language() {
		return this.__language;
	}

	setup() {
		this.main.overlay.addEventListener("keydown", (e) => {
			if (this.readonly)
				return;

			switch (e.keyCode) {
				case 13:
					// Enter Key
					this.insertNewLine(this.cCursor.line + 1);
					break;

				case 8:
					// Backspace Key
					// Remove the line the cursor is currently on if
					// the cursor is in the first position
					if (this.cCursor.pos === 0 && this.cCursor.line > 0)
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
			if (this.readonly)
				return;

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

			this.inputHandlers
				.forEach((f) => f(this.value, e, this));
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

		this.container.main.addEventListener("scroll", (e) => {
			this.container.lineNum.scrollTop = this.container.main.scrollTop;

			this.scrollHandlers
				.forEach((f) => f(e, this));
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

		this.container.header.right.pos.innerText = `L:${this.cCursor.line} C:${this.cCursor.pos}`;

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

		if (this.sIndicator)
			this.sIndicator.style.top = `${(topPos / this.main.offsetHeight) * 100}%`;

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

		if (this.debug)
			clog("DEBG", `editor.updateSelection(): took ${(performance.now() - t0).toFixed(3)}ms`);
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
		this.updateLineNum(0, this.lines.length);
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

	updateLineNum(from, to) {
		if (typeof to !== "number")
			to = from;

		for (let i = from; i < to; i++) {
			let line = this.lineNum.querySelector(`div[line="${i}"]`);
	
			if (!line)
				line = this.insertLineNum();
	
			line.style.height = `${this.lines[i].getBoundingClientRect().height}px`;
		}
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

					if (this.debug)
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
			
			this.updateLineNum(i);
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

		if (this.debug)
			clog("DEBG", `editor.update(): took ${(performance.now() - t0).toFixed(3)}ms`);
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

	processRegex(line, type, regex, replace = 0, index = replace) {
		let matches = [ ...line.matchAll(regex) ]
		for (let item of matches)
			line = line.replace(item[replace], `<${type}>${item[index]}</${type}>`);

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

		// Multiline comment
		// This feature is still broken as if the
		// user is modifying between the comment
		// line this can't check if current line is
		// between the open and close line of multiline
		// comment
		// TODO: better implementation of multiline comment detection
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
		line = this.processRegex(line, "ed-mdbold", /([^*_]|^)((\*{2}|\_{2})([^*_]+)\3)/g, 2);

		// Italic Text
		line = this.processRegex(line, "ed-mditalic", /(^|[^*_])((\*|\_)([^*_]+)\3)/gm, 2);

		// Link
		let mdLinks = [ ...line.matchAll(/(\[[^\[\](\)\)]+\])(\([^\[\](\)\)]*\))/g) ]
		for (let item of mdLinks)
			line = line.replace(item[0], `<ed-mdlinktext>${item[1]}</ed-mdlinktext><ed-mdlink>${item[2]}</ed-mdlink>`);

		// String
		line = this.processRegex(line, "ed-mdstring", /([bruf]*)(&quot;|&#039;|"""|'''|"|'|`)(?:(?!\2)(?:\\.|[^\\]))*\2/g);

		return line;
	}
}