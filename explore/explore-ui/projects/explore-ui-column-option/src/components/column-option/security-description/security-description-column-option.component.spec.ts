import {ColumnOptionTestBed} from '../../../test-utils';
import {SecurityDescriptionColumnOptionComponent} from './security-description-column-option.component';
import {SecurityDescriptionColumnOption} from '../../../models/column-option/security-description-column-option.model';

describe('Security description column option component', () => {
    let testBed: ColumnOptionTestBed<SecurityDescriptionColumnOptionComponent, SecurityDescriptionColumnOption>;

    beforeEach(() => {
        // Create the mocked column option to validate this control.
        const mockedOption = {
            columnOptionTitle: 'Additional Settings',
            columnOptionAttributes: [{
                title: 'Display',
                defaultValue: {value: 'NAME', label: 'Name'},
                key: 'secDescDisplay',
                values: [
                    {value: 'ASSET_ID', label: 'Asset Id'},
                    {value: 'TICKER', label: 'Ticker'},
                    {value: 'NAME', label: 'Name'},
                    {value: 'TICKER_COUPON_MATURITY', label: 'Ticker/Coupon/Maturity'},
                    {value: 'BB_TICKER', label: 'BB Ticker'}
                 ],
                dataType: 'S'
            }],
            columnOptionKey: 'secDescOptions'
        };

        // Create the testbed for testing the component.
        testBed = new ColumnOptionTestBed<SecurityDescriptionColumnOptionComponent, SecurityDescriptionColumnOption>(SecurityDescriptionColumnOptionComponent, new SecurityDescriptionColumnOption(), mockedOption);
    });

    it('should have aux-select component', () => {
        const compiled = testBed.fixture.debugElement.nativeElement;

        // Make sure we get an aux-select control.
        const selectCtrl = compiled.querySelector('aux-select');
        expect(selectCtrl).not.toBe(null);

        // Also ensure that it has 5 elements in it.
        expect(selectCtrl.data[0].values.length).toBe(5);
    });

    it('should set selectedValue', () => {
        const newValue = 'ASSET_ID';
        testBed.component.setSelectedValue({
            value: newValue,
            displayValue: 'Asset Id'
        });
        expect(testBed.component.optionValue.value).toBe(newValue);
    });
});
