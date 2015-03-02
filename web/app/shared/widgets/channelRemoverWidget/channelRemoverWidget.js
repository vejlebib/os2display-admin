/**
 * @file
 * Contains the itkChannelRemoveWidget module.
 */

/**
 * Setup the module.
 */
(function() {
  "use strict";

  var app;
  app = angular.module("itkChannelRemoverWidget", []);

  /**
   * channel-remover-widget directive.
   *
   * html parameters:
   *   screen (object): the screen to modify.
   *   region (integer): the region of the screen to modify.
   */
  app.directive('channelRemoverWidget', [
    function() {
      return {
        restrict: 'E',
        replace: true,
        templateUrl: 'app/shared/widgets/channelRemoverWidget/channel-remover-widget.html',
        scope: {
          screen: '=',
          region: '='
        },
        link: function(scope) {
          scope.search_text = '';

          /**
           * Get the search object for the filter.
           * @returns {{title: string}}
           */
          scope.getSearch = function getSearch() {
            return {
              "title": scope.search_text
            };
          };

          /**
           * Returns true if channel is in channel array with region.
           *
           * @param channel
           * @returns {boolean}
           */
          scope.channelSelected = function channelSelected(channel) {
            if (channel === undefined) {
              return false;
            }

            var element;
            for (var i = 0; i < scope.screen.channel_screen_regions.length; i++) {
              element = scope.screen.channel_screen_regions[i];
              if (element.channel && element.channel.id === channel.id && element.region === scope.region) {
                return true;
              }
              else if (element.shared_channel && channel.unique_id && element.shared_channel.unique_id === channel.unique_id && element.region === scope.region) {
                return true;
              }
            }
            return false;
          };

          /**
           * Removing a channel from a screen region.
           * @param channel
           *   Channel to remove from the screen region.
           */
          scope.removeChannel = function removeChannel(channel) {
            var element;
            for (var i = 0; i < scope.screen.channel_screen_regions.length; i++) {
              element = scope.screen.channel_screen_regions[i];
              if (element.channel && channel.unique_id === undefined && element.channel.id === channel.id && element.region === scope.region) {
                scope.screen.channel_screen_regions.splice(i, 1);
              }
              else if (element.shared_channel && channel.unique_id && element.shared_channel.unique_id === channel.unique_id && element.region === scope.region) {
                scope.screen.channel_screen_regions.splice(i, 1);
              }
            }
          };
        }
      };
    }
  ]);
}).call(this);
