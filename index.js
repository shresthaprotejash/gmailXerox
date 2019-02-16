const hostname = '127.0.0.1';
const port = 8000;

const express = require("express");
const {google} = require('googleapis');
const Session = require('express-session');
const OAuth2 = google.auth.OAuth2;
const app = express();
const path = require('path');
const request = require('request-promise');
const bodyParser = require('body-parser')

const MongoClient = require('mongodb').MongoClient;
const mongo_url = "mongodb://localhost:27017/";

var __dirname = "G:/git-projects/gmailXerox";
var threads =[];

app.use(Session({
    secret: 'tejash-secret-19890913007',
    resave: true,
    saveUninitialized: true
}));



var oauth2Client = new OAuth2("1046715194877-fl8olkt9nhn4u3jvguotvi7a1gfbibil.apps.googleusercontent.com", "wlb8sKTgXaZxehS726LFGODI", "http://localhost:8000/oauthcallback");//paste accordingly
var scopes =['https://www.googleapis.com/auth/gmail.readonly'];

function getAuthUrl() {
    var url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes
    });
    return url;
}
app.use(express.static('static'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

var url = getAuthUrl();


app.get("/url", function(req, res){
	MongoClient.connect(mongo_url, function(err, db) {
		  if (err) throw err;
		  var dbo = db.db("mymails");

		  dbo.listCollections().toArray(function(err, collInfos) {
		    console.log(collInfos);
		    console.log(collInfos.length);
		    if(collInfos.length>=1){
		      dbo.dropCollection("mails", function(err, delOK) {
		        if (err) {
		          console.log("Already deleted");
		        }
		        if (delOK) console.log("Collection deleted");
		        db.close();
		    });
		      
		    }
		  });
	});
	threads= [];
	res.send(url);
});

app.get("/tokens", function(req, res) {
    var session = req.session;
    var code = req.query.code;
    oauth2Client.getToken(code, function(err, tokens) {
      if(!err) {
        oauth2Client.setCredentials(tokens);
        console.log(tokens);
        session["tokens"]=tokens;
        listmessage(tokens.access_token);
        res.send(tokens);
      }
      else{
        res.send('Login failed!!');
      }
    });
});

app.use("/search", function(req, res) {
	console.log("Request  "+ req.body.keyword);
	var x = req.body.keyword;
	x=x.split(" ");
	var key = [];
	x.forEach(function(data){
		if(data!=""){
			key.push( data);
		}
	})
	console.log(key.length);
	if(key.length==0){
		res.send("empty");
	}
	if(key.length>1){
		res.send("more");
	}
	if(key.length==1){
		console.log("searching");
		var results = [];
		var loop =0;
		while(results.length!=2 && (loop)!=threads.length){
			if(threads[loop].subject.toLowerCase().includes(key[0].toLowerCase())){
				//console.log(threads[loop].subject);
				results.push(threads[loop]);
			}
			console.log(loop);
			loop++;
		}

		if(results.length==0){
			res.send("No Results Found");
		}else{
			res.send(results);
		}
	}
});

function listmessage(access_token){
	console.log(access_token);	
request({
  "method":"GET", 
  "uri": "https://www.googleapis.com/gmail/v1/users/me/messages?q=newer_than:1d",
  "json": true,
  "headers": {
    "User-Agent": "google-api-nodejs-client/0.7.2 (gzip)",
    "Authorization": "Bearer "+ access_token,    
    "Accept": 'application/json'}
  }).then(function(res){
  	/*console.log(res);
  	console.log(res.messages);
  	console.log(res.messages[0]);*/
  	for(var i = 0; i < res.messages.length;i++){
        getmessage(res.messages[i], access_token,res.messages.length);
  	}

  });
}

function getmessage(message,access_token,max_length){
	console.log(message);
	request({
  	"method":"GET", 
  	"uri": "https://www.googleapis.com/gmail/v1/users/me/messages/"+message.id,
  	"json": true,
  	"headers": {
	    "User-Agent": "google-api-nodejs-client/0.7.2 (gzip)",
	    "Authorization": "Bearer "+ access_token,    
	    "Accept": 'application/json'}
  }).then(function(res){  	
  	var thread={};
  	thread["threadid"]=res.threadId;
  	thread["message"]=res.snippet;
  	for(var i =0; i<res.payload.headers.length;i++){

  		if(res.payload.headers[i].name=="Subject"){
  			//console.log(res.payload.headers[i].value);
  			thread["subject"]=res.payload.headers[i].value;
  		}
  		if(res.payload.headers[i].name=="Date"){
  			//console.log(res.payload.headers[i].value);
  			thread["date"]=res.payload.headers[i].value;
  		}
  		if(res.payload.headers[i].name=="From"){
  			//console.log(res.payload.headers[i].value);
  			thread["from"]=res.payload.headers[i].value;
  		}

  	}
  	threads.push(thread);
  	if(threads.length==max_length){
  		console.log(threads.length);
  		for(var i =0; i<threads.length;i++){
    		msg =[threads[i].message];
    		for(var j=i+1; j<threads.length;j++){
        		if(threads[i].threadid==threads[j].threadid){
            		msg.push(threads[j].message);
            		threads.splice(j, 1);
            		if(j==(i+1)){
            			j--;
            		}
        		}
    		}
			if(msg.length>1){
	        	threads[i].message= msg;
	    	}	

		}

		console.log(threads.length);
		//console.log(threads);

		MongoClient.connect(mongo_url, function(err, db) {
		  if (err) throw err;
		  var dbo = db.db("mymails");
		  dbo.collection("mails").insertMany(threads, function(err, res) {
		    if (err) throw err;
		    console.log("Number of documents inserted: " + res.insertedCount);
		    
		    db.close();
		  });

		
		  
		 

		});
			
 	} 	

	});	
}
app.get("/*",function(req,res){
	res.end("SITE NOT FOUND 404")
})


app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});


