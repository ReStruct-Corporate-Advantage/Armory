import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {
    CoreFavoriteConstants,
    CoreFavoriteUtils,
    CoreUserMetaDataStore,
    TokenUtils,
    UserMetaData,
    WidgetInput
} from '@blk/explore-ui-core';
import {BreakdownSettingsModalDialogComponent} from './breakdown-settings-modal-dialog.component';
import {AppStore} from '../../../app.store';
import {FavoriteService, NotificationService} from '../../../shared/services';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {Breakdown, BreakdownBuilderSettings, BreakdownTreeNode} from '@blk/explore-ui-breakdown';
import {BreakdownTreeComponent} from './breakdown-tree/breakdown-tree.component';
import {BehaviorSubject, of} from 'rxjs';
import {AuxAdvancedTreeListInterface} from '@blk/aladdin-angular-components';
import {Widget} from '@models/widget/widget.model';
import {TestUtils} from '@utils/test.utils';
import moment from 'moment';
import 'moment-timezone/index';

describe('BreakdownSettingsModalDialogComponent', () => {
    let component: BreakdownSettingsModalDialogComponent;
    let fixture: ComponentFixture<BreakdownSettingsModalDialogComponent>;

    const favoriteServiceMock = {
        getFavorite$: jest.fn(),
        quickSaveFavorite$: jest.fn()
    };

    const notificationServiceMock = {
        openDialog: jest.fn()
    };

    beforeAll(() => TestUtils.initDefinitions());

    beforeEach(() => {
        CoreUserMetaDataStore.userMetaData = new UserMetaData();
        TestBed.configureTestingModule({
            declarations: [BreakdownSettingsModalDialogComponent, BreakdownTreeComponent],
            providers: [
                AppStore,
                {provide: FavoriteService, useValue: favoriteServiceMock},
                {provide: NotificationService, useValue: notificationServiceMock}],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(BreakdownSettingsModalDialogComponent);
        component = fixture.componentInstance;
        component.isOpen = true;
        component.breakdown = new Breakdown();
        component.breakdownBuilderSettings = new BreakdownBuilderSettings();
        component.breakdownUpdatedCallback = jest.fn();
        component.addSectorSubject$ = new BehaviorSubject<AuxAdvancedTreeListInterface>(undefined);
        component.breakdownTreeComponent = TestBed.createComponent(BreakdownTreeComponent).componentInstance;
        component.breakdownTreeComponent.breakdownTreeData = [];
        component.widget = new Widget();
        component.widget.widgetConfigInputs = [];
    });

    it('Test getDoneButtonLabel', () => {
        component.breakdown = new Breakdown();
        component.original = true;
        expect(component['getDoneButtonLabel']()).toEqual('Save changes');
        component.original = false;
        expect(component['getDoneButtonLabel']()).toEqual('Apply');
        component.breakdown.id = 123;
        expect(component['getDoneButtonLabel']()).toEqual('Apply');
    });

    it('Test beforeWidgetPreviewUpdate', () => {
        jest.spyOn(component.breakdownTreeComponent, 'validateAndUpdateBreakdown').mockReturnValue(true);
        component.breakdownBuilderSettings = new BreakdownBuilderSettings();
        component.breakdownBuilderSettings.inputName = 'breakdownTree';
        component.inputs = new Map<string, WidgetInput>();
        component.breakdown = new Breakdown();
        expect(component.beforeWidgetPreviewUpdate()).toBeTruthy();
        expect(component.inputs.get('breakdownTree')).toBe(component.breakdown);
        component.inputs.clear();
        jest.spyOn(component.breakdownTreeComponent, 'validateAndUpdateBreakdown').mockReturnValue(false);
        expect(component.beforeWidgetPreviewUpdate()).toBeFalsy();
        expect(component.inputs.get('breakdownTree')).toBeUndefined();
    });

    describe('Test onDoneButtonClick', () => {
        beforeEach(() => {
            component.breakdownUpdatedCallback = jest.fn();
        });
        it('invalid breakdown', () => {
            jest.spyOn(component.breakdownTreeComponent, 'validateAndUpdateBreakdown').mockReturnValue(
                false
            );
            jest.spyOn(favoriteServiceMock, 'quickSaveFavorite$');
            jest.spyOn<any, any>(component, 'checkAndSetBreakdown');
            component.isOpen = true;
            component.onDoneClick();
            expect(favoriteServiceMock.quickSaveFavorite$).toHaveBeenCalledTimes(0);
            expect(component['checkAndSetBreakdown']).toHaveBeenCalledTimes(0);
        });
        it('edit original mode', fakeAsync(() => {
            CoreUserMetaDataStore.userMetaData.login = 'user01';
            jest.spyOn(component.breakdownTreeComponent, 'validateAndUpdateBreakdown').mockReturnValue(
                true
            );
            jest.spyOn(favoriteServiceMock, 'quickSaveFavorite$').mockReturnValue(
                of(true)
            );
            jest.spyOn(moment.tz, 'guess').mockReturnValue('America/New_York');

            component.breakdown = new Breakdown();
            component.breakdown.id = 245;
            component.breakdown.owner = 'simsingh';
            component.onInit();
            component.onDoneClick();
            tick();
            expect(favoriteServiceMock.quickSaveFavorite$)
                .toHaveBeenLastCalledWith(component.breakdown, component.breakdown.createFavorite(component.breakdownBuilderSettings.favoriteType), 'simsingh');
            expect(component.breakdownUpdatedCallback).toHaveBeenCalled();
        }));

        it('edit copy mode', fakeAsync(() => {
            jest.clearAllMocks();
            jest.spyOn(component.breakdownTreeComponent, 'validateAndUpdateBreakdown').mockReturnValue(
                true
            );
            component.breakdown = new Breakdown();
            component.onInit();
            component.onDoneClick();
            expect(favoriteServiceMock.getFavorite$).toHaveBeenCalledTimes(0);
            tick();
            expect(component.breakdownUpdatedCallback).toHaveBeenCalled();
        }));

        it('edit copy/create new mode, import breakdown owner as current user and is unchanged', fakeAsync(() => {
            jest.spyOn(component.breakdownTreeComponent, 'validateAndUpdateBreakdown').mockReturnValue(
                true
            );
            CoreUserMetaDataStore.userMetaData = new UserMetaData();
            CoreUserMetaDataStore.userMetaData.login = 'simsingh';

            component.breakdown = new Breakdown();
            component.breakdown.title = 'Edit Copy';
            component.onInit();
            const importedBreakdown = new Breakdown();
            importedBreakdown.title = 'Saved Breakdown';
            importedBreakdown.id = 234;
            importedBreakdown.owner = 'simsingh';
            component.breakdown.copyFrom(importedBreakdown);
            // Saved breakdown is same as current breakdown
            jest.spyOn(favoriteServiceMock, 'getFavorite$').mockReturnValue(
                of(importedBreakdown)
            );
            component.onDoneClick();
            tick();
            expect(component.breakdown.id).toBeDefined();
            expect(component.breakdownUpdatedCallback).toHaveBeenCalled();
        }));
        it('edit copy/create new mode, import breakdown owner as current user and is changed and unlinked', fakeAsync(() => {
            jest.spyOn(component.breakdownTreeComponent, 'validateAndUpdateBreakdown').mockReturnValue(
                true
            );
            CoreUserMetaDataStore.userMetaData = new UserMetaData();
            CoreUserMetaDataStore.userMetaData.login = 'simsingh';

            component.breakdown = new Breakdown();
            component.breakdown.title = 'Edit Copy';
            component.onInit();
            const importedBreakdown = new Breakdown();
            importedBreakdown.title = 'Saved Breakdown';
            importedBreakdown.id = 234;
            importedBreakdown.owner = 'simsingh';
            component.breakdown.copyFrom(importedBreakdown);
            // Breakdown changed after importing breakdown
            component.breakdown.title = 'Title Updated';
            jest.spyOn(favoriteServiceMock, 'getFavorite$').mockReturnValue(
                of(importedBreakdown)
            );
            component.onDoneClick();
            tick();
            expect(notificationServiceMock.openDialog).toHaveBeenCalled();
        }));

        it('edit copy/create new mode, import breakdown owner not same as current user and is unchanged', fakeAsync(() => {
            jest.spyOn(component.breakdownTreeComponent, 'validateAndUpdateBreakdown').mockReturnValue(
                true
            );
            CoreUserMetaDataStore.userMetaData = new UserMetaData();
            CoreUserMetaDataStore.userMetaData.login = 'simsingh';

            component.breakdown = new Breakdown();
            component.breakdown.title = 'Edit Copy';
            component.onInit();
            const importedBreakdown = new Breakdown();
            importedBreakdown.title = 'Saved Breakdown';
            importedBreakdown.id = 234;
            importedBreakdown.owner = 'test';
            component.breakdown.copyFrom(importedBreakdown);
            // Saved breakdown is same as current breakdown
            jest.spyOn(favoriteServiceMock, 'getFavorite$').mockReturnValue(
                of(importedBreakdown)
            );
            component.onDoneClick();
            tick();
            expect(component.breakdownUpdatedCallback).toHaveBeenCalled();
            expect(component.breakdown.id).toBeDefined();
        }));
        it('edit copy/new Breakdown mode, import breakdown owner is not same as current user and is changed and unlinked', fakeAsync(() => {
            jest.spyOn(component.breakdownTreeComponent, 'validateAndUpdateBreakdown').mockReturnValue(
                true
            );
            CoreUserMetaDataStore.userMetaData = new UserMetaData();
            CoreUserMetaDataStore.userMetaData.login = 'simsingh';

            component.breakdown = new Breakdown();
            component.breakdown.title = 'Edit Copy';
            component.onInit();
            const importedBreakdown = new Breakdown();
            importedBreakdown.title = 'Saved Breakdown';
            importedBreakdown.id = 234;
            importedBreakdown.owner = 'testuser';
            component.breakdown.copyFrom(importedBreakdown);
            const breakdownTreeNodeTotal = new BreakdownTreeNode();
            breakdownTreeNodeTotal.label = 'Total';
            breakdownTreeNodeTotal.sectorModel = component.breakdown;
            component.breakdownTreeComponent.breakdownTreeData = [breakdownTreeNodeTotal];
            // Breakdown changed after importing breakdown
            component.breakdown.title = 'Title Updated';
            jest.spyOn(favoriteServiceMock, 'getFavorite$').mockReturnValue(
                of(importedBreakdown)
            );
            component.onDoneClick();
            tick();
            expect(component.breakdownUpdatedCallback).toHaveBeenCalled();
            expect(component.breakdown.id).toEqual(234);
        }));

        it('should close save summary dialog and do nothing if summary is not entered', () => {
            jest.spyOn(component.breakdownTreeComponent, 'validateAndUpdateBreakdown').mockReturnValue(
                true
            );
            CoreUserMetaDataStore.userMetaData = new UserMetaData();
            CoreUserMetaDataStore.userMetaData.login = 'shabraha';

            component.breakdown = new Breakdown();
            component.breakdown.title = 'Test Title';
            component.onInit();
            component.closeSaveSummaryDialog(false);
            expect(favoriteServiceMock.quickSaveFavorite$).not.toHaveBeenCalled();
        });

        it('should close save summary dialog and save if summary is entered', () => {
            jest.spyOn(component.breakdownTreeComponent, 'validateAndUpdateBreakdown').mockReturnValue(
                true
            );
            CoreUserMetaDataStore.userMetaData = new UserMetaData();
            CoreUserMetaDataStore.userMetaData.login = 'shabraha';

            component.breakdown = new Breakdown();
            component.breakdown.title = 'Test Title';
            component.onInit();
            component.saveSummary = {changeSummary: 'Summary', changeSummaryDetails: 'Details'};
            component.closeSaveSummaryDialog(true);
            expect(favoriteServiceMock.quickSaveFavorite$).toHaveBeenCalled();
            // Get the first argument from the mock call
            const [actualFavToSave] = favoriteServiceMock.quickSaveFavorite$.mock.calls[0];

            // Assert specific properties
            expect(actualFavToSave.changeSummary).toBe('Summary');
            expect(actualFavToSave.changeSummaryDetail).toBe('Details');
        });

        it('should not set isSaveSummaryOpen if any condition is not met', () => {
            jest.spyOn(component.breakdownTreeComponent, 'validateAndUpdateBreakdown').mockReturnValue(
                true
            );
            CoreUserMetaDataStore.userMetaData = new UserMetaData();
            CoreUserMetaDataStore.userMetaData.login = 'shabraha';

            component.breakdown = new Breakdown();
            component.breakdown.title = 'Test Title';
            component.onInit();

            jest.spyOn(TokenUtils, 'isFeatureEnabled').mockReturnValue(true);
            jest.spyOn(CoreFavoriteUtils, 'isAdminOrGlobalFavorite').mockReturnValue(true);

            const importedBreakdown = new Breakdown();
            importedBreakdown.title = 'Saved Breakdown';
            importedBreakdown.id = 234;
            importedBreakdown.owner = 'testuser';
            component.breakdown.copyFrom(importedBreakdown);
            const breakdownTreeNodeTotal = new BreakdownTreeNode();
            breakdownTreeNodeTotal.label = 'Total';
            breakdownTreeNodeTotal.sectorModel = component.breakdown;
            component.breakdownTreeComponent.breakdownTreeData = [breakdownTreeNodeTotal];
            // Breakdown changed after importing breakdown
            component.breakdown.title = 'Title Updated';
            jest.spyOn(favoriteServiceMock, 'getFavorite$').mockReturnValue(
                of(importedBreakdown)
            );
            component.onDoneClick();

            expect(component.isSaveSummaryOpen).toBe(false);
        });

        it('should set isSaveSummaryOpen to true if conditions are met and version is undefined', () => {
            jest.spyOn(component.breakdownTreeComponent, 'validateAndUpdateBreakdown').mockReturnValue(
                true
            );
            CoreUserMetaDataStore.userMetaData = new UserMetaData();
            CoreUserMetaDataStore.userMetaData.login = 'shabraha';

            component.breakdown = new Breakdown();
            component.breakdown.id = 123;
            component.breakdown.versionNumber = undefined;
            component.breakdown.title = 'Test Title';
            component.original = true;
            component.onInit();

            jest.spyOn(TokenUtils, 'isFeatureEnabled').mockReturnValue(true);
            jest.spyOn(CoreFavoriteUtils, 'isAdminOrGlobalFavorite').mockReturnValue(true);

            component.onDoneClick();

            expect(component.isSaveSummaryOpen).toBe(false);
        });

        it('should set isSaveSummaryOpen to true if conditions are met and version is not undefined', () => {
            jest.spyOn(component.breakdownTreeComponent, 'validateAndUpdateBreakdown').mockReturnValue(
                true
            );
            CoreUserMetaDataStore.userMetaData = new UserMetaData();
            CoreUserMetaDataStore.userMetaData.login = 'shabraha';

            component.breakdown = new Breakdown();
            component.breakdown.id = 123;
            component.breakdown.versionNumber = 5;
            component.breakdown.title = 'Test Title';
            component.breakdown.owner = CoreFavoriteConstants.ADMIN;
            component.original = true;
            component.onInit();

            jest.spyOn(TokenUtils, 'isFeatureEnabled').mockReturnValue(true);

            component.onDoneClick();

            expect(component.isSaveSummaryOpen).toBe(true);
        });
    });
});
