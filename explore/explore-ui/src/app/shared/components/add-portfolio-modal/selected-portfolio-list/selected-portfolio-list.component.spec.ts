import {ComponentFixture, TestBed} from '@angular/core/testing';

import {SelectedPortfolioListComponent} from './selected-portfolio-list.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {AddPortfolioService} from '../add-portfolio.service';
import {PortfolioSearchItem} from '@blk/explore-ui-portfolio-search';
import {AdhocPortParams} from '@models/portfolio/adhocModelling/adhoc-port-params.model';

describe('SelectedPortfolioListComponent', () => {
    let component: SelectedPortfolioListComponent;
    let fixture: ComponentFixture<SelectedPortfolioListComponent>;

    const addPortfolioServiceStub = {
        selectedPortfolioTickers: new Set<PortfolioSearchItem>()
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [SelectedPortfolioListComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [{provide: AddPortfolioService, useValue: addPortfolioServiceStub}]
        });

        fixture = TestBed.createComponent(SelectedPortfolioListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    describe('removeAllPortfolios Test', () => {
        it('should remove all portfolios from modal', () => {
            component.selectedPortfolioTickers.add(new PortfolioSearchItem('testKey1'));
            component.removeAllPortfolios(new MouseEvent('click'));
            expect(component.selectedPortfolioTickers.size).toBe(0);
        });
    });

    describe('removePort Test', () => {
        it('should remove 2nd element from modal', () => {
            const testPortSearchItem1 = new PortfolioSearchItem('testKey1');
            const testPortSearchItem2 = new PortfolioSearchItem('testKey2');
            const testPortSearchItem3 = new PortfolioSearchItem('testKey3');

            component.selectedPortfolioTickers.add(testPortSearchItem1);
            component.selectedPortfolioTickers.add(testPortSearchItem2);
            component.selectedPortfolioTickers.add(testPortSearchItem3);
            component.removePort(testPortSearchItem2);
            expect(component.selectedPortfolioTickers.size).toBe(2);
            expect(component.selectedPortfolioTickers.has(testPortSearchItem1)).toBe(true);
            expect(component.selectedPortfolioTickers.has(testPortSearchItem3)).toBe(true);
            expect(component.selectedPortfolioTickers.has(testPortSearchItem2)).toBe(false);
        });
    });

    it('test isCustomPortfolio', () => {
        const portfolio = new AdhocPortParams();
        portfolio.name = 'CP1';
        portfolio.fullName = 'CP Full Name';
        portfolio.currency = 'USD';
        portfolio.portMktNotional = 0;
        expect(component.isCustomPortfolio(portfolio)).toBeTruthy();
    });
});
