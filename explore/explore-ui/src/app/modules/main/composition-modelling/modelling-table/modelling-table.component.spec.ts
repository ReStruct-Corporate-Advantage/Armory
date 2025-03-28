import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ModellingTableComponent} from './modelling-table.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {WhatIfPortfolio} from '@models/portfolio/what-if-portfolio.model';
import {ModellingTableOption} from '@enums/modelling-table-option.enum';
import {WorkspaceStore} from '../../../../stores';
import {BehaviorSubject} from 'rxjs';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {BaseWorkpad} from '@models/workspace/base-workpad.model';
import {FlatWorkpad} from '@models/workspace/flat-workpad.model';
import {PortfolioWithPositions} from '@models/portfolio/portfolio-with-positions.model';
import {CompositionSetting} from '@models/portfolio/composition/composition-setting.model';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {CustomFilter} from '@blk/explore-ui-breakdown';
import {CoreDefinitionStore, RiskModel} from '@blk/explore-ui-core';
import {ExposureSettings, RiskSettings} from '@blk/explore-ui-risk';

describe('ModellingTableComponent', () => {
    let component: ModellingTableComponent;
    let fixture: ComponentFixture<ModellingTableComponent>;

    beforeAll(() => {
        CoreDefinitionStore.riskModelList = [new RiskModel({
            Value: 'DEFAULT',
            Label: 'Organization Default'
        }), new RiskModel({
            Value: '^EMEAA',
            Label: 'BFRE Europe, Mid East & Africa'
        }), new RiskModel({
            'Value': '^NAMHA',
            'Label': 'STORM 2.0 North America Equity'
        }), new RiskModel({
            Value: '^USAMA',
            Label: 'BFRE US Equity'
        })];
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            declarations: [ModellingTableComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(ModellingTableComponent);
        component = fixture.componentInstance;
        component.portfolio = new WhatIfPortfolio();
        fixture.detectChanges();
    });

    it('tests toggleTableConfiguration', () => {
        component.showTableConfiguration = false;
        component.toggleTableConfiguration();
        expect(component.showTableConfiguration).toBeTruthy();
    });

    it('tests toggleExpansion', () => {
        component.expandModellingContainer = false;
        component.toggleExpansion();
        expect(component.expandModellingContainer).toBeTruthy();
    });

    it('tests setModellingTableOption', () => {
        component.setModellingTableOption(0);
        expect(component.selectedTableOption).toEqual(ModellingTableOption.CASH_OPTION);

        component.setModellingTableOption(1);
        expect(component.selectedTableOption).toEqual(ModellingTableOption.ADD_SECURITY_OPTION);

        component.portfolio.portfolioRiskSettings = new RiskSettings();
        component.portfolio.portfolioRiskSettings.exposureRiskSettings = new ExposureSettings();
        component.portfolio.portfolioRiskSettings.exposureRiskSettings.riskModel = 'DEFAULT';
        jest.spyOn(component['notificationService'], 'error');
        component.setModellingTableOption(2);
        expect(component['notificationService'].error).not.toHaveBeenCalled();

        component.portfolio.portfolioRiskSettings.exposureRiskSettings.riskModel = '^NAMHA';
        component.setModellingTableOption(2);
        expect(component['notificationService'].error).toHaveBeenCalled();

        component.setModellingTableOption(3);
        expect(component.selectedTableOption).toEqual(ModellingTableOption.DETAILS);
    });

    it('should close optimization', () => {
        component.resetModellingTableOption();
        expect(component.selectedTableOption).toEqual(null);
    });

    describe('tests showCompositionTableCallback', () => {
        it('should reset modelling table option for details type', () => {
            jest.spyOn(component.refreshComposition, 'emit');
            jest.spyOn(component, 'resetModellingTableOption');
            component.selectedTableOption = ModellingTableOption.DETAILS;
            component.showCompositionTableCallback();
            expect(component.refreshComposition.emit).toHaveBeenCalledWith({portfolio: component.portfolio});
            expect(component.resetModellingTableOption).toHaveBeenCalledTimes(1);
            expect(component.selectedTableOption).toBe(null);
        });

        it('should not reset modelling table option for optimization type', () => {
            jest.spyOn(component.refreshComposition, 'emit');
            jest.spyOn(component, 'resetModellingTableOption');
            component.selectedTableOption = ModellingTableOption.OPTIMIZATION;
            component.showCompositionTableCallback();
            expect(component.refreshComposition.emit).toHaveBeenCalledWith({portfolio: component.portfolio});
            expect(component.resetModellingTableOption).not.toHaveBeenCalled();
        });
    });

    it('should clear selectedSecurities', () => {
        component.selectedSecurities.set('testSecurity', null);
        component.resetModellingTableOption();
        expect(component.selectedSecurities.size === 0);
        expect(component.selectedTableOption).toEqual(null);
    });

    it('apply Setting test case', () => {
        component.showTableConfiguration = false;
        component.applySetting();

        // If user clicks cancel then just toggleTableConfiguration
        expect(component.showTableConfiguration).toBeTruthy();

        component.portfolioInput = new PortfolioWithPositions('IP');
        component.portfolioInput.compositionSetting = new CompositionSetting();
        component.portfolioInput.compositionSetting.showActiveInComposition = true;
        WorkspaceStore.currentPortfolio$ = new BehaviorSubject<Portfolio>(component.portfolioInput);
        WorkspaceStore.currentWorkpad$ = new BehaviorSubject<BaseWorkpad>(new FlatWorkpad());

        jest.spyOn(WorkspaceStore, 'replaceCurrentPortfolio');
        component.portfolioInput.filter = new CustomFilter();
        component.applySetting(true);
        expect(WorkspaceStore.replaceCurrentPortfolio).toHaveBeenCalled();

        component.portfolio.filter = null;
        component.applySetting(true);

        expect(WorkspaceStore.replaceCurrentPortfolio).toHaveBeenCalled();
        component.portfolioInput.compositionSetting.compositionFilter = new CustomFilter('Security');
        expect(WorkspaceStore.replaceCurrentPortfolio).toHaveBeenCalled();
    });

    it('tests clearSecurities', () => {
        component.selectedSecurities.set('dfd454', {cusip: 'dfd454', description: 'security_1', currentNotionalPct: 2, newNotionalPct: 5});
        jest.spyOn(component['changeDetectorRef'], 'detectChanges').mockImplementation(() => {});
        component.clearSecurities();
        expect(component.selectedSecurities.size).toBe(0);
        expect(component['changeDetectorRef'].detectChanges).toHaveBeenCalled();
    });

    it('tests resetComposition', () => {
        const mockFn = jest.fn().mockImplementation(() => { });
        component.resetComposition.emit = mockFn;
        component.resetButton();
        expect(component.resetComposition.emit).toHaveBeenCalledTimes(1);
    });
});
