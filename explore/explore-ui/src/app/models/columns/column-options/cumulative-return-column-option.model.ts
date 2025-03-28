import {AppUtils} from '../../../utils/app.utils';
import {isNil} from 'lodash';
import {
    AbstractColumnOption,
    ColumnConstants,
    ColumnTitleModifiable,
    SerializeFavoriteType
} from '@blk/explore-ui-core';

/**
 * Model class for the cumulative return column option
 */
export class CumulativeReturnColumnOption extends AbstractColumnOption implements ColumnTitleModifiable  {
    static CONFIG_TYPE = 'cumulativeReturnColumnOption';

    isCumulative = true;

    /**
     * Constructor
     */
    constructor(data?: any) {
        super();
        if (AppUtils.isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * @see AbstractColumnOption.configType
     */
    get configType(): string {
        return CumulativeReturnColumnOption.CONFIG_TYPE;
    }

    /**
     * @see AbstractColumnOption.deserialize
     */
    deserialize(data: any): void {
        this.isCumulative = data[ColumnConstants.CUMULATIVE_OPTION];
    }

    /**
     * @see AbstractColumnOption.doAddRequestParams
     */
    protected doAddRequestParams(requestParams: any) {
        requestParams[ColumnConstants.CUMULATIVE_OPTION] = this.isCumulative;
    }

    /**
     * @see AbstractColumnOption.doSerialize
     */
    doSerialize(_isNested?: boolean | SerializeFavoriteType): any {
        if (!this.isValid()) {
            return undefined;
        }

        const serialised: any = {};
        this.doAddRequestParams(serialised);

        return serialised;
    }

    /**
     * @see AbstractColumnOption.equals
     */
    equals(otherColOption: AbstractColumnOption): boolean {
        if (!(otherColOption instanceof CumulativeReturnColumnOption)) {
            return false;
        }
        return this.isCumulative === otherColOption.isCumulative;
    }

    /**
     * @see AbstractColumnOption.isValid
     */
    isValid(): boolean {
        return !isNil(this.isCumulative);
    }

    getModifiedColumnTitle(originalTitle: string): any {
        return originalTitle + ' Cumulative';
    }
}
