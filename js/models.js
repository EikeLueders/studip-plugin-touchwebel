
/*
# Copyright (c) 2012 - <mlunzena@uos.de>
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all
# copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
# SOFTWARE.
*/


/*
Session is not the typical Model as one does not want to store the
password on the client side. So this is just a simple class to hold
the user`s name and id and to create a new instance by providing the
credentials.
*/


(function() {

  tw.model.Session = (function() {

    Session.authenticate = function(username, password, done, fail) {
      /*
          Instead of interacting with the RestIP plugin, we have to call our
          mothership to login as the RestIP plugin does not allow
          unauthorized endpoints as of now.
      */

      var xhr;
      xhr = $.ajax({
        url: "" + tw.PLUGIN_URL + "login",
        dataType: 'json',
        data: {
          username: username,
          password: password
        },
        type: 'POST'
      });
      /*
          Call the fail callback, if there is one.
      */

      if (fail) {
        xhr.fail(fail);
      }
      /*
          Create a new Session off the response and call the done
          callback, if there is one.
      */

      xhr.done(function(msg) {
        var session;
        session = new tw.model.Session(msg);
        if (done) {
          return done(session);
        }
      });
    };

    function Session(creds) {
      this.id = creds.id, this.name = creds.name;
    }

    /*
      Just for convenience. In Stud.IP unauthorized users have an empty
      name and "nobody" as their id.
    */


    Session.prototype.authenticated = function() {
      return this.id !== "nobody";
    };

    return Session;

  })();

  /*
  Simple wrapper around the RestipPlugin endpoint '/api/courses/:id'
  */


  tw.model.Course = Backbone.Model.extend({
    idAttribute: "course_id",
    /*
      Set endpoint URL
    */

    urlRoot: function() {
      return tw.API_URL + "api/courses/";
    },
    /*
      The response is possibly namespaced → de-namespace it.
    */

    parse: function(response) {
      return response.course || response;
    }
  });

  /*
  Another simple wrapper around the RestipPlugin endpoint
  '/api/courses'.  Needs a custom response parser, as it is namespaced
  like this: {courses: [{<1st course>}, {<2nd course>}, ...]}
  */


  tw.model.Courses = Backbone.Collection.extend({
    /*
      Use the tw.model.Course class
    */

    model: tw.model.Course,
    /*
      Set endpoint URL
    */

    url: function() {
      return tw.API_URL + "api/courses";
    },
    /*
      The response is namespaced → de-namespace it.
    */

    parse: function(response) {
      return response != null ? response.courses : void 0;
    }
  });

}).call(this);
