import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {FavoriteConstants} from '@constants/favorite.constants';
import {of, Subject} from 'rxjs';

import {FavoriteTreeComponent} from './favorite-tree.component';
import {FavoriteTreeService} from '../../service/favorite-tree.service';
import {AuxAdvancedTreeListInterface} from '@blk/aladdin-angular-components';

describe('FavoriteTreeComponent', () => {
    let component: FavoriteTreeComponent;
    let fixture: ComponentFixture<FavoriteTreeComponent>;

    const auxFavoriteTreeDataOnNonSaveMode = [{
        'label': 'new2',
        'isExpanded': false,
        'eventData': {'favoriteId': undefined, 'type': 'folder'},
        'children': [{
            'children': undefined,
            'eventData': {'favoriteId': 1517717, 'type': 'WORKSPACE'},
            'isExpanded': false,
            'label': 'BAMY (bamba)'
        }],
    }, {
        'label': 'demo',
        'eventData': {'favoriteId': 1576328, 'type': 'WORKSPACE'}
    }, {
        'label': 'fromProd',
        'eventData': {'favoriteId': 1557322, 'type': 'WORKSPACE'}
    }, {
        'label': 'Prism: sean-prism',
        'eventData': {'favoriteId': 1501543, 'type': 'WORKSPACE'}
    }];

    const favoriteTreeServiceStub = {
        getFullFavoriteTreeData$: jest.fn(() => of([]))
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [FavoriteTreeComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {provide: FavoriteTreeService, useValue: favoriteTreeServiceStub}
            ]
        });

        fixture = TestBed.createComponent(FavoriteTreeComponent);
        component = fixture.componentInstance;

        component['favType'] = FavoriteConstants.WORKSPACE;
        component['favTreeType'] = FavoriteConstants.WORKSPACE_FOLDER;
        component['favDisplayName'] = FavoriteConstants.WORKSPACE_PASCAL;
        component['favoriteTreeOwner$'] = of('seakim');
        component['loadFavoriteCallBack'] = jest.fn();
        component['selectedFavoriteNode$'] = new Subject<any>();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
        expect(fixture.debugElement.nativeElement.querySelector('.favorite-tree-area')).toMatchSnapshot();
    });

    describe('onInit Test', () => {
        beforeEach(() => {
            component['favoriteSearchTermSubject$'] = of();
        });

        describe('favoriteSearchTerm$ subscription Test', () => {
            beforeEach(() => {
                component.allFavoriteTreeData = auxFavoriteTreeDataOnNonSaveMode;
                jest.spyOn(component, 'createFilteredTreeData' as any);
                jest.spyOn(component, 'generateFavTreeForOwner').mockImplementation(jest.fn);
                jest.clearAllMocks();
            });

            it('should update filteredFavoriteTreeData with favoriteSearchTerm and calculate the tree height', () => {
                component['favoriteSearchTermSubject$'] = of('prism');
                component.ngOnInit();

                expect(component['createFilteredTreeData']).toHaveBeenCalledWith(component.allFavoriteTreeData, 'prism');
            });

            it('should update filteredFavoriteTreeData back to default with allFavoriteTreeData and calculate the tree height', () => {
                component['favoriteSearchTermSubject$'] = of('');
                component.ngOnInit();
                expect(component['createFilteredTreeData']).not.toHaveBeenCalled();
                expect(component.filteredFavoriteTreeData).toBe(component.allFavoriteTreeData);
            });
        });

        describe('favoriteTreeOwner$ subscription Test', () => {
            beforeEach(() => {
                jest.clearAllMocks();
            });

            it('should generateFavoriteTree if we have favoriteOwner', () => {
                component.ngOnInit();

                expect(favoriteTreeServiceStub.getFullFavoriteTreeData$).toHaveBeenCalled();
            });

            it('should empty out filteredFavoriteTreeData if no favoriteOwner', () => {
                component['favoriteTreeOwner$'] = of('');
                component.filteredFavoriteTreeData = auxFavoriteTreeDataOnNonSaveMode;
                expect(component.filteredFavoriteTreeData.length).not.toBe(0);

                component.ngOnInit();

                // expect(favoriteTreeServiceStub.generateFavoriteTree$).not.toHaveBeenCalled();
                expect(component.filteredFavoriteTreeData.length).toBe(0);
            });
        });
    });

    describe('After Component Initialize', () => {
        beforeEach(() => {
            component.filteredFavoriteTreeData = auxFavoriteTreeDataOnNonSaveMode;
        });

        describe('onFavoriteSelected Test', () => {
            it('should call the passed in callback function and trigger selectedFavoriteNode', () => {
                component['isOwnerGlobal'] = false;
                jest.spyOn(component['selectedFavoriteNode$'], 'next');
                jest.spyOn(component, 'loadFavoriteCallBack' as any);
                // @ts-ignore to mock event with the eventData since detail in CustomEvent is readonly property
                component.onFavoriteSelected({detail: {value: [{eventData: {type: 'WORKSPACE', favoriteId: 123456}}]}});

                expect(component['loadFavoriteCallBack']).toHaveBeenCalledWith(123456, 'Loading Favorite Workspace', false, false, undefined, undefined, 'WORKSPACE');
                expect(component['selectedFavoriteNode$'].next).toHaveBeenCalled();
            });

            it('should call the passed in callback function for a preset breakdown', () => {
                component['isOwnerGlobal'] = false;
                jest.spyOn(component['selectedFavoriteNode$'], 'next');

                const mockLoadFavoriteCallback = jest.fn();
                component['loadFavoriteCallback'] = mockLoadFavoriteCallback;

                component.onFavoriteSelected({
                    detail: {
                        value: [
                            {
                                label: 'IAA Breakdown',
                                eventData: {
                                    type: FavoriteConstants.BREAKDOWN_PRESET,
                                    presetBreakdownId: 'iaa_breakdown'
                                }
                            }]
                    }
                } as any);

                expect(component['loadFavoriteCallBack']).toHaveBeenCalledWith(undefined, 'Selected Preset Breakdown: IAA Breakdown', false, false, 'IAA Breakdown', 'iaa_breakdown');
                expect(component['selectedFavoriteNode$'].next).toHaveBeenCalled();
            });
        });
    });
});
