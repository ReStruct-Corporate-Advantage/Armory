import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {AuxSelect, AuxSelectOptionGroup} from '@blk/aladdin-angular-components';
import {
    ExploreSelectOptionGroup,
    SubscribableComponent
} from '@blk/explore-ui-core';
import {CommonConstants} from '@constants/common.constants';
import {FavoriteChange} from '@models/favorite/favorite-change.model';

/**
 * Favorite Permission Component
 *  Used for Ace template permissioning
 */
@Component({
    selector: 'app-favorite-permission',
    templateUrl: './favorite-permission.component.html',
    styleUrls: ['./favorite-permission.component.scss']
})
export class FavoritePermissionComponent extends SubscribableComponent implements OnInit {

    @ViewChild('permissioningTypeAuxSelect', {static: true}) auxSelect: AuxSelect;

    @Input() favoriteChange: FavoriteChange;

    private readonly TOKEN_TYPE = 'Token';
    private readonly PERMISSION_TYPE = 'Permission';
    private readonly PERMISSION_GROUP_TYPE = 'PermissionGroup';
    private readonly PERMISSION_GROUP_TYPE_DISPLAY = 'PermissionGroup';

    permissioningTypes: AuxSelectOptionGroup[];
    selectedPermissioningType = this.TOKEN_TYPE;

    // Favorite description is saved with permissioning type and value separated by colon.
    // eg> Permission:geAladdinResearch || Token:EXPLORE_ENABLE_METRICS,ENABLE_LOAD_ALL || PermissionGroup:CLARITY_SDG
    favoriteDescription: string;
    permissioningValue: string;
    permissioningHelp: string;

    ngOnInit(): void {
        this.permissioningTypes = ExploreSelectOptionGroup.createSimpleSelectOptionGroup(
            [this.TOKEN_TYPE, this.PERMISSION_TYPE, this.PERMISSION_GROUP_TYPE],
            [this.TOKEN_TYPE, this.PERMISSION_TYPE, this.PERMISSION_GROUP_TYPE_DISPLAY],
            this.TOKEN_TYPE);

        this.favoriteDescription = this.favoriteChange.favoriteDescription;

        this.showPermissioningValue();
    }

    /**
     * Get permissioning values from favorite description.
     *
     * Favorite description is saved with permissioning type and value separated by colon.
     * eg> Token:EXPLORE_ENABLE_METRICS,ExplorePopupChart
     *     Permission:geAladdinResearch
     *     PermissionGroup:Clarity_RISK,Clarity_IMPACT
     */
    private showPermissioningValue(): void {
        if (this.favoriteDescription?.includes(CommonConstants.COLON)) {
            this.selectedPermissioningType = this.favoriteDescription.split(CommonConstants.COLON)[0];
            this.permissioningValue = this.favoriteDescription.split(CommonConstants.COLON)[1];
        } else {
            this.selectedPermissioningType = this.TOKEN_TYPE;
            this.permissioningValue = null;
        }
        this.auxSelect.setValue({selectedValue: this.selectedPermissioningType});

        this.showPermissioningHelp();
    }

    /**
     * On type changed
     */
    onPermissioningTypeChanged(event: CustomEvent): void {
        const permissioningType = event.detail.value.value;
        if (permissioningType !== this.selectedPermissioningType) {
            this.selectedPermissioningType = permissioningType;
            this.permissioningValue = null;
            this.updateFavoriteDescription();
            this.showPermissioningHelp();
        }
    }

    /**
     * Show permissioning help description
     */
    private showPermissioningHelp(): void {
        switch (this.selectedPermissioningType) {
            case this.TOKEN_TYPE:
                this.permissioningHelp = '`Token` permissioning can have multiple tokens separated by comma.' +
                    '  ONLY If ALL added `token values` are true, user will have access to the template.';
                break;
            case this.PERMISSION_TYPE:
                this.permissioningHelp = '`User Permission` permissioning has two types: BooleanPerm and DecodePerms.\n' +
                    'BooleanPerm type can have one user permission value ONLY.\n\t (eg> geAladdinResearch)\n' +
                    'DecodePerm type consists of `PermType` and `SubPerms` separated by comma.' +
                    '  ONLY If ALL listed `SubPerms` are true, user will have access to the template.\n' +
                    '\t (eg> VIEW_MSCI_ESG,SCREEN_STEMCELL,CLIMATE_FF,ESG_METRICS1)';
                break;
            case this.PERMISSION_GROUP_TYPE:
                this.permissioningHelp = '`Permission Group` permissioning can have multiple groups separated by comma.' +
                    '  ONLY If ALL added `group values` are true, user will have access to the template.';
                break;
            default:
                break;
        }
    }

    /**
     * On permissioningValue changed, update favorite description
     * favoriteDescription can hold only one out of Token, Permission, OR PermissionGroup.
     */
    onPermissioningValueChanged(event: CustomEvent): void {
        if (event?.detail) {
            this.permissioningValue = event.detail.value;
        }
        this.updateFavoriteDescription();
    }

    private updateFavoriteDescription(): void {
        this.favoriteDescription = this.permissioningValue
            ? this.selectedPermissioningType + CommonConstants.COLON + this.permissioningValue.replace(/\s/g, '')
            : null;
    }
}
