/* global describe, it */

'use strict'

var fixtures = require('./fixtures')
var fs = require('fs')
var glob = require('glob')
var HTTPSnippet = require('../src')
var targets = require('../src/targets')
var tests = require('./tests')

require('should')

var base = './test/fixtures/output/'

// read all output files
var output = glob.sync('**/*', {
  cwd: base,
  nodir: true
}).reduce(function(obj, name) {
  obj[name] = fs.readFileSync(base + name)
  return obj
}, {})

var clearInfo = function(key) {
  return !~['info', 'index'].indexOf(key)
}

var itShouldHaveTests = function(test, func, key) {
  it(key + ' should have tests', function() {
    test.should.have.property(func)
  })
}

var itShouldHaveInfo = function(targets, key) {
  it(key + ' should have info method', function() {
    var target = targets[key]

    target.should.have.property('info').and.be.an.Object
    target.info.key.should.equal(key).and.be.a.String
    target.info.title.should.be.a.String
  })
}

var itShouldHaveRequestTestOutputFixture = function(request, target, path) {
  var fixture = target + '/' + path + request + HTTPSnippet.extname(target)

  it('should have output test for ' + request, function() {
    Object.keys(output).indexOf(fixture).should.be.greaterThan(-1, 'Missing ' + fixture + ' fixture file for target: ' + target + '. Snippet tests will be skipped.')
  })
}

var itShouldGenerateOutput = function(request, path, target, client, advanced) {
  var fixture = path + request + HTTPSnippet.extname(target)

  it('should generate ' + request + ' snippet', function() {
    if (Object.keys(output).indexOf(fixture) === -1) {
      this.skip()
    }
    if (advanced) {
      var instance = new HTTPSnippet(fixtures['advanced-requests'][request])
    }else {
      var instance = new HTTPSnippet(fixtures.requests[request])
    }
    
    var result = instance.convert(target, client) + '\n'

    result.should.be.a.String
    result.should.equal(output[fixture].toString())
  })
}

describe('Available Targets', function() {
  var targets = HTTPSnippet.availableTargets()

  targets.forEach(function(target) {
    it('available-targets.json should include ' + target.title, function() {
      fixtures['available-targets'].should.containEql(target)
    })
  })
})

// test all the things!
Object.keys(targets).forEach(function(target) {
  describe(targets[target].info.title, function() {
    itShouldHaveInfo(targets, target)

    itShouldHaveTests(tests, target, target)

    if (typeof tests[target] === 'function') {
      tests[target](HTTPSnippet, fixtures)
    }

    if (!targets[target].index) {
      describe('snippets', function() {
        Object.keys(fixtures.requests).filter(clearInfo).forEach(function(request) {
          itShouldHaveRequestTestOutputFixture(request, target, '')

          itShouldGenerateOutput(request, target + '/', target)
        })
      })
    }

    Object.keys(targets[target]).filter(clearInfo).forEach(function(client) {
      describe(client, function() {
        itShouldHaveInfo(targets[target], client)

        itShouldHaveTests(tests[target], client, client)

        if (tests[target] && typeof tests[target][client] === 'function') {
          tests[target][client](HTTPSnippet, fixtures)
        }

        describe('snippets', function() {
          Object.keys(fixtures.requests).filter(clearInfo).forEach(function(request) {
            itShouldHaveRequestTestOutputFixture(request, target, client + '/')

            itShouldGenerateOutput(request, target + '/' + client + '/', target, client)
          })
          if (client === 'restlet') {

            Object.keys(fixtures['advanced-requests']).forEach(function(request) {
              itShouldHaveRequestTestOutputFixture(request, target, client + '/')
              itShouldGenerateOutput(request, target + '/' + client + '/', target, client, true)
            });

          }
        })
      })
    })
  })
})