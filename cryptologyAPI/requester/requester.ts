import * as types from "./types.ts";
import { DEFAULT_REQUEST_PARAMS, PUBLIC_HEADERS } from "./constants.ts";
import * as rand from "../common/utils/random.ts";
import { UnauthorizedRequestError } from "./error.ts";
import { getLogger } from "../common/logging.ts";

const log = getLogger("requester");

export class Requester {
  protected readonly baseURL: string;
  protected readonly authInfo?: types.AuthInfo;
  protected readonly reqParams: types.RequestParameters;
  protected readonly nonce: types.NonceGetter;

  constructor(opts: types.RequesterOptions) {
    this.baseURL = opts.baseURL;
    this.authInfo = opts.authInfo;
    this.reqParams = Object.assign(
      {},
      DEFAULT_REQUEST_PARAMS,
      opts.requestParameters,
    );
    this.nonce = this.defineNonceGetter();
  }

  protected defineNonceGetter(): types.NonceGetter {
    let nonce = rand.int(0, 5e9);

    if (this.reqParams.useTimestampNonce) {
      return Date.now;
    } else {
      log.debug(`Using initial nonce: ${nonce}`);
      return () => nonce++;
    }
  }

  protected makeRequest(req: types.Request): Promise<Response> {
    return fetch(
      new URL(this.baseURL, req.path).href,
      {
        headers: this.craftHeaders(req.isPrivate),
        method: req.method,
        body: req.data ? JSON.stringify(req.data) : undefined,
      },
    );
  }

  protected craftHeaders(isPrivate: boolean | undefined): HeadersInit {
    if (isPrivate) {
      this.checkAuthorized();

      const _nonce = this.nonce();
      log.debug(`Got private request. Using nonce: ${_nonce}`);
      return {
        ...PUBLIC_HEADERS,
        "Access-Key": this.authInfo!.apiKey,
        "Secret-Key": this.authInfo!.apiSecret,
        Nonce: String(_nonce),
      };
    } else {
      return PUBLIC_HEADERS;
    }
  }

  protected checkAuthorized(): void {
    if (this.authInfo === undefined) {
      throw new UnauthorizedRequestError();
    }
  }
}
