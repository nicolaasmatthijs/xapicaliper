var _ = require('lodash');
var crypto = require('crypto');
var joi = require('joi');
var request = require('request');
var tincan = require('tincanjs');
var uuid = require('uuid');

var CaliperEdApp = require('caliperjs/src/entities/agent/softwareApplication');
var CaliperPerson = require('caliperjs/src/entities/agent/person');
var CaliperSession = require('caliperjs/src/entities/session/session');

var ACTIVITY_TYPES = require('./activitytypes');
var CONSTANTS = require('./constants');
var VERBS = require('./verbs');

// Re-usable validators
var VALIDATORS = {
  'email': joi.string().email,
  'uri': joi.string().uri()
};

/**
 * Generate an xAPI or Caliper statement for a learning activity and store it in
 * a Learning Record Store
 *
 * @param  {Object}         config                            @see config
 * @param  {Object}         statement                         @see statement
 * @param  {Object}         opts                              Additional options
 * @param  {Object}         opts.verb                         The verb for the learning activity. @see verbs
 * @param  {Object}         opts.XAPI                         xAPI related properties
 * @param  {String[]}       opts.XAPI.uuid                    Array of values that should be to generate a unique id for the learning activity
 * @param  {Object}         opts.XAPI.object                  The properties that describe the xAPI object of the learning activity
 * @param  {Object}         opts.CALIPER                      Caliper related properties
 * @param  {Object}         opts.CALIPER.object               The properties that describe the Caliper object of the learning activity
 * @param  {Object}         [opts.CALIPER.generated]          The properties that describe the Caliper generated object of the learning activity
 * @param  {Function}       [callback]                        Standard callback function
 * @param  {Object}         [callback.err]                    An error that occured, if any
 * @param  {Object}         [callback.statement]              The generated xAPI or Caliper statement
 */
var processStatement = module.exports.processStatement = function(config, statement, opts, callback) {
  callback = callback || function() {};

  var type = config.type || CONSTANTS.TYPE.XAPI;
  if (type === CONSTANTS.TYPE.XAPI) {
    XAPI.processStatement(config, statement, opts, callback);
  } else if (type === CONSTANTS.TYPE.CALIPER) {
    Caliper.processStatement(config, statement, opts, callback);
  } else {
    return callback({'code': 400, 'msg': 'Unrecognized statement type'});
  }
};

//////////
// XAPI //
//////////

var XAPI = module.exports.XAPI = {};

/**
 * Generate an xAPI statement for a learning activity and store it in
 * a Learning Record Store
 *
 * @param  {Object}         config                            @see config
 * @param  {Object}         statement                         @see statement
 * @param  {Object}         opts                              Additional options
 * @param  {Object}         opts.verb                         The verb for the learning activity. @see verbs
 * @param  {Object}         opts.XAPI                         xAPI related properties
 * @param  {String[]}       opts.XAPI.uuid                    Array of values that should be to generate a unique id for the learning activity
 * @param  {Object}         opts.XAPI.object                  The properties that describe the xAPI object of the learning activity
 * @param  {Object}         opts.CALIPER                      Caliper related properties
 * @param  {Object}         opts.CALIPER.object               The properties that describe the Caliper object of the learning activity
 * @param  {Object}         [opts.CALIPER.generated]          The properties that describe the Caliper generated object of the learning activity
 * @param  {Function}       callback                          Standard callback function
 * @param  {Object}         callback.err                      An error that occured, if any
 * @param  {Object}         callback.statement                The generated xAPI statement
 */
XAPI.processStatement = function(config, statement, opts, callback) {
  var xapiStatement = XAPI.generateStatement(config, statement, opts);
  XAPI.storeStatement(config, xapiStatement, function(err) {
    return callback(err, xapiStatement);
  });
};

/**
 * Generate an xAPI statement for a learning activity
 *
 * @param  {Object}         config                            @see config
 * @param  {Object}         statement                         @see statement
 * @param  {Object}         opts                              Additional options
 * @param  {Object}         opts.verb                         The verb for the learning activity. @see verbs
 * @param  {Object}         opts.XAPI                         xAPI related properties
 * @param  {String[]}       opts.XAPI.uuid                    Array of values that should be to generate a unique id for the learning activity
 * @param  {Object}         opts.XAPI.object                  The properties that describe the xAPI object of the learning activity
 * @param  {Object}         opts.CALIPER                      Caliper related properties
 * @param  {Object}         opts.CALIPER.object               The properties that describe the Caliper object of the learning activity
 * @param  {Object}         [opts.CALIPER.generated]          The properties that describe the Caliper generated object of the learning activity
 */
XAPI.generateStatement = function(config, statement, opts) {
  // Generate a unique id for the learning activity statement
  var generatedUuid = XAPI.generateUuid(config.platform, opts.XAPI.uuid);

  // Generate the learning activity verb
  var formattedVerb = {
    'id': opts.verb.XAPI.id,
    'display': opts.verb.XAPI.name
  };

  // Generate the learning activity actor
  var formattedActor = XAPI.generateActor(statement.actor);

  // Generate the learning activity object
  var formattedObject = XAPI.generateObject(opts.object);

  // Generate the statement
  var generatedStatement = {
    'id': generatedUuid,
    'actor': formattedActor,
    'verb': formattedVerb,
    'object': formattedObject,
    'context': {
      'platform': config.platform.name
    }
  };

  // TODO: Add course to context

  // Add the timestamp when one has been provided
  if (statement.timestamp) {
    generatedStatement.timestamp = XAPI.generateDate(statement.timestamp);
  }

  // Generate the learning activity result
  if (opts.result) {
    generatedStatement.result = resultGenerator();
  }

  return generatedStatement;
};

