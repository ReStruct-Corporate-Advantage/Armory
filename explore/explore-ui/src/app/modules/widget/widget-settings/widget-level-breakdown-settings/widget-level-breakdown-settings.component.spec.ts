import {ComponentFixture, TestBed} from '@angular/core/testing';

import {WidgetLevelBreakdownSettingsComponent} from './widget-level-breakdown-settings.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {TestUtils} from '@utils/test.utils';
import {WidgetConfigType} from '@blk/explore-ui-core';

describe('WidgetLevelBreakdownSettingsComponent', () => {
    let component: WidgetLevelBreakdownSettingsComponent;
    let fixture: ComponentFixture<WidgetLevelBreakdownSettingsComponent>;

    beforeAll((done) => {
        TestUtils.initialize(done);
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [WidgetLevelBreakdownSettingsComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(WidgetLevelBreakdownSettingsComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('tests initializeComponent - showFundSectoring & includePerformanceBreakdown are initialized correctly', () => {
        component.widgetConfigInput = {} as any;
        component.widgetConfigInput.hideFundSectoringTabs = true;
        component.widgetType = WidgetConfigType.RISK_EXPOSURE;
        component.initializeComponent();
        expect(component.breakdownBuilderSettings.showFundSectoringTabs).toBeFalsy();
        expect(component.breakdownBuilderSettings.includePerformanceBreakdown).toBeFalsy();

        component.widgetConfigInput.hideFundSectoringTabs = false;
        component.widgetType = WidgetConfigType.RETURNS;
        component.initializeComponent();
        expect(component.breakdownBuilderSettings.showFundSectoringTabs).toBeTruthy();
        expect(component.breakdownBuilderSettings.includePerformanceBreakdown).toBeTruthy();

        component.favoriteType = 'FAC_BKD';
        component.widgetType = WidgetConfigType.PRA;
        component.initializeComponent();
        expect(component.breakdownBuilderSettings.includeNoBreakdownOption).toBeFalsy();
    });
});
