const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  plugins: [
    new webpack.ProvidePlugin({
      L: 'leaflet',
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'node_modules/leaflet-control-geocoder/dist/Control.Geocoder.css',
          to: 'assets/leaflet-control-geocoder/Control.Geocoder.css',
        },
      ],
    }),
  ],
};
