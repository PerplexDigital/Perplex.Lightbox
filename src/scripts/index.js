/**
 * PerplexLightbox v1.0.3
 */

/**
 * Component state
 */
 const state = {
 	animFrameworks: {
 		gsap: false,
 		animejs: false,
 	},
 	prevFocusElem: null,
 	ignoreFocus: false,
 	runningAnimations: {
 		container: null,
 		item: null,
 	},
 };

/**
 * Component functions
 */
 const func = {
 	checkAnimationFramework: function() {
 		if (window.gsap) {
 			state.animFrameworks.gsap = true;
 		} else if (window.anime) {
 			state.animFrameworks.animejs = true;
 		}
 	},
 	killRunningAnimations: function() {
 		for (const forItem in state.runningAnimations) {
 			state.runningAnimations[forItem].kill();
 		}
 	},
 	staticAnimationCallbacks:  {
 		onOpenBegin: function() {
 			this.runCallbacks(this.callbacks.onOpenBegin);
 		},
 		onOpenEnd: function() {
 			this.runCallbacks(this.callbacks.onOpenEnd);
 		},
 		onCloseBegin: function() {
 			this.runCallbacks(this.callbacks.onCloseBegin);
 		},
 		onCloseEnd: function() {
			this.element.style.display = "none";
			this.item.style.opacity = "0";
 			this.runCallbacks(this.callbacks.onCloseEnd);
 		},
 	}
 	
 };

