import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

import {LoadFavoriteModalComponent} from './load-favorite-modal.component';
import {AppStore} from '../../../../app.store';
import {OptimizationDataService} from '../../../optimization/services/optimization-data.service';

describe('LoadFavoriteModalComponent', () => {
    let component: LoadFavoriteModalComponent;
    let fixture: ComponentFixture<LoadFavoriteModalComponent>;

    const appStoreStub = {
        openLoadFavoriteModal$: new BehaviorSubject({type: null, treeType: null, displayName: 'column set', loadEnterpriseTree: null, callback: null})
    };

    const optimizationDataServiceStub = {
        loadFavoriteOptimzationSettings: Function
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [LoadFavoriteModalComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [{provide: AppStore, useValue: appStoreStub}, {provide: OptimizationDataService, useValue: optimizationDataServiceStub}]
        });

        fixture = TestBed.createComponent(LoadFavoriteModalComponent);
        component = fixture.componentInstance;
    });

    it('should initialize on init', () => {
        component.ngOnInit();
        expect(component.loadFavoriteCallBack).not.toBeUndefined();
        expect(component.global$).not.toBeUndefined();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
        expect(fixture.debugElement.nativeElement.querySelector('aux-modal')).toMatchSnapshot();
    });

    describe('closeModal Test', () => {
        it('should close modal', () => {
            jest.spyOn(component.modalClosed, 'emit');
            component.closeModal();

            expect(component.isOpen).toBeFalsy();
            expect(component.modalClosed.emit).toHaveBeenCalled();
        });
    });
});
