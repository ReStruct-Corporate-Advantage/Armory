import {ComponentFixture, TestBed} from '@angular/core/testing';
import {NestedCustomSectorRuleComponent} from './nested-custom-sector-rule.component';
import {CUSTOM_ELEMENTS_SCHEMA, SimpleChange} from '@angular/core';
import {CustomSector} from '../../../models/sector/custom-sector/custom-sector.model';
import {CustomSectorRule} from '../../../models/sector/custom-sector/custom-sector-rule.model';

describe('NestedCustomSectorRuleComponent', () => {
    let component: NestedCustomSectorRuleComponent;
    let fixture: ComponentFixture<NestedCustomSectorRuleComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [NestedCustomSectorRuleComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(NestedCustomSectorRuleComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('Test Rule Text changes', () => {
        expect(component.ruleText).toStrictEqual('Custom sector not defined');
        component.rule = new CustomSectorRule();
        component.rule.customSector = new CustomSector();
        component.rule.customSector.title = 'Test Custom Sector';
        component.ngOnChanges({
            rule: new SimpleChange(null, component.rule, true)
        });
        expect(component.ruleText).toStrictEqual('Sector Equals Test Custom Sector');
        component.editRule();
        expect(component.ruleText).toStrictEqual('Sector Does Not Equal Test Custom Sector');
    });
});
