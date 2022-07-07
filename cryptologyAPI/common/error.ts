export class CryptologyAPIError extends Error {
  public constructor(msg: string) {
    super(msg);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
