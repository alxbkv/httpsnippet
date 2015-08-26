'use strict'

var util = require('util')
var CodeBuilder = require('../../helpers/code-builder')

module.exports = function(source, options) {

  var opts = util._extend({
    indent: '  '
  }, options)

  var code = new CodeBuilder(opts.indent)

  var mimeTypes = {
    'application/json': 'MediaType.APPLICATION_JSON',
    'application/x-json': 'MediaType.APPLICATION_JSON',
    'application/xml': 'MediaType.APPLICATION_XML',
    'application/yaml': 'MediaType.APPLICATION_YAML',
    'application/x-yaml': 'MediaType.APPLICATION_YAML',
    'text/yaml': 'MediaType.APPLICATION_YAML',
    'text/plain': 'MediaType.TEXT_PLAIN'
  };

  var methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD']

  var headers = source.allHeaders;

  code.push('ClientResource cr = new ClientResource("%s");', source.fullUrl)

  if (mimeTypes[headers['accept']]) {
    code.push('cr.accept(' + mimeTypes[headers['content-type']] + ');');
  }

  if (headers['authorization']) {
    code.push('ChallengeResponse credentials = new ChallengeResponse(ChallengeScheme.HTTP_BASIC);')
    code.push(4, 'credentials')
    code.push(8, '.setRawValue("%s");', headers['authorization'].replace('Basic ', ''))
    code.push(4, 'cr.setChallengeResponse(credentials);')
  }

  code.push('try {')

  if (methods.indexOf(source.method.toUpperCase()) === -1) {
    // TODO what to do with undefined method ?
  } else {

    if (['POST', 'PUT', 'PATCH'].indexOf(source.method.toUpperCase()) !== -1) {

      if (source.postData.text) {
        code.push(2, 'Representation representation = cr')
        code.push(6, '.%s(new StringRepresentation(', source.method.toLowerCase())
        code.push(10, '%s,', JSON.stringify(source.postData.text))

        if (mimeTypes[source.postData.mimeType]) {
          code.push(10, '%s));', mimeTypes[source.postData.mimeType]);
        } else {
          code.push(10, 'MediaType.TEXT_PLAIN));');
        }

      }

    } else {
      code.push(2, 'Representation representation = cr.' + source.method.toLowerCase() + '();')
    }
    code.push(2, 'System.out.println(representation.getText());');

    code.push('} catch (ResourceException e) {')
    code.push(2, 'System.err.println("Status: " + e.getStatus() + ". Response: " + cr.getResponse().getEntityAsText());')
    code.push('} catch (IOException e) {')
    code.push(2, 'e.printStackTrace();')
    code.push('}')
  }

  return code.join()
}

module.exports.info = {
  key: 'restlet',
  title: 'Restlet Framework',
  link: 'http://restlet.com/products/restlet-framework/',
  description: 'The most widely used open source solution for Java developers who want to create and use APIs'
}