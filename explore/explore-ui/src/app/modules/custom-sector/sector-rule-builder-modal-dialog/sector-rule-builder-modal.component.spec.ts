import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {SectorRuleBuilderModalComponent} from './sector-rule-builder-modal.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ColumnSectorRule, CustomSectorType, GroupRule, Rule, SectorRuleBuilderConfig} from '@blk/explore-ui-breakdown';
import {SectorAttributeRuleBuilderComponent} from '@blk/explore-ui-breakdown';
import {DefinitionsService} from '../../metadata/definitions/definitions.service';
import {TestUtils} from '@utils/test.utils';
import {FundSectoringRuleBuilderComponent} from './fund-sectoring-rule-builder/fund-sectoring-rule-builder.component';
import {CommonConstants} from '@constants/common.constants';
import {WidgetSettingsStore} from '../../widget/widget-settings/widget-settings.store';
import {Subject} from 'rxjs';

describe('SectorRuleBuilderModalComponent', () => {
    let component: SectorRuleBuilderModalComponent;
    let fixture: ComponentFixture<SectorRuleBuilderModalComponent>;
    const definitionsServiceMock = {
        getColumnStaticValues$: jest.fn()
    };

    const widgetSettingsStoreStub = {
        sourceDataUpdated$: new Subject()
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [SectorRuleBuilderModalComponent, SectorAttributeRuleBuilderComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {provide: DefinitionsService, useValue: definitionsServiceMock},
                {provide: WidgetSettingsStore, useValue: widgetSettingsStoreStub}
            ]
        });

        fixture = TestBed.createComponent(SectorRuleBuilderModalComponent);
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
        // Nested fund sector Rule
        const nestesFundSectorRule = TestUtils.createNestedFundSectorRule(['BELSH'], ['BRS123'], CustomSectorType.PORTFOLIO);
        component.openDialog(new SectorRuleBuilderConfig([], null), nestesFundSectorRule);
        expect(component.isDialogOpen).toBeTruthy();
        expect(component.ruleCustomSectorType).toEqual(CustomSectorType.PORTFOLIO);

    }));

    it('Test onTabSelected', fakeAsync(() => {
        const tabSelectedEvent = ({detail: {uid: '0'}} as any) as CustomEvent;
        component.onTabSelected(tabSelectedEvent);
        expect(component.rule.ruleType).toEqual('Rule');
        expect(component.ruleCustomSectorType).toEqual(CustomSectorType.ATTRIBUTES);
        tabSelectedEvent.detail.uid = '1';
        component.onTabSelected(tabSelectedEvent);
        expect(component.ruleCustomSectorType).toEqual(CustomSectorType.FUND);
        expect(component.rule.ruleType).toEqual('Rule');
        tabSelectedEvent.detail.uid = '2';
        component.onTabSelected(tabSelectedEvent);
        expect(component.ruleCustomSectorType).toEqual(CustomSectorType.INDEX);
        expect(component.rule.ruleType).toEqual('RuleGroup');
        expect((component.rule as GroupRule).groupType).toEqual(CommonConstants.GROUP_RULE_CONDITION.OR);
        tabSelectedEvent.detail.uid = '3';
        component.onTabSelected(tabSelectedEvent);
        expect(component.ruleCustomSectorType).toEqual(CustomSectorType.PORTFOLIO);
        expect(component.rule.ruleType).toEqual('RuleGroup');
        expect((component.rule as GroupRule).groupType).toEqual(CommonConstants.GROUP_RULE_CONDITION.OR);
    }));

    it('Test openSwitchTabDialog', fakeAsync(() => {
        expect(component.openSwitchTabDialog(undefined)).toBeUndefined();
        jest.spyOn(component.switchTab$, 'next');
        // Nested Fund Sector Type
        component.ruleCustomSectorType = CustomSectorType.PORTFOLIO;
        component.fundSectoringRuleBuilderComponent = ({shouldDisplayWarningDialogForTabSwitch: jest.fn()} as any) as FundSectoringRuleBuilderComponent;
        jest.spyOn(component.fundSectoringRuleBuilderComponent, 'shouldDisplayWarningDialogForTabSwitch').mockReturnValue(false);
        expect(component.openSwitchTabDialog({})).resolves.toBeTruthy();
        jest.spyOn(component.fundSectoringRuleBuilderComponent, 'shouldDisplayWarningDialogForTabSwitch').mockReturnValue(true);
        component.openSwitchTabDialog({});
        component.switchTab();
        expect(component.switchTab$.next).toHaveBeenCalledWith(true);
        component.openSwitchTabDialog({});
        component.cancelSwicthTab();
        expect(component.switchTab$.next).toHaveBeenCalledWith(false);
        // Attribute sector type
        component.ruleCustomSectorType = CustomSectorType.ATTRIBUTES;
        component.sectorAttributeRuleBuilderComponent = ({shouldDisplayWarningDialogForTabSwitch: jest.fn()} as any) as SectorAttributeRuleBuilderComponent;
        jest.spyOn(component.sectorAttributeRuleBuilderComponent, 'shouldDisplayWarningDialogForTabSwitch').mockReturnValue(false);
        expect(component.openSwitchTabDialog({})).resolves.toBeTruthy();
        jest.spyOn(component.fundSectoringRuleBuilderComponent, 'shouldDisplayWarningDialogForTabSwitch').mockReturnValue(true);
        component.openSwitchTabDialog({});
        component.switchTab();
        expect(component.switchTab$.next).toHaveBeenCalledWith(true);
        component.openSwitchTabDialog({});
        component.cancelSwicthTab();
        expect(component.switchTab$.next).toHaveBeenCalledWith(false);
    }));

    it('Test On Done', fakeAsync(() => {
        let dialogAction = component.openDialog(new SectorRuleBuilderConfig([], null, false, true), new ColumnSectorRule());
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

        // Fund Sectoring
        const fundSectoringRule = TestUtils.createNestedFundSectorRule(['BELSH'], ['BRS123'], CustomSectorType.PORTFOLIO);
        dialogAction = component.openDialog(new SectorRuleBuilderConfig([], null, false, true), fundSectoringRule);
        component.fundSectoringRuleBuilderComponent = ({updateRule: jest.fn()} as any) as FundSectoringRuleBuilderComponent;
        jest.spyOn(component.fundSectoringRuleBuilderComponent, 'updateRule').mockReturnValue(false);
        dialogAction.subscribe(
            (rule: Rule) => {
                expect(rule).toBeUndefined();
            }
        );
        component.onDone();
        tick();
        expect(component.isDialogOpen).toBeFalsy();
        dialogAction = component.openDialog(new SectorRuleBuilderConfig([], null, false, true), fundSectoringRule);
        jest.spyOn(component.fundSectoringRuleBuilderComponent, 'updateRule').mockReturnValue(true);
        dialogAction.subscribe(
            (rule: Rule) => {
                expect(rule).toBeDefined();
            }
        );
        component.onDone();
        tick();
        expect(component.isDialogOpen).toBeFalsy();
    }));
});
