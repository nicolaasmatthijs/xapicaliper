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
  // TODO: Validation

  processStatement(config, statement, {
    'verb': VERBS.STARTED,
    'XAPI': {
      'object': {
        'id': statement.metadata.id,
        'type': ACTIVITY_TYPES.DISCUSSION.id,
        'name': statement.metadata.title,
        'description': statement.metadata.body
      }
    },
    'CALIPER': {
      'object': generateCaliperEntity(CaliperEntity, {
        'id': statement.object.id,
        'name': statement.metadata.title,
        'description': statement.metadata.body,
        'dateCreated': StatementUtil.generateCaliperDate(statement.timestamp)
      })
    }
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
  // TODO: Validation

  /*processStatement(config, statement, {
    'verb': VERBS.COMMENTED,
    'XAPI': {
      'object': {
        'id': statement.metadata.id,
        'type': ACTIVITY_TYPES.DISCUSSION.id,
        'name': statement.metadata.title,
        'description': statement.metadata.body
      }
    },
    'CALIPER': {
      'object': generateCaliperEntity(CaliperEntity, {
        'id': statement.object.id,
        'name': statement.metadata.title,
        'description': statement.metadata.body,
        'dateCreated': StatementUtil.generateCaliperDate(statement.timestamp)
      })
    }
  }, callback);*/

  /*


   opts, actor, , object,
   // xAPI object generation
   function() {
   return object.id;
   },
   function() {
   return {
   'response': object.body
   };
   },
   // Caliper object generation
   function() {
   // TODO
   return null;
   }, callback);*/
};