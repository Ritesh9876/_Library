const moongose= require('mongoose')

const mongoURL=""

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
//mongodb+srv://Ritesh:<password>@cluster0.lo8p3kk.mongodb.net/?retryWrites=true&w=majority
