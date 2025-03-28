import {Calendar} from './models/calendar.model';
import {ClimateScenarioAvailableOptions} from './models/climate/climate-scenario-available-options.model';
import {ColumnDefinition} from './models/column-definition.model';
import {ExpostPeriods} from './models/expost-periods.model';
import {KrdBucketDetails} from './models/krd-bucket-details.model';
import {CompareToCurrent} from './models/override-date/compare-to-current.model';
import {MultiOverrideDate} from './models/override-date/multi-override-date.model';
import {OverrideDate} from './models/override-date/override-date.model';
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
import {IShareDefinition} from './models/ishare-definition.model';
import {RbcRegimeSettings} from './models/risk-based-capital/rbc-regime-settings.model';

export class CoreDefinitionStore {

    static defaultNamedScenarios: Map<string, NamedScenario[]> = null;

    static scenarioLookBackDays: number = null;

    /**
     * List of all column definitions
     */
    static columns: ColumnDefinition[] = [];

    /**
     * Map of column Tag to column definition
     */
    static columnTagColumnsPairs: Map<string, ColumnDefinition[]> = new Map<string, ColumnDefinition[]>();

    /**
     * Map of column Tag to column definition
     */
    static aliasTagColumnsPairs: Map<string, ColumnDefinition[]> = new Map<string, ColumnDefinition[]>();

    /**
     * Array of different calendars
     */
    static calendars: Calendar[] = [];

    /**
     * Book column accounting conventions
     */
    static accountingConventions: string[] = [];

    /**
     * CompareToCurrent date definition
     */
    static compareToCurrentDataType: CompareToCurrent[] = [];

    static multiOverrideDateType: MultiOverrideDate[] = [];

    static overrideDateType: OverrideDate[] = [];

    /**
     * ishares/ETF selector definitions
     */
    static iSharesDefinitions: IShareDefinition[] = [];

    /**
     * Krd Bucket Detail
     */
    static krdBucketDetail: KrdBucketDetails[] = [];

    /**
     * Named Scenario parameter
     */
    static namedScenarios: Map<string, NamedScenario[]> = new Map<string, NamedScenario[]>();

    static investorConcentrationScenarios: { text: string, value: string }[] = [];

    static redemptionScenarios: { text: string, value: string }[] = [];

    static assetClassModelMapping: { text: string, value: string}[] = [];

    static preCannedStressScenarios: { text: string, value: string }[] = [];

    static tokens: { [key: string]: string } = {};

    static climateScenarioAssumptions: ClimateScenarioAvailableOptions = new ClimateScenarioAvailableOptions({});

    static pCavContributors: CavContributorGroup[] = [];

    static tCavContributors: CavContributorGroup[] = [];

    /**
     * Praada Accounting factors
     */
    static accountingFactors: PraadaFactor[] = [];

    /**
     * Praada Attribution factors
     */
    static attributionFactors: PraadaFactor[] = [];

    /**
     * Praada Trade factors
     */
    static tradeBasedFactors: PraadaFactor[] = [];

    /**
     * Praada Sector Weightings
     */
    static sectorWeightings: PraadaSectorWeighting[] = [];

    /**
     * Praada Attribution Calculator Methods
     */
    static attributionCalculatorMethods: PraadaAttributionCalculatorMethod[] = [];

    /**
     * Praada canned attribution methods
     */
    static praadaCannedAttributionMethods: PraadaCannedAttributionMethod[] = [];

    /**
     * Praada Sector Levels
     */
    static sectorLevels: PraadaSectorLevel[] = [];

    /**
     * Praada Exposure Modes
     */
    static exposureModes: PraadaExposeMode[] = [];

    /**
     * Praada CustomPivotPoints
     */
    static customPivotPoint: PraadaCustomPivotPoint[] = [];

    /**
     * Risk
     */
    static riskModelList: RiskModel[] = [];
    static weightingSchemes: WeightingSchemes[] = [];
    static allWeightingSchemes: WeightingSchemes[] = [];
    static defaultHorizon: RiskParameter = new RiskParameter();
    static riskHorizon: RiskParameter[] = [];
    static excludeFactorBlock: RiskParameter[] = [];

    /**
     * Expost
     */
    static expostSamplingPeriod: ExpostPeriods[] = [];
    static expostStatisticPeriod: ExpostPeriods[] = [];

    // Risk Based Capital
    static rbcRegimeOptions: Map<string, RbcRegimeSettings> = new Map<string, RbcRegimeSettings>();
}
