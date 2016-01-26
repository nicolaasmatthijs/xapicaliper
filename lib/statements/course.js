var CaliperEntityType = require('caliperjs/src/entities/entityType');
var CaliperEventType = require('caliperjs/src/events/eventType');

var ACTIVITY_TYPES = require('../activitytypes');
var StatementUtil = require('../util');
var VERBS = require('../verbs');

/**
 * Generate and store a learning activity statement for a user creating a new course
 *
 * @param  {Object}         config                            @see config
 * @param  {Object}         statement                         @see statement
 * @param  {String}         statement.metadata.id             The URL of the course
 * @param  {String}         statement.metadata.name           The name of the course
 * @param  {String}         [statement.metadata.description]  The description of the course
 * @param  {Date}           [statement.metadata.start]        The time at which the course starts
 * @param  {Date}           [statement.metadata.end]          The time at which the course ends
 * @param  {Function}       [callback]                        @see callback
 */
var create = module.exports.create = function(config, statement, callback) {
  // Input validation
  var validationError = StatementUtil.validate(config, statement, {
    'id': {
      'type': 'uri',
      'required': true
    },
    'name': {
      'type': 'string',
      'required': true
    },
    'description': {
      'type': 'string',
      'required': false
    },
    'start': {
      'type': 'date',
      'required': false
    },
    'end': {
      'type': 'date',
      'required': false
    }
  });
  if (validationError) {
    return callback(validationError);
  }

  StatementUtil.processStatement(config, statement, {
    'verb': VERBS.CREATED,
    'XAPI': {
      'uuid': [statement.metadata.id],
      'object': {
        'id': statement.metadata.id,
        'type': ACTIVITY_TYPES.COURSE.id,
        'name': statement.metadata.name,
        'description': statement.metadata.description,
        'http://id.tincanapi.com/extension/planned-start-time': StatementUtil.generateDate(statement.metadata.start),
        'http://id.tincanapi.com/extension/planned-duration': StatementUtil.generateDate(statement.metadata.end)
      }
    },
    'CALIPER': {
      'object': StatementUtil.Caliper.generateEntity({
        'id': statement.metadata.id,
        'type': CaliperEntityType.COURSE_OFFERING,
        'name': statement.metadata.name,
        'description': statement.metadata.description
      }, {
        'http://id.tincanapi.com/extension/planned-start-time': StatementUtil.generateDate(statement.metadata.start),
        'http://id.tincanapi.com/extension/planned-duration': StatementUtil.generateDate(statement.metadata.end)
      })
    }
  }, callback);
};

/**
 * Generate and store a learning activity statement for a user enrolling in a course
 *
 * @param  {Object}         config                            @see config
 * @param  {Object}         statement                         @see statement
 * @param  {String}         statement.metadata.course         The URL of the course in which the student enrolls
 * @param  {Function}       [callback]                        @see callback
 */
var enroll = module.exports.enroll = function(config, statement, callback) {
  // Input validation
  var validationError = StatementUtil.validate(config, statement, {
    'course': {
      'type': 'uri',
      'required': true
    }
  });
  if (validationError) {
    return callback(validationError);
  }

  StatementUtil.processStatement(config, statement, {
    'verb': VERBS.REGISTERED,
    'XAPI': {
      'uuid': [statement.timestamp, StatementUtil.XAPI.getUserId(statement.actor)],
      'object': StatementUtil.XAPI.generateUuid(config.platform, VERBS.CREATED, [statement.metadata.course])
    },
    'CALIPER': {
      'object': StatementUtil.Caliper.generateEntity({
        'id': statement.metadata.id,
        'type': CaliperEntityType.COURSE_OFFERING
      })
    }
  }, callback);
};

/**
 * Generate and store a learning activity statement for a user leaving a course
 *
 * @param  {Object}         config                            @see config
 * @param  {Object}         statement                         @see statement
 * @param  {String}         statement.metadata.course         The URL of the course in which the student enrolls
 * @param  {Function}       [callback]                        @see callback
 */
var leave = module.exports.leave = function(config, statement, callback) {
  // Input validation
  var validationError = StatementUtil.validate(config, statement, {
    'course': {
      'type': 'uri',
      'required': true
    }
  });
  if (validationError) {
    return callback(validationError);
  }

  StatementUtil.processStatement(config, statement, {
    'verb': VERBS.UNREGISTERED,
    'XAPI': {
      'uuid': [statement.timestamp, StatementUtil.XAPI.getUserId(statement.actor)],
      'object': StatementUtil.XAPI.generateUuid(config.platform, VERBS.CREATED, [statement.metadata.course])
    },
    'CALIPER': {
      'object': StatementUtil.Caliper.generateEntity({
        'id': statement.metadata.id,
        'type': CaliperEntityType.COURSE_OFFERING
      })
    }
  }, callback);
};
