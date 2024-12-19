////////////////////////////////////////////////
    ////////////// VARIABLES ///////////////////////
    ////////////////////////////////////////////////

import { CONSTANTS } from './utils/constants.js';

const {CLIENT, SERVER, PORT} = CONSTANTS;

//console.log(CLIENT)

  
    // This variable will hold the WebSocket client connection. 
    // Initialize in the init() function
    let wsClient = null; 

    //! FEATURE: Allow users to specify their names, 
    //! and prepend these names to messages so that
    //! all users know who is sending each message:

    const username = prompt('Enter a username') || 'Anonymous';
    
    ////////////////////////////////////////////////
    //////////////// DOM SETUP /////////////////////
    ////////////////////////////////////////////////

 
    //const { CLIENT } = require('./utils/constants.js');
    const messageBox = document.querySelector('#messageBox');//input
    const messageForm = document.querySelector('#messageForm');//form
    const sendButton = document.querySelector('#send');// send button



    messageBox.addEventListener('input', () => {
      // Si hay texto en el campo de entrada, activa el botón
      if (messageBox.value.trim().length > 0) {
        sendButton.disabled = false; 
        
      } else {
        sendButton.disabled = true; // Deshabilita el botón
      }
    });
      
    // Event handler when the client enters a message
    //This event handler will be called each time the user submits a message. 
    //it displays the message the user typed in and then executes the function sendMessageToServer(message)
    messageForm.onsubmit = function(e) {
      e.preventDefault();
      
      // Get the message from the messageBox
      const message = messageBox.value.trim();
      // Render the sent message on the client as your own and reset the messageBox
      if (message) {
      
        showMessageSent(message);
        sendMessageToServer(message);
          sendButton.disabled = true;
        messageBox.value = '';
      }
 
    }

    ////////////////////////////////////////////////
    ////////////// WS CLIENT LOGIC /////////////////
    ////////////////////////////////////////////////

       //WS CLIENT-SIDE LOGIC


    function init() {

      /* Note: 
      Though the conditional block below is not necessary, it is a best practice to avoid
      tampering with a cluttered namespace.
      */

      // If a WebSocket connection exists already, close it
      if (wsClient) {
        wsClient.onerror = wsClient.onopen = wsClient.onclose = null;
        wsClient.close();
      }


      // TODO: 
      // Exercise 4: Create a new WebSocket connection with the server using the ws protocol.
      const URL = 'ws://localhost:' + PORT;
      //const URL = 'ws://localhost:' + PORT;
       wsClient = new WebSocket(URL);

    
      // TODO:
      // Exercise 5: Respond to connections by defining the .onopen event handler.
        wsClient.onopen = (event) => {
        // this code will run when the client successfully connects to a server
       // console.log('Client connected to the WebSocket Server!');
          const data = {
            type: CLIENT.MESSAGE.NEW_USER,
            payload: {username}
          }

          wsClient.send(JSON.stringify(data));
      }
      

      // TODO:
      // Exercise 7: Respond to messages from the servery by defining the .onmessage event handler
      // Exercise 9: Parse custom message types, formatting each message based on the type.


      wsClient.onmessage = (msgEvent) => {
       const msg = msgEvent.data;
      // console.log('msg', msg)
        try{

          const {type, payload } = JSON.parse(msg);
          //console.log('wsClient',{type, payload});

        switch(type){
          case SERVER.BROADCAST.NEW_USER_WITH_TIME:
            showMessageReceived(`<em>${payload.username} has joined at ${payload.time}!</em>`);
            break;
          case CLIENT.MESSAGE.NEW_MESSAGE:
            showMessageReceived(`<strong>[${payload.username}]</strong>:<br>${payload.message}<br>`);
            break;
          default:
            console.warn('Message Type not handled:', type);
        }


        }catch (error) {
          console.error('Message processing error:', error, data);
        }
      
      }

      /* Note:
      The event handlers below are useful for properly cleaning up a closed/broken WebSocket client connection.
      To read more about them, check out the WebSocket API documentation: https://developer.mozilla.org/en-US/docs/Web/API/WebSocket
      */

      // .onclose is executed when the socket connection is closed
      wsClient.onclose = (event) => {
        showMessageReceived('<em>No WebSocket connection :(</em>');
        wsClient = null;
      }

      // .onerror is executed when error event occurs on the WebSocket connection
      wsClient.onerror = (event) => {
        console.error("WebSocket error observed:", event);
        wsClient = null;
      }
    }

    function sendMessageToServer(message) {
      // Make sure the client is connected to the ws server
      if (!wsClient) {
        showMessageReceived('<em>No WebSocket connection :(</em>');
        return;
      }
      
      // TODO: 
      // Exercise 6: Send the message from the messageBox to the server

       // wsClient.send(message);
      // Exercise 9: Send the message in a custom message object with .type and .payload properties
      const data = {
        type: CLIENT.MESSAGE.NEW_MESSAGE,
        payload: {message, username}
      };

      wsClient.send(JSON.stringify(data));

    }

    ////////////////////////////////////////////////
    //////////// DOM HELPER FUNCTIONS //////////////
    ////////////////////////////////////////////////

    const messages = document.querySelector('.chat');
    
    // These functions are just aliases of the showNewMessage function
    function showMessageSent(message) { 
      showNewMessage(message, 'sending'); 
    }
    function showMessageReceived(message, isNewUserMsg = false) {
      const className = isNewUserMsg ? 'receiving new-user' : 'receiving'
      showNewMessage(message, className); 
    }
    
    // This function displays a message in the messages container node. 
    // className may either be 'mine' or 'yours' (see styles.css for the distinction)
    function showNewMessage(message, className) {
      // Create a text node element for the message
      const textNode = document.createElement('div');
      textNode.innerHTML = message;
      textNode.className = 'message';
      
      // Wrap the text node in a message element
      const messageNode = document.createElement('div');
      messageNode.className = `messages ${className}`;
      messageNode.appendChild(textNode);
      
      // Append the messageNode to the messages container element
      messages.appendChild(messageNode);
      messages.scrollTop = messages.scrollHeight;
    }

    // Start the WebSocket server
    init();
