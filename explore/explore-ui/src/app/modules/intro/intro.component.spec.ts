import {ComponentFixture, TestBed} from '@angular/core/testing';
import {IntroComponent} from './intro.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';

import {PortfolioSearchItem} from '@blk/explore-ui-portfolio-search';
import {Observable, of} from 'rxjs';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {ExplorePortfolioSearchService, PortfolioService, WorkspaceService} from '../../shared/services';

describe('IntroComponent', () => {
    let component: IntroComponent;
    let fixture: ComponentFixture<IntroComponent>;
    const portfolioSearchItem = new PortfolioSearchItem('PEP');

    const portfolioSearchServiceStub = {
        searchPortfolio$: jest.fn()
    };

    const portfolioServiceStub = {
        setPortfolioTitle: jest.fn(),
        fetchPortfolioInformation$: jest.fn( (): Observable<any> => {
            return of(new Portfolio('PEP--HP', null, false, 'Perf Benchmark for PEP-AU'));
        })
    };

    const workspaceServiceStub = {
        initializeWorkspaceFromIntro: jest.fn(),
        loadFavoriteWorkspace: jest.fn(),
        loadPortfolioAndCreateWorkspace: jest.fn()
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [IntroComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {provide: ExplorePortfolioSearchService, useValue: portfolioSearchServiceStub},
                {provide: PortfolioService, useValue: portfolioServiceStub},
                {provide: WorkspaceService, useValue: workspaceServiceStub}
            ]
        });

        fixture = TestBed.createComponent(IntroComponent);
        component = fixture.debugElement.componentInstance;
        component.whatIfMode = false;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
        expect(fixture.debugElement.nativeElement.querySelector('.intro-area')).toMatchSnapshot();
    });

    describe('onInit Test', () => {
        it('should set variables onInit', () => {
            component.ngOnInit();
            expect(component.favType).toBe('WORKSPACE');
            expect(component.favTreeType).toBe('WORKSPACE_FOLDER');
            expect(component.favDisplayName).toBe('Workspace');
            expect(component.loadFavoriteCallBack).toBe(component['workspaceService'].loadFavoriteWorkspace);
        });
    });

    describe('onAddPortfolio Test', () => {
        it('should call this.loadPortInfoAndCreateWorkspace', () => {
            jest.spyOn(component, 'loadPortInfoAndCreateWorkspace');
            component.onAddPortfolio(portfolioSearchItem);

            expect(component.loadPortInfoAndCreateWorkspace).toHaveBeenCalled();
        });
    });

    describe('loadPortInfoAndCreateWorkspace Test', () => {
        it('should call this.workspace.loadPortfolioAndCreateWorkspace', () => {
            jest.spyOn(component['workspaceService'], 'loadPortfolioAndCreateWorkspace');
            component.loadPortInfoAndCreateWorkspace(new Portfolio('PEP'));
            expect(component['workspaceService'].loadPortfolioAndCreateWorkspace).toHaveBeenCalled();
        });
    });
});
