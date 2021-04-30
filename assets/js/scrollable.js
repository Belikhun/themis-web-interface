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
		distance = 1,
		velocity = 2,
		clamp = 20,
		maxClamp = 400,
		horizontal = false
	} = {}) {
		if (typeof container !== "object" || (!container.classList && !container.container))
			throw { code: -1, description: `Scrollable(): container is not a valid node` }

		/**
		 * Main scrolling container
		 */
		this.container = container;
		this.container.classList.add("scrollable");
		this.container.clampValue = 0;

		this.distance = distance;
		this.velocity = velocity;
		this.clamp = clamp;
		this.maxClamp = maxClamp;
		this.currentVelocity = 0;

		/**
		 * @type {Boolean}
		 */
		this.horizontal = horizontal;

		this.animator = null;
		this.disabled = false;

		let ticking = false;
		this.container.addEventListener("wheel", (e) => {
			if (e.ctrlKey)
				return;

			// e.preventDefault();

			if (!ticking) {
				requestAnimationFrame(() => {
					this.update(e);
					ticking = false;
				});

				ticking = true;
			}
		}, { passive: true });
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
		// scrolling in the container
		let maxScroll = (this.horizontal)
			? this.container.scrollWidth - this.container.offsetWidth
			: this.container.scrollHeight - this.container.offsetHeight;

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
			? this.container.scrollLeft
			: this.container.scrollTop;

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

			// Check if scrolling reached the begining of the container
			// or the end of the container. If so we will calculate
			// the clamping animation
			if (current > maxScroll || current < 0) {
				// If the clamping point hasn't been defined yet,
				// we init clampPoint with the current time and
				// calculate some others value
				if (!clampPoint) {
					clampPoint = t;
					clampFrom = this.container.clampValue;
					clampTo = clampFrom + (this.clamp * -(this.currentVelocity * ((1 - (clampFrom / this.maxClamp)) / 2)));

					if (current > maxScroll) {
						this.container[this.horizontal ? "scrollLeft" : "scrollTop"] = maxScroll;
						clampTo = Math.max(clampTo, -this.maxClamp);
					} else if (current < 0) {
						this.container[this.horizontal ? "scrollLeft" : "scrollTop"] = 0;
						clampTo = Math.min(clampTo, this.maxClamp);
					}
				}

				let c = (t - clampPoint) / (1 - clampPoint);
				t = ((c < 0.5) ? 2*c : (-2*c + 2));

				if (c >= 0.5 && clampFrom !== 0)
					clampFrom = 0;

				let clampValue = clampFrom + (clampTo - clampFrom) * t;

				this.container.style.transform = (this.horizontal)
					? `translateX(${clampValue}px)`
					: `translateY(${clampValue}px)`;
					
				this.container.clampValue = clampValue;
			} else {
				this.container.style.transform = null;
				this.container.clampValue = 0;
				this.container[this.horizontal ? "scrollLeft" : "scrollTop"] = current;
			}
		});

		this.animator.onComplete(() => this.animator = null);
	}
}