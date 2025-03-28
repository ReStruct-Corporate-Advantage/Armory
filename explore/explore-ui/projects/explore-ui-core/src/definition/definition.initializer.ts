import {forEach} from 'lodash';
import {CoreColumnUtils} from '../column/core-column.utils';
import {CalendarDateUtils} from '../date/utils';
import {ExpostSettingsStore} from '../expost/expost-settings.store';
import {ConfigTypeFactory} from '../favorite/factories';
import {CoreDefinitionStore} from './core-definition.store';
import {Calendar} from './models/calendar.model';
import {ClimateScenarioAvailableOptions} from './models/climate/climate-scenario-available-options.model';
import {ColumnDefinition} from './models/column-definition.model';
import {NumericColumnFormat} from './models/column-format/numeric-column-format.model';
import {ExpostPeriods} from './models/expost-periods.model';
import {KrdBucketDetails} from './models/krd-bucket-details.model';
import {CompareToCurrent} from './models/override-date/compare-to-current.model';
import {MultiOverrideDate} from './models/override-date/multi-override-date.model';
import {OverrideDate} from './models/override-date/override-date.model';
import {PortfolioRiskColumnCategoryDefinition} from './models/portfolio-risk-column-category-definition.model';
import {PraadaAttributionCalculatorMethod} from './models/praada-meta-data/praada-attribution-calculator-method.model';
import {PraadaCannedAttributionMethod} from './models/praada-meta-data/praada-canned-attribution-method.model';
import {PraadaCustomPivotPoint} from './models/praada-meta-data/praada-custom-pivot-point.model';
import {PraadaExposeMode} from './models/praada-meta-data/praada-expose-mode.model';
import {PraadaFactor} from './models/praada-meta-data/praada-factor.model';
import {PraadaSectorLevel} from './models/praada-meta-data/praada-sector-level.model';
import {PraadaSectorWeighting} from './models/praada-meta-data/praada-sector-weighting.model';
import {RiskModel} from './models/risk/risk-model.model';
import {RiskParameter} from './models/risk/risk-parameter.model';
import {WeightingSchemes} from './models/risk/weighting-schemes.model';
import {NamedScenario} from './models/scenario/named-scenario.model';
import {CavContributorGroup} from './models/climate/cav-contributor-group.model';
import {IShareDefinitionWrapper} from './models/ishare-definition-wrapper.model';
import {CoreColumnConstants} from '../core/constants';
import {RbcRegimeSettings} from './models/risk-based-capital/rbc-regime-settings.model';
import {RbcRegime} from './models/risk-based-capital/rbc-regime.model';

export class DefinitionInitializer {

    // col def bean constants
    static readonly PRICE_COL_DEF_BEAN = 'PriceColumnDefinitionBean';
    static readonly COL_DEF_BEAN_WITH_PORT_IN_TITLE = 'ColumnDefinitionBeanWithPortfolioInTitle';
    static readonly PORT_RISK_COL_CAT_DEF_BEAN = 'PortfolioRiskColumnCategoryDefinitionBean';
    static readonly MACRO_FACTOR_BREAKDOWN_DEF_BEAN = 'MacroFactorBreakdownColumnDefinitionBean';

    /**
     * Create all the models for the definitions
     */
    static initDefinitions(data: any): void {
        CalendarDateUtils.maxSelectableDate = data.maxSelectableDate;
        CoreDefinitionStore.accountingConventions = data.AccountingConventions;
        CoreDefinitionStore.calendars = Calendar.createCalendarMapping(data);
        CoreDefinitionStore.krdBucketDetail = KrdBucketDetails.createKrdMapping(data);
        CoreDefinitionStore.redemptionScenarios = data.redemptionScenarios;
        CoreDefinitionStore.investorConcentrationScenarios = data.investorConcentrationScenarios;
        CoreDefinitionStore.assetClassModelMapping = data.assetClassModelMapping;
        CoreDefinitionStore.preCannedStressScenarios = data.preCannedStressScenarios;
        CoreDefinitionStore.scenarioLookBackDays = data.scenarioLookBackDays;
        // only initialize tokens data from definition response if it has not been initialized yet
        // Explore 2024.4 we moved token fetching to UserMetaDataService but this is to keep backwards compatibility for risk radar
        if (data.tokens && Object.keys(CoreDefinitionStore.tokens).length === 0) {
            CoreDefinitionStore.tokens = data.tokens;
        }

        CoreColumnUtils.createColumnDefinitions(data);
        CoreColumnUtils.createIShareDefinitions(data);
        DefinitionInitializer.createOverrideAssigningMapping(data);
        DefinitionInitializer.createNamedScenarioAssigningMapping(data);
        DefinitionInitializer.createClimateScenarioOption(data);
        DefinitionInitializer.createPcavContributorsOptions(data);
        DefinitionInitializer.createTCavContributorsOptions(data);
        DefinitionInitializer.createExpostModelAssigningMapping(data);
        DefinitionInitializer.createRbcRegimeMapping(data);

        DefinitionInitializer.initRiskDefinitions(data);
        DefinitionInitializer.initPraadaDefinitions(data);
    }

