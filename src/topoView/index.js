import showJTopoToobar from '../../vendor/toolbar.js';
import './index.less';

const tpl = _.template(require('./equipment-info-dialog.html'));
import createRequest from 'base.service';
const getEquipmentLinkService = createRequest('getEquipmentLink');
const getPositionService = createRequest('getPosition');
const alarmGradeService = createRequest('alarmGrade');
const savePositionService = createRequest('savePosition');
const qryEquipmentDetailService = createRequest('qryEquipmentDetail');

function newLink(nodeA, nodeZ, text = "", dashedPattern) {
    var link = new JTopo.Link(nodeA, nodeZ, text);
    // link.arrowsRadius = 10;
    link.lineWidth = 3; // 线宽
    link.bundleOffset = 60; // 折线拐角处的长度
    link.bundleGap = 20; // 线条之间的间隔
    link.textOffsetY = 3; // 文本偏移量（向下3个像素）
    link.strokeColor = '#000000'; // 线条颜色随机
    link.dashedPattern = dashedPattern;
    return link;
}
const nodeImageTypeEnum = (idx)=>{
    /* type：0-端口；1-设备 ；
        2-专业视图组织机构中的设备节点；3、专业视图组织机构中的组织节点；
        4-地理视图组织机构设备节点；5-地理视图组织机构组织节点； */
    if (idx === '$0') {
        return 'port'
    }else if(idx === '$1' || idx === '$2' || idx === '$4'){
        return 'device';
    }else{
        return 'virtual';
    }
}

const Model = Backbone.Model.extend({
    defaults: {
        nodeList: [],
        nodeInfo:'',
        notHavePosiNodeCount: 0,
        notHavePosiPortNodeCount: 0
    }
})

