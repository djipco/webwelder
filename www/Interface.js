/*

   Copyright 2021 Jean-Philippe Côté

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
   
 */
   
 export class Interface {

  constructor() {

    // Create message object that will be sent to server after JSON serialization
    this.message = {};

    // Objects containing reference to all listener functions (for eventual removal)
    this.listeners = {};

    // Get WebSocket URL input field and assign default value (derived from url)
    const webSocketInput = document.getElementById("url");
    webSocketInput.value = window.location.href.replace(/^http(s)?:\/\//i, "ws$1://");

    // Assign click listener to the "Connect!" button
    this.connectButton = document.querySelector("#connection > button");
    this.listeners.onConnect = this.onConnect.bind(this);
    this.connectButton.addEventListener("click", this.listeners.onConnect);

  }

  onConnect() {

    // Hide connection fields while connecting
    document.querySelector("#connection").style.display = "none";

    // Attempt to connect to TouchDesigner via WebSocket
    this.socket = new WebSocket(document.getElementById("url").value);

    // Add listeners on the socket
    this.addSockeListeners();

  }

  onOpen(e) {

    console.info(`The connection to TouchDesigner has been established (${e.target.url}`);

    // Add listeners for interactive elements
    this.addInteractionListeners();

    // Show interactive elements
    document.querySelector("#touch-zone").style.display = "block";
    document.querySelector("#button-zone").style.display = "block";
    document.querySelector("#text-zone").style.display = "block";

  }

  onClose() {

    // Remove listeners
    this.removeSockeListeners();
    this.removeInteractionListeners();

    // Display connection section
    document.querySelector("#connection").style.display = "block";
    
    // Hide interactive elements
    document.querySelector("#touch-zone").style.display = "none";
    document.querySelector("#button-zone").style.display = "none";
    document.querySelector("#text-zone").style.display = "none";
    
    alert("The connection to the server has been closed.")

  }

  onError() {
    
    // Remove listeners
    this.removeSockeListeners();
    this.removeInteractionListeners();

    // Show connection section
    document.querySelector("#connection").style.display = "block";
    
    // Hide communication elements
    document.querySelector("#touch-zone").style.display = "none";
    document.querySelector("#button-zone").style.display = "none";
    document.querySelector("#text-zone").style.display = "none";
    
    alert("The connection to TouchDesigner could not be established because an error occured.")

  }

  onSendText() {

    this.message.text = document.getElementById("text").value;

    // Send JSON message
    this.socket.send(JSON.stringify(this.message));

  }

  onMessage(e) {
    const message = JSON.parse(e.data);
    console.log(message);
  }

  onMove(e) {

    const rect = e.target.getBoundingClientRect();
    const pos = {x: 0, y: 0};

    // Adapt to type of movement (clicks vs. touches)
    if (e.type === "mousemove") {
      pos.x = e.clientX - rect.left;
      pos.y = e.clientY - rect.top;
    } else if (e.type === "touchmove") {
      pos.x = e.touches[0].clientX - rect.left;
      pos.y = e.touches[0].clientY - rect.top;
    }
    
    // Constrain to container
    pos.x = Math.min(rect.width, Math.max(0, pos.x));
    pos.y = Math.min(rect.height, Math.max(0, pos.y));

    // Move orange circle
    this.moveTarget(pos.x, pos.y);

    // Make relative and flip y for TouchDesigner
    this.message.x = pos.x / rect.width;
    this.message.y = - pos.y / rect.height

    // Send JSON message
    this.socket.send(JSON.stringify(this.message));

  }

  onClick(e) {
    
    let matches = [];

    // Find all elements in the hierarchy that have the "data-webwelder" attribute
    e.path.forEach(el => {

      if (el.hasAttribute && el.hasAttribute("data-webwelder")) {

        // Get a suitable name for the clicked element and add it to array
        const name = el.dataset.webwelder || el.id || el.classList[0] || el.localName;
        matches.push(name);

      }

    });
    
    matches.forEach(match => {

      // Add button status to message
      if (e.type === "mousedown" || e.type === "touchstart") {
        this.message[match] = 1;
      } else if (e.type === "mouseup" || e.type === "touchend") {
        this.message[match] = 0;
      }

    })

    // Send JSON message
    this.socket.send(JSON.stringify(this.message));

  }

  addSockeListeners() {
    this.listeners.onOpen = this.onOpen.bind(this);
    this.socket.addEventListener("open", this.listeners.onOpen);
    this.listeners.onClose = this.onClose.bind(this);
    this.socket.addEventListener("close", this.listeners.onClose);
    this.listeners.onError = this.onError.bind(this);
    this.socket.addEventListener("error", this.listeners.onError);
    this.listeners.onMessage = this.onMessage.bind(this);
    this.socket.addEventListener("message", this.listeners.onMessage);
  }

  removeSockeListeners() {
    this.socket.removeEventListener("open", this.listeners.onOpen);
    this.socket.removeEventListener("close", this.listeners.onClose);
    this.socket.removeEventListener("error", this.listeners.onError);
    this.socket.removeEventListener("message", this.listeners.onMessage);
  }

  addInteractionListeners() {

    // Assign listeners for movement
    this.listeners.onMove = this.onMove.bind(this);
    document.getElementById("touch-zone").addEventListener("touchmove", this.listeners.onMove);
    document.getElementById("touch-zone").addEventListener("mousemove", this.listeners.onMove);
    
    // Assign listeners for clicks and touches
    this.listeners.onClick = this.onClick.bind(this);
    document.body.addEventListener("mousedown", this.listeners.onClick, true);
    document.body.addEventListener("mouseup", this.listeners.onClick, true);
    document.body.addEventListener("touchstart", this.listeners.onClick, true);
    document.body.addEventListener("touchend", this.listeners.onClick, true);
    
    // Assign click listener to the "Send Text" button
    this.listeners.onSendText = this.onSendText.bind(this);
    this.sendTextbutton = document.querySelector("#text-zone > button");
    this.sendTextbutton.addEventListener("click", this.listeners.onSendText);
    
  }

  removeInteractionListeners() {

    // Remove listeners for movement
    document.getElementById("touch-zone").removeEventListener("touchmove", this.listeners.onMove);
    document.getElementById("touch-zone").removeEventListener("mousemove", this.listeners.onMove);
    
    // Remove listeners for clicks and touches
    document.body.removeEventListener("mousedown", this.listeners.onClick, true);
    document.body.removeEventListener("mouseup", this.listeners.onClick, true);
    document.body.removeEventListener("touchstart", this.listeners.onClick, true);
    document.body.removeEventListener("touchend", this.listeners.onClick, true);
    
    // Remove click listener to the "Send Text" button
    this.sendTextbutton = document.querySelector("#text-zone > button");
    this.sendTextbutton.removeEventListener("click", this.listeners.onSendText);
    
  }

  moveTarget(x, y) {
    
    // Get orange target that follows the cursor
    let target = document.getElementById("target");
    target.style.left = (x - target.offsetWidth / 2) + "px"
    target.style.top = (y - target.offsetHeight / 2) + "px";
  
  }

}
