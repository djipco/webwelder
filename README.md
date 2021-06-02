# WebWelder 1.0.0-alpha.3
 
WebWelder is a TouchDesigner component (.tox) allowing 2-way interaction with a web page via 
WebSocket messaging. It is **still in alpha** but works relatively well. 

## Trying Out the Demo Files

Demo files can be found in the `www` folder. These will help you get started. The `www` folder is 
meant to be hosted by TouchDesigner, which doubles as both a regular web server and a WebSocket 
server. Obviously, you can modify the files in this folder and/or add new ones.

By default, the demo page will send clicks and touch/mouse positions to TouchDesigner. To try the
demo page:

1. Drop the WebWelder component (`WebWelder.tox`) in your project.
2. Put the `www` folder besides the `.toe` file which is using WebWelder.
3. Point your browser to `http://localhost:9980` and click "Connect!".
4. Click and move around to send data to TouchDesigner.

If you want to test the demo page from a device different than the one running TouchDesigner (such
as a mobile device), you will need to point your mobile browser to the IP address of the machine 
where TouchDesigner is running.

## Using it in JavaScript

As you can see in the demo `Interface.js` file, you can connect to TouchDesigner from JavaScript
by simply opening a WebSocket connection and sending some JSON data through it:

```javascript
const socket = new WebSocket("ws://localhost:9980");

socket.addEventListener("open", () => {
 console.log("Connection established!");
 const message = {data: "Test"};
 socket.send(JSON.stringify(message));
});
```
Obviously, if you are trying to connect from a device different from the one where TouchDesigner
is running, you will need to use your machine's IP address and not `localhost`.

To receive a message sent from TouchDesigner, just add a listener for the `message` event:

```javascript
socket.addEventListener("message", e => {
 const message = JSON.parse(e.data);
 console.log(message);
});
```

## Using it in TouchDesigner

### Receiving data

The WebWelder COMP operator makes the received data available in both JSON (output 1) and Table 
(output 2) format. It also reports the number of currently connected client through output 0. 
You can check out `Example.xx.toe` for usage examples. 

### Sending data

To send data from TouchDesigner to the clients, you can specify an `Outbound DAT` in the COMP's 
parameters. This Table DAT must have a column named "client" whose content is the client's ID 
(e.g. `192.168.1.10:65432`). Whenever a row in this table changes, all the data in the row will 
be sent to the corresponding client (in JSON format).

To send data to all connected client, you can update all rows in the specified `Outbound DAT` 
table or you can use the Python API (see below).

## Python API

### Members

* `InboundTableDat` : a Table DAT containing all clients and current properties
* `InboundJsonDat` : a JSON DAT containing all clients and current properties

### Methods

* `Send(client, message)` : sends a message to a single client
  * `client` : the client id to send to (e.g. 127.0.0.1:12345)
  *  `message` : a dictionary (will be parsed to JSON)
* `SendAll(message)` sends a message to all connected clients
  *  `message` : a dictionary (will be parsed to JSON)
* `Disconnect(client)` disconnects the specified client
  * `client` : the client id to send to (e.g. 127.0.0.1:12345)
* `DisconnectAll()` disconnects all clients

So, for example, if you wish to manually send data to all connected clients from Python, you can 
use this:

```python
message = {"test": 456}
op('WebWelder').SendAll(message)
```

## SSL/TLS

The library also works under the secured **https://** and **wss://** protocols. You just need to 
specify the appropriate key and certificate files (in the component's parameters).

## Debugging & Caveats

* The JSON DAT appeared with version 2021.1000 of TouchDesigner. Earlier versions will not be able 
to use the JSON output.

* If the "Stop Playing when Minimized" option is activated in the preferences, WebWelder will stop 
working when the TouchDesigner window is minimized.
