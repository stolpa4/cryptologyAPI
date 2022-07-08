import { asserts as require, bdd } from '../deps.ts';
const { describe, it } = bdd;

import { exportedForTesting } from '../../cryptologyAPI/common/logging.ts';
const { compoundHierarchicalLogName } = exportedForTesting;

import { API_NAME } from '../../cryptologyAPI/common/constants.ts';

describe('Hierarchical log names', () => {
    it('Should compound it correctly', () => {
        require.assertEquals(compoundHierarchicalLogName('test'), `${API_NAME}.test`);
    });

    it('Should just return API name on empty arg', () => {
        require.assertEquals(compoundHierarchicalLogName(), `${API_NAME}`);
    });
});
