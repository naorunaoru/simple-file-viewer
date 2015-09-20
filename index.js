var express = require('express');
var fs = require('fs');

var app = express();

app.use(express.static('public'));

app.set('view engine', 'jade');

app.get('/:file', function (req, res) {
	var pathRelativeToClient = '/box/' + req.params.file;
	var pathRelativeToServer = __dirname + '/public' + pathRelativeToClient;

	// костыль для мейлру агента (хочу лулзы в чатик кидать), потом что-нибудь придумаю
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
	// костыль кончился, можно выдохнуть

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

  res.render('view', {
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
