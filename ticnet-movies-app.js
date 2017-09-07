/** MovieImages
 @typedef MovieImages
 @type {Object}
 @property {String} large - Movie poster uri
 @property {String} medium - Movie poster uri
 @property {String} thumb - Movie poster uri
 */

/** MovieOrganizer
 @typedef MovieOrganizer
 @type {Object}
 @property {String} id
 @property {String} infoUri
 @property {String} name
 */

/** MovieVenue
 @typedef MovieVenue
 @type {Object}
 @property {String} city
 @property {String} id
 @property {String} infoUri
 @property {String} latitude
 @property {String} longitude
 @property {String} name
 */

/** MovieEvent
 @typedef MovieEvent
 @type {Object}
 @property {String} apiUri
 @property {String} end
 @property {String} id
 @property {Object} images
 @property {MovieImages} images
 @property {String} infoUri
 @property {String} name
 @property {Object} organizer
 @property {MovieOrganizer} organizer
 @property {String} shopUri
 @property {String} start
 @property {String} formattedStart
 @property {String} stockStatus
 @property {String} formattedLength
 @property {Object} venue
 @property {MovieVenue} venue
 */


(function() {
    angular
        .module('ticnet-movies', [])
        .config(Configuration)
        .controller('MovieListController', MovieListController)
        .filter('TrustFilter', TrustFilter)
        .filter('FormattedStrArr', FormattedStrArrFilter)
        .service('ReqService', ReqService);
        
    MovieListController.$Inject = '$sceDelegateProvider';

    function Configuration($sceDelegateProvider) {
        $sceDelegateProvider.resourceUrlWhitelist([
            'self',
            'http://www.tickster.com/sv/api/**'
        ]);
    }

    MovieListController.$Inject = '$scope,$http,ReqService,$element';
    
    /** @param {{ movies: MovieEvent[] }} $scope */
    function MovieListController($scope, $http, ReqService, $element)  {

        $scope.selectedMovie = null;
        $scope.eventInfos = {};
        
        ReqService.getAllMovies()
            .then(function(response) {
                $scope.movies = response.data.hits;
                $scope.movies.forEach(function(m) { 
                    m.formattedStart = formatDate(m.start);
                    if (isValidDate(m.start) && isValidDate(m.end) && m.name.toLowerCase().indexOf('presentkort') === -1) {
                        var s = new Date(m.start);
                        var e = new Date(m.end);
                        var minutes = (e - s) / 1000 / 60;
                        if (minutes <= 60) {
                            m.formattedLength = minutes + ' minuter';
                        } else {
                            var hours = Math.floor(minutes/60);
                            minutes = minutes % 60;
                            m.formattedLength = hours + 'h ' + minutes + 'm';
                        }
                    }
                });
            }, function(response) {
                displayError(response);
            });
        
        /** @param { MovieEvent } movie */
        $scope.onShowInfoClick = function(evt, movie) {
            $scope.selectedMovie === movie ? $scope.selectedMovie = null : $scope.selectedMovie = movie;
            if (!$scope.eventInfos[movie.id]) {
                ReqService.getEventInfo(movie.id)
                    .then(function(response) {
                        $scope.eventInfos[movie.name] = response.data.event;
                    });
            }
        };
        
        $scope.onPurchaseClick = function(evt) {
            var t = 850
            , i = 600
            , r = (window.outerWidth - t) / 2
            , u = (window.outerHeight - i) / 2;
            window.open(evt.currentTarget.href, "", "width=" + t + ", height=" + i + ", left=" + r + ", top=" + u + ", resizable=yes, scrollbars=yes"),
            evt.preventDefault();
        };

        function displayError(err) {
            console.log(err);
        }
    }

    TrustFilter.$Inject = '$sce';
    function TrustFilter ($sce) {
        return function(value, type) {
            return $sce.trustAs(type || 'html', value);
        };
    }

    function FormattedStrArrFilter ($sce) {
        return function(value, type) {
            return value.join(', ');
        };
    }

    ReqService.$Inject = '$http,$sce';
    function ReqService($http,$sce) {
        var ticnetBase = 'http://www.tickster.com/sv/api/0.3';
        var id = 'lz5huku7rdf3jxy';
        var key = 'ec154c92dc5adab1';

        this.getAllMovies = function() {
            return $http.jsonp(ticnetBase + '/events/by/' + id + '?key=' + key);
        };

        this.getEventInfo = function(eventId) {
            return $http.jsonp(ticnetBase + '/events/' + eventId + '?key=' + key);
        };
    }

    function formatDate(d) {
        if (!isValidDate(d)) {
            return '';
        }
        
        var months = ['Januari','Februari','Mars','April','Maj','Juni','Juli','Augisti','September','Oktober','November','December'];
        var date = new Date(d);
        var formattedDate = date.getDate() + ' ' + months[date.getMonth()].substr(0,3)

        return formattedDate;
    }

    function isValidDate(d) {
        return !isNaN(Date.parse(d));
    }

})();