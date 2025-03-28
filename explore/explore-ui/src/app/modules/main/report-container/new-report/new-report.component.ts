import {Component, OnInit} from '@angular/core';
import {FavoriteConstants} from '@constants/favorite.constants';
import {ReportService} from '@services/workspace';
import {WorkspaceStore} from '../../../../stores';
import {
    AuxSegmentedControlSelectionChangedDetailInterface,
    AuxTextInputValueChangedDetailInterface
} from '@blk/aladdin-angular-components';
import {ModalDirective} from '@blk/explore-ui-core';
import {ModalStateAction} from '@models/favorite/modal-state-action.enum';

@Component({
    selector: 'app-new-report',
    templateUrl: './new-report.component.html',
    styleUrls: ['./new-report.component.scss']
})

export class NewReportComponent extends ModalDirective implements OnInit {
    static readonly TABS_LABEL_DATA = [
        {
            'label' : 'New Report',
            'uid': '0'

        },
        {
            'label': 'Load a Template',
            'uid': '1'
        }];

    readonly favType = FavoriteConstants.LAYOUT;
    readonly favTreeType = FavoriteConstants.LAYOUT_FOLDER;
    readonly favDisplayName = FavoriteConstants.REPORT_PASCAL;
    loadFavoriteCallBack: Function;
    activeTabUID = '0';
    reportName = '';
    tabsLabelData: {label: string, uid: string }[] = NewReportComponent.TABS_LABEL_DATA;
    isWidgetGalleryModalOpen = false;

    constructor(private reportService: ReportService) {
        super();
    }

    ngOnInit(): void {
        this.loadFavoriteCallBack = this.reportService.loadFavoriteReport;
        this.reportName = WorkspaceStore.getCurrentReport()?.title || '';
    }

    onTabSelected(event: CustomEvent<AuxSegmentedControlSelectionChangedDetailInterface>): void {
        this.activeTabUID = event?.detail?.data['uid'];
    }

    onReportNameChanged(event: CustomEvent<AuxTextInputValueChangedDetailInterface>): void {
        this.reportName = event?.detail.value;
    }

    private createBlankReport(): void {
        const currentReport = WorkspaceStore.getCurrentReport();
        if (this.reportName) {
            currentReport.title = this.reportName;
        }
        currentReport.widgets = [];
        WorkspaceStore.updateCurrentReport(currentReport);
    }

    createReport(): void {
        this.createBlankReport();
        this.isWidgetGalleryModalOpen = true;
    }

    handleFavoriteSelectedAction(event: any): void {
        if (event.reason === ModalStateAction.FAVORITE_SELECTED) {
            this.closeModal();
        }
    }

    closeWidgetGalleryModal(): void {
        this.isWidgetGalleryModalOpen = false;
        WorkspaceStore.refreshCurrentWorkpad();
        this.closeModal();
    }

    onCancelButtonClicked(): void {
        this.createBlankReport();
        WorkspaceStore.refreshCurrentWorkpad();
        this.closeModal();
    }
}
