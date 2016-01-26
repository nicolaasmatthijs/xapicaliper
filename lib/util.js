var _ = require('lodash');
var crypto = require('crypto');
var joi = require('joi');
var request = require('request');
var tincan = require('tincanjs');
var uuid = require('uuid');

var CaliperContext = require('caliperjs/src/context/context');
var CaliperEntityType = require('caliperjs/src/entities/entityType');
var CaliperEventType = require('caliperjs/src/events/eventType');

var CONSTANTS = require('./constants');
var VERBS = require('./verbs');

// Re-usable validators
var VALIDATORS = {
  'string': joi.string(),
  'number': joi.number(),
  'date': joi.date(),
  'email': joi.string().email(),
  'uri': joi.string().uri(),
  'array': joi.array(),
  'agent': joi.object().keys({
    'name': joi.string().optional(),
    'created': joi.date().optional(),
    'updated': joi.date().optional(),
    'id': joi.string().uri().optional(),
    'id_source': ['openid', joi.string().uri()],
    'email': joi.string().email().optional()
  }).with('id', 'id_source').or('id', 'email')
};

/**
 * Validate the input of a learning activity statement generator
 *
 * @param  {Object}         config                                  @see config
 * @param  {Object}         statement                               @see statement
 * @param  {Object}         metadataRules                           Validation rules for the `statement.metadata` properties. The keys are the names of the metadata fields to validate
 * @param  {String}         metadataRules[metadataField].type       The validator type to run on the metadata field. Accepted values are `string`, `number`, `date`, `uri`, `array` and `agent`
 * @param  {Boolean}        metadataRules[metadataField].required   Whether the metadata field is required
 * @return {Object}                                                 A validation error that occured, if any
 */
