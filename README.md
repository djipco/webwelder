# WebWelder
 
WebWelder is a TouchDesigner component (.tox) allowing 2-way interaction with a web page via 
WebSocket messaging. It is **still in alpha** but works relatively well. 

## Trying Out the Demo Files

Demo files can be found in the `www` folder. These will help you get started. By default, the 
`www` folder is hosted by TouchDesigner, which acts as a regular web server. Obviously, you can
modify the files in this folder and/or add new ones.

By default, the demo page will send clicks and touch/mouse positions to TouchDesigner. To try the
demo page:

1. Drop the WebWelder component in your project.
2. Put the `www` folder besides the `.toe` file using WebWelder.
3. Point your browser to `http://localhost:9980` and click "Connect!".
4. Click and move around to send data to TouchDesigner.

If you want to test the demo page from a device different than the one running TouchDesigner (such
as a mobile device), you will need to substitute your machine's IP address in the "**WebSocket URL**" 
input field. For example: `ws://12.123.23.3:9980`

## Using it in JavaScript

As you can see in the demo `Interface.js` file, you can connect to TouchDesigner from JavaScript
by simply opening a WebSocket connection and sending some JSON data through it:

```javascript
const socket = new WebSocket("localhost:9980");

socket.addEventListener("open", () => {
 console.log("Connection established!");
 const message = {data: "Test"};
 socket.send(JSON.stringify(message));
});
```
Obviously, if you are trying to connect from a device different from the one where TouchDesigner
is running, you will need to use your machine's IP address and not `localhost`.

To receive a message sent from TouchDesigner, just add a listener for the "message" event:

```javascript
socket.addEventListener("message", e => {
 const message = JSON.parse(e.data);
 console.log(message);
});
```

## Using it in TouchDesigner

The WebWelder COMP outputs the received data in both JSON and Table format. You can check out 
`Example.xx.toe` for examples. 

To send data to the clients, you can specify an `Outbound DAT` in the COMP's parameters. This 
Table DAT must have a column named "client" whose content is the client's ID (e.g. 
`192.168.1.10:65432`). Whenever a row in this table changes, all the data in the row will be 
sent to the corresponding client.

If you wish to manually send data to a client from Python, you can use this:

```python
ww = op('WebWelder/code').module
ww.sendAll(json.dumps({"test": 456})
```

## Caveats

To JSON DAT appeared with version 2021.1000. Earlier versions will not be able to use the JSON
output.

If the "Stop Playing when Minimized" option is activated in the preferences, the server will stop 
working when the TouchDesigner window is minimized.
