import {FavoriteConstants} from '@constants/favorite.constants';
import {WidgetDataStore} from '../dataStore/widget-data-store.model';
import {cloneDeep, isEmpty, isNil, isNumber, isUndefined} from 'lodash';
import {
    AbstractConfig,
    ColumnState,
    CommonUtils,
    ConfigTypeFactory, CoreFavoriteUtils,
    CoreWidgetConfigStore,
    DateValue,
    isWidgetInput,
    isWidgetTitleModifiable,
    SerializeFavoriteType,
    WidgetConfig,
    WidgetConfigInput,
    WidgetConfigType,
    WidgetInput,
    WidgetInputType
} from '@blk/explore-ui-core';
import {AppUtils} from '@utils/app.utils';
import {WidgetConfigFactory} from '../../factories';
import {WidgetDimensions} from '@interfaces/widget-dimensions.interface';
import {ColumnSet} from '@blk/explore-ui-column-option';
import {URLConstants} from '@constants/url.constants';
import {ChartUtils} from '@utils/chart.utils';
import {PgsChartInputs} from '@models/pgs-chart-inputs.model';
import {FilterExcludeKey, GroupByKey} from '@qbstr/data-cube';
import {TabularWidgetConstants} from '@constants/tabular-widget.constants';
import {ROOT_LEVEL} from '@utils/qbstr';

/**
 * Base class for widgets
 */
export class Widget extends AbstractConfig {

    private static readonly OLD_INPUTS_TO_REMOVE = [FavoriteConstants.FILTER_LOWER];
    private static readonly OLD_INPUTS_TO_IGNORE = ['columnWidths'];

    isNewlySaved: boolean;

    // Data store associated with the widget
    dataStore: WidgetDataStore;

    // inputs that are needed for getting the correct display of data for a widget.. The key of the map is the input name as appears in the widgets.json and the value is the input itself
    displayInputs: Map<string, WidgetInput> = new Map<string, WidgetInput>();

    // Unique widget id
    id: number;

    // Sizing and positioning of the widget
    dimensions: WidgetDimensions;

    // Flag signaling if the widget is maximized
    isMaximized = false;

    // Settings containing original widget layout when not maximized
    originalDimensions?: WidgetDimensions;

    // Widget Inputs as read from config file
    widgetConfigInputs: WidgetConfigInput[];

    // Widget title
    title: string;

    // Default Title that is shown on the widget header.. this is mostly same as title but can be different if the widget has inputs that implement WidgetTitleModifiable and add few details about widget inputs o the title
    displayTitle: string;

    // Check if showSettings;
    showSettings = true;

    // portfolios in querykeys for PGS chart widget
    pgsChartPortfolio: string;

    pgsChartInputs: PgsChartInputs;

    // Current config type of the widget
    private _configType: WidgetConfigType;

    /**
     * constructor
     */
    constructor(configType?: WidgetConfigType, data?: any, dataStore?: any) {
        super();

        // Assign a widget id
        this.id = CommonUtils.generateUniqueIdAsNumber();
        // set isMaximized to true if we have maximizeWidgets set to true in url
        if (AppUtils.getURLParamWithDefault(URLConstants.MAXIMIZE_WIDGETS, false) === 'true') {
           this.isMaximized = true;
        }

        // Assign a config type
        if (configType) {
            this._configType = configType;
        } else if (AppUtils.isObject(data)) {
            this._configType = data.configType;
        }

        // Assign a data store
        if (AppUtils.isObject(dataStore)) {
            this.dataStore = dataStore;
        } else {
            this.dataStore = new WidgetDataStore();
        }

        if (!this.configType) {
            return;
        }

        this.updateWidgetInputs(data);
    }

