
(function (root, factory) {
  'use strict';

  if (typeof define === 'function' && define.amd) {
    define([], function () { return factory(root); });
  } else {
    root.saveAs = root.saveAs || factory(root);
  }

})(this, function saveAsFactory(root, undefined) {
  'use strict';

if (root.navigator !== undefined) {

  /*
   * IE <10 is explicitly unsupported
   */
  if (/MSIE [1-9]\./.test(root.navigator.userAgent)) {
    return;
  }

  /*
   * IE 10+ (native saveAs)
   */
  if (root.navigator.msSaveOrOpenBlob) {
    return nativeIeSaveAs;
  }

}

function nativeIeSaveAs(blob, name) {
  return root.navigator.msSaveOrOpenBlob(autoBom(blob), name);
}


// `self` is undefined in Firefox for Android content script context
// while `this` is nsIContentFrameMessageManager
// with an attribute `content` that corresponds to the window
var view = root.self || root.window || root.content;
var saveLinkElement = view.document.createElementNS('http://www.w3.org/1999/xhtml', 'a');
var canUseSaveLink = 'download' in saveLinkElement;
var webkitReqFs = view.webkitRequestFileSystem;
var reqFs = view.requestFileSystem || webkitReqFs || view.mozRequestFileSystem;
var forceSaveableType = 'application/octet-stream';
var fsMinSize = 0;

// See https://code.google.com/p/chromium/issues/detail?id=375297#c7 and
// https://github.com/eligrey/FileSaver.js/commit/485930a#commitcomment-8768047
// for the reasoning behind the timeout and revocation flow
var arbitraryRevokeTimeout = 500;
var setImmediate = view.setImmediate || view.setTimeout;

function saveAs(blob, name) {
  return new FileSaver(blob, name);
}


var FSProto = FileSaver.prototype;
FSProto.abort = fileSaverAbort;
FSProto.INIT = 0;
FSProto.WRITING = 1;
FSProto.DONE = 2;
FSProto.readyState = FSProto.INIT;
FSProto.error = null;
FSProto.onwritestart = null;
FSProto.onprogress = null;
FSProto.onwrite = null;
FSProto.onabort = null;
FSProto.onerror = null;
FSProto.onwriteend = null;


function FileSaver(blob, name) {
  this.blob = blob = autoBom(blob);
  this.saveUsingObjectURLs = saveUsingObjectURLs;
  this.execSave = execSave;

  // First try a.download, then web filesystem, then object URLs
  var filesaver = this;
  var type = blob.type;
  var blobChanged = false;
  var objectUrl;
  var targetView;


  filesaver.readyState = filesaver.INIT;
  name = name || 'download';

  if ( canUseSaveLink ) {
    return saveUsingLinkElement();
  }

  fixChromeSaveableType();
  fixWebKitDownload();


  if ( ! reqFs ) {
    return saveUsingObjectURLs();
  }

  return saveUsingFyleSystem(filesaver);


  ////////////////

  function saveUsingLinkElement() {
    objectUrl = getURL().createObjectURL(blob);
    saveLinkElement.href = objectUrl;
    saveLinkElement.download = name;

    setImmediate(function () {
      triggerClickOnSaveLink();
      dispatchAll(filesaver);
      revoke(objectUrl);
      filesaver.readyState = filesaver.DONE;
    }, 0);
  }

  function fixChromeSaveableType() {
    /*
     * Object and web filesystem URLs have a problem saving in Google Chrome when
     * viewed in a tab, so I force save with application/octet-stream
     * http://code.google.com/p/chromium/issues/detail?id=91158
     * Update: Google errantly closed 91158, I submitted it again:
     * https://code.google.com/p/chromium/issues/detail?id=389642
     */
    if (view.chrome && type && type !== forceSaveableType) {
      var slice = blob.slice || blob.webkitSlice;
      blob = slice.call(blob, 0, blob.size, forceSaveableType);
      blobChanged = true;
    }
  }

  function fixWebKitDownload() {
    // Since I can't be sure that the guessed media type will trigger a download
    // in WebKit, I append .download to the filename.
    // https://bugs.webkit.org/show_bug.cgi?id=65440
    if (webkitReqFs && name !== 'download') {
      name += '.download';
    }

    if (type === forceSaveableType || webkitReqFs) {
      targetView = view;
    }
  }


  // on any filesys errors revert to saving with object URLs
  function saveUsingObjectURLs() {
    // don't create more object URLs than needed
    if (blobChanged || ! objectUrl) {
      objectUrl = getURL().createObjectURL(blob);
    }

    execSave(objectUrl);
  }


  function execSave(objectUrl, file, event) {

    if( targetView ) {
      targetView.location.href = objectUrl;
    } else {
      var newTab = view.open(objectUrl, '_blank');
      if ( newTab === undefined ) {
        /*
         * Apple do not allow window.open
         * see http://bit.ly/1kZffRI
         */
        view.location.href = objectUrl;
      }
    }


    filesaver.readyState = filesaver.DONE;

    if( ! event ) {
      dispatchAll(filesaver);
    } else {
      dispatch(filesaver, 'writeend', event);
    }

    revoke(file || objectUrl);
  }

}

function fileSaverAbort() {
  var filesaver = this;
  filesaver.readyState = filesaver.DONE;
  dispatch(filesaver, 'abort');
}


// TODO apply dispatch to FileSaver prototype
function dispatchAll(filesaver) {
  dispatch(filesaver, 'writestart progress write writeend'.split(' '));
}


function dispatch(filesaver, eventTypes, event) {
  eventTypes = [].concat(eventTypes);
  var i = eventTypes.length;
  while (i--) {
    var listener = filesaver['on' + eventTypes[i]];
    if (typeof listener === 'function') {
      try {
        listener.call(filesaver, event || filesaver);
      } catch (ex) {
        throwOutside(ex);
      }
    }
  }
}


function saveUsingFyleSystem(filesaver) {
  fsMinSize += filesaver.blob.size;
  var createIfNotFound = {create: true, exclusive: false};

  reqFs(view.TEMPORARY, fsMinSize, abortable(getFyleSystem), filesaver.saveUsingObjectURLs);

  ////////////

  function getFyleSystem(fs) {
    fs.root.getDirectory('temp', createIfNotFound, abortable(getTempDirectory), filesaver.saveUsingObjectURLs);
  }

  function getTempDirectory(dir) {
    dir.getFile(name, { create: false }, abortable(getExistentFileForRemove), abortable(existentFileNotFound) );

    /////////////

    function getExistentFileForRemove(file) {
      // delete file if it already exists
      file.remove(function() {
        save();
      });
    }

    function existentFileNotFound(ex) {
      if (ex.name === 'NotFoundError') {
        save();
      } else {
        filesaver.saveUsingObjectURLs();
      }
    }

    //////////

    function save() {
      dir.getFile(name, createIfNotFound, abortable(getFileForWrite), filesaver.saveUsingObjectURLs);
    }

    function getFileForWrite(file) {
      file.createWriter(abortable(createWriter), filesaver.saveUsingObjectURLs);

      ////////

      function createWriter(writer) {
        writer.onwriteend = onWriterEnd;
        writer.onerror = onError;

        bindEventsToWriter();

        writer.write(blob);
        filesaver.abort = onAbort;
        filesaver.readyState = filesaver.WRITING;

        ////////////

        function onWriterEnd(event) {
          filesaver.execSave(file.toURL(), file, event);
        }

        function onError() {
          var error = writer.error;
          if (error.code !== error.ABORT_ERR) {
            filesaver.saveUsingObjectURLs();
          }
        }

        function bindEventsToWriter() {
          'writestart progress write abort'.split(' ').forEach(function (event) {
            writer['on' + event] = filesaver['on' + event];
          });
        }

        function onAbort() {
          writer.abort();
          filesaver.readyState = filesaver.DONE;
        }
      }
    }
  }

  function abortable(func) {
    return function () {
      if (filesaver.readyState !== filesaver.DONE) {
        return func.apply(this, arguments);
      }
    };
  }
}


function autoBom(blob) {
  // prepend BOM for UTF-8 XML and text/* types (including HTML)
  if (/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(blob.type)) {
    return new Blob(['\ufeff', blob], {type: blob.type});
  }

  return blob;
}

// only get URL when necessary in case Blob.js hasn't overridden it yet
function getURL() {
  return view.URL || view.webkitURL || view;
}

function revoke(file) {
  setTimeout(revoker, arbitraryRevokeTimeout);

  ///////////

  function revoker() {
    if (typeof file === 'string') { // file is an object URL
      getURL().revokeObjectURL(file);
    } else { // file is a File
      file.remove(function(){});
    }
  }
}



function throwOutside(ex) {
  setImmediate(function () {
    throw ex;
  }, 0);
}

function triggerClickOnSaveLink() {
  var event = new MouseEvent('click');
  saveLinkElement.dispatchEvent(event);
}


  return saveAs;
});
