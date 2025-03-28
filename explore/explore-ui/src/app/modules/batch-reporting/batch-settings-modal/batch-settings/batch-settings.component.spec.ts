import {ComponentFixture, TestBed} from '@angular/core/testing';
import {FavoriteConstants} from '@constants/favorite.constants';
import {BatchSettingsComponent} from './batch-settings.component';
import {CUSTOM_ELEMENTS_SCHEMA, SimpleChange} from '@angular/core';
import {BatchReportingService} from '@services/batch-reporting/batch-reporting.service';
import {NotificationService} from '@services/notification';
import {BatchReportingTestUtils} from '@services/batch-reporting/batch-reporting.service.spec';
import {ExploreDialogParam} from '@blk/explore-ui-core';
import {AlertConstants} from '@blk/explore-ui-core';
import {FavoriteService} from '@services/favorite';
import {BatchExportingStore} from '../../../../stores';
import {SaveFavoriteAction} from '@models/favorite/save-favorite-action.model';
import {LoadFavoriteAction} from '@models/favorite/load-favorite-action.model';
import {of} from 'rxjs';
import {CoreUserMetaDataStore, UserMetaData} from '@blk/explore-ui-core';
import {BatchSettingsRowComponent} from './batch-settings-row/batch-settings-row.component';

describe('BatchSettingsComponent', () => {
    let component: BatchSettingsComponent;
    let fixture: ComponentFixture<BatchSettingsComponent>;

    const batchReportingServiceStub = {
        scheduledBatchOverviewModalOpen$: jest.fn(),
        updateBatchReportTitleInScheduledBatchConfig: jest.fn()
    };

    const notificationServiceStub = {
        openDialog: jest.fn()
    };

    const favoriteServiceStub = {
        getFavorite$: jest.fn()
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [BatchSettingsComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {provide: BatchReportingService, useValue: batchReportingServiceStub},
                {provide: NotificationService, useValue: notificationServiceStub},
                {provide: FavoriteService, useValue: favoriteServiceStub}
            ]
        });

        fixture = TestBed.createComponent(BatchSettingsComponent);
        component = fixture.componentInstance;
        BatchExportingStore.currentBatchReport$.next(BatchReportingTestUtils.createDummyBatchReportConfig());
        fixture.detectChanges();
    });

    it('Test ngOnChanges', () => {
        const newBatchReportConfig = BatchReportingTestUtils.createDummyBatchReportConfig();
        const emptyChanges = {};
        const changes = {batchReportConfig: new SimpleChange(component.batchReportConfig, newBatchReportConfig, true)};

        jest.spyOn(component, 'selectBatchSettingsRow');
        component.ngOnChanges(emptyChanges);
        expect(component.selectBatchSettingsRow).not.toHaveBeenCalled();

        // Mock the changes event getting fired
        component.batchReportConfig = newBatchReportConfig;
        component.ngOnChanges(changes);
        expect(component.selectBatchSettingsRow).toHaveBeenCalledWith(newBatchReportConfig.batchRowConfigs[0]);
    });

    describe('Test open/close ScheduledBatchOverviewModal', () => {
        it('Test openScheduledBatchOverviewModal', () => {
            component.openScheduledBatchOverviewModal();
            expect(component.isScheduledBatchOverviewModalOpen).toBeTruthy();
        });

        it('Test closeScheduledBatchOverviewModal', () => {
            component.closeScheduledBatchOverviewModal();
            expect(component.isScheduledBatchOverviewModalOpen).toBeFalsy();
        });
    });


    it('Test isPortfolioLoading', () => {
        const batchSettingsRow = new BatchSettingsRowComponent(null, null, null, null, fixture.changeDetectorRef);
        batchSettingsRow.portfolioLoading = true;
        component.batchRows.reset([batchSettingsRow]);
        expect(component.isPortfolioDownloadInProgress()).toBeTruthy();
        batchSettingsRow.portfolioLoading = false;
        expect(component.isPortfolioDownloadInProgress()).toBeFalsy();
    });

    describe('Test saveBatchReport', () => {
        it('Test saveBatchReport without scheduledBatch', () => {
            jest.spyOn(component['appStore'].saveFavoriteAction$, 'next');
            component.saveBatchReport();

            expect(component['appStore'].saveFavoriteAction$.next).toHaveBeenCalledWith(
                new SaveFavoriteAction(
                    component.batchReportConfig,
                    FavoriteConstants.BATCH_REPORT_PASCAL,
                    FavoriteConstants.BATCH_REPORT,
                    FavoriteConstants.BATCH_REPORT_FOLDER,
                    null
                )
            );
        });

        it('Test saveBatchReport with scheduledBatch', () => {
            component.enableScheduledBatch = true;
            jest.spyOn(component['appStore'].saveFavoriteAction$, 'next');
            component.saveBatchReport();

            expect(component['appStore'].saveFavoriteAction$.next).toHaveBeenCalledWith(
                new SaveFavoriteAction(
                    component.batchReportConfig,
                    FavoriteConstants.BATCH_REPORT_PASCAL,
                    FavoriteConstants.BATCH_REPORT,
                    FavoriteConstants.BATCH_REPORT_FOLDER,
                    batchReportingServiceStub.updateBatchReportTitleInScheduledBatchConfig
                )
            );
        });
    });

    it('Test loadBatchReport', () => {
        jest.spyOn(component['appStore'].openLoadFavoriteModal$, 'next');
        component.loadBatchReport();

        expect(component['appStore'].openLoadFavoriteModal$.next).toHaveBeenCalledWith(
            new LoadFavoriteAction({
                type: FavoriteConstants.BATCH_REPORT,
                treeType: FavoriteConstants.BATCH_REPORT_FOLDER,
                displayName: FavoriteConstants.BATCH_REPORT_PASCAL + 's',
                callback: component.loadBatchFavorite,
                headerDisplayName: FavoriteConstants.BATCH_REPORT_PASCAL,
                ignoreEnterpriseTree: false
            })
        );
    });

    it('Test loadBatchFavorite', () => {
        const batchReport = BatchReportingTestUtils.createDummyBatchReportConfig();
        CoreUserMetaDataStore.userMetaData = new UserMetaData();
        CoreUserMetaDataStore.userMetaData.access = true;
        CoreUserMetaDataStore.userMetaData.login = 'rolin';
        favoriteServiceStub.getFavorite$.mockReturnValue(of(batchReport));
        component.loadBatchFavorite(123, 'test');
        expect(BatchExportingStore.getCurrentBatchReport()).toBe(batchReport);
    });

    it('Test addBatchRow', () => {
        jest.spyOn(component.batchReportConfig, 'addBatchRowConfig');
        component.addBatchRow();

        expect(component.batchReportConfig.addBatchRowConfig).toHaveBeenCalled();
    });

    it('Test createNewBatchReport', () => {
        jest.spyOn(component['notificationService'], 'openDialog');

        component.createNewBatchReport();
        expect(component['notificationService'].openDialog).toHaveBeenCalledWith(
            new ExploreDialogParam(
                AlertConstants.TYPE.ALERT_WITH_OPTIONS,
                AlertConstants.HEADER.CONFIRM,
                AlertConstants.BODY.UNSAVING_BATCH,
                AlertConstants.BTN.OK,
                AlertConstants.BTN.CANCEL,
                component.emitCreateNewBatchReport
            )
        );
    });

    it('Test emitCreateNewBatchReport', () => {
        jest.spyOn(component.createNewBatchReportHandler, 'emit');
        component.emitCreateNewBatchReport();
        expect(component.createNewBatchReportHandler.emit).toHaveBeenCalled();
    });

    it('Test toggleActiveRows', () => {
        component.addBatchRow();

        expect(component.allActiveRows).toBeTruthy();
        component.toggleActiveRows();
        expect(component.allActiveRows).toBeFalsy();
        expect(component.batchReportConfig.batchRowConfigs[0].active).toBeFalsy();
        expect(component.batchReportConfig.batchRowConfigs[1].active).toBeFalsy();
    });

    it('Test getSelectedBatchRowLabel', () => {
        expect(component.getSelectedBatchRowLabel()).toEqual('Selected batch row export options: PEP');

        component.selectedBatchSettingsRow.portfolio = null;
        expect(component.getSelectedBatchRowLabel()).toEqual('Selected batch row export options: ');
    });

    describe('Test removeBatchRow', () => {
        beforeEach(() => {
            component.addBatchRow();
            jest.spyOn(component, 'doRemoveBatchRow').mockImplementationOnce(_a => {});
        });

        it('Test removeBatchRow while downloadInProgress', () => {
            component.downloadInProgress = true;
            component.removeBatchRow(null);
            // If it gets here, that means it didn't null pointer, which means the if check is working properly
            expect(true).toBeTruthy();
        });

        it('Test removeBatchRow with isEffectivelyEmpty', () => {
            const customEvent = new CustomEvent('build', {detail: {batchRowConfig: component.batchReportConfig.batchRowConfigs[1], originalEvent: {ctrlKey: false}}});
            component.removeBatchRow(customEvent);
            expect(component.doRemoveBatchRow).toHaveBeenCalledWith(component.batchReportConfig.batchRowConfigs[1]);
        });

        it('Test removeBatchRow that is not empty but has CTRL key pressed', () => {
            const customEvent = new CustomEvent('build', {detail: {batchRowConfig: component.batchReportConfig.batchRowConfigs[1], originalEvent: {ctrlKey: true}}});
            jest.spyOn(component.batchReportConfig.batchRowConfigs[1], 'isEffectivelyEmpty').mockReturnValue(false);
            component.removeBatchRow(customEvent);
            expect(component.doRemoveBatchRow).toHaveBeenCalledWith(component.batchReportConfig.batchRowConfigs[1]);
        });

        it('Test removeBatchRow that will prompt the user', () => {
            const customEvent = new CustomEvent('build', {detail: {batchRowConfig: component.batchReportConfig.batchRowConfigs[1], originalEvent: {ctrlKey: false}}});

            jest.spyOn(component.batchReportConfig.batchRowConfigs[1], 'isEffectivelyEmpty').mockReturnValue(false);
            jest.spyOn(component['notificationService'], 'openDialog');
            component.removeBatchRow(customEvent);
            expect(component['notificationService'].openDialog).toHaveBeenCalled();
        });
    });

    describe('Test doRemoveBatchRow', () => {
        beforeEach(() => {
            jest.spyOn(component, 'selectBatchSettingsRow');
            jest.spyOn(component, 'createNewBatchReport');
        });

        it('Test doRemoveBatchRow with a row that is not the selectedRow', () => {
            component.addBatchRow();
            // There should be 2 rows
            expect(component.batchReportConfig.batchRowConfigs.length).toEqual(2);
            component.doRemoveBatchRow(component.batchReportConfig.batchRowConfigs[1]);
            expect(component.selectBatchSettingsRow).not.toHaveBeenCalled();
            expect(component.createNewBatchReport).not.toHaveBeenCalled();
            expect(component.batchReportConfig.batchRowConfigs.length).toEqual(1);
        });

        it('Test doRemoveBatchRow with the selectedRow', () => {
            component.addBatchRow();
            // There should be 2 rows
            expect(component.batchReportConfig.batchRowConfigs.length).toEqual(2);
            component.doRemoveBatchRow(component.batchReportConfig.batchRowConfigs[0]);
            // Should call selectBatchSettingsRow with what is now the 'first' element at index 0
            expect(component.selectBatchSettingsRow).toHaveBeenCalledWith(component.batchReportConfig.batchRowConfigs[0]);
        });

        it('Test doRemoveBatchRow with the only row', () => {
            component.doRemoveBatchRow(component.batchReportConfig.batchRowConfigs[0]);
            // Should call createNewBatchReport because you removed the last row
            expect(component.createNewBatchReport).toHaveBeenCalled();
        });
    });
});
