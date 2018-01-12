import TreeView from '../treeView/index';
import TopoView from '../topoView/index';
import WarnView from '../warnView/index';
require('./app.css');

export default Backbone.View.extend({
    el: $("#root"),
    template: require('./index.html'),
    events: {},

    initialize() {
        // this.listenTo(this.model, "change", this.render);
        // window.topoView = new TopoView({
        //     id: "topoView"
        // });
        // window.warnView = new WarnView({
        //     id: "warnView"
        // });
    },

    render() {

        this.$el.html(this.template);

        window.treeView = new TreeView({
            id: "treeView",
            el: $("#treeView")
        });
        window.topoView = new TopoView({
            id: "topoView",
            el: $("#topoView")
        });
        window.warnView = new WarnView({
            id: "warnView",
            el: $("#warnView")
        });
       
        window.treeView.render();
        window.topoView.render();
        window.warnView.render();

        $('#layout').layout({
            fit:true
        })
        $('#layout2').layout({})
        $('#accordion').accordion({})
        $("#moduleTabs").tabs()


    }

});
