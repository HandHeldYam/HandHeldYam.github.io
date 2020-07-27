const express = require('express');
const app = express();
const server = require('http').Server(app);
app.use(express.static('public'));//listens to files in the
let numClients = -1; //sm doesnt count as player but i have no idea if this logic is right lol
//"public" folder
//app.use('public', express.static(__dirname));
app.use(express.json({ limit: '1mb' }));

var io = require('socket.io')(server);

var validRoomCodes = new Map();
var codeUsers = Array(5);//5 rooms
var issues = [];

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

app.get('/planningPokerScreen', (req, res) => {
    res.sendFile('planningPokerScreen.html', {root: './'});
    }
);

app.get('/underConstruction', (req, res) => {
    res.sendFile('underConstruction.html', { root: './' });
});
app.post('/roomCodeApi', (req, res) => {
    
    if (onCorrectRoomCode(req.body.code)) {//if the room code is correct
        res.sendStatus(201);//send a 201 rather than 200
        
    }
});

//room code that users put in (not SM)



io.sockets.on('connection', onConnect);//io.sockets = default namespace (/)

io.sockets.use((socket, next) => {//idk what this does
    
  next();
});

function onConnect(socket) {
    socket.emit('hello', 'hello');
    console.log(socket.id);
    socket.on("joinRoom", (data) => {
        console.log('recieved joinRoom');
        handleClient(data, socket);
    });
    socket.on('addRoom', (data) => {
        console.log('add room recieved');
        addRoom(socket, data);
    });
    socket.on('hi', (data) => {
        console.log(data);
    });
    socket.on('issue', (data) => {
        console.log('recieved issue: ' + data.issue + ' code: ' + data.code);
        io.in(data.code).emit('issue', data.issue);

    });

    socket.on("disconnect", () => console.log('user disconnected'));
}

function handleClient(data, socket) {
    console.log('handling client ' + socket.id);
    
    if (onCorrectRoomCode(data.code)) {
        socket.join(data.code);//this is what joins socket to room: data.code
        codeUsers[data.code].push({name: data.name, type: data.type, id: socket.id});
        console.log('Users connected to ' + data.code + ': ' + codeUsers[data.code].length);
        console.log('Socket connected props: Name: ' + data.name + ' Type: ' + data.type + 'ID: ' + socket.id);
        let users = codeUsers[data.code]; 
        io.in(data.code).emit('displayName', { users: users, code: data.code});//not working
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
// function onDisconnect(socket) { //to do .......................
//     console.log('User disconnected');
//     console.log(socket);
    
// }

function onCorrectRoomCode(code) {
    return validRoomCodes.has(code) || codeUsers.includes(code);
}

    // data {
    //     oldcode: oldCode, 
    //     code: code, 
    //     type:type, 
    //     name: name
    // }
function addRoom(socket, data) {
    console.log('hit addROom');
    let rooms = Object.keys(socket.rooms);
    console.log("rooms: " + socket.rooms); // [ <socket.id>, 'room 237' ]
    if (data.type === 'Scrum Master') {
        handleCodes(data, socket); //need to have this return the new room with all connected clients
        rooms = Object.keys(socket.rooms);
        console.log("rooms: " + rooms); // [ <socket.id>, 'room 237' ]
    }
}
// data {
//     oldcode: oldCode, 
//     code: code, 
//     type:type, 
//     name: name
// }
function handleCodes(data, socket) {
    if (codeUsers.includes(data.oldcode) && !validRoomCodes.has(data.code)) {//if this isnt SM first room
        console.log('OPTION 1---------------------------------');
        validRoomCodes.set(data.code, data.name);
        codeUsers[data.code] = []; //create the room

        io.of('/').in(data.oldcode).clients((error, socketIds) => {
            if (error) throw error;
            socketIds.forEach(socketId => {
                io.sockets.sockets[socketId].leave(data.oldcode);
                console.log('socket id: ' + socketId + ' leaving room: ' + data.oldcode);
                io.sockets.sockets[socketId].emit('joinRoom', data.code);
                console.log('socket id: ' + socketId + ' joined room: ' + data.code);
            });
            console.log('moved user from '+ data.oldcode + " to "+ data.code);
        });


        validRoomCodes.delete(data.oldcode);
        codeUsers.splice(data.oldcode);

    } else if (!validRoomCodes.has(data.code)) {
         console.log('OPTION 2---------------------------------');
        validRoomCodes.set(data.code, data.name);
        codeUsers[data.code] = []; //create the room

        socket.emit('joinRoom', data.code);
    } else if (validRoomCodes.has(data.code)) {
        console.log("trying to make 2 of the same codes server crashing now ");
    }
    
}

