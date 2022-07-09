import { Requester } from '../../cryptologyAPI/requester/requester.ts';
import { log, RateLimiter } from '../../cryptologyAPI/deps.ts';
import { AuthInfo, NonceGetter, RequestParameters } from '../../cryptologyAPI/requester/types.ts';

export class RequesterWrapper extends Requester {
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
}
