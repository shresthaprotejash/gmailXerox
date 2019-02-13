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
app.use("/", function(req, res) {
  var url = getAuthUrl();
    res.send(url);
});

app.use("/oauthCallback", function (req, res) {
    var session = req.session;
    var code = req.query.code;
    oauth2Client.getToken(code, function(err, tokens) {

      if(!err) {
        oauth2Client.setCredentials(tokens);
        session["tokens"]=tokens;
        res.send('Login Sucessfull');
      }
      else{
        res.send('Login failed!!');
      }
    });
});

router.get("/*",function(req,res){
	res.end("SITE NOT FOUND 404")
})


app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
