module.exports = {
  'ASSESSMENT': {
    'id' : 'http://adlnet.gov/expapi/activities/assessment',
    'name': {
      'en-US': 'assessment'
    },
    'description': {
      'en-US': 'An assessment is an activity that determines a learner\'s mastery of a particular subject area. An assessment typically has one or more questions.'
    }
  },
  'COURSE': {
    'id' : 'http://adlnet.gov/expapi/activities/course',
    'name': {
      'en-US': 'course'
    },
    'description': {
      'en-US': 'A course represents an entire "content package" worth of material. The largest level of granularity. Unless flat, a course consists of multiple modules. A course is not content.'
    }
  },
  'DISCUSSION': {
    'id' : 'http://id.tincanapi.com/activitytype/discussion',
    'name': {
      'en-US': 'discussion'
    },
    'description': {
      'en-US': 'Represents an ongoing conversation between persons, such as an email thread or a forum topic.'
    }
  },
  'FILE': {
    'id' : 'http://activitystrea.ms/schema/1.0/file',
    'name': {
      'en-US': 'file'
    },
    'description': {
      'en-US': 'Represents any form of document or file. Objects of this type MAY contain an additional fileUrl property whose value a dereferenceable IRI that can be used to retrieve the file; and an additional mimeType property whose value is the MIME type of the file described by the object.'
    }
  },
  'PAGE': {
    'id': 'http://activitystrea.ms/schema/1.0/page',
    'name': {
      'en-US': 'page'
    },
    'description': {
      'en-US': 'Represents an area, typically a web page, that is representative of, and generally managed by a particular entity. Such areas are usually dedicated to displaying descriptive information about the entity and showcasing recent content such as articles, photographs and videos. Most social networking applications, for example, provide individual users with their own dedicated "profile" pages. Several allow similar types of pages to be created for commercial entities, organizations or events. While the specific details of how pages are implemented, their characteristics and use may vary, the one unifying property is that they are typically "owned" by a single entity that is represented by the content provided by the page itself.'
    }
  }
};
