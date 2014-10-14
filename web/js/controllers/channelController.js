/**
 * @file
 * Channel creation controllers.
 */

/**
 * Channel controller. Controls the channel creation process.
 */
ikApp.controller('ChannelController', ['$scope', '$location', '$routeParams', '$timeout', 'channelFactory', 'slideFactory', 'screenFactory',
  function($scope, $location, $routeParams, $timeout, channelFactory, slideFactory, screenFactory) {
    $scope.steps = 4;
    $scope.slides = [];
    $scope.channel = {};
    $scope.screens = [];

    // Get all screens.
    screenFactory.getScreens().then(function (data) {
      $scope.screens = data;
    });

    // Get all slides.
    slideFactory.getSlides().then(function (data) {
      $scope.slides = data;
    });

    // Setup the editor.
    $scope.editor = {
      slideOverviewEditor: false,
      toggleSlideOverviewEditor: function() {
        $scope.editor.slideOverviewEditor = !$scope.editor.slideOverviewEditor;
      }
    };

    // Register event listener for clickSlide.
    $scope.$on('slideOverview.clickSlide', function(event, slide) {
      $scope.toggleSlide(slide);
      $scope.editor.slideOverviewEditor = false;
    });

    /**
     * Loads a given step.
     */
    function loadStep(step) {
      $scope.step = step;
      $scope.templatePath = '/partials/channel/channel' + $scope.step + '.html';
    };

    /**
     * Constructor.
     * Handles different settings of route parameters.
     */
    function init() {
      if (!$routeParams.id) {
        // If the ID is not set, get an empty channel.
        $scope.channel = channelFactory.emptyChannel();
        loadStep(1);
      } else {
        if ($routeParams.id == null || $routeParams.id == undefined || $routeParams.id == '') {
          $location.path('/channel');
        }
        else {
          channelFactory.getEditChannel($routeParams.id).then(function(data) {
            $scope.channel = data;
            $scope.channel.status = 'edit-channel';

            if ($scope.channel === {}) {
              $location.path('/channel');
            }

            loadStep(3);
          });
        }
      }
    };
    init();

    /**
     * Submit a step in the installation process.
     */
    $scope.submitStep = function() {
      if ($scope.step == $scope.steps) {
        channelFactory.saveChannel().then(function() {
          $timeout(function() {
            $location.path('/channel-overview');
          }, 1000);
        });
      } else {
        loadStep($scope.step + 1);
      }
    };

    /**
     * Set the orientation of the channel.
     * @param orientation
     */
    $scope.setOrientation = function(orientation) {
      $scope.channel.orientation = orientation;
    };

    /**
     * Is the screen selected?
     * @param id
     * @returns {boolean}
     */
    $scope.screenSelected = function(id) {
      var res = false;

      $scope.channel.screens.forEach(function(element) {
        if (id == element.id) {
          res = true;
        };
      });

      return res;
    };

    /**
     * Is the slide selected?
     * @param id
     * @returns {boolean}
     */
    $scope.slideSelected = function(id) {
      var res = false;

      $scope.channel.slides.forEach(function(element) {
        if (id == element.id) {
          res = true;
        };
      });

      return res;
    };

    /**
     * Validates that @field is not empty on channel.
     */
    function validateNotEmpty(field) {
      if (!$scope.channel) {
        return false;
      }
      return $scope.channel[field] !== '';
    };

    /**
     * Handles the validation of the data in the channel.
     */
    $scope.validation = {
      titleSet: function() {
        return validateNotEmpty('title');
      },
      orientationSet: function() {
        return validateNotEmpty('orientation');
      }
    };

    /**
     * Select or deselect the slides related to a channel.
     * @param slide
     */
    $scope.toggleSlide = function(slide) {
      var res = null;

      $scope.channel.slides.forEach(function(element, index, array) {
        if (slide.id == element.id) {
          res = index;
        };
      });

      if (res !== null) {
        $scope.channel.slides.splice(res, 1);
      }
      else {
        $scope.channel.slides.push(slide);
      }
    };

    /**
     * Select or deselect the screens related to a channel.
     * @param screen
     */
    $scope.toggleScreen = function(screen) {
      var res = false;

      $scope.channel.screens.forEach(function(element, index, array) {
        if (screen.id == element.id) {
          res = true;
        };
      });

      if (res) {
        $scope.channel.screens.splice($scope.channel.screens.indexOf(screen), 1);
      }
      else {
        $scope.channel.screens.push(screen);
      }
    }

    /**
     * Change channel creation step.
     * @param step
     */
    $scope.goToStep = function(step) {
      var s = 1;
      // If title is set enable next step.
      if ($scope.validation.titleSet()) {
        s++;
        // If orientation is set enable next three steps.
        if ($scope.validation.orientationSet()) {
          s = s + 3;
        }
      }
      if (step <= s) {
        loadStep(step);
      }
    };

    /**
     * Change the positioning of two array elements.
     * */
    function swapArrayEntries(arr, firstIndex, lastIndex) {
      var temp = arr[firstIndex];
      arr[firstIndex] = arr[lastIndex];
      arr[lastIndex] = temp;
    }

    /**
     * Push a channel slide right.
     * @param arrowPosition the position of the arrow.
     */
    $scope.pushRight = function(arrowPosition) {
      if (arrowPosition == $scope.channel.slides.length - 1) {
        swapArrayEntries($scope.channel.slides, arrowPosition, 0);
      }
      else {
        swapArrayEntries($scope.channel.slides, arrowPosition, arrowPosition + 1);
      }
    };

    /**
     * Push a channel slide right.
     * @param arrowPosition the position of the arrow.
     */
    $scope.pushLeft = function(arrowPosition) {
      if (arrowPosition == 0) {
        swapArrayEntries($scope.channel.slides, arrowPosition, $scope.channel.slides.length - 1);
      }
      else {
        swapArrayEntries($scope.channel.slides, arrowPosition, arrowPosition - 1);
      }
    };
    

    /**
     * Toggle Editor.
     */
    $scope.toggleSlideAddEditor = function toggleSlideAddEditor () {
      $('html').toggleClass('is-locked');
      if ($scope.showSlideAddEditor === true) {
        // Close editor.
        $scope.showSlideAddEditor = false;
      }
      else {
        // Show editor.
        $scope.showSlideAddEditor = true;
      }
    };


    /**
     * Calculates if a scheduling is set and whether we are currently showing it or not.
     *
     * @param slide
     *   The current slide.
     *
     * @return
     *   True if the slide has a schedule set, and we are outside the scope of the schedule.
     */
    $scope.outOfSchedule = function outOfSchedule(slide) {
      if (slide.schedule_from && slide.schedule_to) { // From and to time is set.
        if (slide.schedule_from * 1000 < Date.now() && slide.schedule_to * 1000 > Date.now() ) {
          // Current time is between from and to time (ie inside schedule).
          return false;
        }
        // Current time is set but is outside from and to time (ie out of schedule).
        return true;
      }
      // No schedule is set.
      return false;
    };
  }
]);