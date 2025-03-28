import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {WIDGET_CONFIG_DIRECTORY_TOKEN, WidgetConfigResolverService} from '@blk/explore-ui-core';

/**
 * Module for all the meta data which includes user meta data, column definitions, mandate mapping
 */
@NgModule({
    declarations: [],
    imports: [CommonModule],
    providers: [
        {
            provide: WIDGET_CONFIG_DIRECTORY_TOKEN,
            useValue: 'assets/widget-configs/'
        },
        {
            provide: WidgetConfigResolverService,
            useClass: WidgetConfigResolverService
        }
    ]
})
export class MetadataModule { }
