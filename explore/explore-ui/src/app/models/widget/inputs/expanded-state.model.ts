import {isArray, isEqual, isObject} from 'lodash';
import {AbstractConfig, SerializeFavoriteType, WidgetInput} from '@blk/explore-ui-core';

/**
 * This class is for storing the expanded state of the table widget.
 */
export class ExpandedState extends AbstractConfig implements WidgetInput {
    static readonly CONFIG_TYPE = 'expandedState';
    static readonly ROOT_NODE_KEY = '_ROOT_';

    allExpanded: boolean;
    private _expandedPaths = new Map<string, string[]>();

    /**
     * Constructor.
     */
    constructor(data?: any) {
        super();
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * Gets the config type.
     */
    static get configType(): string {
        return ExpandedState.CONFIG_TYPE;
    }

    getConfigType() {
        return ExpandedState.CONFIG_TYPE;
    }

    /**
     * Gets the list of expanded paths.
     */
    get expandedPaths(): string[][] {
        const paths: string[][] = [];
        this._expandedPaths.forEach((value: string[]) => paths.push(value));
        return paths;
    }

    /**
     * Sets the list of expanded paths.
     */
    set expandedPaths(paths: string[][]) {
        paths.forEach((value: string[]) => {
            this.updateItem(value, true);
        });
    }

    /**
     * Not a data store input.
     */
    isDataStoreInput(): boolean {
        return false;
    }

    shouldSkipSerialize(): boolean {
        // Default is to not skip serialization
        return false;
    }

    /**
     * Serialize the config.
     */
    serialize(_isNested?: boolean | SerializeFavoriteType): any {
        const data: any = {};

        if (this.allExpanded) {
            data.allExpanded = this.allExpanded;
        } else {
            data.expandedPaths = this.expandedPaths;
        }

        return data;
    }

    /**
     * Deserialize the json data into this object.
     */
    deserialize(data: any): void {
        if (!data) {
            return;
        }

        this._expandedPaths = new Map<string, string[]>();
        if (data.allExpanded) {
            this.allExpanded = data.allExpanded;
        } else if (isArray(data.expandedPaths)) {
            this.expandedPaths = data.expandedPaths as string[][];
            // If we have expanded paths, then set the allExpanded flag to false
            // We want to avoid expandedPaths being ignored if a widget has allExpanded = true by default
            this.allExpanded = false;
        }
    }

    /**
     * Updates the item in the list of expanded paths.
     */
    updateItem(path: string[], expanded: boolean) {
        const key: string = this.getPathKey(path);

        // If expand all is set and a node is being expanded, just ignore as it doesn't have an effect.
        if (this.allExpanded && expanded) {
            return;
        }

        // Either add or remove the item based on the expanded value.
        if (expanded) {
            this._expandedPaths.set(key, path);
        } else {
            this._expandedPaths.delete(key);
        }
    }

    /**
     * Updates the item in the list of expanded paths.
     */
    reset(paths: string[][]) {
        this._expandedPaths.clear();
        this.expandedPaths = paths;
    }

    /**
     * Checks if the node is expanded or not.
     */
    isExpanded(path: string[]): boolean {
        // If all are expanded then just return true.
        if (this.allExpanded) {
            return true;
        }

        // Get the key and check if it is in the map.
        const key: string = this.getPathKey(path);
        return this._expandedPaths.has(key);
    }

    /**
     * Clears the paths that are expanded.
     */
    clearPaths(): void {
        this._expandedPaths.clear();
    }

    /**
     * Checks if the objects are equal.
     */
    equals(widgetInput: WidgetInput): boolean {
        if (!(widgetInput instanceof ExpandedState)) {
            return false;
        }

        const other = widgetInput;

        if (this.allExpanded !== other.allExpanded) {
            return false;
        }
        return isEqual(this.expandedPaths, other.expandedPaths);
    }

    /**
     * Gets the key for this path.
     */
    getPathKey(path: string[]): string {
        return path.join('_slash_');
    }
}
