import {
    AbstractConfig,
    AbstractFavoriteConfig,
    AssetType,
    AttributionSettings,
    CommonUtils,
    CoreDefinitionStore,
    DateValue,
    ExplorePortfolioTypeEnum,
    ExpostSettings,
    FavoriteDisplayEnum,
    FavoriteType,
    PerformanceSettings,
    PortfolioDefaults,
    RequestParamsCreator,
    SerializeFavoriteType,
    TimePeriod,
    FactorAttributionSettings, TimePeriodShortName
} from '@blk/explore-ui-core';
import {
    AdvancedRiskSettings,
    CoreRiskConstants,
    DefaultRiskSettings,
    EconomySettings,
    ExposureSettings,
    HvarRiskSettingsModel,
    PositionModeSettings,
    RiskSettings,
    MCVaRRiskSettingsModel
} from '@blk/explore-ui-risk';
import {EpnlSettings} from '@models/batch-reporting/epnl-settings.model';
import {LoadAllTracker} from '@models/load-all/load-all-tracker.model';
import {PublishStateWrapper} from '@models/publishState/publish-state-wrapper.model';
import {cloneDeep, find, forEach, isEmpty, isEqual, isNil, isUndefined, sortBy} from 'lodash';
import {BehaviorSubject} from 'rxjs';
import {BenchmarkConstants, CommonConstants, CompositionConstants} from '../../constants';
import {DefinitionsStore} from '@stores/definitions.store';
import {MandateSettings} from '../mandate/mandate-settings.model';
import {SplitPositionSettings} from '../split-position-settings.model';
import {Benchmark} from './benchmark.model';
import {IndexWeight} from './index-weight.model';
import {CustomFilter} from '@blk/explore-ui-breakdown';
import {ModellingType} from '@enums/modelling-type.enum';
import {isAdhocPort} from '@interfaces/base-adhoc-portfolio.interface';
import {LookThroughSettingsWithRules} from '@models/lookthrough/look-through-settings-with-rules.model';
import {DecisionLevelConfig} from "@models/portfolio/decisionLevels/decision-level-config.model";

/**
 * Model class for Portfolio objects
 */
export class Portfolio extends AbstractFavoriteConfig implements RequestParamsCreator {
    // portName + uniqueId
    portId: string;
    // portName contains the ticker
    portName: string;
    portCode: number;
    fullName: string;
    market: string;
    isBench = false;
    cusip: string;
    isPortfolioGroup = false;
    datePicker: DateValue;
    benchmark: Benchmark;
    benchmarks: Benchmark[];
    isIndexResearchPortfolio = false;
    isCompositePortfolio = false;
    isSecurityModellingAllowed: boolean;
    isSectorModellingAllowed: boolean;
    isPortfolioModellingAllowed: boolean;
    currency: string;
    loading: boolean;
    portfolioDefaults: PortfolioDefaults;
    expostSettings: ExpostSettings;
    splitPositionSettings: SplitPositionSettings;
    lookthroughSettings: LookThroughSettingsWithRules;
    portfolioRiskSettings: RiskSettings;
    decisionLevelsConfig: DecisionLevelConfig = new DecisionLevelConfig();
    positionModeSettings: PositionModeSettings;
    factorAttributionSettings: FactorAttributionSettings;
    performanceSettings: PerformanceSettings = new PerformanceSettings();
    orgDefaultRiskSettings: DefaultRiskSettings;
    portDefaultRiskSettings: DefaultRiskSettings;
    indexWeights: IndexWeight[];
    filter: CustomFilter = new CustomFilter();
    timePeriods: any[] = [];
    mandateSettings: MandateSettings;
    assetType: string;
    multiFrequencyMaxPeriodsMap: Map<string, number>;
    applyFilterTo: string;
    portfolios: Portfolio[];
    epnlSettings: EpnlSettings;

    // load all tracker
    loadAllTracker: LoadAllTracker;

    publishStateWrapperSubject$ = new BehaviorSubject<PublishStateWrapper>(new PublishStateWrapper());

    constructor(portName?: string, datePicker?: DateValue, isIndexResearchPortfolio?: boolean, fullName?: string, id?: number) {
        super();
        this.isIndexResearchPortfolio = isIndexResearchPortfolio;
        if (this.id) {
            this.id = id;
            if (fullName) {
                this.title = fullName;
            }
        }

        this.portName = portName;
        this.fullName = fullName;
        this.datePicker = cloneDeep(datePicker);
        this.generateUniquePortId();

        // Get splitPositionArray according to the defaultSelect flag of that portfolio
        this.splitPositionSettings = new SplitPositionSettings();
        this.splitPositionSettings.selectedPositionTypes = DefinitionsStore.splitPositionType
            .filter((splitPosition) => splitPosition.defaultSelected)
            .map((splitPosition) => splitPosition.name);
        this.positionModeSettings = new PositionModeSettings();
        this.factorAttributionSettings = new FactorAttributionSettings();
        this.lookthroughSettings = new LookThroughSettingsWithRules();
        if (DefinitionsStore.ltSecurityType) {
            DefinitionsStore.ltSecurityType.forEach((ltSecType) => {
                if (ltSecType.selected) {
                    this.lookthroughSettings.ltSecurityTypes.push(ltSecType.name);
                }
            });
        }
        if (DefinitionsStore.ltSecurityProxyType) {
            DefinitionsStore.ltSecurityProxyType.forEach((ltSecProxyType) => {
                if (ltSecProxyType.selected) {
                    this.lookthroughSettings.ltProxies.push(ltSecProxyType.name);
                }
            });
        }

        // Giving default value to apply Filter
        this.applyFilterTo = this.applyFilterTo ? this.applyFilterTo : CommonConstants.DEFAULT_FILTER_TARGET;
    }

