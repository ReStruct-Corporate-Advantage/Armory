import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ColumnSectorRule} from '../../models/sector/column-sector/column-sector-rule.model';
import {SectorRuleBuilderConfig} from '../../models/sector/sector-rule-builder-config.model';
import {BaseSectorRuleBuilderModalComponent} from './base-sector-rule-builder-modal.component';
import {SectorAttributeRuleBuilderComponent} from '../sector-attribute-rule-builder/sector-attribute-rule-builder.component';
import {Rule} from '../../interfaces/rule.interface';

describe('BaseSectorRuleBuilderModalComponent', () => {
    let component: BaseSectorRuleBuilderModalComponent;
    let fixture: ComponentFixture<BaseSectorRuleBuilderModalComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [BaseSectorRuleBuilderModalComponent, SectorAttributeRuleBuilderComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(BaseSectorRuleBuilderModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('Test Open Dialog close Dialog', fakeAsync(() => {
        const dialogAction = component.openDialog(new SectorRuleBuilderConfig([], null), new ColumnSectorRule());
        expect(component.isDialogOpen).toBeTruthy();
        dialogAction.subscribe(
            (rule: Rule) => {
                expect(rule).toBeUndefined();
            }
        );
        component.onCancelClick();
        tick();
        expect(component.isDialogOpen).toBeFalsy();
    }));

    it('Test On Done', fakeAsync(() => {
        const dialogAction = component.openDialog(new SectorRuleBuilderConfig([], null, false, true), new ColumnSectorRule());
        expect(component.isDialogOpen).toBeTruthy();
        fixture.detectChanges();
        jest.spyOn(component.sectorAttributeRuleBuilderComponent, 'validateRule').mockReturnValue(false);
        jest.spyOn(component.sectorAttributeRuleBuilderComponent, 'updateRule');
        component.onDone();
        expect(component.isDialogOpen).toBeTruthy();
        expect(component.sectorAttributeRuleBuilderComponent.updateRule).toHaveBeenCalledTimes(0);
        jest.spyOn(component.sectorAttributeRuleBuilderComponent, 'validateRule').mockReturnValue(true);
        jest.spyOn(component.sectorAttributeRuleBuilderComponent, 'updateRule').mockReturnValue(true);
        dialogAction.subscribe(
            (rule: Rule) => {
                expect(rule).toBeDefined();
            }
        );
        component.onDone();
        tick();
        jest.spyOn(component.sectorAttributeRuleBuilderComponent, 'updateRule').mockReturnValue(false);
        dialogAction.subscribe(
            (rule: Rule) => {
                expect(rule).toBeUndefined();
            }
        );
        component.onDone();
        tick();
    }));
});
