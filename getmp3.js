// govorijo.rtworldly.com


var http = require('http'),
	sys = require("sys"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
    events = require("events"),
	paperboy = require('paperboy');
	

WEBROOT = path.join(path.dirname(__filename), 'webroot');

console.log(WEBROOT);

http.createServer(function (req, res) {
    
cleaned = req.url;
if (cleaned[1]=='f') {
	
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

	cleaned = cleaned.replace("/","");
	var downloadfile = "http://translate.google.com/translate_tts?"+cleaned;
	var host = url.parse(downloadfile).hostname;
	var filename = url.parse(downloadfile).pathname.split("/").pop();
	var currentTime = new Date();
	var realname = currentTime.getTime() + ".mp3";
	var theurl = http.createClient(80, host);
	var requestUrl = downloadfile;
	sys.puts("Downloading file: " + filename);
	sys.puts("Before download request");
	var request = theurl.request('GET', requestUrl, {"host": host});
	request.end();

/*
var dlprogress = 0;


setInterval(function () {
   sys.puts("Download progress: " + dlprogress + " bytes");
}, 1000);
*/

request.addListener('response', function (response) {
        var downloadfile = fs.createWriteStream("webroot/files/"+realname, {'flags': 'a'});
        sys.puts("File size " + realname + ": " + response.headers['content-length'] + " bytes.");
	
        response.addListener('data', function (chunk) {
            //dlprogress += chunk.length;
            downloadfile.write(chunk, encoding='binary');
        });
        
	response.addListener("end", function() {
            downloadfile.end();
            sys.puts("Finished downloading " + filename);
        });

    });

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





//http://stackoverflow.com/questions/4771614/download-large-file-with-node-js-avoiding-high-memory-consumption
//http://stackoverflow.com/questions/2558606/stream-data-with-node-js