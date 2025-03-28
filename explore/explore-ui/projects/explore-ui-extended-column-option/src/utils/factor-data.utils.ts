import {ColumnOptionUtils} from '@blk/explore-ui-column-option';
import {ColumnConfig} from '@blk/explore-ui-core';


export class FactorDataUtils {


    public static getFactorName(col: ColumnConfig): string {
        return ColumnOptionUtils.getCustomTitle(col) || col.columnTitle;
    }

}

