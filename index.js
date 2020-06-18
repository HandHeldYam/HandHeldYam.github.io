const express = require('express');
const app = express();

app.listen(3000, () => console.log('Listening on Port 3000'));
app.use(express.static('public'));//uses files in the "public" folder