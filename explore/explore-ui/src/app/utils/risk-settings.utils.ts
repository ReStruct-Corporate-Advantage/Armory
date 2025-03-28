import {CoreDefinitionStore, RiskModel, TokenConstants} from '@blk/explore-ui-core';
import {
    CoreRiskConstants,
    EconomySettings,
    ExposureSettings,
    HvarRiskSettingsModel,
    MCVaRRiskSettingsModel
} from '@blk/explore-ui-risk';
import {isNil, isUndefined} from 'lodash';
import {
    HvarRiskSettingsTrimmedComponentComponent
} from '../../../projects/explore-ui-risk/src/components/hva-rrisk-settings-component/hvar-risk-settings-trimmed-component.component';

export class RiskSettingsUtils {
    /**
     * Gets the display value of the risk model
     */
    static getRiskModelLabel(exposureRiskSettings: ExposureSettings): string {
        const riskModel: RiskModel = exposureRiskSettings.riskModels.find(model => model.value === exposureRiskSettings.riskModel);

        if (!riskModel) {
            if (exposureRiskSettings.getSourceName(CoreRiskConstants.EXPOSURE_SETTINGS_PROPERTIES.RISK_MODEL) === CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORT_DEFAULT) {
                return CoreRiskConstants.RISK_MODEL_TYPE.GP + ' (' + exposureRiskSettings.riskModel.substring(0, 10) + ')';

            } else {
                return CoreRiskConstants.RISK_MODEL_TYPE.ORG + ' (' + exposureRiskSettings.riskModel.substring(0, 10) + ')';
            }
        }
        return riskModel.label;
    }

    /**
     * Gets the display value of the weighting scheme
     */
    static getWeightingSchemeLabel(economyRiskSettings: EconomySettings): string {
        const weightingScheme = economyRiskSettings.availableWeightingSchemes.find(scheme => scheme.value === economyRiskSettings.weightingScheme);
        return weightingScheme.label || '';
    }

    /**
     * Gets the display value of the risk horizon
     */
    static getRiskHorizonLabel(economyRiskSettings: EconomySettings): string {
        const riskHorizon = economyRiskSettings.riskHorizons.find(horizon => Number(horizon.value) === economyRiskSettings.riskHorizon);
        return riskHorizon.text || '';
    }

    /**
     * Get economy risk date
     */
    static getEconomyRiskDate(economyRiskSettings: EconomySettings): string {
        return economyRiskSettings.dateObject.date;
    }

    /**
     * Get economy risk period
     */
    static getEconomyRiskPeriod(economyRiskSettings: EconomySettings): string {
        return economyRiskSettings.period + ' ' + economyRiskSettings.halfLifeLabel;
    }

    /**
     * Get economy risk half life
     */
    static getEconomyRiskHalfLife(economyRiskSettings: EconomySettings): string {
        return economyRiskSettings.halfLifeInDays + ' ' + economyRiskSettings.halfLifeLabel;
    }

    /**
     * Get economy risk confidence level
     */
    static getEconomyRiskConfidenceLevel(economyRiskSettings: EconomySettings): string {
        return economyRiskSettings.confidenceLevelSD + ' σ  OR  ' + economyRiskSettings.confidenceLevelPercentage + ' %';
    }

