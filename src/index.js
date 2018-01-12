require('../vendor/cssreset.css');
require('./style.less');

// require("../vendor/jtopo-0.4.8-min.js");
require('../vendor/jquery-easyui-1.5.3/jquery.easyui.min.js');
// require('../vendor/jquery-easyui-1.5.3/default/easyui.css');


import AppView from './app/app';
$(function () {
    window.appView = new AppView({
        id: "appView"
    });
    
    window.appEvent = _.extend({},Backbone.Events);
    
    window.appView.render();
});

