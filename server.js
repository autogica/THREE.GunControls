var WebSocketServer = require('ws').Server
  , wss = new WebSocketServer({ port: 8088 });

var displays = [];
var sensors = [];

wss.on('connection', function connection(ws) {
  //console.log('a client connected!');

  ws.on('message', function incoming(msg) {
    //console.log("msg: ", msg);
    msg = JSON.parse(msg);
    //console.log("msg:", msg);

    if (typeof ws.type === "undefined") {
      if (msg.type === "sensor") {
        console.log('a sensor connected');
        ws.type = "sensor";
      } else if (msg.type === "display") {
        console.log('a display connected');
        ws.type = "display";
      } else {
        console.log('an unknow device connected');
      }
    }

    if (msg.type === "sensor") {
      wss.clients.forEach(function each(client) {
        if (client.type === "display"){
          
          client.send(JSON.stringify({
            type: 'sensor',
            sensor: msg.sensor
          }));
        }
      });
    }
  });

  // say hello to our little friend
  ws.send(JSON.stringify({type: "hello"}));
});
