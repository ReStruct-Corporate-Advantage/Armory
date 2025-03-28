import {ModalStateAction} from '@models/favorite/modal-state-action.enum';
import {ModalInvokeSource} from '@models/favorite/modal-invoke-source.enum';

export interface ModalStateActionInfo {
    reason: ModalStateAction;
    sourceUniqueId?: string;
    favoriteType?: string;
    source?: ModalInvokeSource;
}
