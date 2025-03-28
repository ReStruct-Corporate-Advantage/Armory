import {SettingsTab} from '../models/settings-tab-data.model';
import {RiskParityCase} from '@enums/risk-parity-case.enum';

export interface OptimizationSettingsService {

    loadSettings(): SettingsTab[];

    loadRiskParitySettings(): SettingsTab[];

    saveSettings(settings: SettingsTab[]): boolean;

    saveRiskParitySettings(settings: SettingsTab[], riskParityCase?: RiskParityCase): boolean;
}
