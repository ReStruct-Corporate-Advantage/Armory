import {Component, Input, OnInit} from '@angular/core';
import {ColumnConfig, ColumnOptionMetaDataInterface, ModalDirective, NamedScenario} from '@blk/explore-ui-core';
import {ScenarioColumnOption} from '@blk/explore-ui-column-option';
import {cloneDeep} from 'lodash';
import {NotificationService} from '@services/notification';

@Component({
  selector: 'app-maximize-alpha-new-stress-scenario-modal',
  templateUrl: './maximize-alpha-new-stress-scenario-modal.component.html',
  styleUrls: ['./maximize-alpha-new-stress-scenario-modal.component.scss']
})
export class MaximizeAlphaNewStressScenarioModal extends ModalDirective<boolean> implements OnInit {

    @Input()
    nameScenarios: NamedScenario[];

    option: ColumnOptionMetaDataInterface;
    column: ColumnConfig;
    private scenarioColumnOption: ScenarioColumnOption;

    constructor(private notificationService: NotificationService) {
        super();
    }

    ngOnInit(): void {
        this.scenarioColumnOption = new ScenarioColumnOption();
        this.scenarioColumnOption.nameScenarios = cloneDeep(this.nameScenarios);
        this.scenarioColumnOption.initialize(undefined);

        this.column = new ColumnConfig();
        this.column.optionValues = [ this.scenarioColumnOption ];
        // @ts-ignore
        this.option = { columnOptionAttributes: [{ 'isRestricted': true, 'optimizationFlow': true, }] };
    }

    onDoneClicked(): void {
        if (this.scenarioColumnOption.nameScenarios.length === 0) {
            this.notificationService.error('Please select a scenario.');
            return;
        }
        this.nameScenarios.length = 0;
        this.nameScenarios.push(...this.scenarioColumnOption.nameScenarios);
        this.closeModal(true);
    }

}

