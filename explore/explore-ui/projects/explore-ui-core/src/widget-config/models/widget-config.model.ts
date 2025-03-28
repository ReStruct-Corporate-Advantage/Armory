import {Deserialize} from '../../core/interfaces';
import {WidgetSize} from './widget-size.model';
import {isObject} from 'lodash';
import {WidgetConfigInputCategory} from '../interfaces';
import {WidgetConfigType, WidgetExportType} from '../enums';

export class WidgetConfig implements Deserialize {
    configType: string;
    size: WidgetSize;
    description: string;
    title: string;
    image: string;
    imageDescription: string;
    setUpRequirements: Array<string> = [];
    showInSelector: boolean;
    includePerformanceBreakdown: boolean;
    restrictBreakdownToSingleLevel: boolean;
    showOnlySingleColumn: boolean;
    createNestedNoneBuckets: boolean;
    createNestedOtherBuckets: boolean;
    isEligibleForLightLookthrough: boolean;
    chartTransition: WidgetConfigType[];
    inputCategories: WidgetConfigInputCategory[];
    showGridTransitionControl: boolean;
    canHaveMultipleOverrideDates: boolean;
    customCalculationColumn: any;
    pgsCustomCalculationColumn: any;
    customCoverageColumn: any;
    styleAnalysis: any;
    restrictedColumnOptions: any;
    tokenToCheck: string;
    userPermToCheck: string;
    hideTopBottomSectorToggle: boolean;
    overrideColTitles: any;
    showAdditionalPerformanceSettings: boolean;
    showAdditionalPerformanceSettingsAttributes: number;
    showAttributionSettings: boolean;
    showReturnTimeSeriesGridToChartTransitionIcon: boolean;
    showWidgetInfoIcon: boolean;
    hideSorting: boolean;
    hideBreakdownInSorting: boolean;
    hideTotal: boolean;
    hasFootNotes: boolean;
    chartingLib: string;
    settingsThatCanUpdateWidgetTitle: Array<string> = [];
    showCompareTabs: boolean;
    exportType: WidgetExportType;
    refreshNotSupported: boolean;
    showTableSearch: boolean;

    constructor(data?: any) {
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * Deserialize data into WidgetConfig properties
     */
    deserialize(data: any) {
        this.configType = data.configType;
        this.size = new WidgetSize(data.size);
        if (data.description) {
            this.description = data.description;
        }
        if (data.title) {
            this.title = data.title;
        }
        if (data.image) {
            this.image = data.image;
        }
        if(data.imageDescription){
            this.imageDescription = data.imageDescription;
        }
        if(data.setUpRequirements){
            this.setUpRequirements = data.setUpRequirements;
        }
        this.showInSelector = data.showInSelector;
        this.includePerformanceBreakdown = data.includePerformanceBreakdown;
        this.restrictBreakdownToSingleLevel = data.restrictBreakdownToSingleLevel;
        this.showOnlySingleColumn = data.showOnlySingleColumn;
        this.createNestedNoneBuckets = data.createNestedNoneBuckets;
        this.createNestedOtherBuckets = data.createNestedOtherBuckets;
        this.isEligibleForLightLookthrough = data.isEligibleForLightLookthrough;
        if (data.chartTransition) {
            this.chartTransition = data.chartTransition;
        }
        if (data.inputCategories) {
            this.inputCategories = data.inputCategories;
        }
        this.showGridTransitionControl = data.showGridTransitionControl;
        this.canHaveMultipleOverrideDates = data.canHaveMultipleOverrideDates;
        if (data.customCalculationColumn) {
            this.customCalculationColumn = data.customCalculationColumn;
        }
        if (data.pgsCustomCalculationColumn) {
            this.pgsCustomCalculationColumn = data.pgsCustomCalculationColumn;
        }
        if (data.customCoverageColumn) {
            this.customCoverageColumn = data.customCoverageColumn;
        }
        if (data.styleAnalysis) {
            this.styleAnalysis = data.styleAnalysis;
        }
        if (data.restrictedColumnOptions) {
            this.restrictedColumnOptions = data.restrictedColumnOptions;
        }
        if (data.tokenToCheck) {
            this.tokenToCheck = data.tokenToCheck;
        }
        if (data.userPermToCheck) {
            this.userPermToCheck = data.userPermToCheck;
        }
        this.hideTopBottomSectorToggle = data.hideTopBottomSectorToggle;
        if (data.overrideColTitles) {
            this.overrideColTitles = data.overrideColTitles;
        }
        this.showAdditionalPerformanceSettings = data.showAdditionalPerformanceSettings;
        this.showAdditionalPerformanceSettingsAttributes = data.showAdditionalPerformanceSettingsAttributes;
        this.showAttributionSettings = data.showAttributionSettings;
        this.showReturnTimeSeriesGridToChartTransitionIcon = data.showReturnTimeSeriesGridToChartTransitionIcon;
        this.showWidgetInfoIcon = data.showWidgetInfoIcon;
        this.hideSorting = data.hideSorting;
        this.hideBreakdownInSorting = data.hideBreakdownInSorting;
        this.hideTotal = data.hideTotal;
        this.hasFootNotes = data.hasFootNotes;
        this.chartingLib = data.chartingLib;
        if (data.settingsThatCanUpdateWidgetTitle) {
            this.settingsThatCanUpdateWidgetTitle = data.settingsThatCanUpdateWidgetTitle;
        }
        this.showCompareTabs = data.showCompareTabs;
        this.exportType = data.exportType;
        this.refreshNotSupported = data.refreshNotSupported;
        this.showTableSearch = data.showTableSearch;
    }
}
