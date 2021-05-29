//? |-----------------------------------------------------------------------------------------------|
//? |  /assets/js/scrollable.js                                                                     |
//? |                                                                                               |
//? |  Copyright (c) 2018-2021 Belikhun. All right reserved                                         |
//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
//? |-----------------------------------------------------------------------------------------------|

/**
 * Provide Smooth Scrolling and Custom Scrollbar
 * 
 * @author	@belivipro9x99
 * @version	v1.0
 * @license	MIT
 */
class Scrollable {
	/**
	 * @param {HTMLElement}		container		Container
	 */
	constructor(container, {
		content,
		distance = 1,
		velocity = 2,
		clamp = 20,
		maxClamp = 400,
		horizontal = false,
		smooth = true,
		scrollbar = true,
		scrollout = false,
		barSize = 10
	} = {}) {
		if (typeof container !== "object" || (!container.classList && !container.container))
			throw { code: -1, description: `Scrollable(): container is not a valid node` }

		if (content) {
			/**
			 * Main scrolling container
			 * @type {HTMLElement}
			 */
			this.container = container;
			
			/**
			 * Content
			 * @type {HTMLElement}
			 */
			this.content = content;
		} else {
			this.container = document.createElement("div");
			this.container.id = container.id;
			container.parentElement.replaceChild(this.container, container);

			this.content = container;
			this.content.removeAttribute("id");
		}

		this.container.classList.add("scrollable");
		this.content.classList.add("content");
		this.content.clampValue = 0;

		/**
		 * Vertical Scrollbar
		 * @type {HTMLElement}
		 */
		this.vBar = buildElementTree("div", ["scrollbar", "vertical"], [
			{ type: "div", class: "thumb", name: "thumb" }
		]).obj;

		/**
		 * Horizontal Scrollbar
		 * @type {HTMLElement}
		 */
		this.hBar = buildElementTree("div", ["scrollbar", "horizontal"], [
			{ type: "div", class: "thumb", name: "thumb" }
		]).obj;

		this.container.insertBefore(this.hBar, this.container.firstChild);
		this.container.insertBefore(this.vBar, this.container.firstChild);
		this.container.appendChild(this.content);

		// Initialize some variables
		this.distance = distance;
		this.velocity = velocity;
		this.clamp = clamp;
		this.maxClamp = maxClamp;
		this.currentVelocity = 0;
		this.currentClampV = 0;
		this.currentClampH = 0;
		this.smooth = smooth;
		this.scrollbar = scrollbar;
		this.barSize = barSize;

		/** @type {Boolean} */
		this.horizontal = horizontal;

		this.dragInit = false;
		this.animator = null;
		this.disabled = false;
		let ticking = false;

		/**
		 * Stop Propagating to parent scrollable even when scroll content
		 * reached top or bottom point of scroll container
		 * @type {Boolean}
		 */
		this.scrollout = scrollout;

		// Listeners for scrolling events
		this.content.addEventListener("scroll", (e) => this.updateScrollbar(e));
		this.content.addEventListener("wheel", (event) => {
			if (event.ctrlKey)
				return;
			
			let contentScrollable = true;

			if (!this.scrollout && !this.smooth) {
				let delta = (this.horizontal)
					? event.deltaX
					: event.deltaY;
	
				let from = (horizontal)
					? this.content.scrollLeft
					: this.content.scrollTop;
	
				let maxScroll = (horizontal)
					? this.content.scrollWidth - this.content.offsetWidth
					: this.content.scrollHeight - this.content.offsetHeight;
	
				contentScrollable = maxScroll > 0 && (this.smooth || delta > 0 && from < maxScroll) || (delta < 0 && from > 0);
			}

			if (contentScrollable) {
				event.stopPropagation();
				event.preventDefault();
	
				if (!ticking) {
					requestAnimationFrame(() => {
						if (this.smooth)
							this.animationUpdate({ event });
						else
							this.update({ event });
	
						ticking = false;
					});
	
					ticking = true;
				}
			}
		}, { passive: false });

		// Observer for content resizing and new element
		// added into content for updaing scrollbar
		new ResizeObserver(() => {
			this.updateScrollbarPos();
			this.updateScrollbar();
		}).observe(this.content);

		new MutationObserver(() => this.updateObserveList()).observe(
			this.content,
			{ childList: true }
		);

		// Since we add the mutation observer after the
		// content element is initialized, there are (maybe)
		// elements that hasn't applied observing.
		// So we call this to apply observer into
		// existing elements
		this.updateObserveList();
	}

