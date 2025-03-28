import {Component, Input, OnInit} from '@angular/core';
import {CoreDefinitionStore, SubscribableComponent, WidgetConfigType} from '@blk/explore-ui-core';
import {CoreRiskConstants, EconomySettings, ExposureSettings, RiskSettings} from '@blk/explore-ui-risk';
import {VizualizationColumnConfig} from '@interfaces/request.interface';
import {FooterDetails} from '@interfaces/response.interface';
import {Widget} from '@models/widget/widget.model';
import {RiskSettingsUtils} from '@utils/risk-settings.utils';
import {cloneDeep, isArray, isString} from 'lodash';
import {BehaviorSubject, combineLatest} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

/**
 * Footnotes Component
 *  process data from dataStore and pass them down to the presenter components
 */
@Component({
    selector: 'app-foot-notes',
    templateUrl: './foot-notes.component.html',
    styleUrls: ['./foot-notes.component.scss']
})
export class FootNotesComponent extends SubscribableComponent implements OnInit {
    @Input() widget: Widget;

    riskSettingsSummaryDetails: { valueList: string[], sourceList: string[] };
    columnSettingsOverrideDetails: { columnKey: string, columnTitle: string, properties: any[] }[];
    scenarioDetails: { code: string, title: string, details: string[], properties: { label: string, value: string }[] }[];
    lookThroughProxyDetails: string[];
    missingExposureDetails: string[];
    missingUnitValuesDetails: string[];
    dateOverrideDetails: { columnKeys: string, columnTitle: string, dates: any[] }[];

    riskSettingsLevel: string;
    hvarRiskSettingsDetail: Map<string, {value: string | number, source: string}>;
    mcVarRiskSettingsDetail: Map<string, {value: string | number, source: string}>;

    riskSettings$: BehaviorSubject<RiskSettings> = new BehaviorSubject<RiskSettings>(null);
    footerDetails$: BehaviorSubject<FooterDetails> = new BehaviorSubject(null);

    readonly riskSettingsKeys = [
        CoreRiskConstants.EXPOSURE_SETTINGS_PROPERTIES.RISK_MODEL,
        CoreRiskConstants.ECONOMY_SETTINGS_PROPERTIES.DATE_OBJECT,
        CoreRiskConstants.ECONOMY_SETTINGS_PROPERTIES.WEIGHTING_SCHEME,
        CoreRiskConstants.ECONOMY_SETTINGS_PROPERTIES.PERIOD,
        CoreRiskConstants.ECONOMY_SETTINGS_PROPERTIES.DECAY_FACTOR,
        CoreRiskConstants.ECONOMY_SETTINGS_PROPERTIES.RISK_HORIZON,
        CoreRiskConstants.ECONOMY_SETTINGS_PROPERTIES.CONFIDENCE_LEVEL_SD
    ];

    /**
     * ngOnInit
     */
    ngOnInit(): void {
        combineLatest([this.widget.dataStore.getMetaData$(), this.widget.dataStore.getData$()])
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(([widgetDataStoreMetaData, widgetPayload]) => {
                if (widgetDataStoreMetaData) {
                    const riskSettings = widgetDataStoreMetaData.inputs.get(CoreRiskConstants.RISK_SETTINGS) as RiskSettings;

                    if (riskSettings) {
                        this.riskSettingsLevel = riskSettings.advancedRiskSettings.name;
                        this.initExposureRiskSettings(riskSettings.exposureRiskSettings);
                        this.initEconomyRiskSettings(riskSettings.economyRiskSettings);
                        this.getRiskSettingsSummaryDetails(riskSettings.exposureRiskSettings, riskSettings.economyRiskSettings);

                        this._buildHVaRAndMcVaRRiskSettingsDetail(riskSettings);

                        if (widgetPayload && widgetPayload.requestConfig && widgetPayload.requestConfig.columns) {
                            this.getColumnSettingsOverrideDetails(riskSettings, widgetPayload.requestConfig.columns);
                        }
                        this.riskSettings$.next(riskSettings);
                    }
                }

                if (widgetPayload && widgetPayload.responseConfig && widgetPayload.responseConfig.footerDetails) {
                    this.getScenarioDetails(widgetPayload.responseConfig.footerDetails);
                    this.getLookThroughProxyDetails(widgetPayload.responseConfig.footerDetails);
                    this.getMissingExposureDetails(widgetPayload.responseConfig.footerDetails);
                    this._populateMissingUnitValues(widgetPayload.responseConfig.footerDetails);
                    this.getDateOverrideDetails(widgetPayload.responseConfig);

                    this.footerDetails$.next(widgetPayload.responseConfig.footerDetails);
                }
            });
    }

