const express = require('express');
const app = express();
const server = require('http').Server(app);
app.use(express.static('public'));//listens to files in the
var router = require('./router.js');
//app.use('./router', router);
let numClients = -1; //sm doesnt count as player but i have no idea if this logic is right lol
console.log(__dirname);
//"public" folder
//app.use('public', express.static(__dirname));
app.use(express.json({ limit: '1mb' }));

var socket1 = require('socket.io');
var io = socket1(server);

var validRoomCodes = new Map();

server.listen(8080, () => console.log('Listening on Port 8080'));

// Import npm packages
const mongoose = require('mongoose');

//Connect to database
const uri = "mongodb+srv://nicolefitz:nicolefitz@cluster0-inygt.mongodb.net/users?retryWrites=true&w=majority";
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

mongoose.connection.on('connected', () => {
    console.log('Mongoose is connected!!!!');
});

//Schema for user data
const Schema = mongoose.Schema;
const clientDataSchema = new Schema({
    name: String,
    type: String
});

//Model
const clientDataModel = mongoose.model('clientData', clientDataSchema);

//specifying URL path of router.js

app.get('/', (req, res) => {
   res.sendFile('mainMenu.html', { root:'./' });
   console.log('sent to main menu');
});

app.get('/index', (req, res) => {
   res.sendFile('login.html',{root: './'});
});
app.get('/lobby', (req, res) => {
    res.sendFile('lobby.html', {root: './'});
});
app.get('/connectionTest', (req, res) => {
    res.sendFile('connectionTest.html', {root: './'});
});
app.post('/roomCodeApi', (req, res) => {
    console.log(req.body);
    
    if (onCorrectRoomCode(req.body.code)) {//if the room code is correct
        res.sendStatus(201);//send a 201 rather than 200
        
    }
});
app.get('/planningPokerScreen', (req, res) => {
    res.sendFile('planningPokerScreen.html', {root: './'});
    }
);

app.get('/underConstruction', (req, res) => {
    res.sendFile('underConstruction.html', { root: './' });
});

app.post('/UserApi', (request, response) => {
   const data = request.body;
   console.log(data);
    //Add client to database
   clientDataModel.collection.insertOne({ data }, function (err) {
       if (err) return handleError(err);
       //console.log("User successfully added to Database");
   });

});
// data {
//     oldcode: oldCode, 
//     code: code, 
//     type:type, 
//     name: name
// }
function handleCodes(data, socket) { //returns room
    if (validRoomCodes.has(data.oldcode) && !validRoomCodes.has(data.code)) {//if this isnt SM first room
        io.of('/').in(data.oldcode).clients((error, socketIds) => {
            if (error) throw error;
            socketIds.forEach(socketId => io.sockets.sockets[socketId].leave(data.oldcode).join(data.code));
            console.log('moved user from '+ data.oldcode + " to "+ data.code);
        });
        validRoomCodes.set(data.code, data.name);
        codeUsers[data.code] = [];
        codeUsers[data.code].push(data.name);

        validRoomCodes.delete(data.oldcode);
        codeUsers.splice(data.oldcode);

    } else if (!validRoomCodes.has(data.code)) {
        validRoomCodes.set(data.code, data.name);
        codeUsers[data.code] = [];
        socket.join(data.code);
        codeUsers[data.code].push(data.name);
    } else if (validRoomCodes.has(data.code)) {
        console.log("trying to make 2 of the same codes server crashing now ");
    }
    
      
}
// data {
//     oldcode: oldCode, 
//     code: code, 
//     type:type, 
//     name: name
// }
function addRoom(data, socket) {
    console.log('addRoom emitted');
    // for (let [key, value] of validRoomCodes.entries()) { // for printing the map
    //     console.log('Key: ' + key + '\nValue: ' + value.room);
    // } 
   handleCodes(data, socket); //need to have this return the new room with all connected clients
   rooms = Object.keys(socket.rooms);
    console.log("rooms: " + rooms); // [ <socket.id>, 'room 237' ]
}
//room code that users put in (not SM)

function onCorrectRoomCode(code) {
    return validRoomCodes.has(code);
}

io.sockets.on('connection', onConnect);//io.sockets = default namespace (/)
io.sockets.use((socket, next) => {//idk what this does
    
    next();
});

function onConnect(socket) {
    //console.log('new connection' + socket.id);
    //console.log("connected to client");
    //console.log(clients);
    socket.on("disconnect", onDisconnect);

    socket.on("addRoom", (data) => {
    let rooms = Object.keys(socket.rooms);
    console.log("rooms: " + rooms); // [ <socket.id>, 'room 237' ]
        if (data.type === 'Scrum Master')
            addRoom(data, socket);
    });
    socket.on("joinRoom", (data) => handleClient(data, socket));

}
var codeUsers = Array(5);//5 rooms
function handleClient(data, socket) {
    console.log('handling client ');
    var room = io.sockets.adapter.rooms[data.code];//client ids in room: data.code
    if (room !== undefined) {
        console.log(room.length);
        
    }
    
    if (onCorrectRoomCode(data.code)) {
        socket.join(data.code);
        codeUsers[data.code].push(data.name);
        console.log('Users connected to ' + data.code + ': ' + codeUsers[data.code]);
        console.log('user joined room' + data.code);
        io.in(data.code).emit('displayName', codeUsers[numClients]);
        io.sockets.emit('numberSockets', numClients++);
    }
}
function onDisconnect(socket) { //to do .......................
    console.log(socket.id + ' Attempting to disconnect');
    io.sockets.emit('number sockets', numClients--);
}

