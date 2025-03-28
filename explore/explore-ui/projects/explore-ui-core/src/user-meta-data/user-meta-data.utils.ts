import {CoreUserMetaDataStore} from './core-user-meta-data.store';

export class UserMetaDataUtils {
    /**
     * Get Permission for a  user Perm type
     */
    static getUserPerm (permType: string): any {
        return CoreUserMetaDataStore.userMetaData[permType];
    }

    /**
     * Checks if the user has permission to launch an application.
     */
    static hasLaunchApp(app: string): boolean {
        return CoreUserMetaDataStore.userMetaData.launchApps && CoreUserMetaDataStore.userMetaData.launchApps.includes(app);
    }
}
