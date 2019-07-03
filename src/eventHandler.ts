import { makeSafeGettable, Gettable } from "./tools/getset";
import { update } from "./rendergui/rendergui";
import { makeMutators, Mutators } from "./mutators";
import { Data } from "./model/datamodel";
import { recalculate } from "./model/recalculate";
import { Patch, applyPatch, mergePatch, prune } from "./patch/patch";
import { explicitError } from "./tools/explicitError";
import { minimalData } from "./server/minimaldata";
import { getSprints } from "./model/sprints";

declare const io: SocketIOClientStatic;
var socket = io();
function loadLocalState() {
  let storedState = localStorage.getItem("viewData")
  if (storedState != null) {
    try {
      return JSON.parse(storedState)
    } catch (e) {
      return minimalData
    }
  }
  return minimalData
}
let localState: Patch<Data> = loadLocalState();

let dataStruct: undefined | {data: Data, safeData: Gettable<Data>, mutators: Mutators} = undefined
socket.on("newData", function (newData: Data) {
  applyPatch(newData, localState);
  const safeData = makeSafeGettable(newData);
  
  dataStruct = {
    data: newData,
    safeData,
    mutators: makeMutators(safeData, (patch, storeOnLog) => {
      if (storeOnLog) {
        applyPatch(newData, patch);
        callUpdate()
        window.requestAnimationFrame(() => {
          console.log("submitting")
          socket.emit("providePatch", patch);
        })
      } else {
        applyPatch(newData, patch);
        mergePatch(localState, patch)
        localStorage.setItem("viewData", JSON.stringify(localState))
        callUpdate()
      }
    })
  }
  dataStruct.data.viewData.isConnected = true
  callUpdate()
})
// socket.on('change', function (patch: Patch<Data>) {
//   if (dataStruct !== undefined) {
//     applyPatch(dataStruct.data, patch);
//     callUpdate()
//   } else {
//     explicitError("change received while I have no data!")
//   }
// });
socket.on('disconnect', function () {
  if (dataStruct !== undefined) {
    dataStruct.data.viewData.isConnected = false
    callUpdate()
  }
});

document.addEventListener('DOMContentLoaded', () => {
  callUpdate()
}, false);

function callUpdate() {
  if (dataStruct !== undefined) {
    recalculate(dataStruct.data, dataStruct.safeData)
  }
  update(dataStruct);
}

