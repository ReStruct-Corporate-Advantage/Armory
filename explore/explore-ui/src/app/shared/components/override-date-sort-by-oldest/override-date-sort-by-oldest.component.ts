import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {AuxRadioInterface} from '@blk/aladdin-angular-components';

@Component({
    selector: 'app-override-date-sort-by-oldest',
    templateUrl: './override-date-sort-by-oldest.component.html',
    styleUrls: ['./override-date-sort-by-oldest.component.scss']
})
export class OverrideDateSortByOldestComponent implements OnInit {

    overrideDateSortOptions: AuxRadioInterface[];

    @Input() sortByOldest!: boolean;
    @Output() sortByOldestChange = new EventEmitter<boolean>();

    ngOnInit(): void {
        this.overrideDateSortOptions = [
            {
                label: 'Newest',
                eventData: 'NEWEST',
                checked: !this.sortByOldest
            },
            {
                label: 'Oldest',
                eventData: 'OLDEST',
                checked: this.sortByOldest
            }
        ];
    }

    onOverrideDateSortOptionChanged(option: AuxRadioInterface): void {
        this.sortByOldestChange.emit(option.eventData === 'OLDEST');
    }
}