    private _buildHVaRAndMcVaRRiskSettingsDetail(riskSettings: RiskSettings): void {
        if (WidgetConfigType.PNL_TS === this.widget.configType) {
            this.hvarRiskSettingsDetail = RiskSettingsUtils.buildHVaRRiskSettingsPropertyValue(riskSettings.hvarRiskSettings);
        }
        if (WidgetConfigType.MCVAR_PNL_TS === this.widget.configType) {
            this.mcVarRiskSettingsDetail = RiskSettingsUtils.buildMCVaRRiskSettingsPropertyValue(riskSettings.mcvarRiskSettings);
        }
    }

    /**
     * Init exposure risk settings
     */
    private initExposureRiskSettings(exposureRiskSettings: ExposureSettings): void {
        if (!exposureRiskSettings) {
            return;
        }
        exposureRiskSettings.riskModels = cloneDeep(CoreDefinitionStore.riskModelList);
        exposureRiskSettings.checkGPDefault();
    }

    /**
     * Init economy risk settings
     */
    private initEconomyRiskSettings(economyRiskSettings: EconomySettings): void {
        if (!economyRiskSettings) {
            return;
        }
        economyRiskSettings.initWeightingSchemes();
        economyRiskSettings.addWeightingSchemeIfItDoesntExist();
        economyRiskSettings.riskHorizons = cloneDeep(CoreDefinitionStore.riskHorizon);
        economyRiskSettings.resetHalfLife();
        economyRiskSettings.computeConfidenceLevelInPercentage();
        economyRiskSettings.computeHalfLifeInDays();
    }

    /**
     * Update risk settings summary info
     */
    private getRiskSettingsSummaryDetails(exposureRiskSettings: ExposureSettings, economyRiskSettings: EconomySettings): void {
        if (!exposureRiskSettings || !economyRiskSettings) {
            return;
        }
        const riskSettingsSummaryDetails = {valueList: [], sourceList: []};

        // update value list
        riskSettingsSummaryDetails.valueList = [
            // Risk Model
            RiskSettingsUtils.getRiskModelLabel(exposureRiskSettings),
            // Economy Date
            RiskSettingsUtils.getEconomyRiskDate(economyRiskSettings),
            // Weighting Scheme
            RiskSettingsUtils.getWeightingSchemeLabel(economyRiskSettings),
            // Period
            RiskSettingsUtils.getEconomyRiskPeriod(economyRiskSettings),
            // Half-Life
            RiskSettingsUtils.getEconomyRiskHalfLife(economyRiskSettings),
            // Risk Horizon
            RiskSettingsUtils.getRiskHorizonLabel(economyRiskSettings),
            // Confidence Level
            RiskSettingsUtils.getEconomyRiskConfidenceLevel(economyRiskSettings),
        ];

        // update source list
        for (const key of this.riskSettingsKeys) {
            if (key === CoreRiskConstants.EXPOSURE_SETTINGS_PROPERTIES.RISK_MODEL) {
                riskSettingsSummaryDetails.sourceList.push(exposureRiskSettings.getSourceName(key));
            } else {
                riskSettingsSummaryDetails.sourceList.push(economyRiskSettings.getSourceName(key));
            }
        }
        this.riskSettingsSummaryDetails = riskSettingsSummaryDetails;
    }

