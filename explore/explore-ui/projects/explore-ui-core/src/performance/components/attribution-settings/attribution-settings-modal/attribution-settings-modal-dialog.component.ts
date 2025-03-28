import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {AuxAdvancedTreeListInterface, AuxPicklist, AuxSelectionTreeInterface} from '@blk/aladdin-angular-components';
import {ModalDirective} from '../../../../core/components/modal.directive';
import {CoreCommonConstants} from '../../../../core/constants';

@Component({selector: 'app-attribution-settings-modal-dialog',
    templateUrl: './attribution-settings-modal-dialog.component.html',
    styleUrls: ['./attribution-settings-modal-dialog.component.scss']
})

/**
 * Modal component for attribution settings
 */
export class AttributionSettingsModalDialogComponent extends ModalDirective {

    @Input() nonExcessFactors: AuxAdvancedTreeListInterface[];
    @ViewChild('auxPickList', {static: false}) auxPickList: AuxPicklist;
    @Output() factorsUpdated: EventEmitter<string[]> = new EventEmitter<string[]>();

    readonly CLOSE_TEXT = CoreCommonConstants.BUTTON_TEXT.CANCEL;
    readonly DONE_TEXT = CoreCommonConstants.BUTTON_TEXT.APPLY;

    /**
     * Close modal and emit factor changes done on the modal
     */
    closeAndSetFactors(): void {
        this.auxPickList.getSourceSelection().then(selectedFactors => {
            this.addSelectedFactors(selectedFactors);
            this.closeModal();
        });
    }

    private addSelectedFactors(selectedFactors: AuxSelectionTreeInterface[]) {
        const selectedFactorNames: Set<string> = new Set;
        selectedFactors.forEach(selectedFactor => {
            this.addSelectedFactor(selectedFactorNames, selectedFactor);
        });

        this.factorsUpdated.emit([...selectedFactorNames]);
    }


    /**
     * Add selected factor to the list of selected factors
     * @param selectedFactorNames
     * @param selectedFactor
     * @private
     */
    private addSelectedFactor(selectedFactorNames: Set<string>, selectedFactor: AuxSelectionTreeInterface) {
        if(selectedFactor.children) {
            selectedFactor.children.forEach(child => {
                this.addSelectedFactor(selectedFactorNames, child);
            });
        } else {
            selectedFactorNames.add(selectedFactor.eventData);
        }
    }
}
