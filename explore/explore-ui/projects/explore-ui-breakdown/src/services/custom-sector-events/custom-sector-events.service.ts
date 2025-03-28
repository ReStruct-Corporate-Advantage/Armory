import {Injectable} from '@angular/core';
import {CustomSectorItemComponent} from '../../components/custom-sector-item/custom-sector-item.component';
import {BehaviorSubject, Observable} from 'rxjs';

@Injectable()
export class CustomSectorEventsService {

    activeCustomSectorItemSubject: BehaviorSubject<CustomSectorItemComponent>;

    constructor() {
        this.activeCustomSectorItemSubject = new BehaviorSubject<CustomSectorItemComponent>(undefined);
    }

    getActiveCustomSectorItem$(): Observable<CustomSectorItemComponent> {
        return this.activeCustomSectorItemSubject.asObservable();
    }

    setActiveCustomSector(customSectorItemComponent: CustomSectorItemComponent): void {
        this.activeCustomSectorItemSubject.next(customSectorItemComponent);
    }

}
