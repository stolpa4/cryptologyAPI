import * as types from "./types.ts";
import * as rand from "../common/utils/random.ts";

import {
  DEFAULT_API_URL,
  DEFAULT_REQUEST_PARAMS,
  PUBLIC_HEADERS,
} from "./constants.ts";
import { getLogger } from "../common/logging.ts";
import { RateLimiter } from "../deps.ts";
import { ExchangeResponse } from "./types.ts";
import { delay } from "../deps.ts";
import {
  UnableToPerformRequestError,
  UnauthorizedRequestError,
} from "./error.ts";

const log = getLogger("requester");

export class Requester {
  protected readonly baseURL: string;
  protected readonly authInfo?: types.AuthInfo;
  protected readonly reqParams: types.RequestParameters;
  protected readonly nonce: types.NonceGetter;
  protected readonly rateLimiter: RateLimiter;

  constructor(opts: types.RequesterOptions = {}) {
    this.baseURL = opts.baseURL ?? DEFAULT_API_URL;
    this.authInfo = opts.authInfo;
    this.reqParams = Object.assign(
      {},
      DEFAULT_REQUEST_PARAMS,
      opts.requestParameters,
    );
    this.nonce = this.defineNonceGetter();
    this.rateLimiter = new RateLimiter({
      tokensPerInterval: 1,
      interval: this.reqParams.throttleMs,
    });
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

  public async request(req: types.Request): Promise<ExchangeResponse<unknown>> {
    const errs: unknown[] = [];
    const reqStr = JSON.stringify(req);

    log.debug(`Performing request: ${reqStr}`);

    while (errs.length < this.reqParams.requestTries) {
      try {
        await this.rateLimiter.removeTokens(1);
        const resp = await this.makeRequest(req);
        log.debug(
          `Got response for request (${reqStr}): ${JSON.stringify(resp)}.`,
        );
        return resp as unknown as ExchangeResponse<unknown>;
      } catch (e) {
        errs.push(e?.toString());
        log.error(`Error performing request (${reqStr}): ${e}.`);
        await delay(this.reqParams.requestErrorDelayMs);
      }
    }

    throw new UnableToPerformRequestError(reqStr, errs);
  }

  protected async makeRequest(
    req: types.Request,
  ): Promise<Record<string, unknown>> {
    const resp = await fetch(
      new URL(this.baseURL, req.path).href,
      {
        headers: this.craftHeaders(req.isPrivate),
        method: req.method,
        body: req.data ? JSON.stringify(req.data) : undefined,
      },
    );
    return await resp.json();
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
