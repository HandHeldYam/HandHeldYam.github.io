const express = require('express');
const app = express();

app.listen(3000, () => console.log('Listening on Port 3000'));
app.use(express.static('public'));//uses files in the "public" folder
app.use(express.json({ limit: '1mb' }));
var list = [];
app.post('/UserApi', (request, response) => {
    console.log("request recieved");
    console.log(request.body);
    
});
app.post('/api', (request, response) => {
    console.log("request recieved");
    console.log(request.body);

})