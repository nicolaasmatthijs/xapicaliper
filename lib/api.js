module.exports.CONSTANTS = require('./constants');

/**
 * @name config
 *
 * The configuration object passed in when generating a new learning activity statement
 *
 * @param  {String}         [config.type]                   The learning activity statement type to generate. One of CONSTANTS.TYPE.XAPI or CONSTANTS.TYPE.CALIPER. Defaults to CONSTANTS.TYPE.XAPI
 * @param  {Object}         config.platform                 The information about the platform generating learning activities
 * @param  {String}         config.platform.name            The name of the platform generating learning activities
 * @param  {String}         [config.platform.description]   The description of the platform generating learning activities
 * @param  {String}         config.platform.url             The URL of the platform generating learning activities
 * @param  {Object}         [config.lrs]                    The LRS configuration values. This should only be provided when this utility should also store the generated xAPI or Caliper statement
 * @param  {String}         [config.lrs.endpoint]           The URL to the endpoint used for storing new xAPI or Caliper statements
 * @param  {String}         [config.lrs.username]           The LRS username
 * @param  {String}         [config.lrs.password]           The LRS password
 */

/**
 * @name statement
 *
 * Object that describes a learning activity
 *
 * @param  {Date|String}    statement.timestamp             The time at which the learning activity took place. Defaults to the current time
 * @param  {Object}         statement.actor                 The user performing the action described by the learning activity
 * @param  {String}         [statement.actor.id]            Unique id of the user. When this is not provided, the email address will be used as the user's unique id
 * @param  {String}         [statement.actor.id_source]     The canonical home page for the system the user's account is on. `openid` when an OpenId user id has been provided
 * @param  {String}         [statement.actor.name]          The display name of the user
 * @param  {String}         [statement.actor.email]         The email address of the user. This can also be an SHA1 sum of the email address in case the email address needs to be hashed before it can be used
 * @param  {Date}           [statement.actor.created]       The date at which the user was created
 * @param  {Date}           [statement.actor.updated]       The date at which the user was last updated
 * @param  {Object}         [statement.metadata]            The metadata that describes the learning activity
 * @param  {Object}         [statement.context]             Object that describes the context in which a learning activity took place (e.g., course)
 * @param  {String}         [statement.context.id]          The URL of the context
 * @param  {String}         [statement.context.name]        The name of the context (e.g., course name)
 * @param  {String}         [statement.context.description] The description of the context (e.g., course description)
 */

/**
 * @name callback
 *
 * The callback function used when generating a new learning activity statement
 *
 * @param  {Object}         callback.err                    An error that occurred, if any
 * @param  {Object}         callback.statement              The generated xAPI or Caliper statement
 */

module.exports.session = require('./statements/session');
module.exports.assignment = require('./statements/assignment');
module.exports.discussion = require('./statements/discussion');
module.exports.file = require('./statements/file');
