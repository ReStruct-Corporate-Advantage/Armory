import {AbstractColumnOption, ColumnOptionValidatorInterface, ExploreInputValidationInfo, NotificationType, SerializeFavoriteType} from '@blk/explore-ui-core';
import {isNil, isObject, isUndefined} from 'lodash';

export class HorizonYearColumnOption extends AbstractColumnOption implements ColumnOptionValidatorInterface {

    public static CONFIG_TYPE = 'horizonOptions';
    public static ERROR_MESSAGE = 'At least one Horizon Year option is required for one or more of the columns on the Statistics Table. Please return to "Statistics Table Settings" and try again.';

    /** Horizon Year Options */
    readonly yearOptions = [1, 3, 5, 10];

    /** Horizon year */
    horizonList = [1, 3, 5];
    /**
     * Constructor
     */
    constructor(data?: any) {
        super();
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    get configType(): string {
        return HorizonYearColumnOption.CONFIG_TYPE;
    }

    static createModelLegacy(optionValues: any): HorizonYearColumnOption {
        // If there is none of the required parameters then get out of here.
        if (isNil(optionValues.horizonList)) {
            return undefined;
        }

        // Create the model.
        const columnOption: HorizonYearColumnOption = new HorizonYearColumnOption();
        columnOption.horizonList = optionValues.horizonList;

        // Remove the used settings.
        delete optionValues.horizonList;

        return columnOption;
    }

    doSerialize(_isNested?: boolean | SerializeFavoriteType): any {
        return {
            horizonList: this.horizonList
        };
    }

    protected doAddRequestParams(requestParams: any) {
        requestParams.horizonList = this.horizonList;
    }

    deserialize(data: any): void {
        this.horizonList = data.horizonList;
    }

    equals(otherColOption: AbstractColumnOption): boolean {
        // check equality of two horizon year column options
        if (!(otherColOption instanceof HorizonYearColumnOption)) {
            return false;
        }

        if (otherColOption.horizonList.length !== this.horizonList.length) {
            return false;
        }

        return !this.horizonList.some((horizon: number) => !otherColOption.horizonList.includes(horizon));
    }

    isValid(): boolean {
        return !(isUndefined(this.horizonList) || this.horizonList.length === 0);
    }

    isValidColumnOption(): ExploreInputValidationInfo {
        if (!this.isValid()) {
            return new ExploreInputValidationInfo(NotificationType.ERROR, HorizonYearColumnOption.ERROR_MESSAGE);
        }
    }
}
