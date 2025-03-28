import {Component, EventEmitter, Input, Output} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {ExploreDialogParam, ModalDirective} from '@blk/explore-ui-core';
import {ScenarioColumnOption} from '@blk/explore-ui-column-option';
import {ScenarioResponse} from '../../../../../interfaces/scenario-response.interface';

/**
 * This component opens a modal on top of widget-settings modal and is used to manage all available stress scenarios for a look back Date
 */
@Component({
    selector: 'explore-extended-column-option-add-stress-scenarios-modal',
    templateUrl: './add-stress-scenarios-modal.component.html',
    styleUrls: ['./add-stress-scenarios-modal.component.scss']
})
export class AddStressScenariosModalComponent extends ModalDirective<boolean> {

    @Input()
    optionValue: ScenarioColumnOption;
    @Input()
    allowNamedScenarioSingleSelection: boolean;
    @Output()
    openCreateScenarioModalEmitter = new EventEmitter<ScenarioResponse>();

    @Input()
    showSpinner$ = new BehaviorSubject<boolean>(false);
    @Input()
    isScenarioCreationDisabled: boolean;
    @Input()
    disableCreateScenarioButton: boolean;

    promptDialog$ = new BehaviorSubject<ExploreDialogParam>(null);

    /**
     * Closes the open aux-dialog for add/delete scenario
     */
    closeDialog(): void {
        this.promptDialog$.next(null);
    }

}
