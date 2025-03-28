import {Pipe, PipeTransform} from '@angular/core';
import {cloneDeep} from 'lodash';

/**
 * CloneDeepPipe
 *  Use cloned object in the html
 */
@Pipe({name: 'cloneDeep'})
export class CloneDeepPipe implements PipeTransform {
    transform(obj: any): any {
        return cloneDeep(obj);
    }
}
