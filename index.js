var express = require('express');
var fs = require('fs');
var mime = require('mime-types');
var hljs = require('highlight.js');

var helpers = require('./helpers.js');

var app = express();

app.use(express.static('public'));

app.set('view engine', 'jade');

var bootstrapRequest = function(req, res, next) {
	var pathRelativeToClient = '/box/' + req.params.file.replace('../', ''); // I don't know if this might actually work
	var pathRelativeToServer = __dirname + '/public' + pathRelativeToClient;

	try {
		var stats = fs.statSync(pathRelativeToServer);
		var fileSize = helpers.autoFormatFileSize(stats['size']);
	} catch (err) {
		if (err.code == 'ENOENT') {
			res
				.status(404)
				.render('error-404', {
					fileName: req.params.file
				});

			return false;
		}
	}

	req._fileMeta = {
		pathRelativeToServer: pathRelativeToServer,
		pathRelativeToClient: pathRelativeToClient,
		fileSize: fileSize,
		host: req.protocol + '://' + req.headers.host
	}

	next();
}

// костыль для мейлру агента (хочу лулзы в чатик кидать), потом что-нибудь придумаю
var checkMRA = function(req, res, next) {
	if (req.headers['user-agent'].indexOf('Mail.Ru') != -1) {
		var stat = fs.statSync(req._fileMeta.pathRelativeToServer);

		res.writeHead(200, {
				'Content-Type': 'image',
				'Content-Length': stat.size
		});

		var readStream = fs.createReadStream(req._fileMeta.pathRelativeToServer);
		readStream.pipe(res);

		return false;
	}

	next();
}
// костыль кончился, можно выдохнуть

var templateSelector = function(path) {
	var contentType = mime.lookup(path) || 'application/octet-stream';

	if (contentType.split('/')[0] == 'image' && contentType.split('/')[1].match(/(jpg|jpeg|png|gif)/)) {
		return 'view'
	} else if (contentType.split('/')[1].match(/(javascript|html|python|css|x-sh|plain)/)) {
		return 'text'
	} else if (contentType.split('/')[0] == 'audio' && contentType.split('/')[1].match(/mpeg|wav|ogg/)) {
		return 'player'
	}	else {
		return 'download'
	}
}

app.get('/:file', bootstrapRequest, checkMRA, function (req, res) {
	var template = templateSelector(req.params.file);

	var config = {
		fileName: req.params.file,
		filePath: req._fileMeta.pathRelativeToClient,

		meta: {
			fullPath: encodeURI(req._fileMeta.host + '/' + req.params.file),
			fullDirectPath: encodeURI(req._fileMeta.host + req._fileMeta.pathRelativeToClient),
			fileSize: req._fileMeta.fileSize
		}
	}

	if (template == 'text') {
		var file = fs.readFileSync(req._fileMeta.pathRelativeToServer, "utf8");
		var highlightedSource = hljs.highlightAuto(file).value;

		config.highlightedSourceHTMLString = highlightedSource;
	}

  res.render(template, config);
});

var server = app.listen(process.argv[2] || 80, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Viewer listening at http://%s:%s', host, port);
});
