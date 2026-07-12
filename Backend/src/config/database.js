const mongoose = require("mongoose");


async function connectToDB() {

   try{await mongoose.connect(process.env.MONGO_URI);
    
   console.log("Connected to DATABASE...");
}catch(err){
    console.log(err);
}
}

module.exports = connectToDB;