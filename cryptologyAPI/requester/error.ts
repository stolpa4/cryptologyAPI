import { CryptologyAPIError } from "../common/error.ts";

export class CryptologyAPIRequestError extends CryptologyAPIError {}

export class UnauthorizedRequestError extends CryptologyAPIRequestError {
  constructor() {
    super("No credentials provided, can't perform a private request");
  }
}

export class UnableToPerformRequestError extends CryptologyAPIRequestError {
  constructor(reqStr: string, errs: unknown[]) {
    super(
      `Error performing request ${reqStr}. Got errors from the API: ${
        errs.join("; ")
      }`,
    );
  }
}
