var WebSocketServer = require('ws').Server
  , http = require('http')
  , express = require('express');

var app = express();

app.set('port', process.env.PORT || 3000);
app.use(express.static(__dirname + '/public'));

var server = http.createServer(app);
var wss = new WebSocketServer({server: server});

var connectionIds = {};

wss.on('connection', function connection(ws) {

  var remoteIds = Object.keys(connectionIds);

  var connectionId;
  while(true) {
    connectionId = Math.floor(Math.random()*0xffffffff).toString(16);
    if (connectionId in connectionIds) {
    } else {
      connectionIds[connectionId] = true;
      break;
    }
  }

  ws.send(JSON.stringify({
    messageType: 'connect',
    connectionId: connectionId,
    remoteIds: remoteIds
  }));
  wss.clients
    .filter(function(client) {return client !== ws;})
    .forEach(function(client) {
      client.send(JSON.stringify({
        messageType: 'connect_remote',
        connectionId: connectionId
      }));
    });

  ws.on('message', function incoming(message) {
    var data = JSON.stringify({
      messageType: 'message',
      connectionId: connectionId,
      data: JSON.parse(message)
    });
    wss.clients
      .filter(function(client) {return client !== ws;})
      .forEach(function(client) {
        client.send(data);
      });
  });

  ws.on('close', function() {
    delete connectionIds[connectionId];
    wss.clients
      .filter(function(client) {return client !== ws;})
      .forEach(function(client) {
        client.send(JSON.stringify({
          messageType: 'disconnect_remote',
          connectionId: connectionId
        }));
      });
  });

});

server.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});