    static buildMCVaRRiskSettingsPropertyValue(mcvarRiskSettings: MCVaRRiskSettingsModel): Map<string, {value: string | number, source: string}> {
        const mcvarRiskSettingsMap = new Map<string, {value: string | number, source: string}>();
        mcvarRiskSettingsMap.set('Distribution type', {
            value : isNil(mcvarRiskSettings.distributionType) ? CoreRiskConstants.MCVAR_DISTRIBUTION_TYPES[0].label : mcvarRiskSettings.distributionType,
            source: mcvarRiskSettings.getSourceDisplayName(CoreRiskConstants.MCVAR_RISK_SETTINGS_PROPERTIES.DISTRIBUTION_TYPE)
        });
        if (mcvarRiskSettingsMap.get('Distribution type')?.value === 'T') {
            mcvarRiskSettingsMap.set('Degrees of freedom', {
                value: isNil(mcvarRiskSettings.degreesOfFreedom) ? MCVaRRiskSettingsModel.DEFAULT_DEGREES_OF_FREEDOM : mcvarRiskSettings.degreesOfFreedom,
                source: mcvarRiskSettings.getSourceDisplayName(CoreRiskConstants.MCVAR_RISK_SETTINGS_PROPERTIES.DEGREES_OF_FREEDOM)
            });
        }
        mcvarRiskSettingsMap.set('Samples', {
            value: isNil(mcvarRiskSettings.samples) ? MCVaRRiskSettingsModel.DEFAULT_SAMPLES : mcvarRiskSettings.samples,
            source: mcvarRiskSettings.getSourceDisplayName(CoreRiskConstants.MCVAR_RISK_SETTINGS_PROPERTIES.SAMPLES)
        });
        mcvarRiskSettingsMap.set('Seed', {
            value: isNil(mcvarRiskSettings.seed) ? MCVaRRiskSettingsModel.DEFAULT_SEED : mcvarRiskSettings.seed,
            source: mcvarRiskSettings.getSourceDisplayName(CoreRiskConstants.MCVAR_RISK_SETTINGS_PROPERTIES.SEED)
        });
        mcvarRiskSettingsMap.set('Pricing Type', {
            value: isNil(mcvarRiskSettings.pricingType) ? CoreRiskConstants.MCVAR_PRICING_TYPES[0].label : mcvarRiskSettings.pricingType,
            source: mcvarRiskSettings.getSourceDisplayName(CoreRiskConstants.MCVAR_RISK_SETTINGS_PROPERTIES.PRICING_TYPE)
        });
        mcvarRiskSettingsMap.set('Include time return', {
            value: RiskSettingsUtils.booleanToString(isNil(mcvarRiskSettings.includeTimeReturn) ? true : mcvarRiskSettings.includeTimeReturn),
            source: mcvarRiskSettings.getSourceDisplayName(CoreRiskConstants.MCVAR_RISK_SETTINGS_PROPERTIES.INCLUDE_TIME_RETURN)
        });
        mcvarRiskSettingsMap.set('Idiosyncratic correlation', {
            value: isNil(mcvarRiskSettings.idiosyncraticCorrelation) ? CoreRiskConstants.MCVAR_IDIO_CALCS[0].label : mcvarRiskSettings.idiosyncraticCorrelation,
            source: mcvarRiskSettings.getSourceDisplayName(CoreRiskConstants.MCVAR_RISK_SETTINGS_PROPERTIES.IDIOSYNC_CORR)
        });
        mcvarRiskSettingsMap.set('Use importance samplings', {
            value: RiskSettingsUtils.booleanToString(isNil(mcvarRiskSettings.useImportanceSampling) ? false : mcvarRiskSettings.useImportanceSampling),
            source: mcvarRiskSettings.getSourceDisplayName(CoreRiskConstants.MCVAR_RISK_SETTINGS_PROPERTIES.USE_IMPORTANCE_SAMPLING)
        });
        return mcvarRiskSettingsMap;
    }

    static buildHVaRRiskSettingsPropertyValue(hvarRiskSettings: HvarRiskSettingsModel): Map<string, {value: string | number, source: string}> {
        const hvarRiskSettingsMap = new Map<string, {value: string | number, source: string}>();
        if (hvarRiskSettings.confidenceLevelPercentage) {
            const confidenceLevelSd = HvarRiskSettingsTrimmedComponentComponent.computeConfidenceLevelSD(hvarRiskSettings.confidenceLevelPercentage);
            hvarRiskSettingsMap.set('Confidence Level', {
                value: hvarRiskSettings.confidenceLevelPercentage + ' % Or ' + confidenceLevelSd + ' σ',
                source: hvarRiskSettings.getSourceDisplayName(CoreRiskConstants.HVAR_RISK_SETTINGS_PROPERTIES.CONFIDENCE_LEVEL_PERCENT)
            });
        } else {
            const confidenceLevelSd = HvarRiskSettingsTrimmedComponentComponent.computeConfidenceLevelSD(95);
            hvarRiskSettingsMap.set('Confidence Level', {
                value: '95 % Or ' + confidenceLevelSd + ' σ',
                source: hvarRiskSettings.getSourceDisplayName(CoreRiskConstants.HVAR_RISK_SETTINGS_PROPERTIES.CONFIDENCE_LEVEL_PERCENT)
            });
        }

        RiskSettingsUtils.addReturnHorizonParamSource(hvarRiskSettings, hvarRiskSettingsMap);

        if (hvarRiskSettings.isNumberOfObservationsSelected) {
            hvarRiskSettingsMap.set('Number of business days', {
                value: hvarRiskSettings.numberOfObservations,
                source: hvarRiskSettings.getSourceDisplayName(CoreRiskConstants.HVAR_RISK_SETTINGS_PROPERTIES.NUMBER_OF_OBSERVATIONS)
            });
        } else if (isNil(hvarRiskSettings.startDate)) {
            hvarRiskSettingsMap.set('Start Date', {
                value: CoreDefinitionStore.tokens[TokenConstants.EXPLORE_HVAR_START_DATE],
                source: hvarRiskSettings.getSourceDisplayName(CoreDefinitionStore.tokens[TokenConstants.EXPLORE_HVAR_START_DATE])
            });
        } else {
            hvarRiskSettingsMap.set('Start Date', {
                value: hvarRiskSettings.startDate.dateStringValue,
                source: hvarRiskSettings.getSourceDisplayName(CoreRiskConstants.HVAR_RISK_SETTINGS_PROPERTIES.START_DATE)
            });
        }
        hvarRiskSettingsMap.set('Full Revaluation', {
            value: RiskSettingsUtils.booleanToString(isNil(hvarRiskSettings.fullRevaluation) ? true : hvarRiskSettings.fullRevaluation),
            source: hvarRiskSettings.getSourceDisplayName(CoreRiskConstants.HVAR_RISK_SETTINGS_PROPERTIES.FULL_REVALUATION)
        });
        hvarRiskSettingsMap.set('Include time return', {
            value: RiskSettingsUtils.booleanToString(isNil(hvarRiskSettings.includeTimeReturn) ? true : hvarRiskSettings.includeTimeReturn),
            source: hvarRiskSettings.getSourceDisplayName(CoreRiskConstants.HVAR_RISK_SETTINGS_PROPERTIES.INCLUDE_TIME_RETURN)
        });
        hvarRiskSettingsMap.set('Volatility Scaling and EVT Settings', {
            value: isUndefined(hvarRiskSettings.factorScaling) ? 'ConstantWeighting' : hvarRiskSettings.factorScaling,
            source: hvarRiskSettings.getSourceDisplayName(CoreRiskConstants.HVAR_RISK_SETTINGS_PROPERTIES.FACTOR_SCALING)
        });
        RiskSettingsUtils.addAdvancedHvarRiskSettings(hvarRiskSettings, hvarRiskSettingsMap);
        return hvarRiskSettingsMap;
    }

