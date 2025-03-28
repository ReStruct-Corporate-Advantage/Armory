import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {WorkpadFavoriteChange} from '@models/favorite/workpad-favorite-change.model';
import {
    AuxBadgeStyleEnum,
    AuxTabBarItemInterface,
    AuxTabBarSelectedDetailInterface
} from '@blk/aladdin-angular-components';
import {ReportGroup} from '@models/workspace/report-group.model';
import {FlatWorkpad} from '@models/workspace/flat-workpad.model';
import {FavoriteChange} from '@models/favorite/favorite-change.model';
import {SaveMode} from '@enums/save-mode.enum';

/**
 * Displays all changes within a workpad
 */
@Component({
    selector: 'app-workpad-change-detail',
    templateUrl: './workpad-change-detail.component.html',
    styleUrls: ['./workpad-change-detail.component.scss']
})
export class WorkpadChangeDetailComponent implements OnChanges {

    readonly SaveMode = SaveMode;
    readonly PORTFOLIO = 'Portfolio';
    readonly REPORT_GROUP = 'Report Group';

    // selected workpad from sidebar
    @Input() workpadChange: WorkpadFavoriteChange;

    reportTabs: AuxTabBarItemInterface[] = [];

    // Selected Report tab
    selectedReportTabUid = '0';
    selectedReportChange: FavoriteChange;

    workpadDisplayName: string;

    ngOnChanges(changes: SimpleChanges): void {
        // update whenever the selected workpad changes
        if (changes.workpadChange) {
            this.initializeWorkpadChanges();
        }
    }

    /**
     * Initializes the nested changes within a workpad
     */
    protected initializeWorkpadChanges(): void {
        // create workpad title
        if (this.workpadChange.value instanceof ReportGroup) {
            this.workpadDisplayName = this.REPORT_GROUP + ': ' + this.workpadChange.value.title;
        } else {
            this.workpadDisplayName = this.PORTFOLIO + ': ' + (this.workpadChange.value as FlatWorkpad).portfolio.getPortfolioHeaderTitle();
        }
        // create report tabs
        this.reportTabs = this.workpadChange.modifiedReports.map((reportChange, index) => ({
            label: reportChange.value.title,
            uid: String(index),
            eventData: index,
            badgeSlot: {badgeValue: reportChange.getChangesCount(), badgeStyle: AuxBadgeStyleEnum.NEUTRAL}
        }));

        if (this.reportTabs.length) {
            // default to displaying first report
            this.selectedReportTabUid = this.reportTabs[0].uid;
            this.selectedReportChange = this.workpadChange.modifiedReports[this.reportTabs[0].eventData];
        }
    }

    /**
     * Called when Report tab is changed
     */
    onReportSelectionChanged(event: CustomEvent<AuxTabBarSelectedDetailInterface>): void {
        const {uid, eventData: index} = event.detail;
        this.selectedReportTabUid = uid;
        this.selectedReportChange = this.workpadChange.modifiedReports[index];
    }
}
