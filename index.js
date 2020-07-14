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
    
    if (onCorrectRoomCode(req.body.code)) {
        res.sendStatus(201);
        client = new Client(null, req.body.name, req.body.type, req.body.code);
        clients.push(client);
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
       console.log("User successfully added to Database");
   });

   console.log("USer added to list");//no users actually added
});

app.post('/ScrumMaster', (req, res) => {
    for(let [key, value] of validRoomCodes.entries()){
        if (value === req.body.name) {
            validRoomCodes.delete(key);
        }
    }
    validRoomCodes.set(req.body.code, req.body.name);
    console.log(validRoomCodes);
});

//room code that users put in (not SM)

function onCorrectRoomCode(code) {
    if (validRoomCodes.has(code)) {
        return true;
    }
    return false;
}


io.sockets.on('connection', onConnect);
function onConnect(socket) {
    console.log('new connection' + socket.id);
    console.log("connected to client");

    socket.on("newClient", handleClient);
    socket.on('toLobby', toLobby);
    //console.log(clients);
    socket.on("disconnect", onDisconnect);
}
io
    .of('/lobby')
    .on("connection", (socket) => {
        console.log("connected to Lobby namespace : " + socket.id);
        socket.on("joinRoom", (room) => {
            if (validRoomCodes.includes(room)) {
                socket.join(room);
                return socket.emit("success", "Connected to room" + room);
            } else {
                socket.emit("err", "No room named " + room);
            }
        });
    })

function handleClient(data) {
    console.log(data.name + ' connecting with code: ' + data.code + " " + data.name + " " + data.type);
    console.log("added client to list")
}
function onDisconnect(socket) {
    console.log(socket.id + ' Attempting to disconnect');
    clients.forEach(element => {
        if (element.id === socket.id) {
            clients.splice(element);
        }
    });
}
function toLobby(data) {
    console.log('hello world!!');
    clients.push(new Client(data.socketId, data.name, data.type, data.code));
}
class Client{
    constructor(id, name, type, code) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.code = code;
    }

}

