import http from 'http'
import app from '../app'
import dotenv from 'dotenv'

dotenv.config();

const Server = http.createServer(app);

const PORT = process.env.PORT || 3001;

Server.listen(PORT, () => {

    console.log(`Express Running ${PORT}`);
})