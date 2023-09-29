import * as Docbuilder from "./main.js";


const SOURCE = document.getElementById("source");
// the HTML body of the render iframe
const RENDER = document.getElementById("render");


const baseSource = RENDER.src;


var extraWindows = [];


function parseDocbuilder() {
    let val = Docbuilder.encodeString(SOURCE.value);
    RENDER.src = baseSource + "#" + val;
    for (let i = 0; i < extraWindows.length; i += 1) {
        extraWindows[i].location.hash = val;
    }
    let newWindows = extraWindows.filter(function(w){
        console.log(w.closed);
        return !w.closed
    });
    let delta = extraWindows.length - newWindows.length;
    if (delta > 0) {
        console.log("Removed " + delta.toString() + " closed window(s)");
    }
}


document
    .getElementById("updateButton")
    .addEventListener("click", parseDocbuilder);

document
    .getElementById("openButton")
    .addEventListener("click", function() {
        extraWindows.push(window.open(RENDER.src, "_blank"));
    });
