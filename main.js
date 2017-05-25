var express = require('express');
app = express();
var http = require('http');
var socketio = require('socket.io');
var SerialPort = require("serialport");

var serialPort;
var socketServer;
var sendData;

app.use(express.static(__dirname));

startServer();

function startServer() {
  var httpServer = http.createServer(app).listen(4000, function() {
    console.log("Listening at: http://localhost:4000");
    console.log("Server is up");
  });
  serialListener();
  initSocketIO(httpServer);
}

function serialListener() {
    serialPort = new SerialPort("/dev/ttyUSB0", {
    baudrate: 9600,
    parser: SerialPort.parsers.readline("\n"),
    // Defaults for arduino serial communication
    dataBits: 8,
    parity: 'none',
    stopBits: 1,
    flowControl: false
  });

  serialPort.on("open", function() {
    console.log('Open serial communication');
    // Listener to incoming data
    serialPort.on('data', function(data) {
      console.log("Potentiometer SP: " + data);
      socketServer.emit('update', data.toString());
    });
  });
}

function initSocketIO(httpServer) {
  var brightness = 0;
  socketServer = socketio.listen(httpServer);
  socketServer.on('connection', function (socket) {
    console.log("User connected");
    socketServer.on("update", function(data) {
      console.log("Potentiometer WS: " + receiveData);
      socket.emit('updateData', {value: receiveData});
    });
    socket.on('led', function(data) {
      brigthness = data.value;
      var buf = new Buffer(1);
      buf.writeUInt8(brigthness, 0);
      serialPort.write(buf);
      console.log("Slider: " + data.value);
    });
  });
}