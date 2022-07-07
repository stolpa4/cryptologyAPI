import { CryptologyAPIError } from "../common/error.ts";

export class UnauthorizedRequestError extends CryptologyAPIError {
  constructor() {
    super("No credentials provided, can't perform a private request");
  }
}
