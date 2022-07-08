import { Requester } from '../../cryptologyAPI/requester/requester.ts';
import { log, RateLimiter } from '../../cryptologyAPI/deps.ts';
import { AuthInfo, NonceGetter, RequestParameters } from '../../cryptologyAPI/requester/types.ts';

export class RequesterWrapper extends Requester {
    public get spyLog(): log.Logger {
        return super.log;
    }

    public get spyBaseURL(): string {
        return super.baseURL;
    }

    public get spyAuthInfo(): AuthInfo {
        return super.authInfo;
    }

    public get spyReqParams(): RequestParameters {
        return super.reqParams;
    }

    public get spyNonce(): NonceGetter {
        return super.nonce;
    }

    public get spyRateLimiter(): RateLimiter {
        return super.rateLimiter;
    }
}
