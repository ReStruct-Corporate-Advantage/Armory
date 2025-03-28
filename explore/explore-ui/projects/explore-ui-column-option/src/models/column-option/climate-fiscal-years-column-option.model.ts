import {isEmpty, isObject} from 'lodash';
import {
    AbstractColumnOption,
    ClimateScenarioAvailableOptions,
    CoreDefinitionStore,
    SerializeFavoriteType
} from '@blk/explore-ui-core';

/**
 * Model for climate fiscal year column option
 */
export class ClimateFiscalYearsColumnOption extends AbstractColumnOption {

    public static CONFIG_TYPE = 'caiFiscalYearsSettings';

    years: string[] = [];

    constructor(data?: any) {
        super();
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    get configType(): string {
        return ClimateFiscalYearsColumnOption.CONFIG_TYPE;
    }

    initialize(defaultSettings: any): void {
        super.initialize(defaultSettings);
        // default settings for climate scenarios column option is an empty rule set
        const climateScenarioAvailableOptions = CoreDefinitionStore.climateScenarioAssumptions;
        let timeframeOverrideKey = defaultSettings?.columnOptionAttributes?.find(attr => attr.key === ClimateScenarioAvailableOptions.TIMEFRAME_OVERRIDE)?.defaultValue?.value;
        const timeframeOverrideKeyValid = climateScenarioAvailableOptions.isTimeframeOverrideKeyValid(timeframeOverrideKey);
        timeframeOverrideKey = timeframeOverrideKeyValid ? timeframeOverrideKey : 'FISCAL_YEAR_DEFAULT';
        let initialYear = climateScenarioAvailableOptions.getTimeframeOverrideOptions(timeframeOverrideKey)[0];
        this.years = [initialYear];
    }

    protected doAddRequestParams(requestParams: any) {
        const serializedData = this.doSerialize(false);
        requestParams['years'] = serializedData.years;
    }

    deserialize(data: any): void {
        if (!data.years || data.years.length === 0) {
            return;
        }
        this.years = data.years;
    }

    doSerialize(isNested?: boolean | SerializeFavoriteType): any {
        // only serialize if the climate scenario settings are valid
        if (!this.isValid()) {
            return undefined;
        }
        return {
            years: this.years
        };
    }

    equals(otherColOption: AbstractColumnOption): boolean {
        if (!(otherColOption instanceof ClimateFiscalYearsColumnOption)) {
            return false;
        }
        return this.years?.length === otherColOption.years?.length
            && this.years?.every((year, index) => year === otherColOption.years[index]);
    }

    isValid(): boolean {
        return !isEmpty(this.years);
    }
}
