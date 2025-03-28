import {WorkspaceStore} from '../stores';
import {AppStore} from '../app.store';

export class ReportUtils {

    /**
     * If the widgets in the report are not loading then set isReportLoading to false
     */
    static checkIsReportLoading(): void {
        const isWidgetLoading = Array.from(WorkspaceStore.widgetLoadingStatusMap.values()).filter(iswidgetLoading$ => iswidgetLoading$.value === true);
        if (isWidgetLoading.length === 0) {
            AppStore.reportLoadingStatus$.next(false);
        }
    }
}
