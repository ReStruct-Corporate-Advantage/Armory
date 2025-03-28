import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CoreUserMetaDataStore, FavoriteDisplayEnum, UserMetaData} from '@blk/explore-ui-core';
import {FavoritePermissionComponent} from './favorite-permission.component';
import {FavoriteChange} from '@models/favorite/favorite-change.model';
import {Report} from '@models/workspace/report.model';

describe('FavoritePermissionComponent', () => {
    let component: FavoritePermissionComponent;
    let fixture: ComponentFixture<FavoritePermissionComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [FavoritePermissionComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        CoreUserMetaDataStore.userMetaData = new UserMetaData();
        CoreUserMetaDataStore.userMetaData.access = true;
        CoreUserMetaDataStore.userMetaData.pricePopupAccess = true;
        CoreUserMetaDataStore.userMetaData.login = 'seakim';

        fixture = TestBed.createComponent(FavoritePermissionComponent);
        component = fixture.componentInstance;
        component.auxSelect = {setValue: () => {}} as any;

        const report = new Report();
        report.title = 'globalReportFavoriteWithTokenPermission';
        report.id = 12345;
        component.favoriteChange = new FavoriteChange(report, FavoriteDisplayEnum.REPORT);
        component.favoriteChange.favoriteDescription = 'Token:EXPLORE_ENABLE_METRICS,ENABLE_LOAD_ALL';

        fixture.detectChanges();
        component.ngOnInit();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit Test', () => {
        it('should set favoriteDescription from favoriteChange object', () => {
            expect(component.favoriteDescription).toBe('Token:EXPLORE_ENABLE_METRICS,ENABLE_LOAD_ALL');
        });

        it('should show permissioning type and values from the favoriteDescription', () => {
            expect(component.selectedPermissioningType).toBe(component['TOKEN_TYPE']);
            expect(component.permissioningValue).toBe('EXPLORE_ENABLE_METRICS,ENABLE_LOAD_ALL');
        });
    });

    describe('onPermissioningTypeChanged Test', () => {
        it('should update permissioning value and type', () => {
            component.onPermissioningTypeChanged({detail: {value: {value: 'PermissionGroup'}}} as any);

            expect(component.selectedPermissioningType).toBe(component['PERMISSION_GROUP_TYPE']);
            expect(component.permissioningValue).toBeNull();
            expect(component.favoriteDescription).toBeNull();
        });
    });

    describe('onPermissioningValueChanged Test', () => {
        it('should update permissioning value', () => {
            component.onPermissioningValueChanged({detail: {value: 'EXPLORE_ENABLE_METRICS'}} as any);

            expect(component.permissioningValue).toBe('EXPLORE_ENABLE_METRICS');
            expect(component.favoriteDescription).toBe('Token:EXPLORE_ENABLE_METRICS');
        });
    });
});
