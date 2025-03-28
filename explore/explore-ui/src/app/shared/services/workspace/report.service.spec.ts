import {TestBed} from '@angular/core/testing';
import {BaseWorkpad} from '@models/workspace/base-workpad.model';
import {FlatWorkpad} from '@models/workspace/flat-workpad.model';
import {Report} from '@models/workspace/report.model';
import {BehaviorSubject, of} from 'rxjs';
import {WorkspaceStore} from '../../../stores/workspace.store';
import {FavoriteService} from '../favorite/favorite.service';
import {ReportService} from './report.service';
import {CoreUserMetaDataStore, UserMetaData} from '@blk/explore-ui-core';

describe('ReportService', () => {
    let service: ReportService;

    const favoriteServiceStub = {
        getFavorite$: jest.fn()
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [{provide: FavoriteService, useValue: favoriteServiceStub}]
        });
        service = TestBed.inject(ReportService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('addCuratedReports$ Test', () => {
        it('should add all reports from curated report favorites', async () => {
            const workpad = new FlatWorkpad();
            WorkspaceStore.currentWorkpad$ = new BehaviorSubject<BaseWorkpad>(workpad);
            WorkspaceStore.currentReport$ = new BehaviorSubject<Report>(undefined);
            const curatedReportFavorites = ['false;1325090', 'false;1325091'];
            jest.spyOn(service['favoriteService'], 'getFavorite$').mockImplementation( (id: number) => {
                const report = new Report();
                report.id = id;
                return of(report);
            });
            jest.spyOn(WorkspaceStore, 'updateCurrentWorkpad');
            await service.addCuratedReports$(WorkspaceStore.getCurrentWorkpad(), curatedReportFavorites).subscribe();

            expect(WorkspaceStore.getCurrentWorkpad().reports.length).toBe(2);
            expect(WorkspaceStore.getCurrentWorkpad().reports[0].id).toBe(1325090);
            expect(WorkspaceStore.getCurrentWorkpad().reports[1].id).toBe(1325091);
            expect(WorkspaceStore.updateCurrentWorkpad).toHaveBeenCalledWith(workpad, null, workpad.reports[0]);
        });
    });

    describe('loadFavoriteReport Test', () => {
        it('should replace current report after getting favorite report', () => {
            CoreUserMetaDataStore.userMetaData = new UserMetaData();
            CoreUserMetaDataStore.userMetaData.access = true;
            CoreUserMetaDataStore.userMetaData.pricePopupAccess = true;
            CoreUserMetaDataStore.userMetaData.launchApps = ['SECURITY_MASTER', 'ANSER', 'ALADDIN_VIEW'];
            CoreUserMetaDataStore.userMetaData.login = 'seakim';
            CoreUserMetaDataStore.userMetaData.globalFavPerms = true;
            CoreUserMetaDataStore.userMetaData.perfDataPerms = true;
            CoreUserMetaDataStore.userMetaData.sharedFavPerms = true;
            const favoriteReport = new Report('favorite report');
            jest.spyOn(service['favoriteService'], 'getFavorite$').mockReturnValue(of(favoriteReport));
            jest.spyOn(WorkspaceStore, 'replaceCurrentReport');

            service.loadFavoriteReport(123456, 'Loading favorite report');
            expect(WorkspaceStore.replaceCurrentReport).toHaveBeenCalledWith(favoriteReport);

            service.loadFavoriteReport(123456, 'Loading favorite report', false, true);
            expect(service['favoriteService'].getFavorite$).toHaveBeenCalledWith(123456, 'Loading favorite report', true, false, undefined);

            service.loadFavoriteReport(123456, 'Loading favorite report', false, true);
            expect(service['favoriteService'].getFavorite$).toHaveBeenCalledWith(123456, 'Loading favorite report', true, false, undefined);
        });
    });
});
