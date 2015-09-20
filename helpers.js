var helpers = {
	autoFormatFileSize: function(fileSize) {
		if (fileSize > (1024*1024*1024)) {
			return (fileSize / (1024*1024*1024))
			.toPrecision(3) + " GB";
		} else if (fileSize > (1024*1024)) {
			return (fileSize / (1024*1024))
			.toPrecision(3) + " MB";
		} else if (fileSize > 1024) {
			return (fileSize / 1024)
			.toPrecision(3) + " KB";
		} else {
			return fileSize + " B"
		}
	}
}

module.exports = helpers;
