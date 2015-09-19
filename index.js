var express = require('express');
var fs = require('fs');

var app = express();

app.use(express.static('public'));

app.set('view engine', 'jade');

app.get('/:file', function (req, res) {
	var pathRelativeToClient = '/box/' + req.params.file;
	var pathRelativeToServer = './public' + pathRelativeToClient;

	try {
		fs.statSync(pathRelativeToServer);
	} catch (err) {
		if (err.code == 'ENOENT') {
			res.render('error-404', {
				fileName: req.params.file
			});

			return false;
		}
	}

  res.render('view', {
		fileName: req.params.file,
		filePath: pathRelativeToClient
	});
});

var server = app.listen(80, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Viewer listening at http://%s:%s', host, port);
});
