var express = require('express');
app = express();
var http = require('http');
var socketio = require('socket.io');
var SerialPort = require("serialport");

var socketServer;
var sendData;

app.use(express.static(__dirname + '/Client'));

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
  /* LINUX */
  /*serialPort = new SerialPort("/dev/ttyUSB0", {
    baudrate: 9600,
    parser: SerialPort.parsers.readline("\n"),
    // Defaults for arduino serial communication
    dataBits: 8,
    parity: 'none',
    stopBits: 1,
    flowControl: false
  });*/
  /* END LINUX */
  
  /* WINDOWS */
  var serialPort = new SerialPort('COM3', {
	baudrate:9600,
	timeout:10,
	parser: SerialPort.parsers.readline("\n")
  });
  /* END WINDOWS */
  
  serialPort.on("open", function() {
    console.log('Open serial communication');
	console.log('Port open. Data rate: ' + serialPort.options.baudRate);
  });
  serialPort.on("data", function(data) {
    console.log("Reciviendo: " + data);
	socketServer.emit('potChange', data.toString());
	socketServer.emit('update', data.toString());
  });
  serialPort.on("close", function() {
    console.log('Port closed');
  });
  serialPort.on('error',function(err){
	console.log('Serial port error: ' + err);
  });
}

function initSocketIO(httpServer) {
  var brightness = 0;
  socketServer = socketio.listen(httpServer);
  socketServer.on('connection', function (socket) {
    console.log("User connected");
    socket.on('led', function(data) {
      console.log("RGB - main.js: " + data.value);
      brigthness = data.value;
      var buf = new Buffer(1);
      buf.write(brigthness);
      serialPort.write(buf);
    });
  });
}