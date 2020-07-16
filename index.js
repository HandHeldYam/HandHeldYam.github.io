const express = require('express');
const app = express();
const server = require('http').Server(app);
app.use(express.static('public'));//listens to files in the
var router = require('./router.js');
//app.use('./router', router);

console.log(__dirname);
//"public" folder
//app.use('public', express.static(__dirname));
app.use(express.json({ limit: '1mb' }));

var socket1 = require('socket.io');
var io = socket1(server);

var clients = [];
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
        client = new Client(null, req.body.name, req.body.type, req.body.code);//create a new client
        clients.push(client);//add them to the clients array
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

app.post('/ScrumMaster', (req, res) => {
    addRoom(req.body.code, req.body.name);

    for (let [key, value] of validRoomCodes.entries()) { // for printing the map
        console.log('Key: ' + key + '\nValue: ' + value);
    } 
});
function handleCodes(code, name) {
    for(let [key, value] of validRoomCodes.entries()){//loop through the current name code pair
        if (value === name) {//if the name matches (one SM trying to create 2 rooms)
            transferRoom(key, code);
            validRoomCodes.delete(key);//delete the old room code
            console.log('Room ' + key + ' Destroyed');
        }
    }
      
}

function addRoom(code, name) {
    handleCodes(code, name);
    validRoomCodes.set(code, name);
}
function transferRoom(oldRoom, newRoom) {
    var oldRoomClients = io.sockets.adapter.rooms['/' + oldRoom].sockets;
    console.log(oldRoomClients);
    for (var clientId in oldRoomClients) {
        io.sockets.connected[clientId].join('/'+newRoom);
    }
}

//room code that users put in (not SM)

function onCorrectRoomCode(code) {
    if (validRoomCodes.has(code)) {
        return true;
    }
    return false;
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
    
    socket.on("joinRoom", (data) => handleClient(data, socket));
    
    
}


function handleClient(data, socket) {
    console.log('new user attempting to join ' + data.code);
    if (onCorrectRoomCode(data.code)) {
        socket.join(validRoomCodes.get(data.code));
    }
}
function onDisconnect(socket) {
    console.log(socket.id + ' Attempting to disconnect');
    clients.forEach(element => {
        if (element.id === socket.id) {
            clients.splice(element, 1);
        }
    });
}
class Client{
    constructor(id, name, type, code) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.code = code;
    }

}

