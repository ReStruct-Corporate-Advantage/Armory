/* eslint-disable no-empty,@typescript-eslint/no-empty-function */

/**
 * This class includes almost every boilerplate code which is needed for a custom reactive form element.
 * Any component that extends this class, can be used with reactive forms
 */
import { ChangeDetectorRef, Directive, EventEmitter, Input, Optional, Output, Self, ViewRef } from '@angular/core';
import { ControlValueAccessor, NgControl, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@Directive()
@UntilDestroy()
export abstract class CustomFormControlBase<T> implements ControlValueAccessor {
  @Output()
  change = new EventEmitter<T>();
  @Input()
  isRequired: boolean;
  @Input()
  value: T;
  @Input()
  disabled: boolean;

  valid = true;
  onChanged?: (...args: any[]) => void;
  onTouched?: (...arsg: any[]) => void;


  constructor(@Self() @Optional() protected ngControl: NgControl, protected cdr: ChangeDetectorRef) {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
      // Explanation for the setTimeout -> see below
      setTimeout(() => {
        ngControl?.statusChanges?.pipe(untilDestroyed(this)).subscribe(_ => this.checkIfValid());
        this.isRequired = this.ngControl?.control?.hasValidator(Validators.required);
      }, 0);
    }
  }

  /*
   * This code will called
   * 1) When the parent component changes the value in the reactive form
   * 2) By the @function onValueChange function when the user changes the value in the UI element
   */
  writeValue(val: T) {
    if (this.onChanged) {
      this.onChanged(val);
    }
    this.value = val;
    this.checkIfValid();
  }

  registerOnChange(fn: any) {
    this.onChanged = fn;
  }
  registerOnTouched(fn: any) {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

   /*
   * This should be called when the value is change by the user on the UI
   *
   * If you need any specific logic than a simple value pass, then override this function in
   * the child class and call super.onValueChange(value) at the end
   *
   * We need this function because we only want to emit when the user changes the value
   */
  onValueChange(val: T) {
    this.change.emit(val);
    if (this.ngControl) {
      if (this.onTouched) {
        this.onTouched();
      }
      this.writeValue(val);
    }
  }

onFocusOut() {
  if (this.onTouched) {
    this.onTouched();
  }
  this.checkIfValid();
}

  private checkIfValid() {
    if (this.ngControl) {
      /**
       * Angular is mutating the ngControl object after it was created. By using setTimeout with 0ms,
       * we are taking advantage of the JS event loop. When the code inside the setTimeout is being
       * executed, the ngControl will have all of the necessary properties
       */
      setTimeout(() => {
      this.valid = this.ngControl && this.ngControl.touched ? !!this.ngControl.valid : true;
      if (!!this.cdr && !(this.cdr as ViewRef).destroyed) {
          this.cdr.detectChanges();
      }
      }, 0);
    }
  }
}