    private static initRiskDefinitions(data: any): void {
        CoreDefinitionStore.riskModelList = RiskModel.createModelMappings(data.ModelsList);
        CoreDefinitionStore.defaultHorizon = data.defaultRiskHorizon;

        DefinitionInitializer.createRiskAssigningMapping(data);
        DefinitionInitializer.createWeighingAssigningMapping(data);
    }

    private static initPraadaDefinitions(data: any): void {
        CoreDefinitionStore.sectorWeightings = PraadaSectorWeighting.createPraadaSectorWeighingDefinitions(data);
        CoreDefinitionStore.attributionCalculatorMethods = PraadaAttributionCalculatorMethod.createPraadaAttributionCalculatorDefinitions(data);
        CoreDefinitionStore.praadaCannedAttributionMethods = PraadaCannedAttributionMethod.createPraadaCannedAttributionDefinitions(data);
        CoreDefinitionStore.sectorLevels = PraadaSectorLevel.createPraadaSectorLevelDefinitions(data);
        CoreDefinitionStore.exposureModes = PraadaExposeMode.createPraadaExposeModeDefinitions(data);
        CoreDefinitionStore.customPivotPoint = PraadaCustomPivotPoint.createPraadaCustomPivotPointDefinitions(data);

        DefinitionInitializer.createPraadaFactorModelAssigningMapping(data);
        PraadaSectorWeighting.createPraadaSectorWeighingDefinitions(data);
    }

    /**
     * Assign model mapping to respective Override model
     */
    private static createOverrideAssigningMapping(data: any): void {
        CoreDefinitionStore.compareToCurrentDataType = CompareToCurrent.createCompareToCurrentOverrideDefinition(data.overrideDateDefinition);
        CoreDefinitionStore.multiOverrideDateType = MultiOverrideDate.createMultiOverrideDataDefinition(data.overrideDateDefinition);
        CoreDefinitionStore.overrideDateType = OverrideDate.createOverrideDateMapping(data.overrideDateDefinition);
    }

    /**
     * Assign values to respective Named Scenario model
     */
    private static createNamedScenarioAssigningMapping(data: any): void {
        CoreDefinitionStore.namedScenarios = new Map<string, NamedScenario[]>();
        forEach(data.NamedScenarios, (items: any[], name: string) => {
            const scenarioList = items.map((scenario) => new NamedScenario(scenario));
            CoreDefinitionStore.namedScenarios.set(name, scenarioList);
        });
    }

    /**
     * Add the Risk Based Capital regime definitions
     */
    static createRbcRegimeMapping(data: any): void {
        CoreDefinitionStore.rbcRegimeOptions = new Map<string, RbcRegimeSettings>();
        if (!data.RbcRegimeOptions) {
            return;
        }
        Object.keys(data.RbcRegimeOptions).forEach(regimeId => {
            const rbcRegimeSettings = new RbcRegimeSettings(data.RbcRegimeOptions[regimeId]);
            rbcRegimeSettings.regime = new RbcRegime(data.RbcRegimeOptions[regimeId]);
            CoreDefinitionStore.rbcRegimeOptions.set(regimeId, rbcRegimeSettings);
        });
    }

    /**
     * Assign values to climateScenario
     */
    private static createClimateScenarioOption(data: any): void {
        if (!data.climateScenarioOptions) {
            // should initialize to empty ClimateScenarioAvailableOptions so existing climate columns don't prevent app initialization
            CoreDefinitionStore.climateScenarioAssumptions = new ClimateScenarioAvailableOptions({});
            return;
        }
        CoreDefinitionStore.climateScenarioAssumptions = new ClimateScenarioAvailableOptions(data.climateScenarioOptions);
    }

