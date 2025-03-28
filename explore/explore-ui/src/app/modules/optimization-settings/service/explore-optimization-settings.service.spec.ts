import {TestBed} from '@angular/core/testing';
import {ExploreOptimizationSettingsService} from './explore-optimization-settings.service';
import {OptimizationSettingsSerializerService} from './optimization-settings-serializer.service';
import {OptimizationSettingsTransformerService} from './optimization-settings-transformer.service';
import {SettingsTab} from '@optimization-settings-configuration/models/settings-tab-data.model';
import {OptimizationSettings} from '@models/portfolio/optimization/optimization-settings.model';
import {RiskParitySettings} from '@models/portfolio/optimization/risk-parity-settings.model';
import {PortfolioWithPositions} from '@models/portfolio/portfolio-with-positions.model';
import {WorkspaceStore} from '@stores/workspace.store';
import {InvestmentUniversePortfolio} from '@models/portfolio/investmentUniverse/investment-universe-portfolio.model';

describe('ExploreOptimizationSettingsService', () => {
    let service: ExploreOptimizationSettingsService;
    let settingsSerializer: OptimizationSettingsSerializerService;
    let settingsTransformerService: OptimizationSettingsTransformerService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [{
                provide: OptimizationSettingsSerializerService,
                useValue: {
                    read: jest.fn().mockReturnValue(new RiskParitySettings()),
                    write: jest.fn(),
                    writeRiskParity: jest.fn()
                }
            }, {
                provide: OptimizationSettingsTransformerService,
                useValue: {
                    settingsToTabs: jest.fn(),
                    tabsToSettings: jest.fn(),
                    riskSettingsToTabs: jest.fn(),
                    tabsToSettingsRiskParity: jest.fn()
                }
            }]
        });
        service = TestBed.inject(ExploreOptimizationSettingsService);
        settingsSerializer = TestBed.inject(OptimizationSettingsSerializerService);
        settingsTransformerService = TestBed.inject(OptimizationSettingsTransformerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should loadSettings', () => {
        const optimizationSettings: OptimizationSettings = new OptimizationSettings();
        jest.spyOn(settingsSerializer, 'read').mockReturnValue(optimizationSettings);
        const settingsToTabsSpy = jest.spyOn(settingsTransformerService, 'settingsToTabs');
        const settingsTabs: SettingsTab[] = [{
            name: 'name',
            type: 'type',
            component: undefined
        }];
        settingsToTabsSpy.mockReturnValue(settingsTabs);

        expect(service.loadSettings()).toEqual(settingsTabs);
        expect(settingsToTabsSpy).toHaveBeenCalledTimes(1);
        expect(settingsToTabsSpy).toHaveBeenCalledWith(optimizationSettings);
    });

    it('should saveSettings', () => {
        const tabsToSettingsSpy = jest.spyOn(settingsTransformerService, 'tabsToSettings');
        const writeSpy = jest.spyOn(settingsSerializer, 'write');
        const settingsTabs: SettingsTab[] = [{
            name: 'name',
            type: 'type',
            component: undefined
        }];
        const optimizationSettings: OptimizationSettings = new OptimizationSettings();
        tabsToSettingsSpy.mockReturnValue(optimizationSettings);
        writeSpy.mockReturnValue(true);

        expect(service.saveSettings(settingsTabs)).toBe(true);
        expect(writeSpy).toHaveBeenCalledTimes(1);
        expect(writeSpy).toHaveBeenCalledWith(optimizationSettings);
        expect(tabsToSettingsSpy).toHaveBeenCalledTimes(1);
        expect(tabsToSettingsSpy).toHaveBeenCalledWith(settingsTabs);
    });

    it('should load risk parity Settings', () => {
        const riskParitySettings: RiskParitySettings = new RiskParitySettings();
        const port = new PortfolioWithPositions();
        port.riskParitySettings = riskParitySettings;
        jest.spyOn(WorkspaceStore, 'getCurrentPortfolio').mockReturnValue(port);
        const settingsToTabsSpy = jest.spyOn(settingsTransformerService, 'riskSettingsToTabs');
        const settingsTabs: SettingsTab[] = [{
            name: 'name',
            type: 'type',
            component: undefined
        }];
        settingsToTabsSpy.mockReturnValue(settingsTabs);

        expect(service.loadRiskParitySettings()).toEqual(settingsTabs);
        expect(settingsToTabsSpy).toHaveBeenCalledTimes(1);
        expect(settingsToTabsSpy).toHaveBeenCalledWith(riskParitySettings);
        port.riskParitySettings.investmentUniverseSettings.investmentUniverse.push(new InvestmentUniversePortfolio());
        riskParitySettings.investmentUniverseSettings.investmentUniverse.push(new InvestmentUniversePortfolio());
        expect(service.loadRiskParitySettings()).toEqual(settingsTabs);
        expect(settingsToTabsSpy).toHaveBeenCalledWith(riskParitySettings);
    });

    it('should save risk parity Settings', () => {
        const tabsToSettingsSpy = jest.spyOn(settingsTransformerService, 'tabsToSettingsRiskParity');
        const writeSpy = jest.spyOn(settingsSerializer, 'writeRiskParity');
        const settingsTabs: SettingsTab[] = [{
            name: 'name',
            type: 'type',
            component: undefined
        }];
        const riskParitySettings: RiskParitySettings = new RiskParitySettings();
        tabsToSettingsSpy.mockReturnValue(riskParitySettings);
        writeSpy.mockReturnValue(true);

        expect(service.saveRiskParitySettings(settingsTabs)).toBe(true);
        expect(writeSpy).toHaveBeenCalledTimes(1);
        expect(writeSpy).toHaveBeenCalledWith(riskParitySettings);
        expect(tabsToSettingsSpy).toHaveBeenCalledTimes(1);
        expect(tabsToSettingsSpy).toHaveBeenCalledWith(settingsTabs, undefined);
    });
});
