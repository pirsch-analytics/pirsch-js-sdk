import { Optional, PirschApiErrorResponse, Scalar } from "./types";
import {
    PIRSCH_CLIENT_ID_LENGTH,
    PIRSCH_CLIENT_SECRET_LENGTH,
    PIRSCH_ACCESS_TOKEN_LENGTH,
    PIRSCH_IDENTIFICATION_CODE_LENGTH,
    PIRSCH_ACCESS_TOKEN_PREFIX,
} from "./constants";

export abstract class PirschCommon {
    protected assertOauthCredentials({ clientId, clientSecret }: { clientId: string; clientSecret: string }) {
        if (clientId.length !== PIRSCH_CLIENT_ID_LENGTH) {
            throw new Error(`Invalid Client ID, should be of length '${PIRSCH_CLIENT_ID_LENGTH}'!`);
        }

        if (clientSecret.length !== PIRSCH_CLIENT_SECRET_LENGTH) {
            throw new Error(`Invalid Client ID, should be of length '${PIRSCH_CLIENT_ID_LENGTH}'!`);
        }
    }

    protected assertAccessTokenCredentials({ accessToken }: { accessToken: string }) {
        if (!accessToken.startsWith(PIRSCH_ACCESS_TOKEN_PREFIX)) {
            throw new Error(`Invalid Access Token, should start with '${PIRSCH_ACCESS_TOKEN_PREFIX}'!`);
        }

        if (accessToken.length !== PIRSCH_ACCESS_TOKEN_LENGTH + PIRSCH_ACCESS_TOKEN_PREFIX.length) {
            throw new Error(`Invalid Access Token, should be of length '${PIRSCH_ACCESS_TOKEN_LENGTH}'!`);
        }
    }

    protected assertIdentificationCodeCredentials({ identificationCode }: { identificationCode: string }) {
        if (identificationCode.length !== PIRSCH_IDENTIFICATION_CODE_LENGTH) {
            throw new Error(`Invalid Identification Code, should be of length '${PIRSCH_IDENTIFICATION_CODE_LENGTH}'!`);
        }
    }

    protected prepareScalarObject(value?: Record<string, Scalar>): Optional<Record<string, string>> {
        if (!value) {
            return value;
        }

        return Object.fromEntries(
            Object.entries(value).map(([key, value]) => {
                if (typeof value === "string") {
                    return [key, value];
                }

                return [key, value.toString()];
            })
        );
    }
}

export class PirschApiError extends Error {
    public code: number;
    public data: PirschApiErrorResponse;

    public constructor(code: number, data: PirschApiErrorResponse) {
        const message = data?.error?.at(0) ?? (code === 404 ? "not found" : undefined) ?? "an unknown error occurred!";
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

export class PirschInvalidAccessModeApiError extends PirschApiError {
    public constructor(methodName: string) {
        const error = [
            `you are trying to run the data-accessing method '${methodName}', which is not possible with access tokens. please use a oauth id and secret!`,
        ];
        super(401, { error });
        this.name = "PirschInvalidAccessModeApiError";
    }
}

export class PirschUnknownApiError extends PirschApiError {
    public constructor(message?: string) {
        const error = message ? [message] : [];
        super(500, { error });
        this.name = "PirschUnknownApiError";
    }
}