	initDrag() {
		if (this.dragInit)
			return;

		// Listeners for dragging and dropping scrollbar thumb
		this.cRel = { x: 0, y: 0 }
		this.sTicking = false;
		this.vThumbDragging = false;
		this.hThumbDragging = false;
		this.__dragStartV = (e) => this.dragStart(e, false);
		this.__dragStartH = (e) => this.dragStart(e, true);
		this.__dragUpdate = (e) => this.dragUpdate(e);
		this.__dragEnd = () => this.dragEnd();

		this.vBar.thumb.addEventListener("mousedown", this.__dragStartV);
		this.hBar.thumb.addEventListener("mousedown", this.__dragStartH);
		window.addEventListener("mouseup", this.__dragEnd);

		this.dragInit = true;
	}

	cleanDrag() {
		if (!this.dragInit)
			return;

		this.vBar.thumb.removeEventListener("mousedown", this.__dragStartV);
		this.hBar.thumb.removeEventListener("mousedown", this.__dragStartH);
		window.removeEventListener("mouseup", this.__dragEnd);

		this.dragInit = false;
	}

	dragStart(e, horizontal = false) {
		e.preventDefault();
		this.vThumbDragging = !horizontal;
		this.hThumbDragging = horizontal;
		window.addEventListener("mousemove", this.__dragUpdate);

		// Calculate cursor position relative to selected
		// track
		let r = e.target.getBoundingClientRect();
		this.cRel.x = e.clientX - r.left;
		this.cRel.y = e.clientY - r.top;
	}

	dragUpdate(e) {
		if (!this.vThumbDragging && !this.hThumbDragging)
			return;

		e.preventDefault();
		if (!this.sTicking) {
			requestAnimationFrame(() => {
				let horizontal;
				let value;

				if (this.vThumbDragging) {
					let r = this.vBar.getBoundingClientRect();
					let t = this.vBar.thumb.getBoundingClientRect();
					let top = r.top + this.cRel.y;
					let bottom = (r.top + r.height) - (t.height - this.cRel.y);
					let cVal = clamp((e.clientY - top) / (bottom - top), 0, 1);
					
					value = (this.content.scrollHeight - this.content.offsetHeight) * cVal;
					horizontal = false;
				}
	
				if (this.hThumbDragging) {
					let r = this.hBar.getBoundingClientRect();
					let t = this.hBar.thumb.getBoundingClientRect();
					let left = r.left + this.cRel.x;
					let right = (r.left + r.width) - (t.width - this.cRel.x);
					let cVal = clamp((e.clientX - left) / (right - left), 0, 1);
					
					value = (this.content.scrollWidth - this.content.offsetWidth) * cVal;
					horizontal = true;
				}

				if (typeof horizontal === "boolean")
					this.update({ value, horizontal });

				this.sTicking = false;
			});

			this.sTicking = true;
		}
	}

	dragEnd() {
		this.vThumbDragging = false;
		this.hThumbDragging = false;
		window.removeEventListener("mousemove", this.__dragUpdate);
	}

	updateObserveList() {
		for (let e of this.content.children) {
			// If current element already being
			// observed, skip to next element
			if (e.getAttribute("observing"))
				continue;

			e.setAttribute("observing", "true");
			new ResizeObserver(async() => {
				// For some weird reason we have to wait for next
				// frame to let content scrolling position update
				// A better implement is appreciated
				await nextFrameAsync();

				this.updateScrollbar();
			}).observe(e);
		}
	}

