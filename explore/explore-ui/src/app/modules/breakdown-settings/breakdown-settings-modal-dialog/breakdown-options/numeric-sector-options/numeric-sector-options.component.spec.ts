import {ComponentFixture, TestBed} from '@angular/core/testing';

import {NumericSectorOptionsComponent} from './numeric-sector-options.component';
import {CUSTOM_ELEMENTS_SCHEMA, SimpleChange, SimpleChanges} from '@angular/core';
import {NumericColumnSector, SectorConstants} from '@blk/explore-ui-breakdown';
import {AuxSelectSelectionChangedDetailInterface} from '@blk/aladdin-angular-components';
import {WidgetConfigType} from '@blk/explore-ui-core';

describe('NumericSectorOptionsComponent', () => {
    let component: NumericSectorOptionsComponent;
    let fixture: ComponentFixture<NumericSectorOptionsComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [NumericSectorOptionsComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(NumericSectorOptionsComponent);
        component = fixture.componentInstance;
        component.sectorModel = new NumericColumnSector();
        fixture.detectChanges();
    });

    describe('Test sectorModel change', () => {
        let changes: SimpleChanges;

        beforeEach(() => {
            component.sectorModeSelected = undefined;
            component.breakpointValue = undefined;
            component.sectorModesSelectorData = undefined;
            changes = {};
        });

        it('sectorModel is undefined', () => {
            changes.sectorModel = new SimpleChange(undefined, undefined, true);
            component.sectorModel = undefined;
            component.ngOnChanges(changes);
            expect(component.sectorModeSelected).toBeUndefined();
        });

        it('sectorModel has Bucket Breakpoints', () => {
            component.sectorModel = new NumericColumnSector();
            changes.sectorModel = new SimpleChange(undefined, component.sectorModel, true);
            component.sectorModel.bucketBreakpoints = [1, 2, 3];
            component.ngOnChanges(changes);
            expect(component.sectorModeSelected).toEqual(component.sectorModes.BREAKPOINT_MODE);
            expect(component.breakpointValue).toEqual('1, 2, 3');
            expect(component.sectorModesSelectorData).toEqual([
                {
                    label: component.sectorModes.BREAKPOINT_MODE,
                    checked: true,
                    disabled: false,
                    icon: ''
                },
                {
                    label: component.sectorModes.BUCKET_MODE,
                    checked: false,
                    disabled: false,
                    icon: ''
                },
                {
                    label: component.sectorModes.QUANTILE_MODE,
                    checked: false,
                    disabled: false,
                    icon: ''
                }
            ]);
        });

        it('sectorModel has Bucket Intervals', () => {
            component.sectorModel = new NumericColumnSector();
            changes.sectorModel = new SimpleChange(undefined, component.sectorModel, true);
            component.sectorModel.bucketIntervals = 3;
            component.ngOnChanges(changes);
            expect(component.sectorModeSelected).toEqual(component.sectorModes.BUCKET_MODE);
            expect(component.sectorModesSelectorData).toEqual([
                {
                    label: component.sectorModes.BREAKPOINT_MODE,
                    checked: false,
                    disabled: false,
                    icon: ''
                },
                {
                    label: component.sectorModes.BUCKET_MODE,
                    checked: true,
                    disabled: false,
                    icon: ''
                },
                {
                    label: component.sectorModes.QUANTILE_MODE,
                    checked: false,
                    disabled: false,
                    icon: ''
                }
            ]);
        });

        it('sectorModel has Bucket Intervals and breakpoints undefined, default sector mode Breakpoint', () => {
            component.sectorModel = new NumericColumnSector();
            changes.sectorModel = new SimpleChange(undefined, component.sectorModel, true);
            component.ngOnChanges(changes);
            expect(component.sectorModeSelected).toEqual(component.sectorModes.BREAKPOINT_MODE);
            expect(component.sectorModesSelectorData).toEqual([
                {
                    label: component.sectorModes.BREAKPOINT_MODE,
                    checked: true,
                    disabled: false,
                    icon: ''
                },
                {
                    label: component.sectorModes.BUCKET_MODE,
                    checked: false,
                    disabled: false,
                    icon: ''
                },
                {
                    label: component.sectorModes.QUANTILE_MODE,
                    checked: false,
                    disabled: false,
                    icon: ''
                }
            ]);
        });

        it('sectorModel has quantile info', () => {
            component.sectorModel = new NumericColumnSector();
            changes.sectorModel = new SimpleChange(undefined, component.sectorModel, true);
            component.sectorModel.quantileInfo.numberOfQuantiles = 5;
            component.sectorModel.quantileInfo.quantileSortOrder = SectorConstants.QUANTILE_SORT.DESCENDING;
            component.ngOnChanges(changes);
            expect(component.sectorModeSelected).toEqual(component.sectorModes.QUANTILE_MODE);
            expect(component.sectorModesSelectorData).toEqual([
                {
                    label: component.sectorModes.BREAKPOINT_MODE,
                    checked: false,
                    disabled: false,
                    icon: ''
                },
                {
                    label: component.sectorModes.BUCKET_MODE,
                    checked: false,
                    disabled: false,
                    icon: ''
                },
                {
                    label: component.sectorModes.QUANTILE_MODE,
                    checked: true,
                    disabled: false,
                    icon: ''
                }
            ]);
        });
    });

    it('Test onSectorModeChange', () => {
        component.sectorModeSelected = component.sectorModes.BUCKET_MODE;
        component.sectorModel.bucketIntervals = 3;
        component.sectorModel.bucketBreakpoints = [2, 3];

        // BREAKPOINT MODE
        component.onSectorModeChange(new CustomEvent('build', {detail: {data: {label: component.sectorModes.BREAKPOINT_MODE}, srcEvent: null, index: 0}}));
        expect(component.sectorModeSelected).toEqual(component.sectorModes.BREAKPOINT_MODE);
        expect(component.breakpointValue).toEqual('2, 3');
        expect(component.sectorModel.bucketIntervals).toBeUndefined();

        // BUCKET MODE
        component.onSectorModeChange(new CustomEvent('build', {detail: {data: {label: component.sectorModes.BUCKET_MODE}, srcEvent: null, index: 0}}));
        expect(component.sectorModeSelected).toEqual(component.sectorModes.BUCKET_MODE);
        expect(component.sectorModel.bucketBreakpoints).toBeUndefined();

        // QUANTILE MODE
        component.onSectorModeChange(new CustomEvent('build', {detail: {data: {label: component.sectorModes.QUANTILE_MODE}, srcEvent: null, index: 0}}));
        expect(component.sectorModeSelected).toEqual(component.sectorModes.QUANTILE_MODE);
        expect(component.sectorModel.bucketBreakpoints).toBeUndefined();
        expect(component.sectorModel.bucketIntervals).toBeUndefined();
    });

    describe('Test onQuantileRadioChanged', () => {
        it('Test onQuantileRadioChanged with percentileBreakpointsSelected = true', () => {
            // Start with value of 2
            component.sectorModel.quantileInfo.numberOfQuantiles = 2;
            component.onQuantileRadioChanged(new CustomEvent('build', {detail: {value: {eventData: true}, host: null, srcEvent: null}}));
            expect(component.percentileBreakpointsSelected).toBeTruthy();
            // Should become undefined
            expect(component.sectorModel.quantileInfo.numberOfQuantiles).toBeUndefined();
        });

        it('Test onQuantileRadioChanged with percentileBreakpointsSelected = false', () => {
            // Start with a value of 2
            component.sectorModel.quantileInfo.numberOfQuantiles = 2;
            // "Step up" to 5
            component.quantileStepperValue = 5;
            component.onQuantileRadioChanged(new CustomEvent('build', {detail: {value: {eventData: false}, host: null, srcEvent: null}}));
            expect(component.percentileBreakpointsSelected).toBeFalsy();
            expect(component.sectorModel.quantileInfo.numberOfQuantiles).toEqual(5);
            expect(component.sectorModel.quantileInfo.percentileBreakpoints).toEqual([]);
        });
    });

    describe('Test onBreakpointValueChange', () => {
        it('Test onBreakpointValueChange with breakpoint mode', () => {
            component.onBreakpointValueChange(new CustomEvent('build', {detail: {value: '2, 3, 4', host: null, srcEvent: null}}), SectorConstants.NUMERIC_COLUMN_SECTOR_MODES.BREAKPOINT_MODE);
            expect(component.breakpointValue).toEqual('2, 3, 4');
            expect(component.sectorModel.bucketBreakpoints).toEqual([2, 3, 4]);
            expect(component.sectorModel.quantileInfo.percentileBreakpoints).toEqual([]);
        });

        it('Test onBreakpointValueChange with quantile Mode', () => {
            component.sectorModel.bucketBreakpoints = [];
            component.onBreakpointValueChange(new CustomEvent('build', {detail: {value: '2, 3, 4', host: null, srcEvent: null}}), SectorConstants.NUMERIC_COLUMN_SECTOR_MODES.QUANTILE_MODE);
            expect(component.percentileBreakpoints).toEqual('2, 3, 4');
            expect(component.sectorModel.bucketBreakpoints).toEqual([]);
            expect(component.sectorModel.quantileInfo.percentileBreakpoints).toEqual([2, 3, 4]);
            expect(component.sectorModel.quantileInfo.numberOfQuantiles).toBeUndefined();
        });
    });

    it('Test onQuantileStepperChange', () => {
        // Start with a value of 2
        component.sectorModel.quantileInfo.numberOfQuantiles = 2;
        // "Step up" to 3
        component.onQuantileStepperChange(new CustomEvent('build', {detail: {value: 3, host: null, srcEvent: null}}));
        expect(component.quantileStepperValue).toEqual(3);
        expect(component.sectorModel.quantileInfo.numberOfQuantiles).toEqual(3);
        expect(component.sectorModel.quantileInfo.percentileBreakpoints).toEqual([]);
        expect(component.percentileBreakpointsSelected).toBeFalsy();
    });

    it('should change CreateQuantileFrom', () => {
        component.sectorModel.quantileInfo.periodType = SectorConstants.PERIOD_TYPE.END;
        component.onCreateQuantileFromChange(new CustomEvent('build', {detail: {value: {eventData: 'Start'}, host: null, srcEvent: null}}));
        expect(component.sectorModel.quantileInfo.periodType).toEqual(SectorConstants.PERIOD_TYPE.START);
    });

    it('should change weight value', () => {
        component.onWeightValueChange(new CustomEvent<AuxSelectSelectionChangedDetailInterface>('build', {
            detail: {
                value: {
                    displayValue: SectorConstants.QUANTILE_BASED_ON.PORTFOLIO,
                    value: SectorConstants.QUANTILE_BASED_ON.PORTFOLIO,
                    isSelected: true
                },
                srcEvent: null
            }
        }));
        expect(component.sectorModel.quantileInfo.quantileBasedOn).toEqual(SectorConstants.QUANTILE_BASED_ON.PORTFOLIO);

        component.sectorModel.quantileInfo.quantileBasedOn = SectorConstants.QUANTILE_BASED_ON.BENCHMARK;
        component.onWeightValueChange(null);
        expect(component.sectorModel.quantileInfo.quantileBasedOn).toEqual(SectorConstants.QUANTILE_BASED_ON.BENCHMARK);
    });

    it('Test onQuantileSortChange', () => {
        // Start as descending
        component.sectorModel.quantileInfo.quantileSortOrder = SectorConstants.QUANTILE_SORT.DESCENDING;

        component.onQuantileSortChange(new CustomEvent('build', {detail: {value: {eventData: 'ASC'}, host: null, srcEvent: null}}));
        expect(component.sectorModel.quantileInfo.quantileSortOrder).toEqual(SectorConstants.QUANTILE_SORT.ASCENDING);
    });

    describe('Test setQuantileMode', () => {
        it('Test setQuantileMode when quantileInfo has nothing', () => {
            component.onSectorModeChange(new CustomEvent('build', {detail: {data: {label: SectorConstants.NUMERIC_COLUMN_SECTOR_MODES.QUANTILE_MODE}, index: 2, host: null, srcEvent: null}}));
            expect(component.sectorModeSelected).toEqual(SectorConstants.NUMERIC_COLUMN_SECTOR_MODES.QUANTILE_MODE);
            expect(component.selectedSectorModeIndex).toEqual(2);

            // Check properties affected by setQuantileMode
            expect(component.sectorModel.bucketIntervals).toBeUndefined();
            expect(component.sectorModel.bucketBreakpoints).toBeUndefined();
            expect(component.quantileStepperValue).toEqual(2);
            expect(component.percentileBreakpointsSelected).toBeFalsy();
            expect(component.percentileBreakpoints).toEqual('');
            expect(component.sectorModel.quantileInfo.numberOfQuantiles).toEqual(2);
        });

        it('Test setQuantileMode when quantileInfo has numberOfQuantiles', () => {
            // Start with a value of 5
            component.sectorModel.quantileInfo.numberOfQuantiles = 5;

            component.onSectorModeChange(new CustomEvent('build', {detail: {data: {label: SectorConstants.NUMERIC_COLUMN_SECTOR_MODES.QUANTILE_MODE}, index: 2, host: null, srcEvent: null}}));
            expect(component.quantileStepperValue).toEqual(5);
        });

        it('Test setQuantileMode when quantileInfo has percentileBreakpoints', () => {
            component.sectorModel.quantileInfo.numberOfQuantiles = undefined;
            component.sectorModel.quantileInfo.percentileBreakpoints = [1, 2, 3];

            component.onSectorModeChange(new CustomEvent('build', {detail: {data: {label: SectorConstants.NUMERIC_COLUMN_SECTOR_MODES.QUANTILE_MODE}, index: 2, host: null, srcEvent: null}}));
            // Should default back to 2
            expect(component.quantileStepperValue).toEqual(2);
            expect(component.percentileBreakpointsSelected).toBeTruthy();
            expect(component.percentileBreakpoints).toEqual('1, 2, 3');
        });
    });

    describe('Test setQuantileBasedOnOption', () => {
        it('should set quantileBasedOn to SectorConstants.NUMBER_OF_SECURITIES for risk and exposure', () => {
            component.widgetType = WidgetConfigType.RISK_EXPOSURE;
            component.setQuantileBasedOnOption(true);
            expect(component.sectorModel.quantileInfo.quantileBasedOn).toEqual(SectorConstants.QUANTILE_BASED_ON.NUMBER_OF_SECURITIES);
        });

        it('should set quantileBasedOn to SectorConstants.NUMBER_OF_SECURITIES for expost time series', () => {
            component.widgetType = WidgetConfigType.EXPOST_TIME_SERIES;
            component.setQuantileBasedOnOption(true);
            expect(component.sectorModel.quantileInfo.quantileBasedOn).toEqual(SectorConstants.QUANTILE_BASED_ON.NUMBER_OF_SECURITIES);
        });

        it('should set quantileBasedOn to SectorConstants.QUANTILE_BASED_ON.PORTFOLIO for return analysis', () => {
            component.widgetType = WidgetConfigType.RETURNS;
            component.setQuantileBasedOnOption(true);
            expect(component.sectorModel.quantileInfo.quantileBasedOn).toEqual(SectorConstants.QUANTILE_BASED_ON.PORTFOLIO);
        });

        it('should set quantileBasedOn to previously set BENCHMARK for return analysis', () => {
            component.sectorModel.quantileInfo.quantileBasedOn = SectorConstants.QUANTILE_BASED_ON.BENCHMARK;
            component.widgetType = WidgetConfigType.RETURNS;
            component.setQuantileBasedOnOption(false);
            expect(component.sectorModel.quantileInfo.quantileBasedOn).toEqual(SectorConstants.QUANTILE_BASED_ON.BENCHMARK);
        });

        it('should set quantileBasedOn to PORTFOLIO with reset = false, but previously set is empty for return analysis', () => {
            component.sectorModel.quantileInfo.quantileBasedOn = '';
            component.widgetType = WidgetConfigType.RETURNS;
            component.setQuantileBasedOnOption(false);
            expect(component.sectorModel.quantileInfo.quantileBasedOn).toEqual(SectorConstants.QUANTILE_BASED_ON.PORTFOLIO);
        });
    });
});
