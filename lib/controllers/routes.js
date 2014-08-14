var _ = require('lodash')
  , Joi = require('joi')
  , Util = require('util');

var internals = {};

internals.describe = function (params) {
  if (params == null || typeof params !== 'object') {
    return null;
  }
  var description = Joi.compile(params).describe();
  return internals.getParamsData(description);
};

internals.buildExample = function (param, name, value) {

  name = name || '';

  if (!value) {
    if (param.type === 'object') {
      value = {};
    }
    if (param.type === 'array') {
      value = [];
    }
  }

  if (name) {
    var defValue;
    switch (param.type) {
      case 'string':
        defValue = "";
        break;
      case 'number':
        defValue = 1;
        break;
      case 'array':
        defValue = [];
        break;
      case 'null':
        defValue = null;
        break;
      case 'boolean':
        defValue = false;
        break;
      case 'date':
        defValue = new Date()
        break;
    }
    value[name] = defValue;
  }


  if (param.children && param.children.length > 0) {
    _.forEach(_.keys(param.children), function (key) {
      value = internals.buildExample(param.children[key], param.children[key].name, value);
    });
  }

  return value;

};

internals.getParamsData = function (param, name) {

  // Detection of "false" as validation rule
  if (!name && param.type === 'object' && param.children && Object.keys(param.children).length === 0) {

    return {
      isDenied: true
    };
  }

  // Detection of conditional alternatives
  if (param.ref && param.is) {

    return {
      condition: {
        key: param.ref.substr(4), // removes 'ref:'
        value: internals.getParamsData(param.is)
      },
      then: param.then,
      otherwise: param.otherwise
    };
  }

  var type;
  if (Array.isArray(param)) {
    type = 'alternatives';
  } else if (param.valids && param.valids.some(Joi.isRef)) {
    type = 'reference';
  } else {
    type = param.type;
  }

  var data = {
    name: name,
    description: param.description,
    notes: param.notes,
    tags: param.tags,
    meta: param.meta,
    unit: param.unit,
    type: type,
    allowedValues: type !== 'reference' && param.valids ? internals.getExistsValues(param.valids) : null,
    disallowedValues: type !== 'reference' && param.invalids ? internals.getExistsValues(param.invalids) : null,
    examples: param.examples,
    peers: param.dependencies && param.dependencies.map(internals.formatPeers),
    target: type === 'reference' ? internals.getExistsValues(param.valids) : null,
    flags: param.flags && {
      allowUnknown: 'allowUnknown' in param.flags && param.flags.allowUnknown.toString(),
      default: param.flags.default,
      encoding: param.flags.encoding, // binary specific
      insensitive: param.flags.insensitive, // string specific
      required: param.flags.presence === 'required'
    }
  };

  if (data.type === 'object' && param.children) {

    var childrenKeys = Object.keys(param.children);
    data.children = childrenKeys.map(function (key) {

      return internals.getParamsData(param.children[key], key);
    });
  } else if (['array', 'binary', 'date', 'object', 'string'].indexOf(data.type) !== -1) {

    data.rules = {};
    if (param.rules) {

      param.rules.forEach(function (rule) {

        data.rules[internals.capitalize(rule.name)] = internals.processRuleArgument(rule);
      });
    }

    ['includes', 'excludes'].forEach(function (rule) {

      if (param[rule]) {

        data.rules[internals.capitalize(rule)] = param[rule].map(function (type) {

          return internals.getParamsData(type);
        });
      }
    });
  } else if (data.type === 'alternatives') {

    data.alternatives = param.map(function (alternative) {

      return internals.getParamsData(alternative);
    });
  }

  return data;
};

internals.getExistsValues = function (exists) {

  var values = exists.filter(function (value) {
    return !(typeof value === 'string' && value.length === 0);
  }).map(function (value) {
    if (Joi.isRef(value))
      return (value.isContext ? '$' : '') + value.key;
    return value;
  });

  return values.length ? values : null;
};

internals.capitalize = function (string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

internals.formatPeers = function (condition) {
  if (condition.key) {
    return 'Requires ' + condition.peers.join(', ') + ' to ' + (condition.type === 'with' ? '' : 'not ') +
      'be present when ' + condition.key + ' is.';
  } else {
    return 'Requires ' + condition.peers.join(' ' + condition.type + ' ') + '.';
  }
};

internals.processRuleArgument = function (rule) {
  var arg = rule.arg;
  if (rule.name === 'assert') {
    return {
      key: (arg.ref.isContext ? '$' : '') + arg.ref.key,
      value: internals.describe(arg.cast)
    };
  } else {
    return arg;
  }
};


exports.list = function (request, reply) {
  var routes = [];
  _.forEach(request.server.table(), function (route) {
    if (route.settings.plugins['hapi-docs'] !== false && route.method !== 'options') {

      var routeMetaData = {
        method: route.method.toUpperCase(),
        path: route.path.toLowerCase(),
        description: route.settings.description,
        notes: route.settings.notes,
        tags: route.settings.tags,
        auth: route.settings.auth,
        vhost: route.settings.vhost,
        cors: 'cors' in route.settings ? route.settings.cors.toString() : null,
        jsonp: route.settings.jsonp,
        pathParams: internals.describe(route.settings.validate.params),
        queryParams: internals.describe(route.settings.validate.query),
        payloadParams: internals.describe(route.settings.validate.payload),
        responseParams: internals.describe(route.settings.response && route.settings.response.schema)
      };

      if (routeMetaData.payloadParams && !routeMetaData.payloadParams.examples)
        routeMetaData.payloadParams.examples = [internals.buildExample(routeMetaData.payloadParams)];

      if (routeMetaData.responseParams && !routeMetaData.responseParams.examples)
        routeMetaData.responseParams.examples = [internals.buildExample(routeMetaData.responseParams)];

      routes.push(routeMetaData);
    }
  });
  return reply(routes);
};

exports.get = function (request, reply) {
  var routes = request.server.table();
  return reply(routes);
};