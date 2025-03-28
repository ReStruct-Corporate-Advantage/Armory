import {
    ColumnConfig,
    CoreFavoriteConstants,
    CoreUserMetaDataStore,
    FavoriteDisplayEnum,
    FavoriteType,
    UserMetaData
} from '@blk/explore-ui-core';
import {ColumnSet} from '@blk/explore-ui-column-option';
import {FavoriteChange} from '@models/favorite/favorite-change.model';
import {SaveMode} from '@enums/save-mode.enum';
import {Report} from '@models/workspace/report.model';
import {Breakdown} from '@blk/explore-ui-breakdown';

describe('FavoriteChange model tests', () => {

    beforeEach(() => {
        CoreUserMetaDataStore.userMetaData = new UserMetaData();
    });

    it('configures save choices when current user is also favorite owner', () => {
        CoreUserMetaDataStore.userMetaData.login = 'user01';
        const favorite = new ColumnSet();
        favorite.id = 1234;
        favorite.title = 'favorite column set';
        favorite.owner = 'user01';

        const favoriteChange = new FavoriteChange(favorite, FavoriteDisplayEnum.COLUMN_SET, FavoriteType.REPORT);
        expect(favoriteChange.saveMode).toEqual(SaveMode.SAVE);
        expect(favoriteChange.saveTitle).toEqual(favorite.title);
    });

    it('configures save choices when current user is not the favorite owner', () => {
        CoreUserMetaDataStore.userMetaData.login = 'user01';
        const favorite = new ColumnSet();
        favorite.id = 1234;
        favorite.title = 'favorite column set';
        favorite.owner = 'user02';

        const favoriteChange = new FavoriteChange(favorite, FavoriteDisplayEnum.COLUMN_SET, FavoriteType.REPORT);
        expect(favoriteChange.saveMode).toEqual(SaveMode.SAVE_AS);
        expect(favoriteChange.saveTitle).toEqual(favorite.title + ' Copy');
    });

    it('returns favorite count', () => {
        const customCalc = new FavoriteChange(new ColumnConfig(), FavoriteDisplayEnum.CUSTOM_CALC, FavoriteType.COLUMN);
        customCalc.value.id = 1234;

        const columnSet = new FavoriteChange(new ColumnSet(), FavoriteDisplayEnum.COLUMN_SET, FavoriteType.REPORT);
        columnSet.value.id = 5678;
        columnSet.nestedChanges.push(customCalc);

        const breakdown = new FavoriteChange(new Breakdown(), FavoriteDisplayEnum.BREAKDOWN, FavoriteType.BREAKDOWN);
        breakdown.value.id = 9012;

        const report = new FavoriteChange(new Report(), FavoriteDisplayEnum.REPORT, FavoriteType.LAYOUT);
        report.nestedChanges = [columnSet, breakdown];

        // no id set on report so not included
        expect(report.getChangesCount()).toEqual(3);

        report.value.id = 3456;
        expect(report.getChangesCount()).toEqual(4);
    });

    it('defaults to saving as admin if admin favorite and user has perms', () => {
        CoreUserMetaDataStore.userMetaData.login = 'user01';
        CoreUserMetaDataStore.userMetaData.sharedFavPerms = true;

        const report = new Report();
        report.id = 1234;
        report.owner = CoreFavoriteConstants.ADMIN;
        report.title = 'Admin Report 1';
        let reportChange = new FavoriteChange(report, FavoriteDisplayEnum.REPORT, FavoriteType.LAYOUT, true);
        expect(reportChange.saveMode).toEqual(SaveMode.SAVE);
        expect(reportChange.savingUser).toEqual(CoreFavoriteConstants.ADMIN);
        expect(reportChange.saveTitle).toEqual(report.title);

        CoreUserMetaDataStore.userMetaData.sharedFavPerms = false;
        reportChange = new FavoriteChange(report, FavoriteDisplayEnum.REPORT, FavoriteType.LAYOUT, true);
        expect(reportChange.saveMode).toEqual(SaveMode.SAVE_AS);
        expect(reportChange.savingUser).toEqual(CoreUserMetaDataStore.userMetaData.login);
        expect(reportChange.saveTitle).toEqual(report.title + ' Copy');
    });
});
