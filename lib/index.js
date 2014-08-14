"use strict";

var Path = require('path')
  , Joi = require('joi')
  , _ = require('lodash')
  , Router = require('./router');

var internals = {
  defaults: {
    endpointUrl: '/docs',
    auth: false,
    templatesPath: Path.join(__dirname, '../', 'templates'),
    cssPath: Path.join(__dirname, '../', 'templates', 'css')
  }
};

exports.register = function (plugin, options, next) {
  var settings = _.clone(internals.defaults);
  settings = _.merge(settings, options);
  plugin.route(Router.setup(settings));
  next();
};

exports.register.attributes = {
  pkg: require('../package.json')
};

