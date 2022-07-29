const moongose= require('mongoose')

const mongoURL="mongodb+srv://Ritesh:sc4TmNq6WM9nLzi@cluster0.lo8p3kk.mongodb.net/?retryWrites=true&w=majority"

const connectDB= async () =>{
    try{
        await moongose.connect(mongoURL)
        console.log("db connected")
    }catch(err){
        console.log(err)
        process.exit(1);
    }
}

module.exports = connectDB

//
//mongodb+srv://Ritesh:sc4TmNq6WM9nLzi@cluster0.lo8p3kk.mongodb.net/?retryWrites=true&w=majority