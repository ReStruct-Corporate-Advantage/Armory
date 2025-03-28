import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExposureBasedAddFactorsComponent } from './exposure-based-add-factors.component';
import { EventEmitter } from '@angular/core';
import { WidgetConfigInput, WidgetInput, RestrictedOptionInterface } from '@blk/explore-ui-core';

describe('ExposureBasedAddFactorsComponent', () => {
    let component: ExposureBasedAddFactorsComponent;
    let fixture: ComponentFixture<ExposureBasedAddFactorsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ExposureBasedAddFactorsComponent]
        }).compileComponents();
        fixture = TestBed.createComponent(ExposureBasedAddFactorsComponent);
        component = fixture.componentInstance;
        component.inputs = new Map<string, WidgetInput>();
        component.refreshFactorExposures = new EventEmitter<void>();
        component.updateInputFactors = new EventEmitter<void>();
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize widgetConfigInput and restrictedColumnOptions on init', () => {
        component.ngOnInit();
        expect(component.widgetConfigInput).toEqual({
            inputConfigType: 'columns',
            inputName: 'columns',
            inputTitle: 'columns',
            valueField: 'columnTag',
            default: {}
        } as WidgetConfigInput);
        expect(component.restrictedColumnOptions).toEqual({
            sections: [
                'customColumnTitle',
                'riskSettingsColumnSettings',
                'fxFactorOptionsColumnOption',
            ]
        } as RestrictedOptionInterface);
    });

    it('should emit updateInputFactors and open modal on add factors button click', () => {
        jest.spyOn(component.updateInputFactors, 'emit');
        component.onAddFactorsButtonClicked();
        expect(component.updateInputFactors.emit).toHaveBeenCalled();
        expect(component.isFactorDataColumnModalOpen).toBe(true);
    });

    it('should close modal and emit refreshFactorExposures if doneClicked is true', () => {
        jest.spyOn(component.refreshFactorExposures, 'emit');
        component.isFactorDataColumnModalOpen = true;
        component.onFactorDataColumnModalClosed(true);
        expect(component.isFactorDataColumnModalOpen).toBe(false);
        expect(component.refreshFactorExposures.emit).toHaveBeenCalled();
    });

    it('should close modal and not emit refreshFactorExposures if doneClicked is false', () => {
        jest.spyOn(component.refreshFactorExposures, 'emit');
        component.isFactorDataColumnModalOpen = true;
        component.onFactorDataColumnModalClosed(false);
        expect(component.isFactorDataColumnModalOpen).toBe(false);
        expect(component.refreshFactorExposures.emit).not.toHaveBeenCalled();
    });

});
