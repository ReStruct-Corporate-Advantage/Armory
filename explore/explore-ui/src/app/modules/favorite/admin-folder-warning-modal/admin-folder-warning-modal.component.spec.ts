import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminFolderWarningModalComponent } from './admin-folder-warning-modal.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CoreCommonConstants, FavoriteDisplayEnum } from '@blk/explore-ui-core';
import { SaveMode } from '@enums/save-mode.enum';
import { SavableFavoriteChange } from '@services/favorite-change-detection/favorite-change-detection.service';

describe('AdminFolderWarningModalComponent', () => {
    let component: AdminFolderWarningModalComponent;
    let fixture: ComponentFixture<AdminFolderWarningModalComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AdminFolderWarningModalComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        })
            .compileComponents();

        fixture = TestBed.createComponent(AdminFolderWarningModalComponent);
        component = fixture.componentInstance;
        component.favoriteDisplayType = FavoriteDisplayEnum.WORKSPACE;
        component.favoriteChange = {
            value: { owner: '' },
            savingUser: '',
            saveMode: null
        } as SavableFavoriteChange;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should open folder structure modal', () => {
        component.openFolderStructureModal();
        expect(component.isFolderStructureModalOpen).toBeTruthy();
    });
});
