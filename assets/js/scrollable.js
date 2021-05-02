//? |-----------------------------------------------------------------------------------------------|
//? |  /assets/js/scrollable.js                                                                     |
//? |                                                                                               |
//? |  Copyright (c) 2018-2021 Belikhun. All right reserved                                         |
//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
//? |-----------------------------------------------------------------------------------------------|

/**
 * Provide Smooth Scrolling and Custom Scrollbar
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
		this.smooth = smooth;
		this.scrollbar = scrollbar;
		this.barSize = barSize;

		/**
		 * @type {Boolean}
		 */
		this.horizontal = horizontal;

		this.animator = null;
		this.disabled = false;
		let ticking = false;

		this.content.addEventListener("scroll", (e) => this.updateScrollbar(e));
		this.content.addEventListener("wheel", (e) => {
			if (e.ctrlKey)
				return;

			e.preventDefault();

			if (!ticking) {
				requestAnimationFrame(() => {
					if (this.smooth)
						this.animationUpdate(e);
					else
						this.update(e);

					ticking = false;
				});

				ticking = true;
			}
		}, { passive: false });

		new ResizeObserver(() => this.updateScrollbarPos()).observe(this.content);
		new MutationObserver(() => this.updateObserveList()).observe(
			this.content,
			{ childList: true }
		);

		this.updateObserveList();
	}

	updateObserveList() {
		for (let e of this.content.children) {
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

		if (enable)
			this.container.classList.add("scrollbar");
		else
			this.container.classList.remove("scrollbar");
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

	update(e) {
		let delta = (this.horizontal)
			? e.deltaX
			: e.deltaY;

		// Check if scrolling event actually move the
		// scrollable content or scrolling is disabled
		// If so we will stop executing
		if (delta === 0 || this.disabled)
			return;

		// Calculate the maximum point of
		// scrolling in the content
		let maxScroll = (this.horizontal)
			? this.content.scrollWidth - this.content.offsetWidth
			: this.content.scrollHeight - this.content.offsetHeight;

		// Calculate the point where the user start scrolling
		let from = (this.horizontal)
			? this.content.scrollLeft
			: this.content.scrollTop;

		this.content[this.horizontal ? "scrollLeft" : "scrollTop"] = Math.min(maxScroll, from + delta);
	}

	updateScrollbar() {
		/** @type {HTMLElement} */
		let t = this.content;

		let r =  {
			width: t.offsetWidth,
			height: t.offsetHeight
		}

		let s = {
			width: this.hBar.getBoundingClientRect().width,
			height: this.vBar.getBoundingClientRect().height
		}

		let top = t.scrollTop;
		let left = t.scrollLeft;
		let width = t.scrollWidth - r.width;
		let height = t.scrollHeight - r.height;
		let tWidth = (r.width / t.scrollWidth) * s.width;
		let tHeight = (r.height / t.scrollHeight) * s.height;

		this.vBar.thumb.style.height = `${tHeight}px`;
		this.vBar.thumb.style.top = `${(top / height) * (s.height - tHeight)}px`;
		this.hBar.thumb.style.width = `${tWidth}px`;
		this.hBar.thumb.style.left = `${(left / width) * (s.width - tWidth)}px`;
	}

	updateScrollbarPos() {
		this.vBar.style.top = `${this.content.offsetTop}px`;
		this.vBar.style.bottom = `${this.container.offsetHeight - this.content.offsetTop - this.content.offsetHeight}px`;
		this.hBar.style.left = `${this.content.offsetLeft}px`;
		this.hBar.style.right = `${this.container.offsetWidth - this.content.offsetLeft - this.content.offsetWidth + this.barSize}px`;
	}

	animationUpdate(e) {
		let delta = (this.horizontal)
			? e.deltaX
			: e.deltaY;
		
		// Check if scrolling event actually move the
		// scrollable content or scrolling is disabled
		// If so we will stop executing
		if (delta === 0 || this.disabled)
			return;

		// Calculate the maximum point of
		// scrolling in the content
		let maxScroll = (this.horizontal)
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

		// Calculate the point where the user start scrolling
		let from = (this.horizontal)
			? this.content.scrollLeft
			: this.content.scrollTop;

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
			if (current > maxScroll || current < 0) {
				// If the clamping point hasn't been defined yet,
				// we init clampPoint with the current time and
				// calculate some others value
				if (!clampPoint) {
					clampPoint = t;
					clampFrom = this.content.clampValue;
					clampTo = clampFrom + (this.clamp * -(this.currentVelocity * ((1 - (clampFrom / this.maxClamp)) / 2)));

					if (current > maxScroll) {
						this.content[this.horizontal ? "scrollLeft" : "scrollTop"] = maxScroll;
						clampTo = Math.max(clampTo, -this.maxClamp);
					} else if (current < 0) {
						this.content[this.horizontal ? "scrollLeft" : "scrollTop"] = 0;
						clampTo = Math.min(clampTo, this.maxClamp);
					}
				}

				let c = (t - clampPoint) / (1 - clampPoint);
				t = ((c < 0.5) ? 2*c : (-2*c + 2));

				if (c >= 0.5 && clampFrom !== 0)
					clampFrom = 0;

				let clampValue = clampFrom + (clampTo - clampFrom) * t;

				this.content.style.transform = (this.horizontal)
					? `translateX(${clampValue}px)`
					: `translateY(${clampValue}px)`;
					
				this.content.clampValue = clampValue;
			} else {
				this.content.style.transform = null;
				this.content.clampValue = 0;
				this.content[this.horizontal ? "scrollLeft" : "scrollTop"] = current;
			}
		});

		this.animator.onComplete(() => this.animator = null);
	}
}