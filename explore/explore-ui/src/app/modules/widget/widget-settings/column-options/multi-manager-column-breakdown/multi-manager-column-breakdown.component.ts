import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {BreakdownConstants, MultiManagerBreakdownModel} from '@blk/explore-ui-breakdown';
import {ExploreSelectOption, ExploreSelectOptionGroup} from '@blk/explore-ui-core';
import {AuxSelectOption, AuxSelectSelectionChangedDetailInterface} from '@blk/aladdin-angular-components';
import {isEmpty} from 'lodash';

/**
 * Component for managing the multi-manager column breakdown options.
 */
@Component({
    selector: 'app-multi-manager-column-breakdown',
    templateUrl: './multi-manager-column-breakdown.component.html',
    styleUrls: ['./multi-manager-column-breakdown.component.scss']
})
export class MultiManagerColumnBreakdownComponent implements OnInit {
    @Input()
    decompositionModes: any;

    @Input()
    widgetType: string;

    @Input()
    multiManagerInputData: MultiManagerBreakdownModel;

    @Output()
    changedDecompositionMode = new EventEmitter<string>();

    @Output()
    changedDecompositionType = new EventEmitter<string>();

    @Output()
    changedBreakdownType = new EventEmitter<string>();

    decompositionModeOptions: ExploreSelectOptionGroup[];
    breakdownTypeOptions: ExploreSelectOptionGroup[];
    decompositionTypeOptions: ExploreSelectOptionGroup[];

    selectedBreakdownType: string;
    selectedDecompositionMode: string;
    selectedDecompositionType: string;

    /**
     * Initializes the component.
     */
    ngOnInit(): void {
        this.initialize();
        this.decompositionModeOptions = this.createDecompositionModeOptions();
        this.decompositionTypeOptions = this.createDecompositionTypeOptions();
        this.breakdownTypeOptions = this.createBreakdownTypeOptions();
    }

    /**
     * Initializes the component's data based on the input data.
     */
    initialize() {

        if (this.multiManagerInputData?.decompositionMode) {
            this.selectedDecompositionMode = this.multiManagerInputData.decompositionMode;
        } else {
            this.selectedDecompositionMode = 'none';
        }

        if (this.multiManagerInputData?.decompositionType) {
            this.selectedDecompositionType = this.multiManagerInputData.decompositionType;
        }

        if (this.multiManagerInputData?.breakdownType) {
            this.selectedBreakdownType = this.multiManagerInputData.breakdownType;
        }
    }

    /**
     * Creates options for the decomposition mode select box.
     * @returns An array of decomposition mode options.
     */
    createDecompositionModeOptions() {
        const decompositionModesOptions: ExploreSelectOption[] = [];
        if (isEmpty(this.decompositionModes)) {
            throw new Error('Decomposition modes are not available.');
        }

        for (const mode of Object.keys(this.decompositionModes)) {
            decompositionModesOptions.push(new ExploreSelectOption(BreakdownConstants.DECOMPOSITION_MODE.get(mode), mode, this.selectedDecompositionMode === mode));
        }

        return [new ExploreSelectOptionGroup(decompositionModesOptions)];
    }

    /**
     * Creates options for the decomposition type select box.
     * @returns An array of decomposition type options or null if no options are available.
     */
    createDecompositionTypeOptions() {
        const decompositionTypeOptions: ExploreSelectOption[] = [];

        if (this.selectedDecompositionMode !== 'none') {
            if(!this.decompositionModes?.[this.selectedDecompositionMode]){
                throw new Error('Decomposition types are not available.');
            }
            const decompositionTypes:string[] = Object.keys(this.decompositionModes[this.selectedDecompositionMode]);
            for (const type of decompositionTypes) {
                decompositionTypeOptions.push(new ExploreSelectOption(BreakdownConstants.DECOMPOSITION_TYPE.get(type), type, this.selectedDecompositionType === type));
            }

            //Set the first option as default
            if(!this.selectedDecompositionType){
                decompositionTypeOptions[0].isSelected = true;
                this.selectedDecompositionType = decompositionTypes[0];
                this.changedDecompositionType.emit(this.selectedDecompositionType);
            }
        }
        this.breakdownTypeOptions = this.createBreakdownTypeOptions();
        return [new ExploreSelectOptionGroup(decompositionTypeOptions)];
    }

    /**
     * Creates options for the breakdown type select box.
     * @returns An array of breakdown type options or null if no options are available.
     */
    createBreakdownTypeOptions() {
        const breakdownTypeOptions: ExploreSelectOption[] = [];

        if (this.decompositionModes?.[this.selectedDecompositionMode]?.[this.selectedDecompositionType]) {
            const breakdownTypes: string[] = this.decompositionModes[this.selectedDecompositionMode][this.selectedDecompositionType];
            for (const type of breakdownTypes) {
                breakdownTypeOptions.push(new ExploreSelectOption(BreakdownConstants.BREAKDOWN_TYPES_MM.get(type), type, this.selectedBreakdownType === type));
            }
            //Set the first option as default
            if(!this.selectedBreakdownType){
                breakdownTypeOptions[0].isSelected = true;
                this.selectedBreakdownType = breakdownTypes[0];
                this.changedBreakdownType.emit(this.selectedBreakdownType);
            }
        }else{
            throw new Error('Breakdown types are not available.')
        }

        return [new ExploreSelectOptionGroup(breakdownTypeOptions)];
    }

    /**
     * Callback when the decomposition mode is changed.
     * @param $event The event containing the selected decomposition mode.
     */
    onDecompositionModeChanged($event: CustomEvent<AuxSelectSelectionChangedDetailInterface>) {
        this.selectedDecompositionMode = ($event.detail.value as AuxSelectOption).value;
        if (this.selectedDecompositionMode !== 'none') {
            this.decompositionTypeOptions = this.createDecompositionTypeOptions();
        } else {
            this.resetValues();
            return;
        }
        this.changedDecompositionMode.emit(this.selectedDecompositionMode);
    }

    /**
     * Callback when the decomposition type is changed.
     * @param $event The event containing the selected decomposition type.
     */
    onDecompositionTypeChanged($event: CustomEvent<AuxSelectSelectionChangedDetailInterface>) {
        this.selectedDecompositionType = ($event.detail.value as AuxSelectOption).value;
        this.breakdownTypeOptions = this.createBreakdownTypeOptions();
        this.changedDecompositionType.emit(this.selectedDecompositionType);
    }

    /**
     * Callback when the breakdown type is changed.
     * @param $event The event containing the selected breakdown type.
     */
    onBreakdownTypeChanged($event: CustomEvent<AuxSelectSelectionChangedDetailInterface>) {
        this.selectedBreakdownType = ($event.detail.value as AuxSelectOption).value;
        this.changedBreakdownType.emit(this.selectedBreakdownType);
    }

    /**
     * Resets the selected values and options.
     */
    resetValues() {
       this.selectedDecompositionMode = 'none';
        this.selectedDecompositionType = null;
        this.selectedBreakdownType = null;
        this.decompositionTypeOptions = null;
        this.breakdownTypeOptions = null;
        this.changedDecompositionMode.emit(this.selectedDecompositionMode);
        this.changedBreakdownType.emit(this.selectedBreakdownType);
        this.changedDecompositionType.emit(this.selectedDecompositionType);
    }
}
