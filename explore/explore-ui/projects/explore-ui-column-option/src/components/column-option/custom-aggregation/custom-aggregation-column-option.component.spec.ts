import {CustomAggregationColumnOptionComponent} from './custom-aggregation-column-option.component';
import {CustomAggregationColumnOption} from '../../../models/column-option/custom-aggregation-column-option.model';
import {SubtotallerConstants} from '../../../constants';
import {ColumnOptionMetaDataInterface} from '@blk/explore-ui-core';
import {ColumnOptionTestBed} from '../../../test-utils';

describe('CustomAggregationColumnOptionComponent', () => {

    let testBed: ColumnOptionTestBed<CustomAggregationColumnOptionComponent, CustomAggregationColumnOption>;

    beforeEach(() => {
        // Create the mocked column option to validate this control.
        const mockedOption: ColumnOptionMetaDataInterface = {
            columnOptionKey: 'customAggregation',
            columnOptionTitle: 'Aggregation',
            columnOptionConfigType: 'customAggregation',
            columnOptionAttributes: [{
                title: 'Type',
                key: 'subtotalType',
                dataType: 'N',
                defaultValue: {
                    value: 2300,
                    label: 'Weighted Average'
                },
                values: [{
                    value: 2,
                    label: 'Sum'
                }, {
                    value: 2300,
                    label: 'Weighted Average'
                }, {
                    value: 0,
                    label: 'None'
                }]
            }, {
                title: 'Min',
                key: 'minAggValue',
                dataType: 'N'
            }, {
                title: 'Max',
                key: 'maxAggValue',
                dataType: 'N'
            }, {
                title: 'Exclude/Cap',
                key: 'excludeOrCap',
                dataType: 'B',
                values: [{
                    value: true,
                    label: 'Exclude'
                }, {
                    value: false,
                    label: 'Cap'
                }]
            }, {
                title: 'Weight Typ',
                key: 'weightType',
                dataType: 'S',
                values: [{
                    value: 'PORT',
                    label: 'PORT'
                }, {
                    value: 'BENCH',
                    label: 'BENCH'
                }, {
                    value: 'ALL',
                    label: 'ALL'
                }]
            }, {
                title: 'Column Weight Typ',
                key: 'colWeightType',
                dataType: 'S',
                values: [{
                    value: 'NOTIONAL',
                    label: 'NOTIONAL'
                }, {
                    value: 'MARKET',
                    label: 'MARKET'
                }]
            }]
        };

        const customAggregationColumnOption = new CustomAggregationColumnOption();
        customAggregationColumnOption.subtotalType = 2300;
        customAggregationColumnOption.excludeOrCap = true;
        customAggregationColumnOption.minAggValue = 0;
        customAggregationColumnOption.maxAggValue = 100;
        customAggregationColumnOption.weightType = 'PORT';
        customAggregationColumnOption.colWeightType = 'NOTIONAL';

        // Create the testbed for testing the component.
        testBed = new ColumnOptionTestBed<CustomAggregationColumnOptionComponent, CustomAggregationColumnOption>(CustomAggregationColumnOptionComponent, customAggregationColumnOption, mockedOption);
    });

    it('check if component is initialized correctly', () => {
        expect(testBed.component.customAggregationListAttribute).toBeDefined();
        expect(testBed.component.displayDataForCustomAggregationList[0].values.length).toBe(3);
        expect(testBed.component.minValueAttribute).toBeDefined();
        expect(testBed.component.maxValueAttribute).toBeDefined();
        expect(testBed.component.excludeOrCapAttribute).toBeDefined();
        expect(testBed.component.excludeCapOptions.length).toBe(2);
        expect(testBed.component.weightTypeAttribute).toBeDefined();
        expect(testBed.component.displayDataForWeightType[0].values.length).toBe(2);
        expect(testBed.component.colWeightTypeAttribute).toBeDefined();
        expect(testBed.component.displayDataForColWeightType[0].values.length).toBe(2);
    });

    it('test setupDisplayDataForCustomAggregationListAttribute', () => {
        testBed.component.setupDisplayDataForCustomAggregationListAttribute();

        expect(testBed.component.displayDataForCustomAggregationList[0].values.length).toBe(3);

        const data1 =  testBed.component.displayDataForCustomAggregationList[0].values[0];
        expect(data1.displayValue).toBe('Sum');
        expect(data1.value).toBe(2);
        expect(data1.isSelected).toBe(false);

        const data2 =  testBed.component.displayDataForCustomAggregationList[0].values[1];
        expect(data2.displayValue).toBe('Weighted Average');
        expect(data2.value).toBe(2300);
        expect(data2.isSelected).toBe(true);

        const data3 =  testBed.component.displayDataForCustomAggregationList[0].values[2];
        expect(data3.displayValue).toBe('None');
        expect(data3.value).toBe(0);
        expect(data3.isSelected).toBe(false);
    });


    it('test setupDisplayDataForExcludeOrCapAttribute', () => {
        testBed.component.setupDisplayDataForExcludeOrCapAttribute();

        expect(testBed.component.excludeCapOptions.length).toBe(2);

        const data1 =  testBed.component.excludeCapOptions[0];
        expect(data1.label).toBe(CustomAggregationColumnOptionComponent.EXCLUDE_VALUES_LABEL);
        expect(data1.eventData).toBe(true);
        expect(data1.checked).toBe(true);

        const data2 =  testBed.component.excludeCapOptions[1];
        expect(data2.label).toBe(CustomAggregationColumnOptionComponent.CAP_VALUES_LABEL);
        expect(data2.eventData).toBe(false);
        expect(data2.checked).toBe(false);
    });

    it('test setupDisplayDataForWeightTypeAttribute', () => {
        testBed.component.setupDisplayDataForWeightTypeAttribute();

        expect(testBed.component.displayDataForWeightType[0].values.length).toBe(2);

        const data1 =  testBed.component.displayDataForWeightType[0].values[0];
        expect(data1.displayValue).toBe('PORT');
        expect(data1.value).toBe('PORT');
        expect(data1.isSelected).toBe(true);

        const data2 =  testBed.component.displayDataForWeightType[0].values[1];
        expect(data2.displayValue).toBe('BENCH');
        expect(data2.value).toBe('BENCH');
        expect(data2.isSelected).toBe(false);

        testBed.component.optionValue.subtotalType = SubtotallerConstants.SUM.id;
        testBed.component.setupDisplayDataForWeightTypeAttribute();
        expect(testBed.component.displayDataForWeightType[0].values[2].displayValue).toBe('ALL');
        expect(testBed.component.displayDataForWeightType[0].values[2].value).toBe('ALL');

    });

    it('test setupDisplayDataForColWeighTypeAttribute', () => {
        testBed.component.setupDisplayDataForColWeighTypeAttribute();

        expect(testBed.component.displayDataForColWeightType[0].values.length).toBe(2);

        const data1 =  testBed.component.displayDataForColWeightType[0].values[0];
        expect(data1.displayValue).toBe('NOTIONAL');
        expect(data1.value).toBe('NOTIONAL');
        expect(data1.isSelected).toBe(true);

        const data2 =  testBed.component.displayDataForColWeightType[0].values[1];
        expect(data2.displayValue).toBe('MARKET');
        expect(data2.value).toBe('MARKET');
        expect(data2.isSelected).toBe(false);
    });

    it('test onCustomAggregationChange', () => {
        jest.spyOn(testBed.component, 'setupDisplayDataForWeightTypeAttribute');
        jest.spyOn(testBed.component.aggregationOptionUpdated, 'emit');
        // @ts-ignore
        testBed.component.onCustomAggregationChange({detail: {value: {value : '2'}}});
        expect(testBed.component.optionValue.subtotalType).toBe(2);
        expect(testBed.component.setupDisplayDataForWeightTypeAttribute).toHaveBeenCalled();
        expect(testBed.component.aggregationOptionUpdated.emit).toHaveBeenCalled();
    });


    it('test onMinAggValueChanged', () => {
        // @ts-ignore
        testBed.component.onMinAggValueChanged({detail: {value: '2'}});
        expect(testBed.component.optionValue.minAggValue).toBe(2);
    });

    it('test onMaxAggValueChanged', () => {
        // @ts-ignore
        testBed.component.onMaxAggValueChanged({detail: {value: '2'}});
        expect(testBed.component.optionValue.maxAggValue).toBe(2);
    });

    it('test onExcludeCapRadioGroupChanged', () => {
        // @ts-ignore
        testBed.component.onExcludeCapRadioGroupChanged({eventData: false});
        expect(testBed.component.optionValue.excludeOrCap).toBe(false);
    });

    it('test onWeightTypeChange', () => {
        jest.spyOn(testBed.component.aggregationOptionUpdated, 'emit');
        // @ts-ignore
        testBed.component.onWeightTypeChange({detail: {value: {value : 'BENCH'}}});
        expect(testBed.component.optionValue.weightType).toBe('BENCH');
        expect(testBed.component.aggregationOptionUpdated.emit).toHaveBeenCalled();
    });

    it('test onColWeightTypeChange', () => {
        jest.spyOn(testBed.component.aggregationOptionUpdated, 'emit');
        // @ts-ignore
        testBed.component.onColWeightTypeChange({detail: {value: {value : 'MARKET'}}});
        expect(testBed.component.optionValue.colWeightType).toBe('MARKET');
        expect(testBed.component.aggregationOptionUpdated.emit).toHaveBeenCalled();
    });

    it('test onExcludeNullValuesChange', () => {
        jest.spyOn(testBed.component.aggregationOptionUpdated, 'emit');
        const customEvent = new CustomEvent('build', {detail: {value: {checked: false}, srcEvent: null}});
        testBed.component.onExcludeNullValuesChange(customEvent);
        expect(testBed.component.optionValue.excludeNullValues).toBe(false);
        expect(testBed.component.aggregationOptionUpdated.emit).toHaveBeenCalled();
    });

    it('test enableColumnWeight', () => {
        expect(testBed.component.enableColumnWeight()).toBe(true);
        testBed.component.optionValue.subtotalType = 44;
        expect(testBed.component.enableColumnWeight()).toBe(true);
        testBed.component.optionValue.subtotalType = 2;
        expect(testBed.component.enableColumnWeight()).toBe(false);
    });

    it('test isNoneSubtoterSelected', () => {
        expect(testBed.component.isNoneSubtotallerSelected()).toBe(false);
        testBed.component.optionValue.subtotalType = 0;
        expect(testBed.component.isNoneSubtotallerSelected()).toBe(true);
    });

    it('openScenariosDocumentationLink test', () => {
        window.open = jest.fn();
        testBed.component.openScenariosDocumentationLink();
        expect(window.open).toHaveBeenCalledWith('https://dev.blackrock.com/acs/literature/aladdin-publication/acrm-multiperiod-scenarios.pdf', '_blank');
    });
});
