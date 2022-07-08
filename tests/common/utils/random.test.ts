import { asserts as require, bdd } from '../../deps.ts';
const { describe, it } = bdd;

import * as random from '../../../cryptologyAPI/common/utils/random.ts';

describe('Random integer generation', () => {
    const getTestArr = (min: number, max: number, num: number) => {
        const res = [];
        for (let i = 0; i < num; i++) res.push(random.int(min, max));
        return res;
    };

    it('Should not include the upper result', () => {
        const testArr = getTestArr(0, 1, 10000);
        require.assertFalse(testArr.includes(1));
    });

    it('Should work with negative numbers (why not?)', () => {
        const testArr = getTestArr(-3, 0, 10000);
        require.assert(testArr.includes(-3) && testArr.includes(-2) && testArr.includes(-1));
    });

    it('Should round floats to ints correctrly', () => {
        const testArr = getTestArr(0.12341234, 2.12341234, 10);
        testArr.sort();
        require.assert(testArr[0] === 1 && testArr[0] === testArr[testArr.length - 1]);
    });

    it('Should throw a error in case max <= min', () => {
        require.assertThrows(() => random.int(100, 90));
        require.assertThrows(() => random.int(99.123123123, 100.123412341234));
    });
});
