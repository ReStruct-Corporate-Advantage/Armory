import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CoverageMeasureSelectionComponent} from './coverage-measure-selection.component';
import {WidgetConfigType} from '../../../../../../explore-ui-core/src/widget-config/enums';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {CoreWidgetConfigStore} from '../../../../../../explore-ui-core/src/widget-config/core-widget-config.store';
import {WidgetConfig} from '../../../../../../explore-ui-core/src/widget-config/models/widget-config.model';
import {ColumnOptionInitializer} from '../../../../column-option.initializer';
import * as riskExposureConfig from '../../../../test-utils/widget-configs/risk-and-exposure-widget.json';

describe('CoverageMeasureSelectionComponent', () => {
    let component: CoverageMeasureSelectionComponent;
    let fixture: ComponentFixture<CoverageMeasureSelectionComponent>;

    beforeAll(() => {
        ColumnOptionInitializer.initializeConfig();
        CoreWidgetConfigStore.chartConfig.set(WidgetConfigType.RISK_EXPOSURE, new WidgetConfig(riskExposureConfig));
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [CoverageMeasureSelectionComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });
        fixture = TestBed.createComponent(CoverageMeasureSelectionComponent);
        component = fixture.componentInstance;

        component.widgetType = WidgetConfigType.RISK_EXPOSURE;

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
