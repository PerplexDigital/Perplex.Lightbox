# Perplex Lightbox

Lightweight and Accessible Lightbox/Modal that supports CSS or GSAP animations out of the box.

The plugin checks if the website is already loading GSAP. If so, GSAP will be used for animations.
If not, CSS-animations will be used.

## Import plugin
The plugin is available as a ES-module, CommonJS-module and Universal Module (UMD).
#### ESM:
```js
import Lightbox from '../../dist/perplex.lightbox.js';
```

#### UMD:
Load this file in your HTML:
```html
<script src="'../../dist/perplex.lightbox.umd.js"></script>
```

## Usage
```js
var lightboxElem = document.getElementById("lightbox");
var myLightbox = new Lightbox(lightboxElem);

-- In your event listener: --
myLightbox.open();
```

## Options
### Arguments
Lightbox() takes two arguments: element and options
Option | Type | Default | Description
------ | ---- | ------- | -----------
elem | DOM Node or jQuery object | null | Lightbox container element (required).
options | object | {} | Options for controlling animations.

#### Options-arguments (all optional)
Option | Type | Default | Description
------ | ---- | ------- | -----------
duration | Number | 400 | Duration of the animations (in ms).
staticEaseOpen | String | "cubic-bezier(0.21, 0.49, 0.1, 0.99)" | Easing to apply on the CSS-animation when lightbox opens.
staticEaseClose | String | "ease-in" | Easing to apply on the CSS-animation when lightbox closes.
gsapEaseOpen | String | "expo.out" | Easing to apply on when lightbox opens.
gsapEaseClose | String | "power1.in" | Easing to apply on when lightbox closes.

**Valid easings:**
- Gsap easings: https://greensock.com/ease-visualizer/;
- Static/CSS easings: every CSS-value accepted by 'transition-timing-function' is valid.

## Methods

Method | Arguments | Description
------ | ----- | ---------
open | none | Opens the lightbox.
close | none | Closes the lightbox.
addCallback | callback[function], moment[string] | Adds a callback function which will be executed at a specific 'moment' in time. Valid moments are: "onOpenBegin", "onOpenEnd", "onCloseBegin", "onCloseEnd".
