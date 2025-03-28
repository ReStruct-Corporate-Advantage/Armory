import {isEmpty, isObject} from 'lodash';
import {AbstractColumnOption} from '@blk/explore-ui-core';

export class ESGFiscalYearsColumnOption extends AbstractColumnOption {

    public static CONFIG_TYPE = 'esgFiscalYearsSettings';

    years: string[] = [];

    //These values are static and do not need to be changed frequently, however we will look for ways to configure this in the future releases
    yearOptions = ['Latest Available'];

    constructor(data?: any) {
        super();
        const startingYear = 2011;
        for(let i = startingYear; i <= new Date().getFullYear(); i++) {
            this.yearOptions.push(i.toString());
        }
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    get configType(): string {
        return ESGFiscalYearsColumnOption.CONFIG_TYPE;
    }

    initialize(defaultSettings: any): void {
        super.initialize(defaultSettings);
        let initialYear = this.yearOptions[0];
        this.years = [initialYear];
    }

    protected doAddRequestParams(requestParams: any) {
        const serializedData = this.doSerialize();
        requestParams['years'] = serializedData.years;
    }

    deserialize(data: any): void {
        if (!data.years || data.years.length === 0) {
            return;
        }
        this.years = data.years;
    }

    doSerialize(): any {
        if (!this.isValid()) {
            return undefined;
        }
        return {
            years: this.years
        };
    }

    equals(otherColOption: AbstractColumnOption): boolean {
        if (!(otherColOption instanceof ESGFiscalYearsColumnOption)) {
            return false;
        }
        return this.years?.length === otherColOption.years?.length
            && this.years?.every((year, index) => year === otherColOption.years[index]);
    }

    isValid(): boolean {
        return !isEmpty(this.years);
    }

}