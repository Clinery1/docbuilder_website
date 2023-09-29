import * as Docbuilder from "./main.js";


const SOURCE = document.getElementById("source");
// the HTML body of the render iframe
const RENDER = document.getElementById("render");


const baseSource = RENDER.src;


function parseDocbuilder() {
    let val = Docbuilder.encodeString(SOURCE.value);
    RENDER.src = baseSource + "#" + val;
}


document
    .getElementById("updateButton")
    .addEventListener("click", parseDocbuilder);

document
    .getElementById("openButton")
    .addEventListener("click", function() {
        window.open(RENDER.src, "_blank");
    });
