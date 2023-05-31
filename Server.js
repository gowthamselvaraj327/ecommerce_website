const app = require('./App');
const path = require('path');
const ConnectDatabase = require('./config/database');

ConnectDatabase();

const server = app.listen(process.env.PORT,() => {
    console.log(`Server is running on port ${process.env.PORT}`);
})

process.on('unhandledRejection',(err)=>{
    console.log(`Error: ${err.message}`);
    console.log('Shutting down the server due to unhandled rejection error');
    server.close(()=>{
        process.exit(1);
    })
})

process.on('uncaughtException',(err)=>{
    console.log(`Error: ${err.message}`);
    console.log('Shutting down the server due to uncaught exception error');
    server.close(()=>{
        process.exit(1);
    })
})