    private checkIfSettingsAreEquals(otherPort: any): boolean {
        // Check if the look through settings for both the portfolios are equal
        if (!isEqual(this.lookthroughSettings, otherPort.lookthroughSettings)) {
            return false;
        }

        if (!isEqual(this.splitPositionSettings, otherPort.splitPositionSettings)) {
            return false;
        }

        if (!isEqual(this.positionModeSettings, otherPort.positionModeSettings)) {
            return false;
        }

        if (!isEqual(this.factorAttributionSettings, otherPort.factorAttributionSettings)) {
            return false;
        }

        if (this.epnlSettings && !this.epnlSettings.equals(otherPort.epnlSettings)) {
            return false;
        }

        // Check if the performance settings for the two portfolios are equal
        if (this.performanceSettings && !this.performanceSettings.equals(otherPort.performanceSettings)) {
            return false;
        }

        if (this.expostSettings && !this.expostSettings.equals(otherPort.expostSettings)) {
            return false;
        }

        // Check if the risk settings for the two portfolios are equal
        if (this.portfolioRiskSettings && !this.portfolioRiskSettings.equals(otherPort.portfolioRiskSettings)) {
            return false;
        }

        return true;
    }

    /**
     * Equals method for comparing two portfolios
     */
    equals(otherPort: AbstractConfig): boolean {
        if (!(otherPort instanceof Portfolio)) {
            return false;
        }

        // Make sure the portName and currency for both the portfolios are the same
        if (this.portName !== otherPort.portName) {
            return false;
        }

        if (this.cusip !== otherPort.cusip) {
            return false;
        }

        // Check if the benchmarks for the two portfolios are equal
        if (this.benchmark && !this.benchmark.equals(otherPort.benchmark)) {
            return false;
        }

        // Check if the date for both the portfolios are equal
        if (this.datePicker && this.datePicker.date !== otherPort.datePicker.date) {
            return false;
        }

        if (!this.checkIfSettingsAreEquals(otherPort)) {
            return false;
        }

        // Check for time periods
        if (!isEqual(this.timePeriods, otherPort.timePeriods)) {
            return false;
        }

        // Check for applyFilterTo
        if (!isEqual(this.applyFilterTo, otherPort.applyFilterTo)) {
            return false;
        }

        // Check for filter
        if (this.filter && !this.filter.equals(otherPort.filter)) {
            return false;
        }

        // Check if the calCode for both the portfolios are equal
        return this.datePicker && this.datePicker.calCode === otherPort.datePicker.calCode;
    }

    /**
     * Finds a benchmark for this portfolio of a particular type.
     */
    findBenchmark(type: string): Benchmark | null {
        if (isEmpty(this.benchmarks)) {
            return null;
        }

        const filterBenchmarks: Benchmark[] = this.benchmarks.filter((benchmark) => benchmark.type === type);
        if (isEmpty(filterBenchmarks)) {
            return null;
        }

        return sortBy(filterBenchmarks, 'order')[0];
    }

    /**
     * Method to update the benchmarks from portfolio info data
     */
    updateBenchmarks(): void {
        // If we received no benchmarks create an empty array otherwise just take what we got.
        if (!this.benchmarks) {
            this.benchmarks = [];
        }

        // If it is a Portfolio Group add in the 'Group Aggregate' benchmarks.
        if (this.isPortfolioGroup && !isAdhocPort(this)) {
            if (!this.findBenchmark(BenchmarkConstants.BENCH_AGGREGATE)) {
                this.benchmarks.push(Benchmark.create(BenchmarkConstants.BENCH_AGGREGATE, 1, BenchmarkConstants.BENCH_PRIMARY));
                this.benchmarks.push(Benchmark.create(BenchmarkConstants.BENCH_AGGREGATE, 2, BenchmarkConstants.BENCH_SECONDARY));
            }
        }

        const marketParameters: Benchmark = this.findBenchmark(BenchmarkConstants.BENCH_TYPE_MARKET);

        // If there is a market existing for the given portfolio, set it against the portfolio, else set it as undefined
        this.market = marketParameters ? marketParameters.name : undefined;

        this.setDefaultBenchmark();
    }