/**
 * Class Lightbox
 */
 class Lightbox {
 	constructor(elem, options) {
 		if (elem && typeof elem !== 'object') {
 			throw new Error('Spefify an object as container');
 		}
 		if (elem.prevObject) {
 			elem = elem[0];
 		}

 		// options passed
 		this.options = options || {}
 		if(this.options && typeof this.options !== 'object') {
 			throw new Error('Options is not an object');
 		}

		this.element = elem;
		this.item = this.element.querySelector('.js-lightboxElem');
		this.closeButton = this.element.querySelector('.js-lightboxClose');

		this.focusable = {
			elements: [],
			firstFocusable: null,
			lastFocusable: null,
			nextFocus: null,
			prevFocusElem: null,
		}

		this.callbacks = {
			onOpenBegin: [],
			onOpenEnd: [],
			onCloseBegin: [],
			onCloseEnd: [],
		};

		// Animation properties
		this.animationProps = {
	 		duration: this.options.duration ? this.options.duration : 400,
	 		item: {
	 			gsapEaseOpen: this.options.gsapEaseOpen ? this.options.gsapEaseOpen : 'expo.out',
	 			gsapEaseClose: this.options.gsapEaseClose ? this.options.gsapEaseClose : 'power1.in',
	 			staticEaseOpen: this.options.staticEaseOpen ? this.options.staticEaseOpen : 'cubic-bezier(0.21, 0.49, 0.1, 0.99)',
	 			staticEaseClose: this.options.staticEaseClose ? this.options.staticEaseClose : 'ease-in',
	 		},
	 	};

		// gsap animatie/timeline mee kunnen geven (chasing sunsets)
		this.addCallback(() => {
			this.closeButton.focus();
		}, 'onOpenBegin');

		// Focus vorige element wanneer sluiten begint
		this.addCallback(() => {
			if (state.prevFocusElem) {
				state.prevFocusElem.focus();
			}
		}, 'onCloseBegin');

		this.closeOnEscape = this.closeOnEscape.bind(this);
		this.closeOnClick = this.closeOnClick.bind(this);
		this.trapFocus = this.trapFocus.bind(this);
		this.close = this.close.bind(this);

		this.getFocusableElements();

		// static animations
		this.static = {
			onOpenBegin: func.staticAnimationCallbacks.onOpenBegin.bind(this),
			onOpenEnd: func.staticAnimationCallbacks.onOpenEnd.bind(this),
			onCloseBegin: func.staticAnimationCallbacks.onCloseBegin.bind(this),
			onCloseEnd: func.staticAnimationCallbacks.onCloseEnd.bind(this),
		};
	}


	// open / close

	open() {
		// store previously focussed item
		state.prevFocusElem = document.activeElement;
		
		// apply close events (close on escape, etc)
		this.addListeners();

		// open the lightbox with GSAP
		if (state.animFrameworks.gsap) {
			state.runningAnimations.container = gsap.fromTo(this.element, this.animationProps.duration / 1000, { opacity: 0, display: "block"}, { opacity: 1 } ); 
			state.runningAnimations.item = gsap.fromTo(this.item, this.animationProps.duration / 1000, { scale: 0.9, opacity: 0 }, {scale: 1, opacity: 1, ease: this.animationProps.item.gsapEaseOpen, onStart: this.runCallbacks, onStartParams: [this.callbacks.onOpenBegin], onComplete: this.runCallbacks, onCompleteParams: [this.callbacks.onOpenEnd],} ); 
		} 
		else {
			this.element.style.display = "block";
			this.element.style.animation = `containerShow ${this.animationProps.duration / 1000}s forwards`;
			this.item.style.animation = `itemShow ${this.animationProps.duration / 1000}s ${this.animationProps.item.staticEaseOpen} forwards`;
		}
		
	}

	close() {

		this.removeListeners();
		if (state.animFrameworks.gsap) {
			func.killRunningAnimations();
			state.runningAnimations.container = gsap.to(this.element, this.animationProps.duration / 1500, { opacity: 0, display: "none"} );
			state.runningAnimations.item = gsap.to(this.item, this.animationProps.duration / 1500, {scale: 0.95, opacity: 0, ease: this.animationProps.item.gsapEaseClose, onStart: this.runCallbacks, onStartParams: [this.callbacks.onCloseBegin], onComplete: this.runCallbacks, onCompleteParams: [this.callbacks.onCloseEnd], });
		}
		else {
			this.element.style.animation = `containerHide ${this.animationProps.duration / 1500}s forwards`;
			this.item.style.animation = `itemHide ${this.animationProps.duration / 1500}s ${this.animationProps.item.staticEaseClose} forwards`;
		}

	}


	// Callbacks
	addCallback(callback, moment) {
		if (typeof callback !== 'function') {
			throw new Error('callback must be a function');
		}
		if (moment && typeof moment !== 'string') {
			throw new Error('moment must be a string');
		}

		moment = moment || 'onCloseEnd';

		if (moment !== 'onOpenBegin' && moment !== 'onOpenEnd' && moment !== 'onCloseBegin' && moment !== 'onCloseEnd') {
			throw new Error("moment must be either 'onOpenBegin', 'onOpenEnd', 'onCloseBegin', 'onCloseEnd'");
		}

		this.callbacks[moment].push(callback);
	}

	runCallbacks(callbackArr) {
		for (const callback of callbackArr) {
			callback(this);
		}
	}


	// Focus within lightbox
	getFocusableElements() {
		this.focusable = this.element.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
		this.focusable.firstFocusable = this.focusable[0];
		this.focusable.lastFocusable = this.focusable[this.focusable.length - 1];
	}

	trapFocus(e) {
		if (e.key === 'Tab' || e.keyCode === 9) {
	        if ( e.shiftKey ) {
	            if (document.activeElement === this.focusable.firstFocusable) {
	                this.focusable.lastFocusable.focus();
	                e.preventDefault();
	            }
	        } else {
	            if (document.activeElement === this.focusable.lastFocusable) {
	                this.focusable.firstFocusable.focus();
	                e.preventDefault();
	            }
	        }
	    }
	}


	// Event listeners
	addListeners() {
		document.addEventListener('keyup', this.closeOnEscape);
		document.addEventListener('keydown', this.trapFocus, true);
		this.closeButton.addEventListener('click', this.close);
		this.element.addEventListener('click', this.closeOnClick);

		// Static animations
		if(!state.animFrameworks.gsap) {
			this.element.removeEventListener('animationstart', this.static.onCloseBegin);
			this.element.removeEventListener('animationend', this.static.onCloseEnd);

			this.element.addEventListener('animationstart', this.static.onOpenBegin);
			this.element.addEventListener('animationend', this.static.onOpenEnd);
		}
	}

	removeListeners() {
		document.removeEventListener('keyup', this.closeOnEscape);
		document.removeEventListener('keydown', this.trapFocus, true);
		this.closeButton.removeEventListener('click', this.close);
		this.element.removeEventListener('click', this.closeOnClick);
		
		// Static animations
		if(!state.animFrameworks.gsap) {
			this.element.removeEventListener('animationstart', this.static.onOpenBegin);
			this.element.removeEventListener('animationend', this.static.onOpenEnd);

			this.element.addEventListener('animationstart', this.static.onCloseBegin);
			this.element.addEventListener('animationend', this.static.onCloseEnd);
		}
	}

	closeOnEscape(e) {
		if (e.key == 'Escape') {
			this.close();
		} 
	}

	closeOnClick(e) {
		if(!e.target.closest(".js-lightboxElem")) {
			this.close();
		}
	}
}

// acties toevoegen als .on("close", funciton...) zodat er bijvoorbeeld analytics events meegegeven worden.

/**
 * Functions to execute on initialization
 */
function onInit() {
	func.checkAnimationFramework();
	polyfills();
}

function polyfills() {
	// closest
	if (!Element.prototype.matches) {
		Element.prototype.matches =
		Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
	}

	if (!Element.prototype.closest) {
		Element.prototype.closest = function(s) {
			var el = this;

			do {
				if (el.matches(s)) return el;
				el = el.parentElement || el.parentNode;
			} while (el !== null && el.nodeType === 1);
			return null;
		};
	}
}

onInit();

export default Lightbox;
