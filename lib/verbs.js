module.exports = {
  'ACCESSED': {
    'XAPI': {
      'id' : 'http://activitystrea.ms/schema/1.0/access',
      'name': {
        'en-US': 'accessed'
      },
      'description': {
        'en-US': 'Indicates that the actor has accessed the object. For instance, a person accessing a room, or accessing a file.'
      }
    },
    'CALIPER': null
  },
  'COMMENTED': {
    'XAPI': {
      'id' : 'http://adlnet.gov/expapi/verbs/commented',
      'name': {
        'en-US': 'commented'
      },
      'description': {
        'en-US': 'Offered an opinion or written experience of the activity. Can be used with the learner as the actor or a system as an actor.  Comments can be sent from either party with the idea that the other will read and react to the content.'
      }
    },
    'CALIPER': null
  },
  'CREATED': {
    'XAPI': {
      'id' : 'http://activitystrea.ms/schema/1.0/create',
      'name': {
        'en-US': 'created'
      },
      'description': {
        'en-US': 'Indicates that the actor has created the object.'
      }
    },
    'CALIPER': null
  },
  'LOGGED_IN': {
    'XAPI': {
      'id' : 'https://brindlewaye.com/xAPITerms/verbs/loggedin',
      'name': {
        'en-US': 'logged in'
      },
      'description': {
        'en-US': 'Logged in to some service.'
      }
    },
    'CALIPER': {
      'id': 'http://purl.imsglobal.org/vocab/caliper/v1/action#LoggedIn',
      'name': {
        'en-US': 'Logged In'
      },
      'description': {
        'en-US': 'Action indicating log in to start a session'
      }
    }
  },
  'LOGGED_OUT': {
    'XAPI': {
      'id' : 'https://brindlewaye.com/xAPITerms/verbs/loggedout/',
      'name': {
        'en-US': 'logged out'
      },
      'description': {
        'en-US': 'Logged out of some service.'
      }
    },
    'CALIPER': {
      'id' : 'http://purl.imsglobal.org/vocab/caliper/v1/action#LoggedOut',
      'name': {
        'en-US': 'Logged Out'
      },
      'description': {
        'en-US': 'Actor initiates end of session'
      }
    }
  },
  'READ': {
    'XAPI': {
      'id' : 'http://activitystrea.ms/schema/1.0/read',
      'name': {
        'en-US': 'read'
      },
      'description': {
        'en-US': 'Indicates that the actor read the object. This is typically only applicable for objects representing printed or written content, such as a book, a message or a comment. The "read" verb is a more specific form of the "consume", "experience" and "play" verbs.'
      }
    },
    'CALIPER': null
  },
  'SCORED': {
    'XAPI': {
      'id' : 'http://adlnet.gov/expapi/verbs/scored',
      'name': {
        'en-US': 'scored'
      },
      'description': {
        'en-US': 'A measure related to the learner\'s performance, typically between either 0 and 1 or 0 and 100, which corresponds to a learner\'s performance on an activity. It is expected the context property provides guidance to the allowed values of the result field.'
      }
    },
    'CALIPER': null
  },
  'STARTED': {
    'XAPI': {
      'id' : 'http://activitystrea.ms/schema/1.0/start',
      'name': {
        'en-US': 'started'
      },
      'description': {
        'en-US': 'Indicates that the actor has started the object. For instance, when a person starts a project.'
      }
    },
    'CALIPER': null
  },
  'SUBMITTED': {
    'XAPI': {
      'id' : 'http://activitystrea.ms/schema/1.0/submit',
      'name': {
        'en-US': 'submitted'
      },
      'description': {
        'en-US': 'Indicates that the actor has submitted the object. If a target is specified, it indicates the entity to which the object was submitted.'
      }
    },
    'CALIPER': null
  },
  'VIEWED': {
    'XAPI': {
      'id' : 'http://id.tincanapi.com/verb/viewed',
      'name': {
        'en-US': 'viewed'
      },
      'description': {
        'en-US': 'Indicates that the actor has viewed the object.'
      }
    },
    'CALIPER': null
  }
};
