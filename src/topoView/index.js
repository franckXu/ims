import showJTopoToobar from '../../vendor/toolbar.js';
import './index.less';

const tpl = _.template(require('./equipment-info-dialog.html'));
import createRequest from 'base.service';
const getEquipmentLinkService = createRequest('getEquipmentLink');
const getPositionService = createRequest('getPosition');
const alarmGradeService = createRequest('alarmGrade');
const savePositionService = createRequest('savePosition');
const qryEquipmentDetailService = createRequest('qryEquipmentDetail');

function newFlexionalLink(nodeA, nodeZ, arrowsRadius = 0, text = "", dashedPattern) {
    var link = new JTopo.FlexionalLink(nodeA, nodeZ, text);
    link.arrowsRadius = arrowsRadius;
    link.lineWidth = 3; // 线宽
    link.offsetGap = 30;
    link.bundleGap = 15; // 线条之间的间隔
    link.textOffsetY = 10; // 文本偏移量（向下15个像素）
    link.strokeColor = JTopo.util.randomColor(); // 线条颜色随机
    link.dashedPattern = dashedPattern;
    return link;
}

function newLink(nodeA, nodeZ, text = "", dashedPattern) {
    var link = new JTopo.Link(nodeA, nodeZ, text);
    link.arrowsRadius = 10;
    link.lineWidth = 3; // 线宽
    link.bundleOffset = 60; // 折线拐角处的长度
    link.bundleGap = 20; // 线条之间的间隔
    link.textOffsetY = 3; // 文本偏移量（向下3个像素）
    link.strokeColor = '#000000'; // 线条颜色随机
    link.dashedPattern = dashedPattern;
    return link;
}
const nodeImageTypeEnum = {
    '$2': 'virtual',
    '$1': 'device',
    '$0': 'port',
}

