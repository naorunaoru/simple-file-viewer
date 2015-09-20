var express = require('express');
var fs = require('fs');
var mime = require('mime-types');

var app = express();

app.use(express.static('public'));

app.set('view engine', 'jade');

// костыль для мейлру агента (хочу лулзы в чатик кидать), потом что-нибудь придумаю
var checkMRA = function(req, res, next) {
	var pathRelativeToClient = '/box/' + req.params.file;
	var pathRelativeToServer = __dirname + '/public' + pathRelativeToClient;

	if (req.headers['user-agent'].indexOf('Mail.Ru') != -1) {
		var stat = fs.statSync(pathRelativeToServer);

		res.writeHead(200, {
				'Content-Type': 'image',
				'Content-Length': stat.size
		});

		var readStream = fs.createReadStream(pathRelativeToServer);
		readStream.pipe(res);

		return false;
	}

	next();
}
// костыль кончился, можно выдохнуть

// а, нет, другой костыль — проверка изображения по mime-типу зачем-то
var templateSelector = function(path) {
	var contentType = mime.lookup(path) || 'application/octet-stream';

	if (contentType.split('/')[0] == 'image' && contentType.split('/')[1].match(/(jpg|jpeg|png|gif)/)) {
		return 'view'
	} else {
		return 'download'
	}
}

app.use('/:file', checkMRA);

app.get('/:file', function (req, res) {
	var pathRelativeToClient = '/box/' + req.params.file;
	var pathRelativeToServer = __dirname + '/public' + pathRelativeToClient;

	try {
		fs.statSync(pathRelativeToServer);
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

  res.render(templateSelector(req.params.file), {
		fileName: req.params.file,
		filePath: pathRelativeToClient,

		meta: {
			fullPath: 'http://kpwk.pw/' + req.params.file,
			fullDirectPath: 'http://kpwk.pw' + pathRelativeToClient
		}
	});
});

var server = app.listen(process.argv[2] || 80, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Viewer listening at http://%s:%s', host, port);
});
