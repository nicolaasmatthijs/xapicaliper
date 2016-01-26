# xAPI - IMS Caliper utility

The xAPI - IMS Caliper utility converts learning activities into [xAPI]() and [IMS Caliper]() compatible statements.
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

#### config

The config object can have the following properties:

- `type` (optional)                   The type of learning activity statement to generate. One of `xapicaliper.CONSTANTS.TYPE.XAPI` or `xapicaliper.CONSTANTS.TYPE.CALIPER`. Defaults to xAPI
- `platform` (required)               The information about the platform generating learning activities
- `platform` (required)               The URL of the platform generating learning activities
- `platform.name` (required)          The name of the platform generating learning activities
- `platform.description` (optional)   The description of the platform generating learning activities
- `lrs` (optiona;)                    The LRS configuration values. This should only be provided when this utility should also store the generated xAPI or Caliper statement in a Learning Record Store
- `lrs.endpoint` (optional)           The URL to the endpoint used for storing new xAPI or Caliper statements
- `lrs.username` (optional)           The LRS username
- `lrs.password (optional)            The LRS password

#### statement

#### callback