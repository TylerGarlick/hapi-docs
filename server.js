var Hapi = require('hapi')
  , Joi = require('joi');

var port = process.env.PORT || 1337;
var server = new Hapi.Server(port);

var handler = function (request) {
  request.reply('ok');
};

server.route([
  { method: 'POST', path: '/bogus/{name}',
    config: {
      validate: {
        params: {
          name: Joi.string().lowercase().required()
        },
        query: {
          blah: Joi.string()
        },
        payload: Joi.object({
          magic: Joi.string()
        })
      },
      response: {
        schema: Joi.object({
          hello: Joi.string().required(),
          world: Joi.number().min(0).max(10)
        }).example({
          hello: 'world',
          world: 1
        })
      },

      handler: function (request, reply) {
        reply({});
      }
    }
  },
  {
    method: 'GET',
    path: '/test',
    config: {
      handler: handler,
      validate: {
        query: {
          param1: Joi.string().insensitive().required()
        }
      },
      tags: ['admin', 'api'],
      description: 'Test GET',
      notes: 'test note'
    }
  },
  {
    method: 'GET',
    path: '/another/test',
    config: {
      handler: handler,
      validate: {
        query: {
          param1: Joi.string().required()
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/zanother/test',
    config: {
      handler: handler,
      validate: {
        query: {
          param1: Joi.string().required()
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/test',
    config: {
      handler: handler,
      validate: {
        query: {
          param2: Joi.string().valid('first', 'last')
        }
      }
    }
  },
  {
    method: 'DELETE',
    path: '/test',
    config: {
      handler: handler,
      validate: {
        query: {
          param2: Joi.string().valid('first', 'last')
        }
      }
    }
  },
  {
    method: 'PUT',
    path: '/test',
    config: {
      handler: handler,
      validate: {
        query: {
          param2: Joi.string().valid('first', 'last')
        }
      }
    }
  },
  {
    method: 'HEAD',
    path: '/test',
    config: {
      handler: handler,
      validate: {
        query: {
          param2: Joi.string().valid('first', 'last'),
          param3: Joi.number().valid(42)
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/notincluded',
    config: {
      handler: handler,
      plugins: {
        lout: false
      }
    }
  },
  {
    method: 'GET',
    path: '/nested',
    config: {
      handler: handler,
      validate: {
        query: {
          param1: Joi.object({
            nestedparam1: Joi.string().required()
          })
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/rootobject',
    config: {
      handler: handler,
      validate: {
        query: Joi.object({
          param1: Joi.string().required()
        })
      }
    }
  },
  {
    method: 'GET',
    path: '/rootarray',
    config: {
      handler: handler,
      validate: {
        query: Joi.array().includes(Joi.string(), Joi.object({
          param1: Joi.number()
        })).excludes(Joi.number()).min(2).max(5).length(3)
      }
    }
  },
  {
    method: 'GET',
    path: '/path/{pparam}/test',
    config: {
      handler: handler,
      validate: {
        params: {
          pparam: Joi.string().required()
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/emptyobject',
    config: {
      handler: handler,
      validate: {
        query: {
          param1: Joi.object()
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/alternatives',
    config: {
      handler: handler,
      validate: {
        query: {
          param1: Joi.alternatives().try(Joi.number().required(), Joi.string().valid('first', 'last'))
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/novalidation',
    config: {
      handler: handler
    }
  },
  {
    method: 'GET',
    path: '/withresponse',
    config: {
      handler: handler,
      response: {
        schema: {
          param1: Joi.string()
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/withpojoinarray',
    config: {
      handler: handler,
      validate: {
        query: {
          param1: Joi.array().includes({
            param2: Joi.string()
          })
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/withnestedrulesarray',
    config: {
      handler: handler,
      validate: {
        payload: {
          param1: Joi.array().includes(Joi.object({
            param2: Joi.array().includes(Joi.object({
              param3: Joi.string()
            })).optional()
          }))
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/withhtmlnote',
    config: {
      handler: handler,
      validate: {
        query: {
          param1: Joi.string().notes('<span class="htmltypenote">HTML type note</span>')
        }
      },
      notes: '<span class="htmlroutenote">HTML route note</span>'
    }
  },
  {
    method: 'GET',
    path: '/withexample',
    config: {
      handler: handler,
      validate: {
        query: {
          param1: Joi.string().regex(/^\w{1,5}$/).example('abcde')
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/denybody',
    config: {
      handler: handler,
      validate: {
        payload: false
      }
    }
  },
  {
    method: 'POST',
    path: '/rootemptyobject',
    config: {
      handler: handler,
      validate: {
        payload: Joi.object()
      }
    }
  },
  {
    method: 'GET',
    path: '/withnestedexamples',
    config: {
      handler: handler,
      validate: {
        query: {
          param1: Joi.object({
            param2: Joi.object({
              param3: Joi.number().example(5)
            }).example({
              param3: 5
            })
          }).example({
            param2: {
              param3: 5
            }
          })
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/withmeta',
    config: {
      handler: handler,
      validate: {
        query: {
          param1: Joi.string().meta({
            index: true,
            unique: true
          })
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/withunit',
    config: {
      handler: handler,
      validate: {
        query: {
          param1: Joi.number().unit('ms')
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/withdefaultvalue',
    config: {
      handler: handler,
      validate: {
        query: {
          param1: Joi.number().default(42)
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/withbinaryencoding',
    config: {
      handler: handler,
      validate: {
        query: {
          param1: Joi.binary().min(42).max(128).length(64).encoding('base64')
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/withdate',
    config: {
      handler: handler,
      validate: {
        query: {
          param1: Joi.date().min('1-1-1974').max('12-31-2020')
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/withpeersconditions',
    config: {
      handler: handler,
      validate: {
        query: {
          param1: Joi.object()
            .and('a', 'b', 'c')
            .or('a', 'b', 'c')
            .xor('a', 'b', 'c')
            .with('a', ['b', 'c'])
            .without('a', ['b', 'c'])
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/withallowunknown',
    config: {
      handler: handler,
      validate: {
        query: {
          param1: Joi.object().unknown(),
          param2: Joi.object().unknown(false)
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/withstringspecifics',
    config: {
      handler: handler,
      validate: {
        query: {
          param1: Joi.string()
            .alphanum()
            .regex(/\d{3}.*/)
            .token()
            .email()
            .guid()
            .isoDate()
            .hostname()
            .lowercase()
            .uppercase()
            .trim()
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/withconditionalalternatives',
    config: {
      handler: handler,
      validate: {
        query: {
          param1: Joi.alternatives()
            .when('b', {
              is: 5,
              then: Joi.string(),
              otherwise: Joi.number()
            })
            .when('a', {
              is: true,
              then: Joi.date(),
              otherwise: Joi.any()
            })
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/withreferences',
    config: {
      handler: handler,
      validate: {
        query: {
          param1: Joi.ref('a.b'),
          param2: Joi.ref('$x')
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/withassert',
    config: {
      handler: handler,
      validate: {
        query: {
          param1: Joi.object().assert('d.e', Joi.ref('a.c'), 'equal to a.c'),
          param2: Joi.object().assert('$x', Joi.ref('b.e'), 'equal to b.e')
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/withproperties',
    vhost: 'john.doe',
    config: {
      handler: handler,
      cors: false,
      jsonp: 'callback'
    }
  }
]);

server.pack.register([
  {
    plugin: require('./'),
    options: {
      endpointUrl: '/'
    }
  }
], function (err) {
  server.start(function () {
    console.log('Server started: ' + server.info.uri);
  });
});