"use strict";
var Joi = require('joi');

var RoutesController = require('./controllers/routes');

var internals = {};

module.exports.setup = function (settings) {
  var endpointUrl = settings.endpointUrl === '/' ? '' : settings.endpointUrl;
  var templatesPath = settings.templatesPath;

  return [
    { method: 'GET', path: endpointUrl + '/api/routes',
      config: {
        auth: settings.auth,
        handler: RoutesController.list,
        plugins: {
          "hapi-docs": false
        }
      }
    },
    { method: 'GET', path: endpointUrl + '/api/routes/{path}',
      config: {
        auth: settings.auth,
        handler: RoutesController.get,
        plugins: {
          "hapi-docs": false
        }
      }
    },
    { method: 'GET', path: endpointUrl + '/{path*}',
      config: {
        auth: settings.auth,
        handler: {
          directory: {
            path: templatesPath
          }
        },
        plugins: {
          "hapi-docs": false
        }
      }
    }
  ];
};