import {HighlightUtils} from './highlight.utils';

describe('HighlightUtils', () => {
    it('tests determineTextColor', () => {
        let rgbStr = 'rgb(120,110,100)';
        expect(HighlightUtils.determineTextColor(rgbStr)).toBe('#ffffff');
        rgbStr = 'rgb(255,210,160)';
        expect(HighlightUtils.determineTextColor(rgbStr)).toBe('#000000');
        rgbStr = '#786e64';
        expect(HighlightUtils.determineTextColor(rgbStr)).toBe('#ffffff');
        rgbStr = '#ffd2a0';
        expect(HighlightUtils.determineTextColor(rgbStr)).toBe('#000000');
        rgbStr = '#fff';
        expect(HighlightUtils.determineTextColor(rgbStr)).toBe('#000000');
        rgbStr = '#000';
        expect(HighlightUtils.determineTextColor(rgbStr)).toBe('#ffffff');
        rgbStr = 'hsl(209, 95%, 50%)';
        expect(HighlightUtils.determineTextColor(rgbStr)).toBe('#ffffff');
        rgbStr = 'rgba(255,210,160, 0.7)';
        expect(HighlightUtils.determineTextColor(rgbStr)).toBe('#000000');
    });
})
