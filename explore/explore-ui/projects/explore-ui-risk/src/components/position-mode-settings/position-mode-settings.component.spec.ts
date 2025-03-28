import {ComponentFixture, TestBed} from '@angular/core/testing';
import {PositionModeSettingsComponent} from './position-mode-settings.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {CoreDefinitionStore} from '@blk/explore-ui-core';
import {PositionModeSettings} from '../../models/position-mode-settings/position-mode-settings.model';
import {PositionModeType} from '../../enums/position-mode.enum';

describe('PositionModeSettingsComponent', () => {
  let component: PositionModeSettingsComponent;
  let fixture: ComponentFixture<PositionModeSettingsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ PositionModeSettingsComponent ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA]
    });

    CoreDefinitionStore.tokens['exploreEnablePositionModes'] = 'Y';
    fixture = TestBed.createComponent(PositionModeSettingsComponent);
    component = fixture.componentInstance;
    const positionModeSettingsModel = new PositionModeSettings();
    component.positionModeSettings = positionModeSettingsModel;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should test onPositionModeChanged', () => {
    expect(component.onPositionModeChanged(null)).toBeUndefined();
    expect(component.positionModeSettings).not.toBeUndefined();
    expect(component.positionModeSelection).not.toBeUndefined();
    expect(component.positionModeSettings.positionModeSelection).not.toBeUndefined();
    expect(component.positionModeSelection).toEqual(PositionModeType.AS_OF_W);
    expect(component.positionModeSettings.positionModeSelection).toEqual(PositionModeType.AS_OF_W);
    const event = {detail: {value: {eventData: PositionModeType.AS_IS_W}}} as CustomEvent;
    component.onPositionModeChanged(event);
    expect(component.positionModeSelection).toEqual(PositionModeType.AS_IS_W);
    expect(component.positionModeSettings.positionModeSelection).toEqual(PositionModeType.AS_IS_W);
  });
});
