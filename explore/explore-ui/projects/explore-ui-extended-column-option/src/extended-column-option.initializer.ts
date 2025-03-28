import {
    ColumnOptionFactory,
} from '@blk/explore-ui-core';
import {ShockSettingColumnOption} from './models/column-option/shock-setting-column-option.model';

export class ExtendedColumnOptionInitializer {

    /**
     * Initialize the required configs for column options
     */
    static registerColumnOptionTypes(): void {
        ColumnOptionFactory.registerOptionType(ShockSettingColumnOption.CONFIG_TYPE, ShockSettingColumnOption);
    }
}
