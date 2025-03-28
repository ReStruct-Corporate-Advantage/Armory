import {ComponentFixture, TestBed} from '@angular/core/testing';

import {AdminOverwriteWarningModalComponent} from './admin-overwrite-warning-modal.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {FavoriteDisplayEnum} from '@blk/explore-ui-core';

describe('AdminOverwriteWarningModalComponent', () => {
    let component: AdminOverwriteWarningModalComponent;
    let fixture: ComponentFixture<AdminOverwriteWarningModalComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AdminOverwriteWarningModalComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        })
            .compileComponents();

        fixture = TestBed.createComponent(AdminOverwriteWarningModalComponent);
        component = fixture.componentInstance;
        component.favoriteDisplayType = FavoriteDisplayEnum.WORKSPACE;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
