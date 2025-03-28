import {NumberUtils} from './number.utils';

describe('NumberUtils Tests', () => {
    describe('parseNumberString Tests', () => {
        it('should not format a plain number', () => {
            expect(NumberUtils.parseNumberString('100')).toBe(100);
        });

        it('should preserve positive sign', () => {
            expect(NumberUtils.parseNumberString('+100')).toBe(+100);
        });

        it('should preserve sign', () => {
            expect(NumberUtils.parseNumberString('+-100')).toBe(-100);
        });

        it('should scale a number with a m thousand or b billion suffix', () => {
            expect(NumberUtils.parseNumberString('1m')).toBe(1000);
            expect(NumberUtils.parseNumberString('1b')).toBe(1000000000);
        });

        it('should remove commmas', () => {
            expect(NumberUtils.parseNumberString('1,000,000')).toBe(1000000);
        });

        it('should preserve negative sign', () => {
            expect(NumberUtils.parseNumberString('-100,000')).toBe(-100000);

        });

        it('should throw an error if it invalid number format', () => {
            expect(NumberUtils.parseNumberString('abc')).toBeUndefined();
        });
    });

    describe('validateIfStringIsNumber Tests', () => {
        it('should accept valid scenarios', () => {
            expect(NumberUtils.validateIfStringIsNumber('100')).toBe(true);
            expect(NumberUtils.validateIfStringIsNumber('0.2')).toBe(true);
            expect(NumberUtils.validateIfStringIsNumber('-5.2')).toBe(true);
            expect(NumberUtils.validateIfStringIsNumber('.23')).toBe(true);
            expect(NumberUtils.validateIfStringIsNumber('-2')).toBe(true);
        });

        it('should reject invalid scenarios', () => {
            expect(NumberUtils.validateIfStringIsNumber('10.')).toBe(false);
            expect(NumberUtils.validateIfStringIsNumber('test')).toBe(false);
            expect(NumberUtils.validateIfStringIsNumber('-5.')).toBe(false);
        });
    });

    describe('validateCommmaSeparatedFormatter Tests', () => {
        it('should accept valid scenarios', () => {
            expect(NumberUtils.commaSeparatedColumnFormatter('123456789.023')).toBe('123,456,789.02');
            expect(NumberUtils.commaSeparatedColumnFormatter('12345679.023')).toBe('12,345,679.02');
            expect(NumberUtils.commaSeparatedColumnFormatter('123456789')).toBe('123,456,789.00');
        });
    });
});
