import {AbstractConfig} from '../../../core/models/abstract-config.model';

/**
 * Implementing a common base class to allow some generic handling of these scenario columns.
 */
export abstract class AbstractScenario extends AbstractConfig {

    /**
     * Flag to indicate that the item is enabled.
     */
    enabled = true;
}
