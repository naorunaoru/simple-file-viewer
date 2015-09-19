(function() {
	'use strict';

	var imageContainer = document.getElementsByClassName('image-container')[0];

	var toggleZoom = function(event) {
		imageContainer.classList.toggle('image-container__zoomed');
	}

	imageContainer.addEventListener('click', toggleZoom);
}());
