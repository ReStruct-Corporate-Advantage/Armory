import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {
    AuxButtonTypeEnum,
    AuxGridColumnType,
    AuxGridOptions,
    AuxGridOverrides,
    AuxInlineMenuItemClickedDetailInterface,
    AuxProgressIndicatorSizeEnum,
    AuxSelectOption,
    AuxSelectSelectionChangedDetailInterface
} from '@blk/aladdin-angular-components';
import {
    CalendarDateUtils,
    CoreFavoriteConstants,
    CoreFavoriteVersioningStore,
    DateFormatConstants,
    DateValue,
    ExploreSelectOption,
    ExploreSelectOptionGroup,
    FavoriteType,
    FavoriteUserDetails,
    SubscribableComponent,
    TimePeriod
} from '@blk/explore-ui-core';
import {FavoriteService} from '@services/favorite';
import {ColDef, GridApi, GridReadyEvent} from 'ag-grid-community';
import moment from 'moment';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import {takeUntil} from 'rxjs/operators';
import {ExportConstants} from '../../../constants';
import {ViewUsageCustomOverlayComponent} from './view-usage-custom-overlay/view-usage-custom-overlay.component';

@Component({
    selector: 'app-view-usage-modal',
    templateUrl: './view-usage-modal.component.html',
    styleUrls: ['./view-usage-modal.component.scss']
})
export class ViewUsageModalComponent extends SubscribableComponent implements OnInit {
    protected readonly AuxProgressIndicatorSizeEnum = AuxProgressIndicatorSizeEnum;

    protected readonly columnDefs: ColDef[] = [
        {
            field: 'usageCount',
            headerName: 'Times Accessed',
            type: AuxGridColumnType.AUX_NUMBER_COLUMN
        },
        {
            field: 'userId',
            headerName: 'User ID',
            type: AuxGridColumnType.AUX_TEXT_COLUMN
        },
        {
            field: 'userFullName',
            headerName: 'Name',
            type: AuxGridColumnType.AUX_TEXT_COLUMN
        },
        {
            field: 'userDepartment',
            headerName: 'Department',
            type: AuxGridColumnType.AUX_TEXT_COLUMN
        },
        {
            field: 'userLastAccessedDateTime',
            headerName: 'Last Date Accessed',
            type: AuxGridColumnType.AUX_TEXT_COLUMN
        }
    ];

    @Input() modalHeader: string;
    @Input() favoriteId;
    @Input() isOpen: boolean;

    gridOptions: AuxGridOptions;
    gridApi!: GridApi;
    overrides: AuxGridOverrides = {isZebra: false};
    usersList: ExploreSelectOptionGroup[];
    startDate: DateValue;
    endDate: DateValue;
    minDate: moment.Moment;
    selectedUserCount = 0;
    timePeriod = 2;
    timePeriods: TimePeriod;
    topUsersFavoriteDetails: FavoriteUserDetails[];
    favType: string;
    readonly exportOption = ExportConstants.EXPORT_OPTION_PDF_EXCEL;
    readonly AuxButtonTypeEnum = AuxButtonTypeEnum;
    isDataLoaded = false;
    isLoading = false;
    noRowsOverlayComponent: any = ViewUsageCustomOverlayComponent;
    noRowsReceived = false;
    public noRowsOverlayComponentParams: any = {
        noRowsMessageFunc: () =>
            // conditionally set message based on the request status
            this.noRowsReceived ? 'No data is available for the period selected.' : 'The request cannot be processed. Please try again.'
    };

    constructor(private favoriteService: FavoriteService, private changeDetectorRef: ChangeDetectorRef) {
        super();
    }

    ngOnInit(): void {
        (pdfMake as any).vfs = pdfFonts.pdfMake.vfs;
        this.initializeUsersList();
        const currentDate = DateValue.newDate(CalendarDateUtils.getTodayDate());
        const defaultToDate = CalendarDateUtils.getDateInMoment(currentDate.date);
        // Set one month from T-1 date to start date
        this.startDate = DateValue.newDate(moment().subtract(1, 'days').startOf('day').subtract(1, 'months').format(DateFormatConstants.MMDDYYYY_SLASH).toString());
        // Set T-1 date to end date
        this.endDate = DateValue.newDate(moment().subtract(1, 'days').startOf('day').format(DateFormatConstants.MMDDYYYY_SLASH).toString());
        this.minDate = defaultToDate.subtract(this.timePeriod, 'y');
        this.initGridOptions();
    }

    /**
     * Initialize display values to retrieve the top users
     */
    initializeUsersList(): void {
        this.usersList = this.getTopUsersCountList(CoreFavoriteConstants.RANGE_LISTS);
    }

    /**
     * When UsersList is changed
     */
    onUsersSelectionChanged($event: CustomEvent<AuxSelectSelectionChangedDetailInterface>) {
        const value = ($event.detail.value as AuxSelectOption).value;
        this.selectedUserCount = value === 'All' ? 0 : Number(value);
    }

    /**
     * When date range is changed
     */
    onDateRangeChange() {
        this.minDate = DateValue.newDate(this.endDate.date).getMoment().subtract(this.timePeriod, 'y');
    }