    static addAdvancedHvarRiskSettings(hvarRiskSettings: HvarRiskSettingsModel, hvarRiskSettingsMap: Map<string, {value: string | number, source: string}>) {
        if (!isNil(hvarRiskSettings.advancedHvarRiskSettings)) {
            const advancedRiskSettings = hvarRiskSettings.advancedHvarRiskSettings;
            hvarRiskSettingsMap.set('Holding Period', {
                value: advancedRiskSettings.holdingPeriod,
                source: advancedRiskSettings.getSourceDisplayName(CoreRiskConstants.HVAR_RISK_SETTINGS_PROPERTIES.HOLDING_PERIED)
            });
            if (advancedRiskSettings.confidenceIntervalScaling) {
                hvarRiskSettingsMap.set('Confidence Interval Scaling', {
                    value: advancedRiskSettings.confidenceIntervalScaling,
                    source: hvarRiskSettings.getSourceDisplayName(CoreRiskConstants.HVAR_RISK_SETTINGS_PROPERTIES.CONFIDENCE_INTERVAL_SCALE)
                });
            }
            hvarRiskSettingsMap.set('Historical Return Decay', {
                value: (isUndefined(hvarRiskSettings.historicalReturnDecay) || hvarRiskSettings.historicalReturnDecay === 1) ? 'ConstantWeighting' : 'HalfLife',
                source: hvarRiskSettings.getSourceDisplayName(CoreRiskConstants.HVAR_RISK_SETTINGS_PROPERTIES.HISTORICAL_RETURN_DECAY)
            });
            if ('HalfLife' === hvarRiskSettingsMap.get('Historical Return Decay').value) {
                if (isNil(hvarRiskSettings.historicalReturnDecay)) {
                    const decayFactor = HvarRiskSettingsTrimmedComponentComponent.computeDecayFactor(14);
                    hvarRiskSettingsMap.set('Half Life & Decay', {
                        value: 14 + ' days Or ' + decayFactor + ' σ',
                        source: hvarRiskSettings.getSourceDisplayName(CoreRiskConstants.HVAR_RISK_SETTINGS_PROPERTIES.HISTORICAL_RETURN_DECAY)
                    });
                } else {
                    const halfLife = HvarRiskSettingsTrimmedComponentComponent.computeHalfLife(hvarRiskSettings.historicalReturnDecay);
                    hvarRiskSettingsMap.set('Half Life & Decay', {
                        value: halfLife + ' days Or ' + hvarRiskSettings.historicalReturnDecay + ' σ',
                        source: hvarRiskSettings.getSourceDisplayName(CoreRiskConstants.HVAR_RISK_SETTINGS_PROPERTIES.HISTORICAL_RETURN_DECAY)
                    });
                }
            }
        }
    }

