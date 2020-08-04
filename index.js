/*
Server Side Code.

@Date 07/31/2020
@version 1.16

@author Sammy Collins,
@author Peter Kim,
@author Nicole Fitz,
@author Shwetha Radhakrishnan
*/

const express = require('express');
const app = express();
const server = require('http').Server(app);
app.use(express.static('public')); //listens to files in the

app.use(express.json({ limit: '1mb' }));

var io = require('socket.io')(server);

var votes = new Map();
var validRoomCodes = new Map();
var issues = [];
//creates array for card values
//var cardNumbers = Array(9);//9 card values in planning poker

server.listen(8080, () => console.log('Listening on Port 8080'));

//specifying URL path of router.js

app.get('/', (req, res) => {
    console.log('hellllo');
    res.sendFile('index.html', { root: './' });
    console.log('sent to main menu');
});

app.get('/index', (req, res) => {
    res.sendFile('index.html', { root: './' });
})

app.get('/login', (req, res) => {
    res.sendFile('login.html', { root: './' });
});

app.get('/lobby', (req, res) => {
    res.sendFile('lobby.html', { root: './' });
});

app.get('/planningPokerScreen', (req, res) => {
    res.sendFile('planningPokerScreen.html', { root: './' });
});

app.get('/underConstruction', (req, res) => {
    res.sendFile('underConstruction.html', { root: './' });
});
app.post('/roomCodeApi', (req, res) => {

    if (onCorrectRoomCode(req.body.code)) { //if the room code is correct
        res.sendStatus(201); //send a 201 rather than 200

    }
});

//room code that users put in (not SM)


//listen for any sockets connecting if one connects do onConnect(socket)
io.sockets.on('connection', onConnect); //io.sockets = default namespace (/)

io.sockets.use((socket, next) => { //idk what this does

    next();
});
//handle connected sockets
function onConnect(socket) {
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
        votes.get(data.code).push({issue: data.issue, votes:[]});
        io.in(data.code).emit('issue', data.issue);

    });
    socket.on('start' , (data) => {
      //since only scrum master can start timer checks to see if type if SM
        if (data.type == 'Scrum Master') {
            validRoomCodes.get(data.code).hasStarted = true;//to deal with users joining mid game
            io.in(data.code).emit('start');
        }

    });

    socket.on('end' , (data) => {
        io.in(data.code).emit('timerEnd');
    });

    socket.on('reconnection', () => {
        socket.emit('giveData');
    });
    socket.on('imBack', (data) => { //client gives name, type, and code

    });
    socket.on('giveVote', code => {
        io.in(code).emit('giveVote');
    });
    //type code and vote
    socket.on('vote', (data) => {
        let theVotes = votes.get(data.code).find(elem => elem.issue == data.issue);
        theVotes.votes.push({ type: data.type, vote: data.vote, name: data.name });
        console.log(theVotes);
    });
    socket.on('getVotesByIssue', (data) => {
        getVotes(socket, data.code, data.issue);
    });
    socket.on('gameOver', code => {
        let ret = votes.get(code);
        socket.emit('gameOverData', ret);
        io.in(code).emit('gameOver');
    });
    socket.on("disconnect", () => {
        let roomToBUpdated; //save the room code
        for (const [key, value] of validRoomCodes.entries()) { //loop through rooms to find the dc user
            for (var i = 0; i < value.users.length; i++) {//when room is found loop through users in room
                if (value.users[i].id === socket.id) {//if the DC'd socked's id matches a user in the room
                    roomToBUpdated = key;//save the room code
                    value.users.splice(i, 1);//remove the user
                }
            }
        }
        if (validRoomCodes.get(roomToBUpdated) !== undefined) {
            var users = validRoomCodes.get(roomToBUpdated).users;//get the correct room user list
            io.in(roomToBUpdated).emit('displayName', { users: users, code: roomToBUpdated });
        }

    });
}
/*
    Joins a socket to a room.

    @param socket the connected socket
    @param data the data that socket sends (name, code, type)
*/
function handleClient(data, socket) {
    console.log('handling client ' + socket.id);

    if (onCorrectRoomCode(data.code)) {
        socket.join(data.code); //this is what joins socket to room: data.code
        validRoomCodes.get(data.code).users.push({ name: data.name, type: data.type, id: socket.id }); //add the socket to the list of users
        let users = validRoomCodes.get(data.code).users; // get the list of users
        io.in(data.code).emit('displayName', { users: users, code: data.code }); //tell users to display

    }
}
/*
Checks if a room is in validRoomCodes

@param code the room code to be checked
*/
function onCorrectRoomCode(code) {
    return validRoomCodes.has(code);
}
/*
    Adds a room to the list of rooms we will be tracking and tells the connected
    socket to join that room.
    @param socket connected socket
    @param data data from socket (code, name, type)
*/
function addRoom(socket, data) {

    if (!validRoomCodes.has(data.code)) { //if there are no rooms with code: data.code
        validRoomCodes.set(data.code, { users: [], name: data.name, hasStarted: false });
        votes.set(data.code, []);
        socket.emit('joinRoom', data.code);
    }

}
/*
Emits the event getVotes, with data containing everyone that has voted in a
given room

@param socket connected socket
@param roomCode the room code that the socket gives
@param issue the issue number to recieve the votes from
*/
function getVotes(socket, roomCode, issue) {
    var clientVotes = votes.get(roomCode).find(elem => elem.issue == issue).votes;
    socket.emit('getVotes', clientVotes);

}