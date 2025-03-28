import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CoreRiskConstants} from '@blk/explore-ui-risk';
import {BreakdownSectorSelectorComponent} from './breakdown-sector-selector.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {BreakdownUtils} from '@utils/breakdown.utils';
import {BreakdownBuilderSettings, BreakdownConstants, BreakdownFavoriteConstants, BreakdownSectorSelectorOption} from '@blk/explore-ui-breakdown';
import {BehaviorSubject} from 'rxjs';

describe('BreakdownSectorSelectorComponent', () => {
    let component: BreakdownSectorSelectorComponent;
    let fixture: ComponentFixture<BreakdownSectorSelectorComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [BreakdownSectorSelectorComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(BreakdownSectorSelectorComponent);
        component = fixture.componentInstance;
    });

    it('on init', () => {
        jest.spyOn(BreakdownUtils, 'createIndividualMeasuresSectorTreeOptions').mockReturnValue([]);
        jest.spyOn(BreakdownUtils, 'createCommonHierarchiesSectorTreeOptions').mockReturnValue([]);
        component.breakdownBuilderSettings = new BreakdownBuilderSettings();
        component.breakdownBuilderSettings.inputName = CoreRiskConstants.CONFIG_TYPE.BREAKDOWN;
        component.breakdownBuilderSettings.favoriteType = BreakdownFavoriteConstants.FACTOR_BREAKDOWN;
        component.ngOnInit();
        expect(BreakdownUtils.createIndividualMeasuresSectorTreeOptions).toHaveBeenCalled();
        expect(BreakdownUtils.createCommonHierarchiesSectorTreeOptions).toHaveBeenCalledTimes(0);
        // Not show common hierarchies
        component.breakdownBuilderSettings.inputName = CoreRiskConstants.CONFIG_TYPE.RISK_FACTOR_BREAKDOWN;
        component.ngOnInit();
        expect(BreakdownUtils.createIndividualMeasuresSectorTreeOptions).toHaveBeenCalled();
        expect(BreakdownUtils.createCommonHierarchiesSectorTreeOptions).toHaveBeenCalledTimes(0);
        expect(component.showCommonHierarchiesSelections).toBeFalsy();
        component.breakdownBuilderSettings.inputName = 'breakdownTree';
        component.breakdownBuilderSettings.favoriteType = BreakdownFavoriteConstants.FACTOR_BREAKDOWN;
        component.ngOnInit();
        expect(BreakdownUtils.createIndividualMeasuresSectorTreeOptions).toHaveBeenCalledTimes(3);
        expect(BreakdownUtils.createCommonHierarchiesSectorTreeOptions).toHaveBeenCalledTimes(0);
        expect(component.showCommonHierarchiesSelections).toBeFalsy();
        // show common hierarchies
        component.breakdownBuilderSettings.favoriteType = 'BKD';
        component.ngOnInit();
        expect(BreakdownUtils.createIndividualMeasuresSectorTreeOptions).toHaveBeenCalledTimes(4);
        expect(BreakdownUtils.createCommonHierarchiesSectorTreeOptions).toHaveBeenCalledTimes(1);
        expect(component.showCommonHierarchiesSelections).toBeTruthy();
    });

    it('on selection changed', () => {
        const currentSelection = new BreakdownSectorSelectorOption('234');
        currentSelection.isSelected = true;
        component.selectedSector = currentSelection;
        const newSelection = new BreakdownSectorSelectorOption('456');
        newSelection.isSelected = true;
        component['onSelectionChanged'](newSelection);
        expect(component.selectedSector).toEqual(newSelection);
    });

    it('on onNewCustomSectorClick', () => {
        jest.spyOn(component.addNewCustomSector, 'emit');
        const event = {preventDefault: jest.fn(), target: { isDisabled: false}};
        component.onNewCustomSectorClick(event as any);
        expect(component.addNewCustomSector.emit).toHaveBeenCalled();
        expect(event.preventDefault).toHaveBeenCalled();
        event.target.isDisabled = true;
        component.onNewCustomSectorClick(event as any);
        expect(component.addNewCustomSector.emit).toHaveBeenCalledTimes(1);
        expect(event.preventDefault).toHaveBeenCalledTimes(1);
    });

    it('on sectorSearchValueChanged', () => {
        component.searchTermSubject$ = new BehaviorSubject<string>(undefined);
        let event = {detail: {submitValue: {searchValue: 'Test'}}};
        component.sectorSearchValueChanged(event as any);
        expect(component.searchTermSubject$.getValue()).toEqual('Test');
        expect(component.isExpanded).toBeTruthy();
        event = {detail: {submitValue: {searchValue: ''}}};
        component.sectorSearchValueChanged(event as any);
        expect(component.searchTermSubject$.getValue()).toEqual('');
        expect(component.isExpanded).toBeFalsy();
    });
});
