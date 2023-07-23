const express = require("express");

const app = express();
const axios = require('axios');
const path = require('path');
const bodyParser = require('body-parser');
const mysql = require("mysql");
const fs= require("fs");

const server = require("http").createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*"
  }
}); 


// add socket router
const socketRouter = require("./routes/socketRouter")(io).router;

app.use("/api", socketRouter);


app.set("view engine", "ejs");
//app.use(express.urlencoded({ extended: false }));
//app.use(express.json());


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());


 
// create connection
const connection = mysql.createConnection({
    host: "localhost",
    user: "mchsthwuhx",
    password: "QjuDM87ycw",
    database: "mchsthwuhx"
}); 

/*const connection = mysql.createConnection({
    host: "mysql.sql10164.dreamhostps.com",
    user: "zacharypwilliams",
    password: "MrDataMan456!",
    database: "lif_data"
}); */
 
connection.connect(function (error) {
    // show error, if any
    
     if (error) {
     
       console.error('error: ' + error.message);
    }
});

app.get("/", (req, res) => {
    
   // const url='C:\xampp\htdocs\index.html';
   // const response = await axios.get(url);
   // res.sendFile(path.join(response));
 // res.render("index");
 //res.sendFile(path.join(__dirname+'/index.html'));
  //res.sendFile('index.html');
 res.sendFile(path.join(__dirname+'/index.html'));
 //const url = "index";
 //res.render(url);  

/*const getData = async (url) => {
  try {
    const response = await axios.get(url)
    //res.sendFile(path.join(response));
   // const data = response.data
    //console.log(data)
  } catch (error) {
    console.log(error)
  }
} */

});

  app.post("/receive", (req, res) => {
      
      var msg=req.body.message;
   if (!msg) {
      res.json({
        message: "data not found",
        
      });
    }
    io.emit("mod_forecast", msg);
    res.json({
      status: "successful delivered",
      
    }); 
  });

app.post("/users", function (request, result) {
    
    connection.query("SELECT * FROM user_registration", function (error, messages) {
        // return data will be in JSON format
       // result.end(JSON.stringify(messages));
        result.json({
        message: "success",
        data:messages,
        
      });
    });
});

app.post("/search-user", function (request, result) {
    var mobile_number=request.body.mobile_number;
    connection.query("SELECT * FROM user_registration where mobile_number LIKE ? ",'%' + mobile_number + '%',(err, rows, fields) => {
        // return data will be in JSON format
       // result.end(JSON.stringify(messages));
        result.json({
        message: "success",
        data:rows,
        result:mobile_number
       
      });
    });
});

app.post("/storemessage", function (request, result) {
    var sender_id=request.body.sender_id;
    var receiver_id=request.body.receiver_id;
    var msg = request.body.message;
    
        var image  = request.body.file;
        const splitted = image.split(';base64,');
        const format = splitted[0].split('/')[1];
        var filename = Date.now();
        fs.writeFileSync('./uploads/' + filename + '.' + format, splitted[1], { encoding: 'base64' }); 
        
        io.emit('image',request.body.file);
        io.emit("mod_forecast", msg);
    
    
    connection.query("INSERT INTO lif_chat_messages (sender_id,receiver_id,message,file) VALUES (?, ?,?,?) ",[sender_id,receiver_id,msg,image], (err, rows, fields) => {
        // return data will be in JSON format
       // result.end(JSON.stringify(messages));
        result.json({
        message: "success",
        
      });
    });
});

/*app.post("/messages", function (request, result) {
    var sender_id=request.body.sender_id;
    var receiver_id=request.body.receiver_id;
    connection.query("SELECT * FROM lif_chat_messages where (sender_id = '" + request.body.sender_id + "' AND receiver_id = '" + request.body.receiver_id + "') OR (sender_id = '" + request.body.receiver_id + "' AND receiver_id = '" + request.body.sender_id + "')",(err, rows, fields) => {
        // return data will be in JSON format
       // result.end(JSON.stringify(messages));
        result.json({
        message: "success",
        data:rows
        
      });
    });
}); */


/*app.post("/messages", function (request, result) {
    var sender_id=request.body.sender_id;
    var receiver_id=request.body.receiver_id;
    
    connection.query("SELECT * FROM lif_chat_messages where (sender_id = '" + request.body.sender_id + "' AND receiver_id = '" + request.body.receiver_id + "') OR (sender_id = '" + request.body.receiver_id + "' AND receiver_id = '" + request.body.sender_id + "')",(err, rows, fields) => {
        // return data will be in JSON format
       // result.end(JSON.stringify(messages));
        result.json({
        message: "success",
        data:rows
        
      });
    });
}); */

app.post("/messages", function (request, result) {
    var sender_id=request.body.sender_id;
    var receiver_id=request.body.receiver_id;
    
    connection.query("SELECT CONCAT(sender.first_name,'',sender.last_name) as sender_name, CONCAT(receiver.first_name,'',receiver.last_name) as receiver_name,message FROM lif_chat_messages LEFT JOIN user_registration AS sender ON lif_chat_messages.sender_id = sender.id LEFT JOIN user_registration AS receiver ON lif_chat_messages.receiver_id = receiver.id WHERE (sender_id = '" + request.body.sender_id + "' AND receiver_id = '" + request.body.receiver_id + "') OR (sender_id = '" + request.body.receiver_id + "' AND receiver_id = '" + request.body.sender_id + "')",(err, rows, fields) => {
        // return data will be in JSON format
       // result.end(JSON.stringify(messages));
        result.json({
        message: "success",
        data:rows
        
      });
    });
});

app.post("/deletemessage", function (request, result) {
    var chat_id=request.body.id;
    
    connection.query("UPDATE lif_chat_messages SET  status = 'D'   WHERE id = '" + request.body.id + "'",(err, rows, fields) => {
        // return data will be in JSON format
       // result.end(JSON.stringify(messages));
        result.json({
        message: "success",
       
        
      });
    });
});


io.on("connection", (socket) => {
  console.log(socket.id);
}); 

server.listen(3001, () => {
  console.log("Server is running");
});
