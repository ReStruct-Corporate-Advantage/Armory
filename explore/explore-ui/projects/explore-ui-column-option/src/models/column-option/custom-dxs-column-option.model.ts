import {isNil, isObject, isUndefined} from 'lodash';
import {AbstractColumnOption, ColumnTitleModifiable, SerializeFavoriteType} from '@blk/explore-ui-core';

/**
 * Custom Dxs Column Options Model
 */
export class CustomDxsColumnOption extends AbstractColumnOption implements ColumnTitleModifiable {
    static CONFIG_TYPE = 'dxsColumnOptions';

    cap: number;
    floor: number;
    /**
     * Flag for Spread Type - Oas(Government) OR Alternative OAS(LIBOR)
     * If the isOasBased flag is true - It means the spread type is OAS (Government)
     * If the isOasBased flag is false - It means the spread type is Alternative OAS (LIBOR)
     */
    isOasBased: boolean;

    /**
     * Flag for Use duration for EUR denominated government bonds
     */
    useDurationForEuroGovtBonds: boolean;

    /**
     * Looks at the list of option values and if it can create a column option model from it does so.
     * NOTE:  That the list of option values is modified by this function if a model can be created.
     */
    static createModelLegacy(optionValues: any): CustomDxsColumnOption {
        // If there is none of the required parameters then get out of here.
        // NOTE: We need the dxs options (that is this model) if the given options values have isOasBased attribute.
        // As dxs also has cap / floor / useDurationForEuroGovtBonds attributes we'll get them into this model too
        // and them remove them from the given options.
        // (The EuroBondColumnOptionModel also has useDurationForEuroGovtBonds attribute but it does not have isOasBased.
        // Hence when the given option values have isOasBased attribute they are for this model)
        if (isUndefined(optionValues.isOasBased)) {
            // Given options are not dxs options
            return undefined;
        }

        // Create the model.
        const columnOption: CustomDxsColumnOption = new CustomDxsColumnOption();
        columnOption.cap = optionValues.cap;
        columnOption.floor = optionValues.floor;
        columnOption.isOasBased = optionValues.isOasBased;
        columnOption.useDurationForEuroGovtBonds = isUndefined(optionValues.useDurationForEuroGovtBonds) ? false : optionValues.useDurationForEuroGovtBonds;

        // Remove the used settings.
        delete optionValues.cap;
        delete optionValues.floor;
        delete optionValues.isOasBased;
        delete optionValues.useDurationForEuroGovtBonds;

        return columnOption;
    }

    /**
     * Constructor
     */
    constructor(data?: any) {
        super();
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * Gets the type of the config object.
     */
    get configType(): string {
        return CustomDxsColumnOption.CONFIG_TYPE;
    }

    /**
     * If the isOasBased flag is true - It means the spread type is OAS (Government)
     * If the isOasBased flag is false - It means the spread type is Alternative OAS (LIBOR)
     * This method returns the title modified according to the spread type selected.
     */
    getModifiedColumnTitle(originalTitle: string): string {
        return this.isOasBased ? originalTitle + ' (O)' : originalTitle + ' (A)';
    }

    /**
     * Get params that are to be send as a part of the request param
     */
    protected doAddRequestParams(requestParams: any): void {
        if (!isNil(this.cap)) {
            requestParams.cap = this.cap;
        }
        if (!isNil(this.floor)) {
            requestParams.floor = this.floor;
        }
        requestParams.isOasBased = this.isOasBased;
        requestParams.useDurationForEuroGovtBonds = this.useDurationForEuroGovtBonds;
    }

    /**
     * This function is used to serialize the implementation favorite.
     */
    doSerialize(_isNested?: boolean | SerializeFavoriteType): any {
        return {
            cap: this.cap,
            floor: this.floor,
            isOasBased: this.isOasBased,
            useDurationForEuroGovtBonds: this.useDurationForEuroGovtBonds
        };
    }

    /**
     * Deserialize the data into this object.
     */
    deserialize(data: any): void {
        this.cap = data.cap;
        this.floor = data.floor;
        this.isOasBased = data.isOasBased;
        this.useDurationForEuroGovtBonds = data.useDurationForEuroGovtBonds;
    }

    /**
     * Returns true if the passed in otherColOption is equal to this one
     */
    equals(otherColOption: AbstractColumnOption): boolean {
        if (!(otherColOption instanceof  CustomDxsColumnOption)) {
            return false;
        }
        return this.cap === otherColOption.cap && this.floor === otherColOption.floor && this.isOasBased === otherColOption.isOasBased && this.useDurationForEuroGovtBonds === otherColOption.useDurationForEuroGovtBonds;
    }

    /**
     * Check if the settings are valid
     */
    isValid(): boolean {
        return !isUndefined(this.isOasBased);
    }
}
