import {ComponentFixture, TestBed} from '@angular/core/testing';

import {BreakdownPreviewComponent} from './breakdown-preview.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {
    Breakdown,
    BreakdownBuilderSettings,
    BreakdownConstants,
    BreakdownFavoriteConstants,
    ColumnSector
} from '@blk/explore-ui-breakdown';
import {cloneDeep, find} from 'lodash';

describe('BreakdownPreviewComponent', () => {
    let component: BreakdownPreviewComponent;
    let fixture: ComponentFixture<BreakdownPreviewComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [BreakdownPreviewComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(BreakdownPreviewComponent);
        component = fixture.componentInstance;
        component.breakdownBuilderSettings = new BreakdownBuilderSettings();
        component.breakdownBuilderSettings.restrictBreakdownToSingleLevel = false;
        component.isOptimizationCashSettingChecked = true;
        fixture.detectChanges();
    });

    it ('riskless cash checkbox state should be set in portfolio composition settings', () => {
        jest.spyOn(component.isOptimizationCashSettingChanged, 'emit');
        component.onOptimizationCashSettingChanged({detail: {value: {checked: true}}});
        expect(component.isOptimizationCashSettingChanged.emit).toHaveBeenCalled();
    });

    it('Component Initialization/ Setting currently set breakdown Type', () => {
        // If breakdown is undefined or empty breakdown with isConfigured flag as false, type should be none
        component.breakdown = null;
        component.ngOnInit();
        expect(component.selectedBreakdownType).toEqual(BreakdownConstants.BREAKDOWN_OPTIONS.NONE.value);
        component.breakdown = new Breakdown();
        component.breakdown.isConfigured = false;
        component.ngOnInit();
        expect(component.selectedBreakdownType).toEqual(BreakdownConstants.BREAKDOWN_OPTIONS.NONE.value);
        // If breakdown is defined and isConfigured flag is either undefined(Old Favorite) or True, the type should be multi
        component.breakdown = new Breakdown();
        component.ngOnInit();
        expect(component.selectedBreakdownType).toEqual(BreakdownConstants.BREAKDOWN_OPTIONS.MULTI.value);
        expect(component.breakdown.isConfigured).toBeTruthy();
        component.breakdown.isConfigured = true;
        component.ngOnInit();
        expect(component.selectedBreakdownType).toEqual(BreakdownConstants.BREAKDOWN_OPTIONS.MULTI.value);
        // If breakdown is defined and not empty and isConfigured is false, the type should be single
        component.breakdown.isConfigured = false;
        component.breakdown.addChild(new ColumnSector());
        component.ngOnInit();
        expect(component.selectedBreakdownType).toEqual(BreakdownConstants.BREAKDOWN_OPTIONS.SINGLE.value);
    });

    it('Test On Breakdown update', () => {
        component.breakdown = new Breakdown();
        component.onBreakdownUpdate(null, BreakdownConstants.BREAKDOWN_OPTIONS.NONE.value);
        expect(component.breakdown.isConfigured).toBeFalsy();
        expect(component.selectedBreakdownType).toEqual(BreakdownConstants.BREAKDOWN_OPTIONS.NONE.value);
        component.onBreakdownUpdate(new Breakdown(), BreakdownConstants.BREAKDOWN_OPTIONS.SINGLE.value);
        expect(component.breakdown.isConfigured).toBeFalsy();
        expect(component.selectedBreakdownType).toEqual(BreakdownConstants.BREAKDOWN_OPTIONS.SINGLE.value);
        const breakdown = new Breakdown();
        const child = new ColumnSector();
        child.columnName = 'Long/Short';
        breakdown.addChild(child);
        component.onBreakdownUpdate(breakdown, BreakdownConstants.BREAKDOWN_OPTIONS.MULTI.value);
        expect(component.breakdown.title).toBe('<Long/Short>');
        expect(component.breakdown.isConfigured).toBeTruthy();
        expect(component.selectedBreakdownType).toEqual(BreakdownConstants.BREAKDOWN_OPTIONS.MULTI.value);
        const newBreakdown = new Breakdown();
        newBreakdown.title = 'title';
        jest.spyOn(component.breakdown, 'setDefaultTitle');
        component.onBreakdownUpdate(newBreakdown, BreakdownConstants.BREAKDOWN_OPTIONS.SINGLE.value);
        expect(component.breakdown.setDefaultTitle).not.toHaveBeenCalled();
    });

    it('Test restrictBreakdownToSingleLevelAlert', () => {
        const notificationSpy = jest.spyOn(component['notificationService'], 'warning');
        component.breakdown = new Breakdown();
        component.breakdown.children = [];

        // Try with a child sector.
        component.breakdown.addChild(new ColumnSector());
        // Try with a child with a child sector.
        component.breakdown.children[0].addChild(new ColumnSector());
        component.restrictBreakdownToSingleLevelAlert();
        expect(notificationSpy).not.toHaveBeenCalled();

        component.breakdownBuilderSettings.restrictBreakdownToSingleLevel = true;
        component.restrictBreakdownToSingleLevelAlert();
        expect(notificationSpy).toHaveBeenCalled();
    });

    it('isNoneBreakdownOptionUpdatedToDefault test', () => {
        component.breakdown = new Breakdown();
        component.breakdownBuilderSettings.includeNoBreakdownOption = false;
        component.ngOnInit();
        expect(component.selectedBreakdownType).toEqual(BreakdownConstants.BREAKDOWN_OPTIONS.MULTI.value);
        expect(component.breakdown.isConfigured).toBeTruthy();
    });


    it('Test default breakdown is set to Exposure Aggregation Type for Exposure columns in R&E', () => {
        const dummyInput = {
            inputCategories: [
                {
                    categoryType: 'breakdown',
                    categoryTitle: 'Breakdown',
                    noAccordion: true,
                    inputs: [
                        {
                            inputConfigType: 'breakdownTree',
                            inputTitle: 'Factor Breakdown',
                            inputName: 'riskFactorBreakdown',
                            mandateSettingType: 'FAC_BKD',
                            noAccordion: true,
                            EATBreakdownFilter: [
                                {
                                    type: '=',
                                    key: 'isEATBreakdownDefinition',
                                    value: true
                                }
                            ]
                        }
                    ]
                }
            ]
        };
        const inputs = dummyInput.inputCategories;
        const breakdownInputs = find(inputs, {categoryType: 'breakdown'})['inputs'];
        const breakdownEntry = find(breakdownInputs, {mandateSettingType: BreakdownFavoriteConstants.FACTOR_BREAKDOWN});
        const eatFilter: any[] = breakdownEntry['EATBreakdownFilter'];

        component.breakdown = new Breakdown();
        component.breakdown.isConfigured = false;
        component.breakdownBuilderSettings.columnFilter = cloneDeep(eatFilter);
        component.breakdownBuilderSettings.includeNoBreakdownOption = false;
        component.ngOnInit();
        expect(component.selectedBreakdownType).toEqual(BreakdownConstants.BREAKDOWN_OPTIONS.SINGLE.value);
        expect(component.breakdown.isConfigured).toBeFalsy();
        expect(component.breakdown.getDisplayTitle()).toEqual(BreakdownConstants.EXPOSURE_AGGREGATION_TYPE);
    });
});
