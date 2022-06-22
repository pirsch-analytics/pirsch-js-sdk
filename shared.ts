import { PirschApiErrorResponse } from "./types";

export class PirschApiError extends Error {
    public code: number;
    public data: PirschApiErrorResponse;

    public constructor(code: number, data: PirschApiErrorResponse) {
        const message = data.error.at(0) ?? "an unknown error occurred!";
        super(message);
        this.name = "PirschApiError";
        this.code = code;
        this.data = data;
    }
}

export class PirschDomainNotFoundApiError extends PirschApiError {
    public constructor() {
        const error = ["domain not found!"];
        super(404, { error });
        this.name = "PirschDomainNotFoundApiError";
    }
}

export class PirschUnknownApiError extends PirschApiError {
    public constructor(message?: string) {
        const error = message ? [message] : [];
        super(500, { error });
        this.name = "PirschUnknownApiError";
    }
}