var validate = module.exports.validate = function(config, statement, metadataRules) {
  var validationSchema = {};

  // Verify that the required platform values are present
  validationSchema.platform = {
    'url': VALIDATORS.uri.required(),
    'name':VALIDATORS.string.required()
  };

  // Verify that the timestamp is present
  validationSchema.timestamp = VALIDATORS.date.required();

  // Verify that the required actor properties are present
  validationSchema.actor = VALIDATORS.agent.required();

  // Verify that the required additional properties are present in the metadata object
  var metadataValidator = {};
  _.each(metadataRules, function(rule, metadataField) {
    if (rule.type === 'string') {
      metadataValidator[metadataField] = VALIDATORS.string;
    } else if (rule.type === 'number') {
      metadataValidator[metadataField] = VALIDATORS.number;
    } else if (rule.type === 'date') {
      metadataValidator[metadataField] = VALIDATORS.date;
    } else if (rule.type === 'uri') {
      metadataValidator[metadataField] = VALIDATORS.uri;
    } else if (rule.type === 'array') {
      metadataValidator[metadataField] = VALIDATORS.array;
    } else if (rule.type === 'agent') {
      metadataValidator[metadataField] = VALIDATORS.agent;
    }
    if (rule.required) {
      metadataValidator[metadataField] = metadataValidator[metadataField].required();
    }
  });
  validationSchema.metadata = joi.object().keys(metadataValidator);

  // Remove all falsey values from the metadata object
  var metadata = {};
  _.each(statement.metadata, function(value, key) {
    if (value) {
      metadata[key] = value;
    }
  });

  // Validate the data
  var validationResult = joi.validate({
    'platform': config.platform,
    'timestamp': statement.timestamp,
    'actor': statement.actor,
    'metadata': metadata
  }, joi.object().keys(validationSchema));

  if (validationResult.error) {
    console.log(validationResult.error.details);
    return {'code': 400, 'msg': validationResult.error.details[0].message};
  }
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
 * @param  {Object}         [opts.XAPI.context]               Object that describes the xAPI context of the learning activity
 * @param  {Object}         [opts.XAPI.context.parent]        The properties that describe the parent of the learning activity
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

/**
 * Generate a date string in ISO 8601 format. This format is used by both xAPI and Caliper
 *
 * @param  {Date}           date                              Date for which to generate an ISO 8601 formatted date string
 * @return {String}                                           The date string in an ISO 8601 format. `null` if invalid input has been provided
 */
var generateDate = module.exports.generateDate = function(date) {
  // Parse the date if a number or string has been provided
  if (_.isNumber(date) || _.isString(date)) {
    date = new Date(date);
  }

  if (!_.isDate(date)) {
    return null;
  } else {
    return date.toISOString();
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
 * @param  {Object}         [opts.XAPI.context]               Object that describes the xAPI context of the learning activity
 * @param  {Object}         [opts.XAPI.context.parent]        The properties that describe the parent of the learning activity
 * @param  {Function}       callback                          Standard callback function
 * @param  {Object}         callback.err                      An error that occured, if any
 * @param  {Object}         callback.statement                The generated xAPI statement
 */
XAPI.processStatement = function(config, statement, opts, callback) {
  var xapiStatement = XAPI.generateStatement(config, statement, opts);
  //XAPI.storeStatement(config, xapiStatement, function(err) {
    return callback(null, xapiStatement);
  //});
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
 * @param  {Object}         [opts.XAPI.context]               Object that describes the xAPI context of the learning activity
 * @param  {Object}         [opts.XAPI.context.parent]        The properties that describe the parent of the learning activity
 * @return {Object}                                           The generated xAPI statement
 */
XAPI.generateStatement = function(config, statement, opts) {
  // Generate a unique id for the learning activity statement
  var generatedUuid = XAPI.generateUuid(config.platform, opts.verb, opts.XAPI.uuid);

  // Generate the timestamp for the learning activity
  var generatedTimestamp = generateDate(statement.timestamp);

  // Generate the learning activity verb
  var formattedVerb = {
    'id': opts.verb.XAPI.id,
    'display': opts.verb.XAPI.name
  };

  // Generate the learning activity actor
  var formattedActor = XAPI.generateAgent(statement.actor);

  // Generate the learning activity object
  var formattedObject = XAPI.generateObject(opts.XAPI.object);

  // Generate the learning activity result
  var formattedResult = opts.XAPI.result;

  // Generate the statement
  var generatedStatement = {
    'id': generatedUuid,
    'timestamp': generatedTimestamp,
    'actor': formattedActor,
    'verb': formattedVerb,
    'object': formattedObject,
    'result': formattedResult,
    'context': {
      'platform': config.platform.name,
      'contextActivities': {}
    }
  };

  // Add the context of the learning activity when one has been provided
  if (statement.context) {
    generatedStatement.context.contextActivities.grouping = XAPI.generateObject(statement.context);
  }
  // Add the parent of the learning activity when one has been provided
  if (opts.XAPI.context && opts.XAPI.context.parent) {
    generatedStatement.context.contextActivities.parent = XAPI.generateObject(opts.XAPI.context.parent);
  }
  // Add the instructor of the learning activity when one has been provided
  if (opts.XAPI.context && opts.XAPI.context.instructor) {
    generatedStatement.context.instructor = XAPI.generateAgent(opts.XAPI.context.instructor);
  }

  // Add the learning activity attachment when one has been provided
  if (opts.XAPI.attachment) {
    generatedStatement.attachments = [XAPI.generateAttachment(opts.XAPI.attachment)];
  }

  return generatedStatement;
};

/**
 * Generate a deterministic UUID based for a set of provided values
 *
 * @param  {Object}         platform                        The information about the platform generating learning activities
 * @param  {String}         platform.name                   The name of the platform generating learning activities
 * @param  {String}         platform.url                    The URL of the platform generating learning activities
 * @param  {Object}         verb                            The verb of the learning activity
 * @param  {String[]}       [values]                        Values that should be used to generate a deterministic UUID
 * @return {String}                                         The generated deterministic UUID based on the provided values
 */
XAPI.generateUuid = function(platform, verb, values) {
  values = values || [];
  // Add the platform URL to the list of fields to use to generate a uuid
  var fields = _.union([platform.url, verb.XAPI.id], values);
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
 * Generate an xAPI agent for a learning activity
 *
 * @param  {Object}         user                              The properties for which to generate an xAPI agent
 * @param  {String}         [user.id]                         Unique id of the user. When this is not provided, the email address will be used as the user's unique id
 * @param  {String}         [user.id_source]                  The canonical home page for the system the user's account is on. `openid` when an OpenId user id has been provided
 * @param  {String}         [user.email]                      The email address of the user
 * @param  {String}         [user.name]                       The display name of the user
 * @param  {Date}           [user.created]                    The date at which the user was created
 * @param  {Date}           [user.updated]                    The date at which the user was last updated
 * @return {Object}                                           The generated xAPI agent
 */
XAPI.generateAgent = function(user) {
  var formattedAgent = {};
  // Add the actor object type
  formattedAgent.objectType = 'Agent';
  // Add the actor's name
  if (user.name) {
    formattedAgent.name = user.name;
  }
  // Add the account information
  if (user.id && user.id_source) {
    // OpenId account
    if (user.id_source === 'openid') {
      formattedAgent.openid = user.id;
    // System account
    } else {
      formattedAgent.account = {
        'homePage': user.id_source,
        'name': user.id
      };
    }
    // User identified by email address
  } else if (user.email) {
    formattedAgent.mbox = 'mailto:' + user.email;
  }
  return formattedAgent;
};

/**
 * Generate a unique id for a user. This unique id will be a concatenation of the id field and the actual id
 *
 * @param  {Object}         user                              The properties for which to generate an xAPI agent
 * @param  {String}         [user.id]                         Unique id of the user. When this is not provided, the email address will be used as the user's unique id
 * @param  {String}         [user.id_source]                  The canonical home page for the system the user's account is on. `openid` when an OpenId user id has been provided
 * @param  {String}         [user.email]                      The email address of the user
 * @param  {String}         [user.name]                       The display name of the user
 * @param  {Date}           [user.created]                    The date at which the user was created
 * @param  {Date}           [user.updated]                    The date at which the user was last updated
 * @return {String}                                           Unique id for the user
 */
XAPI.getUserId = function(user) {
  if (user.id && user.id_source) {
    return user.id_source + ':' + user.id;
  } else {
    return 'mbox:mailto:' + user.email;
  }
};

/**
 * Generate an xAPI object for a learning activity
 *
 * @param  {String|Object}  object                            The properties for which to generate an xAPI object. When a string has been provided, this should be a reference to a different activity
 * @param  {String}         object.id                         The URL of the xAPI object
 * @param  {String}         [object.name]                     The name of the xAPI object
 * @param  {String}         [object.description]              The description of the xAPI object
 * @param  {String}         [object.moreInfo]                 URL at which more information about the object can be found
 * @return {Object}                                           The generated xAPI object
 */
XAPI.generateObject = function(object) {
  // An xAPI object can be a reference to a different learning activity
  if (_.isString(object)) {
    return {
      'objectType': 'StatementRef',
      'id': object
    };
  };

  // Format the object as an xAPI activity
  var formattedObject = {
    'objectType': 'Activity',
    'definition': {
      'extensions': {}
    }
  };

  _.each(object, function(value, key) {
    if (key === 'id') {
      formattedObject.id = object.id;
    } else if (key === 'name' || key === 'description') {
      formattedObject.definition[key] = {
        'en-US': value
      };
    } else if (key === 'moreInfo' || key === 'type') {
      formattedObject.definition[key] = value;
    } else {
      formattedObject.definition.extensions[key] = value;
    }
  });

  return formattedObject;
};

/**
 * Generate an xAPI attachment for a learning activity
 *
 * @param  {Object}         attachment                        The properties for which to generate an xAPI attachment
 * @param  {String}         attachment.usageType              URL that describes the usage of the attachment
 * @param  {String}         attachment.display                The display name of the attachment
 * @param  {String}         [attachment.contentType]          The mime type of the attachment
 * @param  {Number}         [attachment.length]               The size of the attachment in bytes
 * @param  {String}         [attachment.fileUrl]              The URL at which the attachment can be downloaded
 * @return {Object}                                           The generated xAPI attachment
 */
XAPI.generateAttachment = function(attachment) {
  var formattedAttachment = {};

  var keys = _.keys(attachment);
  _.each(keys, function(key) {
    if (key === 'display' || key === 'description') {
      formattedAttachment[key] = {
        'en-US': attachment[key]
      };
    } else {
      formattedAttachment[key] = attachment[key];
    }
  });

  formattedAttachment['sha2'] = crypto.createHash('sha256').update(attachment.display).digest('base64');;

  return formattedAttachment;
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
    var err = null;
    if (response[0].err) {
      console.log(response[0].xhr.response);
      err = {'code': response[0].err, 'msg': response[0].xhr.response};
    }
    return callback(err);
  });
};

/////////////
// CALIPER //
/////////////

var Caliper = module.exports.Caliper = {};

/**
 * Generate a Caliper statement for a learning activity and store it in
 * an Event Store
 *
 * @param  {Object}         config                            @see config
 * @param  {Object}         statement                         @see statement
 * @param  {Object}         opts                              Additional options
 * @param  {Object}         opts.verb                         The verb for the learning activity. @see verbs
 * @param  {Object}         opts.CALIPER                      Caliper related properties
 * @param  {Object}         opts.CALIPER.object               The properties that describe the Caliper object of the learning activity
 * @param  {Object}         [opts.CALIPER.generated]          The properties that describe the Caliper generated object of the learning activity
 * @param  {Function}       callback                          Standard callback function
 * @param  {Object}         callback.err                      An error that occured, if any
 * @param  {Object}         callback.statement                The generated Caliper statement
 */
Caliper.processStatement = function(config, statement, opts, callback) {
  var caliperStatement = Caliper.generateStatement(config, statement, opts);
  //Caliper.storeStatement(config, caliperStatement, function(err) {
    return callback(null, caliperStatement);
  //});
};

/**
 * Generate a Caliper statement for a learning activity
 *
 * @param  {Object}         config                            @see config
 * @param  {Object}         statement                         @see statement
 * @param  {Object}         opts                              Additional options
 * @param  {Object}         opts.verb                         The verb for the learning activity. @see verbs
 * @param  {Object}         opts.CALIPER                      Caliper related properties
 * @param  {Object}         opts.CALIPER.type                 The Caliper event type
 * @param  {Object}         opts.CALIPER.object               The properties that describe the Caliper object of the learning activity
 * @param  {Object}         [opts.CALIPER.generated]          The properties that describe the Caliper generated object of the learning activity
 * @return {Object}                                           The generated Caliper statement
 */
Caliper.generateStatement = function(config, statement, opts) {
  var generatedStatement = {
    '@context': CaliperContext.CONTEXT,
    '@type': opts.CALIPER.type || CaliperEventType.EVENT
  };

  // Generate the timestamp for the learning activity
  var generatedTimestamp = generateDate(statement.timestamp);
  generatedStatement.eventTime = generatedTimestamp;

  // Generate the EdApp for the learning activity
  generatedStatement.edApp = Caliper.generateEdApp(config.platform);

  // Generate the learning activity verb
  var generatedVerb = opts.verb.XAPI.id;
  if (opts.verb.CALIPER) {
    generatedVerb = opts.verb.CALIPER.id;
  }
  generatedStatement.action = generatedVerb;

  // Generate the learning activity actor
  generatedStatement.actor = Caliper.generatePerson(statement.actor);

  // Generate the learning activity object
  generatedStatement.object = opts.CALIPER.object;

  // Add the object generated by the learning activity when one has been provided
  if (opts.CALIPER.generated) {
    generatedStatement.generated = opts.CALIPER.generated;
  }

  // TODO: Add course context

  return generatedStatement;
};

/**
 * Generate a Caliper EdApp
 *
 * @param  {Object}         platform                          @see config.platform
 * @return {Object}                                           The generated Caliper EdApp
 */
Caliper.generateEdApp = function(platform) {
  return Caliper.generateEntity({
    'type': CaliperEntityType.SOFTWARE_APPLICATION,
    'id': platform.url,
    'name': platform.name,
    'description': platform.description
  });
};

/**
 * Generate a Caliper Person
 *
 * @param  {Object}         person                            @see statement.actor
 * @return {Object}                                           The generated Caliper Person
 */
Caliper.generatePerson = function(person) {
  var opts = {
    'type': CaliperEntityType.PERSON,
    'id': person.id,
    'name': person.name
  };

  if (person.created) {
    opts.dateCreated = generateDate(person.created);
  }
  if (person.updated) {
    opts.dateModified = generateDate(person.updated);
  }

  return Caliper.generateEntity(opts);
};

/**
 * Generate a Caliper Entity
 *
 * @param  {Object}         opts                              The entity properties
 * @param  {String}         opts.id                           The URL of the entity
 * @param  {Object}         [extensions]                      Additional properties to add to the entity
 * @return {Object}                                           The generated Caliper Entity
 */
Caliper.generateEntity = function(opts, extensions) {
  opts.type = opts.type || CaliperEntityType.ENTITY;

  var entity = {
    '@context': CaliperContext.CONTEXT,
    '@type': opts.type,
    '@id': opts.id
  };

  delete opts.type;
  delete opts.id;

  entity = _.extend(entity, opts);

  if (extensions) {
    entity.extensions = extensions;
  }

  return entity;
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
