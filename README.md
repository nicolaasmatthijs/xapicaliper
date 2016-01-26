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

The callback function is a standard callback function that is executed when the learning activity statement has been generated and stored in the configured Learning Record Store, if any.

It can be used in the following way:

```
xapicaliper.<domain>.<type>(config, statement, function(err, statement) {
  if (err) {
    // An error occured while generating or storing the statement
  }

  // Print the generated learning activity statement
  console.log(statement);
});
```

## Learning Activities

The xAPI - Caliper utility currently supports the following learning activies:

### Session Activities

#### Login

#####xapicaliper.session.login(config, statement, callback)

A learning activity where a user logs in to a system.

The following metadata properties can be provided:

* **`id`**            (required):             The URL of the session generated by logging in

An example could look like this:

```
xapicaliper.session.login({ <see config> }, {
  <see statement>,
  'metadata': {
    'id': 'https://bcourses.berkeley.edu/api/v1/sessions/6cc96b98-6968-4cc4-aa98-6b6d94606970'
  }
}, function() { <see callback> });
```

#### Logout

#####xapicaliper.session.logout(config, statement, callback)

A learning activity where a user logs out of a system.

```
xapicaliper.session.login({ <see config> }, {
  <see statement>,
  'metadata': {},
}, function() { <see callback> });
```

#### Navigate to course

#####xapicaliper.session.navigateToCourse(config, statement, callback)

A learning activity where a user logs in to a system.

The following metadata properties can be provided:

* **`id`**            (required):             The URL of the course
* **`name`**          (required):             The name of the course
* **`description`**   (optional):             The description of the course

An example could look like this:

```
xapicaliper.session.navigateToCourse({ <see config> }, {
  <see statement>,
  'metadata': {
    'id': 'https://bcourses.berkeley.edu/api/v1/courses/111',
    'name': 'Biology 101',
    'description': 'Introductory course in Biology'
  }
}, function() { <see callback> });
```

#### Navigate to page

#####xapicaliper.session.navigateToPage(config, statement, callback)

A learning activity where a user navigates to a page.

The following metadata properties can be provided:

* **`id`**            (required):             The URL of the page
* **`name`**          (optional):             The name of the page

An example could look like this:

```
xapicaliper.session.navigateToPage({ <see config> }, {
  <see statement>,
  'metadata': {
    'id': 'https://bcourses.berkeley.edu/api/v1/courses/111/assignments',
    'name': 'Assignments Tool'
  }
}, function() { <see callback> });
```

### Course Activities

#### Create course

#### Enroll course

#### Leave course

### Assignment Activities

#### Create assignment

#### View assignment

#### Submit assignment

#### Grade assignment

#### Assignment feedback

### Discussion Activities

#### Start discussion

#### Read discussion

#### Post to discussion

### File Activities

#### Upload file

#####xapicaliper.file.upload(config, statement, callback)

A learning activity where a user uploads a new file.

The following metadata properties can be provided:

* **`id`**            (required):             The URL of the file that was uploaded
* **`title`**         (required):             The title of the file
* **`description`**   (optional):             The description of the file
* **`url`**           (optional):             The URL at which the file can be downloaded
* **`size`**          (optional):             The size of the file in bytes
* **`mime_type`**     (optional):             The mime type of the file

An example could look like this:

```
xapicaliper.file.upload({ <see config> }, {
  <see statement>,
  'metadata': {
    'id': 'https://bcourses.berkeley.edu/api/v1/courses/111/files/444',
    'title': 'Syllabus 101.pdf',
    'description': 'The syllabus for Biology 101',
    'url': 'https://bcourses.berkeley.edu/api/v1/courses/111/files/444/download',
    'size': 1234,
    'mime_type': 'application/pdf'
  }
}, function() { <see callback> });
```

#### Preview file

#####xapicaliper.file.preview(config, statement, callback)

A learning activity where a user previews a file.

The following metadata properties can be provided:

* **`file`**          (required):             The URL of the file that was downloaded

An example could look like this:

```
xapicaliper.file.preview({ <see config> }, {
  <see statement>,
  'metadata': {
    'file': 'https://bcourses.berkeley.edu/api/v1/courses/111/files/444'
  }
}, function() { <see callback> });
```

#### Download file

#####xapicaliper.file.download(config, statement, callback)

A learning activity where a user downloads a file.

The following metadata properties can be provided:

* **`file`**          (required):             The URL of the file that was downloaded

An example could look like this:

```
xapicaliper.file.download({ <see config> }, {
  <see statement>,
  'metadata': {
    'file': 'https://bcourses.berkeley.edu/api/v1/courses/111/files/444'
  }
}, function() { <see callback> });
```
