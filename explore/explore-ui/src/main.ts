import {enableProdMode} from '@angular/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {AppModule} from './app/app.module';
import {environment} from './environments/environment';
import {initADS} from '@qbstr/highcharts-core';
import {initAXFHeader} from './init-axf-header';
import {GridOptionsService} from 'ag-grid-community';

initADS();
initAXFHeader();

// Highcharts export menu requires the exporting module below.
// https://api.highcharts.com/highcharts/exporting.enabled
// Ideally this needs to be injected on price chart lib, since it's the only place highcharts export menu is used.
import * as Highcharts from 'highcharts';

// tslint:disable-next-line:no-var-requires
require('highcharts/modules/exporting')(Highcharts);
declare global {
    interface Window { Highcharts?: typeof Highcharts; }
}
if (environment.production) {
    enableProdMode();
} else {
    // Expose Highcharts as a global variable for testing purposes
    window.Highcharts = Highcharts;
}

platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .catch(err => console.error(err));


/**
 * Override the default behavior of ag-grid to not couple sorting with grouping.
 * The source code is changed not to include this.isRowModelType('clientSide') as part of the equation,
 * so it now returns true where it used to return false.
 * For details: https://dev.azure.com/1A4D/Explore/_workitems/edit/1955733
 *
 * As an IP sprint item, we can investigate to switch our serverSideRowModel to clientSide - as the latest ag-grid should handle what we need. i.e. client side lazy loading.
 */
GridOptionsService.prototype.isColumnsSortingCoupledToGroup = function () {
    return false;
};
