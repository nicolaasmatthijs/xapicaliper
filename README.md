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

#####xapicaliper.course.create(config, statement, callback)

A learning activity where a user creates a new course.

The following metadata properties can be provided:

* **`id`**            (required):             The URL of the course
* **`name`**          (required):             The name of the course
* **`description`**   (optional):             The description of the course
* **`start`**         (optional):             The time at which the course starts
* **`end`**           (optional):             The time at which the course ends

An example could look like this:

```
xapicaliper.course.create({ <see config> }, {
  <see statement>,
  'metadata': {
    'id': 'https://bcourses.berkeley.edu/api/v1/courses/111',
    'name': 'Biology 101',
    'description': 'Introductory course in Biology',
    'start': '2014-03-01T01:28:12.000Z',
    'end': '2014-06-01T23:59:59.000Z'
  }
}, function() { <see callback> });
```

#### Enroll course

#####xapicaliper.course.enroll(config, statement, callback)

A learning activity where a user enrolls in a course.

The following metadata properties can be provided:

* **`course`**        (required):             The URL of the course in which the student enrolls

An example could look like this:

```
xapicaliper.course.enroll({ <see config> }, {
  <see statement>,
  'metadata': {
    'course': 'https://bcourses.berkeley.edu/api/v1/courses/111'
  }
}, function() { <see callback> });
```

#### Leave course

#####xapicaliper.course.leave(config, statement, callback)

A learning activity where a user leaves a course.

The following metadata properties can be provided:

* **`course`**        (required):             The URL of the course the student leaves

An example could look like this:

```
xapicaliper.course.leave({ <see config> }, {
  <see statement>,
  'metadata': {
    'course': 'https://bcourses.berkeley.edu/api/v1/courses/111'
  }
}, function() { <see callback> });
```

### Assignment Activities

#### Create assignment

#####xapicaliper.assignment.create(config, statement, callback)

A learning activity where a user creates a new assignment.

The following metadata properties can be provided:

* **`id`**                  (required):             The URL of the assignment
* **`title`**               (required):             The title of the assignment
* **`description`**         (optional):             The description of the assignment
* **`due_at`**              (optional):             The due date of the assignment
* **`max_points`**          (optional):             The maximum number of points for the assignment
* **`submission_types`**    (optional):             An array of accepted submission types for the assignment entry

An example could look like this:

```
xapicaliper.assignment.create({ <see config> }, {
  <see statement>,
  'metadata': {
    'id': 'https://bcourses.berkeley.edu/api/v1/courses/111/assignments/333',
    'title': 'Farm Animals Midterm',
    'description': 'The midterm on Farm Animals in Medieval England',
    'due_at': '2014-03-01T01:28:12.000Z',
    'max_points': 50,
    'submission_types': ['online_quiz', 'online_upload']
  }
}, function() { <see callback> });
```

#### View assignment

#####xapicaliper.assignment.view(config, statement, callback)

A learning activity where a user views an assignment.

The following metadata properties can be provided:

* **`assignment`**          (required):             The URL of the assignment that was viewed

An example could look like this:

```
xapicaliper.assignment.view({ <see config> }, {
  <see statement>,
  'metadata': {
    'assignment': 'https://bcourses.berkeley.edu/api/v1/courses/111/assignments/333',
  }
}, function() { <see callback> });
```

#### Submit assignment

#####xapicaliper.assignment.submit(config, statement, callback)

A learning activity where a user submits an assignment submission.

The following metadata properties can be provided:

* **`id`**                  (required):             The URL of the assignment submission
* **`assignment`**          (required):             The URL of the assignment for the submission
* **`submission`**          (optional):             The content of the assignment submission. This can be a text response or a link to the response

An example could look like this:

```
xapicaliper.assignment.submit({ <see config> }, {
  <see statement>,
  'metadata': {
    'id': 'https://bcourses.berkeley.edu/api/v1/courses/111/assignments/333/submissions/987',
    'assignment': 'https://bcourses.berkeley.edu/api/v1/courses/111/assignments/333',
    'submission': 'https://bcourses.berkeley.edu/api/v1/courses/111/files/444/download'
  }
}, function() { <see callback> });
```

