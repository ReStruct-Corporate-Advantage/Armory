import {Directive} from '@angular/core';
import {AbstractColumnOption} from '@blk/explore-ui-core';
import {BaseColumnOptionComponent} from '../base-column-option.component';

/**
 * Base class for climate scenario settings
 * Additional shared logic should be moved to this directive at a later point, for now doing this to fix sonar code duplication error
 */
@Directive()
export abstract class BaseClimateScenarioColumnOptionDirective<T extends AbstractColumnOption> extends BaseColumnOptionComponent<T> {

    /** Restricts the user to only selecting one scenario (enabled in Coverage, custom calc columns) */
    isSingleScenarioSelection = false;

    /**
     * Initialize the climate column option.
     * Gets data formatter and valid comparison types based on column type
     */
    protected initializeComponent(): void {
        super.initializeComponent();
        this.isSingleScenarioSelection = this.option.columnOptionAttributes[0]?.isRestricted;
    }
}
