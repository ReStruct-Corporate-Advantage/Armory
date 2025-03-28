import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {CommonModule} from '@angular/common';
import {UntypedFormBuilder, FormsModule, ReactiveFormsModule} from '@angular/forms';

import {InvestmentUniverseFormComponent} from './investment-universe-form.component';
import {ExplorePortfolioSearchService} from '../../../../shared/services/explore-portfolio-search/explore-portfolio-search.service';
import {InvestmentUniversePortfolio} from '@models/portfolio/investmentUniverse/investment-universe-portfolio.model';
import {InvestmentUniverseConstants} from '../../../../constants/investment-universe.constants';
import {UNIVERSE_CHECK} from '../constants/investment-universe-settings.constants';
import {PortfolioSearchItem} from '@blk/explore-ui-portfolio-search';
import {CustomFilter} from '@blk/explore-ui-breakdown';

describe('InvestmentUniverseFormComponent', () => {
    let component: InvestmentUniverseFormComponent;
    let fixture: ComponentFixture<InvestmentUniverseFormComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            declarations: [InvestmentUniverseFormComponent],
            imports: [CommonModule, FormsModule, ReactiveFormsModule],
            providers: [
                {
                    provide: ExplorePortfolioSearchService,
                    useValue: {
                        searchPortfolio$: jest.fn()
                    }
                }
            ]
        });

        fixture = TestBed.createComponent(InvestmentUniverseFormComponent);
        component = fixture.componentInstance;
        const fb: UntypedFormBuilder = TestBed.inject(UntypedFormBuilder);
        const investmentUniverseSetting = new InvestmentUniversePortfolio({
            enabled: false,
            type: InvestmentUniverseConstants.PORTFOLIO,
            label: '',
            isFrozen: false
        });
        investmentUniverseSetting.portfolio = '';
        investmentUniverseSetting.isBench = false;
        component.investmentUniverseSetting = investmentUniverseSetting;

        component.parent = fb.group({
            universeCheck: investmentUniverseSetting.enabled,
            universeSelect: investmentUniverseSetting.type,
            universeSearch: investmentUniverseSetting.portfolio,
            universeText: investmentUniverseSetting.label
        });

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should EnableUniverseItem', () => {
        expect(component.parent.get(UNIVERSE_CHECK).value).toEqual(false);
        component.onEnableUniverseItem({
            detail: {
                value: {
                    checked: true
                }
            }
        } as CustomEvent);

        expect(component.investmentUniverseSetting.enabled).toEqual(true);
    });

    it('should not emit universeTypeChanged', () => {
        const spyForEmit = jest.spyOn(component.universeTypeChanged, 'emit');
        component.onUniverseTypeChange({} as CustomEvent);
        expect(spyForEmit).toHaveBeenCalledTimes(0);
    });

    test('universeTypeChanged with same value', () => {
        expect(component.investmentUniverseSetting.type).toEqual(InvestmentUniverseConstants.PORTFOLIO);
        const spyForEmit = jest.spyOn(component.universeTypeChanged, 'emit');
        component.onUniverseTypeChange({
            detail: {value: {
                displayValue: InvestmentUniverseConstants.PORTFOLIO
            }
        }
        } as CustomEvent);
        expect(spyForEmit).toHaveBeenCalledTimes(0);
    });

    test('universeTypeChanged', () => {
        const spyForEmit = jest.spyOn(component.universeTypeChanged, 'emit');
        component.onUniverseTypeChange({
            detail: {value: {
                displayValue: InvestmentUniverseConstants.SECURITY
            }
        }
        } as CustomEvent);
        expect(spyForEmit).toHaveBeenCalledTimes(1);
    });

    it('should set the universe text', () => {
        expect(component.investmentUniverseSetting.label).toEqual('');
        component.onUniverseItemTextChange({detail: {value: 'PEP_1'}} as CustomEvent);
        expect(component.investmentUniverseSetting.label).toEqual('PEP_1');
    });

    test('if the Potfolio is set', () => {
        const portfolioSearchItem: PortfolioSearchItem = new PortfolioSearchItem('PEP', 'BGF Pacific Equity Fund', 'USD', '12345');
        expect((component.investmentUniverseSetting as InvestmentUniversePortfolio).portfolio).toEqual('');
        component.onPortfolioSelected(portfolioSearchItem);
        expect((component.investmentUniverseSetting as InvestmentUniversePortfolio).portfolio).toEqual('PEP');
    });

    test('if the portfolio is set using typeahead', () => {
        expect((component.investmentUniverseSetting as InvestmentUniversePortfolio).portfolio).toEqual('');
        (component as any).portSearchComp.isTypeaheadOptionSelected = true;
        component.onPortfolioSelectedTypeahead('MF_INTLE');
        expect((component.investmentUniverseSetting as InvestmentUniversePortfolio).portfolio).toEqual('MF_INTLE');
    });

    test('launchSecuritySearchModal', () => {
        expect(component.isSecuritySearchModalOpened).toBe(undefined);
        component.launchSecuritySearchModal();
        expect(component.isSecuritySearchModalOpened).toBe(true);
    });

    test('onSecuritySearchModalClosed', () => {
        component.isSecuritySearchModalOpened = true;
        component.onSecuritySearchModalClosed();
        expect(component.isSecuritySearchModalOpened).toBe(false);
    });

    test('onFilterUpdate - should update with the filter received', () => {
        (component.investmentUniverseSetting as InvestmentUniversePortfolio).filter = null;
        const filter: CustomFilter = new CustomFilter();
        component.onFilterUpdate(filter);
        expect((component.investmentUniverseSetting as InvestmentUniversePortfolio).filter === filter).toBeTruthy();
    });
});
