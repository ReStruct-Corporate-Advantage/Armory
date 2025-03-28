import {
    ColumnConfig,
    CoreUserMetaDataStore,
    FavoriteDisplayEnum,
    FavoriteType,
    UserMetaData
} from '@blk/explore-ui-core';
import {ColumnSet} from '@blk/explore-ui-column-option';
import {FavoriteChange} from '@models/favorite/favorite-change.model';
import {Report} from '@models/workspace/report.model';
import {Breakdown, CustomSector} from '@blk/explore-ui-breakdown';
import {WorkpadFavoriteChange} from '@models/favorite/workpad-favorite-change.model';
import {FlatWorkpad} from '@models/workspace/flat-workpad.model';

describe('WorkpadFavoriteChange model tests', () => {

    beforeEach(() => {
        CoreUserMetaDataStore.userMetaData = new UserMetaData();
        CoreUserMetaDataStore.userMetaData.login = 'user01';
    });

    it('returns favorite count', () => {
        const customCalc = new FavoriteChange(new ColumnConfig(), FavoriteDisplayEnum.CUSTOM_CALC, FavoriteType.COLUMN);
        customCalc.value.id = 1111;

        const columnSet = new FavoriteChange(new ColumnSet(), FavoriteDisplayEnum.COLUMN_SET, FavoriteType.REPORT);
        columnSet.value.id = 2222;
        columnSet.nestedChanges = [customCalc];

        const report1 = new FavoriteChange(new Report(), FavoriteDisplayEnum.REPORT, FavoriteType.LAYOUT);
        report1.value.id = 3333;
        report1.nestedChanges = [columnSet];

        const breakdown = new FavoriteChange(new Breakdown(), FavoriteDisplayEnum.BREAKDOWN, FavoriteType.BREAKDOWN);
        breakdown.value.id = 5555;

        const report2 = new FavoriteChange(new Report(), FavoriteDisplayEnum.REPORT, FavoriteType.LAYOUT);
        report2.value.id = 6666;
        report2.nestedChanges = [breakdown];

        const filter = new FavoriteChange(new CustomSector(), FavoriteDisplayEnum.FILTER, FavoriteType.CUSTOM_SEC);
        filter.value.id = 4444;

        const workpad = new WorkpadFavoriteChange(new FlatWorkpad());
        workpad.modifiedReports = [report1, report2];
        workpad.nestedChanges = [filter];

        expect(workpad.getChangesCount()).toEqual(6);
    });
});
