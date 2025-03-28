import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {AuxRadioInterface} from '@blk/aladdin-angular-components';
import {DateScenario, SubscribableComponent} from '@blk/explore-ui-core';
import {ScenarioConstants} from '../../../../../../constants/scenario.constant';
import {ImpliedShockScenario} from '../../../../../../models/scenario-types/implied-shock-scenario.model';
import {SpecifiedShockScenario} from '../../../../../../models/scenario-types/specified-shock-scenario.model';

@Component({
    selector: 'explore-extended-column-option-dxs-factor-unit',
    templateUrl: './dxs-factor-unit.component.html',
})
export class DxsFactorUnitComponent extends SubscribableComponent implements OnInit, OnChanges {
    @Input()
    shockScenario: ImpliedShockScenario | SpecifiedShockScenario | DateScenario;
    @Input()
    isDxsShockUnitReadOnly = false;
    @Output()
    valueChangedEmitter = new EventEmitter<void>();

    dxsShockUnitModes: AuxRadioInterface[];

    ngOnInit() {
        this.initializeDxsShockUnitModes();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.isDxsShockUnitReadOnly?.firstChange === false) {
            this.initializeDxsShockUnitModes();
        }
    }

    private initializeDxsShockUnitModes(): void {
        const dxsShockUnitTypes = [
            { displayName: 'Percentage of spread', value: ScenarioConstants.DXS_SHOCK_UNIT.PERCENTAGE_OF_SPREAD },
            { displayName: 'Spread', value: ScenarioConstants.DXS_SHOCK_UNIT.SPREAD }
        ];
        this.dxsShockUnitModes = dxsShockUnitTypes.map(option => {
            return {
                label: option.displayName,
                eventData: option.value,
                checked: !this.isDxsShockUnitReadOnly ? this.shockScenario.dxsShockUnit === option.value : false,
            };
        });
    }

    onDxsFactorUnitChanged(value: any): void {
        this.shockScenario.dxsShockUnit = value;
        this.valueChangedEmitter.emit();
    }
}
