import {Injectable} from '@angular/core';
import {OptimizationSettings} from '@models/portfolio/optimization/optimization-settings.model';
import {SettingsTab} from '@optimization-settings-configuration/models/settings-tab-data.model';
import {OptimizationSettingsService} from '@optimization-settings-configuration/service/optimization-settings.service';
import {OptimizationSettingsSerializerService as OptimizationSettingsSerializerService} from './optimization-settings-serializer.service';
import {OptimizationSettingsTransformerService} from './optimization-settings-transformer.service';
import {Subject} from 'rxjs';
import {ColumnConfig} from '@blk/explore-ui-core';
import {isEmpty, cloneDeep} from 'lodash';
import {WorkspaceStore} from '@stores/workspace.store';
import {PortfolioWithPositions} from '@models/portfolio/portfolio-with-positions.model';
import {RiskParityCase} from '@enums/risk-parity-case.enum';
import {InvestmentUniverseConstants} from '@constants/investment-universe.constants';

/**
 * This service is used for communication between the generic Optimization Settings module
 * and application specific Optimization Settings module.
 */
@Injectable({
    providedIn: 'root'
})
export class ExploreOptimizationSettingsService implements OptimizationSettingsService {
    constructor(private settingsSerializer: OptimizationSettingsSerializerService,
        private settingsTransformerService: OptimizationSettingsTransformerService) {}

    columnConfigSubject$ = new Subject<ColumnConfig>();

    loadSettings(): SettingsTab[] {
        const optimizationSettings: OptimizationSettings = this.settingsSerializer.read();

        return this.settingsTransformerService.settingsToTabs(optimizationSettings);
    }

    /**
     * loads risk parity settings
     */
    loadRiskParitySettings(): SettingsTab[] {
        const riskParitySettings = cloneDeep((WorkspaceStore.getCurrentPortfolio() as PortfolioWithPositions).riskParitySettings);
        if (isEmpty(riskParitySettings.investmentUniverseSettings.investmentUniverse)) {
            riskParitySettings.investmentUniverseSettings = this.settingsSerializer.read().investmentUniverseSettings;
        }
        const settingsTab: SettingsTab[] = this.settingsTransformerService.riskSettingsToTabs(riskParitySettings);
        if (riskParitySettings.riskParityCase === RiskParityCase.ABSOLUTE) {
            riskParitySettings.investmentUniverseSettings.investmentUniverse = riskParitySettings.investmentUniverseSettings.investmentUniverse.filter(investmentUniverseItem => (investmentUniverseItem.type !== InvestmentUniverseConstants.BENCHMARK));
        }
        this.saveRiskParitySettings(settingsTab, riskParitySettings.riskParityCase);
        return settingsTab;
    }

    saveSettings(settingsTabs: SettingsTab[]): boolean {
        return this.settingsSerializer.write(this.settingsTransformerService.tabsToSettings(settingsTabs));
    }

    /**
     * saves risk parity settings
     */
    saveRiskParitySettings(settingsTabs: SettingsTab[], riskParityCase?: RiskParityCase): boolean {
        return this.settingsSerializer.writeRiskParity(this.settingsTransformerService.tabsToSettingsRiskParity(settingsTabs, riskParityCase));
    }
}
