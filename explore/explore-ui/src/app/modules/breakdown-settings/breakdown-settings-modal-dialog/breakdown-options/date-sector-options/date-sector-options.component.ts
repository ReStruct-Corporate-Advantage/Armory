import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {AuxRadioGroupChangedDetailInterface, AuxRadioInterface} from '@blk/aladdin-angular-components';
import {DateColumnSector, SectorConstants} from '@blk/explore-ui-breakdown';
import {isUndefined} from 'lodash';

/**
 * Component to configure bucket definition for Date Column Sector
 */
@Component({
    selector: 'app-date-sector-options',
    templateUrl: './date-sector-options.component.html',
    styleUrls: ['./date-sector-options.component.scss']
})
export class DateSectorOptionsComponent implements OnChanges {

    @Input()
    sectorModel: DateColumnSector;

    groupBySelectionData: AuxRadioInterface[];

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.sectorModel) {
            if (isUndefined(this.sectorModel.groupByYear)) {
                this.sectorModel.groupByYear = false;
            }
            this.initGroupBySelection();
        }
    }

    /**
     * On groupBy selection change i.e. either Year or Date
     */
    onGroupByChange(event: CustomEvent<AuxRadioGroupChangedDetailInterface>) {
        this.sectorModel.groupByYear = event.detail.value.label === SectorConstants.DATE_COLUMN_SECTOR_GROUP_BY.YEAR;
    }

    /**
     * Initialize groupBy selector
     */
    private initGroupBySelection() {
        this.groupBySelectionData = [
            {
                label: SectorConstants.DATE_COLUMN_SECTOR_GROUP_BY.DATE,
                checked: !this.sectorModel.groupByYear,
                disabled: false
            },
            {
                label: SectorConstants.DATE_COLUMN_SECTOR_GROUP_BY.YEAR,
                checked: this.sectorModel.groupByYear,
                disabled: false
            }
        ];
    }
}
