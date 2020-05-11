//? |-----------------------------------------------------------------------------------------------|
//? |  /assets/js/chart.js                                                                          |
//? |                                                                                               |
//? |  Copyright (c) 2018-2020 Belikhun. All right reserved                                         |
//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
//? |-----------------------------------------------------------------------------------------------|

/**
 * 📈 chart.js by Belikhun
 */
class chart {
	/**
	 * @param {HTMLElement} container	chart.js container
	 */
	constructor(container) {
		if (!container || !container.classList)
			throw { code: -1, description: `chart: container is not a valid node` }

		//? VARIABLE INIT
		this.container = container;
		this.dataLimit = null;
		this.listData = []
		this.pointData = []
		this.xPointData = []
		this.vStep = null;
		this.hStep = null;
		this.xStep = null;
		this.yStep = null;
		this.padL = 50;
		this.padT = 20;
		this.padB = 40;
		this.axisOffset = 1;
		this.size = { x: this.container.clientWidth, y: this.container.clientHeight }
		this.lastCurPos = { x: this.size.x, y: 0 }
		this.active = false;
		this.color = "default";
		this.axis();

		this.container.classList.add("chartjs");

		//? BUILD NODE STRUCTURE
		let tree = buildElementTree("svg", "svgBox", [
			{ type: "g", class: "hHintLine", name: "hHint" },
			{ type: "g", class: "vHintLine", name: "vHint" },
			{ type: "path", class: "chartLine", name: "line" },
			{ type: "path", class: "chartShape", name: "shape" },
			{ type: "line", class: "xAxis", name: "xAxis" },
			{ type: "line", class: "yAxis", name: "yAxis" },
			{ type: "line", class: "cursorLine", name: "cursorLine" },
			{ type: "circle", class: "cursorPoint", name: "cursorPoint" }
		])

		this.box = tree.obj;
		this.container.appendChild(tree.tree);

		this._set_(this.box, {
			"xmlns:dc": "http://purl.org/dc/elements/1.1/",
			"xmlns:cc": "http://creativecommons.org/ns#",
			"xmlns:rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
			"xmlns:svg": "http://www.w3.org/2000/svg",
			"xmlns": "http://www.w3.org/2000/svg",
			"xmlns:xlink": "http://www.w3.org/1999/xlink",
			"xmlns:sodipodi": "http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd",
			"xmlns:inkscape": "http://www.inkscape.org/namespaces/inkscape",
			version: "1.1"
		})

		//? OBSERVER/EVENTS
		this.renderTimeout = null;
		(new ResizeObserver(entries => {
			let entry = entries[0].contentRect;
			this.size = { x: entry.width, y: entry.height }
			this.lastCurPos.x = this.size.x;

			clearTimeout(this.renderTimeout);
			this.renderTimeout = setTimeout(() => this.render(), 100);
		})).observe(this.container);

		this.box.addEventListener("mousemove", e => {
			this.active = true;
			this.container.classList.add("active");
			this.lastCurPos.x = e.offsetX;
			this.lastCurPos.y = e.offsetY;

			this.updateTooltip();
		});

		this.box.addEventListener("mouseleave", e => {
			if (!e.toElement || e.toElement.isSameNode(tooltip.node))
				return;

			this.active = false;
			this.container.classList.remove("active");
			this.lastCurPos.x = this.size.x;
			this.updateTooltip();
		});
	}

	/**
	 * @param {Array}	data	Array of Data
	 */
	set setData(data) {
		if (typeof data !== "object" || typeof data.length !== "number")
			throw { code: -1, description: `(set) chart.setData: not a valid array` }

		this.listData = data;
		this.render();
	}

	/**
	 * @param {Number}	l		Limit X Dimension
	 */
	set limit(l) {
		this.dataLimit = l;
	}

	/**
	 * @param {String}	color	Set Chart Color
	 * + default
	 * + blue
	 * + green
	 * + yellow
	 * + red
	 * + pink
	 */
	set color(color) {
		this.chartColor = color;
		this.container.dataset.color = color;
		this.updateTooltip();
	}

	pushPoint(data = {}) {
		if (typeof data !== "object" || typeof data[this.x.key] !== "number" || typeof data[this.y.key] !== "number")
			throw { code: -1, description: `chart.pushPoint: not a valid point` }

		this.listData.push(data);

		if (typeof this.dataLimit === "number")
			while (this.listData.length > this.dataLimit)
				this.listData.shift()

		this.render();
	}

	/**
	 * @param {*}	data	Set Axis Data
	 */
	axis({
		x = {
			name: "X",
			type: "number",
			key: "x"
		},
		y = {
			name: "Y",
			type: "number",
			key: "y"
		}
	} = {}) {
		this.x = x;
		this.y = y;
	}

