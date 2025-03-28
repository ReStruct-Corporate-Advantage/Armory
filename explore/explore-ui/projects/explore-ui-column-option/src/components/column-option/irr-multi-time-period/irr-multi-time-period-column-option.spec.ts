import {ColumnOptionFactory} from '@blk/explore-ui-core';
import {IrrMultiTimePeriodColumnOption} from '../../../models/column-option/irr-multi-time-period-column-option.model';
import {ColumnOptionTestBed} from '../../../test-utils';
import {IrrMultiTimePeriodColumnOptionComponent} from './irr-multi-time-period-column-option.component';

describe('IrrMultiTimePeriodComponent', () => {
    let testBed: ColumnOptionTestBed<IrrMultiTimePeriodColumnOptionComponent, IrrMultiTimePeriodColumnOption>;

    /**
     * Performs required initialisation before any test is run
     */
    beforeAll(() => {
        ColumnOptionFactory.registerOptionType(IrrMultiTimePeriodColumnOption.CONFIG_TYPE, IrrMultiTimePeriodColumnOption);
    });

    beforeEach(() => {
        // Create the mocked column option to validate this control.
        const mockedOption = {
            columnOptionTitle: 'IRR Settings',
            columnOptionConfigType: 'irrColumnOptions',
            columnOptionAttributes: [{
                title: 'Time Period'
            }]
        };

        // Create the testbed for testing the component.
        testBed = new ColumnOptionTestBed<IrrMultiTimePeriodColumnOptionComponent, IrrMultiTimePeriodColumnOption>(IrrMultiTimePeriodColumnOptionComponent, new IrrMultiTimePeriodColumnOption(), mockedOption, [], 'net_irr', 'ALL');
    });

    it('Validate init of the component', () => {
        // Should have the displayTitle defined.
        expect(testBed.component.displayTitle).toBe('Time Period');

        // The control should have a aux-select
        const compiled = testBed.fixture.debugElement.nativeElement;

        // Make sure we get an aux-select control.
        const selectCtrl = compiled.querySelector('aux-select');
        expect(selectCtrl).not.toBe(null);

        // Also ensure that it has 6 elements in it.
        expect(selectCtrl.data[0].values.length).toBe(6);

        // test to check The control should have only aux-select component
        testBed.component.option.columnOptionAttributes = [{
            title: 'Time Period',
            key: 'multiPeriodIRR',
            dataType: 'S'
        }];
        testBed.fixture.detectChanges();
    });

    it('should sets the Time Periods to the selected value from dropdown', () => {
        const event = {detail: {value: [{displayValue: '1 Year', value: 'ONE_YEAR'}]}};
        testBed.component.chooseIrrTimePeriods(event as CustomEvent);
        expect(testBed.component.optionValue.selectedTimePeriods.length === 1).toBeTruthy();
        expect(testBed.component.optionValue.selectedTimePeriods[0]).toEqual('ONE_YEAR');
    });

});
