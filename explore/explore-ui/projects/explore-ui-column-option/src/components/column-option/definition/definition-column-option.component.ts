import {Component} from '@angular/core';
import {ColumnDefinition, CoreColumnUtils} from '@blk/explore-ui-core';
import {DefinitionColumnOption} from '../../../models/column-option/definition-column-option.model';
import {BaseColumnOptionComponent} from '../base-column-option.component';


@Component({
    selector: 'explore-definition-column-option',
    templateUrl: './definition-column-option.component.html',
    styleUrls: ['./definition-column-option.component.scss']
    })

/**
 * Column option component for definition column option
 */

export class DefinitionColumnOptionComponent extends BaseColumnOptionComponent<DefinitionColumnOption> {

    public static OPTION_KEY = 'definition';
    definition: ColumnDefinition;

    /**
     * Initialize the definition and methodology column option.
     */
    protected initializeComponent(): void {
        super.initializeComponent();

        // get the column definition
        this.definition = CoreColumnUtils.getColumnDefByTagAndUse(this.column.columnTag, this.column.positionColumnType);
    }

    /**
     * Get the config type that this object is configuring.
     */
    protected getOptionValueConfigType(): string {
        return DefinitionColumnOptionComponent.OPTION_KEY;
    }

}
