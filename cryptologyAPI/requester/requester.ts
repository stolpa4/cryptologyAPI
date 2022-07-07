import * as rand from "../common/utils/random.ts";
import * as types from "./types.ts";

import { getLogger } from "../common/logging.ts";
import { delay, log, RateLimiter } from "../deps.ts";
import {
  DEFAULT_API_URL,
  DEFAULT_REQUEST_PARAMS,
  PUBLIC_HEADERS,
} from "./constants.ts";
import {
  UnableToPerformRequestError,
  UnauthorizedRequestError,
} from "./error.ts";
import { ExchangeResponse } from "./types.ts";

export class Requester {
  protected readonly log: log.Logger;
  protected readonly baseURL: string;
  protected readonly authInfo?: types.AuthInfo;
  protected readonly reqParams: types.RequestParameters;
  protected readonly nonce: types.NonceGetter;
  protected readonly rateLimiter: RateLimiter;

  constructor(opts: types.RequesterOptions = {}) {
    this.log = getLogger("requester");
    this.baseURL = opts.baseURL ?? DEFAULT_API_URL;
    this.authInfo = opts.authInfo;
    this.reqParams = Object.assign(
      {},
      DEFAULT_REQUEST_PARAMS,
      opts.requestParameters,
    );
    this.log.debug(
      `Initialized with request parameters: ${JSON.stringify(this.reqParams)}`,
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
      this.log.debug(`Using initial nonce: ${nonce}`);
      return () => nonce++;
    }
  }

  public async request(req: types.Request): Promise<ExchangeResponse<unknown>> {
    const errs: unknown[] = [];
    const reqStr = JSON.stringify(req);

    while (errs.length < this.reqParams.requestTries) {
      try {
        await this.rateLimiter.removeTokens(1);
        this.log.debug(
          `Performing request: ${reqStr} (try: ${errs.length + 1})`,
        );
        const resp = await this.makeRequest(req);
        this.log.debug(
          `Got response for request (${reqStr}): ${JSON.stringify(resp)}.`,
        );
        return resp as unknown as ExchangeResponse<unknown>;
      } catch (e) {
        errs.push(e?.toString());
        this.log.error(`Error performing request (${reqStr}): ${e}.`);
        await delay(this.reqParams.requestErrorDelayMs);
      }
    }

    throw new UnableToPerformRequestError(reqStr, errs);
  }

  protected async makeRequest(
    req: types.Request,
  ): Promise<Record<string, unknown>> {
    const resp = await fetch(
      new URL(req.path, this.baseURL).href,
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
      this.log.debug(`Got private request. Using nonce: ${_nonce}`);
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