    /**
     * PortfolioHelperService sets up the portfolio settings.
     * handles old riskSettings as well and converts them to new risk settings if someone was overriding them previously.
     */
    setPortfolioRiskSettings(): void {
        if (this.portDefaultRiskSettings && this.orgDefaultRiskSettings) {
            const portDefaultRiskSettings = this.setPortDefaultRiskSettings(
                this.portDefaultRiskSettings,
                this.setOrgDefaultRiskSettings(this.orgDefaultRiskSettings, this.datePicker)
            );
            if (!isNil(this.portfolioRiskSettings)) {
                this.portfolioRiskSettings.economyRiskSettings.name = CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO;
                this.portfolioRiskSettings.economyRiskSettings.parentRiskSettings = portDefaultRiskSettings.economyRiskSettings;

                this.portfolioRiskSettings.exposureRiskSettings.name = CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO;
                this.portfolioRiskSettings.exposureRiskSettings.parentRiskSettings = portDefaultRiskSettings.exposureRiskSettings;

                this.portfolioRiskSettings.advancedRiskSettings.name = CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO;
                this.portfolioRiskSettings.advancedRiskSettings.parentRiskSettings = portDefaultRiskSettings.advancedRiskSettings;

                this.portfolioRiskSettings.hvarRiskSettings.name = CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO;
                this.portfolioRiskSettings.hvarRiskSettings.parentRiskSettings = portDefaultRiskSettings.hvarRiskSettings;
            } else {
                this.initializePortfolioRiskSettings(portDefaultRiskSettings);
            }
        } else {
            this.initializePortfolioRiskSettings(this.setDefaultRiskSettings(this.portfolioDefaults, this.datePicker));
        }
    }

    /**
     * @return true if the portfolio is a custom port group, otherwise it returns false
     */
    public isCustomPortGroup(): boolean {
        // TODO it's more optimal to set this flag in Explore Server similar to isPortfolioGroup flag
        //  (which corresponds to ExploreServer's PortfolioBean.portfolioGroup flag)
        return !isNil(this.portName) && this.portName.indexOf(',') > -1;
    }

    /**
     * Returns true if the portfolio is a composite or portfolio group
     */
    isCompositeOrPortGroup(): boolean {
        return this.isPortfolioGroup || this.isCompositePortfolio;
    }

    // noinspection JSMethodCanBeStatic
    /**
     * Sets default Risk settings. PortfolioHelperService is "default" settings which essentially is fallback for portfolio settings. (portDefaults)
     */
    private setOrgDefaultRiskSettings(orgDefaultRiskSettings: DefaultRiskSettings, datePicker: DateValue): RiskSettings {
        const riskSettings = new RiskSettings();

        riskSettings.economyRiskSettings = new EconomySettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.ORG_DEFAULT);
        riskSettings.economyRiskSettings.setOrgDefaultEconomyRiskSettings(orgDefaultRiskSettings);
        riskSettings.economyRiskSettings.dateObject = datePicker;

