import {ColumnStaticStringValue} from './column-static-string-value.model';

describe('Column Static String Value test cases', () => {

    it('deserialize test', () => {
        const data: any = {
            value: 'Value',
            desc: 'Desc',
            displayName: 'displayName',
        };

        const columnStaticStringValue = new ColumnStaticStringValue(data);
        expect(columnStaticStringValue.value).toBe('Value');
        expect(columnStaticStringValue.displayName).toBe('displayName');
    });
});
