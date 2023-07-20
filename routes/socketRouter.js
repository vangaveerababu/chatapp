const express = require("express");
const mysql = require("mysql");
const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "loveinfaith"
});
 
connection.connect(function (error) {
    // show error, if any
});

function socketRouter(io) {
  const router = express.Router();

  router.get("/sendmessage", (req, res) => {
      
    const count = req.query.message;
   // res.send(count);
    
    if (!count) {
      res.json({
        message: "data not found",
        status:req.body
      });
    }
    io.emit("mod_forecast", count);
    res.json({
      status: "successful delivered",
      message:count
    });
  });
  


router.post("/users", function (request, result) {
    var id=request.body.id;
    connection.query("SELECT * FROM user_registration", function (error, messages) {
        // return data will be in JSON format
       // result.end(JSON.stringify(messages));
        result.json({
        message: "data not found",
        status:messages,
        id:id
      });
    });
});

  return {
    router,
  };
}

module.exports = socketRouter;
