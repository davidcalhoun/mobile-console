(function(){
  if(window.MCONSOLE) {
    MCONSOLE.show();
  } else {
    window.MCONSOLE = {};
    
    var $, Util;
    
    /* quick and dirty helper functions */
    $ = function(id) {
      return document.getElementById(id);
    }
    Util = {      
      get: function(selector, scope) {
        scope || (scope = document);
        return scope.querySelector(selector);
      },

      getAll: function(selector, scope) {
        scope || (scope = document);
        return scope.querySelectorAll(selector);
      },
      
      on: function(elt, evt, fn) {
        elt || (elt = document);
        elt.addEventListener(evt, fn, false);
      },

      setClass: function(elt, theClass) {
        //warning: erases the previous class!
        elt.setAttribute('class', theClass);
      },

      getClass: function(elt) {
        return elt.getAttribute('class');
      },
      
      hasStyle: function(elt, theStyle) {
        var eltStyle = Util.getStyle(elt);
        
        return eltStyle && Util.getStyle(elt).match(theStyle);
      },
      
      setStyle: function(elt, theStyle) {
        elt.setAttribute('style', theStyle);
      },
      
      addStyle: function(elt, theStyle) {
        // TODO: make this not suck
        if(!Util.hasStyle(elt, theStyle)) {
          elt.setAttribute('style', Util.getStyle(elt) + theStyle);
        }
      },
      
      getStyle: function(elt) {
        var style = elt.getAttribute('style');
        
        if(!style) style = '';
        
        return style;
      },

      scrollTop: function() {
        window.scrollTo(0, 0);
      }
    }
    
    // array of log messages
    MCONSOLE.logs = [];

    // DOM elements
    MCONSOLE.mconsole      = null;
    MCONSOLE.mconsoleLog   = null;
    MCONSOLE.mconsoleForm  = null;
    MCONSOLE.mconsoleInput = null;
    MCONSOLE.mconsoleNew   = null;
    MCONSOLE.mconsoleClose = null;
    MCONSOLE.userIsTyping  = false;
    MCONSOLE.hasFixedPositioning = null;
    MCONSOLE.positionCSS = null;
    MCONSOLE.scrollTimeout = null;
    MCONSOLE.userClosed = false;

    // safely converts an object to a JSON string
    MCONSOLE.sanitize = function(txt) {
      if(typeof txt == undefined || typeof txt != 'object') return txt;

      // do something special if txt is an object
      var output, x;

      // create a new object to get around circular references
      output = {};
      for(x in txt) {
          // type conversion of each element to a string
          output[x] = txt[x] + '';
      }
      output = JSON.stringify(output, null, 2);

      return output;
    }
    

    MCONSOLE.init = function() {
      var style = document.createElement('style');
      
      // TODO: match Android < 2.2 with this viewport: <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
      if(true || navigator.userAgent.match(/iPhone|iPad|iPod/gi)) {
        MCONSOLE.positionCSS = 'position:absolute;';
        MCONSOLE.hasFixedPositioning = false;
      } else {
        MCONSOLE.positionCSS = 'position:fixed; bottom: 0;';
        MCONSOLE.hasFixedPositioning = true;
      }
      
      style.innerHTML = '#mconsole {-moz-box-sizing:border-box; -webkit-box-sizing: border-box;box-sizing:border-box; font-size: 10px; background: rgba(150,150,150,0.4); width: 100%;' + MCONSOLE.positionCSS + ';left: 0;} #mconsole.show{left: 0;} #mconsole.hide{left: -1000px;} #mconsoleNew {z-index: 999999; position: relative; font-size: 200%; float: right; margin-right: 0.50em; display: block;} #mconsoleClose {margin-right: 0.25em; position: relative; z-index: 999999; font-size: 200%; float: right; display: block;} #mconsole pre {width: 100%; height: 2em; margin: 0; position: absolute; top: 0px;} #mconsole input {-webkit-appearance: none; z-index: 1000000; position: relative; background-color: rgba(0,0,0,0.6); color: #E6E6E6; -moz-box-sizing:border-box; -webkit-box-sizing: border-box;box-sizing:border-box; width: 100%; margin: 4em 0 0; border: 0; padding: 0;} #mconsole input::-webkit-input-placeholder { color: #E6E6E6; } #mconsole input:-moz-placeholder { color: #E6E6E6; }';
      
      MCONSOLE.mconsole = document.createElement('div');
      MCONSOLE.mconsole.id = 'mconsole';
      Util.setClass(MCONSOLE.mconsole, 'hide');
      MCONSOLE.mconsole.innerHTML = '<a href="#" id="mconsoleClose">x</a><a href="#" id="mconsoleNew">+</a><pre id="mconsoleLog"></pre><form id="mconsoleForm"><input type="text" id="mconsoleInput" placeholder="console (type here...)"></form>';
      
      MCONSOLE.mconsole.appendChild(style);
      document.body.appendChild(MCONSOLE.mconsole);
      
      //MCONSOLE.mconsole      = $('mconsole');
      MCONSOLE.mconsoleLog   = $('mconsoleLog');
      MCONSOLE.mconsoleForm  = $('mconsoleForm');
      MCONSOLE.mconsoleInput = $('mconsoleInput');
      MCONSOLE.mconsoleNew   = $('mconsoleNew');
      MCONSOLE.mconsoleClose = $('mconsoleClose');
      
      MCONSOLE.addListeners();
      MCONSOLE.updatePosition();
      MCONSOLE.show();
    }
    
    
    MCONSOLE.updatePosition = function() {
      var offset = window.pageYOffset + window.innerHeight - MCONSOLE.mconsole.offsetHeight;
      
      if(!MCONSOLE.hasFixedPositioning) {
        //Util.setStyle(MCONSOLE.mconsole, '-webkit-transform:translate3d(0,' + offset + 'px,0)');
        Util.setStyle(MCONSOLE.mconsole, 'top:' + offset + 'px;');
      }
    }
    
    MCONSOLE.addListeners = function() {
      Util.on(MCONSOLE.mconsoleInput, 'focus', function(e){
        MCONSOLE.userIsTyping = true;
      });
      
      Util.on(MCONSOLE.mconsoleInput, 'blur', function(e){
        MCONSOLE.userIsTyping = false;
        MCONSOLE.updatePosition();
      });
      
      Util.on(window, 'scroll', function(e){
        if(!MCONSOLE.userIsTyping) {
          MCONSOLE.scrollTimeout = setTimeout(MCONSOLE.show, 50);
        }
      });
      
      Util.on(MCONSOLE.mconsoleForm, 'submit', function(e){
        e.preventDefault();
        
        try{
          var output = eval(MCONSOLE.mconsoleInput.value);
          console.log(MCONSOLE.mconsoleInput.value + ' = ' + MCONSOLE.sanitize(output));
        } catch(err) {
          console.log(MCONSOLE.mconsoleInput.value + ' = ' + err.text);
        }
        
        MCONSOLE.mconsoleInput.value = '';
      });
      
      Util.on(MCONSOLE.mconsoleNew, 'click', function(e){
        e.preventDefault();
        MCONSOLE.newWindow();
      });
      
      Util.on(MCONSOLE.mconsoleClose, 'click', function(e){
        e.preventDefault();
        MCONSOLE.hide(true);
      });

    }
    
    MCONSOLE.otherWindow = null;
    MCONSOLE.newWindow = function() {
      // thanks to Docsource
      MCONSOLE.otherWindow = window.open();
      if(MCONSOLE.otherWindow) {
        setTimeout(function(){
          MCONSOLE.otherWindow.document.write('<!doctype html><html><head><title>mobile-console</title><meta name="viewport" content="width=device-width, initial-scale=1.0"/><style>body {font-width: 18px;}</style></head><body><h1>mobile-console</h1><pre>' + MCONSOLE.mconsoleLog.innerHTML + '</pre></body></html>');
          MCONSOLE.otherWindow.document.close();
        }, 500);
      }
    }

    MCONSOLE.show = function() {
      if(!MCONSOLE.userClosed) {
        MCONSOLE.updatePosition();
        Util.setClass(MCONSOLE.mconsole, 'show');
      }
    }
    
    MCONSOLE.hide = function(userInitiated) {
      Util.setClass(MCONSOLE.mconsole, 'hide');
      if(userInitiated) {
        MCONSOLE.userClosed = true;
        // TODO: cleanup listeners, DOM, etc.
      }
      
    }
    
    MCONSOLE.addLog = function(stuff) {
      //alert(stuff);
      MCONSOLE.logs.push(stuff);
      
      MCONSOLE.mconsoleLog.innerHTML = stuff + '<br>' + MCONSOLE.mconsoleLog.innerHTML;
    }
    
    // overwrite console.log() (blasphemy!)
    console.log = function(stuff) {
      
      // variable declarations
      var http, url, params, stuffStringified;

      stuffStringified = MCONSOLE.sanitize(stuff);

      MCONSOLE.addLog(stuffStringified);

      // ajax request
      http = new XMLHttpRequest();
      url = "//davidbcalhoun.com/console/post.php";
      params = "log=" + Date.now() + ' ' + escape(stuffStringified);
      http.open("POST", url, true);
      http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      http.send(params);
    }
    
    MCONSOLE.init();

  }
})();
