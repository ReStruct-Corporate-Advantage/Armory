import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdvancedAttributionSettingsComponent } from './advanced-attribution-settings.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {AssetType} from '../../asset-type.enum';
import {FactorAttributionSettings} from '../../models/factor-attribution-settings/factor-attribution-settings.model';

describe('AssetTypeAdvancedSettingsComponent', () => {
  let component: AdvancedAttributionSettingsComponent;
  let fixture: ComponentFixture<AdvancedAttributionSettingsComponent>;
  const defaultFactorAttributionType = AssetType.MULTI_ASSET;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdvancedAttributionSettingsComponent ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdvancedAttributionSettingsComponent);
    component = fixture.componentInstance;
    component.factorAttributionSettings = getFactorAttributionSettings();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

    it('should initialize', () => {
        component.ngOnInit();
        expect(component.factorAttributionSettings).toBeDefined();
        expect(component.displayFactorAttributionTypes).toBeDefined();
    });

    it('Test initializeDisplayAssetTypes', () => {
        component.initializeDisplayAssetTypes();
        expect(component.displayFactorAttributionTypes).toBeDefined();
        let checkedValue = null;
        for (const type of component.displayFactorAttributionTypes) {
            if (type.checked) {
                checkedValue = type.eventData;
                break;
            }
        }
        expect(component.factorAttributionSettings.factorAttributionType).toEqual(checkedValue);
    });

    /**
     *  Create FactorAttributionSettings for testing.
     */
    function getFactorAttributionSettings(): FactorAttributionSettings {
        const factorAttributionSettings: FactorAttributionSettings = new FactorAttributionSettings();
        factorAttributionSettings.factorAttributionType = defaultFactorAttributionType;
        return factorAttributionSettings;
    }
});
