// Docbuilder AssemblyScript source


import {Sxpr, SxprType} from "./sxpr.ts";
import {Option, Result, Ok, Err, Some, None} from "./common.ts";


export enum ItemType {
    Container,
    Text,
    Vertical,
    Horizontal,
    Centered,
    Raw,
}

export enum CSSNumberType {
    Raw,
    Percent,
    Em,
    Pixels,
    Inch,
    Millimeter,
}


export class StyleOptions {
    width: Option<CSSNumber>;
    height: Option<CSSNumber>;
    padding: Option<CSSNumber>;
    backgroundColor: Option<String>;
    textColor: Option<String>;
    borderColor: Option<String>;
    borderWidth: Option<CSSNumber>;


    constructor() {
        this.width = new Option(null);
        this.height = new Option(null);
        this.padding = new Option(null);
        this.backgroundColor = new Option(null);
        this.textColor = new Option(null);
        this.borderColor = new Option(null);
        this.borderWidth = new Option(null);
    }

    fromSxprs(items: Array<Sxpr>): void {
        for (let i = 0; i < items.length; i += 1) {
            switch (items[i].getType()) {
                case SxprType.List:
                    this.convertItem(items[i].list().unwrap());
                    break;
            }
        }
    }

    convertItem(items: Array<Sxpr>): void {
        if (items.length < 2) {
            return;
        }

        let opt = new Option<Sxpr>(null);
        if (items.length > 2) {
            opt = Some(items[2]);
        }

        if (items[0].isIdentData("width")) {
            this.width = Some(new CSSNumber(items[1], opt));
        } else if (items[0].isIdentData("height")) {
            this.height = Some(new CSSNumber(items[1], opt));
        } else if (items[0].isIdentData("padding")) {
            this.padding = Some(new CSSNumber(items[1], opt));
        } else if (items[0].isIdentData("borderWidth")) {
            this.borderWidth = Some(new CSSNumber(items[1], opt));
        } else if (items[0].isIdentData("bgColor")) {
            if (items[1].getType() == SxprType.Ident) {
                this.backgroundColor = Some(items[1].ident().unwrap());
            }
        } else if (items[0].isIdentData("textColor")) {
            if (items[1].getType() == SxprType.Ident) {
                this.textColor = Some(items[1].ident().unwrap());
            }
        } else if (items[0].isIdentData("borderColor")) {
            if (items[1].getType() == SxprType.Ident) {
                this.borderColor = Some(items[1].ident().unwrap());
            }
        }
    }

    toString(): String {
        let s = "";

        if (this.width.isSome()) {
            s = s
                .concat("width:")
                .concat(this.width.unwrap().toString())
                .concat(";");
        }

        if (this.height.isSome()) {
            s = s
                .concat("height:")
                .concat(this.height.unwrap().toString())
                .concat(";");
        }

        if (this.padding.isSome()) {
            s = s
                .concat("padding:")
                .concat(this.padding.unwrap().toString())
                .concat(";");
        }

        if (this.backgroundColor.isSome()) {
            s = s
                .concat("background-color:")
                .concat(this.backgroundColor.unwrap())
                .concat(";");
        }

        if (this.textColor.isSome()) {
            s = s
                .concat("color:")
                .concat(this.textColor.unwrap())
                .concat(";");
        }

        if (this.borderColor.isSome() && this.borderWidth.isSome()) {
            s = s
                .concat("border: solid ")
                .concat(this.borderWidth.unwrap().toString())
                .concat(" ")
                .concat(this.borderColor.unwrap())
                .concat(";");
        }

        return s;
    }
}

export class CSSNumber {
    type: CSSNumberType;
    value: u32;

