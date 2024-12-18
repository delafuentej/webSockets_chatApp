///////////////////////////////////////////////
///////////// IMPORTS + VARIABLES /////////////
///////////////////////////////////////////////
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {WebSocket, WebSocketServer} from 'ws';

import {CONSTANTS} from './public/js/utils/constants.js';


// You may choose to use the constants defined in the file below
const { PORT, CLIENT, SERVER } = CONSTANTS;

///////////////////////////////////////////////
///////////// HTTP SERVER LOGIC ///////////////
///////////////////////////////////////////////

// gettting the name of the current file
const __filename = fileURLToPath(import.meta.url);
// getting the current directory
const __dirname = path.dirname(__filename);

// setting the base directory for public files
const publicDir = path.join(__dirname, 'public');

// Create the HTTP server
const server = http.createServer((req, res) => {
  // getting the path to the file requested by the client
  const filePath = req.url === '/' 
    ? path.join(publicDir, 'index.html') 
    : path.join(publicDir, req.url);

  // Determines the content type by file extension
  const extname = path.extname(filePath);
  let contentType = 'text/html';
  if (extname === '.js') contentType = 'text/javascript';
  else if (extname === '.css') contentType = 'text/css';

  // checking if the file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // Si el archivo no existe, devuelve un error 404
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    // provides the file
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res).on('error', (err) => {
      // handling  file read errors
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('500 Internal Server Error');
    });
  });
});

///////////////////////////////////////////////
////////////////// WS LOGIC ///////////////////
///////////////////////////////////////////////

// TODO
// Exercise 3: Create the WebSocket Server using the HTTP server
const wsServer = new WebSocketServer({server})

// TODO
// Exercise 5: Respond to connection events 
  // Exercise 6: Respond to client messages
  // Exercise 7: Send a message back to the client, echoing the message received
  // Exercise 8: Broadcast messages received to all other clients
  
  wsServer.on('connection', (socket)=>{
    console.log('A new client has joined to the server!');

    socket.on('message', (data)=>{
      try {
        const { type, payload } = JSON.parse(data.toString());


        switch (type) {
          case CLIENT.MESSAGE.NEW_USER:
            const time = new Date().toLocaleString();
            payload.time = time;

            const dataWithTime = {
                    type: SERVER.BROADCAST.NEW_USER_WITH_TIME,
                    payload
           };


            broadcast(JSON.stringify(dataWithTime));
            break;
  
          case CLIENT.MESSAGE.NEW_MESSAGE:
            broadcast(JSON.stringify({ type, payload }), socket);
            break;
  
          default:
            console.warn('Message Type not handled:', type);
        }

      } catch (error) {
        console.error('Message processing error:', error);
      }
      }) 
  });

///////////////////////////////////////////////
////////////// HELPER FUNCTIONS ///////////////
///////////////////////////////////////////////

function broadcast(data, socketToOmit) {
  // TODO
  // Exercise 8: Implement the broadcast pattern. Exclude the emitting socket!
  wsServer.clients.forEach((connectedClient) => {
      //For each connectedClient:
    //- Check if the connectedClient still has an open ready state
    //- Check if the connectedClient is not the same socket as socketToOmit
    //.readyState property that indicates whether the client is:
    // connecting (0), is actively open (1), is closing (2) or is closed (3).
    //WebSocket.CONNECTING whose value is 0
    //WebSocket.OPEN whose value is 1
    //WebSocket.CLOSING whose value is 2
    //WebSocket.CLOSED whose value is 3
    if((connectedClient.readyState === WebSocket.OPEN) && connectedClient !== socketToOmit){
      //If both of these checks pass: send the data to the connectedClient
        connectedClient.send(data);
    }
  })
}

// Start the server listening on localhost:8080
server.listen(PORT, () => {
  console.log(`Listening on: http://localhost:${server.address().port}`);
});

