var fs = require('fs');
var path = require('path');
var async = require('async');
var sharp = require('sharp');
var assert = require('chai').assert;
var exec = require('child_process').exec;

var metadata = function(fullPath, fn) {
  sharp(fullPath).metadata(fn);
}

var originalPath = function(filename) {
  filename = filename || '';
  return path.normalize(__dirname + '/originals/' + filename);
}

var outputPath = function(filename) {
  filename = filename || '';
  return path.normalize(__dirname + '/output/' + filename);
}

var cleanOutput = function(fn) {
  fs.readdir(outputPath(), function(err, list) {
    if (err) {
      console.error(err);
      return fn(err);
    }

    async.each(list, function(filename, nextFile) {
      if (filename === 'empty') {
        return nextFile();
      }

      fs.unlink(outputPath(filename), nextFile);
    }, function(err) {
      if (err) {
        console.error('Unlink file: ', err);
      }
      return fn();
    });
  });
}

describe('Convert single file', function() {
  this.timeout(15000);
  beforeEach(function(done) {
    cleanOutput(done);
  });

  it('4:3 to 3:4 (JPEG format)', function(done) {
    exec('printprep ' + originalPath('4-3.jpg') + ' ' + outputPath('3-4.jpg'), function(err) {
      assert.isNull(err, err);

      async.parallel({
        original: function(callback) {
          metadata(originalPath('4-3.jpg'), callback);
        },
        output: function(callback) {
          metadata(outputPath('3-4.jpg'), callback);
        }
      }, function(err, data) {
        assert.isNull(err, err);
        assert.isAbove(data.output.width, data.original.width - 1, 'Output width must greater or equal than original');
        assert.isAbove(data.output.height, data.original.height - 1, 'Output height must greater or equal than original');
        done();
      });
    });
  });

  it('4:3 to 3:4 (PNG format)', function(done) {
    exec('printprep ' + originalPath('4-3.png') + ' ' + outputPath('3-4.png'), function(err) {
      assert.isNull(err, err);

      async.parallel({
        original: function(callback) {
          metadata(originalPath('4-3.png'), callback);
        },
        output: function(callback) {
          metadata(outputPath('3-4.png'), callback);
        }
      }, function(err, data) {
        assert.isNull(err, err);
        assert.isAbove(data.output.width, data.original.width - 1, 'Output width must greater or equal than original');
        assert.isAbove(data.output.height, data.original.height - 1, 'Output height must greater or equal than original');
        done();
      });
    });
  });

  // COVER: source is file but output is directory. (accept, output file name will same as original)
});

describe('Convert multiple files', function() {
  this.timeout(15000);
  beforeEach(function(done) {
    cleanOutput(done);
  });

  it('source is directory but output is file.', function(done) {
    exec('printprep ' + originalPath() + ' ' + outputPath('a-file.jpg'), function(err) {
      assert.isNotNull(err, 'Output must is a directory');
      done();
    });
  });

  it.skip('source is directory and output is directory', function(done) {
    exec('printprep ' + originalPath() + ' ' + outputPath(), function(err, a, b) {
      assert.isNull(err, err);

      fs.readdir(outputPath(), function(err, list) {
        assert.isNull(err, err);

        async.each(list, function(filename, nextFile) {
          console.log('File: ', filename);
          nextFile();
        }, function() {
          done();
        });
      });
    });
  });
});

describe('Clean up', function() {
  it('output folder', function(done) {
    cleanOutput(done);
  });
});
