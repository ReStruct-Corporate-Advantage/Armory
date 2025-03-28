import {ComponentFixture, TestBed} from '@angular/core/testing';

import {AddToPortfolioComponent} from './add-to-portfolio.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {Observable, of} from 'rxjs';
import {isEmpty} from 'lodash';
import {PortfolioSecuritiesHandlerService} from '../../../../modules/main/composition-modelling/services/portfolio-securities-handler.service';
import {DateValue} from '@blk/explore-ui-core';
import {WhatIfPortfolio} from '@models/portfolio/what-if-portfolio.model';

describe('AddToPortfolioComponent', () => {
    let component: AddToPortfolioComponent;
    let fixture: ComponentFixture<AddToPortfolioComponent>;

    const portSecuritiesHandlerServiceStub = {
        getPortData$: jest.fn((): Observable<any> => {
            return of([
                {
                    data: 'Test'
                },
                {
                    data: {
                        ticker: 'PORT-R',
                        portfolios: [
                            {
                                ticker: 'PORT-A'
                            },
                            {
                                ticker: 'PORT-B'
                            }
                        ]
                    }
                }]);
        }),
        getLeafLevelPortNamesForPortData: jest.fn((underlyingPorts: any[], underLyingPortNames: Set<string>) => {
            underlyingPorts?.forEach(port => {
                underLyingPortNames.add(port.ticker);
                if (!isEmpty(port.portfolios)) {
                    portSecuritiesHandlerServiceStub.getLeafLevelPortNamesForPortData(port.portfolios, underLyingPortNames);
                }
            });
        })
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [AddToPortfolioComponent],
            providers: [{provide: PortfolioSecuritiesHandlerService, useValue: portSecuritiesHandlerServiceStub}],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(AddToPortfolioComponent);
        component = fixture.componentInstance;
        component.portfolio = new WhatIfPortfolio('PEP');
        fixture.detectChanges();
    });

    it('tests updateUnderlyingPortfolios', () => {
        component.portfolio.isPortfolioGroup = true;
        component.portfolio.portfolios = [];
        component.portfolio.datePicker = new DateValue();
        component.ngOnInit();
        expect(component.underlyingPortData.length).toEqual(1);
        // reset the component state
        component.portfolio.isPortfolioGroup = false;
        component.portfolio.portfolios = undefined;
        component.portfolio.datePicker = undefined;
        component.ngOnInit();
    });
});
