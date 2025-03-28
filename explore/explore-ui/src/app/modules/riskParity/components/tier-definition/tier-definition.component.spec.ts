import {TierDefinitionComponent} from './tier-definition.component';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ReactiveFormsModule} from '@angular/forms';
import {TierDefinition} from '@models/portfolio/optimization/tier-definition.model';
import {TokenUtils} from "@blk/explore-ui-core";

describe('Tier Definition Component', () => {
    let component: TierDefinitionComponent;
    let fixture: ComponentFixture<TierDefinitionComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            imports: [CommonModule, ReactiveFormsModule],
            declarations: [TierDefinitionComponent]
        });
        TokenUtils.isFeatureEnabled = jest.fn().mockReturnValue(false);
        fixture = TestBed.createComponent(TierDefinitionComponent);
        component = fixture.componentInstance;
        component.tiers = new TierDefinition();
        component.tiers.tierType = 0;
        fixture.detectChanges();
    });

    it('should create', function () {
        component.updateTierOne({detail: {value: 10}});
        component.updateTierTwo({detail: {value: 20}});
        component.onTierDefinitionTypeOptionChanged({tierDefinitionType: 1, helpText: ''});
        component.onRiskBudgetTierRatioChanged({detail: {value: '0.5'}});
        component.onRiskBudgetFixedAssetRatioChanged({detail: {value: '0.1'}});
        expect(component.tiers.tierOne).toEqual(10);
        expect(component.tiers.tierTwo).toEqual(20);
        expect(component.tiers.tierType).toEqual(1);
        expect(component.tiers.riskBudgetTierRatio).toEqual('0.5');
        expect(component.tiers.riskBudgetFixedAssetRatio).toEqual('0.1');


        component.onRiskBudgetTierRatioChanged({detail: {value: ''}});
        component.onRiskBudgetFixedAssetRatioChanged({detail: {value: ''}});
        expect(component.tiers.riskBudgetTierRatio).toEqual('');
        expect(component.tiers.riskBudgetFixedAssetRatio).toEqual('');
    });

    it('should test token value', function () {
        expect(component.isFixedAssetRatioVisible).toBeFalsy();
    });
});
