import {AbstractConfig, ChartWidgetInputConfigType, SerializeFavoriteType, WidgetInput} from '@blk/explore-ui-core';
import {isObject} from 'lodash';
import { DecarbPortfolioTarget } from '@models/widget/inputs/decarb-portfolio-target-model';
/**
 * Model for DecarbonizationChartSettings
 *
 * This model is used with below configTypes:
 *      ChartWidgetInputConfigType.DECARBONIZATION_CHART_SETTINGS
 *      WidgetDisplayInputConfigType.CHART
 */
export class DecarbonizationChartSettings extends AbstractConfig implements WidgetInput {

    public static MIN_SCENARIO_YEAR = '2018';
    public static MAX_SCENARIO_YEAR = '2050';
    public static DEFAULT_PORTFOLIO_TARGETS = [new DecarbPortfolioTarget({label:'Portfolio Target 1',startYear: this.MIN_SCENARIO_YEAR, targetYear: this.MAX_SCENARIO_YEAR})]

    columnTag: string;
    positionColumnType: string;

    selectedScenario: string;
    emissionStartYear: string;
    aggregationMethod: number;
    emissionTargetType: string;

    portfolioTargets: DecarbPortfolioTarget[];

    /**
     * Gets the config type.
     */
    static get configType(): string {
        return ChartWidgetInputConfigType.DECARBONIZATION_CHART_SETTINGS;
    }

    /**
     * Constructor.
     */
    constructor(data?: any) {
        super();

        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    shouldSkipSerialize(): boolean {
        // Default is to not skip serialization
        return false;
    }

    /**
     * Deserialize the data into this object.
     */
    deserialize(data: any): void {
        this.columnTag = data.columnTag;
        this.positionColumnType=data.positionColumnType;
        this.emissionStartYear=data.emissionStartYear;
        this.selectedScenario=data.selectedScenario;
        this.aggregationMethod=data.aggregationMethod;
        this.emissionTargetType=data.emissionTargetType;
        this.portfolioTargets = data.portfolioTargets?.map(targetData => {
            return new DecarbPortfolioTarget(targetData);
        });
    }

    /**
     * Return true if the passed in widgetInput is equal to this DecarbonizationChartSettingsModel
     */
    equals(widgetInput: WidgetInput): boolean {
        if (!(widgetInput instanceof DecarbonizationChartSettings)) {
            return false;
        }
        return this.columnTag === widgetInput.columnTag && this.positionColumnType===widgetInput.positionColumnType && this.emissionStartYear===widgetInput.emissionStartYear && this.selectedScenario===widgetInput.selectedScenario && this.aggregationMethod===widgetInput.aggregationMethod && this.emissionTargetType===widgetInput.emissionTargetType && this.portfolioTargets.length===widgetInput.portfolioTargets.length && this.portfolioTargets?.every((target, index) => target.equals(widgetInput.portfolioTargets[index]));
    }

    isDataStoreInput(): boolean {
        return true;
    }

     /**
     * Serialize object into JSON format for saving
     */
     serialize(_isNested?: boolean | SerializeFavoriteType): any {
        // only serialize if the climate scenario settings are valid
        if (!this.isValid()) {
            return undefined;
        }
        const portfolioTargets = this.portfolioTargets?.filter(target => target.isValid()).map(validTargets => validTargets.serialize(_isNested));;
        const data: any = {
            columnTag: this.columnTag,
            positionColumnType: this.positionColumnType,
            emissionStartYear: this.emissionStartYear,
            selectedScenario: this.selectedScenario,
            aggregationMethod: this.aggregationMethod,
            emissionTargetType: this.emissionTargetType,
            portfolioTargets: portfolioTargets?.length ? portfolioTargets: []
        };

        return data;
    }

    /**
     * Checks if the Climate Scenario column option is valid (not empty)
     */
    isValid(): boolean {
        return Boolean(this.columnTag && this.emissionStartYear && this.selectedScenario && this.aggregationMethod && this.emissionTargetType)
    }
}
