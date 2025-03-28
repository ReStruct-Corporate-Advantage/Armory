import {AuxCheckboxChangedDetailInterface} from '@blk/aladdin-angular-components';
import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {UntypedFormArray, UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {InvestmentUniverseSettings} from '@models/portfolio/investmentUniverse/investment-universe-settings.model';
import {InvestmentUniverseItemBase} from '@models/portfolio/investmentUniverse/investment-universe-item-base.model';
import {InvestmentUniversePortfolio} from '@models/portfolio/investmentUniverse/investment-universe-portfolio.model';
import {InvestmentUniverseConstants} from '@constants/investment-universe.constants';
import {UNIVERSE_CHECK, UNIVERSE_SEARCH} from '../constants/investment-universe-settings.constants';
import {InvestmentUniverseSecurity} from '@models/portfolio/investmentUniverse/investment-universe-security.model';
import {isEqual} from 'lodash';
import {WorkspaceUtils} from '@utils/workspace.utils';
import {SECURITY_LIST_VALUE} from '../../../optimization/constants/investment-universe.constants';
import {CommonConstants} from '@constants/common.constants';
import {CustomFilter} from '@blk/explore-ui-breakdown';

@Component({
    selector: 'app-investment-universe-settings',
    templateUrl: './investment-universe-settings.component.html',
    styleUrls: ['./investment-universe-settings.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvestmentUniverseSettingsComponent implements OnInit {
    @Input() investmentUniverseSettings: InvestmentUniverseSettings;

    universeForm: UntypedFormGroup;

    frozenItems: InvestmentUniversePortfolio[] = [];

    isCheckboxDisabled = true;

    constructor(private fb: UntypedFormBuilder) {}

    ngOnInit(): void {
        this.universeForm = this.fb.group({
            forms: this.fb.array([])
        });

        if (this.investmentUniverseSettings) {
            this.investmentUniverseSettings.investmentUniverse.forEach((investmentUniverseItem: InvestmentUniverseItemBase) => {
                // read items which have frozen =  true, to create the fixed fields
                if (investmentUniverseItem.isFrozen) {
                    this.frozenItems.push(investmentUniverseItem as InvestmentUniversePortfolio);
                } else {
                    // read dynamic items to update the form
                    this.forms.push(this.createUniverseForm(investmentUniverseItem));
                }
            });
        }

        this.isCheckboxDisabled = this.isEverythingFrozen();
    }

    createUniverseForm(investmentUniverseItem: InvestmentUniverseItemBase): UntypedFormGroup {
        return this.fb.group({
            universeCheck: investmentUniverseItem.enabled,
            universeSearch: investmentUniverseItem instanceof InvestmentUniversePortfolio
                                                ? investmentUniverseItem.portfolio : ''
        });
    }

    get forms(): UntypedFormArray {
        return this.universeForm.controls.forms as UntypedFormArray;
    }

    addToUniverse(): void {
        const investmentUniverseItem = new InvestmentUniversePortfolio();
        investmentUniverseItem.type = InvestmentUniverseConstants.PORTFOLIO;
        const titlesArray: Array<{title: string}> = this.investmentUniverseSettings.investmentUniverse.map(item => ({title: item.label}));
        investmentUniverseItem.label = this.generateLabel(true, titlesArray);
        this.forms.push(this.createUniverseForm(investmentUniverseItem));
        this.investmentUniverseSettings.investmentUniverse.push(investmentUniverseItem);
        this.isCheckboxDisabled = this.isEverythingFrozen();
    }

    removeFromUniverse(index: number): void {
        this.forms.removeAt(index);
        this.investmentUniverseSettings.investmentUniverse.splice(index + this.frozenItems.length, 1);
        this.isCheckboxDisabled = this.isEverythingFrozen();
    }

    /**
     * Generates Label to be displayed on initialization for investment universe rows
     */
    generateLabel(isInvestmentUniversePortfolio: boolean, titlesArray: Array<{title: string}>): string {
        // Return ('Portfolio '+ number) for investment universe portfolio and ('Security List ' + number) for investment universe security
        if (isInvestmentUniversePortfolio) {
            const numberOfAddedInvestmentPorts = this.investmentUniverseSettings.investmentUniverse.filter((universeItem: InvestmentUniverseItemBase) => !universeItem.isFrozen && universeItem instanceof InvestmentUniversePortfolio).length;
            return CommonConstants.PORTFOLIO + CommonConstants.SINGLE_SPACE +  WorkspaceUtils.getNewObjectNumber(titlesArray, CommonConstants.PORTFOLIO, numberOfAddedInvestmentPorts + 1).toString();
        } else {
            const numberOfAddedInvestmentSecurity = this.investmentUniverseSettings.investmentUniverse.filter((universeItem: InvestmentUniverseItemBase) => !universeItem.isFrozen && universeItem instanceof InvestmentUniverseSecurity).length;
            return SECURITY_LIST_VALUE + CommonConstants.SINGLE_SPACE + WorkspaceUtils.getNewObjectNumber(titlesArray, SECURITY_LIST_VALUE, numberOfAddedInvestmentSecurity + 1).toString();
        }
    }

    onUniverseTypeChanged(index: number) {
        const investmentUniverseToChange = this.investmentUniverseSettings.investmentUniverse[index + this.frozenItems.length];
        let investmentUniverseTypeToChangeTo: InvestmentUniverseItemBase;
        // Generate titles array and filter out the label for investment universe that is being changed.
        const titlesArray: Array<{title: string}> = this.investmentUniverseSettings.investmentUniverse.map(item => ({title: item.label})).filter(obj => obj.title !== investmentUniverseToChange.label);
        if (investmentUniverseToChange.type === InvestmentUniverseConstants.SECURITY) {
            investmentUniverseTypeToChangeTo = new InvestmentUniversePortfolio({
                type: InvestmentUniverseConstants.PORTFOLIO,
                enabled: investmentUniverseToChange.enabled,
                label: this.generateLabel(true, titlesArray)
            });
        } else {
            investmentUniverseTypeToChangeTo = new InvestmentUniverseSecurity({
                type: InvestmentUniverseConstants.SECURITY,
                enabled: investmentUniverseToChange.enabled,
                securities: [],
                label: this.generateLabel(false, titlesArray)
            });
        }
        this.investmentUniverseSettings.investmentUniverse.splice(index + this.frozenItems.length, 1, investmentUniverseTypeToChangeTo);
        this.forms.controls[index].patchValue({
            [UNIVERSE_SEARCH]: investmentUniverseTypeToChangeTo instanceof InvestmentUniversePortfolio
                                        ? investmentUniverseTypeToChangeTo.portfolio : ''
        });
        this.isCheckboxDisabled = this.isEverythingFrozen();
    }

    onEnableWholeUniverse(event: CustomEvent<AuxCheckboxChangedDetailInterface>) {
        for (const control of this.forms.controls) {
            control.get(UNIVERSE_CHECK).setValue(event.detail.value.checked);
        }
    }

    /**
     * Method to check whether if all options present
     * in InvestmentUniverse are unselectable or not
     */
    isEverythingFrozen() {
        return isEqual(this.frozenItems, this.investmentUniverseSettings.investmentUniverse);
    }

    onFilterUpdate(customFilter: CustomFilter, frozenItem: any): void {
        this.frozenItems.find(item => frozenItem === item).filter = customFilter;
    }

    enableDisableItem(checkedState: CustomEvent, frozenItem: any) {
        this.frozenItems.find(item => frozenItem === item).enabled = checkedState.detail.value.checked;
    }
}