    /**
     * Get column settings override details
     */
    private getColumnSettingsOverrideDetails(riskSettings: RiskSettings, columns: VizualizationColumnConfig[]): void {
        const columnSettingsOverrideDetails = [];

        for (const column of columns) {
            if (column.riskSettings) {
                const columnPropertyList = [];

                if (column.riskSettings && column.riskSettings.exposureRiskSettings) {
                    const exposureRiskSettings = new ExposureSettings(riskSettings.exposureRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.COLUMN);
                    exposureRiskSettings.deserialize(column.riskSettings.exposureRiskSettings);

                    this.initExposureRiskSettings(exposureRiskSettings);

                    // Risk Model
                    if (exposureRiskSettings.doesValueExist(CoreRiskConstants.EXPOSURE_SETTINGS_PROPERTIES.RISK_MODEL)) {
                        columnPropertyList.push({
                            label: CoreRiskConstants.LABEL.RISK_MODEL,
                            value: RiskSettingsUtils.getRiskModelLabel(exposureRiskSettings)
                        });
                    }
                }

                if (column.riskSettings && column.riskSettings.economyRiskSettings) {
                    const economyRiskSettings = column.riskSettings.economyRiskSettings;

                    this.initEconomyRiskSettings(economyRiskSettings);

                    // Economy Date
                    if (economyRiskSettings.doesValueExist(CoreRiskConstants.ECONOMY_SETTINGS_PROPERTIES.DATE_OBJECT) &&
                        economyRiskSettings.dateObject.date !== riskSettings.economyRiskSettings.dateObject.date) {
                        columnPropertyList.push({
                            label: CoreRiskConstants.LABEL.ECONOMY_DATE,
                            value: RiskSettingsUtils.getEconomyRiskDate(economyRiskSettings)
                        });
                    }

                    // Weighting Scheme
                    if (economyRiskSettings.doesValueExist(CoreRiskConstants.ECONOMY_SETTINGS_PROPERTIES.WEIGHTING_SCHEME)) {
                        columnPropertyList.push({
                            label: CoreRiskConstants.LABEL.WEIGHTING_SCHEME,
                            value: RiskSettingsUtils.getWeightingSchemeLabel(economyRiskSettings)
                        });
                    }

                    // Period
                    if (economyRiskSettings.doesValueExist(CoreRiskConstants.ECONOMY_SETTINGS_PROPERTIES.PERIOD)) {
                        columnPropertyList.push({
                            label: CoreRiskConstants.LABEL.PERIOD,
                            value: RiskSettingsUtils.getEconomyRiskPeriod(economyRiskSettings)
                        });
                    }

                    // Half-Life
                    if (economyRiskSettings.doesValueExist(CoreRiskConstants.ECONOMY_SETTINGS_PROPERTIES.DECAY_FACTOR)) {
                        columnPropertyList.push({
                            label: CoreRiskConstants.LABEL.HALF_LIFE,
                            value: RiskSettingsUtils.getEconomyRiskHalfLife(economyRiskSettings)
                        });
                    }

                    // Risk Horizon
                    if (economyRiskSettings.doesValueExist(CoreRiskConstants.ECONOMY_SETTINGS_PROPERTIES.RISK_HORIZON)) {
                        columnPropertyList.push({
                            columnTitle: column.columnTitle,
                            label: CoreRiskConstants.LABEL.RISK_HORIZON,
                            value: RiskSettingsUtils.getRiskHorizonLabel(economyRiskSettings)
                        });
                    }

                    // Confidence Level
                    if (economyRiskSettings.doesValueExist(CoreRiskConstants.ECONOMY_SETTINGS_PROPERTIES.CONFIDENCE_LEVEL_SD)) {
                        columnPropertyList.push({
                            label: CoreRiskConstants.LABEL.CONFIDENCE_LEVEL,
                            value: RiskSettingsUtils.getEconomyRiskConfidenceLevel(economyRiskSettings)
                        });
                    }

                    if (columnPropertyList.length) {
                        columnSettingsOverrideDetails.push({
                            columnKey: column.columnKey,
                            columnTitle: column.columnTitle,
                            properties: columnPropertyList
                        });
                    }
                }
            }
        }
        if (columnSettingsOverrideDetails.length) {
            this.columnSettingsOverrideDetails = columnSettingsOverrideDetails;
        }
    }

    /**
     * Get scenario details
     */
    private getScenarioDetails(footerDetails: FooterDetails): void {
        if (!footerDetails || !footerDetails.scenarios) {
            return;
        }
        const scenarioDetails = [];
        const scenCodes = Object.keys(footerDetails.scenarios);
        const scenTitles = {};

        this.widget.dataStore.data.requestConfig.columns.forEach(col => {
            if (!col.scenarioSettings) {
                return;
            }
            col.scenarioSettings.nameScenarios.forEach(scens => {
                scenTitles[scens.code] = scens.name;
            });
        });

        for (const code of scenCodes) {
            const codeWithoutPurpose = code.split(':')[0];
            const entry = footerDetails.scenarios[code];
            scenarioDetails.push({
                code: codeWithoutPurpose,
                title: scenTitles[code],
                details: entry.shocks,
                properties: [
                    {label: 'Description', value: entry.description},
                    {label: 'Noise Dampening', value: entry.dampening},
                    {label: 'Restrict prediction to Factors', value: entry.restriction},
                    {label: 'Spread Shocks', value: entry.spread_shocks},
                    {label: 'Horizon', value: entry.horizon},
                    {label: 'Warning', value: entry.warning},
                    {label: 'Note', value: entry.note},
                    {label: 'Definition', value: entry.definition},
                    {label: 'Economy Date', value: entry.date},
                    {label: 'Factors whose shock is floored', value: entry.floored_factors}
                ]
            });
        }
        this.scenarioDetails = scenarioDetails;
    }

