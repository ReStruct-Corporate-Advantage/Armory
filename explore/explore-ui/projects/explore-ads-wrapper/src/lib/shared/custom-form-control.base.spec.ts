/* eslint-disable @typescript-eslint/no-empty-function */
import { NgControl, FormControlDirective } from '@angular/forms';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { ChangeDetectorRef, Component } from '@angular/core';
import { CustomFormControlBase } from './custom-form-control.base';

@Component({
    template: ''
  })
  class TestFormControlComponent extends CustomFormControlBase<{ id?: any }> {}

describe('CustomFormControlBase', () => {
  let customFormBase: TestFormControlComponent;
  let ngControl: NgControl;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [{ provide: NgControl, useValue: new FormControlDirective([], [], null, null) }],
      teardown: { destroyAfterEach: false },
    }).compileComponents();
  }));

  beforeEach(() => {
    ngControl = TestBed.inject(NgControl);
    customFormBase = new TestFormControlComponent(ngControl, {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      detectChanges: () => {},
    } as ChangeDetectorRef);
    customFormBase.change.emit = jest.fn();
  });

  beforeEach(() => {
    customFormBase.registerOnChange(() => {});
    customFormBase.registerOnTouched(() => {});
  });

  it('should create', () => {
    expect(customFormBase).toBeTruthy();
  });

  describe('writeValue', () => {
    it('onChangeshould be called when writeValue is called', () => {
      jest.spyOn(customFormBase, 'onChanged');

      customFormBase.writeValue({ id: 1 });
      expect(customFormBase.onChanged).toHaveBeenCalledWith({ id: 1 });
      expect(customFormBase.value).toEqual({ id: 1 });
    });
  });

  describe('onValueChange method', () => {
    it('should fire change and write Value', () => {
      jest.spyOn(customFormBase.change, 'emit');
      jest.spyOn(customFormBase, 'onTouched');
      jest.spyOn(customFormBase, 'writeValue');

      customFormBase.onValueChange({ id: 1 });
      expect(customFormBase.change.emit).toHaveBeenCalledWith({ id: 1 });
      expect(customFormBase.onTouched).toHaveBeenCalled();
      expect(customFormBase.writeValue).toHaveBeenCalledWith({ id: 1 });
    });

    it('should not fire change, but still write value, if ngControl is null', () => {
      // @ts-ignore
      customFormBase.ngControl = null;

      jest.spyOn(customFormBase.change, 'emit');
      jest.spyOn(customFormBase, 'onTouched');
      jest.spyOn(customFormBase, 'writeValue');

      customFormBase.onValueChange({ id: 1 });

      expect(customFormBase.change.emit).toHaveBeenCalledWith({ id: 1 });
      expect(customFormBase.onTouched).not.toHaveBeenCalled();
      expect(customFormBase.writeValue).not.toHaveBeenCalled();
    });
  });

  describe('registerOnChange method', () => {
    it('should set onChangedMethod', () => {
      customFormBase.registerOnChange((a: string) => a);
      const obj = customFormBase.onChanged('1');
      expect(obj).toEqual('1');
    });
  });

  describe('registerOnTouched', () => {
    it('should set registerOnTouched method', () => {
      customFormBase.registerOnTouched((a: string) => a);
      const obj = customFormBase.onTouched('1');
      expect(obj).toEqual('1');
    });
  });

  describe('setDisabledState method', () => {
    it('should set disabled state method', () => {
      customFormBase.setDisabledState(false);
      expect(customFormBase.disabled).toEqual(false);
    });
  });

  describe('onFocusOut method', () => {
    it('should call on touched', () => {
      const onTouchedSpy = jest.spyOn(customFormBase, 'onTouched');
      customFormBase.onFocusOut();
      expect(onTouchedSpy).toHaveBeenCalled();
    });
  });
});
