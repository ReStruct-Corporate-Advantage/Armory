import {ComponentFixture, TestBed} from '@angular/core/testing';
import {LocaleSettingModalComponent} from './locale-setting-modal.component';
import {NotificationService} from '@services/notification';
import {UserMetaDataStore} from '@stores/user-meta-data.store';
import {UserPreference} from '@constants/user-preference.constants';
import LocaleMapping from '../../../../assets/Internationalization/locale-mapping.json';
import {AuxSelectSelectionChangedDetailInterface} from '@blk/aladdin-angular-components';
import {
    CoreUserMetaDataStore
} from "../../../../../projects/explore-ui-core/src/user-meta-data/core-user-meta-data.store";
import {UserMetaData} from "../../../../../projects/explore-ui-core/src/user-meta-data/user-meta-data.model";

describe('LocaleSettingModalComponent', () => {
    let component: LocaleSettingModalComponent;
    let fixture: ComponentFixture<LocaleSettingModalComponent>;

    const notificationServiceStub = {
        openDialog: jest.fn(),
        success: jest.fn(),
        error: jest.fn(),
        invokeWidgetReloadPrompt: jest.fn()
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [LocaleSettingModalComponent],
            providers: [
                {provide: NotificationService, useValue: notificationServiceStub}
            ]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(LocaleSettingModalComponent);
        component = fixture.componentInstance;
        CoreUserMetaDataStore.userMetaData = new UserMetaData();
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize locale options on init', () => {
        jest.spyOn(UserMetaDataStore, 'getPreferenceValue').mockReturnValue('en-US');
        component.ngOnInit();
        expect(component.selectedLocale).toBe('en-US');
        expect(component.localeOptions.length).toBe(1);
        expect(component.localeOptions[0].values.length).toBe(Object.keys(LocaleMapping).length);
    });

    it('should set default locale if user preference is empty', () => {
        jest.spyOn(UserMetaDataStore, 'getPreferenceValue').mockReturnValue('');
        component.ngOnInit();
        expect(component.selectedLocale).toBe(navigator.languages[0]);
    });

    it('should update selected locale on selection change', () => {
        const event = { detail: { value: { value: 'fr-FR' } } } as CustomEvent<AuxSelectSelectionChangedDetailInterface>;
        component.onLocaleSelectionChanged(event);
        expect(component.selectedLocale).toBe('fr-FR');
    });

    it('should save selected locale and invoke widget reload on done click', () => {
        jest.spyOn(UserMetaDataStore, 'setPreferenceValue');
        component.selectedLocale = 'es-ES';
        component.onDoneClicked();
        expect(UserMetaDataStore.setPreferenceValue).toHaveBeenCalledWith(UserPreference.LOCALE, 'es-ES');
        expect(component['notificationService'].invokeWidgetReloadPrompt).toHaveBeenCalled();
    });

    it('should close modal and emit event', () => {
        jest.spyOn(component.modalClosed, 'emit');
        component.closeModal();
        expect(component.isOpen).toBeFalsy();
        expect(component.modalClosed.emit).toHaveBeenCalledWith();
    });
});
