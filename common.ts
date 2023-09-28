export class Option<T> {
    private inner: T | null;


    constructor(data: T | null) {
        this.inner = data;
    }

    isSome(): boolean {return this.inner != null;}
    isNone(): boolean {return this.inner == null;}

    unwrap(): T {return <T>this.inner}

    set(data: T): void {this.inner = data}

    reset(): void {this.inner = null}
}


export class Result<T> {
    private okVal: T | null;
    private errVal: Error | null;


    constructor(ok: T | null, err: Error | null) {
        this.okVal = ok;
        this.errVal = err;
    }

    isOk(): boolean {return this.errVal == null}
    isErr(): boolean {return this.okVal == null}
    isValid(): boolean {return this.okVal != null || this.errVal != null}

    unwrap(): T {return <T>this.okVal}
    unwrapErr(): Error {return <Error>this.errVal}

    setOk(data: T): void {
        this.okVal = data;
        this.errVal = null;
    }

    setErr(data: Error): void {
        this.errVal = data;
        this.okVal = null;
    }

    convert<V>(): Result<V> {
        return new Result<V>(null, this.errVal);
    }

    debugErr(): void {
        if (this.errVal != null) {
            console.log((<Error>this.errVal).toString());
        }
    }
}


export function Ok<T>(data: T): Result<T> {
    return new Result(data, null);
}

export function Err<T>(data: String): Result<T> {
    return new Result<T>(null, new Error(data));
}

export function Some<T>(data: T): Option<T> {
    return new Option(data);
}
export function None<T>(): Option<T> {
    return new Option<T>(null);
}
