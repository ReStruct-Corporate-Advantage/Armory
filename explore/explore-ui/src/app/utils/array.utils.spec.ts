import {ArrayUtils} from './array.utils';

describe('ArrayUtils', () => {
    it('Test moveItemInArray', () => {
        const array = [1, 2, 3, 4, 5];
        ArrayUtils.moveItemInArray(2, 5, array);
        expect(array).toEqual([1, 2, 5, 3, 4]);
        ArrayUtils.moveItemInArray(2, 6, array);
        expect(array).toEqual([1, 2, 5, 3, 4]);
    });

    it('Test splitArrayIntoChunks', () => {
        // Test with null
        const nullArray = ArrayUtils.splitArrayIntoChunks(null, 10);
        expect(nullArray).toEqual(null);

        // Test with empty array
        const emptyArray = ArrayUtils.splitArrayIntoChunks([], 10);
        expect(emptyArray).toEqual([]);

        // Test with chunk size of 2
        const chunkSizeOfTwo = ArrayUtils.splitArrayIntoChunks([1, 2, 3], 2);
        expect(chunkSizeOfTwo[0].length).toBe(2);
        expect(chunkSizeOfTwo[0]).toEqual([1, 2]);
        expect(chunkSizeOfTwo[1]).toEqual([3]);
    });
});
