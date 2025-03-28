import { ClimateDamageFunctionsColumnOption } from './climate-damage-functions-column-option.model'

export class TransitionClimateContributorsColumnOption extends ClimateDamageFunctionsColumnOption {
    public static CONFIG_TYPE = 'tcavContributorsOptions';

     /**
     * Gets the type of the config object.
     */
      get configType(): string {
        return TransitionClimateContributorsColumnOption.CONFIG_TYPE;
    }

}
