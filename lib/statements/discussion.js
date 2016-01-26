var CaliperEntity = require('caliperjs/src/entities/entity');

var ACTIVITY_TYPES = require('../activitytypes');
var StatementUtil = require('../util');
var VERBS = require('../verbs');

/**
 * Generate and store a learning activity statement for a user starting a new discussion
 *
 * @param  {Object}         config                            @see config
 * @param  {Object}         statement                         @see statement
 * @param  {String}         statement.metadata.id             The URL of the discussion
 * @param  {String}         statement.metadata.title          The title of the discussion
 * @param  {String}         [statement.metadata.body]         The body of the discussion
 * @param  {Function}       [callback]                        @see callback
 */
var start = module.exports.start = function(config, statement, callback) {
  // Input validation
  var validationError = StatementUtil.validate(config, statement, {
    'id': {
      'type': 'uri',
      'required': true
    },
    'title': {
      'type': 'string',
      'required': true
    },
    'body': {
      'type': 'string',
      'required': false
    }
  });
  if (validationError) {
    return callback(validationError);
  }

  StatementUtil.processStatement(config, statement, {
    'verb': VERBS.STARTED,
    'XAPI': {
      'uuid': [statement.metadata.id],
      'object': {
        'id': statement.metadata.id,
        'type': ACTIVITY_TYPES.DISCUSSION.id,
        'name': statement.metadata.title,
        'description': statement.metadata.body
      }
    },
    'CALIPER': {
      'object': StatementUtil.Caliper.generateEntity(CaliperEntity, {
        'id': statement.metadata.id,
        'name': statement.metadata.title,
        'description': statement.metadata.body,
        'dateCreated': StatementUtil.generateDate(statement.timestamp)
      })
    }
  }, callback);
};

/**
 * Generate and store a learning activity statement for a user reading a discussion
 *
 * @param  {Object}         config                            @see config
 * @param  {Object}         statement                         @see statement
 * @param  {String}         statement.metadata.discussion     The URL of the discussion that was read
 * @param  {Function}       [callback]                        @see callback
 */
var read = module.exports.read = function(config, statement, callback) {
  // Input validation
  var validationError = StatementUtil.validate(config, statement, {
    'discussion': {
      'type': 'uri',
      'required': true
    }
  });
  if (validationError) {
    return callback(validationError);
  }

  StatementUtil.processStatement(config, statement, {
    'verb': VERBS.READ,
    'XAPI': {
      'uuid': [statement.timestamp, statement.metadata.discussion, StatementUtil.XAPI.getUserId(statement.actor)],
      'object': StatementUtil.XAPI.generateUuid(config.platform, VERBS.STARTED, [statement.metadata.discussion])
    },
    'CALIPER': {}
  }, callback);
};

/**
 * Generate and store a learning activity statement for a user posting to a discussion
 *
 * @param  {Object}         config                            @see config
 * @param  {Object}         statement                         @see statement
 * @param  {String}         statement.metadata.id             The URL of the discussion post
 * @param  {String}         statement.metadata.body           The body of the discussion post
 * @param  {String}         statement.metadata.discussion     The URL of the discussion the discussion post is made in
 * @param  {String}         [statement.metadata.parent]       The URL of the discussion post to which this discussion post is a reply
 * @param  {Function}       [callback]                        @see callback
 */
var post = module.exports.post = function(config, statement, callback) {
  // Input validation
  var validationError = StatementUtil.validate(config, statement, {
    'id': {
      'type': 'uri',
      'required': true
    },
    'body': {
      'type': 'string',
      'required': true
    },
    'discussion': {
      'type': 'uri',
      'required': true
    },
    'parent': {
      'type': 'uri',
      'required': false
    }
  });
  if (validationError) {
    return callback(validationError);
  }

  StatementUtil.processStatement(config, statement, {
    'verb': VERBS.COMMENTED,
    'XAPI': {
      'uuid': [statement.metadata.id],
      'object': StatementUtil.XAPI.generateUuid(config.platform, VERBS.STARTED, [statement.metadata.discussion]),
      'result': {
        'response': statement.metadata.body
      },
      'context': {
        'parent': statement.metadata.parent
      }
    },
    'CALIPER': {}
  }, callback);
};