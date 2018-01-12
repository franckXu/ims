import showJTopoToobar from '../../vendor/toolbar.js';
import './index.less';

import createRequest from './getNodeList.service.js';
const getEquipmentLinkService = createRequest('getEquipmentLink');
const getPositionService      = createRequest('getPosition');
const alarmGradeService       = createRequest('alarmGrade');
const savePositionService     = createRequest('savePosition');

function newFlexionalLink(nodeA, nodeZ, arrowsRadius = 0, text = "", dashedPattern) {
    var link           = new JTopo.FlexionalLink(nodeA, nodeZ, text);
    link.arrowsRadius  = arrowsRadius;
    link.lineWidth     = 3; // 线宽
    link.offsetGap     = 30;
    link.bundleGap     = 15; // 线条之间的间隔
    link.textOffsetY   = 10; // 文本偏移量（向下15个像素）
    link.strokeColor   = JTopo.util.randomColor(); // 线条颜色随机
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
    link.strokeColor = JTopo.util.randomColor(); // 线条颜色随机
    link.dashedPattern = dashedPattern;
    return link;
}
const nodeImageTypeEnum = {
    '0': 'virtual',
    '1': 'device',
    '2': 'port',
}

let notHavePosiNodeCount = 0;

const createNode = data => {
    const {
        positionX,
        positionY
    } = data;
    var node = new JTopo.Node(data.name);

    if (typeof(positionX) === 'number' && typeof(positionY) === 'number') {
        node.setLocation(positionX, positionY);
    } else {
        node.setLocation(notHavePosiNodeCount * 50, 550 - 50);
        notHavePosiNodeCount++;
    }
    node.textPosition = 'Middle_Right';
    node.setImage(`./assets/img/topo/node_${nodeImageTypeEnum[data.type]}.png`, true);

    return node;
};

const Model = Backbone.Model.extend({
    defaults: {
        nodeList: []
    }
})

