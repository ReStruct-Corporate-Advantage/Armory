import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {NotificationService} from '@services/notification';
import {
    ClickElemConstants,
    ExploreSelectOption,
    ModalDirective,
    TelemetryActionConstants,
    TelemetryReportActionParameters,
    TelemetryService,
    WidgetConfig,
    WidgetConfigType
} from '@blk/explore-ui-core';
import {WidgetConfigFactory} from '../../factories';
import {Widget} from '@models/widget/widget.model';
import {forkJoin} from 'rxjs';
import {WorkspaceStore} from '@stores/workspace.store';
import {WidgetUtils} from '@utils/widget.utils';
import {Report} from '@models/workspace/report.model';
import {WhatIfPortfolio} from '@models/portfolio/what-if-portfolio.model';
import {MandateMappingService} from '@services/mandate/mandate-mapping.service';
import {TelemetryClickService} from '@services/telemetry/telemetry-click.service';
import {
    AuxSegmentedControlSelectionChangedDetailInterface,
    AuxSelectOptionGroup,
    AuxSelectSelectionChangedDetailInterface
} from '@blk/aladdin-angular-components';
import {WidgetGalleryConstants} from '@constants/widget-gallery.constants';

@Component({
    selector: 'app-widget-gallery-modal',
    templateUrl: './widget-gallery-modal.component.html',
    styleUrls: ['./widget-gallery-modal.component.scss']
})

/**
 * Modal component for Widget Gallery
 */
export class WidgetGalleryModalComponent extends ModalDirective implements OnInit {

    private readonly POPULARITY = 'Popularity';
    private readonly ALPHABETICAL = 'Alphabetical (A-Z)';
    private readonly SHOW_ALL_TAB = WidgetGalleryConstants.SHOW_ALL_TAB;
    private readonly TABLES_TAB = WidgetGalleryConstants.TABLES_TAB;
    private readonly CHARTS_TAB = WidgetGalleryConstants.CHARTS_TAB;
    readonly MODAL_HEADER = 'Widgets';

    isGalleryView = true;
    // to show active tab-content only (default to 0 as 'Show All' is the default tab)
    activeTabUID = '0';
    tableWidgets: WidgetConfig[] = [];
    chartWidgets: WidgetConfig[] = [];
    allWidgets: WidgetConfig[] = [];
    sortingOptions: AuxSelectOptionGroup[] = [];
    sortingSelected: string = this.POPULARITY;
    widgetAddedFromMoreView: boolean;
    widgetsPopularityOrder: string[] = WidgetGalleryConstants.WIDGET_POPULARITY_ORDER;
    widgetMore: WidgetConfig;
    widgetTypeTabData: {label: string, uid: string}[] = WidgetGalleryConstants.TABS_LABEL_DATA;
    tabContent: {id: string, description: string, widgets: WidgetConfig[]}[];

    constructor(private notificationService: NotificationService, private mandateMappingService: MandateMappingService, private changeDetectorRef: ChangeDetectorRef, private telemetryClickService: TelemetryClickService) {
        super();
    }

    /**
     * ngOnInit
     */
    ngOnInit(): void {
        this.tableWidgets = WidgetConfigFactory.tableWidgets;
        this.chartWidgets = WidgetConfigFactory.chartWidgets;
        this.allWidgets = this.tableWidgets.concat(this.chartWidgets);
        // Default option when first opening the screen is 'Sort By: Popularity' and 'Show All' so we sort the 'AllWidgets' Array in the beginning
        this.sortTabWidgets(this.sortingSelected, this.activeTabUID);
        this.tabContent = [
            { id: this.SHOW_ALL_TAB, description: WidgetGalleryConstants.SHOW_ALL_TAB_DESCRIPTION, widgets: this.allWidgets },
            { id: this.TABLES_TAB, description: WidgetGalleryConstants.TABLES_TAB_DESCRIPTION, widgets: this.tableWidgets },
            { id: this.CHARTS_TAB, description: WidgetGalleryConstants.CHARTS_TAB_DESCRIPTION, widgets: this.chartWidgets },
        ];
        this.sortingOptions.push({values: [new ExploreSelectOption(this.POPULARITY, this.POPULARITY, true)]});
        this.sortingOptions.push({values: [new ExploreSelectOption(this.ALPHABETICAL, this.ALPHABETICAL)]});
    }

    /**
     * Update active index on tab selected and sort the widgets in the new tab based on what the user has already selected
     */
    onTabSelected(event: CustomEvent<AuxSegmentedControlSelectionChangedDetailInterface>, pretextElement: HTMLDivElement): void {
        this.activeTabUID = event?.detail?.data['uid'];
        // When we switch tabs, the sorting option should carry over
        this.sortTabWidgets(this.sortingSelected, this.activeTabUID);
        // scroll back to the top of the modal when tab changed
        pretextElement?.scrollIntoView();
    }

