import {ChangeDetectorRef, Component, Input, OnChanges} from '@angular/core';
import {Portfolio} from '../../../../models/portfolio/portfolio.model';
import {NotificationService} from '../../../../shared/services/notification/notification.service';
import {isEmpty} from 'lodash';
import {PublishStateService} from '../../../../shared/services/publishState/publish-state.service';
import {PublishStateItem} from '../../../../models/publishState/publish-state-item.model';
import moment, {Moment} from 'moment';
import {PublishStateConstants} from '../../../../constants/publish-state.constants';
import {WorkspaceStore} from '../../../../stores';
import {Report} from '@models/workspace/report.model';
import {Widget} from '@models/widget/widget.model';
import {ReportActionType} from '@enums/report-action-type.enum';
import {WidgetServiceRegistry} from '@services/widget/widget-service-registry';
import {AppStore} from '../../../../app.store';
import {ErrorTypeConstants, SubscribableComponent, UIErrorParameters} from '@blk/explore-ui-core';

/**
 * Component responsible for fetching and displaying portfolio publish state
 */
@Component({
    selector: 'app-publish-state',
    templateUrl: './publish-state.component.html',
    styleUrls: ['./publish-state.component.scss']
})
export class PublishStateComponent extends SubscribableComponent implements OnChanges {

    publishedStateResults: PublishStateItem[] = [];
    durationSinceLastFetch: string;
    lastFetchedTime: Moment;
    hasBeenFetched = false;
    buttonColor = 'publish-state-indicator';
    assistiveText = 'Quality Control Publish Indicator ';
    isFirstLoad = true; // to disable the qc status button before loading first time
    isQCDataObsolete = false; // reveal refresh QC button in the popup
    isNullQC = false;

    @Input() portfolio: Portfolio;

    constructor(private publishStateService: PublishStateService, private notificationService: NotificationService,  private changeDetectorRef: ChangeDetectorRef, private widgetServiceRegistry: WidgetServiceRegistry, private appStore: AppStore) {
        super();
    }

    /**
     * Init hook
     */
    ngOnChanges(): void {
        this.portfolio.publishStateWrapperSubject$.subscribe((publishState) => {
            this.publishedStateResults = publishState.publishedStateResults;
            this.lastFetchedTime = publishState.lastFetchedTime;
            this.hasBeenFetched = publishState.hasBeenFetched;
            this.isFirstLoad = publishState.isFirstLoad;
            this.isQCDataObsolete = publishState.isQCDataObsolete;
            this.isNullQC = publishState.isNullQC;
            this.getButtonColor();
            this.updateDuration();
            this.changeDetectorRef.markForCheck();
        });
    }

    /**
     * Call the publish state service to fetch the most recent data.
     */
    getPublishedStatus(): void {
        this.hasBeenFetched = false;
        this.publishStateService.fetchPublishedState$(this.portfolio).subscribe(
            () => {},
            error => {
                this.notificationService.error(error.message, ErrorTypeConstants.BACK_END_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_GET_PUBLISHED_STATUS_ERROR);
                this.portfolio.publishStateWrapperSubject$.getValue().publishedStateResults = [];
                this.portfolio.publishStateWrapperSubject$.getValue().hasBeenFetched = true;
                this.portfolio.publishStateWrapperSubject$.next(this.portfolio.publishStateWrapperSubject$.getValue());
            }
        );
    }

    /**
     * For the current portfolio in display,
     * determine how long ago the last publish state fetch happened.
     */
    updateDuration(): void {
        const duration = moment().diff(moment(this.lastFetchedTime));
        if (duration < PublishStateConstants.HOUR_TO_MILLISECOND) {
            this.durationSinceLastFetch = (Math.floor(duration / PublishStateConstants.MINUTE_TO_MILLISECOND) + 1).toString() + ' minute(s) ago';
        } else if (duration < PublishStateConstants.DAY_TO_MILLISECOND) {
            this.durationSinceLastFetch = (Math.floor(duration / PublishStateConstants.HOUR_TO_MILLISECOND) + 1).toString() + ' hour(s) ago';
        } else {
            this.durationSinceLastFetch = (Math.floor(duration / PublishStateConstants.DAY_TO_MILLISECOND) + 1).toString() + ' day(s) ago';
        }
    }

    /**
     * If any portfolio is unpublished, set the publish state button to red.
     */
    getButtonColor(): void {
        if (this.isNullQC) {
            this.buttonColor = PublishStateConstants.CLEAR_STATE;
        }
        if (!isEmpty(this.publishedStateResults) &&
            !isEmpty(this.publishedStateResults.filter(publishedItem => publishedItem.isUnpublished()))) {
            this.buttonColor = PublishStateConstants.RED_STATE;
            this.assistiveText = PublishStateConstants.ASSISTIVE_LABEL_RED_STATE;
        } else {
            this.buttonColor = PublishStateConstants.GREEN_STATE;
            this.assistiveText = PublishStateConstants.ASSISTIVE_LABEL_GREEN_STATE;
        }
    }

    /**
     * Method invoked on Refresh widget click withing QC panel
     */
    refreshWidgetData() {
        // If the user clicks the refresh widget data, get new data for the current report from the server (bypass browser cache)
        // and delete the data in the cache for the other reports in the current workpad
        WorkspaceStore.getCurrentWorkpad().reports.forEach(report => {
            if (report === WorkspaceStore.getCurrentReport()) {
                this.appStore.reportActionSubject$.next({hardRefresh: false, bypassBrowserCache: true, reportAction: ReportActionType.RELOAD_REPORT});
            } else {
                report.widgets.forEach(widget => {
                    this.clearDataFromCache(widget, report);
                });
            }
        });
        const publishStateWrapper = this.portfolio.publishStateWrapperSubject$.getValue();
        publishStateWrapper.isQCDataObsolete = false;
        this.portfolio.publishStateWrapperSubject$.next(publishStateWrapper);
    }

    /**
     * Clear data from cache for the passed in widget and report
     */
    clearDataFromCache(widget: Widget, report: Report) {
        const allPortfolios: Portfolio[] = WorkspaceStore.getCurrentWorkpad().getAllPortfolios();
        const widgetDataService = this.widgetServiceRegistry.getService(widget.configType);
        if (widgetDataService) {
            widgetDataService.clearDataFromCache(widget, this.portfolio, report, allPortfolios);
        }
    }
}
