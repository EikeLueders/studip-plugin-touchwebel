
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
A function combinator that makes ensures that the callback is only
valid for authorised users. Otherwise `redirect` to the #login page.
*/


(function() {
  var requireSession;

  requireSession = function() {
    return function(callback) {
      return function() {
        if (tw.$Session.authenticated()) {
          return callback.apply(this, arguments);
        } else {
          return this.navigate("login", {
            trigger: true
          });
        }
      };
    };
  };

  /*
  The singleton AppRouter containing the handlers for all the routes.
  */


  tw.router.AppRouter = Backbone.Router.extend({
    /*
      @firstPage is used to prevent sliding in the first page.
    */

    initialize: function() {
      return this.firstPage = true;
    },
    routes: {
      "": "home",
      "home": "home",
      "login": "login",
      "my-courses": "myCourses",
      "course/:id": "course"
    },
    /*
      Authorised route changing page to a HomeView.
    */

    home: requireSession()(function() {
      this.changePage(new tw.ui.HomeView());
    }),
    /*
      Authorised route changing page to a MyCoursesView.
    
      It instantiates a course collection, changes the page to the
      MyCoursesView (parameterized with that collection) and fetches the
      collection from the server. (In the process the view gets notified
      and renders itself.)
    */

    myCourses: requireSession()(function() {
      var courses,
        _this = this;
      courses = new tw.model.Courses();
      $.mobile.showPageLoadingMsg();
      courses.fetch().done(function() {
        _this.changePage(new tw.ui.MyCoursesView({
          collection: courses
        }));
      });
      /*
            # Variant B.
            courses.fetch()
            @changePage new tw.ui.MyCoursesView(collection: courses)
      */

    }),
    /*
      Authorised route changing page to a CourseView.
    
      It fetches a course, changes the page to the
      CourseView (parameterized with that course).
    */

    course: requireSession()(function(id) {
      var course,
        _this = this;
      course = new tw.model.Course({
        course_id: id
      });
      $.mobile.showPageLoadingMsg();
      course.fetch().done(function() {
        _this.changePage(new tw.ui.CourseView({
          model: course
        }));
      });
    }),
    /*
      Unauthorised route changing page to a HomeView.
    */

    login: function() {
      this.changePage(new tw.ui.LoginView());
    },
    /*
      Internal function to be used by the route handlers.
    
      `page` is a Backbone.View which is added as a jQuery mobile page to
      the pageContainer. Eventually, after all the setup mojo and
      everything is in place, the `jQuery mobile way`(TM) of changing
      pages is invoked.
    */

    changePage: function(page) {
      /*
          add "data-role=page" to the element of the page, then render and insert into the body
      */

      var transition;
      $(page.el).attr('data-role', 'page');
      page.render();
      $('body').append($(page.el));
      /*
          do not use transition for first page
      */

      transition = $.mobile.defaultPageTransition;
      if (this.firstPage) {
        transition = 'none';
        this.firstPage = false;
      }
      /*
          call the jqm function
      */

      $.mobile.changePage($(page.el), {
        changeHash: false,
        transition: transition
      });
    }
  });

}).call(this);
