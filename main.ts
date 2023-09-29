import {Sxpr, SxprType} from "./sxpr.ts";
import {DocbuilderItem} from "./docbuilder.ts";
import {encodeBase64URL, decodeBase64URL} from "./docbuilder_encoder.ts";


export function parseDocbuilder(source: String): String {
    let sxpr = new Sxpr();
    let res = sxpr.parse(source);
    res.debugErr();
    // console.log(sxpr.toString());
    let docbuilder = new DocbuilderItem(sxpr);
    return docbuilder.toHTML();
}

export function testEncoding(s: String): String {
    let encoded = encodeBase64URL(s);
    console.log("Encoded: \"".concat(encoded).concat('"'));
    return decodeBase64URL(encoded);
}

export function encodeString(s: String): String {
    return encodeBase64URL(s);
}
export function decodeString(s: String): String {
    return decodeBase64URL(s);
}
