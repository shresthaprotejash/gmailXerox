const hostname = '127.0.0.1';
const port = 8000;

const express = require("express");
const {google} = require('googleapis');
const Session = require('express-session');
const OAuth2 = google.auth.OAuth2;
const app = express();
const path = require('path');
const router = express.Router();
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
        listmessage();
        res.send(tokens);
      }
      else{
        res.send('Login failed!!');
      }
    });
});

function listmessage(){
var gmail = google.gmail({ auth: oauth2Client, version: 'v1' });
var p = new Promise(function (resolve, reject) {
   var emails = gmail.users.messages.list({
          includeSpamTrash: false,
          maxResults: 10,
          userId: 'me'
      }, function (err, results) {
    	   console.log(results);
          console.log(results.data);
          console.log(results.data.messages);          
          resolve(results|| err);
      });
    });
}


router.get("/*",function(req,res){
	res.end("SITE NOT FOUND 404")
})


app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
