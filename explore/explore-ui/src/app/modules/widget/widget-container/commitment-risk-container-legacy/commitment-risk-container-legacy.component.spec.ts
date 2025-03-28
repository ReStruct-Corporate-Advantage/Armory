import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CommitmentRiskContainerLegacyComponent} from './commitment-risk-container-legacy.component';
import {TestUtils} from '@utils/test.utils';
import {CUSTOM_ELEMENTS_SCHEMA, SimpleChanges} from '@angular/core';
import {Widget} from '@models/widget/widget.model';
import {WidgetConfigType, WidgetInputType} from '@blk/explore-ui-core';
import {FundCusip} from '@models/widget/inputs/fund-cusip.model';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {
    CommitmentHorizonSelectedTab
} from '@models/widget/inputs/commitment-risk/commitment-horizon-selected-tab.model';

describe('CommitmentRiskContainerLegacyComponent', () => {
    let component: CommitmentRiskContainerLegacyComponent;
    let fixture: ComponentFixture<CommitmentRiskContainerLegacyComponent>;

    beforeAll((done) => {
        TestUtils.initialize(done);
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [CommitmentRiskContainerLegacyComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(CommitmentRiskContainerLegacyComponent);
        component = fixture.componentInstance;
        component.widget = new Widget(WidgetConfigType.COMMITMENT_RISK_LEGACY);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('Test portfolio change', () => {
        jest.spyOn(component.notifyWidgetToRefresh$, 'emit');
        component.widget = new Widget(WidgetConfigType.COMMITMENT_RISK_LEGACY);
        component.fundCusip = 'BRS123';
        component.widget.dataStore.metaData.inputs.set(FundCusip.configType, new FundCusip('BRS123'));
        component.ngOnChanges({
            portfolio: {
                currentValue: new Portfolio('PEP'),
                previousValue: new Portfolio('OBSID')
            }
        } as any as SimpleChanges);
        expect(component.notifyWidgetToRefresh$.emit).toHaveBeenCalled();
        expect(component.fundCusip).toBeUndefined();
        expect(component.widget.dataStore.metaData.inputs.has(WidgetInputType.FUND_CUSIP)).toBeFalsy();
    });

    it('Test ngOnInit', () => {
        component.widget = new Widget(WidgetConfigType.COMMITMENT_RISK_LEGACY);
        component.widget.dataStore.metaData.inputs.set(FundCusip.configType, new FundCusip('BRS123'));
        component.ngOnInit();
        expect(component.isChartMode).toBeFalsy();
        expect(component.selectedTab).toEqual(component.widgetTabs[4]);
        component.widget = new Widget(WidgetConfigType.COMMITMENT_RISK_CHART_LEGACY);
        component.widget.dataStore.metaData.inputs.set(FundCusip.configType, new FundCusip('BRS123'));
        component.ngOnInit();
        expect(component.selectedTab).toEqual(component.widgetTabs[0]);
        expect(component.isChartMode).toBeTruthy();
        expect(component.fundCusip).toEqual('BRS123');
        component.widget.dataStore.metaData.inputs.set(CommitmentHorizonSelectedTab.configType, new CommitmentHorizonSelectedTab({selectedTab: 'distributions'}));
        component.ngOnInit();
        expect(component.selectedTab).toEqual(component.widgetTabs[2]);
    });

    it('Test onTabSelected', () => {
        component.widget = new Widget(WidgetConfigType.COMMITMENT_RISK_LEGACY);
        jest.spyOn(component.notifyWidgetToRefresh$, 'emit');
        component.selectedTab = component.widgetTabs[4];
        component.onTabSelected(({detail: component.widgetTabs[2]} as any) as CustomEvent);
        expect(component.selectedTab).toEqual(component.widgetTabs[2]);
        expect((component.widget.getCombinedInputs().get(CommitmentHorizonSelectedTab.configType) as CommitmentHorizonSelectedTab).selectedTab).toEqual(component.widgetTabs[2].uid);
        expect(component.isChartMode).toBeTruthy();
        expect(component.widget.configType).toEqual(WidgetConfigType.COMMITMENT_RISK_CHART_LEGACY);
        expect(component.notifyWidgetToRefresh$.emit).toHaveBeenCalled();
    });

    it('Test updateFundCusip', () => {
        jest.spyOn(component.notifyWidgetToRefresh$, 'emit');
        component.updateFundCusip('BRS234');
        expect(component.fundCusip).toEqual('BRS234');
        expect((component.widget.getCombinedInputs().get(FundCusip.configType) as FundCusip).cusip).toEqual('BRS234');
        expect(component.notifyWidgetToRefresh$.emit).toHaveBeenCalled();
    });
});