    /**
     * Create widget
     * @return boolean
     * This method will return false since we do not want to redirect when widget is added by clicking the <aux-link>
     */
    createWidget(type: WidgetConfigType): boolean {
        const widget = new Widget(type);
        widget.isNewlySaved = true;
        this.telemetryClickService.reportBarTabPlusWidgetIconClick(widget.title, ClickElemConstants.CONTEXT_PATH.PLUS_WIDGET.PLUS_ICON_CLICK);
        const observableQueue = this.mandateMappingService.setWidgetDefaultsAsPerMandate(widget);
        if (observableQueue.length === 0) {
            this.addWidgetToReport(widget);
            return false;
        }
        forkJoin(observableQueue).subscribe({
            next: () => {
                this.addWidgetToReport(widget);
            },
            error: (error) => {
                this.notificationService.error('Error ' + error);
            }
        });
        return false;
    }

    /**
     * Adds widget to report after it is created
     */
    private addWidgetToReport(widget: Widget) {
        this.trackWidgetAddedViaTelemetry(WorkspaceStore.getCurrentReport(), widget);
        WorkspaceStore.getCurrentReport().widgets.push(widget);
        WorkspaceStore.getCurrentReport().availableDataStores.set(widget.dataStore.name, widget.dataStore);
        // Add default columns for returns Widget
        if (widget.configType === WidgetConfigType.RETURNS) {
            WidgetUtils.addDefaultReturnsColumn(widget);
        }
        // Display the notification header only when a widget is added from the 'Show More' page.
        if (this.widgetAddedFromMoreView) {
            this.notificationService.success(widget.title + ' widget added!');
            this.widgetAddedFromMoreView = false;
        }
        this.changeDetectorRef.markForCheck();
    }

    private trackWidgetAddedViaTelemetry(report: Report, widgetAdded: Widget): void {
        const actionType = TelemetryActionConstants.USER_BEHAVIOUR.ADD_WIDGET;
        const reportUserActionParameters = new TelemetryReportActionParameters({
            actionType,
            widgetTypes: Array.of(widgetAdded.configType.toString()),
            reportTitle: report.title,
            reportId: report.id,
            reportOwner: report.owner,
            isWhatIfPortfolio: WorkspaceStore.getCurrentPortfolio() instanceof WhatIfPortfolio
        });
        TelemetryService.track(TelemetryActionConstants.USER_BEHAVIOUR.ADD_WIDGET, reportUserActionParameters);
    }

    /**
     * Set Gallery view as false when 'More' is selected
     */
    moreViewOn(widgetConfig: WidgetConfig): void {
        this.isGalleryView = false;
        this.widgetMore = widgetConfig;
    }

    /**
     * Set Gallery view as true when 'More' is selected
     * Set widgetAddedFromMoreView as widgetAdded, it is true if widget was added and false if 'Back' is selected
     */
    moreViewOff(widgetAdded: boolean): void {
        this.isGalleryView = true;
        this.widgetAddedFromMoreView = widgetAdded;
    }

    /**
     * Method called when user selects a sorting option
     * sortingSelected is updated and the widgets are sorted
     */
    onSortingSelection(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>, pretextElement: HTMLDivElement) {
        if (event?.detail?.value) {
            this.sortingSelected = (event?.detail?.value['value']);
        }
        this.sortTabWidgets(this.sortingSelected, this.activeTabUID);
        // scroll back to the top of the modal when sorting changed
        pretextElement?.scrollIntoView();
    }

    /**
     * Helper function to sort widgets for a tab
     */
    sortTabWidgets(sortingSelected: string, tabUid: string) {
        const sortingFunction = sortingSelected === this.ALPHABETICAL ? this.sortAlphabetical : (data) => this.sortPopular(data);
        switch (tabUid) {
            case this.SHOW_ALL_TAB:
                sortingFunction(this.allWidgets);
                break;
            case this.CHARTS_TAB:
                sortingFunction(this.chartWidgets);
                break;
            case this.TABLES_TAB:
                sortingFunction(this.tableWidgets);
                break;
        }
    }

    /**
     * Helper function to sort widgets alphabetically(a-z)
     */
    sortAlphabetical(widgets: WidgetConfig[]): void {
        widgets.sort((a, b) => a.title.localeCompare(b.title));
    }

    /**
     * Helper function to sort widgets by popularity. The order of popularity is stored in this.widgetsPopularityOrder
     */
    sortPopular(widgets: WidgetConfig[]): void {
        widgets.sort((a, b) => this.widgetsPopularityOrder.indexOf(a.configType) - this.widgetsPopularityOrder.indexOf(b.configType));
    }
}