    constructor(sxpr: Sxpr, sxpr2: Option<Sxpr>) {
        switch (sxpr.getType()) {
            case SxprType.Number:
                this.type = CSSNumberType.Raw;
                this.value = U32.parseInt(sxpr.number().unwrap());
                break;
        }

        if (sxpr2.isSome()) {
            let val = sxpr2.unwrap();

            if (val.isIdentData("%")) {
                this.type = CSSNumberType.Percent;
            } else if (val.isIdentData("em")) {
                this.type = CSSNumberType.Em;
            } else if (val.isIdentData("in")) {
                this.type = CSSNumberType.Inch;
            } else if (val.isIdentData("mm")) {
                this.type = CSSNumberType.Millimeter;
            } else if (val.isIdentData("px")) {
                this.type = CSSNumberType.Pixels;
            }
        }
    }

    toString(): String {
        switch (this.type) {
            case CSSNumberType.Raw:
                return this.value.toString();
            case CSSNumberType.Percent:
                return this.value
                    .toString()
                    .concat("%");
            case CSSNumberType.Em:
                return this.value
                    .toString()
                    .concat("em");
            case CSSNumberType.Pixels:
                return this.value
                    .toString()
                    .concat("px");
            case CSSNumberType.Inch:
                return this.value
                    .toString()
                    .concat("in");
            case CSSNumberType.Millimeter:
                return this.value
                    .toString()
                    .concat("mm");
            default:
                return "";
        }
    }
}

export class DocbuilderItem {
    type: ItemType;
    textValue: String;
    inner: Array<DocbuilderItem>;
    options: StyleOptions;


    constructor(sxpr: Sxpr) {
        this.type = ItemType.Raw;
        this.textValue = "";
        this.inner = new Array();
        this.options = new StyleOptions();
        switch (sxpr.getType()) {
            case SxprType.Ident:
            case SxprType.Number:
            case SxprType.String:
                this.type = ItemType.Text;
                this.textValue = this.textValue.concat(sxpr.string().unwrap());
                break;
            case SxprType.List:
                this.fromList(sxpr.list().unwrap());
                break;
        }
    }

    fromList(items: Array<Sxpr>): void {
        let i = 0;
        if (items[0].isIdentData("vertical")) {
            this.type = ItemType.Vertical;
            i += 1;
        } else if (items[0].isIdentData("horizontal")) {
            this.type = ItemType.Horizontal;
            i += 1;
        } else if (items[0].isIdentData("centered")) {
            this.type = ItemType.Centered;
            i += 1;
        }

        if (items[i].getType() == SxprType.QuotedList) {
            this.options.fromSxprs(items[i].list().unwrap());
            i += 1;
        }

        // add the rest to the inner array
        for (; i < items.length; i += 1) {
            this.inner.push(new DocbuilderItem(items[i]));
        }
    }

    toHTML(): String {
        switch (this.type) {
            case ItemType.Text:
                return "<p>".concat(this.textValue).concat("</p>");
            case ItemType.Vertical:
                let s = "<div class=\"container vertical\" style=\""
                    .concat(this.options.toString())
                    .concat("\">");
                for (let i = 0; i < this.inner.length; i += 1) {
                    s = s.concat(this.inner[i].toHTML());
                }
                return s.concat("</div>");
            case ItemType.Horizontal:
                let s = "<div class=\"container horizontal\" style=\""
                    .concat(this.options.toString())
                    .concat("\">");
                for (let i = 0; i < this.inner.length; i += 1) {
                    s = s.concat(this.inner[i].toHTML());
                }
                return s.concat("</div>");
            case ItemType.Container:
                let s = "<div class=\"container\" style =\""
                    .concat(this.options.toString())
                    .concat("\">");
                for (let i = 0; i < this.inner.length; i += 1) {
                    s = s.concat(this.inner[i].toHTML());
                }
                return s.concat("</div>");
            case ItemType.Centered:
                let s = "<div class=\"container centered\" style=\""
                    .concat(this.options.toString())
                    .concat("\">");
                for (let i = 0; i < this.inner.length; i += 1) {
                    s = s.concat(this.inner[i].toHTML());
                }
                return s.concat("</div>");
            default:
                return "";
        }
    }
}
