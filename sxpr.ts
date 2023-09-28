import {Option, Result, Ok, Err, Some} from "./common.ts";


export enum SxprType {
    Invalid,
    QuotedList,
    List,
    Ident,
    Number,
    String,
}


export class Sxpr {
    private type: SxprType;
    private listVal: Option<Array<Sxpr>>;
    private stringVal: Option<String>;


    constructor() {
        this.type = SxprType.Invalid;
        this.listVal = new Option(null);
        this.stringVal = new Option(null);
    }


    isValid(): boolean {
        return this.type != SxprType.Invalid;
    }

    getType(): SxprType {
        return this.type;
    }

    list(): Option<Array<Sxpr>> {
        return this.listVal;
    }

    ident(): Option<String> {
        return this.stringVal;
    }

    number(): Option<String> {
        return this.stringVal;
    }

    string(): Option<String> {
        return this.stringVal;
    }


    toString(): String {
        let s = "";
        switch (this.type) {
            case SxprType.QuotedList:
                s = s.concat("'");
            case SxprType.List:
                s = s.concat("(");
                let arr = this.listVal.unwrap();

                for (let i = 0;i<arr.length;i += 1) {
                    if (i > 0) {
                        s = s.concat(" ");
                    }

                    s = s.concat(arr[i].toString());
                }

                return s.concat(")");
            case SxprType.Number:
            case SxprType.Ident:
                return this.stringVal.unwrap();
            case SxprType.String:
                return '"'.concat(this.stringVal.unwrap()).concat('"');
            default:
                return "#INVALID";
        }
    }

    isIdentData(s: String): boolean {
        if (this.type == SxprType.Ident) {
            return this.stringVal.unwrap() == s;
        } else {
            return false;
        }
    }

    parse(s: String): Result<String> {
        s = skipWs(s);

        if (s.length == 0) {
            return Err<String>("No data");
        }

        if (s.charAt(0) == "(") {
            return this.parseList(s.slice(1));
        } else if (s.charAt(0) == "'") {
            if (s.charAt(1) == "(") {
                let ret = this.parseList(s.slice(2));
                if (ret.isOk()) {
                    this.type = SxprType.QuotedList;
                }

                return ret;
            } else {
                return this.parseIdent(s);
            }
        } else if ("0123456789".includes(s.charAt(0))) {
            return this.parseNumber(s);
        } else if (s.charAt(0) == '"') {
            return this.parseString(s.slice(1));
        } else {
            return this.parseIdent(s);
        }
    }

    parseList(s: String): Result<String> {
        let items: Array<Sxpr> = new Array();

        while (true) {
            if (s.length == 0) {
                return Err<String>("Unclosed list");
            }

            let sxpr = new Sxpr();
            let res = sxpr.parse(s);
            if (res.isOk()) {
                s = res.unwrap();
            } else {
                // error state
                return res;
            }

            items.push(sxpr);

            s = skipWs(s);

            if (s.charAt(0) == ')') {
                break;
            }
        }

        this.type = SxprType.List;
        this.listVal = Some(items);

        return Ok(s.slice(1))
    }

    parseIdent(s: String): Result<String> {
        let i = 0;
        while (!" \t\r\n\"()".includes(s.charAt(i)) && i < s.length) {
            i += 1;
        }

        this.type = SxprType.Ident;
        this.stringVal = Some(s.slice(0, i));

        return Ok(s.slice(i));
    }

    parseNumber(s: String): Result<String> {
        let i = 0;
        while ("0123456789".includes(s.charAt(i)) && i < s.length) {
            i += 1;
        }

        this.type = SxprType.Number;
        this.stringVal = Some(s.slice(0, i));

        return Ok(s.slice(i));
    }

    parseString(s: String): Result<String> {
        let i = 0;
        while (s.charAt(i) != '"') {
            if (i == s.length) {
                return Err<String>("Unclosed string");
            }
            i += 1;
        }

        this.type = SxprType.String;
        this.stringVal = Some(s.slice(0, i));

        return Ok(s.slice(i + 1));
    }
}

export class SxprReturn {
    public sxpr: Sxpr;
    public remainder: String;
}


function skipWs(s: String): String {
    let i = 0;
    while (i < s.length) {
        if (s.charAt(i) == " " || s.charAt(i) == "\t" || s.charAt(i) == "\r" || s.charAt(i) == "\n") {
            i += 1;
        } else {
            break;
        }
    }

    return s.slice(i);
}

export function NewSxpr(s: String): Result<SxprReturn> {
    let xpr = new Sxpr();
    let res = xpr.parse(s);
    if (res.isErr()) {
    }
}
