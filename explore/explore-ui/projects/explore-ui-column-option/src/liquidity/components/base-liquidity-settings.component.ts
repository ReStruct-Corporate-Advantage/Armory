import { Input, Directive } from '@angular/core';
import {AbstractLiquiditySettings} from '../models/abstract-liquidity-settings.model';
import {SubscribableComponent} from '@blk/explore-ui-core';

/**
 * Base liquidity setting component in column options for liquidity columns
 */
@Directive()
export abstract class BaseLiquiditySettingsComponent<T extends AbstractLiquiditySettings> extends SubscribableComponent {
    @Input() optionAttributes: Map<string, boolean>;
    @Input() underlyingLiquiditySettings: T;
}
