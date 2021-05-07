# WebWelder
 
WebWelder is a TouchDesigner component (.tox) allowing 2-way interaction with a web page via WebSocket 
JSON messaging. It is **still in alpha** but works relatively well. 

## Demo Files

By default, the HTML/CSS/JavaScript files are hosted and served by TouchDesigner itself from a folder 
called "www". Demo files are included to get you started. 

## Using it in JavaScript

To connect to TouchDesigner from JavaScript, you simply open a WebSocket connection and send some 
JSON data:

```javascript
const socket = new WebSocket("localhost:9980");

socket.addEventListener("open", () => {
 console.log("Connection established!");
 const message = {data: "Test"};
 socket.send(JSON.stringify(message));
});
```

To receive a message sent from TouchDesigner, just add a listener for the "message" event:

```javascript
socket.addEventListener("message", e => {
 const message = JSON.parse(e.data);
 console.log(message);
});
```

## Using it in TouchDesigner

The WebWelder COMP outputs the received data as JSON and as a Table. Check out `Example.xx.toe`
for examples. 

If you wish to continually send data to the web page, you can plug a table to the input of the 
component. The data will be sent as a JSON object to the web page.

If you wish to send data from Python, you can use this:

```python
ww = op('WebWelder/code').module
ww.sendAll(json.dumps({"test": 456})
```

