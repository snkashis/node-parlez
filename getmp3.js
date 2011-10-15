var http = require('http'),
	sys = require("sys"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
    events = require("events"),
	paperboy = require('paperboy');
	request = require('request')
	

WEBROOT = path.join(path.dirname(__filename), 'webroot');

console.log(WEBROOT);

http.createServer(function (req, res) {
    
if (req.url[1]=='f') {
	
	var ip = req.connection.remoteAddress;
	  paperboy
	    .deliver(WEBROOT, req, res)
	    .addHeader('Expires', 30000)
		.addHeader('Content-type:', 'audio/mpeg')
	    .addHeader('X-PaperRoute', 'Node')
	    .before(function() {
	      console.log('Received Request');
	    })
	    .after(function(statCode) {
	      log(statCode, req.url, ip);
	    })
	    .error(function(statCode, msg) {
	      res.writeHead(statCode, {'Content-Type': 'text/plain'});
	      res.end("Error " + statCode);
	      log(statCode, req.url, ip, msg);
	    })
	    .otherwise(function(err) {
	      res.writeHead(404, {'Content-Type': 'text/plain'});
	      res.end("Error 404: File not found");
	      log(404, req.url, ip, err);
	    });	
}

else {
	parameters = url.parse(req.url,true);
	console.log(parameters.query)

	var downloadfile = "http://translate.google.com/translate_tts?q="+parameters.query['q']+"&tl="+parameters.query['tl'];

	var currentTime = new Date();
	var realname = currentTime.getTime() + ".mp3";

	request(downloadfile, function(error, response, buffer) {
		//console.log(error)
		//console.log(response)
	}).pipe(fs.createWriteStream("webroot/files/"+realname))


	res.setHeader("Content-Type", "text/html");
	res.write('http://govorijo.rtworldly.com/files/'+realname);
	res.end();   
}  				
    
}).listen(8000);
console.log('Server Running');

function log(statCode, url, ip, err) {
  var logStr = statCode + ' - ' + url + ' - ' + ip;
  if (err)
    logStr += ' - ' + err;
  console.log(logStr);
}
