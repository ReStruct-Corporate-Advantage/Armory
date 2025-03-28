import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AuxButtonTypeEnum, AuxIconType } from '@blk/aladdin-angular-components';

export type ButtonType =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'tertiary-subtle'
  | 'primary-danger'
  | 'secondary-danger'
  | 'destructive-primary'
  | 'destructive-secondary'
  | 'destructive-tertiary';

/**
 * This component wraps the aux-button component.
 *
 * @example
 *  <explore-button icon="arrow-up" type="secondary" size="small" [isDisabled]="i == 0"
 *               (click)="reorderHighlightRule(i, true)">
 *  </explore-button>
 */
@Component({
  selector: 'explore-button',
  templateUrl: './button.component.html',
})
export class ButtonComponent {
  @Input()
  label: string;

  @Input()
  isDisabled: boolean;

  @Input()
  icon: AuxIconType;

  @Input()
  isIconRight: boolean;

  @Input()
  type: ButtonType = AuxButtonTypeEnum.PRIMARY;

  @Input()
  size: 'xsmall' | 'small' | 'regular' | 'large' | 'block' = 'regular';

  @Output()
  click = new EventEmitter<void>();

  onClick(clickEvent: Event) {
    clickEvent.stopPropagation();
    this.click.emit();
  }
}
