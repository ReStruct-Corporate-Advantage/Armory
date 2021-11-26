class StyleAggregator {
    static aggregateStyles (styleArray) {
        return styleArray && styleArray.reduce((agg, styleProps) => {
            Object.keys(styleProps).forEach(styleKey => styleProps[styleKey] && (agg[styleKey] = styleProps[styleKey]));
            return agg;
        }, {})
    }
}

export default StyleAggregator;