    /**
     *  holds the logic of updating the widget inputs
     */
    public updateWidgetInputs(data: any) {
        this.widgetConfigInputs = WidgetConfigFactory.getInputsForWidgetConfigType(this.configType);
        const widgetConfig: WidgetConfig = CoreWidgetConfigStore.getChartConfigForType(this.configType);
        this.title = widgetConfig.title;
        this.displayTitle = this.title;

        // set initial size of widget based on config, x and y will be assigned automatically
        this.dimensions = {
            cols: widgetConfig.size.sizeX,
            rows: widgetConfig.size.sizeY,
            x: null,
            y: null
        };

        // Assign inputs
        if (AppUtils.isObject(data)) {
            this.deserialize(data);
        } else {
            this.initializeInputs();
        }
    }

    /**
     * Get the config type for the widget
     */
    get configType(): WidgetConfigType {
        return this._configType;
    }

    /**
     * Set the config type of the widget. This method also takes care of initializing any inputs associated with the new config type being assigned that widget doesn't contain
     */
    set configType(value: WidgetConfigType) {
        if (isUndefined(this._configType)) {
            this._configType = value;
            return;
        }
        this._configType = value;
        // Not since we are assigning a new config type we need to initialize any new inputs needed for this new config types
        this.initializeInputs(true);
    }

    /**
     * Initialize all inputs corresponding to the widget config type
     * @param initializeIfInputNotPresent - if true then an input is only initialized if not already present
     */
    initializeInputs(initializeIfInputNotPresent?: boolean) {
        if (!this.widgetConfigInputs) {
            return;
        }
        // set all widget inputs to their default value
        this.widgetConfigInputs
            .filter(widgetConfigInput => !widgetConfigInput.isSharedInputName)
            .forEach((widgetConfigInput: WidgetConfigInput) => {
                // If the flag initializeIfInputNotPresent is true then then an input is only initialized if not already present
                if (initializeIfInputNotPresent) {
                    // If displayInputs already has the inputName from the favorite, do not override.
                    if (this.displayInputs.has(widgetConfigInput.inputName)) {
                        return;
                    }

                    // Get the input from the data store and ensure that the input is in the correct place.
                    // For the ExpandedState on a returns widget the old Explore favorites had this in the data store where it should be in display.
                    const input = this.dataStore.metaData.inputs.get(widgetConfigInput.inputName);
                    if (input) {
                        if (!input.isDataStoreInput()) {
                            // Move it to the display inputs.
                            this.displayInputs.set(widgetConfigInput.inputName, input);
                            this.dataStore.metaData.inputs.delete(widgetConfigInput.inputName);
                        }
                        return;
                    }
                }

            // Create the default input for this item.
            const widgetInput = ConfigTypeFactory.createConfig(widgetConfigInput.default, widgetConfigInput.inputConfigType, false);

            if (!(isWidgetInput(widgetInput))) {
                console.error(`Invalid widget input "configType: ${widgetConfigInput.inputConfigType}"`);
                return;
            }

            // If the input is part of data store meta data then set it up in data store otherwise directly in the widget
            if (widgetInput.isDataStoreInput()) {
                this.dataStore.metaData.inputs.set(widgetConfigInput.inputName, widgetInput);
            } else {
                this.displayInputs.set(widgetConfigInput.inputName, widgetInput);
            }
        });
    }

    /**
     * Serialize the widget
     */
    serialize(isNested?: boolean | SerializeFavoriteType): any {
        const widget: any = {};
        widget.configType = this.configType;
        widget.title = this.title;

        if (!CoreFavoriteUtils.isFavoriteChangeDetection(isNested)) {
            // don't include widget ID when trying to detect favorite changes as some legacy favorites did not contain
            // so it is randomly generated each time
            widget.id = this.id;
        }

        // Note: gridster2 uses different sizing/positioning properties from gridster1 in old Explore UI
        // when serializing to JSON we will use the old property names for compatibility with old Explore UI
        widget.sizeX = this.dimensions.cols;
        widget.sizeY = this.dimensions.rows;
        widget.col = this.dimensions.x;
        widget.row = this.dimensions.y;

        widget.displayInputs = {};
        this.displayInputs.forEach((val: WidgetInput, key: string) => {
            const widgetInputConfig = WidgetConfigFactory.getInputsForWidgetConfigByName(this.configType, key);
            // Only save inputs which are associated with the present config type of the widget
            if (!widgetInputConfig) {
                return;
            }
            widget.displayInputs[key] = val.serialize(isNested);
        });
        widget.dataStore = this.dataStore.name;
        if (ChartUtils.isPGSSpritletWidget(this.configType)) {
            widget.pgsChartPortfolio = this.pgsChartPortfolio;
            widget.pgsChartInputs = {};
            widget.pgsChartInputs.actionKey = this.pgsChartInputs?.actionKey;
            widget.pgsChartInputs.level = this.pgsChartInputs?.level;
            if (!isEmpty(this.pgsChartInputs?.portHierarchy)) {
                widget.pgsChartInputs.portHierarchy = this.pgsChartInputs.portHierarchy;
            }
        }

        return widget;
    }

