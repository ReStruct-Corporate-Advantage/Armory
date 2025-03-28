import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CommonModule} from '@angular/common';

import {InvestmentUniverseSettingsComponent} from './investment-universe-settings.component';
import {Component, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {getInvestmentUniverseSettingsData} from '../../constants/test-data.testutils';
import {UNIVERSE_CHECK} from '../constants/investment-universe-settings.constants';
import {InvestmentUniverseConstants} from '../../../../constants/investment-universe.constants';
import {InvestmentUniverseItemBase} from '@models/portfolio/investmentUniverse/investment-universe-item-base.model';
import {InvestmentUniversePortfolio} from '@models/portfolio/investmentUniverse/investment-universe-portfolio.model';
import {CustomFilter} from '@blk/explore-ui-breakdown';

@Component({
    selector: 'app-investment-universe-form',
    template: ''
})
export class MockInvestmentUniverseFormComponent {}

describe('InvestmentUniverseSettingsComponent', () => {
    let component: InvestmentUniverseSettingsComponent;
    let fixture: ComponentFixture<InvestmentUniverseSettingsComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            imports: [HttpClientModule, CommonModule, FormsModule, ReactiveFormsModule],
            declarations: [InvestmentUniverseSettingsComponent, MockInvestmentUniverseFormComponent]
        });

        fixture = TestBed.createComponent(InvestmentUniverseSettingsComponent);
        component = fixture.componentInstance;
        const fb: UntypedFormBuilder = TestBed.inject(UntypedFormBuilder);
        component.universeForm = fb.group({
            forms: fb.array([])
        });

        component.investmentUniverseSettings = getInvestmentUniverseSettingsData();

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
        expect(component.frozenItems.length).toEqual(2);
        expect(component.forms.length).toEqual(2);
    });

    it('should addToUniverse', () => {
        const numberOfItemsInUniverse = component.investmentUniverseSettings.investmentUniverse.length;
        component.addToUniverse();
        expect(component.investmentUniverseSettings.investmentUniverse.length).toEqual(numberOfItemsInUniverse + 1);
    });

    it('should removeFromUniverse', () => {
        const numberOfItemsInUniverse = component.investmentUniverseSettings.investmentUniverse.length;
        component.removeFromUniverse(0);
        expect(component.investmentUniverseSettings.investmentUniverse.length).toEqual(numberOfItemsInUniverse - 1);
    });

    it('on enable whole universe', () => {
        expect(areAllItemsChecked()).toEqual(false);
        component.onEnableWholeUniverse({
            detail: {
                value: {
                    checked: true
                }
            }
        } as CustomEvent);
        expect(areAllItemsChecked()).toBe(true);
    });

    function areAllItemsChecked() {
        return component.forms.controls.every((control: UntypedFormGroup) => {
            return control.get(UNIVERSE_CHECK).value === true;
        });
    }

    test('onUniverseTypeChanged Security to Portfolio', () => {
        let investmentUniverseItemBases: InvestmentUniverseItemBase[] = component.investmentUniverseSettings.investmentUniverse;
        expect(investmentUniverseItemBases.length).toEqual(4);
        expect(investmentUniverseItemBases[3].type).toEqual(InvestmentUniverseConstants.SECURITY);

        component.onUniverseTypeChanged(1);

        investmentUniverseItemBases = component.investmentUniverseSettings.investmentUniverse;
        expect(investmentUniverseItemBases.length).toEqual(4);
        expect(investmentUniverseItemBases[3].type).toEqual(InvestmentUniverseConstants.PORTFOLIO);
    });

    test('onUniverseTypeChanged Portfolio to Security', () => {
        let investmentUniverseItemBases: InvestmentUniverseItemBase[] = component.investmentUniverseSettings.investmentUniverse;
        expect(investmentUniverseItemBases.length).toEqual(4);
        expect(investmentUniverseItemBases[2].type).toEqual(InvestmentUniverseConstants.PORTFOLIO);

        component.onUniverseTypeChanged(0);

        investmentUniverseItemBases = component.investmentUniverseSettings.investmentUniverse;
        expect(investmentUniverseItemBases.length).toEqual(4);
        expect(investmentUniverseItemBases[2].type).toEqual(InvestmentUniverseConstants.SECURITY);
    });

    test('onFilterUpdate', () => {
        const filter: CustomFilter = new CustomFilter();
        (component.frozenItems[1] as InvestmentUniversePortfolio).filter = null;
        component.onFilterUpdate(filter, component.frozenItems[1]);
        expect((component.frozenItems[1] as InvestmentUniversePortfolio).filter === filter).toBeTruthy();
    });

    test('enableDisableItem', () => {
        (component.frozenItems[1] as InvestmentUniversePortfolio).enabled = false;
        component.enableDisableItem({detail: {value: {checked: true}}} as any, component.frozenItems[1]);
        expect((component.frozenItems[1] as InvestmentUniversePortfolio).enabled).toBeTruthy();
    });
});
