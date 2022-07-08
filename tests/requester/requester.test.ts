import { asserts as require, bdd, mock } from '../deps.ts';
const { describe, it } = bdd;

import { log } from '../../cryptologyAPI/deps.ts';

import { RequesterWrapper } from './requester.wrapper.ts';

describe('Requester default properties', () => {
    it('Should use the default logger in case no logger is provided', () => {
        const spy: log.Logger = mock.spy() as unknown as log.Logger;
        spy.debug = mock.spy();
        const req = new RequesterWrapper({ logger: spy });
        require.assertEquals(spy, req.spyLog);
    });
});
