export class Interface {

  constructor() {

    // Create message object that will be sent to server after JSON serialization
    this.message = {};

    // Set default connection state
    this.connection = false;

    // Get orange target that follows the cursor
    this.target = document.getElementById("target");

    // Assign click listener to connection button
    this.button = document.querySelector("#connection > button");
    this.button.addEventListener("click", this.onStart.bind(this));

    // Get WebSocket URL input field and assign default value
    this.input = document.getElementById("url")
    this.input.value = window.location.href.replace(/^http(s)?:\/\//i, "ws$1://");

    // Assign listeners for movement
    document.getElementById("touchzone").addEventListener("touchmove", this.onMove.bind(this));
    document.getElementById("touchzone").addEventListener("mousemove", this.onMove.bind(this));
    
    // Assign listeners for clicks and touches
    document.body.addEventListener("mousedown", this.onClick.bind(this), true);
    document.body.addEventListener("mouseup", this.onClick.bind(this), true);
    document.body.addEventListener("touchstart", this.onClick.bind(this), true);
    document.body.addEventListener("touchend", this.onClick.bind(this), true);

  }

  onStart() {

    // Hide connection fields while connecting
    document.querySelector("#connection").style.display = "none";

    // Attempt to connect to TouchDesigner via WebSocket
    this.socket = new WebSocket(this.input.value);

    // Add listeners to the socket
    this.socket.addEventListener("open", this.onOpen.bind(this));
    this.socket.addEventListener("close", this.onClose.bind(this));
    this.socket.addEventListener("error", this.onError.bind(this));
    this.socket.addEventListener("message", this.onMessage.bind(this));

  }

  onOpen(e) {
    this.connection = true;
    console.info(`The connection to TouchDesigner has been established (${e.target.url}`);
  }

  onClose() {
    this.connection = false;
    alert("The connection to the server has been closed.")
    document.querySelector("#connection").style.display = "block";
  }

  onError() {
    this.connection = false;
    alert("The connection to TouchDesigner could not be established because an error occured.")
    document.querySelector("#connection").style.display = "block";
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
    if (this.connection) {
      this.socket.send(JSON.stringify(this.message));
    }

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
    if (this.connection) {
      this.socket.send(JSON.stringify(this.message));
    }

  }

  moveTarget(x, y) {
    this.target.style.left = (x - this.target.offsetWidth / 2) + "px"
    this.target.style.top = (y - this.target.offsetHeight / 2) + "px";
  }

}
