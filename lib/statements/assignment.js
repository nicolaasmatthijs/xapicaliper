var CaliperEntity = require('caliperjs/src/entities/entity');

var ACTIVITY_TYPES = require('../activitytypes');
var StatementUtil = require('../util');
var VERBS = require('../verbs');

/**
 * Generate and store a learning activity statement for a user creating a new assignment
 *
 * @param  {Object}         config                                  @see config
 * @param  {Object}         statement                               @see statement
 * @param  {String}         statement.metadata.id                   The URL of the assignment
 * @param  {String}         statement.metadata.title                The title of the assignment
 * @param  {String}         [statement.metadata.description]        The description of the assignment
 * @param  {String[]}       [statement.metadata.submission_types]   The accepted submission types for the assignment
 * @param  {Function}       [callback]                              @see callback
 */
var create = module.exports.create = function(config, statement, callback) {
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
    'description': {
      'type': 'string',
      'required': false
    },
    'submission_types': {
      'type': 'array',
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
        'type': ACTIVITY_TYPES.ASSESSMENT.id,
        'name': statement.metadata.title,
        'description': statement.metadata.description,
        'https://canvas.instructure.com/xapi/assignments/submissions_types': statement.metadata.submission_types
      }
    },
    'CALIPER': {}
  }, callback);
};

/**
 * Generate and store a learning activity statement for a user viewing an assignment
 *
 * @param  {Object}         config                            @see config
 * @param  {Object}         statement                         @see statement
 * @param  {String}         statement.metadata.assignment     The URL of the assignment that was viewed
 * @param  {Function}       [callback]                        @see callback
 */
var view = module.exports.view = function(config, statement, callback) {
  // Input validation
  var validationError = StatementUtil.validate(config, statement, {
    'assignment': {
      'type': 'uri',
      'required': true
    }
  });
  if (validationError) {
    return callback(validationError);
  }

  StatementUtil.processStatement(config, statement, {
    'verb': VERBS.VIEWED,
    'XAPI': {
      'uuid': [statement.timestamp, statement.metadata.assignment],
      'object': StatementUtil.XAPI.generateUuid(config.platform, VERBS.CREATED, [statement.metadata.assignment])
    },
    'CALIPER': {}
  }, callback);
};

/**
 * Generate and store a learning activity statement for a user submitting an assignment submission
 *
 * @param  {Object}         config                            @see config
 * @param  {Object}         statement                         @see statement
 * @param  {String}         statement.metadata.id             The URL of the assignment submission
 * @param  {String}         statement.metadata.assignment     The URL of the assignment for the submission
 * @param  {String}         [statement.metadata.submission]   The content of the assignment submission. This can be a text response or a link to the response
 * @param  {Function}       [callback]                        @see callback
 */
var submit = module.exports.submit = function(config, statement, callback) {
  // Input validation
  var validationError = StatementUtil.validate(config, statement, {
    'id': {
      'type': 'uri',
      'required': true
    },
    'assignment': {
      'type': 'uri',
      'required': true
    },
    'submission': {
      'type': 'string',
      'required': false
    }
  });
  if (validationError) {
    return callback(validationError);
  }

  StatementUtil.processStatement(config, statement, {
    'verb': VERBS.SUBMITTED,
    'XAPI': {
      'uuid': [statement.metadata.id],
      'object': StatementUtil.XAPI.generateUuid(config.platform, VERBS.CREATED, [statement.metadata.assignment]),
      'result': {
        'completion': true,
        'response': statement.metadata.submission
      }
    },
    'CALIPER': {}
  }, callback);
};

/**
 * Generate and store a learning activity statement for a user receive a grade for an assignment submission
 *
 * @param  {Object}         config                            @see config
 * @param  {Object}         statement                         @see statement
 * @param  {String}         statement.metadata.id             The URL of the assignment submission
 * @param  {String}         statement.metadata.assignment     The URL of the assignment for the submission
 * @param  {Number}         statement.metadata.grade          The grade that was received for the assignment submission
 * @param  {Object}         [statement.metadata.grader]       @see statement.actor. The user performing the grading
 * @param  {Number}         [statement.metadata.grade_min]    The minimum possible grade for the assignment
 * @param  {Number}         [statement.metadata.grade_max]    The maximum possible grade for the assignment
 * @param  {Function}       [callback]                        @see callback
 */
var receive_grade = module.exports.receive_grade = function(config, statement, callback) {
  // Input validation
  var validationError = StatementUtil.validate(config, statement, {
    'id': {
      'type': 'uri',
      'required': true
    },
    'assignment': {
      'type': 'uri',
      'required': true
    },
    'grade': {
      'type': 'number',
      'required': true
    },
    'grader': {
      'type': 'agent',
      'required': false
    },
    'grade_min': {
      'type': 'number',
      'required': false
    },
    'grade_max': {
      'type': 'number',
      'required': false
    }
  });
  if (validationError) {
    return callback(validationError);
  }

  var scaled_score = null;
  if (statement.metadata.grade_max) {
    scaled_score = statement.metadata.grade / statement.metadata.grade_max;
  }

  StatementUtil.processStatement(config, statement, {
    'verb': VERBS.SCORED,
    'XAPI': {
      'uuid': [statement.metadata.id],
      'object': StatementUtil.XAPI.generateUuid(config.platform, VERBS.SUBMITTED, [statement.metadata.id]),
      'result': {
        'score': {
          'raw': statement.metadata.grade,
          'min': statement.metadata.grade_min,
          'max': statement.metadata.grade_max,
          'scaled': scaled_score
        }
      },
      'context': {
        'instructor': statement.metadata.grader
      }
    },
    'CALIPER': {}
  }, callback);
};

/**
 * Generate and store a learning activity statement for a user receive a grade for an assignment submission
 *
 * @param  {Object}         config                            @see config
 * @param  {Object}         statement                         @see statement
 * @param  {String}         statement.metadata.id             The URL of the assignment submission feedback
 * @param  {String}         statement.metadata.submission     The URL of the assignment submission for the feedback
 * @param  {String}         statement.metadata.feedback       The feedback provided on the assignment submission
 * @param  {Function}       [callback]                        @see callback
 */
var feedback = module.exports.feedback = function(config, statement, callback) {
  // Input validation
  var validationError = StatementUtil.validate(config, statement, {
    'id': {
      'type': 'uri',
      'required': true
    },
    'submission': {
      'type': 'uri',
      'required': true
    },
    'feedback': {
      'type': 'string',
      'required': true
    }
  });
  if (validationError) {
    return callback(validationError);
  }

  StatementUtil.processStatement(config, statement, {
    'verb': VERBS.COMMENTED,
    'XAPI': {
      'uuid': [statement.metadata.id],
      'object': StatementUtil.XAPI.generateUuid(config.platform, VERBS.SUBMITTED, [statement.metadata.submission]),
      'result': {
        'response': statement.metadata.feedback
      }
    },
    'CALIPER': {}
  }, callback);
};
