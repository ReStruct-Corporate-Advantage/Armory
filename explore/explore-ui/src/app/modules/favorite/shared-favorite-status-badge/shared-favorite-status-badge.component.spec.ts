import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedFavoriteStatusBadgeComponent } from './shared-favorite-status-badge.component';

describe('SharedFavoriteStatusBadgeComponent', () => {
    let component: SharedFavoriteStatusBadgeComponent;
    let fixture: ComponentFixture<SharedFavoriteStatusBadgeComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [SharedFavoriteStatusBadgeComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SharedFavoriteStatusBadgeComponent);
        component = fixture.componentInstance;
    });

    it('should have CoreFavoriteConstants defined', () => {
        expect(component['CoreFavoriteConstants']).toBeDefined();
    });
    
    it('should have FAVORITE_STATUS_DISPLAY_SLOTS in CoreFavoriteConstants', () => {
        expect(component['CoreFavoriteConstants'].FAVORITE_STATUS_DISPLAY_SLOTS).toBeDefined();
    });
    
    it('should have FAVORITE_STATUS in CoreFavoriteConstants', () => {
        expect(component['CoreFavoriteConstants'].FAVORITE_STATUS).toBeDefined();
    });
});
