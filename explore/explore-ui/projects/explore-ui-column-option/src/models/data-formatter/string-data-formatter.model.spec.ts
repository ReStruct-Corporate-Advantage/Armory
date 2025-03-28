import {StringDataFormatter} from './string-data-formatter.model';

/**
 * Test cases for StringDataFormatter class
 */
describe('StringDataFormatter', () => {

    it('should return raw value', () => {
        expect(new StringDataFormatter().convertToRaw('portfolio')).toBe('portfolio');
    });

    it('should compare uppercase strings', () => {
        expect(new StringDataFormatter().getComparableValue('abc')).toBe('ABC');
    });
});
