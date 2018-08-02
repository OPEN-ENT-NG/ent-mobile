angular.module('ent.timeline_service', ['ent.request'])

  .service('TimelineService', function(domainENT, RequestService){

    this.getTimeline = function(){
      return RequestService.get(domainENT+"/timeline/lastNotifications?page=0&type=BLOG&type=EXERCIZER&type=FORUM&type=MESSAGERIE&type=COLLABORATIVEWALL&type=PAGES&type=USERBOOK&type=WIKI&type=CALENDAR&type=NEWS&type=WORKSPACE&type=MINDMAP&type=RACK");
    }

    this.getThumbnail = function(senderId) {
      return RequestService.get(domainENT+"/userbook/avatar/"+senderId+"?thumbnail=100x100");
    }

  })
