import {ComponentFixture, TestBed} from '@angular/core/testing';

import {SingleLayerSaveSummaryModalComponent} from './single-layer-save-summary-modal.component';

import {CommonUtils, CoreUserMetaDataStore, UserMetaData} from '@blk/explore-ui-core';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {WorkspaceFavoriteChange} from '@models/favorite/workspace-favorite-change.model';
import {Workspace} from '@models/workspace/workspace.model';

describe('SaveSummaryVersionComponent', () => {
    let component: SingleLayerSaveSummaryModalComponent;
    let fixture: ComponentFixture<SingleLayerSaveSummaryModalComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [SingleLayerSaveSummaryModalComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });
        fixture = TestBed.createComponent(SingleLayerSaveSummaryModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        CoreUserMetaDataStore.userMetaData = new UserMetaData();
        CoreUserMetaDataStore.userMetaData.login = 'seakim';
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('test ngOnInit', () => {
        jest.spyOn(CommonUtils, 'getInSentenceCase').mockReturnValue('Workspace');
        component.favType = 'WORKSPACE';
        component.ngOnInit();
        expect(component.favType).toEqual('Workspace');
    });

    it('Test saveSummaryDetails', () => {
        component.saveButtonDisabled$.next(true);

        const event = {detail: {value: 'testSaveSummaryDetails'}} as CustomEvent;
        component.saveSummaryDetailsUpdated(event);
        expect(component.saveVersion.changeSummaryDetails).toBe('testSaveSummaryDetails');
        expect(component.saveButtonDisabled$.value).toBe(true);
    });

    it('Test saveSummary', () => {
        component.saveButtonDisabled$.next(true);

        const event = {detail: {value: 'testSaveSummary'}} as CustomEvent;
        component.saveSummaryUpdated(event);
        expect(component.saveVersion.changeSummary).toBe('testSaveSummary');
        expect(component.saveButtonDisabled$.value).toBe(false);
    });

    it('should test updateFavoritesTreeWithSaveSummary - favoritesTree', () => {
        jest.spyOn(component, 'closeModal');
        component.favoritesTree = new WorkspaceFavoriteChange(new Workspace());
        component.saveVersion = {changeSummaryDetails: 'Some details', changeSummary: 'Some summary'};
        component.updateFavoritesTreeWithSaveSummary();
        expect(component.favoritesTree.changeSummary).toBe('Some summary');
        expect(component.favoritesTree.changeSummaryDetails).toBe('Some details');
        expect(component.closeModal).toHaveBeenCalled();
    });

    it('should test updateFavoritesTreeWithSaveSummary - saveSummary', () => {
        jest.spyOn(component, 'closeModal');
        component.saveSummary = {changeSummaryDetails: '', changeSummary: ''};
        component.saveVersion = {changeSummaryDetails: 'Some details', changeSummary: 'Some summary'};
        component.updateFavoritesTreeWithSaveSummary();
        expect(component.saveSummary.changeSummary).toBe('Some summary');
        expect(component.saveSummary.changeSummaryDetails).toBe('Some details');
        expect(component.closeModal).toHaveBeenCalled();
    });

    it('should cancel save summary input', () => {
        jest.spyOn(component, 'closeModal');
        component.cancelSaveSummaryInput();
        expect(component.closeModal).toHaveBeenCalled();
    });
});
