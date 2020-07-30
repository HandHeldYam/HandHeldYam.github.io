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



io.sockets.on('connection', onConnect); //io.sockets = default namespace (/)

io.sockets.use((socket, next) => { //idk what this does

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

function collectData() {
    for (vote in userVotesPerRoom) {
        if (vote == 0) {
            console.log('unsure');
        } else if (vote == 100) {
            console.log('infinity');
        } else console.log(vote);
    }
}

function onConnect(socket) {
    socket.on("joinRoom", (data) => {
        console.log('recieved joinRoom');
        handleClient(data, socket);
    });

    socket.on('timerEnd', (data) => {
        if (userVotesPerRoom.includes(data.code)) {}

        userVotesPerRoom[data.code].push[{
            name: data.name,
            vote: data.vote,
            type: data.type
        }];
        console.log("votes recieved");

    });
    socket.on('addRoom', (data) => {
        if (data.type === 'Scrum Master') {
            addRoom(socket, data);
        }
    });
    socket.on('issue', (data) => {
        console.log('recieved issue: ' + data.issue + ' code: ' + data.code);
        console.log(votes.get(data.code));
        votes.get(data.code).push({issue: data.issue, votes:[]});
        console.log(votes.get(data.code));
        console.log('end of issue')
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
        console.log(data);
        let theVotes = votes.get(data.code).find(elem => elem.issue == data.issue);
        theVotes.votes.push({ type: data.type, vote: data.vote });
        console.log(theVotes);
            //.votes.push({ type: data.type, vote: data.vote });
        console.log(votes);
        console.log('end of vote');
    });
    socket.on('gameOver', code => {
        printResults(code);
    })
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
        var users = validRoomCodes.get(roomToBUpdated).users;//get the correct room user list
        io.in(roomToBUpdated).emit('displayName', { users: users, code: roomToBUpdated });

    });
}

function printResults(room = '0'){//room acts as a default variable if they dont enter anything
    if(room == '0'){
        for(const [key,value] of votes.entries()){
            console.log('IN ROOM: ' + key);
            console.log('ISSUES: ' + value.issue);
            console.log('VOTES: ' + value.votes);
        }
        return;
    }
    let val = votes.get(room);
    console.log('ISSUES IN ROOM ' + val.issues);
    console.log(val.issues);
    console.log('VOTES: ' + val.votes);
}
function handleClient(data, socket) {
    console.log('handling client ' + socket.id);

    if (onCorrectRoomCode(data.code)) {
        socket.join(data.code); //this is what joins socket to room: data.code
        validRoomCodes.get(data.code).users.push({ name: data.name, type: data.type, id: socket.id }); //add the socket to the list of users
        let users = validRoomCodes.get(data.code).users; // get the list of users
        io.in(data.code).emit('displayName', { users: users, code: data.code }); //tell users to display

    }
}

function onCorrectRoomCode(code) {
    console.log(code);
    return validRoomCodes.has(code);
}

function addRoom(socket, data) {

    if (!validRoomCodes.has(data.code)) { //if there are no rooms with code: data.code
        validRoomCodes.set(data.code, { users: [], name: data.name, hasStarted: false });
        votes.set(data.code, []);
        console.log(votes);
        socket.emit('joinRoom', data.code);
    }

}