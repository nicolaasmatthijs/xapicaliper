var CaliperEntityType = require('caliperjs/src/entities/entityType');
var CaliperEventType = require('caliperjs/src/events/eventType');

var ACTIVITY_TYPES = require('../activitytypes');
var StatementUtil = require('../util');
var VERBS = require('../verbs');

/**
 * Generate and store a learning activity statement for a user uploading a new file
 *
 * @param  {Object}         config                            @see config
 * @param  {Object}         statement                         @see statement
 * @param  {String}         statement.metadata.id             The URL of the file
 * @param  {String}         statement.metadata.title          The title of the file
 * @param  {String}         [statement.metadata.description]  The description of the file
 * @param  {String}         [statement.metadata.url]          The URL at which the file can be downloaded
 * @param  {Number}         [statement.metadata.size]         The size of the file in bytes
 * @param  {String}         [statement.metadata.mime_type]    The mime type of the file
 * @param  {Function}       [callback]                        @see callback
 */
var upload = module.exports.upload = function(config, statement, callback) {
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
    'url': {
      'type': 'uri',
      'required': false
    },
    'size': {
      'type': 'number',
      'required': false
    },
    'mime_type': {
      'type': 'string',
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
        'type': ACTIVITY_TYPES.FILE.id,
        'name': statement.metadata.title,
        'description': statement.metadata.description
      },
      'attachment': {
        'usageType': ACTIVITY_TYPES.FILE.id,
        'display': statement.metadata.title,
        'contentType': statement.metadata.mime_type,
        'length': statement.metadata.size,
        'fileUrl': statement.metadata.url
      }
    },
    'CALIPER': {
      'object': StatementUtil.Caliper.generateEntity({
        'id': statement.metadata.id,
        'type': CaliperEntityType.DIGITAL_RESOURCE,
        'name': statement.metadata.title,
        'description': statement.metadata.description
      })
    }
  }, callback);
};

 /**
 * Generate and store a learning activity statement for a user previewing a file
 *
 * @param  {Object}         config                            @see config
 * @param  {Object}         statement                         @see statement
 * @param  {String}         statement.metadata.file           The URL of the file that was previews
 * @param  {Function}       [callback]                        @see callback
 */
var preview = module.exports.preview = function(config, statement, callback) {
  // Input validation
  var validationError = StatementUtil.validate(config, statement, {
    'file': {
      'type': 'uri',
      'required': true
    }
  });
  if (validationError) {
    return callback(validationError);
  }

  StatementUtil.processStatement(config, statement, {
    'verb': VERBS.PREVIEWED,
    'XAPI': {
      'uuid': [statement.timestamp, statement.metadata.file, StatementUtil.XAPI.getUserId(statement.actor)],
      'object': StatementUtil.XAPI.generateUuid(config.platform, VERBS.CREATED, [statement.metadata.file])
    },
    'CALIPER': {
      'type': CaliperEventType.VIEWED,
      'object': StatementUtil.Caliper.generateEntity({
        'id': statement.metadata.file,
        'type': CaliperEntityType.DIGITAL_RESOURCE
      })
    }
  }, callback);
};

/**
 * Generate and store a learning activity statement for a user downloading a file
 *
 * @param  {Object}         config                            @see config
 * @param  {Object}         statement                         @see statement
 * @param  {String}         statement.metadata.file           The URL of the file that was downloaded
 * @param  {Function}       [callback]                        @see callback
 */
var download = module.exports.download = function(config, statement, callback) {
  // Input validation
  var validationError = StatementUtil.validate(config, statement, {
    'file': {
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
      'uuid': [statement.timestamp, statement.metadata.file, StatementUtil.XAPI.getUserId(statement.actor)],
      'object': StatementUtil.XAPI.generateUuid(config.platform, VERBS.CREATED, [statement.metadata.file])
    },
    'CALIPER': {
      'type': CaliperEventType.VIEWED,
      'object': StatementUtil.Caliper.generateEntity({
        'id': statement.metadata.file,
        'type': CaliperEntityType.DIGITAL_RESOURCE
      })
    }
  }, callback);
};
