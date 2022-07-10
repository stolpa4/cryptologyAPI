import { Requester } from '../../cryptologyAPI/requester/requester.ts';
import { log, RateLimiter } from '../../cryptologyAPI/deps.ts';
import { mock } from '../deps.ts';
import * as types from '../../cryptologyAPI/requester/types.ts';
import {
    AuthInfo,
    ExchangeResponse,
    NonceGetter,
    Request,
    RequestParameters,
    RequestParametersArg,
    ResponseStatus,
} from '../../cryptologyAPI/requester/types.ts';

export class RequesterWrapper extends Requester {
    public response: ExchangeResponse<unknown>;

    public constructor(opts: types.RequesterOptions = {}) {
        super(opts);
        this.response = {
            status: ResponseStatus.Ok,
            error: null,
            data: {
                trade_pair: 'BTC_USD',
                base_currency: 'BTC',
                quoted_currency: 'USD',
            },
        };
    }

    public get spyLog(): log.Logger {
        return this.log;
    }

    public get spyBaseURL(): string {
        return this.baseURL;
    }

    public get spyAuthInfo(): AuthInfo {
        return this.authInfo;
    }

    public get spyReqParams(): RequestParameters {
        return this.reqParams;
    }

    public get spyNonce(): NonceGetter {
        return this.nonce;
    }

    public get spyRateLimiter(): RateLimiter {
        return this.rateLimiter;
    }

    public applyDefaultRequestParams(reqParamsArg: RequestParametersArg | undefined): RequestParameters {
        return super.applyDefaultRequestParams(reqParamsArg);
    }

    public defaultNonceGetter(): NonceGetter {
        return super.defaultNonceGetter();
    }

    public defaultRateLimiter(): RateLimiter {
        return super.defaultRateLimiter();
    }

    public compoundURL(path: string): string {
        return super.compoundURL(path);
    }

    public compoundRequestOptions(req: Request): RequestInit {
        return super.compoundRequestOptions(req);
    }

    public craftHeaders(isPrivate: boolean | undefined): HeadersInit {
        return super.craftHeaders(isPrivate);
    }

    public checkAuthorized(): void {
        // We don't want this check to be forced in the tests,
        // at the same time we can test it separately though a different wrapper method
    }

    public checkAuthorizedOriginal(): void {
        super.checkAuthorized();
    }

    public async makeRequest(_req: Request): Promise<ExchangeResponse<unknown>> {
        return this.response;
    }

    public mockRequest(
        func: (req: Request) => Promise<ExchangeResponse<unknown>> = () =>
            new Promise((resolve) => resolve(this.response)),
    ): void {
        this.makeRequest = mock.spy(func);
    }
}
