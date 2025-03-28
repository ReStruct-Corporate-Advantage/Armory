import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { TextInputComponent } from './text-input.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('TextInputComponent', () => {
  let component: TextInputComponent;
  let fixture: ComponentFixture<TextInputComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [TextInputComponent],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: false },
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TextInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit value change event when value has been changed', () => {
    const value = 'matchaLatte';
    component.value = value;
    fixture.detectChanges();
    jest.spyOn(component.change, 'emit');
    const textInput = fixture.debugElement.query(By.css('aux-text-input')).nativeElement;
    const valueChangedEvent = new CustomEvent('valueChanged', {
        detail: { value }
      });
    textInput.dispatchEvent(valueChangedEvent);
    expect(component.change.emit).toHaveBeenCalledTimes(1);
  });

  it('should emit input blur event when blur has been changed', () => {
    const value = 'matchaLatte';
    component.value = value;
    fixture.detectChanges(); // Update bindings and DOM

    jest.spyOn(component.inputBlur, 'emit');
    const textInput = fixture.debugElement.query(By.css('aux-text-input')).nativeElement;
    const inputBlurEvent = new CustomEvent('inputBlur', {
        detail: {
            srcEvent: {
                target: {
                    value: 'mockValue'
                }
            }
        }
      });
    textInput.dispatchEvent(inputBlurEvent);
    // tick(); // Simulate the passage of time
    expect(component.inputBlur.emit).toHaveBeenCalledTimes(1);
  });
});
