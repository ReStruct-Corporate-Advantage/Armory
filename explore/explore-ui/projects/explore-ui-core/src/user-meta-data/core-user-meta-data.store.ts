import {UserMetaData} from './user-meta-data.model';

// @dynamic
// getting below error without @dynamic:
//  Error encountered in metadata generated for exported symbol 'CoreUserMetaDataStore':
//  Metadata collected contains an error that will be reported at runtime: Only initialized variables and constants can be referenced because the value of this variable is needed by the template compiler.
export class CoreUserMetaDataStore {
    /**
     * UserMetaData
     */
    static userMetaData: UserMetaData;
}
