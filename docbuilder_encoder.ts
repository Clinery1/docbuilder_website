import {DocbuilderItem, CSSNumber, StyleOptions} from "./docbuilder.ts";


// encoding scheme (ignore whitespace):
// `{docbuilderCode} {styles} {innerItemLength} {innerItems}`
// where {docBuilderCode} is a single character denoting the type of docbuilder item
//  {styles} is a list of styles and base64url encoded parameters


const BASE64CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";


export function encode(doc: DocbuilderItem): String {
// aefgijklmnoqrs
// ABDEFGIJKLMNOPQSWXYZ
    let map = new Map<String, String>();
    // docbuilder item type
    map.set("DBContainer", "U");
    map.set("DBText", "T");
    map.set("DBVertical", "V");
    map.set("DBHorizontal", "H");
    map.set("DBCentered", "C");
    map.set("DBRaw", "R");

    // style things
    map.set("SWidth", "w");
    map.set("SHeight", "h");
    map.set("SPadding", "p");
    map.set("SBackgroundColor", "c");
    map.set("STextColor", "t");
    map.set("SBorderColor", "b");
    map.set("SBorderWidth", "d");
    map.set("SSeparator", ",");

    // units
    map.set("UPercent", "z");
    map.set("UEm", "y");
    map.set("UPixel", "x");
    map.set("UInch", "v");
    map.set("UMillimeter", "u");
    return "";
}

function encodeCSSNumber(num: CSSNumber): String {
    return "";
}

export function encodeBase64URL(s: String): String {
    let buffer = String.UTF8.encode(s);
    let byteArray = Uint8Array.wrap(buffer);

    let remaining = byteArray.length%3;
    let out = "";
    let i = 0;

    for (; (i + 2) < byteArray.length; i += 3) {
        let bytes = [byteArray[i], byteArray[i+1], byteArray[i+2]];
        let one =   bytes[0]&0b00111111;

        let two =   ((bytes[0]&0b11000000) >> 6) |
                    ((bytes[1]&0b00001111) << 2);

        let three = ((bytes[1]&0b11110000) >> 4) |
                    ((bytes[2]&0b00000011) << 4);

        let four =  (bytes[2]&0b11111100) >> 2;

        assert(one < 64 && one >= 0);
        assert(two < 64 && two >= 0);
        assert(three < 64 && three >= 0);
        assert(four < 64 && four >= 0);
        let base64 = BASE64CHARS.charAt(one)
            .concat(BASE64CHARS.charAt(two))
            .concat(BASE64CHARS.charAt(three))
            .concat(BASE64CHARS.charAt(four));
        out = out.concat(base64);
    }

    if (remaining == 1) {
        let one =   byteArray[i]&0b00111111;

        let two =   ((byteArray[i]&0b11000000) >> 6);

        assert(one < 64 && one >= 0);
        assert(two < 64 && two >= 0);
        let b1 = BASE64CHARS.charAt(one);
        let b2 = BASE64CHARS.charAt(two);
        out = out.concat(b1).concat(b2).concat("==");
    } else if (remaining == 2) {
        let bytes = [byteArray[i], byteArray[i+1]];
        let one =   bytes[0]&0b00111111;

        let two =   ((bytes[0]&0b11000000) >> 6) |
                    ((bytes[1]&0b00001111) << 2);

        let three = ((bytes[1]&0b11110000) >> 4);

        assert(one < 64 && one >= 0);
        assert(two < 64 && two >= 0);
        assert(three < 64 && three >= 0);
        let base64 = BASE64CHARS.charAt(one)
            .concat(BASE64CHARS.charAt(two))
            .concat(BASE64CHARS.charAt(three))
            .concat("=");
        out = out.concat(base64);
    }

    return out;
}

// assumes padding
export function decodeBase64URL(s: String): String {
    let count = (<i32>s.length / 4) * 3;
    if (s.endsWith("==")) {
        count -= 2;
    } else if (s.endsWith("=")) {
        count -= 1;
    }
    let buffer = new ArrayBuffer(count);
    let bytes = Uint8Array.wrap(buffer);
    let charMap = new Map<String, u8>();
    charMap.set("=", 0);
    for (let i: u8 = 0; i < 64; i += 1) {
        charMap.set(BASE64CHARS.charAt(<i32>i), i);
    }

    let byte = 0;

    for (let i = 0; (i + 3) < s.length; i += 4) {
        let chars = [s.charAt(i), s.charAt(i+1), s.charAt(i+2), s.charAt(i+3)];
        let num0 =  charMap.get(chars[0]) & 0b00111111;

        let num1A = (charMap.get(chars[1]) << 6) & 0b11000000;
        let num1B = (charMap.get(chars[1]) >> 2) & 0b00001111;

        let num2A = (charMap.get(chars[2]) << 4) & 0b11110000;
        let num2B = (charMap.get(chars[2]) >> 4) & 0b00000011;

        let num3 =  (charMap.get(chars[3]) << 2) & 0b11111100;

        let numA = num0 | num1A;
        let numB = num1B | num2A;
        let numC = num2B | num3;

        if (chars[2] == "=") {
            bytes[byte] = numA;
        } else if (chars[3] == "=") {
            bytes[byte] = numA;
            bytes[byte + 1] = numB;
        } else {
            bytes[byte] = numA;
            bytes[byte + 1] = numB;
            bytes[byte + 2] = numC;
        }

        byte += 3;
    }

    return String.UTF8.decode(buffer);
}