        riskSettings.exposureRiskSettings = new ExposureSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.ORG_DEFAULT);
        riskSettings.exposureRiskSettings.setOrgDefaultExposureRiskSettings(orgDefaultRiskSettings);

        riskSettings.advancedRiskSettings = new AdvancedRiskSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.ORG_DEFAULT);
        riskSettings.advancedRiskSettings.setAdvancedRiskSettings();
        riskSettings.advancedRiskSettings.setOrgDefaultAdvancedRiskSettings(orgDefaultRiskSettings);
        riskSettings.advancedRiskSettings.market = this.market;

        riskSettings.hvarRiskSettings = new HvarRiskSettingsModel(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.ORG_DEFAULT);
        riskSettings.hvarRiskSettings.setOrgDefaultHvarRiskSettings();

        riskSettings.mcvarRiskSettings = new MCVaRRiskSettingsModel(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.ORG_DEFAULT);

        return riskSettings;
    }

    // noinspection JSMethodCanBeStatic
    /**
     * Sets PORT default Risk settings. PortfolioHelperService is "default" settings which essentially is fallback for portfolio settings. (portDefaults)
     */
    private setPortDefaultRiskSettings(portDefaultRiskSettings: DefaultRiskSettings, parentRiskSettings: RiskSettings): RiskSettings {
        const riskSettings = new RiskSettings();

        riskSettings.economyRiskSettings = new EconomySettings(
            parentRiskSettings.economyRiskSettings,
            CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORT_DEFAULT
        );
        riskSettings.economyRiskSettings.setPortDefaultEconomyRiskSettings(portDefaultRiskSettings);

        riskSettings.exposureRiskSettings = new ExposureSettings(
            parentRiskSettings.exposureRiskSettings,
            CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORT_DEFAULT
        );
        riskSettings.exposureRiskSettings.setPortDefaultExposureRiskSettings(portDefaultRiskSettings);

        riskSettings.advancedRiskSettings = new AdvancedRiskSettings(
            parentRiskSettings.advancedRiskSettings,
            CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORT_DEFAULT
        );
        riskSettings.advancedRiskSettings.setAdvancedRiskSettings();
        riskSettings.advancedRiskSettings.setPortDefaultAdvancedRiskSettings(portDefaultRiskSettings);
        riskSettings.hvarRiskSettings = new HvarRiskSettingsModel(parentRiskSettings.hvarRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORT_DEFAULT);

        riskSettings.mcvarRiskSettings = new MCVaRRiskSettingsModel(parentRiskSettings.mcvarRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORT_DEFAULT);

        return riskSettings;
    }

    // noinspection JSMethodCanBeStatic
    /**
     * Sets ORG default Risk settings. This is "default" settings which essentially is fallback for portfolio settings. (portDefaults)
     */
    private setDefaultRiskSettings(portfolioDefaults: PortfolioDefaults, datePicker: DateValue): RiskSettings {
        const riskSettings = new RiskSettings();

        riskSettings.economyRiskSettings = new EconomySettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.ORG_DEFAULT);
        riskSettings.economyRiskSettings.setDefaultEconomyRiskSettings(portfolioDefaults);
        riskSettings.economyRiskSettings.dateObject = datePicker;

        riskSettings.exposureRiskSettings = new ExposureSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.ORG_DEFAULT);
        riskSettings.exposureRiskSettings.setDefaultExposureRiskSettings(portfolioDefaults);

        riskSettings.advancedRiskSettings = new AdvancedRiskSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.ORG_DEFAULT);
        riskSettings.advancedRiskSettings.setAdvancedRiskSettings();

        riskSettings.hvarRiskSettings = new HvarRiskSettingsModel(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.ORG_DEFAULT);
        riskSettings.mcvarRiskSettings = new MCVaRRiskSettingsModel(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.ORG_DEFAULT);

        return riskSettings;
    }

    private initializePortfolioRiskSettings(parentRiskSettings: RiskSettings): void {
        this.portfolioRiskSettings = new RiskSettings();
        this.portfolioRiskSettings.economyRiskSettings = new EconomySettings(
            parentRiskSettings.economyRiskSettings,
            CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO
        );
        this.portfolioRiskSettings.exposureRiskSettings = new ExposureSettings(
            parentRiskSettings.exposureRiskSettings,
            CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO
        );
        this.portfolioRiskSettings.advancedRiskSettings = new AdvancedRiskSettings(
            parentRiskSettings.advancedRiskSettings,
            CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO
        );
        this.portfolioRiskSettings.hvarRiskSettings = new HvarRiskSettingsModel(parentRiskSettings.hvarRiskSettings,
            CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);
        this.portfolioRiskSettings.mcvarRiskSettings = new MCVaRRiskSettingsModel(parentRiskSettings.mcvarRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);
    }

    setDefaultBenchmark(): void {
        // Now that the benchmarks have been updated we should ensure that the benchmark object has been set correctly.
        // Need to assign the benchmark based on the following criteria.
        //  1.  If there is an assigned benchmark already then look that up in the available list and use it.
        //  2.  If still no benchmark then assign the first RISK benchmark we find.
        //  3.  Assign none.
        if (this.benchmark) {
            if (this.benchmark.portfolio && this.benchmark.portfolio.id) {
                return;
            }

            if (
                (this.benchmark.name === BenchmarkConstants.BENCH_SECONDARY ||
                    this.benchmark.name === BenchmarkConstants.BENCH_PRIMARY ||
                    this.benchmark.type === BenchmarkConstants.BENCH_AGGREGATE) &&
                this.isPortfolioGroup
            ) {
                // This is an aggregate BM so set the params correctly.
                let order = this.benchmark.order;
                if (!order) {
                    order = this.benchmark.name === BenchmarkConstants.BENCH_PRIMARY ? 1 : 2;
                }
                this.benchmark = Benchmark.create(BenchmarkConstants.BENCH_AGGREGATE, order, this.benchmark.name);
                return;
            } else if (this.benchmark.type && !isUndefined(this.benchmark.order)) {
                // There is a type and order so we want to make sure it exists before allowing the selection.
                const bench = find(this.benchmarks, (item) => item.type === this.benchmark.type && item.order === this.benchmark.order);
                if (bench) {
                    this.benchmark = Benchmark.create(bench.type, bench.order, bench.name);
                    return;
                }
            } else if (BenchmarkConstants.NONE_BENCH === this.benchmark.type || this.benchmark.name === BenchmarkConstants.NONE_BENCH) {
                // If none is assigned then set it.
                this.benchmark = Benchmark.create(BenchmarkConstants.NONE_BENCH);
                return;
            } else if (this.benchmark.type === BenchmarkConstants.OTHER_BENCH) {
                // create 'OTHER' benchmark with name and assign it
                this.benchmark = Benchmark.create(BenchmarkConstants.OTHER_BENCH, null, this.benchmark.name);
                return;
            } else if (this.benchmark.name) {
                // Create an other benchmark with the assigned BM set.
                // TODO:  Do we need to check that the user has perms to it?
                this.benchmark = Benchmark.create(BenchmarkConstants.NONE_BENCH, null, this.benchmark.name);
                return;
            }
        }

        // Now find the risk benchmark sorted by order and grab the first one.
        let defaultBench = this.findBenchmark(BenchmarkConstants.BENCH_TYPE_RISK);
        if (!defaultBench && this.isPortfolioGroup) {
            defaultBench = this.findBenchmark(BenchmarkConstants.BENCH_AGGREGATE);
        }
        if (defaultBench) {
            this.benchmark = Benchmark.create(defaultBench.type, defaultBench.order, defaultBench.name);
            return;
        }

        // If we got to here then we just want to assign the non benchmark.
        this.benchmark = Benchmark.create(BenchmarkConstants.NONE_BENCH);
    }

    private deserializeExpostSettings(data: ExpostSettings) {
        this.expostSettings = new ExpostSettings();
        this.expostSettings.deserialize(data);
    }

    /**
     * Implementation of abstract doCopyFrom
     */
    protected doCopyFrom(source: AbstractFavoriteConfig): void {
        if (!(source instanceof Portfolio)) {
            return;
        }

        const sourcePortfolio: Portfolio = source;
        this.portName = sourcePortfolio.portName;
        this.fullName = sourcePortfolio.fullName;
        this.cusip = sourcePortfolio.cusip;
        this.datePicker = sourcePortfolio.datePicker;
        this.benchmarks = cloneDeep(sourcePortfolio.benchmarks);
        this.benchmark = cloneDeep(sourcePortfolio.benchmark);
        this.isPortfolioGroup = sourcePortfolio.isPortfolioGroup;
        this.currency = sourcePortfolio.currency;
        this.timePeriods = sourcePortfolio.timePeriods;
        this.mandateSettings = sourcePortfolio.mandateSettings;
        this.isSecurityModellingAllowed = sourcePortfolio.isSecurityModellingAllowed;
        this.isSectorModellingAllowed = sourcePortfolio.isSectorModellingAllowed;
        this.isPortfolioModellingAllowed = sourcePortfolio.isPortfolioModellingAllowed;
        this.isCompositePortfolio = sourcePortfolio.isCompositePortfolio;
        this.portfolioDefaults = cloneDeep(sourcePortfolio.portfolioDefaults);
        this.indexWeights = cloneDeep(sourcePortfolio.indexWeights);
        this.epnlSettings = cloneDeep(sourcePortfolio.epnlSettings);
        this.cloneChangesInPortLevelSettings(sourcePortfolio);
    }

    /**
     * clone changes in portfolio level settings to original portfolio
     */
    cloneChangesInPortLevelSettings(sourcePortfolio: Portfolio): void {
        this.splitPositionSettings = cloneDeep(sourcePortfolio.splitPositionSettings);
        this.positionModeSettings = cloneDeep(sourcePortfolio.positionModeSettings);
        this.portfolioRiskSettings = cloneDeep(sourcePortfolio.portfolioRiskSettings);
        this.performanceSettings = cloneDeep(sourcePortfolio.performanceSettings);
        this.lookthroughSettings = cloneDeep(sourcePortfolio.lookthroughSettings);
        this.expostSettings = cloneDeep(sourcePortfolio.expostSettings);
        this.epnlSettings = cloneDeep(sourcePortfolio.epnlSettings);
        this.filter = cloneDeep(sourcePortfolio.filter);
        this.applyFilterTo = sourcePortfolio.applyFilterTo;
        this.factorAttributionSettings = cloneDeep(sourcePortfolio.factorAttributionSettings);
        this.decisionLevelsConfig = cloneDeep(sourcePortfolio.decisionLevelsConfig);
    }

    private doDeserializePortfolios(data: any) {
        this.portName = data.ticker;
        this.portId = data.portId;
        this.portCode = data.code;
        if (isNil(this.portId)) {
            this.generateUniquePortId();
        }
        this.fullName = data.fullName;
        this.cusip = data.cusip;

        if (!isUndefined(data.isIndexResearchPortfolio)) {
            this.isIndexResearchPortfolio = data.isIndexResearchPortfolio;
        }

        this.isPortfolioGroup = data.portfolioGroup;
        if (this.isPortfolioGroup && data.portfolios) {
            this.portfolios = [];
            data.portfolios.forEach((portfolio) => {
                const childPortfolio = new Portfolio();
                childPortfolio.deserialize(portfolio);
                this.portfolios.push(childPortfolio);
            });
        }

        if (!isUndefined(data.compositePortfolio)) {
            this.isCompositePortfolio = data.compositePortfolio;
        }

        if (data.portfolioDefaults) {
            this.portfolioDefaults = new PortfolioDefaults(data.portfolioDefaults);
        }

        // For Prism favorites the title comes as name so assign it to title
        if (data.name) {
            this.title = data.name;
        }

        if (data.fullName) {
            this.fullName = data.fullName;
        }
    }

    private doDeserializeSettings(data: any) {
        if (data.lookthroughSettings) {
            this.lookthroughSettings = new LookThroughSettingsWithRules(data.lookthroughSettings);
        }
        // This check will prevent reinitialization of split-setting with empty input
        if (!isUndefined(data.splitPositionTypes)) {
            this.splitPositionSettings = new SplitPositionSettings(data.splitPositionTypes);
        }

        if (!isUndefined(data.positionModeSettings)) {
            this.positionModeSettings = new PositionModeSettings(data.positionModeSettings);
        }

        if (!isUndefined(data.factorAttributionSettings)) {
            this.factorAttributionSettings = new FactorAttributionSettings(data.factorAttributionSettings);
        }

        if (data.performanceSettings) {
            this.performanceSettings = new PerformanceSettings();
            this.performanceSettings.deserialize(data.performanceSettings);
            this.performanceSettings.sourceName = CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO;
            if (data.performanceSettings.expostSettings) {
                this.deserializeExpostSettings(data.performanceSettings.expostSettings);
            }
        }
        if (data.epnlSettings) {
            this.epnlSettings = new EpnlSettings();
            this.epnlSettings.deserialize(data.epnlSettings);
        }
        if (data.expostSettings) {
            this.deserializeExpostSettings(data.expostSettings);
        }

        if (data.orgDefaultRiskSettings) {
            this.orgDefaultRiskSettings = new DefaultRiskSettings(data.orgDefaultRiskSettings);
        }

        if (data.portDefaultRiskSettings) {
            this.portDefaultRiskSettings = new DefaultRiskSettings(data.portDefaultRiskSettings);
        }

        if (data.portfolioRiskSettings) {
            this.portfolioRiskSettings = new RiskSettings();
            this.portfolioRiskSettings.deserialize(data.portfolioRiskSettings);
        }

        if(data.decisionLevelsConfig){
            this.decisionLevelsConfig = new DecisionLevelConfig(data.decisionLevelsConfig);
        }
    }

    private doDeserializeFilterSettings(data: any) {
        if (data.filter) {
            if (data.filter instanceof CustomFilter) {
                this.filter = data.filter;
            } else {
                this.filter.deserialize(data.filter);
            }
            this.applyFilterTo = data.applyFilterTo;
        } else if (data.compositionSetting && data.compositionSetting.filter) {
            // For backward compatibility when composition setting used to be on base portfolio object and filter was inside composition setting
            // Data passed in conditional to handle different old favorite where it's stored as data.compositionFilter or data.compositionFilter.data
            this.filter = new CustomFilter(data.compositionSetting.filter.data ? data.compositionSetting.filter.data : data.compositionSetting.filter);
            this.applyFilterTo = data.compositionSetting.applyFilterTo;
        }
    }

    /**
     * Implementation of abstract doDeserialize
     */
    protected doDeserialize(data: any): void {
        this.doDeserializePortfolios(data);

        if (data.benchmark) {
            this.benchmark = new Benchmark(data.benchmark);
        }

        if (data.datePicker) {
            this.datePicker = new DateValue(data.datePicker);
            if (data.datePicker.dateString) {
                this.datePicker.date = undefined;
            }
        }

        if (data.benchmarks) {
            this.benchmarks = [];
            data.benchmarks.forEach((benchmarkData) => this.benchmarks.push(new Benchmark(benchmarkData)));
        }

        // Only set the currency if it is not already set so that operations like date change don't override users choice
        if (data.currency && isNil(this.currency)) {
            this.currency = data.currency;
        }

        this.doDeserializeSettings(data);

        if (data.indexWeights) {
            this.indexWeights = [];
            forEach(data.indexWeights, (indexWeight) => {
                this.indexWeights.push(new IndexWeight(indexWeight));
            });
        }

        if (data.timePeriods) {
            this.timePeriods = data.timePeriods;
        }

        this.doDeserializeFilterSettings(data);

        if (data.multiFrequencyMaxPeriodsMap) {
            this.multiFrequencyMaxPeriodsMap = data.multiFrequencyMaxPeriodsMap;
        }

        if (!isUndefined(data.isSecurityModellingAllowed)) {
            this.isSecurityModellingAllowed = data.isSecurityModellingAllowed;
        }

        if (!isUndefined(data.isSectorModellingAllowed)) {
            this.isSectorModellingAllowed = data.isSectorModellingAllowed;
        }

        if (!isUndefined(data.isPortfolioModellingAllowed)) {
            this.isPortfolioModellingAllowed = data.isPortfolioModellingAllowed;
        }
    }

    private doSerializePortfolioRiskSettings(saved): any {
        if (this.portfolioRiskSettings) {
            if (this.portfolioRiskSettings instanceof RiskSettings) {
                saved.portfolioRiskSettings = this.portfolioRiskSettings.serialize();
            } else {
                saved.portfolioRiskSettings = this.portfolioRiskSettings;
            }
        }
    }

    private doSerializeDatePicker(saved): any {
        if (this.datePicker) {
            saved.datePicker = this.datePicker.serialize();
            if (this.datePicker.dateString) {
                delete saved.datePicker['date'];
            }
        }
    }

    /**
     * Implementation of abstract doSerialize
     */
    protected doSerialize(_isNested?: boolean | SerializeFavoriteType): any {
        const saved: any = {};

        saved.configType = this.getConfigType();
        saved.ticker = this.portName;
        saved.portId = this.portId;
        saved.cusip = this.cusip;
        saved.currency = this.currency;
        // we need to stored this information since a workpad can have both index reasearch and non index research portfolio
        saved.isIndexResearchPortfolio = this.isIndexResearchPortfolio;

        if (this.benchmark) {
            saved.benchmark = this.benchmark.serialize();
        }

        this.doSerializeDatePicker(saved);

        const serializedPerformanceSettings = this.performanceSettings?.doSerialize();
        if (!isEmpty(serializedPerformanceSettings)) {
            saved.performanceSettings = serializedPerformanceSettings;
        }

        if (this.expostSettings) {
            saved.expostSettings = this.expostSettings.serialize();
        }

        this.doSerializePortfolioRiskSettings(saved);

        if (this.lookthroughSettings) {
            saved.lookthroughSettings = this.lookthroughSettings.serialize();
        }

        if (this.splitPositionSettings) {
            saved.splitPositionTypes = this.splitPositionSettings.serialize();
        }

        if (this.positionModeSettings) {
            saved.positionModeSettings = this.positionModeSettings.serialize();
        }
        if (this.factorAttributionSettings) {
            saved.factorAttributionSettings = this.factorAttributionSettings.serialize(_isNested);
        }

        if (this.decisionLevelsConfig) {
            saved.decisionLevelsConfig = this.decisionLevelsConfig.serialize();
        }

        if (this.filter && !this.filter.isFilterEmpty()) {
            saved.filter = this.filter.serialize(true);
            saved.applyFilterTo = this.applyFilterTo;
        }

        if (this.epnlSettings) {
            saved.epnlSettings = this.epnlSettings.serialize();
        }

        return saved;
    }

    protected getConfigType(): string {
        return Portfolio.configType;
    }

    static get configType(): string {
        return 'portfolio';
    }

    /**
     * returns portfolio type used for telemetry tracking
     */
    getTelemetricPortfolioType(): ExplorePortfolioTypeEnum {
        if (this.getConfigType() === CompositionConstants.ADHOC_PORT_GROUP_CONFIG_TYPE || this.getConfigType() === CompositionConstants.ADHOC_PORT_CONFIG_TYPE) {
            return ExplorePortfolioTypeEnum.CREATE_FROM_SCRATCH;
        } else if (this.getConfigType() === CompositionConstants.PORT_WITH_POSITIONS.TYPE) {
            return ExplorePortfolioTypeEnum.POINT_IN_TIME_ANALYSIS;
        } else if (this.getConfigType() === CompositionConstants.PORT_WITH_RULES.TYPE && this['modellingType'] === ModellingType.PORTFOLIO) {
            return ExplorePortfolioTypeEnum.THROUGH_TIME_ANALYSIS_PORTFOLIO;
        } else if (this.getConfigType() === CompositionConstants.PORT_WITH_RULES.TYPE && this['modellingType'] === ModellingType.SECTOR) {
            return ExplorePortfolioTypeEnum.THROUGH_TIME_ANALYSIS_SECTOR;
        }
        return ExplorePortfolioTypeEnum.PORTFOLIO;
    }

    /**
     * get portfolio title e.g> BGF Pacific Equity Fund (PEP)
     */
    getPortfolioHeaderTitle(donotTruncate?: boolean): string {
        const truncateLength = 50;
        const displayTitle = this.getDisplayTitle();
        return isUndefined(this.fullName)
            ?
            `${displayTitle}`
            :
            ((this.fullName.length + displayTitle.length) > truncateLength && !donotTruncate)
                ?
                `${this.fullName.slice(0, truncateLength) + CommonConstants.TRUNCATION_KEY}`
                :
                `${this.fullName} (${displayTitle})`
            ;
    }

    /**
     * get portfolio title for sidebar
     */
    getPortfolioTitleForSideBar(): string {
        return this.getPortfolioHeaderTitle(true);
    }

    /**
     * Function to initialize portfolio with default settings
     */
    loadPortfolioDefaultSettings(): void {
        if (!this.isBench) {
            // Set benchmarks
            this.updateBenchmarks();

            // Set performance settings
            if (!this.performanceSettings) {
                this.performanceSettings = new PerformanceSettings();
                this.performanceSettings.sourceName = CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO;
            }

            if (!this.performanceSettings.parentPerformanceSettings) {
                this.performanceSettings.parentPerformanceSettings = PerformanceSettings.createPerformanceSettings(
                    undefined,
                    PerformanceSettings.createDefaultTimePeriod(),
                    this.createDefaultAttributionSettings()
                );
                this.performanceSettings.parentPerformanceSettings.sourceName = CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORT_DEFAULT;
            }

            // Set expost settings
            if (!this.expostSettings) {
                this.expostSettings = new ExpostSettings();
                this.setDefaultExpostSettings();
            } else if (this.expostSettings.statisticPeriods.length === 0) {
                // For old favorites where this setting was not present
                this.expostSettings.statisticPeriods.push(new TimePeriod('1 Year', 1, TimePeriodShortName.YEARS));
            }
            // Set risk settings
            this.setPortfolioRiskSettings();
        }
        // Set Default FactorAttribution Settings
        if (isEmpty(this.factorAttributionSettings) || isEmpty(this.factorAttributionSettings.factorAttributionType)) {
            this.factorAttributionSettings = this.createDefaultFactorAttributionSettings();
        }
    }

    /**
     * Set default expost settings for the portfolio
     */
    setDefaultExpostSettings(): void {
        this.expostSettings.samplingPeriod = new TimePeriod('1 Month', 1, TimePeriodShortName.MONTHS);
        this.expostSettings.statisticPeriods = [new TimePeriod('1 Year', 1, TimePeriodShortName.YEARS)];
        this.expostSettings.isNetReturns = false;
        this.expostSettings.isLogNormal = false;
    }

    /**
     * Adds request parameters for portfolio
     */
    addRequestParams(requestParams: any): void {
        requestParams.portfolio = this.portName;
        requestParams.fullPortfolioName = this.fullName;
        requestParams.portfolioIdentifier = this.getDisplayTitle();
        requestParams.forDate = this.datePicker.date;
        requestParams.currency = this.currency;
        requestParams.holidayCalendar = this.datePicker.calCode ? this.datePicker.calCode : this.portfolioDefaults.calendar;
        requestParams.includeAliasPortfolios = isNil(this.isIndexResearchPortfolio) ? false : this.isIndexResearchPortfolio;
        requestParams.portId = this.portId;
        if (!isUndefined(this.benchmark)) {
            this.benchmark.addRequestParams(requestParams);
        }

        const portfolioSettings: RequestParamsCreator[] = [this.splitPositionSettings, this.lookthroughSettings, this.positionModeSettings, this.factorAttributionSettings, this.decisionLevelsConfig];

        // add filterTargetType if compositionFilter got added otherwise don't add
        if (this.filter && !this.filter.isFilterEmpty()) {
            requestParams.filterTargetType = this.applyFilterTo ? this.applyFilterTo : 'BOTH';
            this.filter.addRequestParams(requestParams, 'compositionFilter');
        }

        this.addPortfolioSettingRequestParams(requestParams, ...portfolioSettings);
    }

    /**
     * Add portfolio setting to request params
     */
    private addPortfolioSettingRequestParams(requestParams: any, ...settings: RequestParamsCreator[]): void {
        settings.forEach(function (setting) {
            if (setting) {
                setting.addRequestParams(requestParams);
            }
        });
    }

    /**
     * Generate unique portId for portfolio object
     */
    generateUniquePortId(): void {
        this.portId = this.portName + CommonUtils.generateUniqueIdAsString();
    }

    /**
     * Get the display title for a portfolio
     */
    getDisplayTitle(): string {
        return !isEmpty(this.title) ? this.title : this.portName;
    }

    /**
     * Check if portfolio has been initialized with port info
     */
    isInitialized(): boolean {
        return !(isNil(this.portfolioDefaults) && isNil(this.orgDefaultRiskSettings) && isNil(this.portDefaultRiskSettings) && isEmpty(this.fullName));
    }

    /**
     * This method will be used to determine if a portfolio is modified or not. Instead of performing this check at every place,
     * we use call this method on the Portfolio model object
     */
    isModified(): boolean {
        // portfolio with an id means its a saved favorite and is already modified
        return !isNil(this.id);
    }

    /**
     * Create default attribution settings
     */
    createDefaultAttributionSettings(): AttributionSettings {
        const defaultAttributionSettings = new AttributionSettings();
        defaultAttributionSettings.sourceName = CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORT_DEFAULT;

        // First check if a mandate has been set and use that
        if (this.mandateSettings?.settings.get(FavoriteType.ATTRIBUTION_TYPE)) {
            // For attribution settings its a simple string so set it and also update the columns accordingly
            defaultAttributionSettings.cannedMethod = this.mandateSettings.settings.get(FavoriteType.ATTRIBUTION_TYPE) as string;
        } else if (this.assetType) {
            // Next try to get a default as portfolio's asset type. Column service provides list of available canned settings and the first among them that matches the asset type of portfolio is used
            for (const cannedAttributionMethod of CoreDefinitionStore.praadaCannedAttributionMethods) {
                if (cannedAttributionMethod.assetClass === this.assetType) {
                    defaultAttributionSettings.cannedMethod = cannedAttributionMethod.name;
                    break;
                }
            }
        } else {
            // If portfolio asset type is also not defined, then default to MULTI_ASSET
            defaultAttributionSettings.cannedMethod = 'MULTI_ASSET';
        }

        const chosenPraadaCannedAttributionMethod = CoreDefinitionStore.praadaCannedAttributionMethods.filter(attributionMethod => defaultAttributionSettings.cannedMethod === attributionMethod.name)[0];
        if (chosenPraadaCannedAttributionMethod) {
            defaultAttributionSettings.factors = chosenPraadaCannedAttributionMethod.excessMethodologies[0].factors;
            defaultAttributionSettings.sectorWeighting = chosenPraadaCannedAttributionMethod.attributionWeightType;
            defaultAttributionSettings.attributionCalculatorMethod = chosenPraadaCannedAttributionMethod.attributionCalculatorMethod;
            defaultAttributionSettings.sectorLevel = chosenPraadaCannedAttributionMethod.sectorLevel;
            defaultAttributionSettings.exposureMode = chosenPraadaCannedAttributionMethod.notionalMode;
        }

        return defaultAttributionSettings;
    }

    getDisplayType(parent?: any): FavoriteDisplayEnum {
        return FavoriteDisplayEnum.PORTFOLIO;
    }

    /**
     * Create default factor attribution settings
     */
    createDefaultFactorAttributionSettings(): FactorAttributionSettings {
        const factorAttributionSettings1 = new FactorAttributionSettings();
        // First check if a mandate has been set and use that
        if (this.mandateSettings?.settings.get(FavoriteType.MANDATE)) {
            // Set to portfolio FavoriteType Mandate
            factorAttributionSettings1.factorAttributionType = this.mandateSettings.settings.get(FavoriteType.MANDATE) as string;
        } else if (this.assetType) {
            // Next try to get a default as portfolio's asset type.
            factorAttributionSettings1.factorAttributionType = this.assetType;
        } else {
            // If portfolio asset type is also not defined, then default to MULTI_ASSET
            factorAttributionSettings1.factorAttributionType = AssetType.MULTI_ASSET;
        }
        factorAttributionSettings1.originalFactorAttributionType = factorAttributionSettings1.factorAttributionType;
        return factorAttributionSettings1;
    }
}
