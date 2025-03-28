module.exports = {
  packages: {
    '@blk/maps-lib': {
      ignorableDeepImportMatchers: [
        /highcharts/,
        /aladdin-graph-everything/,
        /oa-protos-javascript/
      ]
    },
    '@blk/scenario-narrator': {
      ignorableDeepImportMatchers: [
        /highcharts/,
        /aladdin-graph-everything/
      ]
    },
    '@blk/als-half-wheel': {
      ignorableDeepImportMatchers: [
        /highcharts/
      ]
    },
    '@qbstr/highcharts': {
      ignorableDeepImportMatchers: [
        /highcharts/
      ]
    },
    '@blk/aladdin-angular-components': {
      ignorableDeepImportMatchers: [
        /lodash/,
        /aladdin-web-components/
      ]
    },
    '@blk/aladdin-frontend-telemetry': {
      ignorableDeepImportMatchers: [
        /lodash/,
        /aladdin-graph-everything/,
        /google-protobuf/
      ]
    }
  }
};
