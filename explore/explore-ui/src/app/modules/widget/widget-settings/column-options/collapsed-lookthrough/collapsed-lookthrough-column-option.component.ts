import {Component, EventEmitter, Input, Output} from '@angular/core';
import {AuxCheckboxGroupChangedDetailInterface} from '@blk/aladdin-angular-components';
import {BaseColumnOptionComponent} from '@blk/explore-ui-column-option';
import {CommonUtils, ExploreCheckbox} from '@blk/explore-ui-core';
import {CollapsedLookthroughColumnOption} from '@models/columns/column-options/collapsed-lookthrough-column-option.model';
import {DefinitionsStore} from '@stores/definitions.store';
import {cloneDeep, isEmpty} from 'lodash';
import {LtSecurityTypes} from '@blk/explore-ui-look-through-settings';

@Component({
    selector: 'app-collapsed-lookthrough-column-option',
    templateUrl: './collapsed-lookthrough-column-option.component.html',
    styleUrls: ['./collapsed-lookthrough-column-option.component.scss']
})

export class CollapsedLookthroughColumnOptionComponent extends BaseColumnOptionComponent<CollapsedLookthroughColumnOption> {
    static readonly OPTION_KEY = 'collapsedLookthroughColumnOption';

    @Input()
    isConstraintOption: boolean;

    @Output() optionValueUpdated = new EventEmitter<CollapsedLookthroughColumnOption>();

    availableSecurities: ExploreCheckbox[] = [];
    availableSecurityTypes: LtSecurityTypes[];  // all available security types

    constructor() {
        super();
    }

    protected initializeComponent() {
        super.initializeComponent();

        this.availableSecurityTypes = cloneDeep(DefinitionsStore.ltSecurityType);

        if (this.optionValue.lookthroughSettings && !isEmpty(this.optionValue.lookthroughSettings.ltSecurityTypes)) {
            this.availableSecurityTypes.forEach(securityType => securityType.selected = this.optionValue.lookthroughSettings.ltSecurityTypes.indexOf(securityType.name) !== -1);
        } else {
            // Set them all to be false by default
            this.availableSecurityTypes.forEach(securityType => securityType.selected = false);
        }

        this.availableSecurities = this.availableSecurityTypes
            .map(availableSecurityType => new ExploreCheckbox(CommonUtils.toSentenceCase(availableSecurityType.description), availableSecurityType.selected, false));
    }

    /**
     * Event handler for onCheckboxGroupChanged for security types
     */
    onSecurityTypeGroupChanged(event: CustomEvent<AuxCheckboxGroupChangedDetailInterface>): void {
        if (!event) {
            return;
        }

        this.optionValue.lookthroughSettings.ltSecurityTypes = this.availableSecurityTypes
            .filter(securityType =>
                event.detail.value
                    .filter(value => value.checked)
                    .map(value => value.label)
                    .indexOf(CommonUtils.toSentenceCase(securityType.description)) !== -1
            )
            .map(securityType => securityType.name);

        this.optionValueUpdated.emit(this.optionValue);
    }

    protected getOptionValueConfigType(): string {
        return CollapsedLookthroughColumnOption.CONFIG_TYPE;
    }
}
