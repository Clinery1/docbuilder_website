import * as Docbuilder from "./docbuilder.js";


const SOURCE = document.getElementById("source");
// the HTML body of the render iframe
const RENDER = document.getElementById("render").contentDocument.body;


function parseDocbuilder() {
    let data = Docbuilder.parseDocbuilder(SOURCE.value);

    RENDER.innerHTML = data;
}


document
    .getElementById("updateButton")
    .addEventListener("click", parseDocbuilder);