export default Backbone.View.extend({
    template: _.template(require("./index.html")),
    model: new Model(),
    events: {
        'click #contextmenu li': 'handlerContextMenuClick',
        'click #save': 'saveTopo'
    },

    initialize() {
        // this.listenTo(this.model, "change", this.render);
        /* console.log(process.env.NODE_ENV)
        console.log(isProd) */
    },

    render() {
        this.$el.html(this.template());

        const reqParam = {
            type: '1', //0-端口、1-设备 、2-组织机构；
            id: 'foo'
        };

        Promise.all([
            getEquipmentLinkService(reqParam),
            getPositionService(reqParam),
            alarmGradeService(reqParam)
        ]).then(resp => {
            const [linkToNodeListResp, nodeListResp, alarmGradeResp] = resp;
            if (
                linkToNodeListResp.header.rspcode === '0000' &&
                nodeListResp.header.rspcode === '0000' &&
                alarmGradeResp.header.rspcode === '0000'
            ) {
                this.renderTopo({
                    linkToNodeList: linkToNodeListResp.response.list,
                    nodeList: nodeListResp.response.list,
                    alarmGradeList: alarmGradeResp.response.list
                });
            } else {
                alert('加载失败')
                console.log(resp);
            }
        }, function() {
            alert('加载失败')
            console.log(arguments);
        });

        return this;
    },
    renderTopo({
        nodeList,
        linkToNodeList,
        alarmGradeList
    }) {
        var self = this;
        var canvas = this.$('#canvas')[0];
        var stage = new JTopo.Stage(canvas);
        //显示工具栏
        showJTopoToobar(stage, "#toolbar");
        var scene = new JTopo.Scene();
        stage.add(scene);
        scene.background = './assets/img/bg.jpg';

        console.log(nodeList);
        for (let i = 0, len = nodeList.length, node; i < len; i++) {
            node = Object.assign(createNode(nodeList[i]), {
                $$data: nodeList[i]
            });
            this.model.set('nodeList', [...this.model.get('nodeList'), node]);
            scene.add(node);
        }

        console.log(linkToNodeList);
        for (let j = 0, len = linkToNodeList.length, toNode, fromNode, lineData; j < len; j++) {
            lineData = linkToNodeList[j];

            for (let i = 0, nodeLen = this.model.get('nodeList').length,node; i < nodeLen; i++) {
                node = this.model.get('nodeList')[i];
                if(node.$$data.id === lineData.fromEquipment ){
                    fromNode = node;
                }
                if(node.$$data.id === lineData.toEquipment ){
                    toNode = node;
                }
            }

            /* fromNode = this.model.get('nodeList').find(node => node.$$data.id === lineData.fromEquipment );
            toNode = this.model.get('nodeList').find(node => node.$$data.id === lineData.toEquipment ); */
            if (toNode && fromNode) {
                var link = newFlexionalLink(fromNode, toNode, lineData.type === '1' ? 10 : 0);
                scene.add(link);
            }
        }


        console.log(alarmGradeList);
        for (let z = 0, len = alarmGradeList.length, alarm, targetNode; z < len; z++) {
            alarm = alarmGradeList[z];
            targetNode = this.model.get('nodeList').find(node => node.$$data.id === alarm.id);
            if (targetNode) {
                targetNode.alarm = alarm.grade;
            }
        }

    },
    renderTopo_bak() {
        var self = this;
        var canvas = this.$('#canvas')[0];
        var stage = new JTopo.Stage(canvas);
        //显示工具栏
        showJTopoToobar(stage, "#toolbar");
        var scene = new JTopo.Scene();
        stage.add(scene);
        scene.background = './assets/img/bg.jpg';

        var defaultNode = new JTopo.Node();
        defaultNode.text = '微软雅黑'; // 文字
        defaultNode.textPosition = 'Middle_Center'; // 文字居中
        defaultNode.textOffsetY = 8; // 文字向下偏移8个像素
        defaultNode.font = '14px 微软雅黑'; // 字体
        defaultNode.setLocation(0, 0); // 位置
        defaultNode.setSize(100, 60); // 尺寸
        defaultNode.borderRadius = 5; // 圆角
        defaultNode.borderWidth = 2; // 边框的宽度
        defaultNode.borderColor = '255,255,255'; //边框颜色
        defaultNode.alpha = 0.7; //透明度

        // scene.add(defaultNode);

        var node = new JTopo.Node();
        cloudNode.alpha = 0.7;
        cloudNode.setImage('./assets/img/topo/cloud.png', true);
        cloudNode.setLocation(460, 280);
        cloudNode.showSelected = false; //不显示选中矩形
        cloudNode.layout = {
            type: 'circle',
            radius: 160
        };
        scene.add(cloudNode);

        for (var i = 0; i < 3; i++) {
            var node = new JTopo.CircleNode('host' + i);
            node.fillStyle = '200,255,0';
            node.radius = 15;
            // node.setLocation(scene.width * Math.random(), scene.height * Math.random());
            if (i == 2) {
                node.layout = {
                    type: 'tree',
                    direction: 'top',
                    width: 50,
                    height: 90,
                };
            } else if (i == 1) {
                node.layout = {
                    type: 'tree',
                    direction: 'left',
                    width: 50,
                    height: 90
                };
            } else {
                node.layout = {
                    type: 'circle',
                    radius: 60
                };
            }

            node.addEventListener("mousedrag", (function(node) {
                return function() {
                    self.mousedrag(node)
                }
            })(node))

            scene.add(node);
            var link = new JTopo.Link(cloudNode, node);
            scene.add(link);

            for (var j = 0; j < 3; j++) {
                var vmNode = new JTopo.CircleNode('vm-' + i + '-' + j);
                vmNode.radius = 10;
                vmNode.fillStyle = '255,0,0';
                vmNode.setLocation(scene.width * Math.random(), scene.height * Math.random());
                scene.add(vmNode);

                /*
                var link = new JTopo.FoldLink(nodeA, nodeZ, text);
                link.direction = direction || 'horizontal';
                link.arrowsRadius = 15; //箭头大小
                link.lineWidth = 3; // 线宽
                link.bundleOffset = 60; // 折线拐角处的长度
                link.bundleGap = 20; // 线条之间的间隔
                link.textOffsetY = 3; // 文本偏移量（向下3个像素）
                link.strokeColor = JTopo.util.randomColor(); // 线条颜色随机
                link.dashedPattern = dashedPattern;
                scene.add(link);
                return link;
                */

                const link = new JTopo.Link(node, vmNode, 'link');
                link.arrowsRadius = 10; //箭头大小
                scene.add(link);
                /* if (j === 0 && i === 2) {
                    console.log(vmNode);
                    vmNode.fillColor = "0,0,0";
                    link.strokeColor = "0,255,255";
                    vmNode.alarm = '二级告警';
                    vmNode.alarmColor = '0,255,0';

                    vmNode.addEventListener('mouseup', function(event) {
                        if (event.button == 2) { // 右键
                            // 当前位置弹出菜单（div）
                            $("#contextmenu").css({
                                top: event.pageY,
                                left: event.pageX
                            }).show();
                        }
                    });

                    nodeList.push(vmNode);
                } */
            }
        }

        JTopo.layout.layoutNode(scene, cloudNode, true);

        // nodeList[0].setLocation(50, 50);

        stage.addEventListener('click', function(e) {
            if (e.button === 0) {
                $("#contextmenu").hide()
            }
        });

        scene.addEventListener('mouseup', function(e) {
            if (e.target && e.target.layout) {
                JTopo.layout.layoutNode(scene, e.target, true);
            }
        });

    },

    handlerContextMenuClick(evt) {
        console.log(evt.currentTarget.innerHTML);
    },

    saveTopo() {
        const positionList = this.model.get('nodeList').map(node => {
            const { x, y } = node;
            const {id,type} = node.$$data;
            return {
                type , id,
                positionX: ''+parseInt(x),
                positionY: ''+parseInt(y)
            };
        })

        console.table(positionList)

        savePositionService({
            positionList
        }).then(({ header }) => {
            if (header.rspcode === '0000') {
                alert('保存成功')
            }else{
                alert(header.rspdesc)
            }
        }, err => {
            alert('保存失败')
        })
    }

});
