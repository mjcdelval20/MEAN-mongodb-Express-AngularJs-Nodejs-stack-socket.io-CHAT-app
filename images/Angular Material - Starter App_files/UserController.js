(function(){

  angular
       .module('users')
      .constant('amazonurl',{ "url": "https://s3-us-west-1.amazonaws.com/chatcontacts/"} )

       .controller('UserController',
          UserController
       );

  /**
   * Main Controller for the Angular Material Starter App
   * @param $scope
   * @param $mdSidenav
   * @param avatarsService
   * @constructor
   */
  function UserController( userService, authenticService, amazonurl, $scope, $mdSidenav, $mdBottomSheet, $log, $state, $http) {
    var self = this;



    self.selected     = null;
    self.users        = [ ];
    self.selectUser   = selectUser;
    self.toggleList   = toggleUsersList;
    self.makeContact  = makeContact;
    //self.converSelctUser = userService.converSelecUser();
    self.printMet = function(){ console.log('qsqws');};
    self.register = register;
    self.login = login;
    self.logout = logout;
    self.url = amazonurl.url;


      var isAuthenticated = false;
      var LOCAL_TOKEN_KEY = "token";
      var authToken;

      $scope.amazonurl = amazonurl.url;

      $scope.data = {

          login : { error: false},
          register: { error: false}

      };



      function loadUserCredentials(){

          var token = window.localStorage.getItem(LOCAL_TOKEN_KEY);
          if(token) {
              useCredentials(token);
          }

      }

      function storeUserCredentials(token){

          window.localStorage.setItem(LOCAL_TOKEN_KEY, token);
          useCredentials(token);

      }

      function useCredentials(token){

          isAuthenticated = true;
          authToken = token;

          // Set the token as header for your requests !

          $http.defaults.headers.common.Authorization = authToken;
      }

      function destroyUserCredentials(token){

          authToken = undefined;
          isAuthenticated = false;
          $http.defaults.headers.common.Authorization = undefined;
          window.localStorage.removeItem(LOCAL_TOKEN_KEY);

      }

      function register(){

          // we add validation
          $scope.data.register.image = 'https://s3-us-west-1.amazonaws.com/chatcontacts/icon.png';
          authenticService.register.save($scope.data.register, function(res, headers){

              console.log(res);
              if(res.success){

                  loadCurrentUser(res);

                  $state.go('chat');

              }else{
                  $scope.data.register.error = true;
                  $scope.data.register.errormsg = res.msg;
              }

          });
      }

      function login(){

          authenticService.login.try($scope.data.login, function(res, headers) {

              console.log(res);
              if (res.success) {

                  loadCurrentUser(res);

                  $state.go('chat');

              } else {
                  $scope.data.login.error = true;
                  $scope.data.login.errormsg = res.msg;
              }
          });
      }

      //function loadAllContacts (){
      //
      //    authenticService.requestAllContacts.get({}).$promise.then(function(res){
      //
      //
      //        authenticService.setAllContacts(res.users);
      //
      //    });
      //}

      function loadCurrentUser(res){

          storeUserCredentials(res.token);
          authenticService.setCurrentUser(res.user);
          $scope.data.currentUser = authenticService.getCurrentUser();
          self.selected = $scope.data.currentUser.conversations[0];
          $scope.data.selectedUser = self.selected;
          //loadAllContacts();
      }

      function logout(){

          destroyUserCredentials();
          $scope.data.login.error = false;
          $scope.data.register.error  =false;
          $state.go('login');

      }

      loadUserCredentials();

      //loadAllContacts();

    /* Load all registered users
    userService
          .loadAllUsers()
          .then( function( users ) {

            self.users    = [].concat(users);
            self.selected = users[0];
          });

    */


    // *********************************
    // Internal methods
    // *********************************

    /**
     * Hide or Show the 'left' sideNav area
     */
    function toggleUsersList() {
      $mdSidenav('left').toggle();
    }

    /**
     * Select the current avatars
     * @param menuId
     */
    function selectUser ( user ) {

      self.selected = angular.isNumber(user) ? $scope.users[user] : user;
        //console.log(self.selected);
        $scope.data.selectedUser = self.selected;

        var currentGroupContacts = angular.copy(authenticService.getcurrentforGroupContactsStatic());
        var members = [];
        if(self.selected.members.length == 0 ){ members = [self.selected._id]}
        else { members = self.selected.members}

        filter(currentGroupContacts, members);
    }

      function filter(currentGroupContacts, members){

          for(var i = 0; i < currentGroupContacts.length; i++){

              //console.log(currentGroupContacts[i]);
              for(var j = 0; j < members.length; j++){

                if(currentGroupContacts[i]._id == members[j]){

                    console.log(currentGroupContacts[i]);
                    currentGroupContacts.splice(i, 1);


                }
              }
          }
            authenticService.setcurrentforGroupContacts(currentGroupContacts);
      }

    /**
     * Show the Contact view in the bottom sheet
     */
        function makeContact(selectedUser) {

        $mdBottomSheet.show({
          controllerAs  : "cp",
          templateUrl   : './src/users/view/contactSheet.html',
          controller    : [ '$mdBottomSheet', ContactSheetController],
          parent        : angular.element(document.getElementById('content'))
        }).then(function(clickedItem) {
          $log.debug( clickedItem.name + ' clicked!');
        });

        /**
         * User ContactSheet controller
         */
        function ContactSheetController( $mdBottomSheet ) {
          this.user = selectedUser;
          this.actions = [
            { name: 'Phone'       , icon: 'phone'       , icon_url: 'assets/svg/phone.svg'},
            { name: 'Twitter'     , icon: 'twitter'     , icon_url: 'assets/svg/twitter.svg'},
            { name: 'Google+'     , icon: 'google_plus' , icon_url: 'assets/svg/google_plus.svg'},
            { name: 'Hangout'     , icon: 'hangouts'    , icon_url: 'assets/svg/hangouts.svg'}
          ];
          this.contactUser = function(action) {
            // The actually contact process has not been implemented...
            // so just hide the bottomSheet

            $mdBottomSheet.hide(action);
          };
        }
    }

  }

})();