import {Component} from '@angular/core';
import {SecurityDescriptionColumnOption} from '../../../models/column-option/security-description-column-option.model';
import {GenericDropDownComponent} from '../../generic-drop-down/generic-drop-down.component';

/**
 * Column option component for the security description selection.
 */
@Component({
    selector: 'explore-security-description-column-option',
    templateUrl: '../../generic-drop-down/generic-drop-down.component.html'
})
export class SecurityDescriptionColumnOptionComponent extends GenericDropDownComponent<SecurityDescriptionColumnOption> {
    public static OPTION_KEY = SecurityDescriptionColumnOption.CONFIG_TYPE;

    /**
     * Gets the config type that this object is configuring.
     */
    getOptionValueConfigType(): string {
        return SecurityDescriptionColumnOption.CONFIG_TYPE;
    }
}
