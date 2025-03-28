import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ExploreSelectOption, ExploreSelectOptionGroup, SubscribableComponent} from '@blk/explore-ui-core';
import {CommonConstants} from '@constants/common.constants';
import {AuxSelectOption, AuxSelectSelectionChangedDetailInterface} from '@blk/aladdin-angular-components';
import LocaleMapping from '@assets/Internationalization/locale-mapping.json';
import {UserMetaDataStore} from '@stores/user-meta-data.store';
import {UserPreference} from '@constants/user-preference.constants';
import {isEmpty} from 'lodash';
import {NotificationService} from '@services/notification';

@Component({
    selector: 'app-locale-setting-modal',
    templateUrl: './locale-setting-modal.component.html',
    styleUrls: ['./locale-setting-modal.component.scss']
})
export class LocaleSettingModalComponent extends SubscribableComponent implements OnInit {
    readonly CLOSE_TEXT = CommonConstants.BUTTON_TEXT.CLOSE;
    // variables to control modal open/close event
    @Output() modalClosed = new EventEmitter<boolean>();
    @Input() isOpen: boolean;

    localeOptions: ExploreSelectOptionGroup[] = [];
    selectedLocale: string;

    constructor(private notificationService: NotificationService) {
        super();
    }

    ngOnInit(): void {
        this.initializeLocaleOptions();
    }

    private initializeLocaleOptions() {

        let defaultLocale = UserMetaDataStore.getPreferenceValue(UserPreference.LOCALE);
        defaultLocale = isEmpty(defaultLocale) ? navigator.languages[0] : defaultLocale;
        this.selectedLocale = defaultLocale;
        this.localeOptions = [new ExploreSelectOptionGroup([])];

        // iterate over Object.entries(LocaleMapping) and populate localeOptions
        Object.entries(LocaleMapping).forEach(([key, value]) => {
            this.localeOptions[0].values.push(new ExploreSelectOption(value['name'], value['code'], value['code'] === defaultLocale));
        });
    }

    onLocaleSelectionChanged(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>): void {
        this.selectedLocale = (event.detail.value as AuxSelectOption).value;
    }

    onDoneClicked(): void {
        UserMetaDataStore.setPreferenceValue(UserPreference.LOCALE, this.selectedLocale);
        this.notificationService.invokeWidgetReloadPrompt();
        this.closeModal();
    }
    /**
     * Close modal
     */
    closeModal(): void {
        this.isOpen = false;
        this.modalClosed.emit();
    }
}
