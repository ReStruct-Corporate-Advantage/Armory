import {CUSTOM_ELEMENTS_SCHEMA, SimpleChanges} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {TestUtils} from '@utils/test.utils';
import {CommitmentRiskContainerComponent} from './commitment-risk-container.component';
import {WidgetConfigType, WidgetInputType} from '@blk/explore-ui-core';
import {Widget} from '@models/widget/widget.model';
import {FundCusip} from '@models/widget/inputs/fund-cusip.model';
import {
    CommitmentHorizonSelectedTab
} from '@models/widget/inputs/commitment-risk/commitment-horizon-selected-tab.model';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {WorkspaceStore} from '@stores/workspace.store';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {FetchSecuritiesDataService} from '@services/widget/fetch-securities-data-service';
import {CommitmentRiskScenario} from '@models/widget/inputs/commitment-risk/commitment-risk-scenario.model';

describe('CommitmentRiskContainerComponent Test', () => {
    let component: CommitmentRiskContainerComponent;
    let fixture: ComponentFixture<CommitmentRiskContainerComponent>;

    WorkspaceStore.currentPortfolio$ = new BehaviorSubject<Portfolio>(new Portfolio('PEP'));

    const fetchSecuritiesDataServiceStub = {
        fetchPortfolioSecurities: jest.fn((): Observable<{secDesc: any; cusip: any}[]> => {
            return of([
                {secDesc: 'Security Description 1', cusip: 'BRS123'},
                {secDesc: 'Security Description 2', cusip: 'BRS234'},
                {secDesc: 'Security Description 3', cusip: 'BRS345'}]);
        })
    };

    beforeAll((done) => {
        TestUtils.initialize(done);
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [CommitmentRiskContainerComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {provide: FetchSecuritiesDataService, useValue: fetchSecuritiesDataServiceStub}
            ]
        });

        fixture = TestBed.createComponent(CommitmentRiskContainerComponent);
        component = fixture.componentInstance;
        component.widget = new Widget(WidgetConfigType.COMMITMENT_RISK);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('Test portfolio change', () => {
        jest.spyOn(component.notifyWidgetToRefresh$, 'emit');
        component.widget = new Widget(WidgetConfigType.COMMITMENT_RISK);
        component.fundCusip = 'BRS123';
        component.widget.dataStore.metaData.inputs.set(FundCusip.configType, new FundCusip('BRS123'));
        component.ngOnChanges({portfolio: {currentValue: new Portfolio('PEP'), previousValue: new Portfolio('OBSID')}} as any as SimpleChanges);
        expect(component.fundCusip).toBeUndefined();
        expect(component.widget.dataStore.metaData.inputs.has(WidgetInputType.FUND_CUSIP)).toBeTruthy();
        expect((component.widget.dataStore.metaData.inputs.get(WidgetInputType.FUND_CUSIP) as FundCusip).cusip).toBeUndefined();
    });

    it('Test ngOnInit', () => {
        component.widget = new Widget(WidgetConfigType.COMMITMENT_RISK);
        component.widget.dataStore.metaData.inputs.set(FundCusip.configType, new FundCusip('BRS123'));
        component.widget.dataStore.metaData.inputs.set(WidgetInputType.COMMITMENT_RISK_SCENARIO, new CommitmentRiskScenario('BASE'));
        component.selectedTab = undefined;
        component.ngOnInit();
        expect(component.isChartMode).toBeFalsy();
        expect(component.selectedTab).toEqual(component.widgetTabs[4]);
        component.widget = new Widget(WidgetConfigType.COMMITMENT_RISK_CHART);
        component.selectedTab = undefined;
        component.ngOnInit();
        expect(component.selectedTab).toEqual(component.widgetTabs[0]);
        expect(component.isChartMode).toBeTruthy();
        expect(component.fundCusip).toEqual(undefined);
        component.widget.dataStore.metaData.inputs.set(FundCusip.configType, new FundCusip('BRS123'));
        component.selectedTab = undefined;
        component.ngOnInit();
        expect(component.selectedTab).toEqual(component.widgetTabs[0]);
        expect(component.isChartMode).toBeTruthy();
        expect(component.fundCusip).toEqual('BRS123');
        component.widget.dataStore.metaData.inputs.set(CommitmentHorizonSelectedTab.configType, new CommitmentHorizonSelectedTab({selectedTab: 'acrm_proj_dist'}));
        component.selectedTab = undefined;
        component.ngOnInit();
        expect(component.selectedTab).toEqual(component.widgetTabs[2]);
    });

    it('Test onTabSelected', () => {
        component.widget = new Widget(WidgetConfigType.COMMITMENT_RISK);
        jest.spyOn(component.notifyWidgetToRefresh$, 'emit');
        component.selectedTab = component.widgetTabs[4];
        component.onTabSelected(({detail: component.widgetTabs[2]} as any) as CustomEvent);
        expect(component.selectedTab).toEqual(component.widgetTabs[2]);
        expect((component.widget.getCombinedInputs().get(CommitmentHorizonSelectedTab.configType) as CommitmentHorizonSelectedTab).selectedTab).toEqual(component.widgetTabs[2].uid);
        expect(component.isChartMode).toBeTruthy();
        expect(component.widget.configType).toEqual(WidgetConfigType.COMMITMENT_RISK_CHART);
        expect(component.notifyWidgetToRefresh$.emit).toHaveBeenCalled();
    });

    it('Test updateFundCusip', () => {
        component.updateFundCusip('BRS234');
        expect(component.fundCusip).toEqual('BRS234');
        expect((component.widget.getCombinedInputs().get(FundCusip.configType) as FundCusip).cusip).toEqual('BRS234');
    });

    it('should show warning banner when excludedFundsNumber is not undefined and greater than 0', () => {
        component._widgetPayload = {
            responseConfig: {
                footerDetails: {
                    missingExposures: {
                        'excluded_funds_number': '5'
                    }
                }
            }
        };
        expect(component.showWarningBanner()).toBeTruthy();
        component._widgetPayload = {
            responseConfig: {
                footerDetails: {
                    missingExposures: {
                        'excluded_funds_number': 5
                    }
                }
            }
        };
        expect(component.showWarningBanner()).toBeTruthy();
    });

    it('should not show warning banner when excludedFundsNumber is undefined', () => {
        component._widgetPayload = {
            responseConfig: {
                footerDetails: {
                    missingExposures: {
                        'excluded_funds_number': undefined
                    }
                }
            }
        };
        expect(component.showWarningBanner()).toBeFalsy();
    });

    it('should not show warning banner when excludedFundsNumber is 0', () => {
        component._widgetPayload = {
            responseConfig: {
                footerDetails: {
                    missingExposures: {
                        'excluded_funds_number': '0'
                    }
                }
            }
        };
        expect(component.showWarningBanner()).toBeFalsy();
        component._widgetPayload = {
            responseConfig: {
                footerDetails: {
                    missingExposures: {
                        'excluded_funds_number': 0
                    }
                }
            }
        };
        expect(component.showWarningBanner()).toBeFalsy();
    });
});
