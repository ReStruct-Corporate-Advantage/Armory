import {SentenceCasePipe} from './sentence-case.pipe';

describe('SentenceCasePipe', () => {
    it('create an instance and check transformation for different values', () => {
        const pipe = new SentenceCasePipe();
        expect(pipe).toBeTruthy();

        // stringToTransform contains only one word
        let stringToTransform = 'book';
        expect(pipe.transform(stringToTransform)).toEqual('Book');

        // stringToTransform contains multiple word
        stringToTransform = 'Book Type';
        expect(pipe.transform(stringToTransform)).toEqual('Book type');

        // stringToTransform is blank
        stringToTransform = '';
        expect(pipe.transform(stringToTransform)).toEqual('');

        // stringToTransform is undefined
        stringToTransform = undefined;
        expect(pipe.transform(stringToTransform)).toEqual(undefined);
    });
});