    private getTopUsersCountList(usersCountList: any): ExploreSelectOptionGroup[] {
        return [new ExploreSelectOptionGroup(usersCountList.map(usersCount => new ExploreSelectOption(usersCount.label, usersCount.value, usersCount.label === CoreFavoriteConstants.RANGE_LISTS[0].value)))];
    }

    /**
     * Close the view usage modal
     */
    closeModal(): void {
        CoreFavoriteVersioningStore.viewUsageTypeAction$.next({id: null, type: null, isOpen: false});
    }

    /**
     * Method to return the top users of the selected favorite based on the date range selection.
     */
    loadFavoriteUsers(): void {
        this.isDataLoaded = false;
        this.isLoading = true;
        this.changeDetectorRef.markForCheck();
        this.topUsersFavoriteDetails = [];
        const startDt = this.startDate.format(DateFormatConstants.YYYY_MM_DD_HH_mm_ss);
        const endDt = CalendarDateUtils.getDateInMoment(this.endDate.date).add(23, 'h').add(59, 'm').add(59, 's').format(DateFormatConstants.YYYY_MM_DD_HH_mm_ss);
        this.favType = this.modalHeader.toUpperCase() === FavoriteType.REPORT ? FavoriteType.LAYOUT : this.modalHeader.toUpperCase();
        // Service call to get the top users of the loaded favorite
        this.favoriteService
            .getFavoriteUsers$(this.favoriteId, startDt, endDt, this.selectedUserCount, this.favType)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: (favoriteUsers: FavoriteUserDetails[]) => {
                    if (favoriteUsers.length > 0) {
                        for (const user of favoriteUsers) {
                            this.topUsersFavoriteDetails.push(user);
                        }
                    } else {
                        this.noRowsReceived = true;
                    }
                    this.gridDataLoaded();
                },
                error: () => {
                    this.gridDataLoaded();
                }
            });
    }

    /**
     * Method to invoke grid options for the view usage modal.
     */
    gridDataLoaded() {
        this.isDataLoaded = true;
        this.initGridOptions();
        this.isLoading = false;
        this.changeDetectorRef.markForCheck();
    }

    /**
     * Method to initilaize the grid option for the view usage modal.
     * columnDefs - Column Header
     * rowData - returns the top users details
     */
    initGridOptions() {
        this.gridOptions = {
            defaultColDef: {
                filter: true,
                sortable: true,
                resizable: true,
                floatingFilter: false
            },
            ensureDomOrder: true,
            tooltipShowDelay: 500,
            domLayout: 'normal',
            suppressHorizontalScroll: true,
            onGridReady: (event) => this.gridReady(event),
            columnDefs: this.columnDefs,
            rowData: this.topUsersFavoriteDetails,
            noRowsOverlayComponent: this.noRowsOverlayComponent,
            noRowsOverlayComponentParams: this.noRowsOverlayComponentParams
        };
    }

    /**
     * set gridApi
     */
    private gridReady(event: GridReadyEvent<any>) {
        this.gridApi = event.api;
        setTimeout(() => {
            this.gridApi.sizeColumnsToFit();
        });
    }

    /**
     * Method is triggered when Export link is clicked
     */
    onExportClick(): boolean {
        return false; // This is to prevent the redirection to home page on link click
    }

    /**
     * Method is triggered when any of menu(PDF/Excel) is clicked/selected for the export
     */
    onMenuItemClicked(event: CustomEvent<AuxInlineMenuItemClickedDetailInterface>) {
        if (event.detail.element.eventData === ExportConstants.EXPORT_OPTION_PDF.label) {
            this.exportToPDF();
            return;
        }
        if (event.detail.element.eventData === ExportConstants.EXPORT_OPTION_EXCEL.label) {
            this.exportToExcel();
        }
    }

    /**
     * Method to export the usage report in Excel format
     */
    exportToExcel() {
        const params = {
            fileName: 'usage-report.xlsx',
            sheetName: 'Sheet1'
        };
        this.gridApi.exportDataAsExcel(params);
    }

    /**
     *Method to export the usage report in PDF format
     */
    exportToPDF() {
        const rows = this.getRowsToExport(this.gridApi);
        const docDefinition = {
            content: [
                {
                    table: {
                        headerRows: 1,
                        widths: `${100 / this.columnDefs.length}%`,
                        body: [[...this.columnDefs.map((col) => col.headerName)], ...rows]
                    }
                }
            ]
        };
        pdfMake.createPdf(docDefinition).download('usage-report.pdf');
    }

    /**
     * Method to construct row data
     */
    getRowsToExport = (gridApi: GridApi) => {
        const columns = gridApi.getAllGridColumns();
        const getCellToExport = (column, node) => ({
            text: gridApi.getValue(column, node) ?? ''
        });
        const rowsToExport = [];
        gridApi.forEachNodeAfterFilterAndSort((node) => {
            const rowToExport = columns.map((column) => getCellToExport(column, node));
            rowsToExport.push(rowToExport);
        });

        return rowsToExport;
    };
}
