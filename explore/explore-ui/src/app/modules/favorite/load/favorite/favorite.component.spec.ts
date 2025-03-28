import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';

import {FavoriteComponent} from './favorite.component';
import {CoreUserMetaDataStore, ExploreSelectOptionGroup, FavoriteTitlePipe, UserMetaData} from '@blk/explore-ui-core';
import {BreakdownFavoriteConstants} from '@blk/explore-ui-breakdown';
import {CompositionConstants} from '@constants/composition.constants';
import {AuxSelectSelectionChangedDetailInterface} from '@blk/aladdin-angular-components';
import {PortfolioSearchConstants} from '@blk/explore-ui-portfolio-search';

describe('FavoriteComponent', () => {
    let component: FavoriteComponent;
    let fixture: ComponentFixture<FavoriteComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [FavoriteComponent, FavoriteTitlePipe],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: []
        });
        CoreUserMetaDataStore.userMetaData = new UserMetaData();
        CoreUserMetaDataStore.userMetaData.access = true;
        CoreUserMetaDataStore.userMetaData.pricePopupAccess = true;
        CoreUserMetaDataStore.userMetaData.launchApps = ['SECURITY_MASTER', 'ANSER', 'ALADDIN_VIEW'];
        CoreUserMetaDataStore.userMetaData.login = 'seakim';

        fixture = TestBed.createComponent(FavoriteComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
        expect(fixture.debugElement.nativeElement.querySelector('.favorite-area')).toMatchSnapshot();
    });

    it('tests onPortfolioTypeChange', () => {
        jest.spyOn(component.closeAction, 'emit').mockImplementationOnce(_a => {});
        component.onPortfolioTypeChange(new CustomEvent<AuxSelectSelectionChangedDetailInterface>('', {
            detail: {
                value: {
                    displayValue: PortfolioSearchConstants.PORTFOLIO
                },
                srcEvent: null
            }
        }));
        expect(component.closeAction.emit).toHaveBeenLastCalledWith({
            favoriteType: undefined,
            reason: 1,
            sourceUniqueId: undefined,
        });
    });

    describe('onInit Test', () => {
        beforeEach( () => {
            CoreUserMetaDataStore.userMetaData = new UserMetaData();
            CoreUserMetaDataStore.userMetaData.access = true;
            CoreUserMetaDataStore.userMetaData.pricePopupAccess = true;
            CoreUserMetaDataStore.userMetaData.launchApps = ['SECURITY_MASTER'];
            CoreUserMetaDataStore.userMetaData.login = 'seakim';
            CoreUserMetaDataStore.userMetaData.globalFavPerms = true;
            CoreUserMetaDataStore.userMetaData.perfDataPerms = true;
            CoreUserMetaDataStore.userMetaData.sharedFavPerms = true;

            component.favType = 'WORKSPACE';
            component.favTreeType = 'WORKSPACE_FOLDER';
            component.favDisplayName = 'Workspace';
            component.loadEnterpriseTree = true;
            component.subCategoryData = ExploreSelectOptionGroup.createSimpleSelectOptionGroup(
                [
                    CompositionConstants.WHATIF_POS.TYPE,
                    CompositionConstants.WHATIF_RULES.TYPE
                ],
                [
                    'Point in Time',
                    'Through Time'
                ],
                CompositionConstants.WHATIF_POS.TYPE
            );
            component.ngOnInit();
            fixture.detectChanges();
        });

        it('should set all the variables and update DOM', async () => {
            const subscription1 = component.login$
                .subscribe( (response) => {
                    expect(response).toBe('seakim');
                });

            const subscription2 = component.admin$
                .subscribe( (response) => {
                    expect(response).toBe('_ADMIN');
                });

            const searchField = fixture.debugElement.nativeElement.querySelector('aux-search-field');
            expect(searchField.placeholder).toMatchSnapshot();

            const myFavorite = fixture.debugElement.nativeElement.querySelector('.my-favorite');
            expect(myFavorite.header).toMatchSnapshot();

            const teamFavorite = fixture.debugElement.nativeElement.querySelector('.team-favorite');
            expect(teamFavorite.header).toMatchSnapshot();

            const enterpriseTree = fixture.debugElement.nativeElement.querySelector('.enterprise-tree');
            expect(enterpriseTree.header).toMatchSnapshot();

            expect(component.selectProps).toEqual({
                data: [
                    {
                        values: [
                            {
                                displayValue: 'Portfolio',
                                value: {includePorts: true, includeWhatIfPorts: false}
                            },
                            {
                                displayValue: 'What-if Portfolio',
                                value: {includePorts: false, includeWhatIfPorts: true},
                                isSelected: true
                            }
                        ]
                    }
                ]
            });

            jest.spyOn(component.closeAction, 'emit').mockImplementationOnce(_a => {});

            component.isPartOfModal = true;
            component.selectedFavoriteNode$.next();

            await fixture.whenStable();
            expect(component.closeAction.emit).toHaveBeenLastCalledWith({
                favoriteType: 'WORKSPACE',
                reason: 0,
                sourceUniqueId: undefined,
            });

            subscription1.unsubscribe();
            subscription2.unsubscribe();
        });

        it('should display My breakdowns, Team breakdowns, Enterprise breakdowns, and Portfolio-Specific breakdowns when favorite type is BREAKDOWN', () => {
            component.favType = BreakdownFavoriteConstants.BREAKDOWN;
            fixture.detectChanges();

            expect(fixture.debugElement.nativeElement.querySelector('.favorite-accordion-area')).toMatchSnapshot();
        });

        it('should display Aladdin report when showAladdinReport is true', () => {
            component.showAladdinReport = true;
            fixture.detectChanges();

            expect(fixture.debugElement.nativeElement.querySelector('.alddin-favorite')).toMatchSnapshot();
        });
    });

    describe('onSearchValueChanged Test', () => {
        it('should update favoriteSearchTermSubject$', () => {
            jest.spyOn(component.favoriteSearchTermSubject$, 'next');
            // @ts-ignore to mock event with searchValue 'seakim' since detail in CustomEvent is readonly property
            component.onSearchValueChanged({detail: {submitValue: {searchValue: 'seakim'}}});
            expect(component.favoriteSearchTermSubject$.next).toHaveBeenCalledWith('seakim');
        });
    });
});
