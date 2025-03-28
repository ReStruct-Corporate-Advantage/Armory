import {ComponentFixture, TestBed} from '@angular/core/testing';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {PortfolioSettingsModalComponent} from './portfolio-settings-modal.component';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {WorkspaceStore} from '../../stores';
import {BehaviorSubject} from 'rxjs';
import {BaseWorkpad} from '@models/workspace/base-workpad.model';
import {FlatWorkpad} from '@models/workspace/flat-workpad.model';
import {CompositionDataService} from '../main/composition-modelling/services/composition-data.service';
import {AppStore} from '../../app.store';
import {AttributionSettings, PerformanceSettings, TokenConstants, TokenUtils} from '@blk/explore-ui-core';
import {DecisionBenchmarkService} from '@services/widget/decision-benchmark-service';
import {MultiManagerUtils} from '@utils/multi-manager.utils';

describe('PortfolioSettingsModalComponent', () => {
    let component: PortfolioSettingsModalComponent;
    let fixture: ComponentFixture<PortfolioSettingsModalComponent>;
    const compositionDataServiceStub = {
        applyInputAfterCompositionRuleValidation: jest.fn()
    };

    let decisionBenchmarkServiceStub: jest.Mocked<DecisionBenchmarkService>;



    beforeEach(() => {
        decisionBenchmarkServiceStub = {
            validateDecisionBenchmarks:jest.fn()
        } as unknown as jest.Mocked<DecisionBenchmarkService>;

        jest.spyOn(TokenUtils, 'isFeatureEnabled').mockImplementation((token) => {
            return token === TokenConstants.EXPLORE_ENABLE_MULTI_MANAGER;
        });

        TestBed.configureTestingModule({
            declarations: [PortfolioSettingsModalComponent],
            schemas: [NO_ERRORS_SCHEMA],
            providers: [
                {provide: CompositionDataService, useValue: compositionDataServiceStub},
                {provide: AppStore},
                {provide: DecisionBenchmarkService, useValue: decisionBenchmarkServiceStub}
            ]
        });

        fixture = TestBed.createComponent(PortfolioSettingsModalComponent);
        component = fixture.componentInstance;
        component.portfolio = new Portfolio();
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
        expect(component.selectedOption).toEqual('0');
    });

    it('ngOnInit test', () => {
        jest.spyOn(TokenUtils, 'isFeatureEnabled').mockImplementation((token) => {
            if (token === TokenConstants.EXPLORE_ENABLE_MULTI_MANAGER) {
                return true;
            }
            return false;
        });

        component.portfolio.portName = 'portName';
        component.ngOnInit();
        expect(component.populatedName).toBe('portName');
        expect(component.isWhatIfPortfolio).toBeFalsy();
        expect(component.showAdvancedAttributionSettings).toBeDefined();
        expect(component.showAdvancedAttributionSettings).not.toBeNull();

        component.portfolio.title = 'portTitle';
        component.ngOnInit();
        expect(component.populatedName).toBe('portTitle');
        expect(component.isWhatIfPortfolio).toBeFalsy();
        expect(component.showFilterScalingOptions).toBeTruthy();

        expect(component.isMultiManagerEnabled).toBe(true);
        expect(component.portfolioSettingsTabData).toContainEqual({
            'label': component.MULTI_MANAGER,
            'uid': '6'
        });
    });

    it('tests onTabSelected', () => {
        component.onTabSelected({detail: {uid: '0'}});
        expect(component.selectedOption === '0').toBeTruthy();
        component.onTabSelected({detail: {uid: '1'}});
        expect(component.selectedOption === '1').toBeTruthy();
    });

    it('tests onValueChanged', () => {
        const event = {detail: {value: 'PEP1'}};
        component.onValueChanged(event as CustomEvent);
        expect(component.clonedPortfolio.title).toBe('PEP1');
    });

    describe('closeModal Test', () => {
        it('should update currentPortfolio if apply was clicked', () => {
            WorkspaceStore.currentPortfolio$ = new BehaviorSubject<Portfolio>(new Portfolio('IP'));
            WorkspaceStore.currentWorkpad$ = new BehaviorSubject<BaseWorkpad>(new FlatWorkpad());
            component.portfolio = new Portfolio('PEP');
            jest.spyOn(component.modalClosed, 'emit').mockClear();
            jest.spyOn(component['notificationService'], 'invokeWidgetReloadPrompt')
                .mockClear()
                .mockImplementation(() => {});

            // #1 - triggerWidgetReloadEvents set to true (default)
            component.closeModal(true);
            expect(component.modalClosed.emit).toHaveBeenCalledTimes(1);
            expect(component['notificationService'].invokeWidgetReloadPrompt).toHaveBeenCalled();

            // #2 - triggerWidgetReloadEvents passed as false
            jest.spyOn(component['notificationService'], 'invokeWidgetReloadPrompt').mockClear();
            component.triggerWidgetReloadEvents = false;
            component.closeModal(true);
            expect(component.modalClosed.emit).toHaveBeenCalledTimes(2);
            expect(component['notificationService'].invokeWidgetReloadPrompt).not.toHaveBeenCalled();
        });

        it('should close modal', () => {
            jest.spyOn(component.modalClosed, 'emit');
            component.closeModal();

            expect(component.selectedOption).toBe('0');
            expect(component.isOpen).toBeFalsy();
            expect(component.modalClosed.emit).toHaveBeenCalled();
        });

        it('should return if multi manager if decision bench map not set correctly', () => {
            component.clonedPortfolio.decisionLevelsConfig.decisionBenchMap = new Map<string, string>([
                ['path1', 'benchmark1'],
                ['path2', 'benchmark2']
            ]);
            jest.spyOn(component.modalClosed, 'emit').mockClear();
            jest.spyOn(MultiManagerUtils, 'isValidDecisionBenchConfig')
                .mockReturnValue(false);

            // #1 - triggerWidgetReloadEvents set to true (default)
            component.closeModal(true);
            expect(component.modalClosed.emit).toHaveBeenCalledTimes(0);
        });
    });

    it('should populate original telemetry parameters for portfolio inputs when closeModal is called with apply', () => {
        WorkspaceStore.currentPortfolio$ = new BehaviorSubject<Portfolio>(new Portfolio('IP'));
        WorkspaceStore.currentWorkpad$ = new BehaviorSubject<BaseWorkpad>(new FlatWorkpad());
        component.portfolio = new Portfolio('PEP');
        component.portfolio.performanceSettings = new PerformanceSettings();
        component.portfolio.performanceSettings.attributionSettings = new AttributionSettings();
        component.clonedPortfolio = new Portfolio('PEP');
        component.clonedPortfolio.performanceSettings.attributionSettings.assetType = 'MULTI_ASSET';
        jest.spyOn(MultiManagerUtils, 'isValidDecisionBenchConfig').mockReturnValue(true);
        component.closeModal(true);

        expect(component.displaySettingsOnDone.details.get('PerformanceSettings_assetType_original')).toBe('');
        expect(component.displaySettingsOnDone.details.get('PerformanceSettings_assetType')).toBe('MULTI_ASSET');

        component.clonedPortfolio.performanceSettings.attributionSettings.assetType = 'FIXED_INCOME';

        component.closeModal(true);

        expect(component.displaySettingsOnDone.details.get('PerformanceSettings_assetType_original')).toBe('MULTI_ASSET');
        expect(component.displaySettingsOnDone.details.get('PerformanceSettings_assetType')).toBe('FIXED_INCOME');
    });
});
