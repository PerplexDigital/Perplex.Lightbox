import Lightbox from '../../dist/perplex.lightbox';

var lightboxElem = $(".js-lightbox");
var myLightbox = new Lightbox(lightboxElem);

window.PerplexLightbox = Lightbox;

$(".js-triggerBox").on("click", function() {
	myLightbox.open();
});