	render() {
		let xVal = this.listData.map(i => i[this.x.key]);
		let yVal = this.listData.map(i => i[this.y.key]);
		let xMax = Math.max(...xVal);
		let xMin = Math.min(...xVal);
		let yMax = Math.max(...yVal);
		let yMin = Math.min(...yVal);

		let vStep = this.vStep = this._calcStep_(xMin, xMax, this.size.x, true);
		let hStep = this.hStep = this._calcStep_(Math.min(yMin, 0), yMax, this.size.y);
		let xStep = this.xStep = (this.size.x - this.padL) / Math.max(xMax - xMin, 1);
		let yStep = this.yStep = (this.size.y - this.padB - this.padT) / Math.max(hStep.end - hStep.start, 1);

		//* RENDER AXIS LINE
		this._set_(this.box.xAxis, {
			x1: this.padL - this.axisOffset,
			y1: this.size.y - this.padB + this.axisOffset,
			x2: this.size.x,
			y2: this.size.y - this.padB + this.axisOffset
		})

		this._set_(this.box.yAxis, {
			x1: this.padL - this.axisOffset,
			y1: this.size.y - this.padB + this.axisOffset,
			x2: this.padL - this.axisOffset,
			y2: 0
		})

		//* RENDER HORIZONTAL HINT LINE
		this.box.hHint.innerHTML = hStep.data.map(i => {
			let y = this.size.y - (i * yStep) - this.padB + (hStep.start * yStep);

			return `
				<line x1="${this.padL + 1}" y1="${y}" x2="${this.size.x}" y2="${y}" data-value="${i}"/>
				<text text-anchor="end" x="${this.padL - 12}" y="${y + 5}">${i}</text>
			`
		}).join("\n");

		//* RENDER VERTICAL HINT LINE
		this.box.vHint.innerHTML = vStep.data.map(i => {
			let x = ((i - vStep.start) * xStep) + this.padL;

			return `
				<line x1="${x}" y1="${0}" x2="${x}" y2="${this.size.y - this.padB}" data-value="${i}"/>
				<text text-anchor="middle" x="${Math.min(x, this.size.x - `${i}`.length * 3.4 - 6)}" y="${this.size.y - this.padB + 18}">${i}</text>
			`
		}).join("\n");

		//* RENDER CHART LINE
		this.pointData = this.listData
			.map((a) => (typeof a[this.y.key] === "number")
				? {
					vx: a[this.x.key],
					vy: a[this.y.key],
					x: (a[this.x.key] - xMin) * xStep + this.padL, 
					y: this.size.y - (a[this.y.key] * yStep) - this.padB + (hStep.start * yStep)
				}
				: null)
			.filter(Object);

		this.xPointData = this.pointData.reduce((p, c) => { p[c.vx] = c; return p; }, []);

		//? LINES
		this._set_(this.box.line, {
			d: this.pointData.map((a, i) => `${i === 0 ? "M" : "L"} ${a.x},${a.y}`).join(" ")
		});

		//? SHAPE
		this._set_(this.box.shape, {
			d: this.box.line.getAttribute("d") + `L ${this.size.x},${this.size.y - this.padB} L ${this.padL},${this.size.y - this.padB} Z`
		});

		this.updateTooltip();
	}

	updateTooltip() {
		if (this.active)
			this._set_(this.box.cursorLine, {
				x1: Math.max(this.lastCurPos.x, this.padL),
				y1: this.size.y - this.padB,
				x2: Math.max(this.lastCurPos.x, this.padL),
				y2: 0
			})

		if (!this.vStep)
			return;

		let xVal = this.vStep.start + Math.floor((this.lastCurPos.x - this.padL) / this.xStep - 0.5) + 1;
		let point = this.xPointData[xVal];

		if (!point)
			return;

		this._set_(this.box.cursorPoint, {
			cx: point.x,
			cy: point.y
		})

		tooltip.show(`
			<div class="chartJSData">
				<t class="xValue">${this.x.name}: ${point.vx}</t>
				<div class="yValue" data-color=${this.chartColor}>
					<t class="value">${this.y.name}: ${point.vy}</t>
					<span class="color"></span>
				</div>
			</div>
		`);
	}

	createSVGElement(name) {
		return document.createElementNS("http://www.w3.org/2000/svg", name);
	}

	// PRIVATE FUNCTION
	_calcStep_(min, max, size, noPad = false) {
		let stepList = [1, 2, 4, 5, 10, 15, 20, 25, 30, 40, 50, 60, 70, 80, 90, 100, 150, 200, 500, 1000, 2000, 5000, 10000]
		let stepPos = 0;
		let div = 1;

		let start = max;
		let end = min;
		let tick = 0;
		let data = []

		if (noPad) {
			tick = 1;
			start = min;
			end = max;
			
			while ((end - start) / div > size / 50)
				div++;

			for (let i = start; i <= end; i += tick)
				if (i % div === 0)
					data.push(i);
		} else {
			while (Math.max(max - min, 1) / stepList[stepPos] > size / 50) {
				stepPos++;
	
				if (!stepList[stepPos])
					stepList[stepPos] = stepList[stepPos - 1] * 10;
			}
	
			tick = stepList[stepPos];
	
			let i = Math.floor(end / tick);
			while (end <= max) {
				i++;
				end = i * tick;
				data.push(end);
			}
	
			let j = Math.floor(start / tick)
			while (start > min) {
				j--;
				start = j * tick;
				data.unshift(start);
			}
		}

		return { start, end, tick, div, data }
	}

	_set_(node, data) {
		for (let key of Object.keys(data))
			node.setAttribute(key, data[key]);
	}
}