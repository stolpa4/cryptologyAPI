import * as rand from '../common/utils/random.ts';
import * as types from './types.ts';

import { getLogger } from '../common/logging.ts';
import { delay, log, RateLimiter } from '../deps.ts';
import { DEFAULT_API_URL, DEFAULT_AUTH_INFO, DEFAULT_REQUEST_PARAMS, PUBLIC_HEADERS } from './constants.ts';
import { UnableToPerformRequestError, UnauthorizedRequestError } from './error.ts';
import { ExchangeResponse, RequestParametersArg } from './types.ts';

export class Requester {
    protected readonly log: log.Logger;
    protected readonly baseURL: string;
    protected readonly authInfo: types.AuthInfo;
    protected readonly reqParams: types.RequestParameters;
    protected readonly nonce: types.NonceGetter;
    protected readonly rateLimiter: RateLimiter;

    constructor(opts: types.RequesterOptions = {}) {
        this.log = opts.logger ?? getLogger('requester');
        this.baseURL = opts.baseURL ?? DEFAULT_API_URL;
        this.authInfo = opts.authInfo ?? DEFAULT_AUTH_INFO;
        this.reqParams = this.applyDefaultRequestParams(opts.requestParameters);
        this.nonce = opts.nonceGetter ?? this.defaultNonceGetter();
        this.rateLimiter = opts.rateLimiter ?? this.defaultRateLimiter();
    }

    protected applyDefaultRequestParams(reqParamsArg: RequestParametersArg | undefined): types.RequestParameters {
        const reqParams = { ...DEFAULT_REQUEST_PARAMS, ...reqParamsArg };
        this.log.debug(`Initialized with request parameters: ${JSON.stringify(reqParams)}`);
        return reqParams;
    }

    protected defaultNonceGetter(): types.NonceGetter {
        let nonce = rand.int(0, 5e9);

        if (this.reqParams.useTimestampNonce) {
            return Date.now;
        } else {
            this.log.debug(`Using initial nonce: ${nonce}`);
            return () => nonce++;
        }
    }

    protected defaultRateLimiter(): RateLimiter {
        return new RateLimiter({
            tokensPerInterval: 1,
            interval: this.reqParams.throttleMs,
        });
    }

    public async request(req: types.Request): Promise<ExchangeResponse<unknown>> {
        const errs: unknown[] = [];
        const reqStr = JSON.stringify(req);

        while (errs.length < this.reqParams.requestTries) {
            try {
                await this.rateLimiter.removeTokens(1);
                this.log.debug(`Performing request: ${reqStr} (try: ${errs.length + 1})`);
                const resp = await this.makeRequest(req);
                this.log.debug(`Got response for request (${reqStr}): ${JSON.stringify(resp)}.`);
                return resp;
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
    ): Promise<ExchangeResponse<unknown>> {
        const resp = await fetch(
            this.compoundURL(req.path),
            this.compoundRequestOptions(req),
        );
        return await resp.json();
    }

    protected compoundURL(path: string): string {
        return new URL(path, this.baseURL).href;
    }

    protected compoundRequestOptions(req: types.Request): RequestInit {
        return {
            headers: this.craftHeaders(req.isPrivate),
            method: req.data ? 'POST' : 'GET',
            body: req.data ? JSON.stringify(req.data) : undefined,
        };
    }

    protected craftHeaders(isPrivate: boolean | undefined): HeadersInit {
        if (isPrivate) {
            this.checkAuthorized();

            const _nonce = this.nonce();
            this.log.debug(`Got private request. Using nonce: ${_nonce}`);
            return {
                ...PUBLIC_HEADERS,
                'Access-Key': this.authInfo!.apiKey,
                'Secret-Key': this.authInfo!.apiSecret,
                Nonce: String(_nonce),
            };
        } else {
            return PUBLIC_HEADERS;
        }
    }

    protected checkAuthorized(): void {
        if (this.authInfo === DEFAULT_AUTH_INFO) {
            throw new UnauthorizedRequestError();
        }
    }
}
