import {FavoriteDisplayEnum} from './favorite-display.enum';
import {FavoriteType} from './favorite-type.enum';
import {CoreFavoriteConstants} from '../constants/core-favorite.constants';

/**
 * Extended enum class that holds display, type, and folder type for favorite
 */
export class FavoriteEnum {
    private static AllValues: { [name: string]: FavoriteEnum } = {};

    static readonly WORKSPACE = new FavoriteEnum(FavoriteDisplayEnum.WORKSPACE, FavoriteType.WORKSPACE);
    static readonly REPORT = new FavoriteEnum(FavoriteDisplayEnum.REPORT, FavoriteType.LAYOUT);
    static readonly CUSTOM_SECTOR = new FavoriteEnum(FavoriteDisplayEnum.CUSTOM_SECTOR, FavoriteType.CUSTOM_SEC);
    static readonly FILTER = new FavoriteEnum(FavoriteDisplayEnum.FILTER, FavoriteType.CUSTOM_SEC);
    static readonly CUSTOM_CALC = new FavoriteEnum(FavoriteDisplayEnum.CUSTOM_CALC, FavoriteType.COLUMN);

    static readonly BREAKDOWN = new FavoriteEnum(FavoriteDisplayEnum.BREAKDOWN, [FavoriteType.FACTOR_BREAKDOWN, FavoriteType.BREAKDOWN]);
    static readonly COLUMN_SET = new FavoriteEnum(FavoriteDisplayEnum.COLUMN_SET, [
        FavoriteType.REPORT,
        FavoriteType.MULTI_REPORT,
        FavoriteType.RISK_REPORT,
        FavoriteType.RETURN_REPORT,
        FavoriteType.EXPOST_REPORT,
        FavoriteType.CHART_REPORT
    ]);

    private constructor(readonly displayValue: FavoriteDisplayEnum, readonly favoriteTypes: FavoriteType|FavoriteType[]) {
        FavoriteEnum.AllValues[displayValue] = this;
    }

    /**
     * Parse enum
     * eg> FavoriteEnum.parseEnum(FavoriteDisplayEnum.REPORT).favoriteTypes === FolderFavoriteTypeEnum.LAYOUT
     */
    static parseEnum(displayValue: FavoriteDisplayEnum): FavoriteEnum {
        return FavoriteEnum.AllValues[displayValue];
    }

    static getFolderType(favoriteType: FavoriteType|string): string {
        // folderType is always favoriteType + _FOLDER
        return favoriteType + CoreFavoriteConstants._FOLDER;
    }
}
