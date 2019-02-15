const hostname = '127.0.0.1';
const port = 8000;

const express = require("express");
const {google} = require('googleapis');
const Session = require('express-session');
const OAuth2 = google.auth.OAuth2;
const app = express();
const path = require('path');
const router = express.Router();
var request = require('request-promise');
var __dirname = "G:/git-projects/gmailXerox";

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

var url = getAuthUrl();


app.get("/url", function(req, res){
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

function listmessage(access_token){
	console.log(access_token);
request({
  "method":"GET", 
  "uri": "https://www.googleapis.com/gmail/v1/users/me/messages?includeSpamTrash=false&maxResults=10",
  "json": true,
  "headers": {
    "User-Agent": "google-api-nodejs-client/0.7.2 (gzip)",
    "Authorization": "Bearer "+ access_token,    
    "Accept": 'application/json'}
  }).then(function(res){
  	console.log(res);
  	console.log(res.messages);
  	console.log(res.messages[0]);
  	for(var i = 0; i < res.messages.length;i++){
        getmessage(res.messages[i], access_token);
  }
  });
}

function getmessage(message,access_token){
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
  	console.log(res.snippet);
});
}




router.get("/*",function(req,res){
	res.end("SITE NOT FOUND 404")
})


app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});


