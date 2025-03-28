import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PortSearchEditorComponent } from './port-search-editor.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { PORTFOLIO_SEARCH_SERVICE_TOKEN } from '@blk/explore-ui-risk';
import { PortfolioSearchItem, PortfolioSearchServiceInterface } from '@blk/explore-ui-portfolio-search';
import { ICellEditorParams } from 'ag-grid-community';
import { ViewContainerRef } from '@angular/core';

describe('PortSearchEditorComponent', () => {
    let component: PortSearchEditorComponent;
    let fixture: ComponentFixture<PortSearchEditorComponent>;
    const portfolioSearchServiceStub: Partial<PortfolioSearchServiceInterface> = {
        searchPortfolio$: jest.fn()
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PortSearchEditorComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                { provide: PORTFOLIO_SEARCH_SERVICE_TOKEN, useValue: portfolioSearchServiceStub }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(PortSearchEditorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize with agInit', () => {
        const params: ICellEditorParams = {
            onKeyDown: jest.fn(),
            stopEditing: jest.fn()
        } as unknown as ICellEditorParams;

        component.agInit(params);

        expect(component['params']).toBe(params);
        expect(params.onKeyDown).toBeDefined();
    });

    it('should return ticker value with getValue', () => {
        component.ticker = 'AAPL';
        expect(component.getValue()).toBe('AAPL');
    });

    it('should handle port search item and stop editing', () => {
        const params: ICellEditorParams = {
            stopEditing: jest.fn()
        } as unknown as ICellEditorParams;

        component.agInit(params);
        const portfolioSearchItem: PortfolioSearchItem = { ticker: 'AAPL' } as PortfolioSearchItem;

        component.handlePortSearchItem(portfolioSearchItem);

        expect(component.ticker).toBe('AAPL');
        expect(params.stopEditing).toHaveBeenCalled();
    });

    it('should return true for isPopup', () => {
        expect(component.isPopup()).toBe(true);
    });

    it('should return "over" for getPopupPosition', () => {
        expect(component.getPopupPosition()).toBe('over');
    });

    it('should set focus on container after GUI is attached', () => {
        component.container = {
            element: {
                nativeElement: {
                    tabIndex: -1,
                    focus: jest.fn()
                }
            }
        } as unknown as ViewContainerRef;

        component.afterGuiAttached();

        expect(component.container.element.nativeElement.tabIndex).toBe(0);
        expect(component.container.element.nativeElement.focus).toHaveBeenCalled();
    });
});
