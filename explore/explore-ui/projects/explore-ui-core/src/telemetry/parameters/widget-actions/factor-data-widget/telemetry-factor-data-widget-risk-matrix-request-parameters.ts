import {isObject} from 'lodash';
import {TelemetryFactorParameters} from './telemetry-factor-parameters';
import {FactorDataAnalytic} from '../../../enums';

/**
 * TelemetryFactorDataWidgetRiskMatrixRequestParameters captures information related to all widget settings for Factor Data widget - Risk Matrix mode
 */
export class TelemetryFactorDataWidgetRiskMatrixRequestParameters {
    factorAnalytic: FactorDataAnalytic;
    riskSettingsChanged: boolean;
    factorColumnsList: TelemetryFactorParameters[] = [];
    triangularMatrix: boolean;
    comparisonMode: boolean;
    showChangeUpperTriangle: boolean;
    conditionalFormattingEnabled: boolean;

    /**
     * Constructor.
     */
    constructor(data?: any) {
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * Deserialize.
     */
    deserialize(data: any): void {
        // Get out of here if there is no data.
        if (!data) {
            return;
        }
        this.factorAnalytic = data.factorAnalytic;
        this.riskSettingsChanged = data.riskSettingsChanged;
        this.factorColumnsList = data.factorColumnsList;
        this.triangularMatrix = data.triangularMatrix;
        this.comparisonMode = data.comparisonMode;
        this.showChangeUpperTriangle = data.showChangeUpperTriangle;
        this.conditionalFormattingEnabled = data.conditionalFormattingEnabled;
    }
}
