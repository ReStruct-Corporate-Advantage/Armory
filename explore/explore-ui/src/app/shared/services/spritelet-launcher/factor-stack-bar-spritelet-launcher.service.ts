import {Injectable} from '@angular/core';
import {ChartMarkerSymbol, ChartType} from '@qbstr/highcharts-api';
import {Widget} from '@models/widget/widget.model';
import {BarChartAdditionalSettings} from '@models/widget/inputs/chart-settings/bar-chart-additional-settings.model';
import {FactorBarSpriteletLauncherService} from '@services/spritelet-launcher/factor-bar-spritelet-launcher.service';
import {WidgetConfigType} from '@blk/explore-ui-core';

@Injectable({
    providedIn: 'root'
})
/**
 * Spritelet launcher responsible for launching a Factor Stack Bar Chart from a Factor Based Analysis widget
 */
export class FactorStackBarSpriteletLauncherService extends FactorBarSpriteletLauncherService {

    /**
     * Unique action key that maps to a particular spritelet launcher service
     */
    getSpriteletActionKey(): string {
        return WidgetConfigType.FACTOR_GRAPHING_STACK_BAR_CHART.toString();
    }

    /**
     * Returns WidgetConfigType of child spritelet
     */
    getChildWidgetConfigType(): WidgetConfigType {
        return WidgetConfigType.FACTOR_GRAPHING_STACK_BAR_CHART;
    }

    /**
     * Configures a child chart spritelet metadata
     * @param childWidget Child spritelet widget whose inputs are being modified
     */
    protected configureSpriteletMetadata(childWidget: Widget) {
        // set bar chart additional settings
        const barChartAdditionalSettings = new BarChartAdditionalSettings();
        barChartAdditionalSettings.isStacked = true;
        barChartAdditionalSettings.stackByImmediateChild = true;
        barChartAdditionalSettings.showSelected = false;
        barChartAdditionalSettings.selectedAsMeasureSeries = true;
        barChartAdditionalSettings.selectedChartType = ChartType.LINE;
        barChartAdditionalSettings.selectedChartMarkerSymbol = ChartMarkerSymbol.CIRCLE;

        childWidget.dataStore.metaData.inputs.set(BarChartAdditionalSettings.configType, barChartAdditionalSettings);
    }
}
