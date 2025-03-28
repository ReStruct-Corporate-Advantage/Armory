import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {
    AuxSelectOption,
    AuxSelectSelectionChangedDetailInterface,
    AuxTextInput,
    Validator
} from '@blk/aladdin-angular-components';
import {CoreDefinitionStore, ExploreSelectOption, ExploreSelectOptionGroup, TokenConstants} from '@blk/explore-ui-core';
import {isEmpty} from 'lodash';
import {ExportConstants} from '@constants/export.constants';
import {CommonConstants} from '@constants/common.constants';
import {
    ExportHubJob
} from '@blk/aladdin-graph-everything/analytics/portfolio_analytics/export_hub/v1/export_hub_job_pb';
import {ExportHubUtils} from '../../../utils/export-hub.utils';

/**
 * Component for managing job export settings.
 */
@Component({
    selector: 'app-job-export-settings',
    templateUrl: './job-export-settings.component.html',
    styleUrls: ['./job-export-settings.component.scss']
})
export class JobExportSettingsComponent implements OnInit {
    @ViewChild('jobName') jobName: AuxTextInput;
    @Input() validatorCallback: () => void;
    @Output() validatorCallbackChange = new EventEmitter<any>();
    @Input() scheduledJobConfig!: ExportHubJob;

    exportAsOptions: ExploreSelectOptionGroup[];
    validator: Validator[];
    exportLocation: string;

    /**
     * Initializes the component.
     */
    ngOnInit(): void {
        this.exportAsOptions = this.createExportAsOptions();
        this.validatorCallbackChange.emit(this.validateFields.bind(this));
        this.validator = [{
            validate: (value: string) => {
                return !isEmpty(value);
            },
            errorMessage: CommonConstants.INVALID_INPUT
        }];
        this.exportLocation = ExportHubUtils.getOutputLocation();
    }


    /**
     * Handles job name change event.
     * @param value The new job name.
     */
    onJobNameChanged(value: string) {
        this.scheduledJobConfig.setName(value);
    }


    /**
     * Handles export option change event.
     * @param $event The event containing the new export option.
     */
    onExportOptionChanged($event: CustomEvent<AuxSelectSelectionChangedDetailInterface>) {
        this.scheduledJobConfig.setExportType(($event.detail.value as AuxSelectOption).value);
    }

    /**
     * Creates export as options.
     * @returns The export as options.
     */
    private createExportAsOptions() {
        const exportAsOptions: ExploreSelectOption[] = [];
        if (!this.scheduledJobConfig.getExportType()) {
            this.scheduledJobConfig.setExportType(ExportConstants.EXPORT_AS_OPTIONS.CSV);
        }
        exportAsOptions.push(new ExploreSelectOption('CSV', ExportConstants.EXPORT_AS_OPTIONS.CSV, this.scheduledJobConfig.getExportType() === ExportConstants.EXPORT_AS_OPTIONS.CSV));
        exportAsOptions.push(new ExploreSelectOption('JSON', ExportConstants.EXPORT_AS_OPTIONS.JSON, this.scheduledJobConfig.getExportType() === ExportConstants.EXPORT_AS_OPTIONS.JSON));
        return [new ExploreSelectOptionGroup(exportAsOptions)];
    }

    private validateFields(): boolean {
        this.jobName.validate();
        return this.jobName.isValid;
    }
}
