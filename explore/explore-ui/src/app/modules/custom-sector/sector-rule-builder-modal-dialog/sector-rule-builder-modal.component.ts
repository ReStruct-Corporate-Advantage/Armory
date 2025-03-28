import {Component, ViewChild} from '@angular/core';
import {BaseSectorRuleBuilderModalComponent, ColumnSectorRule, CustomSectorType, GroupRule} from '@blk/explore-ui-breakdown';
import {of, Subject} from 'rxjs';
import {FundSectoringRuleBuilderComponent} from './fund-sectoring-rule-builder/fund-sectoring-rule-builder.component';
import {CommonConstants} from '@constants/common.constants';
import {NotificationService} from '@services/notification';
import {AlertConstants, ExploreDialogParam} from '@blk/explore-ui-core';
import {AuxTabBarItemInterface} from '@blk/aladdin-angular-components';

/**
 * Component used to create/update Column Sector Rule
 *
 * <app-sector-rule-builder-modal></app-sector-rule-builder-modalg>
 */
@Component({
    selector: 'app-sector-rule-builder-modal',
    templateUrl: './sector-rule-builder-modal.component.html',
    styleUrls: ['./sector-rule-builder-modal.component.scss']
})
export class SectorRuleBuilderModalComponent extends BaseSectorRuleBuilderModalComponent {

    @ViewChild(FundSectoringRuleBuilderComponent, {static: false})
    fundSectoringRuleBuilderComponent: FundSectoringRuleBuilderComponent;

    activeTabIndex = 0;

    customSectorTypes = CustomSectorType;

    customSectorTypesTabData: AuxTabBarItemInterface[];

    switchTab$ = new Subject<boolean>();

    constructor(private notificationService: NotificationService) {
        super();
        this.customSectorTypesTabData = CustomSectorType.values().map((sectorType, index) => {
            return {label: CustomSectorType[sectorType], uid: index.toString()};
        });
    }

    setRuleCustomSectorType() {
        // In case rule is nested fund sector rule
        if (this.originalRule instanceof GroupRule) {
            this.activeTabIndex = CustomSectorType.values().indexOf((this.originalRule.subRules[0] as ColumnSectorRule).customSectorType.toUpperCase());
        } else {
            this.activeTabIndex = CustomSectorType.values().indexOf(this.originalRule.customSectorType.toUpperCase());
        }
        this.ruleCustomSectorType = CustomSectorType[CustomSectorType.values()[this.activeTabIndex]];
    }

    /**
     * Method invoked when an input category tab is selected
     */
    onTabSelected(event: CustomEvent): void {
        this.activeTabIndex = Number(event.detail.uid);
        this.ruleCustomSectorType = CustomSectorType[CustomSectorType.values()[this.activeTabIndex]];
        if (this.ruleCustomSectorType === CustomSectorType.FUND || this.ruleCustomSectorType === CustomSectorType.ATTRIBUTES) {
            this.rule = new ColumnSectorRule();
            this.rule.customSectorType = this.ruleCustomSectorType;
        } else {
            this.rule = this.getNewNestedFundSectorRule(this.ruleCustomSectorType);
        }
    }

    /**
     * Switch tab
     */
    openSwitchTabDialog = (tab: any): Promise<boolean> => {
        if (!tab) {
            return;
        }

        if (!this.shouldDisplayWarningDialogForTabSwitch()) {
            return of(true).toPromise();
        }

        return new Promise(resolve => {
            this.notificationService.openDialog(
                new ExploreDialogParam(
                    AlertConstants.TYPE.ALERT_WITH_OPTIONS,
                    AlertConstants.HEADER.CONFIRM,
                    AlertConstants.BODY.CUSTOM_SECTOR_SWITCH_TABS_WARNING,
                    AlertConstants.BTN.OK,
                    AlertConstants.BTN.CANCEL,
                    this.switchTab,
                    this.cancelSwicthTab
                )
            );
            return this.switchTab$.subscribe((isSwitched) => {
                resolve(isSwitched);
            });
        });
    };

    /**
     * Method to check if user prompt is needed to switch between custom sector types tabs
     */
    shouldDisplayWarningDialogForTabSwitch(): boolean {
        if (this.ruleCustomSectorType === CustomSectorType.ATTRIBUTES) {
            return this.sectorAttributeRuleBuilderComponent.shouldDisplayWarningDialogForTabSwitch();
        }
        return this.fundSectoringRuleBuilderComponent.shouldDisplayWarningDialogForTabSwitch();
    }

    /**
     * Switch to tab
     */
    switchTab = (): void => {
        this.switchTab$.next(true);
    };

    /**
     * On cancel switch tab
     */
    cancelSwicthTab = (): void => {
        this.switchTab$.next(false);
    };

    /**
     * return nested fund sector rule without any comparision values.
     */
    getNewNestedFundSectorRule(customSectorType: CustomSectorType.PORTFOLIO | CustomSectorType.INDEX) {
        const groupRule = new GroupRule();
        const portfolioColumnRule = new ColumnSectorRule();
        portfolioColumnRule.customSectorType = this.ruleCustomSectorType;
        const cusipColumnRule = new ColumnSectorRule();
        cusipColumnRule.customSectorType = customSectorType;
        groupRule.subRules = [portfolioColumnRule, cusipColumnRule];
        groupRule.groupType = CommonConstants.GROUP_RULE_CONDITION.OR;
        return groupRule;
    }

    /**
     * Method is called on click of done button of dialog
     */
    onDone(): void {
        if (this.ruleCustomSectorType === CustomSectorType.ATTRIBUTES) {
            return super.onDone();
        }
        // Pushes new rule if rule was updated otherwise push undefined
        this.responseSubject.next(this.fundSectoringRuleBuilderComponent.updateRule() ? this.rule : undefined);
        this.closeDialog();
    }

}
