const express = require('express');
const app = express();
const server = require('http').Server(app);

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

const dirName = 'HandHeldYam.github.io/';
server.listen(3000, () => console.log('Listening on Port 3000'));
app.use(express.static('public'));//listens to files in the "public" folder
app.use(express.json({ limit: '1mb' }));
var clients = [];
app.get('/', (req, res) => {
    res.send('mainMenu.html', { root: "public/mainMenu.html" })
});
app.post('/UserApi', (request, response) => {
    console.log("request recieved");
    console.log(request.body);
    console.log("USer added to list");//no users actually added
});
app.post('/api', (request, response) => {
    console.log("request recieved");
    console.log(request.body);

});
app.post('/roomCodeApi', (request, response) => {
    console.log("request recieved");
    console.log(request.body);
});

io.sockets.on('connection', onConnect);
function onConnect(socket) {
    console.log('new connection' + socket.id);
    c = new Client(socket.id, "temp", "get from json");
    clients.push(Client);
    console.log("connected to client");
    socket.on("newClient", function handleClient(data) {
    console.log("new Client connected to server");
    });
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

//generates room code
app.post('/api', (request, response) => {
    console.log("request recieved");
    console.log(request.body);
});

//room code that users put in (not SM)
app.post('/roomCodeApi', (request, response) => {
    console.log("request recieved");
    console.log(request.body);
});