/**
 * Generate a deterministic UUID based for a set of provided values
 *
 * @param  {Object}         platform                        The information about the platform generating learning activities
 * @param  {String}         platform.name                   The name of the platform generating learning activities
 * @param  {String}         platform.url                    The URL of the platform generating learning activities
 * @param  {String[]}       values                          Values that should be used to generate a deterministic UUID
 * @return {String}                                         The generated deterministic UUID based on the provided values
 */
XAPI.generateUuid = function(platform, values) {
  // Add the platform URL to the list of fields to use to generate a uuid
  var fields = _.union([platform.url], values);
  // Create an MD5 hash out of the fields
  var hash = crypto.createHash('md5').update(fields.join('')).digest('hex');
  // Generate an array of 16 numbers (0-255) to generate a deterministic uuid. The MD5 hash
  // will be 32 characters, so for every 2 characters the sum of their character codes is
  // summed to generate a number between 0 and 255
  var random = [];
  for (var i = 0; i < 16; i++) {
    random.push(hash.charCodeAt(i * 2) + hash.charCodeAt((i * 2) + 1));
  }
  // Generate the UUID based on the generated array of numbers
  var generatedUuid = uuid.v4({'random': random});
  return generatedUuid;
};

/**
 * Generate a date string in xAPI compatible format
 *
 * @param  {Date}           [date]                            Date for which to generate an xAPI compatible date string. If no date is provided, the current date will be used
 * @return {String}                                           The date string in an xAPI compatible format
 */
XAPI.generateDate = function(date) {
  // Parse the date if a number or string has been provided
  if (_.isNumber(date) || _.isString(date)) {
    date = new Date(date);
  } else if (!date) {
    date = new Date();
  }

  return date.toISOString();
};

/**
 * TODO
 */
XAPI.generateActor = function(actor) {
  var formattedActor = {};
  // Add the actor object type
  formattedActor.objectType = 'Agent';
  // Add the actor's name
  if (actor.name) {
    formattedActor.name = actor.name;
  }
  // Add the account information
  if (actor.id && actor.id_source) {
    // OpenId account
    if (actor.id_source === 'openid') {
      formattedActor.openid = actor.id
      // System account
    } else {
      var validationResult = joi.validate(actor.id_source, VALIDATORS.uri);
      if (validationResult.error) {
        // TODO: Throw an error
      }
      formattedActor.account = {
        'homePage': actor.id_source,
        'name': actor.id
      };
    }
    // User identified by email address
  } else if (actor.email) {
    var validationResult = joi.validate(actor.email, VALIDATORS.email);
    if (validationResult.error) {
      formattedActor.mbox_sha1sum = actor.email;
    } else {
      formattedActor.mbox = 'mailto:' + actor.email;
    }
  } else {
    // TODO: Throw an error
  }
  return formattedActor;
};

/**
 *
 */
XAPI.generateObject = function(object) {
  // TODO
  //if (_.isString(statement.object)) {
  //  // TODO: Generate uuid for object id
  //  return {
  //    'objectType': 'StatementRef',
  //    'id': statement.object
  //  };
  //};

  // TODO
  var formattedObject = {
    'objectType': 'Activity'
  };
  // Generate a unique id for the object or use the provided one
  //var validationResult = joi.validate(object.id, VALIDATORS.uri);
  //if (validationResult.error) {
  //  // TODO: Throw an error
  //}
  // TODO: Validate that id is a URL in validator
  formattedObject.id = object.id;

  // TODO
  formattedObject.definition = {};
  if (object.moreInfo) {
    formattedObject.definition.moreInfo = object.moreInfo;
  }
  // TODO
  if (object.name) {
    formattedObject.definition.name = {
      'en-US': object.name
    };
  }
  if (object.description) {
    formattedObject.definition.description = {
      'en-US': object.description
    };
  }

  if (object.type) {
    formattedObject.definition.type = object.type;
  }

  return formattedObject;
};

/**
 * Store a generated xAPI statement in one or more Learning Record Stores
 *
 * @param  {Object}         config                            @see config
 * @param  {Object}         xapiStatement                     The generated xAPI statement
 * @param  {Function}       callback                          Standard callback function
 * @param  {Object}         callback.err                      An error that occurred, if any
 * @param  {Object}         callback.response                 The response from the Learning Record Store(s)
 * @api private
 */
XAPI.storeStatement = function(config, xapiStatement, callback) {
  // Don't store the generated xAPI statement if no learning record stores have been provided
  if (!config.lrs) {
    return callback();
  }

  var recordStores = _.isArray(config.lrs) ? config.lrs : [config.lrs];
  var tincanStorage = new tincan({'recordStores': recordStores});
  tincanStorage.sendStatement(xapiStatement, function(response, body) {
    return callback(response.err, body);
  });
};

/////////////
// CALIPER //
/////////////

var Caliper = module.exports.Caliper = {};

/**
 * TODO
 *
 * @param config
 * @param statement
 * @param opts
 * @param callback
 */
Caliper.processStatement = function(config, statement, opts, callback) {

};

/**
 * TODO
 *
 * @param platform
 */
Caliper.generateEdApp = function(platform) {

};

/**
 * TODO
 *
 * @param type
 * @param properties
 */
Caliper.generateEntity = function(type, properties) {

};

/**
 * TODO
 *
 * @param timestamp
 */
Caliper.generateDate = function(timestamp) {

};

/**
 * TODO
 *
 * @param person
 */
Caliper.generatePerson = function(person) {

};

/**
 * TODO
 *
 * @param config
 * @param caliperStatement
 * @param callback
 */
Caliper.storeStatement = function(config, caliperStatement, callback) {

};