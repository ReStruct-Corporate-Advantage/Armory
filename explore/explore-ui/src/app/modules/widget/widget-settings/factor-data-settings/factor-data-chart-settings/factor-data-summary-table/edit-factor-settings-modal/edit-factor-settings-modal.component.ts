import {Component, Input, OnInit} from '@angular/core';
import {
    ColumnConfig, ColumnOptionMetaDataInterface, ModalDirective,
} from '@blk/explore-ui-core';
import {RiskSettings} from '@blk/explore-ui-risk';
import {cloneDeep} from 'lodash';
import {CustomTitleColumnOption, FxFactorOptionsColumnOption} from '@blk/explore-ui-column-option';

/**
 * Modal to modify column options on selected column of Factor Summary Table
 * this Modal opens on top of WidgetSettingsModal
 */
@Component({
    selector: 'app-factor-data-edit-factor-settings-modal',
    templateUrl: './edit-factor-settings-modal.component.html',
    styleUrls: ['./edit-factor-settings-modal.component.scss']
})
export class EditFactorSettingsModalComponent extends ModalDirective<boolean> implements OnInit {

    @Input()
    options: ColumnOptionMetaDataInterface[];
    @Input()
    column: ColumnConfig;

    updatedColumn: ColumnConfig;
    customTitleOption: ColumnOptionMetaDataInterface;
    riskSettings: RiskSettings;
    fxFactorOption: ColumnOptionMetaDataInterface;

    ngOnInit(): void {
        // Cloning the optionValues, will be used to reset optionValues on Cancel clicked.
        this.updatedColumn = cloneDeep(this.column);
        let riskSettingsOptionPresent = false;

        // Setting the column options metaData
        this.options.forEach(option => {
            if (option.columnOptionConfigType === CustomTitleColumnOption.CONFIG_TYPE) {
                this.customTitleOption = option;
            } else if (option.columnOptionConfigType === FxFactorOptionsColumnOption.CONFIG_TYPE) {
                this.fxFactorOption = option;
            } else if (option.columnOptionConfigType === RiskSettings.CONFIG_TYPE) {
                riskSettingsOptionPresent = true;
            }
        });

        if (riskSettingsOptionPresent) {
            this.riskSettings = this.updatedColumn.optionValues.find(optionValue => optionValue.configType === RiskSettings.CONFIG_TYPE) as RiskSettings;
        }
    }

    /**
     * This method updates the column optionValues on Done button clicked and closes the modal
     */
    onDoneClicked(): void {
        this.column.optionValues = this.updatedColumn.optionValues;
        this.closeModal(true);
    }
}

