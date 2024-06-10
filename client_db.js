const { Client: SSHClient } = require('ssh2');
const { Client: PGClient } = require('pg');
const net = require('net');
require('dotenv').config();

const {SSH_CONFIG_HOST, SSH_CONFIG_PORT, SSH_CONFIG_USERNAME, 
  SSH_CONFIG_PASSWORD, DBCONFIG_USER, DBCONFIG_HOST, DBCONFIG_DATABASE, 
  DBCONFIG_PASSWORD, DBCONFIG_PORT}  = process.env



const sshConfig = {
  host: SSH_CONFIG_HOST,
  port: SSH_CONFIG_PORT,
  username: SSH_CONFIG_USERNAME,
  password: SSH_CONFIG_PASSWORD,
};

const dbConfig = {
  user: DBCONFIG_USER,
  host: DBCONFIG_HOST,
  database: DBCONFIG_DATABASE,
  password: DBCONFIG_PASSWORD,
  port: DBCONFIG_PORT,
};

const sshClient = new SSHClient();

function returnClientDB(){
    return new Promise((resolve, rejects)=>{
        sshClient.on('ready', () => {

            sshClient.forwardOut(
              '127.0.0.1', 
              12345, 
              dbConfig.host, 
              dbConfig.port,
              (err, stream) => {
                if (err) throw err;
          
                // Create a new local server to forward the PostgreSQL connection through the SSH tunnel
                const server = net.createServer((localStream) => {
                  localStream.pipe(stream).pipe(localStream);
                });
          
                server.listen(0, () => {
                  const localPort = server.address().port;
          
                  // Connect to PostgreSQL using the local server port
                  const pgClient = new PGClient({
                    ...dbConfig,
                    port: localPort, // Use the local server port
                  });
          
                  pgClient.connect();
                  resolve(pgClient);
                });
              }
            );
          }).connect(sshConfig);
    })
}


module.exports={returnClientDB}


