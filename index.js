const express = require('express');
const app = express();
const server = require('http').Server(app);
app.use(express.static('public'));//listens to files in the
let numClients = -1; //sm doesnt count as player but i have no idea if this logic is right lol
//"public" folder
//app.use('public', express.static(__dirname));
app.use(express.json({ limit: '1mb' }));

var socket1 = require('socket.io');
var io = socket1(server);

var validRoomCodes = new Map();
var codeUsers = Array(5);//5 rooms

server.listen(8080, () => console.log('Listening on Port 8080'));

//specifying URL path of router.js

app.get('/', (req, res) => {
    console.log('hellllo');
   res.sendFile('index.html', { root:'./' });
   console.log('sent to main menu');
});
app.get('/index', (req, res) => {
    res.sendFile('index.html', {root: './'});
})

app.get('/login', (req, res) => {
   res.sendFile('login.html',{root: './'});
});
app.get('/lobby', (req, res) => {
    res.sendFile('lobby.html', {root: './'});
});
app.post('/roomCodeApi', (req, res) => {
    
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

// data {
//     oldcode: oldCode, 
//     code: code, 
//     type:type, 
//     name: name
// }
function handleCodes(data, socket) {
    if (validRoomCodes.has(data.oldcode) && !validRoomCodes.has(data.code)) {//if this isnt SM first room
        console.log('OPTION 1---------------------------------');
        validRoomCodes.set(data.code, data.name);
        io.of('/').in(data.oldcode).clients((error, socketIds) => {
            if (error) throw error;
            socketIds.forEach(socketId => {
                io.sockets.sockets[socketId].leave(data.oldcode);
                io.sockets.sockets[socketId].emit('joinRoom', data.code);
            });
            console.log('moved user from '+ data.oldcode + " to "+ data.code);
        });


        validRoomCodes.delete(data.oldcode);
        codeUsers.splice(data.oldcode);

    } else if (!validRoomCodes.has(data.code)) {
         console.log('OPTION 2---------------------------------');
        validRoomCodes.set(data.code, data.name);
        socket.emit('joinRoom', data.code);
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
    codeUsers[data.code] = [];
    handleCodes(data, socket); //need to have this return the new room with all connected clients
    rooms = Object.keys(socket.rooms);
    console.log("rooms: " + rooms); // [ <socket.id>, 'room 237' ]
}
//room code that users put in (not SM)

function onCorrectRoomCode(code) {
    return validRoomCodes.has(code) || codeUsers.includes(code);
}

function onConnect(socket) {
    console.log('this is the socket id: ' + socket.id);
    socket.on("disconnect", onDisconnect );

    socket.on("addRoom", (data) => {
    let rooms = Object.keys(socket.rooms);
    console.log("rooms: " + rooms); // [ <socket.id>, 'room 237' ]
        if (data.type === 'Scrum Master')
            addRoom(data, socket);
    });
    socket.on("joinRoom", (data) => {
        console.log('recieved joinRoom');
        handleClient(data, socket);

    });

}

io.on('connection', onConnect);//io.sockets = default namespace (/)
io.sockets.use((socket, next) => {//idk what this does
    
    next();
});

function handleClient(data, socket) {
    console.log('handling client ');
    
    if (onCorrectRoomCode(data.code)) {
        socket.join(data.code);//this is what joins socket to room: data.code
        console.log('users in room: '+codeUsers[data.code]);
        codeUsers[data.code].push((data.name));
        console.log('Users connected to ' + data.code + ': ' + codeUsers[data.code]);
        let users = codeUsers[data.code];
        io.in(data.code).emit('displayName', { users: users, code: data.code });
    }
}
function getSocket(socketId, room = '0') {
    if (room !== '0') {
        io.of('/').in(room).clients((error, socketIds) => {
            if (error) throw error;
            socketIds.forEach(socketId => {
                if (socketIds === socketId) {
                    return io.of('/').sockets[socketId];
                }
            });
        })
    }
    validRoomCodes.forEach(key => {
        io.of('/').in(key).clients((error, socketIds) => {
            if (error) throw error;
            socketIds.forEach(socketId => {
                if (socketIds === socketId) {
                    return io.of('/').sockets[socketId];
                }
            })
        });
    });
}
function onDisconnect(socket) { //to do .......................
    console.log('User disconnected');
    console.log(socket);
    
}

