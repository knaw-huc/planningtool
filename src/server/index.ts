import http from "http"
import socketio from 'socket.io'
import fs from "fs"
import path from "path"
import { applyPatch, Patch } from "../patch/patch";
import { Data } from "../model/datamodel";
import {minimalData} from "./minimaldata"

const dataDir = process.env.DATA_DIR || ""
const srcDir = process.env.SRC_DIR || path.resolve(__dirname, "..", "..", "..", "src")

console.log("loading data")
const filename = path.resolve(dataDir, "data.json")
const patchFilename = path.resolve(dataDir, "patches.json")
const data: Data = fs.existsSync(filename) ? JSON.parse(fs.readFileSync(filename, "utf-8")) : minimalData
const patches: Array<Patch<Data>> = fs.existsSync(patchFilename) ? JSON.parse(fs.readFileSync(patchFilename, "utf-8")) : []
console.log("data loaded")

function returnFile(name: string, res: http.ServerResponse, requestId: number) {
  fs.readFile(path.resolve(srcDir, name), function (err, data) {
    if (err) {
      res.writeHead(500);
      console.log(" < ", requestId, 500)
      return res.end('Error loading index.html');
    }
    console.log(" < ", requestId, 200)
    res.writeHead(200);
    res.end(data);
  });  
}
let requestId = 0
const app = http.createServer(function handler (req, res) {
  console.log(" > ", ++requestId, req.method, req.url, 500)
  if (req.url === "/") {
    returnFile("mockup.html", res, requestId)
  } else if (req.url === "/calculate.js") {
    returnFile("calculate.js", res, requestId)
  } else if (req.url === "/calculate.js.map") {
    returnFile("calculate.js.map", res, requestId)
  } else {
    console.log(" < ", requestId, 404)
    res.writeHead(404);
    res.end();
}
})

const io = socketio(app);
app.listen(+(process.env.HTTP_PORT || 8080));

io.on('connection', function (socket) {
  console.log("client connected")
  socket.emit("newData", data)
  socket.on('providePatch', function (patch) {
    patches.push(patch)
    applyPatch(data, patch);
    triggerWrite()
    io.emit("newData", data)
  });
});

let shouldWrite = false;
let isWriting = false;
let shouldShutDown = false;
function triggerWrite() {
  shouldWrite = true;
  queueWrite()
}

function queueWrite() {
  if (shouldWrite && !isWriting) {
    process.stdout.write("data to write, queing... ")
    // First serialize so that it is atomic
    const serializedData = JSON.stringify(data, undefined, 2)
    const serializedPatches = JSON.stringify(patches, undefined, 2)
    process.nextTick(() => {
      isWriting = true
      shouldWrite = false
      fs.writeFile(patchFilename, serializedPatches, "utf-8", (err) => {
        if (err != null) {
          console.log("Write Error for patch: ", err)
        }
        fs.writeFile(filename, serializedData, "utf-8", (err) => {
          if (err != null) {
            console.log("Write Error for data: ", err)
          }
          isWriting = false
          console.log("done.")
          queueWrite()
        })
      })
    })
  } else if (shouldShutDown) {
    console.log("All data written. Shutting down.")
    process.exit();
  }
}

process.on('SIGINT', function() {
  console.log("Preparing to shut down")
  shouldShutDown = true
  io.close()
  queueWrite();
});
