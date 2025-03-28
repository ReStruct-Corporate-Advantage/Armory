import {
    AbstractColumnOption,
    ColumnConfig,
    ColumnOptionValidatorInterface,
    CoreColumnUtils,
    ExploreInputValidationInfo,
    NotificationType,
    SerializeFavoriteType
} from '@blk/explore-ui-core';
import {isFunction, isNil, isObject, isString, isUndefined, mapValues} from 'lodash';
import {CustomCalculationConstants} from '../../constants';

/**
 * Model for the Custom Calculation column option.
 */
export class CustomCalculationColumnOption extends AbstractColumnOption implements ColumnOptionValidatorInterface {
    static CONFIG_TYPE = 'customCalculation';

    expression;
    measureMapping: Record<string, ColumnConfig>;

    /**
     * Constructor
     */
    constructor(data?: any) {
        super();
        this.initialize();
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * Initialises the column with the default settings.
     */
    initialize(defaultSettings?: any): void {
        this.expression = '';
        this.measureMapping = {};
    }

    /**
     * Gets the type of the config object.
     */
    get configType(): string {
        return CustomCalculationColumnOption.CONFIG_TYPE;
    }

    /**
     * Add required request param to Options values.
     */
    protected doAddRequestParams(requestParams: any): void {
        requestParams['customCalculation'] = {
            expression: this.expression,
            aliasDependencyMap: mapValues(this.measureMapping, value => value.createRequestColumn())
        };
    }

    /**
     * Deserialize the data into this object.
     */
    deserialize(data: any): void {
        if (!data) {
            return;
        }

        this.expression = data.expression;
        this.measureMapping = mapValues(data.measures, value => {
            const col =  new ColumnConfig(isString(value) ? JSON.parse(value) : value);

            // Whenever we deserialize this custom calc, we will generate new column keys for each custom calc measure,
            // this is so that if the same custom calc is used twice in a column set, the measures will have different keys
            col.columnKey = ColumnConfig.generateColumnKey(col.columnTag);
            return col;
        });
    }

    /**
     * This function is used to serialize the implementation favorite.
     */
    doSerialize(_isNested?: boolean | SerializeFavoriteType): any {
        return {
            expression: this.expression,
            measures: mapValues(this.measureMapping, value => {
                const serializedMeasure = isFunction(value.serialize) ? value.serialize() : value;
                // Remove columnKey from each custom calc measure when saving/serializing because we want these to be randomly generated each time (see deserialize() above)
                // Note: when creating widget data request, we will include columnKey (see doAddRequestParams() above)
                delete serializedMeasure.columnKey;
                return serializedMeasure;
            })
        };
    }

    /**
     * Validate column Option inputs
     */
    isValidColumnOption(): ExploreInputValidationInfo | undefined {
        // To support old Favorites which have abs() in expression, replace abs() with Math.abs().
        const expressionString: string = this.expression.trim().replace(new RegExp('(math\\s*\\.\\s*abs\\s*\\()|(\\babs\\s*\\()', 'i'), 'Math.abs(');

        // Validating against reserved keyword.
        // Regex says: "Match whole specified words unless they are part of the comments"
        // The search pattern explanation (if all conditions are true then it means the regex found the match) :
        // ^ - from beginning of the line
        // (\s*|\t*)\/\/) - find comments preceded by zero or more spaces or tabs, and negate it (that is ignore comments)
        // .* - then find zero or more characters
        // ( - then specify two sub-groups to match either
        // \b(alert|document|..)\b - 1st sub-group - find any of the exact specified words
        // | - sub-group separator
        // \b(T\s*\() - 2nd sub-group - find any T followed by bracket with zero or more spaces in between
        // ) - close the two sub-groups specification
        // .* - then find zero or more characters
        // $ - up to the find end of line
        // /mi - multi-line case insensitive search
        const regexp: RegExp = new RegExp('^(?!(\\s*|\\t*)\\/\\/).*(\\b(alert|document|confirm|prompt|console|for|forEach|while|window|system|java\\.type)\\b|\\b(T\\s*\\()).*$', 'mi');

        if (regexp.test(expressionString)) {
            return new ExploreInputValidationInfo(NotificationType.ERROR, CustomCalculationConstants.INVALID_JS_EXPRESSION_MESSAGE);
        }

        // Here we are compiling Expression to validate syntactical error in expression.
        try {
            let expressionToValidate = '';
            const undefinedColumnTags: string[] = [];
            for (const [key, value] of Object.entries(this.measureMapping)) {
                expressionToValidate = expressionToValidate.concat('var ').concat(key);
                if (value) {
                    const def = CoreColumnUtils.getColumnDefByTagAndUse(value.columnTag, value.positionColumnType);
                    if (!isNil(def)) {
                        expressionToValidate = expressionToValidate.concat(def.dataType === 'DOUBLE' ? '=0;' : '="";');} 
                        else {
                            undefinedColumnTags.push(value.columnTag);
                        }
                    
                }
                
            }
            if (undefinedColumnTags.length > 0) {
                console.warn('Undefined column tags:', undefinedColumnTags);
                return new ExploreInputValidationInfo(NotificationType.ERROR, `You do not have permission on column measures used within this custom calculation. For help, contact Client Services and provide column tag(s) '${undefinedColumnTags.join("', '")}'.`);
            }
            
            new Function(expressionToValidate.concat(expressionString))();
        } catch (e) {
            console.error(e);
            return new ExploreInputValidationInfo(NotificationType.ERROR, 'Custom Calculation Expression Error: ' + e.message);
        }
        return undefined;
    }

    /**
     * Equals method implementation to compare with other column option@param otherColOption
     */
    equals(otherColOption: AbstractColumnOption): boolean {
        if (!(otherColOption instanceof CustomCalculationColumnOption)) {
            return false;
        }

        if (this.expression !== otherColOption.expression) {
            return false;
        }

        if (this.measureMapping.size !== otherColOption.measureMapping.size) {
            return false;
        }

        for (const [key, val] of Object.entries(this.measureMapping)) {
            const otherMeasureMappingValue = otherColOption.measureMapping[key];
            if (!otherMeasureMappingValue || !otherMeasureMappingValue.equals(val)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Check if the column option is valid
     */
    isValid(): boolean {
        return isUndefined(this.isValidColumnOption());
    }
}
