import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-favorite-version-log-link',
  templateUrl: './favorite-version-log-link.component.html'
})
export class FavoriteVersionLogLinkComponent {
  
  @Output() viewClick = new EventEmitter();

    onViewClicked(): void {
        this.viewClick.emit();
    }

}
