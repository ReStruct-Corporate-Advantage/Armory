import {BehaviorSubject} from 'rxjs';
import {UserPreference} from '../constants';
import {CoreUserMetaDataStore, UserMetaData} from '@blk/explore-ui-core';

export class UserMetaDataStore {
    /**
     * This subscription is used to notify when any preference is changed.
     */
    static preferenceChangeSubject: BehaviorSubject<UserPreference> = new BehaviorSubject<UserPreference>(null);

    /**
     * This is used to notify when a particular preference is changed.
     */
    private static preferenceSubjects: Map<string, BehaviorSubject<string>> = new Map<string, BehaviorSubject<string>>();

    /**
     * Gets the current value of a preference or the default value if not set.
     */
    static getPreferenceValue(preference: UserPreference): string {
        const currentValue = CoreUserMetaDataStore.userMetaData ? CoreUserMetaDataStore.userMetaData.preferences.get(preference.name) : undefined;
        return currentValue ? currentValue : preference.defaultValue;
    }

    /**
     * Gets a subscription to the preference so that any changes can be updated automatically.
     */
    static getPreferenceSubject(preference: UserPreference): BehaviorSubject<string> {
        let prefSubject: BehaviorSubject<string> = UserMetaDataStore.preferenceSubjects.get(preference.name);
        if (!prefSubject) {
            // Create a new subject and initialise it with the current user preference value.
            prefSubject = new BehaviorSubject<string>(UserMetaDataStore.getPreferenceValue(preference));
            UserMetaDataStore.preferenceSubjects.set(preference.name, prefSubject);
        }
        return prefSubject;
    }

    /**
     * Sets a preference value for the user.
     */
    static setPreferenceValue(preference: UserPreference, value: string): void {
        // Only fire a change in the preference if the value of it has actually changed.
        // This has been done as the sidebar fires an event even when only restoring the state.
        const originalValue = UserMetaDataStore.getPreferenceValue(preference);
        if (originalValue === value) {
            return;
        }

        // Update the preference value.
        CoreUserMetaDataStore.userMetaData.preferences.set(preference.name, value);

        // Trigger the preference subscription.
        this.getPreferenceSubject(preference).next(value);

        // Trigger another event that indicates that a preference was changed if it actually changed.
        this.preferenceChangeSubject.next(preference);
    }
}
