// Import npm packages
const express = require('express');
const mongoose = require('mongoose');


const uri = "mongodb+srv://nicolefitz:nicolefitz@cluster0-inygt.mongodb.net/users?retryWrites=true&w=majority";

mongoose.connect(uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true
});

mongoose.connection.on('connected', () => {
	console.log('Mongoose is connected!!!!');
});

//Schema
const Schema = mongoose.Schema;
const testBlogPostSchema = new Schema({
	title: String,
	body: String,
	date: {
		type: String,
		deafult: Date.now()
	}
});

//Model
const BlogPost = mongoose.model('BlogPost', testBlogPostSchema);

//Saving data to mongoose database
const data = {
	title: 'Test Title',
	body: 'Test for the body field',
}


const newBlogPost = new BlogPost(data); //instance of the model

newBlogPost.save((error) =>{
	if (error){
		console.log('Theres been an error');
	}else{
		console.log('Data has been saved');
	}
})
// .save()