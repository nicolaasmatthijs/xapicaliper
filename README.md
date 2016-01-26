# xAPI - IMS Caliper utility

The xAPI - IMS Caliper utility converts learning activities into [xAPI](https://github.com/adlnet/xAPI-Spec) and [IMS Caliper](https://www.imsglobal.org/activity/caliperram) compatible statements.
Using an easy-to-use API, it aims to abstract away the details of these specifications and ensures a consistent use of statement vocabulary across applications.

## Installation

The xAPI - IMS Caliper utility can be included in your project through npm:

```
npm install xapicaliper
```

The utility can then be pulled into a file using:

```
var xapicaliper = require('xapicaliper');
```

## Usage

The xAPI - IMS Caliper utility provides a separate transformation function for each type of activity.
However, all of these functions have the same signature:

```
xapicaliper.<domain>.<type>(config, statement, callback);
```

##### config

The config object can have the following properties:

* **`type`**                    (optional):             The type of learning activity statement to generate. One of `xapicaliper.CONSTANTS.TYPE.XAPI` or `xapicaliper.CONSTANTS.TYPE.CALIPER`. Defaults to xAPI
* **`platform`**                (required):             The information about the platform generating learning activities
  * **`platform.url`**          (required):             The URL of the platform generating learning activities
  * **`platform.name`**         (required):             The name of the platform generating learning activities
  * **`platform.description`**  (optional):             The description of the platform generating learning activities
* **`lrs`**                     (optional):             The LRS configuration values. This should only be provided when this utility should also store the generated xAPI or Caliper statement in a Learning Record Store
  * **`lrs.endpoint`**          (optional):             The URL to the endpoint used for storing new xAPI or Caliper statements
  * **`lrs.username`**          (optional):             The LRS username
  * **`lrs.password`**          (optional):             The LRS password

An example config object could look like this:

```
{
  'type': xapicaliper.CONSTANTS.TYPE.CALIPER,             // A Caliper statement will be generated
  'platform': {
    'url': 'https://bcourses.berkeley.edu/',
    'name': 'bCourses',
    'description': 'The UC Berkeley LMS'
  },
  'lrs': {                                                // Leave this empty to not automatically store the generated statement in an LRS
    'endpoint': 'https://foo.bar/statements',             // The REST endpoint to post the generated statement to
    'username': 'POoHJjcbl',
    'password': 'kIRiY7v'
  }
}
```

##### statement

The statement object contains the information about the learning activity and always contains the following properties:

* **`timestamp`**               (optional):             The time at which the learning activity took place. Defaults to the current time
* **`actor`**                   (required):             The user performing the action described by the learning activity
  * **`actor.id`**              (required):             The URL of the user account
  * **`actor.id_source`**       (required):             The canonical home page for the system the user's account is on. `openid` when an OpenId user id has been provided
  * **`actor.name`**            (optional):             The display name of the user
  * **`actor.email`**           (optional):             The email address of the user. This can also be an SHA1 sum of the email address in case the email address needs to be hashed before it can be used
  * **`actor.created`**         (optional):             The date at which the user was created
  * **`actor.updated`**         (optional):             The date at which the user was last updated
* **`context`**                 (optional):             Object that describes the context in which a learning activity took place (e.g., course)
  * **`context.id`**            (required):             The URL of the context
  * **`context.name`**          (required):             The name of the context (e.g., course name)
  * **`context.description`**   (required):             The description of the context (e.g., course description)
* **`metadata`**                (required):             The metadata that describes the learning activity. Every type of learning activity requires a different set of metadata

##### callback


## Learning Activities

The xAPI - Caliper utility currently supports the following learning activies:

### Session Activities

#### Login

#### Logout

#### Navigate to course

#### Navigate to page