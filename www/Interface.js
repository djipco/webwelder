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

    // Listeners for movement
    document.getElementById("touchzone").addEventListener("touchmove", this.onMove.bind(this));
    document.getElementById("touchzone").addEventListener("mousemove", this.onMove.bind(this));
    
    // Listeners for clicks and touches
    document.body.addEventListener("mousedown", this.onClick.bind(this), true);
    document.body.addEventListener("mouseup", this.onClick.bind(this), true);
    document.body.addEventListener("touchstart", this.onClick.bind(this), true);
    document.body.addEventListener("touchend", this.onClick.bind(this), true);

  }

  onStart() {

    // Hide fields while connecting
    document.querySelector("#connection").style.display = "none";

    // Attempt to connect to TouchDesigner
    let url = document.getElementById("url").value;
    this.socket = new WebSocket(url);

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

    // Mpve orange circle
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
    
    // Check if the element has been setup to trigger events
    const el = e.target;
    if (!el.hasAttribute("data-webwelder")) return;

    // Get a suitable name for clicked element
    let name = el.dataset.webwelder || el.id || el.classList[0] || el.localName;

    // Add button status to message
    if (e.type === "mousedown" || e.type === "touchstart") {
      this.message[name] = 1;
    } else if (e.type === "mouseup" || e.type === "touchend") {
      this.message[name] = 0;
    }

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
