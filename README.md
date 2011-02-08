mobile-console
=========

### a JavaScript bookmarklet that gives you a more useful on-screen console.log(), which also broadcasts logs to a server for remote viewing.

Mobile debugging is still in its infancy. iOS has a debug console, but it doesn't allow you to peek inside objects. Android has Android Debug Bridge, which is not as user friendly and is mostly tailored toward native projects. So what's a developer to do? We'll create our own console.log, of course!

mobile-console is just that: a debug console bookmarklet for mobile devices of all shapes and sizes that can be run on any webpage using console.log. Once activated, it overrides the native console.log method (oh noes! blasphemy!) and replaces it with a much more useful on-screen console that appears at the bottom of the window. It even gives developers the ability to open up the message log in a new window, for those particularly verbose outputs.

But wait, there's more!

Most folks don't enjoy reading JavaScript on a small screen (who would've thought...), so mobile-console also sends all log messages to a server for remote viewing. The beauty of this is that it can be as simple or as complicated as the developer wants. A simple implementation uses the magic of JSON.stringify to POST the data down the wire in an XHR request, which is received by a server and stored in a log file (which can be "tail -f"'ed on a console). A more complicated example uses socket.io and node.js to ensure a smoother connection, and allows console.log output on a desktop browser.


### In progress!

What's up here now is very rough and was sort of [http://2011.jsconf.us/#/proposal/eedf3aa8dabe4621ac6c1cf7f1ffd765](cobbled together for jsconf 2011).  It'll be a bit more refined with time, with more explanation and many more revisions I'm sure.

### TODO
*   more comments in the code!
*   socket.io and node.js example
*   Add and Close button UI