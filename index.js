const hostname = '127.0.0.1';
const port = 8000;

const express = require("express");
const app = express();
const path = require('path');
const router = express.Router();
var __dirname = "G:/git-projects/gmailXerox";


router.get("/", function(req, res) {
  res.sendFile(__dirname+'/index.html');
});

router.get("/verify" , function(req,res){
	res.end("verifypage");
});

router.get("/*",function(req,res){
	res.end("SITE NOT FOUND 404")
})

app.use('/',router);
app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

