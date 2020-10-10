//? |-----------------------------------------------------------------------------------------------|
//? |  /assets/js/scrollable.js                                                                     |
//? |                                                                                               |
//? |  Copyright (c) 2018-2020 Belikhun. All right reserved                                         |
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
		distance = 60,
		velocity = 2,
		clamp = 20,
		maxClamp = 400
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

		this.animator = null;
		this.disabled = false;

		let ticking = false;
		this.container.addEventListener("wheel", (e) => {
			if (e.ctrlKey)
				return;

			e.preventDefault();

			if (!ticking) {
				requestAnimationFrame(() => {
					this.update(e);
					ticking = false;
				})

				ticking = true;
			}
		});
	}

	update(e) {
		if (e.deltaY === 0 || this.disabled)
			return;

		let maxScroll = this.container.scrollHeight - this.container.offsetHeight;
		this.currentVelocity += (e.deltaY > 0) ? this.velocity : -this.velocity;
		
		let startVelocity = this.currentVelocity;
		let from = this.container.scrollTop;
		let to = from + (this.distance * this.currentVelocity);

		let clampPoint;
		let clampFrom;
		let clampTo;

		if (this.animator)
			this.animator.cancel();

		this.animator = Animator(.6, Easing.OutQuart, (t) => {
			let current = from + (to - from) * t;
			this.currentVelocity = startVelocity * (1 - t);

			if (current > maxScroll || current < 0) {
				if (!clampPoint) {
					clampPoint = t;
					clampFrom = this.container.clampValue;
					clampTo = clampFrom + (this.clamp * -(this.currentVelocity * ((1 - (clampFrom / this.maxClamp)) / 2)));

					if (current > maxScroll) {
						this.container.scrollTop = maxScroll;
						clampTo = Math.max(clampTo, -this.maxClamp);
					} else if (current < 0) {
						this.container.scrollTop = 0;
						clampTo = Math.min(clampTo, this.maxClamp);
					}
				}

				let c = (t - clampPoint) / (1 - clampPoint);
				t = ((c < 0.5) ? 2*c : (-2*c + 2));

				if (c >= 0.5 && clampFrom !== 0)
					clampFrom = 0;

				let clampValue = clampFrom + (clampTo - clampFrom) * t;

				this.container.style.transform = `translateY(${clampValue}px)`;
				this.container.clampValue = clampValue;
			} else {
				this.container.style.transform = null;
				this.container.clampValue = 0;
				this.container.scrollTop = current;
			}
		});

		this.animator.onComplete(() => this.animator = null);
	}
}