    /**
     * Deserialize the widget
     */
    deserialize(data: any): void {
        // HACK:  Because there are reports created with the additional size we need to undo the
        //        size adjustment we made.
        //
        //        These are only for the old favorites that are saved in doubled size.

        // This is a one time fix related to JIRA PM-9768. In order to provide backward compatibility for the widgets in reports already saved
        // we need to scale them down (halve them) since gridster cols has changed.
        if (data.oneTimeFixForGridResizeDone) {
            data.sizeX = data.sizeX / 2;
            data.sizeY = data.sizeY / 2;
            data.row = data.row / 2;
            data.col = data.col / 2;
        }

        // HACK:  FBA widget from old explore favorite with infoOpen(showFootnoteChecked) does not have sizeY, and therefore the widget height become 0.
        if (!data.sizeY) {
            data.sizeY = data.infoOpen ? 12 : 6;
        }

        this.title = data.title ? data.title : data.type;
        if (this.configType !== data.configType) {
            this.configType = data.configType;
        }
        if (!this.widgetConfigInputs) {
            this.widgetConfigInputs = WidgetConfigFactory.getInputsForWidgetConfigType(this.configType);
        }

        // TODO: do we need to serialize/deserialize the id?
        if (isNumber(data.id)) {
            this.id = data.id;
        }

        // Note: gridster2 uses different sizing/positioning properties from gridster1 in old Explore UI
        // when deserializing, we expect the JSON to be in the old format and assign the fields to their updated variants
        this.dimensions = {
            cols: data.sizeX,
            rows: data.sizeY,
            x: data.col,
            y: data.row
        };

        if (data.pgsChartPortfolio) {
            this.pgsChartPortfolio = data.pgsChartPortfolio;
        }

        this.pgsChartInputs = new PgsChartInputs();
        if (!isNil(data.pgsChartInputs?.level)) {
            this.pgsChartInputs.level = data.pgsChartInputs.level;
        } else if (ChartUtils.isPGSGraphingSpritelet(this.configType)) {
            this.pgsChartInputs.level = 0;
        }

        if (!isEmpty(data.pgsChartInputs?.actionKey)) {
            this.pgsChartInputs.actionKey = data.pgsChartInputs.actionKey;
        } else {
            // derive action key for PGS chart widget of legacy workspaces
            this.setPgsActionKey();
        }

        if (!isEmpty(data.pgsChartInputs?.portHierarchy)) {
            this.pgsChartInputs.portHierarchy = data.pgsChartInputs.portHierarchy;
        }

        this.deserializeInputs(data);
    }

