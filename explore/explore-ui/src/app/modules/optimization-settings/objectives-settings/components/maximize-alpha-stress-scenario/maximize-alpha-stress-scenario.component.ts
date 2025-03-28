import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {
    AuxSelectOption,
    AuxSelectOptionGroup,
    AuxSelectSelectionChangedDetailInterface
} from '@blk/aladdin-angular-components';
import {ColumnConfig, NamedScenario, SubscribableComponent, TokenConstants, TokenUtils} from '@blk/explore-ui-core';
import {
    OptionValueComponent
} from '@optimization-settings-configuration/constraints-settings/interfaces/option-value-component.interface';
import {ConstraintOption} from '@optimization-settings-configuration/constraints-settings/models/constraint-option';
import {Subject} from 'rxjs';
import {Dictionary} from 'lodash';
import {
    ConstraintOptionTypeKey
} from '@optimization-settings/constraints-settings/enums/constraint-option-type-key.enum';
import {
    ConstraintOptionValueUpdate
} from '@optimization-settings-configuration/constraints-settings/models/constraint-option-value-update';
import {takeUntil} from 'rxjs/operators';
import {CompositionUtils} from '@utils/composition.utils';

@Component({
    selector: 'app-maximize-alpha-stress-scenario',
    templateUrl: './maximize-alpha-stress-scenario.component.html',
    styleUrls: ['./maximize-alpha-stress-scenario.component.scss']
})
export class MaximizeAlphaStressScenarioComponent extends SubscribableComponent implements OnInit, OptionValueComponent<string, any> {

    @Input() options: ConstraintOption<any>[];
    @Input() optionValues$: Subject<Dictionary<any>>;
    @Input() columnConfig: ColumnConfig;
    @Input() injectedClass = 'default-width';
    @Input() selectedScenario: string;

    @Output() updated: EventEmitter<ConstraintOptionValueUpdate<string>> = new EventEmitter();

    scenarios: AuxSelectOptionGroup[];

    /**
     * Flag to enable the new Scenarios PRT migration work
     */
    isNewStressScenarioEnabled = false;
    nameScenarios: NamedScenario[];
    isScenarioModalOpen = false;

    ngOnInit(): void {
        this.isNewStressScenarioEnabled = TokenUtils.isFeatureEnabled(TokenConstants.EXPLORE_ENABLE_NEW_STRESS_SCENARIOS);

        this.updateSelectedScenario();

        this.optionValues$
            ?.pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(value => {
                this.selectedScenario = value[ConstraintOptionTypeKey.STRESS_PNL_SCENARIO];
                this.updateSelectedScenario();
            });
    }

    protected updateSelectedScenario(): void {
        this.scenarios = CompositionUtils.initializeNamedScenarios(this.selectedScenario);
    }

    onUpdateStressScenario(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>) {
        this.updated.emit({
            key: ConstraintOptionTypeKey.STRESS_PNL_SCENARIO,
            value: (event.detail.value as AuxSelectOption).value
        });
    }

    /**
     * Sets customDateRangeModalOpen boolean to true
     */
    openScenarioSelectionModal(): void {
        this.nameScenarios = [];
        if (this.selectedScenario) {
            this.nameScenarios.push(new NamedScenario());
            this.nameScenarios[0].code = this.selectedScenario;
        }
        this.isScenarioModalOpen = true;
    }

    onScenarioSelectionModalClosed(isSave: boolean) {
        this.isScenarioModalOpen = false;

        if (isSave === true) {
            this.updated.emit({
                key: ConstraintOptionTypeKey.STRESS_PNL_SCENARIO,
                value: this.nameScenarios[0].code,
            });
        }
    }
}
