import {CommonUtils, CoreDefinitionStore, ExploreSelectOption, ExploreSelectOptionGroup, TokenConstants} from '@blk/explore-ui-core';
import {GenericValueColumnOption} from '../../models/column-option/generic-value-column-option.model';
import {ColumnOptionUtils} from '../../utils';
import {BaseColumnOptionComponent} from '../column-option/base-column-option.component';
import { Directive } from "@angular/core";
import { ColumnOptionConstants } from '../../constants';
import {
    AuxButtonTypeEnum,
} from '@blk/aladdin-angular-components';

/**
 * Base class for any generic item drop down.
 */
@Directive()
export abstract class GenericDropDownComponent<T extends GenericValueColumnOption<any>> extends BaseColumnOptionComponent<GenericValueColumnOption<any>>{
    /**
     * Enum for the aux button type
     */
    readonly AuxButtonTypeEnum = AuxButtonTypeEnum;

    /**
     * Label for the scenario dropdown
     */
    public readonly SCENARIO_HELPER_TEXT: string = 'Aggregation Formulas';

    /**
     * URL to learn more about commitment risk scenarios (temporary link)
     */ 
    static readonly COMMITMENT_RISK_SCENARIO_LEARN_MORE_URL = '/acs/literature/aladdin-publication/acrm-multiperiod-scenarios.pdf';

    /**
     * The title to put on the dropdown.
     */
    title: string;

    /**
     * Whether the dropdown is an aggregation type dropdown
     */
    isAggregation = false;

    /**
     * Collection of options that the drop down can have
     */
    selectOptions: ExploreSelectOptionGroup[];

    /**
     * Performs the required initialization.
     */
    protected initializeComponent(): void {
        if (!this.option) {
            return;
        }

        // Generate the options to display.
        this.populateDropDownOptions();
        this.title = this.option.columnOptionAttributes[0].title;
        if (this.option.columnOptionAttributes[0].key === ColumnOptionConstants.AGGREGATION_TYPE){
            this.isAggregation = true;
        }

    }

    /**
     * Generates the list of drop down items.
     */
    protected populateDropDownOptions() {
        this.selectOptions = [new ExploreSelectOptionGroup()];
        ColumnOptionUtils.populateFromColumnOptionAttribute(this.selectOptions[0], this.option.columnOptionAttributes[0], this.optionValue.value);
    }


    /**
     * Sets selected item to the given one
     */
    setSelectedValue(item: ExploreSelectOption): void {
        this.optionValue.value = item.value;
    }

    /**
     * Opens link to documentation about scenarios
     */
    openScenariosDocumentationLink(): void {
        // use path if set in token, otherwise default
        const path = CoreDefinitionStore.tokens[TokenConstants.EXPLORE_ACRM_SCENARIO_DOC_URL] || GenericDropDownComponent.COMMITMENT_RISK_SCENARIO_LEARN_MORE_URL;
        // example: https://spc.blackrock.com/acs/literature/aladdin-publication/acrm-multiperiod-scenarios.pdf
        const url = CommonUtils.getURLOrigin() + path;
        window.open(url, '_blank');
    }
}