#### Grade assignment

#####xapicaliper.assignment.grade(config, statement, callback)

A learning activity where a user grades an assignment submission.

The following metadata properties can be provided:

* **`id`**                 (required):             The URL of the assignment submission that is graded
* **`grade`**              (required):             The grade for the assignment submission
* **`grade_min`**          (optional):             The minimum possible grade for the assignment
* **`grade_max`**          (optional):             The maximum possible grade for the assignment

An example could look like this:

```
xapicaliper.assignment.submit({ <see config> }, {
  <see statement>,
  'metadata': {
    'id': 'https://bcourses.berkeley.edu/api/v1/courses/111/assignments/333/submissions/987',
    'grade': 45,
    'grade_min': 0,
    'grade_max': 50
  }
}, function() { <see callback> });
```

#### Assignment feedback

#####xapicaliper.assignment.feedback(config, statement, callback)

A learning activity where a user provides feedback on an assignment submission.

The following metadata properties can be provided:

* **`id`**                 (required):             The URL of the assignment submission feedback
* **`submission`**         (required):             The URL of the assignment submission for the feedback
* **`feedback`**           (required):             The feedback provided on the assignment submission

An example could look like this:

```
xapicaliper.assignment.feedback({ <see config> }, {
  <see statement>,
  'metadata': {
    'id': 'https://bcourses.berkeley.edu/api/v1/courses/111/assignments/333/submissions/987/feedback/579',
    'submission': 'https://bcourses.berkeley.edu/api/v1/courses/111/assignments/333/submissions/987',
    'feedback': 'Excellent work!'
  }
}, function() { <see callback> });
```

### Discussion Activities

#### Start discussion

#####xapicaliper.discussion.start(config, statement, callback)

A learning activity where a user starts a new discussion.

The following metadata properties can be provided:

* **`id`**            (required):             The URL of the discussion
* **`title`**         (required):             The title of the discussion
* **`body`**          (optional):             The body of the discussion

An example could look like this:

```
xapicaliper.discussion.start({ <see config> }, {
  <see statement>,
  'metadata': {
    'id': 'https://bcourses.berkeley.edu/api/v1/courses/111/discussions/222',
    'title': 'Farm Animals Discussion',
    'body': 'An informative discussion about your favourite farm animal'
  }
}, function() { <see callback> });
```

#### Read discussion

#####xapicaliper.discussion.read(config, statement, callback)

A learning activity where a user reads a discussion.

The following metadata properties can be provided:

* **`discussion`**    (required):             The URL of the discussion that was read

An example could look like this:

```
xapicaliper.discussion.read({ <see config> }, {
  <see statement>,
  'metadata': {
    'discussion': 'https://bcourses.berkeley.edu/api/v1/courses/111/discussions/222'
  }
}, function() { <see callback> });
```

#### Post to discussion

#####xapicaliper.discussion.post(config, statement, callback)

A learning activity where a user posts to a discussion.

The following metadata properties can be provided:

* **`id`**            (required):             The URL of the discussion entry that was posted
* **`body`**          (required):             The body of the discussion entry
* **`discussion`**    (required):             The URL of the discussion the discussion entry is made in
* **`parent`**        (optional):             The URL of the discussion entry to which this discussion entry is a reply

An example could look like this:

```
xapicaliper.discussion.post({ <see config> }, {
  <see statement>,
  'metadata': {
    'id': 'https://bcourses.berkeley.edu/api/v1/courses/111/discussions/222/entries/456',
    'body': 'I love chickens',
    'discussion': 'https://bcourses.berkeley.edu/api/v1/courses/111/discussions/222',
    'parent': 'https://bcourses.berkeley.edu/api/v1/courses/111/discussions/222/entries/123'
  }
}, function() { <see callback> });
```

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
