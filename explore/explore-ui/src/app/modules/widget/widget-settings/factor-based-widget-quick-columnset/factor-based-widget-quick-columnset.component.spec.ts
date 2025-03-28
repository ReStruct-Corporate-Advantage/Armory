import {ComponentFixture, TestBed} from '@angular/core/testing';
import {FactorBasedWidgetQuickColumnsetComponent} from './factor-based-widget-quick-columnset.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {Widget} from '@models/widget/widget.model';
import {TestUtils} from '@utils/test.utils';
import {RiskConstants} from '@constants/risk.constants';
import {WidgetSettingsStore} from '../widget-settings.store';
import {Subject} from 'rxjs';
import {WidgetConfigType} from '@blk/explore-ui-core';

describe('FactorBasedWidgetQuickColumnsetComponent', () => {
    let component: FactorBasedWidgetQuickColumnsetComponent;
    let fixture: ComponentFixture<FactorBasedWidgetQuickColumnsetComponent>;

    let widget: Widget;
    const widgetSettingsStoreStub = {
        quickColumnSetChanged$: new Subject(),
        groupingTypeChanged$: new Subject()
    };

    beforeAll((done) => {
        TestUtils.initialize(done);
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [FactorBasedWidgetQuickColumnsetComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [{provide: WidgetSettingsStore, useValue: widgetSettingsStoreStub}]
       });

       fixture = TestBed.createComponent(FactorBasedWidgetQuickColumnsetComponent);
        component = fixture.componentInstance;
        widget = new Widget(WidgetConfigType.PRA);
        component.inputs = widget.dataStore.metaData.inputs;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('setGroupingType Test', () => {
        it('should set Grouping Type', () => {
            jest.spyOn(component['widgetSettingsStore'].groupingTypeChanged$, 'next');
            let groupingType = {
                label: 'Factor',
                value: RiskConstants.PRA_GROUPING_TYPE['FACTOR'],
                matchingRiskCategory: RiskConstants.MATCHING_RISK_CATEGORIES['BELONGS_TO_FACTOR_REPORT'],
            };
            component.setGroupingType(groupingType);
            expect(component.riskColumnSettings.showSecurities).toBeFalsy();
            expect(component.riskColumnSettings.disableSectorBreakdown).toBeTruthy();
            expect(component.riskColumnSettings.disableFactorBreakdown).toBeFalsy();
            expect(component.riskColumnSettings.isPortGroupSummaryRequest).toBeFalsy();
            expect(component.riskColumnSettings.groupingTypeSelected).toStrictEqual(groupingType);
            expect(component['widgetSettingsStore'].groupingTypeChanged$.next).toHaveBeenCalledTimes(0);

            groupingType =  {
                label: 'Sector to Factor',
                value: RiskConstants.PRA_GROUPING_TYPE['SECTOR_TO_FACTOR'],
                matchingRiskCategory: RiskConstants.MATCHING_RISK_CATEGORIES['BELONGS_TO_SECTOR_TO_FACTOR_REPORT']
            };
            component.setGroupingType(groupingType);
            expect(component.riskColumnSettings.showSecurities).toBeFalsy();
            expect(component.riskColumnSettings.disableSectorBreakdown).toBeFalsy();
            expect(component.riskColumnSettings.disableFactorBreakdown).toBeFalsy();
            expect(component.riskColumnSettings.isPortGroupSummaryRequest).toBeFalsy();
            expect(component.riskColumnSettings.groupingTypeSelected).toStrictEqual(groupingType);
            expect(component['widgetSettingsStore'].groupingTypeChanged$.next).toHaveBeenCalledTimes(1);
            expect(component['widgetSettingsStore'].groupingTypeChanged$.next).toHaveBeenLastCalledWith(groupingType.matchingRiskCategory);
        });
    })

});
