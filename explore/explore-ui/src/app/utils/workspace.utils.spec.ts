import {TestUtils} from '@utils/test.utils';
import {Portfolio} from '../models/portfolio/portfolio.model';
import {MandateSettings} from '../models/mandate/mandate-settings.model';
import {AppUtils} from './app.utils';
import {WorkspaceUtils} from './workspace.utils';
import {ExploreConstants} from '../constants/explore.constants';
import {Report} from '../models/workspace/report.model';
import {FavoriteType} from '@blk/explore-ui-core';

/**
 * Test cases for class WorkspaceUtils
 */
describe('WorkspaceUtils', () => {

    beforeAll((done: any) => {
        TestUtils.initialize(done);
    });

    it('getCuratedReportFavorites', () => {
        const port = new Portfolio();
        expect(WorkspaceUtils.getCuratedReportFavorites(port)).toStrictEqual([]);

        port.mandateSettings = new MandateSettings();
        port.mandateSettings.settings.set(FavoriteType.CURATED_REPORTS, ['1', '2', '3']);
        expect(WorkspaceUtils.getCuratedReportFavorites(port).length).toBe(3);

        jest.spyOn(AppUtils, 'getURLParamWithDefault').mockReturnValue('false');
        expect(WorkspaceUtils.getCuratedReportFavorites(port)).toStrictEqual([]);
    });

    it('createNewReport test', () => {
        const report = WorkspaceUtils.createNewReport();
        expect(report).toBeDefined();
        expect(report.title).toBe(ExploreConstants.NEW_REPORT_TITLE + ' 1');
        expect(report.widgets).toBeNull();
    });

    it('createNewReport test - with reports', () => {
        const report = WorkspaceUtils.createNewReport([new Report()]);
        expect(report).toBeDefined();
        expect(report.title).toBe(ExploreConstants.NEW_REPORT_TITLE + ' 2');
        expect(report.widgets).toBeNull();
    });

    it('getNewReportTitle test', () => {
        expect(WorkspaceUtils.getNewReportTitle([])).toBe(ExploreConstants.NEW_REPORT_TITLE + ' 1');
        expect(WorkspaceUtils.getNewReportTitle([new Report(), new Report()])).toBe(ExploreConstants.NEW_REPORT_TITLE + ' 3');
    });
});
