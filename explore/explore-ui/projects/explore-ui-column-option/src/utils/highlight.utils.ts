
export class HighlightUtils {

    /**
     * Convert hex string to rgb string
     * @param hexString
     */
    static hexToRGB(hexString: string) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexString);
        return result ? 'rgb('
            + parseInt(result[1], 16) + ','
            + parseInt(result[2], 16) + ','
            + parseInt(result[3], 16) + ')' : null;
    }
    /**
     * Will return white or black depending on the cell's highlight color
     * @param rgbString cell's highlight color
     */
    static determineTextColor(rgbString: string): string {
        if (!rgbString) {
            return '#000000';
        }
        rgbString = rgbString.replace(/\s+/g, '');
        let rgb;
        if (rgbString.startsWith('rgba') || rgbString.startsWith('hsla')) {
            // TODO: cater this scenario
            return '#000000';
        } else if (rgbString.startsWith('rgb')) {
            rgb = rgbString.replace(/[^\d,]/g, '').split(',').map(val => parseInt(val, 10));
        } else if (rgbString.startsWith('hsl')) {
            // Catering the scenario where the color is saved as hsl in favorite e.g> rgbString is 'hsl(209, 95%, 50%)'.
            const hslValues = rgbString.match(/hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/g).map(x => x.replace(/[()%]/g, ''))[0].split(',');
            // hsl values need to be in between [0, 1] so the percentage needs to be divided in 100, and the degree by 360.
            rgb = HighlightUtils.hslToRgb(+hslValues[0] / 360, +hslValues[1] / 100, +hslValues[2] / 100);
        } else {
            // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
            const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
            rgbString.replace(shorthandRegex, (_m, r, g, b) => r + r + g + g + b + b);
            rgbString = rgbString.replace(shorthandRegex, function(_m, r, g, b) {
                return r + r + g + g + b + b;
            });
            rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(rgbString).map(val => parseInt(val, 16));
            rgb.shift();
        }
        return (rgb[0] * 0.299 + rgb[1] * 0.587 + rgb[2] * 0.114) > 186 ? '#000000' : '#ffffff';
    }

     static hue2rgb (p: number, q: number, t: number): number {
        if (t < 0) {
            t += 1;
        }
        if (t > 1) {
            t -= 1;
        }
        if (t < 1 / 6) {
            return p + (q - p) * 6 * t;
        }
        if (t < 1 / 2) {
            return q;
        }
        if (t < 2 / 3) {
            return p + (q - p) * (2 / 3 - t) * 6;
        }
        return p;
    }

    /**
     * Converts an HSL color value to RGB. Conversion formula
     * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
     * Assumes h, s, and l are contained in the set [0, 1] and
     * returns r, g, and b in the set [0, 255].
     *
     * @param   {number}  h       The hue
     * @param   {number}  s       The saturation
     * @param   {number}  l       The lightness
     * @return  {Array}           The RGB representation
     */
    static hslToRgb(h: number, s: number, l: number): number[] {
        let r, g, b;

        if (s === 0) {
            r = g = b = l; // achromatic
        } else {
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = HighlightUtils.hue2rgb(p, q, h + 1 / 3);
            g = HighlightUtils.hue2rgb(p, q, h);
            b = HighlightUtils.hue2rgb(p, q, h - 1 / 3);
        }
        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }
}