	/**
	 * Enable or Disable custom scrollbar
	 * You probally won't do it. Right? 😊
	 * 
	 * @param	{Boolean}	enable
	 */
	set scrollbar(enable) {
		if (typeof enable !== "boolean")
			throw { code: -1, description: `Scrollable.scrollbar: not a valid boolean` }

		this.__scrollbar = enable;

		if (enable) {
			this.container.classList.add("scrollbar");
			this.initDrag();
		} else {
			this.container.classList.remove("scrollbar");
			this.cleanDrag();
		}
	}

	/**
	 * Is the custom scrollbar Enabled
	 * or Disabled?
	 * 
	 * @returns	{Boolean}
	 */
	get scrollbar() {
		return this.__scrollbar;
	}

	/**
	 * Set scrollbar width/height
	 * 
	 * @returns	{Number}
	 */
	set barSize(size) {
		this.__barSize = size;
		this.container.style.setProperty("--scrollbar-size", `${size}px`);
	}

	get barSize() {
		return this.__barSize;
	}

	updateScrollbar() {
		if (!this.scrollbar)
			return;

		/** @type {HTMLElement} */
		let t = this.content;

		let r =  {
			width: t.offsetWidth,
			height: t.offsetHeight,
			sWidth: t.scrollWidth + Math.abs(this.currentClampH),
			sHeight: t.scrollHeight + Math.abs(this.currentClampV)
		}

		let s = {
			width: this.hBar.getBoundingClientRect().width,
			height: this.vBar.getBoundingClientRect().height
		}

		let top = t.scrollTop;
		let left = t.scrollLeft;
		let width = r.sWidth - r.width - Math.abs(this.currentClampH);
		let height = r.sHeight - r.height - Math.abs(this.currentClampV);
		let tWidth = (r.width / r.sWidth) * s.width;
		let tHeight = (r.height / r.sHeight) * s.height;

		if (r.height < r.sHeight) {
			this.vBar.classList.remove("hide");
			this.vBar.thumb.style.height = `${tHeight}px`;
			this.vBar.thumb.style.top = `${(top / height) * (s.height - tHeight)}px`;
		} else
			this.vBar.classList.add("hide");

		if (r.width < r.sWidth) {
			this.hBar.classList.remove("hide");
			this.hBar.thumb.style.width = `${tWidth}px`;
			this.hBar.thumb.style.left = `${(left / width) * (s.width - tWidth)}px`;
		} else
			this.hBar.classList.add("hide");
	}

	toBottom() {
		let maxScroll = this.content.scrollHeight - this.content.offsetHeight;

		if (this.smooth)
			this.animationUpdate({
				value: maxScroll,
				horizontal: false
			});
		else
			this.update({
				value: maxScroll,
				horizontal: false
			});
	}

	updateScrollbarPos() {
		this.vBar.style.top = `${this.content.offsetTop}px`;
		this.vBar.style.bottom = `${this.container.offsetHeight - this.content.offsetTop - this.content.offsetHeight}px`;
		this.hBar.style.left = `${this.content.offsetLeft}px`;
		this.hBar.style.right = `${this.container.offsetWidth - this.content.offsetLeft - this.content.offsetWidth + this.barSize}px`;
	}

	update({
		event,
		value,
		horizontal = this.horizontal
	} = {}) {
		// Calculate the point where the user start scrolling
		let from = (horizontal)
			? this.content.scrollLeft
			: this.content.scrollTop;
	
		// Amount of scroll in pixel
		let delta;
		if (event)
			delta = (horizontal)
				? event.deltaX
				: event.deltaY;
		else
			delta = value - from;
		
		// Check if scrolling event actually move the
		// scrollable content or scrolling is disabled
		// If so we will stop executing
		if (delta === 0 || this.disabled)
			return;

		// Calculate the maximum point of
		// scrolling in the content
		let maxScroll = (horizontal)
			? this.content.scrollWidth - this.content.offsetWidth
			: this.content.scrollHeight - this.content.offsetHeight;

		this.content[horizontal ? "scrollLeft" : "scrollTop"] = Math.min(maxScroll, from + delta);
	}

