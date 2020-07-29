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
var issues = [];
//creates array for card values
var cardNumbers = Array(9);//9 card values in planning poker

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

	//when the server receives clicked message, do this
    // client.on('clicked', function(data) {
    // 	  cardNumbers=[1,2,3,5,8,13,21,"unsure", "infinity"];

    //     if(socket.vote==1){
    //        io.emit('clicked',cardNumbers[0]);
    //     }
    //     if(socket.vote==2){
    //       io.emit('clicked',cardNumbers[1]);
    //     }
    //     if(socket.vote==3){
    //       io.emit('clicked',cardNumbers[2]);
    //     }
    //     if(socket.vote==5){
    //       io.emit('clicked',cardNumbers[3]);
    //     }
    //     if(socket.vote==8){
    //       io.emit('clicked',cardNumbers[4]);
    //     }
    //     if(socket.vote==13){
    //       io.emit('clicked', cardNumbers[5]);
    //     }
    //     if(socket.vote==21){
    //       io.emit('clicked', cardNumbers[6]);
    //     }
    //     if(socket.vote==0){
    //       io.emit('clicked', cardNumbers[7]);
    //     }
    //     if(socket.vote==100){
    //       io.emit('clicked', cardNumbers[8]);
    //     }
    // });

function onConnect(socket) {
    socket.emit('hello', 'hello');
    console.log(socket.id);
    socket.on("joinRoom", (data) => {
        console.log('recieved joinRoom');
        handleClient(data, socket);
    });
    socket.on('addRoom', (data) => {
        if (data.type === 'Scrum Master') {
            addRoom(socket, data);
        }
    });
    socket.on('issue', (data) => {
        console.log('recieved issue: ' + data.issue + ' code: ' + data.code);
        io.in(data.code).emit('issue', data.issue);

    });
    socket.on('start', (data) => {
        if (data.type === 'Scrum Master') {
            io.in(data.code).emit('start');
            
        }
    });
    socket.on('reconnection', () => {
        socket.emit('giveData');
    });
    socket.on('imBack', (data) => {//client gives name, type, and code
        
    });
    socket.on("disconnect", () => {
        let roomToBUpdated;
        for (const [key, value] of validRoomCodes.entries()) {
            for (var i = 0; i < value.users.length; i++){
                if (value.users[i].id === socket.id) {
                    roomToBUpdated = key;
                    value.users.splice(i, 1);
                }
            }
        }
        var users = validRoomCodes.get(roomToBUpdated).users;
        io.in(roomToBUpdated).emit('displayName', { users: users, code: roomToBUpdated });

    });
}

function handleClient(data, socket) {
    console.log('handling client ' + socket.id);

    if (onCorrectRoomCode(data.code)) {
        socket.join(data.code);//this is what joins socket to room: data.code
        validRoomCodes.get(data.code).users.push({ name: data.name, type: data.type, id: socket.id });//add the socket to the list of users
        let users = validRoomCodes.get(data.code).users; // get the list of users 
        io.in(data.code).emit('displayName', { users: users, code: data.code });//tell users to display
        
    }
}

function onCorrectRoomCode(code) {
    console.log(code);
    return validRoomCodes.has(code);
}

function addRoom(socket, data) {

    if (!validRoomCodes.has(data.code)) {//if there are no rooms with code: data.code
        validRoomCodes.set(data.code, { users: [], name: data.name });
        socket.emit('joinRoom', data.code);
    }

}