    /**
     * Deserialize all the inputs saved in data
     */
    private deserializeInputs(data: any): void {
        const isOldStyleFav = !data.displayInputs;
        if (isOldStyleFav) {
            // Remove the properties no longer needed.
            this.removeOldProps(Widget.OLD_INPUTS_TO_REMOVE, data);

            const widgetConfigInputs = WidgetConfigFactory.getInputsForWidgetConfigType(this.configType);
            this.modifyMetaDataInputs(this.dataStore.metaData.inputs, widgetConfigInputs);
            widgetConfigInputs.forEach((widgetConfigInput: WidgetConfigInput) => {
                if (!widgetConfigInput.oldProps) {
                    return;
                }
                const oldProps = {};
                widgetConfigInput.oldProps.forEach((prop: string) => oldProps[prop] = data[prop]);
                const widgetInput = ConfigTypeFactory.createConfig(oldProps, widgetConfigInput.inputConfigType, false);
                if (!isWidgetInput(widgetInput)) {
                    return;
                }
                if (widgetInput.isDataStoreInput()) {
                    this.dataStore.metaData.inputs.set(widgetConfigInput.inputName, widgetInput);
                } else {
                    this.displayInputs.set(widgetConfigInput.inputName, widgetInput);
                }
            });
        }

        const inputs = data.inputs ? data.inputs : data.displayInputs;
        if (!isUndefined(inputs)) {
            Object.keys(inputs).forEach((key: string) => {
                let val = inputs[key];
                // Skip null values.
                if (isNil(val) || Widget.OLD_INPUTS_TO_IGNORE.indexOf(key) >= 0) {
                    return;
                }

                const widgetInputConfig = WidgetConfigFactory.getInputsForWidgetConfigByName(this.configType, key);
                if (!widgetInputConfig) {
                    console.error(`Cannot find "${key}" from "configType: ${this.configType}"`);
                    return;
                }

                // If the value has a nested data object then use that.
                // There is a flag in the widgetInput that will ignore this check.
                if (!widgetInputConfig.ignoreNestedDataObject && val.data) {
                    val = val.data;
                }

                const widgetInput = ConfigTypeFactory.createConfig(val, widgetInputConfig.inputConfigType, false);
                if (!isWidgetInput(widgetInput)) {
                    console.error(`Invalid widget input "${key}" from "configType: ${this.configType}"`);
                    return;
                }

                if (widgetInput.isDataStoreInput()) {
                    this.dataStore.metaData.inputs.set(widgetInputConfig.inputName, widgetInput);
                } else {
                    this.displayInputs.set(widgetInputConfig.inputName, widgetInput);
                }
            });
        }

        this.initializeInputs(true);

        // For column widths we need to process them into the existing columnSet object.
        if (isOldStyleFav) {
            this.deserializeLegacyColumnWidths(data);
        }
    }

    /**
     * In the new Explore, some props are changed and no longer used
     *
     * Examples:
     *  data.inputs.columnWidths exists in every charts => do not need them
     *  and in table widgets => saving data in ColumnState (displayInputs.columnState) before removing it
     */
    private removeOldProps(propNames: string[], data: any): void {
        if (!data.inputs) {
            return;
        }

        // remove the properties if they exist.
        propNames.forEach((propName) => {
            if (data.inputs[propName]) {
                delete data.inputs[propName];
            }
        });
    }

    /**
     * Compares two widgets for equality
     */
    equals(widget: Widget): boolean {
        if (this.configType !== widget.configType) {
            return false;
        }
        if (this.title !== widget.title) {
            return false;
        }
        if (this.id !== widget.id) {
            return false;
        }
        Object.entries(this.dimensions).forEach(([key, value]) => {
            // compare each dimension value
            if (value !== widget.dimensions[key]) {
                return false;
            }
        });
        if (this.isMaximized !== widget.isMaximized) {
            return false;
        }
        if (!this.dataStore.equals(widget.dataStore)) {
            return false;
        }
        // Compare widget inputs
        if (this.displayInputs.size !== widget.displayInputs.size) {
            return false;
        }
        let areAllInputsEqual = true;
        this.displayInputs.forEach((value: WidgetInput, key: string) => {
            if (!value.equals(widget.displayInputs.get(key))) {
                areAllInputsEqual = false;
            }
        });
        return areAllInputsEqual;
    }

    /**
     * Combines inputs within data store of the widget and the display inputs and returns them in a map
     */
    getCombinedInputs(): Map<string, WidgetInput> {
        const inputs = new Map<string, WidgetInput>();
        this.dataStore.metaData.inputs.forEach((val: WidgetInput, key: string) => {
            inputs.set(key, val);
        });
        this.displayInputs.forEach((val: WidgetInput, key: string) => {
            inputs.set(key, val);
        });
        return inputs;
    }

