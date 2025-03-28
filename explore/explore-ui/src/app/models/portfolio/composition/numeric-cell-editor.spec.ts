import {NumericCellEditor} from '@models/portfolio/composition/numeric-cell-editor';

describe('NumericCellEditor', () => {
    it('Tests isCharNumeric', () => {
        const numericCellEditor = new NumericCellEditor();

        let isNumeric = numericCellEditor.isCharNumeric('.');
        expect(isNumeric).toBe(true);

        isNumeric = numericCellEditor.isCharNumeric('5');
        expect(isNumeric).toBe(true);

        isNumeric = numericCellEditor.isCharNumeric('A');
        expect(isNumeric).toBe(false);
    });

    it('Tests getValue', () => {
        const numericCellEditor = new NumericCellEditor();
        numericCellEditor.eInput = Object.create(HTMLElement.prototype, {});
        numericCellEditor.eInput.value = '+10m';
        numericCellEditor.currentValue = 0;
        let value = numericCellEditor.getValue();
        expect(value).toBe(10000);

        numericCellEditor.eInput.value = '-0.5m';
        value = numericCellEditor.getValue();
        expect(value).toBe(-500);

        numericCellEditor.eInput.value = '-';
        value = numericCellEditor.getValue();
        expect(value).toBe(0);

        numericCellEditor.eInput.value = '+';
        value = numericCellEditor.getValue();
        expect(value).toBe(0);
    });

    it('Tests if the char is m or b', () => {
        const numericCellEditor = new NumericCellEditor();
        expect(numericCellEditor.isCharMOrB('m')).toBeTruthy();
    });

    it('Tests formatting of the data using NumericCellEditor', () => {
        const numericCellEditor = new NumericCellEditor();
        const params: any = {};

        // params.value is a number
        params.value = 5.01248785745;
        numericCellEditor.init(params);
        let formattedValue = numericCellEditor.getValue();
        expect(formattedValue).toBe(5.012488);

        // params.value is not a number
        params.value = 'A';
        numericCellEditor.init(params);
        formattedValue = numericCellEditor.getValue();
        expect(formattedValue).toBe(0);
    });

    it('Tests events', () => {
        const numericCellEditor = new NumericCellEditor();
        const params: any = {
            stopEditing: () => {
            },
            eventKey: '5.62',
            colDef: {}
        };

        // params.charPress is a number
        numericCellEditor.init(params);
        const formattedValue = numericCellEditor.getValue();
        expect(formattedValue).toBe(5.62);

        // test keypress
        const keyBoardEvt: KeyboardEvent = new KeyboardEvent('keypress', {'code': '37'});
        jest.spyOn(numericCellEditor, 'isCharNumeric').mockReturnValue(false);
        jest.spyOn(numericCellEditor.eInput, 'focus');
        jest.spyOn(keyBoardEvt, 'preventDefault');
        numericCellEditor.eInput.dispatchEvent(keyBoardEvt);
        expect(numericCellEditor.isCharNumeric).toHaveBeenCalledTimes(1);
        expect(numericCellEditor.eInput.focus).toHaveBeenCalledTimes(1);
        expect(keyBoardEvt.preventDefault).toHaveBeenCalledTimes(1);

        // test blur
        const blurEvt: Event = new Event('blur');
        jest.spyOn(params, 'stopEditing');
        numericCellEditor.eInput.dispatchEvent(blurEvt);
        expect(params.stopEditing).toHaveBeenCalledTimes(1);
    });
});
