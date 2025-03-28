import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FactorDataConditionalFormattingComponent } from './factor-data-conditional-formatting.component';
import {FactorDataChartSettingsStore} from '../../stores/factor-data-chart-settings.store';
import {BehaviorSubject} from 'rxjs';
import {FactorDataHighlightSettings} from '@models/widget/inputs/factor-data-settings/factor-data-highlight-settings.model';
import {HighlightColumnOption, HighlightComparisonType, HighlightSettings} from '@blk/explore-ui-column-option';
import {cloneDeep} from 'lodash';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';

describe('FactorDataConditionalFormattingComponent', () => {
    let component: FactorDataConditionalFormattingComponent;
    let fixture: ComponentFixture<FactorDataConditionalFormattingComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ FactorDataConditionalFormattingComponent ],
            schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
        })
            .compileComponents();

        fixture = TestBed.createComponent(FactorDataConditionalFormattingComponent);
        component = fixture.componentInstance;
        component.isTriangularMatrix$ = new BehaviorSubject<boolean>(false);

        const highlightSetting = new HighlightSettings();
        highlightSetting.comparisonType = HighlightComparisonType.EQUALS;
        highlightSetting.comparisonRawValues = [50];

        const factorDataHighlightSettings = new FactorDataHighlightSettings();
        factorDataHighlightSettings.lowerHighlightSettings = new HighlightColumnOption();
        factorDataHighlightSettings.upperHighlightSettings = new HighlightColumnOption();
        factorDataHighlightSettings.lowerHighlightSettings.highlightSettings = [ cloneDeep(highlightSetting) ];
        factorDataHighlightSettings.upperHighlightSettings.highlightSettings = [ cloneDeep(highlightSetting) ];

        const inputs = new Map();
        inputs.set(FactorDataHighlightSettings.configType, factorDataHighlightSettings);
        FactorDataChartSettingsStore.inputs = inputs;

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('test ngOnInit', () => {
        component.ngOnInit();
        expect(component.option).not.toBeUndefined();
        expect(component.lowerCol).not.toBeUndefined();
        expect(component.upperCol).not.toBeUndefined();
    });

    it('test resetSettings for Triangular mode', () => {
        const factorDataHighlightSettings = component['getFactorDataHighlightSettings']();
        factorDataHighlightSettings.lowerHighlightSettings = undefined;
        factorDataHighlightSettings.upperHighlightSettings = undefined;
        component.isTriangularMatrix$.next(true);

        expect(component.lowerCol.optionValues.length).toBe(1);
        expect(component.upperCol.optionValues.length).toBe(1);
    });

    it('test resetSettings for Rectangular mode', () => {
        const factorDataHighlightSettings = component['getFactorDataHighlightSettings']();
        factorDataHighlightSettings.lowerHighlightSettings = undefined;
        factorDataHighlightSettings.upperHighlightSettings = undefined;
        component.isTriangularMatrix$.next(false);

        expect(component.lowerCol.optionValues.length).toBe(1);
        expect(component.upperCol.optionValues.length).toBe(0);
    });
});
