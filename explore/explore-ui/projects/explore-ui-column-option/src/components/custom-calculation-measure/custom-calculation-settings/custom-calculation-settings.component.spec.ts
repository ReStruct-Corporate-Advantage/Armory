import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {
    ColumnConfig,
    CoreTestUtils,
    CoreWidgetConfigStore,
    WidgetConfig,
    WidgetConfigType,
} from '@blk/explore-ui-core';
import {of} from 'rxjs';
import {ColumnOptionInitializer} from '../../../column-option.initializer';
import {CustomCalculationConstants} from '../../../constants';
import {SelectedColumnSelectorOption} from '../../../models/ui/selected-column-selector-option.model';
import {ColumnOptionService} from '../../../services/column-option.service';
import {ColumnOptionTestUtils} from '../../../test-utils/column-option-test.utils';
import * as riskExposureConfig from '../../../test-utils/widget-configs/risk-and-exposure-widget.json';
import {DERIVED_COLUMN_OPTION_SERVICE_TOKEN} from '../../../tokens';
import {CustomCalculationSettingsComponent} from './custom-calculation-settings.component';

describe('CustomCalculationSettingsComponent', () => {
    let component: CustomCalculationSettingsComponent;
    let fixture: ComponentFixture<CustomCalculationSettingsComponent>;

    const columnOptionsServiceMock = {
        fetchColumnOptions$: jest.fn(() => of([{
            colTag: 'pct_mv',
            use: 'PORT',
            options: []
        }]))
    };

    const derivedColumnOptionsServiceMock = {
        updateColumnWithDerivedSettings: jest.fn(),
        getOptionDefinitions: jest.fn()
    };

    /**
     * Performs required initialisation before any test is run
     */
    beforeAll(() => {
        CoreTestUtils.initDefinitions();
        ColumnOptionInitializer.registerColumnConfigTypes();
        ColumnOptionInitializer.registerColumnOptionTypes();

        TestBed.configureTestingModule({
            declarations: [CustomCalculationSettingsComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {provide: ColumnOptionService, useValue: columnOptionsServiceMock},
                {provide: DERIVED_COLUMN_OPTION_SERVICE_TOKEN, useValue: derivedColumnOptionsServiceMock},
            ]
        });

        fixture = TestBed.createComponent(CustomCalculationSettingsComponent);
        component = fixture.componentInstance;

        const widgetConfig = new WidgetConfig(riskExposureConfig);
        component.widgetConfigInput = widgetConfig.inputCategories[0].inputs[0];
        component.widgetType = WidgetConfigType.RISK_EXPOSURE;
        CoreWidgetConfigStore.chartConfig.set(WidgetConfigType.RISK_EXPOSURE, widgetConfig);
        component.inputs = ColumnOptionTestUtils.getWidgetInputMap();

        component.isApplyButtonDisabled = {value: 0};
        component.enableOptoPrompt = true;

        component.ngOnInit();
    });

    it('tests isColumnOptionRequired', () => {
        component.isCustomCalcPromptOpen = false;
        const columnSelectorOption: SelectedColumnSelectorOption = new SelectedColumnSelectorOption(ColumnConfig.createColumn(CustomCalculationConstants.CUSTOM_CALCULATION), []);
        component.singleSelectionAllowed = true;
        const isColOptionRequired: boolean = component['isColumnOptionRequired']([columnSelectorOption]);
        expect(component.isCustomCalcPromptOpen).toBeTruthy();
        expect(isColOptionRequired).toBeTruthy();
    });

    it('tests closeCustomCalcNotifyModal', () => {
        component.isCustomCalcPromptOpen = true;
        component.closeCustomCalcNotifyModal();
        expect(component.isCustomCalcPromptOpen).toBeFalsy();
    });
});
