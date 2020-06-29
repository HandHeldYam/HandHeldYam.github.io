const express = require('express');
const app = express();
const server = require('http').Server(app);
app.use(express.static('public'));//listens to files in the "public" folder
app.use(express.json({ limit: '1mb' }));
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

var socket1 = require('socket.io');
var io = socket1(server);

const dirName = 'HandHeldYam.github.io/public/';
server.listen(3000, () => console.log('Listening on Port 3000'));
var clients = [];
var validRoomCodes = [];


app.get('/', (req, res) => {
    res.send('mainMenu.html', { root: "public/mainMenu.html" })
});

io.sockets.on('connection', onConnect);
function onConnect(socket) {
    console.log('new connection' + socket.id);
    c = new Client(socket.id, "temp", "get from json");
    clients.push(Client);
    console.log("connected to client");

    socket.on("newClient", handleClient);
    socket.on("disconnect", onDisconnect);
}

function handleClient(data) {
    console.log('Client connecting with code: ' + data.roomCode);
}
function onDisconnect(socket) {
    console.log(socket.id + ' Attempting to disconnect');
}

class Client{
    constructor(id, name, type) {
    this.id = id;
    this.name = name;
    this.type = type;
    }

}

app.post('/UserApi', (request, response) => {
    console.log("request recieved");
    const data = request.body;
    console.log(data);
    //Add client to database
    clientDataModel.collection.insertOne({ data }, function (err) {
        if (err) return handleError(err);
        console.log("User successfully added to Database");
    });

    console.log("USer added to list");//no users actually added
});

//room code that users put in (not SM)
app.post('/roomCodeApi', (request, response) => {
    console.log("Non SM roomcode recieved");
    console.log(request.body);
    validRoomCodes.forEach((item) => {
        console.log(item);
        if (item === request.body.code) {
            response.sendFile('/public/connectionTest.html', {root:__dirname});
        } else {
            console.log('code doesnt match');
        }
    })
});
app.post('/ScrumMaster', (req, res) => {
    validRoomCodes.push(req.body.code);
    console.log(validRoomCodes);
})
