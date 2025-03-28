/**
 * Generic solution to handle the legacyWidgetInputConfigTypes (old favorite handling) with backward compatibility during the deserialization process
 *
 * To handle the legacyWidgetInputConfigTypes, the new model   MUST   have a static function `deserializeLegacyWidgetInput`
 * Check `deserializeLegacyWidgetInput` in AxisSettings and WidgetDataStoreMetaData for the implementation example.
 *
 * @author seakim
 */
export const legacyWidgetInputConfigTypes = {
    OVERRIDE_AXIS_TITLE: 'overrideAxisTitle'
};
