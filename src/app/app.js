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

        $('#layout')
            .layout({
                fit:true,
            })
            .layout('panel','center').panel({
                onResize(w,h){
                    appEvent.trigger('resize_topo_panel_width', {w,h})
                }
            })

        $('#layout2')
            .layout({})
            .layout('panel','center').panel({
                onResize(w,h){
                    appEvent.trigger('resize_topo_panel_height', {w,h})
                }
            })

        $('#accordion').accordion({})
        $("#moduleTabs").tabs()


    }

});
