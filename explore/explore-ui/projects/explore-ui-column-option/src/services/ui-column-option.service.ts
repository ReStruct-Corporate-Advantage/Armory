import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';

/**
 * OverrideDate list changes Service
 */
@Injectable()
export class UiColumnOptionService {
    private overrideCompareToCurrent$ = new Subject<string>();

    /**
     * set the current selection
     * @param compareToCurrent
     */
    setCompareToCurrentOption(compareToCurrent: string) {
        this.overrideCompareToCurrent$.next(compareToCurrent);
    }

    /**
     * return the observable
     */
    getOverrideDateSelection$(): Observable<string> {
        return this.overrideCompareToCurrent$.asObservable();
    }
}