    private _populateMissingUnitValues(footerDetails: FooterDetails): void {
        if (!footerDetails || !footerDetails.missingUnitValues) {
            return;
        }
        this.missingUnitValuesDetails = footerDetails.missingUnitValues.map(muv => `Cusip ${muv.cusip} is missing a unit value in the ${muv.hierarchy} hierarchy for ${muv.date}`);
    }

    /**
     * Gets the list of proxies if any.
     */
    private getLookThroughProxyDetails(footerDetails: FooterDetails): void {
        if (!footerDetails || !footerDetails.proxies) {
            return;
        }
        const lookThroughProxyDetails = [];
        const rasTypes = ['BondFeature', 'NiiBench', 'PriceCusip', 'PositionCusip', 'UnitProxy' ];
        for (const cusip of Object.keys(footerDetails.proxies)) {
            const entry = footerDetails.proxies[cusip];
            let info = entry.type + ': ' + entry.sec_desc + ' (' + entry.cusip + ') ';
            if (rasTypes.includes(entry.type)) {
                info += 'is proxied to ' + entry.proxy_desc + ' (' + entry.proxy_cusip + ')';
            } else {
                switch (entry.type) {
                    case 'EXPTAGS':
                        info += 'has bondfeature value ' + entry.bf;
                        break;
                    case 'PROXY_EXP':
                        info += 'has bondfeature value ' + entry.bf;
                        break;
                    case 'Look-Thru':
                        info += 'is proxied to ' + entry.proxy_desc + ' (' + entry.proxy_cusip + ')';
                        break;
                    case 'SYS_PROXY':
                        info += 'has systematic proxy';
                        break;
                    default:
                        info += 'proxied to unit exposure of ' + entry.desc;
                        break;
                }
            }
            lookThroughProxyDetails.push(info);
        }
        this.lookThroughProxyDetails = lookThroughProxyDetails;
    }

    /**
     * Get missing exposure details
     */
    private getMissingExposureDetails(footerDetails: FooterDetails): void {
        if (!footerDetails.missingExposures || isString(footerDetails.missingExposures)) {
            return;
        }
        const missingExposureDetails = [];
        const cusips = Object.keys(footerDetails.missingExposures);

        for (const cusip of cusips) {
            const entry = footerDetails.missingExposures[cusip];
            // if entry type is string. It means it is missing exposure detail itself
            if (typeof (entry) === 'string') {
                missingExposureDetails.push(entry);
            } else if (!isArray(entry)) {
                const title = entry.title ? ' in ' + entry.title : '';
                const purpose = entry.purpose ? ' for purpose ' + entry.purpose : '';
                const weight = entry.weight.toFixed(2);
                const info = 'No exposure for ' + weight + '% in ' + entry.asset + ' (' + entry.issuer_cusip + ') on ' + entry.date + purpose + title;
                missingExposureDetails.push(info);
            }
        }
        this.missingExposureDetails = missingExposureDetails;
    }

    /**
     * Get date override details
     */
    private getDateOverrideDetails(responseConfig: any): void {
        if (!responseConfig.columnHeaderDetails || !responseConfig.columnHeaderDetails.columnKeyToDisplayNameMap || !responseConfig.footerDetails || !responseConfig.footerDetails.dateOverride) {
            return;
        }
        const overrideDetails = [];
        const dateOverrideData = responseConfig.footerDetails.dateOverride;
        const columnTitleMap = responseConfig.columnHeaderDetails.columnKeyToDisplayNameMap;

        for (const key of Object.keys(columnTitleMap)) {
            if (dateOverrideData[key]) {
                const dateInfo = [];
                for (let i = 0; i < dateOverrideData[key].length; i++) {
                    dateInfo.push({
                        dateIndex: i,
                        dateTitle: dateOverrideData[key][i][0],
                        expDate: dateOverrideData[key][i][1],
                        econDate: dateOverrideData[key][i][2]
                    });
                }

                overrideDetails.push({
                    columnKey: key,
                    columnTitle: columnTitleMap[key],
                    dates: dateInfo
                });
            }
        }
        this.dateOverrideDetails = overrideDetails;
    }
}