    static addReturnHorizonParamSource(hvarRiskSettings: HvarRiskSettingsModel, hvarRiskSettingsMap: Map<string, {value: string | number, source: string}>) {
        if (isNil(hvarRiskSettings.returnHorizonSelection)) {
            hvarRiskSettingsMap.set('Return Horizon', {
                value: CoreRiskConstants.HVAR_RETURN_HORIZON[0].label,
                source: hvarRiskSettings.getSourceDisplayName(CoreRiskConstants.HVAR_RISK_SETTINGS_PROPERTIES.RETURN_HORIZON)
            });
            hvarRiskSettingsMap.set('Number of days', {
                value: HvarRiskSettingsModel.DEFAULT_NUMBER_OF_DAYS,
                source: hvarRiskSettings.getSourceDisplayName(CoreRiskConstants.HVAR_RISK_SETTINGS_PROPERTIES.NUMBER_OF_DAYS)
            });
            hvarRiskSettingsMap.set('Non-linear', {
                value: isNil(hvarRiskSettings.linear) ? HvarRiskSettingsModel.DEFAULT_NON_LINEAR : hvarRiskSettings.linear,
                source: hvarRiskSettings.getSourceDisplayName(CoreRiskConstants.HVAR_RISK_SETTINGS_PROPERTIES.LINEAR)
            });
            hvarRiskSettingsMap.set('Daily overlapping observations', {
                value: RiskSettingsUtils.booleanToString(isNil(hvarRiskSettings.dailyOverlappingObservation) ? true : hvarRiskSettings.dailyOverlappingObservation),
                source: hvarRiskSettings.getSourceDisplayName(CoreRiskConstants.HVAR_RISK_SETTINGS_PROPERTIES.DAILY_OVERLAPPING_OBSERVATION)
            });
        } else {
            hvarRiskSettingsMap.set('Return Horizon', {
                value: CoreRiskConstants.HVAR_RETURN_HORIZON.find(rh => rh.value === hvarRiskSettings.returnHorizonSelection).label,
                source: hvarRiskSettings.getSourceDisplayName(CoreRiskConstants.HVAR_RISK_SETTINGS_PROPERTIES.RETURN_HORIZON)
            });
            hvarRiskSettingsMap.set('Number of days', {
                value: RiskSettingsUtils.numberOfDays(hvarRiskSettings.numberOfDays, hvarRiskSettings.returnHorizonSelection),
                source: hvarRiskSettings.getSourceDisplayName(CoreRiskConstants.HVAR_RISK_SETTINGS_PROPERTIES.NUMBER_OF_DAYS)
            });
            hvarRiskSettingsMap.set('Non-linear', {
                value: RiskSettingsUtils.nonLienear(hvarRiskSettings.linear, hvarRiskSettings.returnHorizonSelection),
                source: hvarRiskSettings.getSourceDisplayName(CoreRiskConstants.HVAR_RISK_SETTINGS_PROPERTIES.LINEAR)
            });
            hvarRiskSettingsMap.set('Daily overlapping observations', {
                value: RiskSettingsUtils.booleanToString(false),
                source: hvarRiskSettings.getSourceDisplayName(CoreRiskConstants.HVAR_RISK_SETTINGS_PROPERTIES.DAILY_OVERLAPPING_OBSERVATION)
            });
        }
    }

    static numberOfDays(numberOfDays: number, returnHorizon: string): number {
        if (!isUndefined(numberOfDays)) {
            return numberOfDays;
        }
        switch (returnHorizon) {
            case 'days':
                return HvarRiskSettingsModel.DEFAULT_NUMBER_OF_DAYS;
            case '1week':
                return HvarRiskSettingsModel.DEFAULT_NUMBER_OF_DAYS_WEEK;
            case '1month':
                return HvarRiskSettingsModel.DEFAULT_NUMBER_OF_DAYS_MONTH;
        }
    }

    static nonLienear(nonLinear: number, returnHorizon: string): number {
        if (!isUndefined(nonLinear)) {
            return nonLinear;
        }
        switch (returnHorizon) {
            case 'days':
                return HvarRiskSettingsModel.DEFAULT_NUMBER_OF_DAYS_WEEK;
            case '1week':
                return HvarRiskSettingsModel.DEFAULT_NUMBER_OF_DAYS_WEEK;
            case '1month':
                return HvarRiskSettingsModel.DEFAULT_NUMBER_OF_DAYS_MONTH;
        }
    }

    static booleanToString(checked: boolean): string {
        return checked ? 'Yes' : 'No';
    }
}
