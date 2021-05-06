export class Interface {

  constructor() {

    // Message object that will be sent to server as JSON
    this.message = {};

    // Connection state
    this.connection = false;

    // Orange target that follows the cursor
    this.target = document.getElementById("target");

    // Connect button & its click listener
    this.button = document.querySelector("#connection > button");
    this.button.addEventListener("click", this.onStart.bind(this));

    // Listeners for movement, clicks and touches
    document.body.addEventListener("touchmove", this.onMove.bind(this));
    document.body.addEventListener("mousemove", this.onMove.bind(this));
    document.body.addEventListener("mousedown", this.onClick.bind(this));
    document.body.addEventListener("mouseup", this.onClick.bind(this));
    document.body.addEventListener("touchstart", this.onClick.bind(this));
    document.body.addEventListener("touchend", this.onClick.bind(this));

  }

  onStart() {

    // Hide fields while connecting
    document.querySelector("#connection").style.display = "none";

    // Attempt to connect to WebSocket server
    let url = document.getElementById("url").value;
    this.socket = new WebSocket(url);

    // Add listeners to the socket
    this.socket.addEventListener("open", this.onOpen.bind(this));
    this.socket.addEventListener("close", this.onClose.bind(this));
    this.socket.addEventListener("error", this.onError.bind(this));

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

  onMove(e) {

    // Adapt to type of movement (clicks vs. touches)
    if (e.type === "mousemove") {
      this.message.x = e.clientX / window.innerWidth;
      this.message.y = - (e.clientY / window.innerHeight);
      this.moveTarget(e.clientX, e.clientY)
    } else if (e.type === "touchmove") {
      this.message.x = e.touches[0].clientX / window.innerWidth;
      this.message.y = - (e.touches[0].clientY / window.innerHeight);
      this.moveTarget(e.touches[0].clientX, e.touches[0].clientY)
    }

    // Send JSON message
    if (this.connection) {
      this.socket.send(JSON.stringify(this.message));
    }

  }

  onClick(e) {

    // Find name of clicked target
    let name = e.target.id || e.target.classList[0] || e.target.localName;

    // Add button status to message
    if (e.type === "mousedown" || e.type === "touchstart") {
      this.message[name] = 1;
    } else if (e.type === "mouseup" || e.type === "touchend") {
      this.message[name] = 0;
    }

    // Adjust target opacity to get local feedback
    this.target.style.opacity = this.message[name] ? "1" : "0.6";

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
