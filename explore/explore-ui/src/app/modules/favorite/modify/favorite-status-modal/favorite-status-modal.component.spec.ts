import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';

import {FavoriteStatusModalComponent} from './favorite-status-modal.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {CoreFavoriteConstants} from '@blk/explore-ui-core';
import {of, throwError} from 'rxjs';
import {FavoriteService} from '@services/favorite';
import {NotificationService} from '@services/notification';
import {Workspace} from '@models/workspace/workspace.model';

describe('FavoriteStatusModalComponent', () => {
    let component: FavoriteStatusModalComponent;
    let fixture: ComponentFixture<FavoriteStatusModalComponent>;
    const favoriteServiceStub = {
        updateFavorite$: jest.fn((any) => of({}))
    };
    const notificationServiceStub = {
        success: jest.fn(),
        error: jest.fn()
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [FavoriteStatusModalComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {provide: FavoriteService, useValue: favoriteServiceStub},
                {provide: NotificationService, useValue: notificationServiceStub}
            ]
        });
        fixture = TestBed.createComponent(FavoriteStatusModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('Init Test', () => {
        expect(component.selectedStatus).toEqual(CoreFavoriteConstants.FAVORITE_STATUS.MATURE);
    });

    it('Status Radio Group Options test', () => {
        component.favorite = new Workspace();
        component.ngOnInit();
        expect(component.statusOptions.length).toBe(3);
        expect(component.statusOptions[0].checked).toBe(true);
        component.favorite.statusTag = CoreFavoriteConstants.FAVORITE_STATUS.UNDER_REVIEW;
        component.ngOnInit();
        expect(component.statusOptions[1].checked).toBe(true);
        component.favorite.statusTag = CoreFavoriteConstants.FAVORITE_STATUS.DECOMMISSIONED;
        component.ngOnInit();
        expect(component.statusOptions[2].checked).toBe(true);
    });

    it('Update Button Clicked Test', fakeAsync(() => {
        component.statusChanged({label: 'Under Review', eventData: CoreFavoriteConstants.FAVORITE_STATUS.UNDER_REVIEW, checked: true});
        expect(component.selectedStatus).toEqual(CoreFavoriteConstants.FAVORITE_STATUS.UNDER_REVIEW);
        favoriteServiceStub.updateFavorite$.mockReturnValue(of(undefined));
        component.statusUpdateCallback = jest.fn();
        component.updateButtonClicked();
        tick();
        expect(component.statusUpdateCallback).toHaveBeenCalled();
        expect(notificationServiceStub.success).toHaveBeenCalled();
        favoriteServiceStub.updateFavorite$ = jest.fn().mockReturnValue(throwError(() => new Error('Something went wrong')));
        component.updateButtonClicked();
        tick();
        expect(notificationServiceStub.error).toHaveBeenCalled();
    }));

});
