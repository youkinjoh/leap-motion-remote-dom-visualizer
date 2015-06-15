var WebSocketServer = require('ws').Server
  , http = require('http')
  , express = require('express');

var app = express();

app.set('port', process.env.PORT || 3000);
app.use(express.static(__dirname + '/public'));

var server = http.createServer(app);
var wss = new WebSocketServer({server: server});

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    wss.clients
      .filter(function(client) {return client !== ws;})
      .forEach(function(client) {
        client.send(message);
      });
  });
});

server.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});
