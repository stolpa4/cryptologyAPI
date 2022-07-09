// @ts-nocheck

import { asserts as require, bdd, mock } from '../deps.ts';
const { describe, it } = bdd;

import { log, RateLimiter } from '../../cryptologyAPI/deps.ts';
import { DEFAULT_API_URL, DEFAULT_AUTH_INFO, DEFAULT_REQUEST_PARAMS } from '../../cryptologyAPI/requester/constants.ts';

import { RequesterWrapper } from './requester.wrapper.ts';
import { NonceGetter, RequestParametersArg } from '../../cryptologyAPI/requester/types.ts';

describe('Requester default properties', () => {
    it('Should use the default params in case no params is provided', () => {
        const customLog = getLogMock();
        let req = new RequesterWrapper({ logger: customLog });
        require.assertStrictEquals(customLog, req.spyLog);

        req = new RequesterWrapper();
        require.assertInstanceOf(req.spyLog, log.Logger);
    });

    it('Should use the default baseURL in case no baseURL is provided', () => {
        const url = 'http://test';
        let req = new RequesterWrapper({ baseURL: url });
        require.assertStrictEquals(url, req.spyBaseURL);

        req = new RequesterWrapper();
        require.assertStrictEquals(req.spyBaseURL, DEFAULT_API_URL);
    });

    it('Should use the default authInfo in case no authInfo is provided', () => {
        const authInfo = { apiKey: 'test', apiSecret: 'test' };
        let req = new RequesterWrapper({ authInfo });
        require.assertEquals(authInfo, req.spyAuthInfo);

        req = new RequesterWrapper();
        require.assertEquals(DEFAULT_AUTH_INFO, req.spyAuthInfo);
    });

    it('Should use the default requestParams in case no requestParams is provided', () => {
        const requestParameters = { requestTries: 1, requestErrorDelayMs: 1, throttleMs: 1, useTimestampNonce: true };
        let req = new RequesterWrapper({ requestParameters });
        require.assertEquals(requestParameters, req.spyReqParams);

        req = new RequesterWrapper();
        require.assertEquals(DEFAULT_REQUEST_PARAMS, req.spyReqParams);
    });

    it('Should use the default nonce getter in case no nonce getter is provided', () => {
        const nonceGetter = getMockedNonceGetter();
        let req = new RequesterWrapper({ nonceGetter });
        require.assertStrictEquals(nonceGetter, req.spyNonce);

        req = new RequesterWrapper();
        require.assertNotStrictEquals(nonceGetter, req.spyNonce);
    });

    it('Should use the default rate limiter in case no rate limiter is provided', () => {
        const rateLimiter = getMockedRateLimiter();
        let req = new RequesterWrapper({ rateLimiter });
        require.assertStrictEquals(rateLimiter, req.spyRateLimiter);

        req = new RequesterWrapper();
        require.assertNotStrictEquals(rateLimiter, req.spyRateLimiter);
    });
});

function getLogMock(): log.Logger {
    const logMock = mock.spy();
    logMock.debug = mock.spy();
    logMock.info = mock.spy();
    logMock.warning = mock.spy();
    logMock.error = mock.spy();
    logMock.critical = mock.spy();

    return logMock;
}

function getMockedNonceGetter(): NonceGetter {
    let nonce = 0;
    return mock.spy(() => nonce++);
}

function getMockedRateLimiter(): RateLimiter {
    const rateLimiter = mock.spy();
    rateLimiter.removeTokens = mock.spy((_num) => 0);
    return rateLimiter;
}

describe('Test apply default request params', () => {
    const req = new RequesterWrapper();

    it('Should use the default params in case no params is provided', () => {
        require.assertEquals(req.applyDefaultRequestParams(undefined), DEFAULT_REQUEST_PARAMS);
    });

    it('Should use the manually provided requestTries param over the default', () =>
        cmpOpts({ requestTries: 1000_000 }));
    it('Should use the manually provided requestErrorDelayMs param over the default', () =>
        cmpOpts({ requestErrorDelayMs: 1 }));
    it('Should use the manually provided throttleMs param over the default', () => cmpOpts({ throttleMs: 1 }));
    it('Should use the manually provided useTimestampNonce param over the default', () =>
        cmpOpts({ useTimestampNonce: true }));

    const cmpOpts = (opts: RequestParametersArg) => {
        const ref = { ...DEFAULT_REQUEST_PARAMS, ...opts };
        require.assertEquals(req.applyDefaultRequestParams(opts), ref);
    };
});

describe('Test default nonce getter', () => {
    let req: RequesterWrapper;

    it('Should not use the timestamp nonce, when it is set so', () => {
        req = new RequesterWrapper({ requestParameters: { useTimestampNonce: false } });
        const nonceGetter = req.defaultNonceGetter();
        let firstNonce = nonceGetter();
        for (let i = 0; i < 100; ++i) require.assertEquals(++firstNonce, nonceGetter());
    });

    it('Should use the timestamp nonce, when it is set so', () => {
        req = new RequesterWrapper({ requestParameters: { useTimestampNonce: true } });
        const nonceGetter = req.defaultNonceGetter();
        for (let i = 0; i < 100; ++i) require.assertAlmostEquals(Date.now(), nonceGetter(), 100);
    });
});

describe('Test default rate limiter', () => {
    let req: RequesterWrapper;

    it('Should configure the throttling correctly when using defaults', () => {
        req = new RequesterWrapper({ requestParameters: { throttleMs: DEFAULT_REQUEST_PARAMS.throttleMs } });
        const rateLimiter = req.defaultRateLimiter();
        require.assertEquals(rateLimiter.tokenBucket.interval, DEFAULT_REQUEST_PARAMS.throttleMs);
        require.assertEquals(rateLimiter.tokenBucket.bucketSize, 1);
    });

    it('Should configure the throttling correctly when using manual params', () => {
        req = new RequesterWrapper({ requestParameters: { throttleMs: 50_000 } });
        const rateLimiter = req.defaultRateLimiter();
        require.assertEquals(rateLimiter.tokenBucket.interval, 50_000);
        require.assertEquals(rateLimiter.tokenBucket.bucketSize, 1);
    });
});
