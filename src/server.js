import app from  './app.js'
import http from 'http';
import dotenv from 'dotenv';
dotenv.config();

const server = http.createServer(app);


server.listen(process.env.PORT, () => {
   console.log(`Server started on port http://localhost:${process.env.PORT}`);
});
