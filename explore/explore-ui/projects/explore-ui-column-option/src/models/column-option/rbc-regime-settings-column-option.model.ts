import {isObject} from 'lodash';
import {
    AbstractColumnOption,
    ColumnOptionValidatorInterface,
    ExploreInputValidationInfo,
    NotificationType,
    RbcRegimeSettings,
    SerializeFavoriteType, WidgetTitleModifiable
} from '@blk/explore-ui-core';

/**
 * Model for Risk Based Capital Regime settings column option
 */
export class RbcRegimeSettingsColumnOption extends AbstractColumnOption implements ColumnOptionValidatorInterface, WidgetTitleModifiable {
    public static CONFIG_TYPE = 'rbcRegimeSettingsColumnOption';

    public static INVALID_RBC_REGIME_SETTINGS_MESSAGE = 'Risk Based Capital (RBC) data requires that a RBC regime and risk factor be selected. Please update these selections in the risk settings menu of widget settings.';

    public static RBC_RISK_FACTOR_SETTINGS = 'rbcRiskFactorSettings';

    public regimeSelection: RbcRegimeSettings;

    constructor(data?: any) {
        super();
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * Gets the type of the config object
     */
    get configType(): string {
        return RbcRegimeSettingsColumnOption.CONFIG_TYPE;
    }

    /**
     * Adds RBC regime settings to a column's option values for requests
     */
    doAddRequestParams(requestParams: any) {
        requestParams.rbcRegime = this.regimeSelection.serialize();
    }

    deserialize(data: any): void {
        this.regimeSelection = new RbcRegimeSettings(data);
    }

    /**
     * Serialize object into JSON format for saving
     */
    doSerialize(_isNested?: boolean | SerializeFavoriteType): any {
        return this.regimeSelection.serialize();
    }

    /**
     * Equals method
     */
    equals(otherColOption: AbstractColumnOption): boolean {
        if (!(otherColOption instanceof RbcRegimeSettingsColumnOption)) {
            return false;
        }
        return this.regimeSelection?.equals(otherColOption.regimeSelection);
    }

    /**
     * Returns true if the regime column option is valid
     */
    isValid(): boolean {
        return this.regimeSelection?.isValid();
    }

    isValidColumnOption(): ExploreInputValidationInfo {
        if (!this.isValid()) {
            return new ExploreInputValidationInfo(NotificationType.ERROR, RbcRegimeSettingsColumnOption.INVALID_RBC_REGIME_SETTINGS_MESSAGE);
        }
    }

    /**
     * Returns a string for the widget title (that includes regime and risk factor(s))
     */
    getModifiedWidgetTitleDetails(): string {
        let title = '';
        if (this.isValid()) {
            title += '(' + this.regimeSelection.regime.regimeName + ')';

            if (!this.regimeSelection.isRegimeOnly) {
                title += ' ' + this.regimeSelection.riskFactors.map(riskFactor => riskFactor.riskFactorName).join(', ');
            }
        }
        return title;
    }
}