export default Backbone.View.extend({
    template: _.template(require("./index.html")),
    model: new Model(),
    contextMenuNode: null, //保存当前右击菜单的节点
    events: {
        'click #save': 'saveTopo',
        'click #showEquipmentInfoBtn': 'showEquipmentInfo',
        'click #showNextLevelTopoBtn': 'showNextLevelTopo',
        'click #showAlarmDetailBtn': 'showAlarmDetail',
    },
    showEquipmentInfo() {
        qryEquipmentDetailService({
            id : this.contextMenuNode.$$data.id.toString()
        })
        .then(resp => {
            if ( resp.header.rspcode === '0000') {
                $("#equipment-info-dialog").html(tpl({data:resp.response})).dialog('open');
            } else {
                alert('加载失败')
            }
        }, function() {
            alert('加载失败')
        });
    },
    showNextLevelTopo() {
        this.loadNextLevelTopo(this.contextMenuNode.$$data)
    },
    showAlarmDetail() {
        //zhangbaogen
        var dataParameters = this.contextMenuNode;
        var id = dataParameters.id;
        var equipmentId = dataParameters.equipment_id;

        //判断本身以及自身是否有告警
        var alarmInfo = dataParameters.alarmInfo;
        // console.log('topo View',this.model.get('nodeList'))
        // let nodeInfo = this.model.get('nodeInfo');
        // console.log(nodeInfo);

        appEvent.trigger('warnDetailFn', {
            id: id,
            equipmentId: equipmentId,
            nodeInfo:dataParameters
        })
    },
    initialize() {
        this.listenTo(this.model, 'clear', this.renderCanvas);
    },

    canvasNormalHeight : 0,
    canvasNormalWidth : 0,
    renderCanvas() {
        this.$("#canvas-wrap #canvas").remove();

        this.canvasNormalHeight = this.$("#canvas-wrap").parents(".panel-body").height() - $("#toolbar").height();
        this.canvasNormalWidth =  $("#canvas-wrap").width() - 20;

        $("<canvas />")
            .attr({
                id:     'canvas',
                height:  this.canvasNormalHeight,
                width: this.canvasNormalWidth
            })
            .addClass('canvas')
            .appendTo(this.$("#canvas-wrap"))

    },
    render() {
        const self = this;
        this.$el.html(this.template());
        $.parser.parse('#topoView');

        $("#equipment-info-dialog").dialog('close');

        window.appEvent.on('change_tree_selectedNode', ({
            node
        }) => {
            this.model.set('nodeInfo',node);
            console.log( 'nodeInfo-->',this.model.get('nodeInfo'))
            this.model.set({
                nodeList: [],
                notHavePosiNodeCount: 0,
                notHavePosiPortNodeCount: 0,
                mainNodeId: (node.equipment_id || node.id).toString()
            }).trigger('clear');

            switch (node.nodeType) {
                case '0':
                    this.reqOrgTopo({
                        eq : node.eq,
                        id : '' + node.id
                    });
                    break;
                case '1':
                    this.reqEquipmentTopo({
                        type: '1',
                        id: ''+node.equipment_id,
                        equipment_id : node.equipment_id
                    })
                    break;
                case '2':
                    this.reqPortTopo({
                        type: '0',
                        id: ''+node.id,
                        name : node.text
                    })
                    break;
                default:
                    // console.log("not match",node);
            }
        })

        document.addEventListener('webkitfullscreenchange',()=>{
            var c = document.getElementById('canvas');
            if(document.fullscreen || document.webkitIsFullScreen) {
                c.width = window.screen.width;
                c.height = window.screen.height;
            } else {
                c.width  = this.canvasNormalWidth;
                c.height = this.canvasNormalHeight;
            }
        })

        appEvent.on('resize_topo_panel_width', ({w,h})=>{
            if(document.fullscreen || document.webkitIsFullScreen) return;
            if(!this.$('#canvas').length) return;
            this.$('#canvas')[0].width = w;
        })

        appEvent.on('resize_topo_panel_height', ({w,h})=>{
            if(document.fullscreen || document.webkitIsFullScreen) return ;
            if(!this.$('#canvas').length) return ;
            this.$('#canvas')[0].height = h - $("#toolbar").height();
        })

        return this;
    },
    reqPortTopo(node) {
        Promise.all([
            alarmGradeService({
                type : node.type,
                id : [''+node.id]
            })
        ]).then(resp => {
            const [alarmGradeResp] = resp;
            if (
                alarmGradeResp.header.rspcode === '0000'
            ) {
                const scene = this.renderTopoStage();
                const alarmGradeList = alarmGradeResp.response.list;
                const list = [{
                    "id": node.id,
                    "name": node.name, //port.name,
                    "type": "0",
                    "positionX": $("#canvas-wrap").width() / 2,
                    "positionY": $("#canvas-wrap").height() / 2
                }];
                this.renderTopoNode(list, scene);
                this.renderTopoAlarm(alarmGradeList);
            } else {
                alert('加载失败')
                    // console.log(resp);
            }
        }, function() {
            alert('加载失败')
                // console.log(arguments);
        });
    },
    reqEquipmentTopo(reqParam) {
        getPositionService(reqParam)
            .then(({ header, response }) => {
                if (header.rspcode !== '0000') return alert('加载失败');
                const scene = this.renderTopoStage();
                /* for (let i = 0, len = 100; i < len; i++) {
                    response.list.push({
                        "equipment_id":1110,
                        "id":80 + i,
                        "name":`端端口端口端口端口端口${i}`,
                        "positionX":'',
                        "positionY":'',
                        "type":"0"
                    })
                } */
                this.renderTopoNode(response.list, scene);
                // this.renderTopoLinkByEquiment(scene);

                alarmGradeService({
                    type:         reqParam.type,
                    id:           response.list.map(item=>item.id).map(item=>item.toString()),
                    equipment_id: reqParam.equipment_id
                })
                    .then(({ header, response }) => {
                        if (header.rspcode !== '0000') return alert('加载失败');
                        this.renderTopoAlarm(response.list);
                        // this.stage.centerAndZoom(); //缩放并居中显示
                    }, function() {
                        alert('加载失败')
                        console.log(arguments);
                    });
            }, err => {
                alert('加载失败')
                console.log(arguments);
            })

    },

    renderTopoLinkByEquiment(scene) {
        const nodeList = this.model.get('nodeList');
        const mainNodeId = this.model.get('mainNodeId');
        const mainNode = nodeList.find(node => ''+node.$$data.id === ''+mainNodeId);
        const hasPositionNodeList = [];

        if (!mainNode) return;

        for (let i = 0, len = nodeList.length, node; i < len; i++) {
            node = nodeList[i];
            if (node.$$data.id !== mainNode.$$data.id) {
                const link = new JTopo.Link(mainNode, node); // 这里的node是端口节点
                if (
                    typeof(node.$$data.positionX) === 'number' &&
                    typeof(node.$$data.positionY) === 'number'
                ) {
                    hasPositionNodeList.push(node);
                }
                scene.add(link);
            }
        }

        // 居中显示
        mainNode.x = 400;
        mainNode.y = 200;

        mainNode.layout = {
            type: 'circle',
            radius: 160
        };

        JTopo.layout.layoutNode(scene, mainNode, true);

        hasPositionNodeList.forEach(node => {
            node.setLocation(node.$$data.positionX, node.$$data.positionY);
        })

    },

    reqOrgTopo({id,eq}) {
        const tab = $('#treeTab').tabs('getSelected');
        const index = $('#treeTab').tabs('getTabIndex', tab);

        // nodeType: 0=专业视图 1=地理视图
        const type = index === 0 ? '3' : '5' ;

        getPositionService({
            type : type,
            id : id
        }).then(({header,response})=>{
            if(header.rspcode !== '0000') return alert('加载失败');

            const scene = this.renderTopoStage();
            this.renderTopoNode(response.list, scene);
            // this.renderLevelLine(scene);
            this.stage.centerAndZoom(); //缩放并居中显示

            const idList = response.list.filter(item=>item.equipment_id).map(item=> item.equipment_id.toString());
            // if( response.list.filter(item=>  item.type === '1' ).length > 1 ){
                    getEquipmentLinkService({
                        type: '1',
                        id: idList
                    }).then(({header,response})=>{
                        if (header.rspcode !== '0000')  return alert('加载失败');
                        this.renderTopoLink(response.list, scene);
                        this.stage.centerAndZoom(); //缩放并居中显示
                    },function(){
                        alert('加载失败')
                        console.log(arguments);
                    })
            // }

            // if (response.list.filter(item=> item.type === '1').length > 0) {
                    alarmGradeService({
                        type : '1',
                        id : idList
                    }).then(({header,response})=>{
                        if (header.rspcode !== '0000')  return alert('加载失败');
                        this.renderTopoAlarm(response.list);
                        this.stage.centerAndZoom(); //缩放并居中显示
                    },function(){
                        alert('加载失败')
                        console.log(arguments);
                    })
            // }

        },function(){
            alert('加载失败')
            console.log(arguments);
        })
    },

    renderLevelLine(scene) {
        const mainNodeId = this.model.get('mainNodeId');
        const mainNode = this.model.get('nodeList').find(node => ''+node.$$data.id === ''+mainNodeId)
        this.model.get('nodeList').forEach(node => {
            if ('' + node.$$data.id !== '' + mainNodeId) {
                scene.add(newLink(mainNode, node))
            }
        })
    },

    stage : null,
    renderTopoStage() {
        var self = this;
        this.stage = new JTopo.Stage(this.$("#canvas-wrap #canvas")[0]);
        const stage = this.stage;
        //显示工具栏
        showJTopoToobar(stage, "#toolbar");
        var scene = new JTopo.Scene();
        stage.add(scene);

        this.$("#contextmenu").hide()
        stage.addEventListener('click', e => {
            if (e.button === 0) {
                this.$("#contextmenu").hide()
            }
        });

        // scene.background = './assets/img/bg.jpg';
        return scene;
    },

    renderTopoNode(nodeList, scene) {
        const mainNodeId = this.model.get('mainNodeId');

        for (let i = 0, len = nodeList.length, node; i < len; i++) {
            node = Object.assign(this.createNode(nodeList[i]), {
                $$data: nodeList[i]
            });

            if (''+node.$$data.id !== ''+mainNodeId) {
                scene.add(node);
                // TODO 此处可能会产生性能问题,待处理
                this.model.set('nodeList', [...this.model.get('nodeList'), node]);
            }
        }

    },

    renderTopoLink(linkToNodeList, scene) {
        // console.log(linkToNodeList);
        for (let j = 0, len = linkToNodeList.length, toNode, fromNode, lineData; j < len; j++) {
            lineData = linkToNodeList[j];

            for (let i = 0, nodeLen = this.model.get('nodeList').length, node; i < nodeLen; i++) {
                node = this.model.get('nodeList')[i];
                // TODO 这里只用id作判断，在跨表中，id可能不是唯一的
                const id = node.$$data.equipment_id || node.$$data.id;
                if (id === lineData.fromEquipmen) {
                    fromNode = node;
                }
                if (id === lineData.toEquipment) {
                    toNode = node;
                }

            }

            if (toNode && fromNode) {
                const link = newLink(fromNode, toNode);
                scene.add(link);
            }
        }

    },

    renderTopoAlarm(alarmGradeList) {
        // console.log(alarmGradeList);
        for (let z = 0, len = alarmGradeList.length, alarm, targetNode; z < len; z++) {
            alarm = alarmGradeList[z];
            targetNode = this.model.get('nodeList').find(node => ''+node.$$data.id === ''+alarm.id);
            if (targetNode) {
                targetNode.alarm = alarm.title;
            }
        }

    },

    renderDeviceTopo() {

    },

    saveTopo() {
        const positionList = this.model.get('nodeList').map(node => {
            const { x, y } = node;
            const { id, type } = node.$$data;
            return {
                positionX: '' + parseInt(x),
                positionY: '' + parseInt(y),
                id : ''+id,
                type
            };
        })

        savePositionService({
            positionList
        }).then(({
            header
        }) => {
            if (header.rspcode === '0000') {
                alert('保存成功')
            } else {
                alert(header.rspdesc)
            }
        }, err => {
            alert('保存失败')
        })
    },

    createNode(data) {
        const { positionX, positionY } = data;
        var node = new JTopo.Node(data.name);

        if (typeof(positionX) === 'number' && typeof(positionY) === 'number') {
            node.setLocation(positionX, positionY);
        } else {
            let notHavePosiNodeCount = this.model.get('notHavePosiNodeCount');
            let notHavePosiPortNodeCount = this.model.get('notHavePosiPortNodeCount');

            if (data.type === '0') {
                // port
                node.setLocation(parseInt(notHavePosiPortNodeCount / 32) * 180, parseInt(notHavePosiPortNodeCount % 32) * 30);
                this.model.set('notHavePosiPortNodeCount', ++notHavePosiPortNodeCount);
            }else{
                node.setLocation(notHavePosiNodeCount * 50, $("#canvas-wrap").height() - 80);
                this.model.set('notHavePosiNodeCount', ++notHavePosiNodeCount);
            }
        }

        node.textPosition = 'Middle_Right';
        node.fontColor = "0,0,0";

        node.setImage(
            data.icon ? `./assets/img/icons/${data.icon}` : `./assets/img/topo/node_${nodeImageTypeEnum( '$'+data.type ) || nodeImageTypeEnum( '$2' ) }.png`,
            true
        );

        node.addEventListener('mouseup', event => {
            if (event.button == 2) {
                this.contextMenuNode = event.target;
                const {type} = this.contextMenuNode.$$data;

                this.$("#contextmenu")
                    .find("#showEquipmentInfoBtn")[type === '1' ? 'show' : 'hide']().end()
                    .find("#showNextLevelTopoBtn")[type !== '0' ? 'show' : 'hide']().end()

                this.$("#contextmenu")
                    .css({
                        top: event.offsetY + this.$("#contextmenu").outerHeight(),
                        left: event.offsetX
                    })
                    .show()
            }
        });

        // 能双击的都是虚拟节点
        node.addEventListener('dbclick', event => {
            this.loadNextLevelTopo(event.target.$$data);
        });

        return node;
    },

    loadNextLevelTopo(data){
        const { type, id,equipment_id } = data;

        if (type === '0') return;

        /* type：0-端口；1-设备 ；
        2-专业视图组织机构中的设备节点；3、专业视图组织机构中的组织节点；
        4-地理视图组织机构设备节点；5-地理视图组织机构组织节点； */

        let nodeType = null;
        if (type === '3' || type === '5' ) {
            nodeType = '0'
        }else{
            nodeType = '1'
        }

        window.appEvent.trigger('change_tree_selectedNode', {
            node: {
                equipment_id, nodeType, id
            }
        });
    }
});
