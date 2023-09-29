import * as Docbuilder from "./main.js";


function updateDocument() {
    let encoded = window.location.hash.slice(1);
    let decoded = Docbuilder.decodeString(encoded);
    let data = Docbuilder.parseDocbuilder(decoded);

    document.body.innerHTML = data;
}

window.addEventListener("hashchange", updateDocument);
window.addEventListener("load", updateDocument);