    /**
     * Set climate PCAV contributor options to definitions store
     */
    private static createPcavContributorsOptions(data: any): void {
        if (!data.pCavContributors) {
            // should initialize to empty array so existing damage function columns don't prevent app initialization
            CoreDefinitionStore.pCavContributors = [];
            return;
        }
        CoreDefinitionStore.pCavContributors = data.pCavContributors.map(pCavContributor => new CavContributorGroup(pCavContributor));
    }

    /**
     * Set climate TCAV contributor options to definitions store
     */
    private static createTCavContributorsOptions(data: any): void {
        if (!data.tCavContributors) {
            CoreDefinitionStore.tCavContributors = [];
            return;
        }
        CoreDefinitionStore.tCavContributors = data.tCavContributors.map(tCavContributor => new CavContributorGroup(tCavContributor));
    }

    /**
     * Assign value to PraadaFactorModel
     */
    private static createPraadaFactorModelAssigningMapping(data: any): void {
        const praadaFactorModel: PraadaFactor[][] = PraadaFactor.createPraadaFactorDefinitions(data);
        CoreDefinitionStore.accountingFactors = praadaFactorModel[0];
        CoreDefinitionStore.attributionFactors = praadaFactorModel[1];
        CoreDefinitionStore.tradeBasedFactors = praadaFactorModel[2];
    }

    /**
     * Initialize the required configs for definitions service
     */
    static registerDefinitionsConfigTypes() {
        // The reason we have done this here rather than in individual models is to allow lazy loading... So Angular unlike Angular js supports lazy loading which means
        // that all the models listed below are not loaded until they are needed.. We want to register them before invoking Definitions service though hence making sure that we call this when
        // Definitions Service is initialized.. If we keep it in the respective models, them we would need to add these as providers in the metadata.module.ts to eager load them
        ConfigTypeFactory.registerConfigType(CoreColumnConstants.COL_DEF_BEAN, ColumnDefinition);
        ConfigTypeFactory.registerConfigType(CoreColumnConstants.ISHARE_DEF_BEAN, IShareDefinitionWrapper);
        ConfigTypeFactory.registerConfigType(DefinitionInitializer.PRICE_COL_DEF_BEAN, ColumnDefinition);
        ConfigTypeFactory.registerConfigType(DefinitionInitializer.COL_DEF_BEAN_WITH_PORT_IN_TITLE, ColumnDefinition);
        ConfigTypeFactory.registerConfigType(DefinitionInitializer.MACRO_FACTOR_BREAKDOWN_DEF_BEAN, ColumnDefinition);
        ConfigTypeFactory.registerConfigType(DefinitionInitializer.PORT_RISK_COL_CAT_DEF_BEAN, PortfolioRiskColumnCategoryDefinition);
        ConfigTypeFactory.registerConfigType(NumericColumnFormat.CONFIG_TYPE, NumericColumnFormat);
    }

    /**
     * Risk model value assigning
     */
    private static createRiskAssigningMapping(data: any) {
        const riskParameterArray: RiskParameter[][] = RiskParameter.createRiskMapping(data);
        CoreDefinitionStore.excludeFactorBlock = riskParameterArray[0];
        CoreDefinitionStore.riskHorizon = riskParameterArray[1];
    }

    private static createWeighingAssigningMapping(data: any) {
        const weighingMappingArray: WeightingSchemes[][] = WeightingSchemes.createWeightingMapping(data);
        CoreDefinitionStore.allWeightingSchemes = weighingMappingArray[0];
        CoreDefinitionStore.weightingSchemes = weighingMappingArray[1];
    }

    /**
     * Assign model mapping to respective Expost model
     */
    private static createExpostModelAssigningMapping(data: any): void {
        const expostModel: ExpostPeriods[][] = ExpostPeriods.createExpostPeriodsMapping(data);
        CoreDefinitionStore.expostSamplingPeriod = expostModel[0];
        CoreDefinitionStore.expostStatisticPeriod = expostModel[1];
        ExpostSettingsStore.setSupportedSettings(data.expostSamplingPeriods, data.expostStatisticPeriods);
    }
}