const Model = Backbone.Model.extend({
    defaults: {
        nodeList: [],
        notHavePosiNodeCount: 0
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
            id : this.contextMenuNode.$$data.id
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
        const {
            type: nodeType,
            id
        } = this.contextMenuNode.$$data;
        window.appEvent.trigger('change_tree_selectedNode', {
            node: {
                nodeType,
                id
            }
        });
    },
    showAlarmDetail() {
        console.log('alarm', this.contextMenuNode);
    },
    initialize() {
        this.listenTo(this.model, 'clear', this.renderCanvas);
        /* console.log(process.env.NODE_ENV)
        console.log(isProd) */
    },

    renderCanvas() {
        this.$("#canvas-wrap #canvas").remove();

        console.log($("#canvas-wrap").outerHeight());
        $("<canvas />")
            .attr({
                id:     'canvas',
                height: this.$("#canvas-wrap").parents(".panel-body").height() - $("#toolbar").height(),
                width:  $("#canvas-wrap").width() - 20
            })
            .addClass('canvas')
            .appendTo(this.$("#canvas-wrap"))

    },

    render() {
        this.$el.html(this.template());
        $.parser.parse('#topoView');

        $("#equipment-info-dialog").dialog('close');

        window.appEvent.on('change_tree_selectedNode', ({
            node
        }) => {
            this.model.set({
                nodeList: [],
                notHavePosiNodeCount: 0,
                mainNodeId: '' + node.id
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
                        id: ''+node.id,
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
        });

        return this;
    },
    reqPortTopo(node) {
        Promise.all([
            alarmGradeService({
                type : node.type,
                id : node.id
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
        Promise.all([
            getPositionService(reqParam),
            alarmGradeService(reqParam)
        ]).then(resp => {
            const [nodeListResp, alarmGradeResp] = resp;
            if (
                nodeListResp.header.rspcode === '0000' &&
                alarmGradeResp.header.rspcode === '0000'
            ) {
                const scene = this.renderTopoStage();
                this.renderTopoNode(nodeListResp.response.list, scene);
                this.renderTopoAlarm(alarmGradeResp.response.list);
                this.renderTopoLinkByEquiment(scene);
            } else {
                alert('加载失败')
                    // console.log(resp);
            }
        }, function() {
            alert('加载失败')
                // console.log(arguments);
        });
    },

    renderTopoLinkByEquiment(scene) {
        const nodeList = this.model.get('nodeList');
        const mainNodeId = this.model.get('mainNodeId');
        const mainNode = nodeList.find(node => node.$$data.id === mainNodeId);
        const hasPositionNodeList = [];

        if (!mainNode) return;

        for (let i = 0, len = nodeList.length, node; i < len; i++) {
            node = nodeList[i];
            if (node.$$data.id !== mainNode.$$data.id) {
                // var link = newFlexionalLink( mainNode,node);
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

        /*
        * 2-专业视图组织机构中的设备节点；
        * 3、专业视图组织机构中的组织节点；
        * 4-地理视图组织机构设备节点；
        * 5-地理视图组织机构组织节点；
        */

        // nodeType: 0=专业视图 1=地理视图
        let type ;
        if (index === 0) {
            type = eq ? '2' : '3'
        } else {
            type = eq ? '4' : '5'
        }

        Promise.all([
            getEquipmentLinkService({
                type: '1',
                id: id
            }),
            getPositionService({
                type : type,
                id : id
            }),
            alarmGradeService({
                type : '1',
                id : id
            })
        ]).then(resp => {
            const [linkToNodeListResp, nodeListResp, alarmGradeResp] = resp;
            if (
                linkToNodeListResp.header.rspcode === '0000' &&
                nodeListResp.header.rspcode === '0000' &&
                alarmGradeResp.header.rspcode === '0000'
            ) {
                const scene = this.renderTopoStage();
                this.renderTopoNode(nodeListResp.response.list, scene);
                this.renderTopoLink(linkToNodeListResp.response.list, scene);
                this.renderTopoAlarm(alarmGradeResp.response.list);
                this.renderLevelLine(scene);
            } else {
                alert('加载失败')
                    // console.log(resp);
            }
        }, function() {
            alert('加载失败')
                // console.log(arguments);
        });
    },

    renderLevelLine(scene) {
        const mainNodeId = this.model.get('mainNodeId');
        const mainNode = this.model.get('nodeList').find(node => node.$$data.id === mainNodeId)
        this.model.get('nodeList').forEach(node => {
            if (node.$$data.id !== mainNodeId) {
                scene.add(newLink(mainNode, node))
            }
        })
    },

    renderTopoStage() {
        var self = this;
        var stage = new JTopo.Stage(this.$("#canvas-wrap #canvas")[0]);
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
        for (let i = 0, len = nodeList.length, node; i < len; i++) {
            node = Object.assign(this.createNode(nodeList[i]), {
                $$data: nodeList[i]
            });
            scene.add(node);

            this.model.set('nodeList', [...this.model.get('nodeList'), node]);
        }

    },

    renderTopoLink(linkToNodeList, scene) {
        // console.log(linkToNodeList);
        for (let j = 0, len = linkToNodeList.length, toNode, fromNode, lineData; j < len; j++) {
            lineData = linkToNodeList[j];

            for (let i = 0, nodeLen = this.model.get('nodeList').length, node; i < nodeLen; i++) {
                node = this.model.get('nodeList')[i];
                // TODO 这里只用id作判断，在跨表中，id可能不是唯一的
                if (node.$$data.id === lineData.fromEquipment) {
                    fromNode = node;
                }
                if (node.$$data.id === lineData.toEquipment) {
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
            targetNode = this.model.get('nodeList').find(node => node.$$data.id === alarm.id);
            if (targetNode) {
                targetNode.alarm = alarm.grade;
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
        const {
            positionX,
            positionY
        } = data;
        var node = new JTopo.Node(data.name);

        if (typeof(positionX) === 'number' && typeof(positionY) === 'number') {
            node.setLocation(positionX, positionY);
        } else {
            let notHavePosiNodeCount = this.model.get('notHavePosiNodeCount');
            node.setLocation(notHavePosiNodeCount * 50, $("#canvas-wrap").height() - 50);
            this.model.set('notHavePosiNodeCount', ++notHavePosiNodeCount);
        }

        node.textPosition = 'Middle_Right';
        node.fontColor = "0,0,0";
        node.setImage(`./assets/img/topo/node_${nodeImageTypeEnum['$'+data.type] || nodeImageTypeEnum['$2'] }.png`, true);

        node.addEventListener('mouseup', event => {
            if (event.button == 2) {
                this.contextMenuNode = event.target;
                const {type} = this.contextMenuNode.$$data;
                this.$("#contextmenu")
                    .find("#showEquipmentInfoBtn")[type === '1' ? 'show' : 'hide']().end()
                    .find("#showNextLevelTopoBtn")[type !== '2' ? 'show' : 'hide']().end()
                    .css({
                        top: event.layerY + this.$("#contextmenu").outerHeight(),
                        left: event.layerX
                    })
                    .show()
            }
        });

        node.addEventListener('dbclick', event => {
            const {
                type: nodeType,
                id
            } = event.target.$$data;
            if (nodeType === '0') return;
            window.appEvent.trigger('change_tree_selectedNode', {
                node: {
                    nodeType,
                    id
                }
            });
        });

        return node;
    }
});