    /**
     * Set widget display title based on widget inputs that implement WidgetTitleModifiable
     */
    setDisplayTitle(portfolioDatePicker: DateValue) {
        this.displayTitle = this.title;
        const inputs = this.getCombinedInputs();
        let details = '';
        const settingsThatCanModifyWidgetTitle = WidgetConfigFactory.getSettingsThatCanModifyWidgetTitle(this.configType);
        settingsThatCanModifyWidgetTitle.forEach((inputName: string) => {
            const input: WidgetInput = inputs.get(inputName);
            if (isWidgetTitleModifiable(input)) {
                details = details + input.getModifiedWidgetTitleDetails(portfolioDatePicker);
            }
        });
        if (!isEmpty(details)) {
            this.displayTitle = this.displayTitle + ' - ' + details;
        }
    }

    /**
     * Modify metaData inputs to be inline with widgetConfigInputName
     * Helpful in case of exporting old fav into new one
     */
    modifyMetaDataInputs(inputs: Map<string, WidgetInput>, widgetConfigInputs: WidgetConfigInput[]) {
        const inputsCopy = cloneDeep(inputs);
        inputsCopy.forEach((input: WidgetInput, key: string) => {
            const matchedConfig = widgetConfigInputs.find(widgetConfigInput => (widgetConfigInput.otherNames && widgetConfigInput.otherNames.includes(key) || widgetConfigInput.inputName === key));
            // If matchedConfig inputName is different with inputs key replace it with correct matchedConfigKey
            // For instance in customFilter, old-explore fav will have 'customFilter' as key whereas in widgetConfigInput we'll have 'filter' as inputName
            // Get the matchedConfig and replace old-explore key with widgetConfigInput inputName
            if (matchedConfig && matchedConfig.inputName !== key) {
                inputs.delete(key);
                inputs.set(matchedConfig.inputName, input);
            }
        });
    }

    /**
     * Add the column widths from the legacy favorite structure.
     */
    deserializeLegacyColumnWidths(data: any): void {
        // Check if the inputs has a columnState.
        const columnState = this.getColumnState();

        // If we found a column state object the apply the widths to it.
        if (columnState) {
            columnState.addLegacyColumnWidths(data);
        }
    }

    /**
     * Gets the column state object for the widget.
     */
    getColumnState(): ColumnState {
        // Check if the inputs has a columnState.
        let columnState = this.getCombinedInputs().get(ColumnState.CONFIG_TYPE) as ColumnState;

        // if no columnState try and get the columns to put the column widths onto.
        if (isNil(columnState)) {
            const columnSet = this.getCombinedInputs().get(WidgetInputType.COLUMNS) as ColumnSet;
            if (columnSet) {
                columnState = columnSet.columnState;
            }
        }

        return columnState;
    }

    /**
     * Set the action key for PGS chart widget of legacy workspaces
     */
    setPgsActionKey(): void {
        if (ChartUtils.isPGSGraphingSpritelet(this.configType)) {
            const isFilterExclude = !isNil(this.dataStore?.data?.customVizConfig?.queryKeys.find(key => key instanceof FilterExcludeKey));
            if (this.configType === WidgetConfigType.PGS_BAR) {
                const isGroupByRoot = !isNil(this.dataStore?.data?.customVizConfig?.queryKeys.find(key => key instanceof GroupByKey && key.field === ROOT_LEVEL));
                this.pgsChartInputs.actionKey = isFilterExclude || isGroupByRoot ? TabularWidgetConstants.PGS_LEAF_BAR_CHART_SPRITELET.ACTION_KEY : TabularWidgetConstants.PGS_BAR_CHART_SPRITELET.ACTION_KEY;
            } else if (this.configType === WidgetConfigType.PGS_TS) {
                this.pgsChartInputs.actionKey = isFilterExclude ? TabularWidgetConstants.PGS_TS_LEAF_CHART_SPRITELET.ACTION_KEY : TabularWidgetConstants.PGS_TS_CHART_SPRITELET.ACTION_KEY;
            }
        }
    }
}
