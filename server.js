
//SOCKET IO CHAT SUCESS AND DOCUMENTATION 

/* step 1: change dir to project location using node cmd 
   step 2: create a file name server.js 
   step 3: in node cmd  type npm init     this will create json file 
   step 4: in node cmd type npm install express --save 
   step 5: npm install socket.io --save   this will add dependecies to json file of server
*/   


var express = require('express'); //import express library 
var app = express();             // call express fucntion from express Lib 
var path = require('path');      // directory path 
var server = require('http').createServer(app);  //create server using express Lib http 
var io = require('socket.io').listen(server);   //import socket.io Lib and listen to the server from client side 
var port = process.env.PORT || 3000;            // declaring enviroment port 

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});


app.use( express.static('public') );   // public file Dir when static webpages are kept to host 

// Chatroom

var numUsers = 0;

io.on('connection', function (socket) {
  var addedUser = false;

  // when the client emits 'new message', event  this listens and executes
  socket.on('new message', function (data) {
    // we tell the client to execute 'new message'
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    });
  });

  // when the client emits 'add user', this listens and executes
  socket.on('add user', function (username) {
    if (addedUser) return;

    // we store the username in the socket session for this client
    socket.username = username;
    ++numUsers;
    addedUser = true;  //True when user is connected 
    socket.emit('login', {
      numUsers: numUsers
    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });
  });

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', function () {
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', function () {
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });

  // when the user disconnects.. perform this
  //socket event 'disconnect' trigger fucntion 
  socket.on('disconnect', function () {
    if (addedUser) {
      --numUsers;

      // echo globally that this client has left and pass its object
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });
});