	animationUpdate({
		event,
		value,
		horizontal = this.horizontal,
		clamping = true
	} = {}) {
		// Calculate the point where the user start scrolling
		let from = (horizontal)
			? this.content.scrollLeft
			: this.content.scrollTop;

		// Amount of scroll in pixel
		let delta;
		if (event)
			delta = (horizontal)
				? event.deltaX
				: event.deltaY;
		else
			delta = value - from;
		
		// Check if scrolling event actually move the
		// scrollable content or scrolling is disabled
		// If so we will stop executing
		if (delta === 0 || this.disabled)
			return;

		// Calculate the maximum point of
		// scrolling in the content
		let maxScroll = (horizontal)
			? this.content.scrollWidth - this.content.offsetWidth
			: this.content.scrollHeight - this.content.offsetHeight;

		// Calculate current scrolling velocity and add
		// it with global velocity
		//
		// This is to add up velocity in case user is scrolling
		// continiously
		this.currentVelocity += (delta > 0) ? this.velocity : -this.velocity;
		
		// Initialize staring point of velocity so we can
		// decreaese the global velocity by time
		let startVelocity = this.currentVelocity;

		// Calculate the point where scrolling should be end
		let to = from + ((this.distance * Math.abs(delta)) * this.currentVelocity);

		let clampPoint;
		let clampFrom;
		let clampTo;

		// If another animator is present, destory current one
		// and initialize a new Animator
		if (this.animator)
			this.animator.cancel();

		this.animator = Animator(.6, Easing.OutQuart, (t) => {
			// Calucate current scrolling point by time
			let current = from + (to - from) * t;

			// Decreasing the velocity
			this.currentVelocity = startVelocity * (1 - t);

			// Check if scrolling reached the begining of the content
			// or the end of the content. If so we will calculate
			// the clamping animation
			if ((current > maxScroll || current < 0)) {
				if (!clamping)
					return false;

				// If the clamping point hasn't been defined yet,
				// we init clampPoint with the current time and
				// calculate some others value
				if (!clampPoint) {
					clampPoint = t;
					clampFrom = this.content.clampValue;
					clampTo = clampFrom + (this.clamp * -(this.currentVelocity * ((1 - (clampFrom / this.maxClamp)) / 2)));

					if (current > maxScroll) {
						this.content[horizontal ? "scrollLeft" : "scrollTop"] = maxScroll;
						clampTo = Math.max(clampTo, -this.maxClamp);
					} else if (current < 0) {
						this.content[horizontal ? "scrollLeft" : "scrollTop"] = 0;
						clampTo = Math.min(clampTo, this.maxClamp);
					}
				}

				let c = (t - clampPoint) / (1 - clampPoint);
				t = ((c < 0.5) ? 2*c : (-2*c + 2));

				if (c >= 0.5 && clampFrom !== 0)
					clampFrom = 0;

				let clampValue = clampFrom + (clampTo - clampFrom) * t;

				this.content.style.transform = (horizontal)
					? `translateX(${clampValue}px)`
					: `translateY(${clampValue}px)`;

				if (this.horizontal)
					this.currentClampH = clampValue;
				else
					this.currentClampV = clampValue;
					
				this.updateScrollbar();
				this.content.clampValue = clampValue;
			} else {
				this.content.style.transform = null;
				this.content.clampValue = 0;
				this.content[horizontal ? "scrollLeft" : "scrollTop"] = current;
			}
		});

		this.animator.onComplete(() => this.animator = null);
	}
}