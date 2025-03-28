import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {AuxButtonTypeEnum, AuxTextInput} from '@blk/aladdin-angular-components';
import {CommonConstants} from '@constants/common.constants';
import {TelemetryClickService} from '@services/telemetry/telemetry-click.service';
import {ClickElemConstants} from '@blk/explore-ui-core';
import {ReportGroup} from '@models/workspace/report-group.model';
import {AddPortfolioService} from '../add-portfolio.service';

/**
 * Add Report Groups Component
 */
@Component({
    selector: 'app-add-report-group',
    templateUrl: './add-report-group.component.html',
    styleUrls: ['./add-report-group.component.scss']
})
export class AddReportGroupComponent implements OnInit {
    @ViewChild('editTextInput', {static: false}) editText: AuxTextInput;


    // variables to control modal open/close event
    @Input() isOpen: boolean;
    @Output() addReportGroupButtonClicked = new EventEmitter<boolean>();

    reportGroupList: ReportGroup[];
    checkedReportGroupList: ReportGroup[];

    // report group currently being edited
    editingReportGroup: ReportGroup;
    readonly addReportGroupMessage = CommonConstants.PORT_REPORT_GRP_INFO;
    readonly reportGrpBtnLabel = CommonConstants.BUTTON_TEXT.REPORT_GROUP;


    readonly AuxButtonTypeEnum = AuxButtonTypeEnum;

    /**
     * constructor
     */
    constructor(private addPortfolioService: AddPortfolioService, private telemetryClickService: TelemetryClickService) {
    }

    ngOnInit(): void {
        this.reportGroupList = this.addPortfolioService.reportGroupList;
        this.checkedReportGroupList = this.addPortfolioService.checkedReportGroupList;
    }

    /**
     * Add or remove a report group from the {@link checkedReportGroupList}
     */
    onCheckboxChanged(reportGroup: ReportGroup): void {
        const index = this.checkedReportGroupList.indexOf(reportGroup);

        if (index > -1) {
            this.checkedReportGroupList.splice(index, 1);
        } else {
            this.checkedReportGroupList.push(reportGroup);
        }
    }

    /**
     * change the checkbox to a text box so the name of the report group can be edited
     */
    doubleClick(reportGroup: ReportGroup): void {
        this.editingReportGroup = reportGroup;
        setTimeout(() => {
            this.editText.setValue(reportGroup.title);
            this.editText.focusInput();
        }, 10);
    }

    /**
     * event triggered when the user's focus leaves the text box or enter key is pressed. This should submit the text box's value as the new name
     */
    onInputSubmit(): void {
        // If the user leaves the textbox, set the title of the report group to what they entered
        this.reportGroupList[this.reportGroupList.indexOf(this.editingReportGroup)].title = this.editText.value;
        this.editingReportGroup = undefined;
    }

    /**
     * adds a new Report Group to the workspace and allows the user to give the new Report Group a name
     */
    addReportGroup(): void {
        const newReportGroup = new ReportGroup();
        newReportGroup.isOpen = true;
        this.reportGroupList.push(newReportGroup);
        this.checkedReportGroupList.push(newReportGroup);
        this.editingReportGroup = newReportGroup;
        this.editingReportGroup.isOpen = true;
        setTimeout(() => {
            this.editText.setValue(newReportGroup.title);
            this.editText.focusInput();
        }, 10);
        this.telemetryClickService.reportGroupClick(this.reportGrpBtnLabel, ClickElemConstants.SOURCE.ADD_PORTFOLIO_MODAL);
    }

    isAddButtonEnabled() {
        return this.addPortfolioService.checkedReportGroupList?.length !== 0;
    }

    addReportGroupButtonClickedCallback(isDoneClicked: boolean) {
        this.isOpen = false;
        this.addReportGroupButtonClicked.emit(isDoneClicked);
    }
}
