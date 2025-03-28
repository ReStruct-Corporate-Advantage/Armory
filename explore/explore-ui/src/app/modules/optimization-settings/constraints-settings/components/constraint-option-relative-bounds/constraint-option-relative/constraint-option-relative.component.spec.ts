import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ConstraintOptionRelativeComponent} from './constraint-option-relative.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {of} from 'rxjs';
import {InvestmentUniversePortfolio} from '@models/portfolio/investmentUniverse/investment-universe-portfolio.model';
import {OptimizationSettings} from '@models/portfolio/optimization/optimization-settings.model';
import { InvestmentUniverseSettings } from '@models/portfolio/investmentUniverse/investment-universe-settings.model';
import {InvestmentUniverseSecurity} from '@models/portfolio/investmentUniverse/investment-universe-security.model';

describe('ConstraintOptionRelativeComponent', () => {
    let component: ConstraintOptionRelativeComponent;
    let fixture: ComponentFixture<ConstraintOptionRelativeComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ConstraintOptionRelativeComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(ConstraintOptionRelativeComponent);
        component = fixture.componentInstance;
        component.options = [{
            optionAttribute: {
                title: 'title1',
                key: 'key1',
                values: [{label: 'label1', value: 'label1'}]
            },
            value$: of('value')
        }];
        const parentConfig: OptimizationSettings = new OptimizationSettings();
        parentConfig.investmentUniverseSettings = new InvestmentUniverseSettings();
        parentConfig.investmentUniverseSettings.investmentUniverse = [new InvestmentUniversePortfolio()];
        component.parentConfig = parentConfig;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should filter out the security from Investment Universe list', () => {
        const parentConfig: OptimizationSettings = new OptimizationSettings();
        parentConfig.investmentUniverseSettings = new InvestmentUniverseSettings();
        parentConfig.investmentUniverseSettings.investmentUniverse = [new InvestmentUniversePortfolio(), new InvestmentUniverseSecurity(), new InvestmentUniversePortfolio()];
        component.parentConfig = parentConfig;

        component.ngOnInit();
        expect(component.selectOptions[0].optionAttribute.values.length).toBe(2);
    });
});
