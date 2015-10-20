'use strict'

var util = require('util')
var CodeBuilder = require('../../helpers/code-builder')

module.exports = function (source, options) {
  var service = {}

  service.setAccept = setAccept
  service.setAuthorization = setAuthorization
  service.setCookies = setCookies

  service.setUnknownMethod = setUnknownMethod
  service.isUnknownMethod = isUnknownMethod
  service.isMethodWithPostData = isMethodWithPostData
  service.setMethodWithPostData = setMethodWithPostData

  var opts = util._extend({
    indent: '  ',
    enableHeaders: true
  }, options)

  var code = new CodeBuilder(opts.indent)

  var mimeTypes = {
    'application/json': 'MediaType.APPLICATION_JSON',
    'application/x-json': 'MediaType.APPLICATION_JSON',

    'application/xml': 'MediaType.APPLICATION_XML',
    'text/xml': 'MediaType.APPLICATION_XML',

    'application/yaml': 'MediaType.APPLICATION_YAML',
    'application/x-yaml': 'MediaType.APPLICATION_YAML',
    'text/yaml': 'MediaType.APPLICATION_YAML',

    'text/plain': 'MediaType.TEXT_PLAIN'
  }

  var methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD']
  var knownHeaders = ['accept', 'content-type', 'authorization', 'cookie']

  var headers = source.allHeaders

  code.push('import org.restlet.resource.*;')

  code.push('ClientResource cr = new ClientResource("%s");', source.fullUrl)


  service.setAccept(code, headers['accept'], mimeTypes)

  service.setAuthorization(code, headers['authorization'])

  service.setCookies(code, source['cookies'])

  if (opts.enableHeaders && headers && Object.keys(headers).length > 0) {
    var customHeaders = Object.keys(headers).filter(function (header) {
      return knownHeaders.indexOf(header) < 0
    })
    if(customHeaders.length > 0) {
      code.push('Series<Header> headers = cr.getHeaders();')
      customHeaders.forEach(function (header) {
        code.push('headers.set(%s, %s);', JSON.stringify(header), JSON.stringify(headers[header]))
      })
    }
  }

  code.push('try {')

  if (service.isUnknownMethod(source.method)) {
    service.setUnknownMethod(code, source.method)

  } else {
    if (service.isMethodWithPostData(source.method)) {
      service.setMethodWithPostData(code, source.method, source.postData, mimeTypes)

    } else {
      code.push(2, 'Representation representation = cr.' + source.method.toLowerCase() + '();')

    }
  }

  code.push(2, 'System.out.println(representation.getText());')
  code.push('} catch (ResourceException e) {')
  code.push(2, 'System.err.println("Status: " + e.getStatus() + ". Response: " + cr.getResponse().getEntityAsText());')
  code.push('}')

  return code.join()

  // TODO: implement other types of authentication
  function setAuthorization (code, authorization) {
    if (authorization) {
      code.push('ChallengeResponse credentials = new ChallengeResponse(ChallengeScheme.HTTP_BASIC);')
      code.push(4, 'credentials')
      code.push(8, '.setRawValue("%s");', authorization.replace('Basic ', ''))
      code.push(4, 'cr.setChallengeResponse(credentials);')
    }
  }

  function setCookies (code, cookies) {
    if (cookies.length > 0) {
      cookies.forEach(function (cookie) {
        code.push('cr.getCookies().add(new Cookie("%s", "%s"));', cookie.name, cookie.value)
      })

    }
  }

  function setAccept (code, accept, mimeTypes) {
    if (mimeTypes[accept]) {
      code.push('cr.accept(' + mimeTypes[accept] + ');')
    }
  }

  function setUnknownMethod (code, method) {
    code.push(2, 'cr.getRequest().setMethod(new Method("%s"));', method.toUpperCase())
    code.push(2, 'Representation representation = cr.handle();')
  }

  function setMethodWithPostData (code, method, postData, mimeTypes) {
    if (postData.text) {
      code.push(2, 'Representation representation = cr')
      code.push(6, '.%s(new StringRepresentation(', method.toLowerCase())
      code.push(10, '%s,', JSON.stringify(postData.text))

      if (mimeTypes[postData.mimeType]) {
        code.push(10, '%s));', mimeTypes[postData.mimeType])
      } else {
        code.push(10, 'MediaType.TEXT_PLAIN));')
      }

    } else {
      code.push(2, 'Representation representation = cr.%s(null);', method.toLowerCase())
    }

  }

  function isMethodWithPostData (method) {
    return ['POST', 'PUT', 'PATCH'].indexOf(method.toUpperCase()) !== -1
  }
  function isUnknownMethod (method) {
    return methods.indexOf(method.toUpperCase()) === -1
  }
}

module.exports.info = {
  key: 'restlet',
  title: 'Restlet Framework',
  link: 'http://restlet.com/products/restlet-framework/',
  description: 'The most widely used open source solution for Java developers who want to create and use APIs'
}
