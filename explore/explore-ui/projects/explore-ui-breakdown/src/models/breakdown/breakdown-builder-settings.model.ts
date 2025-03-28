import {CoreRiskConstants} from '@blk/explore-ui-risk';
import {BreakdownFavoriteConstants} from '../../constants/breakdown-favorite.constants';
import {ColumnFilter} from '@blk/explore-ui-column-option';
import {FavoriteStatus} from '@blk/explore-ui-core';

export class BreakdownBuilderSettings {
    columnFilter: ColumnFilter[];
    quickColumnFilter: ColumnFilter[];
    customSectorColumnFilter: ColumnFilter[];
    fieldToUse: string;
    favoriteType: string;
    favoriteFolderType: string;
    widgetType: string;
    inputName: string;
    includeNoBreakdownOption: boolean;
    showFundSectoringTabs: boolean;
    includePerformanceBreakdown: boolean;
    restrictBreakdownToSingleLevel: boolean;
    hideQuantiles: boolean;
    statusUpdateCallback: (status: FavoriteStatus) => void;

    /**
     * returns display name of breakdown shown in load breakdown dialog
     */
    getBreakdownDisplayName(): string {
        return (this.inputName === CoreRiskConstants.CONFIG_TYPE.RISK_FACTOR_BREAKDOWN) || (this.favoriteType === BreakdownFavoriteConstants.FACTOR_BREAKDOWN) ?
            BreakdownFavoriteConstants.FACTOR_BREAKDOWN_DISPLAY_NAME : BreakdownFavoriteConstants.BREAKDOWN;
    }
}
