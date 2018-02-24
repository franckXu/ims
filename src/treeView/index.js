import './index.less';
import Model from "./model";

import baseService from 'base.service';
const getTree         = baseService('getTree');
const manageCatalog   = baseService('manageCatalog');
const updateTree      = baseService('updateTree');
const getEquipment    = baseService('getEquipment');
const qryDict         = baseService('qryDict');
const qryOrganization = baseService('qryOrganization');
const mountEquipments = baseService('mountEquipments');
const alarmGrade      = baseService('alarmGrade');

const renderOptionHtml = data => data.map(v => `<option value='${v.id}'>${v.name}</option>`).join('')

const ICON_MAPPING = {
    '$2': 'icon-port',
    '$1': 'icon-equipment',
    '$0': 'icon-organization'
}

const addIconCls = data => {
    data.forEach(d => {
        d.iconCls = ICON_MAPPING['$'+d.nodeType] || ICON_MAPPING['$0'];
    })
    return data;
}

window.$ = $;

export default Backbone.View.extend({
    model: null,
    templates: {
        wrap: _.template(require('./treeView.html')),
    },
    events: {
        'click #treeTab': 'clickTreeTabHandler'
    },
    clickTreeTabHandler(evt) {
        console.log(evt);
    },
    initialize() {
        this.model = new Model();
        this.listenTo(this.model, 'change:proTree', () => {
            this.renderTree(this.model.get('proTree'), '#proTree')
        });
        this.listenTo(this.model, 'change:geographyTree', () => {
            this.renderTree(this.model.get('geographyTree'), '#geographyTree')
        });
        this.listenTo(this.model, 'change:curTabIndex', () => {
            this.toggleTabHandler()
        })
    },
    appendequipment(e) {
        //将面板输入内容入参服务器然后自动刷新该节点？
        $("#choose-equipment-dialog #qryForm")[0].reset();
        $("#choose-equipment-dialog #qryForm #organization").data('org_id','');

        $("#choose-equipment-dialog").dialog('open');
        /* let node = this.$('#resource_specialty_view').tree('getSelected');
        if (node.state === 'open') {
            $('#equipmentinfo').menu('show', { //新建设备弹出面版
                left: e.pageX,
                top: e.pageY
            });
        } else {
            alert('请先展开目录');
        } */
    },
    editit(e) { //这个分设备修改，同新建设备，非设备直接编辑节点名称，需要接口保存修改名称
        const curTabIndex = this.model.get('curTabIndex');
        const node = this.$(`#${curTabIndex === 0 ? 'proTree' : 'geographyTree'}`).tree('getSelected');

        this.model.set('catalogOperate', '1');
        $("#catalog_name_ipt").val(node.text);
        $('#cataloginfo').dialog('open');

        /* if (node.nodeType === "1") {
            this.$('#resource_specialty_view').tree('beginEdit', node.target)
        } else {
            $('#equipmentinfo').menu('show', {
                left: e.pageX,
                top: e.pageY
            });
        } */
    },
    removeit() { //删除，数据配有node——type属性，只有空的目录和设备可删除，端口类型应该不能做任何操作
        let node = this.$('#resource_specialty_view').tree('getSelected');
        this.$('#resource_specialty_view').tree('remove', node.target);
    },
    refurbish() { //指点节点刷新，没搞懂api提供的reload方法，树改为异步加载后，刷新节点为再次请求节点数据
        /* let node = this.$('#resource_specialty_view').tree('getSelected');
        this.$('#resource_specialty_view').tree('reload', node.target); */
        this.curTreeSelectNode = this.getSelectedNode();
        this.loadChilderNode(this.getSelectedNode())
    },
	curTreeSelectNode : null,
    setStateByIsChildens(children) {
        for (var i = 0; i < children.length; i++) {
            if (children[i].ischirdens == 1) {
                if (children[i].children) {
                    children[i].state = 'open';
                    this.setStateByIsChildens(children[i].children);
                } else {
                    children[i].state = 'closed';
                }
            }

        }

    },
    renderTree(data, selector) {
        let _self = this;

        for (var i= 0; i < data.length; i++){
            var ch = data[i]["children"];
            this.setStateByIsChildens(ch);
        }

        // now restore the tree
        // $('#tt').tree('loadData', [data]);

        this.$(selector)
            .tree({
                data: data,
                lines: true,
                formatter(node){
                    return `<em id='${node.id}' class='${ node.alarmInfo ? `alarm-${node.alarmInfo.grade}` : ''}'>${node.text}</em>`;
                },
                onContextMenu(e, node) {
                    e.preventDefault();
                    $(this).tree('select', node.target);
                    switch (node.nodeType) { //根据节点类型判断可以进行的操作
                        case '0':
                            $('#operation_panel')
                                .menu('enableItem', $('#add_catalog'))
                                .menu('enableItem', $('#add_equipment'))
                                .menu('enableItem', $('#edit_item'))
                                .menu('enableItem', $('#remove_item'))
                                .menu('enableItem', $('#refurbish_item'))
                            break;
                        case '1':
                            $('#operation_panel')
                                .menu('disableItem', $('#add_catalog'))
                                .menu('disableItem', $('#add_equipment'))
                                .menu('enableItem', $('#edit_item'))
                                .menu('enableItem', $('#remove_item'))
                                .menu('enableItem', $('#refurbish_item'))
                            break;
                        case '2':
                            $('#operation_panel')
                                .menu('disableItem', $('#add_catalog'))
                                .menu('disableItem', $('#add_equipment'))
                                .menu('enableItem', $('#edit_item'))
                                .menu('enableItem', $('#remove_item'))
                                .menu('disableItem', $('#refurbish_item'))
                            break;
                    }
                    $('#operation_panel').menu('show', {
                        left: e.pageX,
                        top: e.pageY
                    });
                },
                onClick:_.debounce(function(node) {
                     const index = _self.model.getIndex();
                     node.curTabIndex = index+'';
                    _self.curTreeSelectNode = node;
                    _self.clickNodeHandler(node)
                },500),
                onBeforeExpand(node) {
                    if (!node.children) {
                        _self.curTreeSelectNode = node;
                         const index = _self.model.getIndex();
                         node.curTabIndex = index + '';
                        _self.clickNodeHandler(node)
                    }
                    return true;
                },
                onExpand(node){
                    $(this).tree('getChildren',node.target).forEach(({target,icon})=>{
                        if (icon) {
                            $(target).find('span.tree-icon').css({
                                background: `url(../../assets/img/icons/${icon}) no-repeat center center`,
                                'background-size': '100% 100%'
                            })
                        }
                    })
                }
            });

    },
    refurbish_item() { //刷新，端口应该没有刷新操作
        if ($('#operation_panel').menu("getItem", $('#refurbish_item')).disabled) {
            return;
        }
        _self.refurbish()
    },

    toggleTabHandler() {
        const index = this.model.get('curTabIndex');
        if (index === 0) {
            if (this.model.get('proTree').length) return;
            this.reqGetTree({
                view_type: '1',
                id: '',
                noteType : '0'
            });

        } else if (index === 1) {
            if (this.model.get('geographyTree').length) return;
            this.reqGetTree({
                view_type: '0',
                id: '',
                noteType : '0'
            })

        }
    },

    qryEquipmentList(param){
        getEquipment(param).then(({ header, response })=>{
            if (header.rspcode === '0000') {
                $("#equipmentTable").datagrid('loadData',response.list);
            } else {
                alert('操作失败');
            }
        })
    },

    render() {
        const self = this;
        this.$el.html(this.templates.wrap());
        this.$("#choose-equipment-dialog").html(require('./choose-equipment-dialog.html'))
        $.parser.parse(this.$('#parent_id'));

        // 关闭所有默认打开的弹窗
        $('#cataloginfo').dialog('close');
        $('#deleteCatalog-dialog').dialog('close');
        $('#choose-equipment-dialog').dialog('close');
        $('#choose-organization-dialog').dialog('close');

        $('#treeTab').tabs({
            onSelect(title, index) {
                self.model.set('curTabIndex', index);
            }
        });

        // this.qryEquipmentList();

        // 注册右击菜单的事件
        $('#add_catalog').click(() => { //新建目录
            if ($('#operation_panel').menu("getItem", $('#add_catalog')).disabled) return;
            this.model.set('catalogOperate', '0');
            $('#cataloginfo').dialog('open');

            // self.appendcatalog()
        });
        $('#add_equipment').click(function(e) { //新建设备
            if ($('#operation_panel').menu("getItem", $('#add_equipment')).disabled) {
                return;
            }
            self.appendequipment(e)
        });

        $('#edit_item').click((e) => {
            this.editit(e)
        });

        $('#remove_item').click((e) => {
            const node = this.getSelectedNode();
            let html = '';

            switch (node.nodeType){
                case '0':
                    html = '确定要删除此目录吗?'
                    break;
                case '1':
                    html = '确定要从资源视图中移除此设备吗?';
                    break;
                default:
                    html = '确定要删除此端口吗?'
            }

            $("#deleteCatalog-dialog").dialog('open');
            $("#deleteCatalog-dialog .content").html(html)
        });

        // 注册弹窗的事件
        $('#ipt_confirm_btn').on('click', () => {
            this.addCatalog()
        });

        $('#ipt_cancle_btn').on('click', function() {
            $('#catalog_name_ipt').val('');
            $('#cataloginfo').dialog('close');
        });

        $('#refurbish_item').click(function() { //刷新，端口应该没有刷新操作
            if ($('#operation_panel').menu("getItem", $('#refurbish_item')).disabled) {
                return;
            }
            self.refurbish()
        });

        // 设备列表的初始化
        $('#equipmentTable').datagrid({
            fit: true,
            columns: [[
                {
                    field: 'id',
                    checkbox : true
                }, {
                    field: 'name',
                    title: '名称'
                }, {
                    field: 'vender_id',
                    title: '厂家编号'
                }, {
                    field: 'model_id',
                    title: '型号编号'
                }, {
                    field: 'ip',
                    title: 'IP地址'
                }, {
                    field: 'mac',
                    title: 'MAC地址'
                }, {
                    field: 'organization_id',
                    title: '归属组织机构编号'
                }, {
                    field: 'generatorRoom_id',
                    title: '归属机房编号'
                }, {
                    field: 'rack',
                    title: '归属机架'
                }, {
                    field: 'frame',
                    title: '归属机框'
                }, {
                    field: 'office_direction',
                    title: '归属局向'
                }, {
                    field: 'user_board_amount',
                    title: '用户板数量'
                }, {
                    field: 'user_port_amount',
                    title: '用户端口数量'
                }, {
                    field: 'version',
                    title: '版本'
                }, {
                    field: 'snmp_version',
                    title: 'SNMP版本'
                }, {
                    field: 'snmp_community',
                    title: 'SNMP团体'
                }, {
                    field: 'status',
                    title: '状态'
                }
            ]]
        });


        $("#deleteCatalog-dialog")
            .on('click', '#cancleBtn', e => {
                $('#deleteCatalog-dialog').dialog('close')
            })
            .on('click', '#confirmBtn', e => {
                const node = this.getSelectedNode();
                updateTree({
                    view_type: this.model.get('curTabIndex') === 0 ? '1' : '0',
                    id: node.id,
                    nodeType : node.nodeType
                }).then(({
                    header,
                    response
                }) => {
                    if (header.rspcode === '0000') {
                        // this.model.deleteNode(node);
                        this.$(this.getCurTab()).tree('remove',this.getSelectedNode().target)
                        $('#deleteCatalog-dialog').dialog('close')
                    } else {
                        alert('删除失败')
                    }
                },err=>alert(err))

            })


        // 请求用于初始化页面的数据
        this.reqGetTree({
            view_type: '1',
            id: '',
            noteType : '0'
        });

        // 'model_id',
        Promise.all(['vender_id','generator_room_id','status'].map(name=>{
            return new Promise((res,rej)=>{
                qryDict({ name })
                    .then(({header,response})=>{
                        if (header.rspcode === '0000') {
                            res(response.list)
                        }else{
                            rej(header.rspdesc)
                        }
                    },err=>rej(err))
            })
        })).then(([vender,generator_room,status])=>{
            [vender,generator_room,status].forEach(data=>data.unshift({name:'请选择',id:''}))
            $("#vender").html(
                renderOptionHtml(vender)
            )
            $("#generator-room").html(
                renderOptionHtml(generator_room)
            )
            $("#status").html(
                renderOptionHtml(status)
            )

        },err=>{
            console.log(err);
            alert('获取查询设备的字典组失败')
        })


        $("#choose-equipment-dialog")
            .on('click','#qryEquipmentBtn',(evt)=>{
                const param = {};
                const $qryForm = $('#choose-equipment-dialog #qryForm');
                ['generator-room','name','ip','vender','model','status']
                    .forEach(k=>{
                        param[k] = $qryForm.find(`#${k}`).val()
                    });

                param.org_id = $('#organization').data('org_id');
                this.qryEquipmentList(param);
            })
            .on('click','#cancelBtn',evt=>{
                $("#choose-equipment-dialog").dialog('close');
            })
            .on('click','#submitBtn',evt=>{
                const index = this.model.get('curTabIndex');
                mountEquipments({
                    view_type:     index === 0 ? '1' : '0', // 0 - 地理视图 1 - 专业视图
                    parent_id:     this.getSelectedNode().id,
                    equipmentList: $("#equipmentTable").datagrid('getChecked').map(item=>({equipment_id:item.id}))
                }).then(({header,response})=>{
                    if (header.rspcode === '0000') {
                        $("#choose-equipment-dialog").dialog('close');
                        this.loadChilderNode(this.getSelectedNode())
                        console.log(header.rspdesc);
                    }else{
                        alert('操作失败')
                    }
                })
            })
            .on('change','#vender',evt=>{
                const value = evt.target.value;
                if(value){
                    qryDict({ name : 'model' , id: evt.target.value })
                        .then(({header,response})=>{
                            if (header.rspcode === '0000') {
                                response.list.unshift({name:'请选择',id:''})
                                $("#model").html(
                                    renderOptionHtml(response.list)
                                )
                            }else{
                                alert('获取型号信息失败')
                            }
                        },err=>{
                            alert('获取型号信息失败')
                        })
                }else{
                    $("#model").html(renderOptionHtml([{name:'请选择',vlaue:''}]));
                }

            })
            .on('click','#organizationBorwserBtn',evt=>{
                this.tree = [];
                qryOrganization({
                    id : '0'
                }).then(({header,response})=>{
                        if (header.rspcode === '0000') {
                            this.renderOrganization(response.list);
                            $('#choose-organization-dialog').dialog('open')
                        }else{
                            alert('获取组织结构数据失败')
                        }
                    },err=>{
                        alert('获取组织结构数据失败')
                        console.log(err);
                    })
            })


        $("#choose-organization-dialog")
            .on('click','#submitBtn',()=>{
                const node = $("#choose-organization-dialog #organizationTree").tree("getSelected")
                console.log(node);
                $("#organization").val(node.org_name)
                    .data('org_id',node.org_id)
                $("#choose-organization-dialog").dialog('close');
            })
            .on('click','#cancelBtn',()=>{
                $("#choose-organization-dialog").dialog('close');
            })

    },
    tree : [],
    renderOrganization(list) {
        const self = this;
        const tree = this.tree;
        const r = (item, tree) => {
            for (let j = 0, len = tree.length, treeItem; j < len; j++) {
                treeItem = tree[j];
                if (item.parent_id === treeItem.org_id) {
                    treeItem.children ? treeItem.children.push(item) : treeItem.children = [item];
                    break;
                } else if (treeItem.children) {
                    r(item, treeItem.children)
                }
            }
        }

        for (let z = 0, len = list.length,item; z < len; z++) {
            item      = list[z];
            item.id   = item.org_id;
            item.text = item.org_name;
        }

        for (let i = 0, len = list.length, item; i < len; i++) {
            item = list[i];
            if (item.parent_id !== '0') {
                r(item, tree);
            }else{
                tree.push(item)
            }
        }

        $("#organizationTree").tree({
            data : this.tree,
            onClick({org_id,children,target}){
                if (children) return ;

                qryOrganization({
                    id : org_id
                }).then(({header,response})=>{
                        if (header.rspcode === '0000') {
                            self.renderOrganization(response.list);
                            const node = $("#organizationTree").tree('find',org_id);
                            $("#organizationTree").tree('select',node.target)
                        }else{
                            alert('获取组织结构数据失败')
                        }
                    },err=>{
                        alert('获取组织结构数据失败')
                        console.log(err);
                    })
            }
        })

    },
    getSelectedNode() {
        const curTabIndex = this.model.get('curTabIndex');
        const node = this.$(`#${curTabIndex === 0 ? 'proTree' : 'geographyTree'}`).tree('getSelected');
        return node;
    },
    addCatalog() {
        const _seft = this;
        const { curTabIndex, catalogOperate } = this.model.attributes;
        const $treeViewElm = _seft.$(curTabIndex === 0 ? '#proTree' : '#geographyTree');
        const node = $treeViewElm.tree('getSelected');
        const catalog_name = $('#catalog_name_ipt').val();

        if (!catalog_name) {
            alert('请输入目录名');
            return;
        }

        manageCatalog({
            type: catalogOperate,
            view_type: curTabIndex === 0 ? '1' : '0',
            id: node.id,
            name: catalog_name,
        }).then(({
            header,
            response
        }) => {
            if (header.rspcode !== '0000') {
                console.log(header.rspdesc);
                return alert('操作失败')
            } else {
                $('#catalog_name_ipt').val('');
                $('#cataloginfo').dialog('close');

                if (catalogOperate === '0') {
                    this.loadChilderNode(node);
                } else {
                    /* 将数据更新到model里，保持数据与视图的一致性，
                    但此操作对视图并没有影响，视图将由easyui单独更新 */
                    /* this.model.updateCatalogNode({
                        id: node.id,
                        text: catalog_name
                    }); */

                    $treeViewElm.tree('update', {
                        target: node.target,
                        text: catalog_name
                    })
                    console.log(this.model.get('proTree'));
                }
            }
        }, err => {
            alert('操作失败')
            console.log(err);
        })
    },
    /*
     * 当数据为空是地，用getTree方法来加载数据
     */
    reqGetTree(reqParam) {
        getTree(reqParam).then(({ header, response }) => {
            if (header.rspcode === '0000') {
                const tab = $('#treeTab').tabs('getSelected');
                const index = $('#treeTab').tabs('getTabIndex', tab);
                const list_original = addIconCls(response.list.filter(item=>item));
                const list = [];

                const hasParentFn = item =>{
                    let hasParent = false;
                    for (let j = 0, len = list.length,item2; j < len; j++) {
                        item2 = list[j];
                        if (item2.id === item.parent_id) {
                            item2.children ? item2.children.push(item) : item2.children = [item];
                            hasParent = true;
                            break;
                        }
                    }
                    return hasParent;
                }

                for (let i = 0, len = list_original.length,item; i < len; i++) {
                    item = list_original[i];
                    if (item.alarmInfo) {
                        Object.assign(item, {
                            alarmInfo: {
                                grade: 2,
                                title: "test_zhangbaogen"
                            }
                        })
                    }

                    if (!hasParentFn(item)){
                       list.push(item)
                    }
                }

                this.model.set(index === 0 ? 'proTree': 'geographyTree', list);

            } else {
                this.model.set({
                    proTree: [],
                    geographyTree: []
                });
            }
        }, err => {
            alert(err.statusText)
            console.log(err)
        })
    },

    clickNodeHandler(node) {
        console.log('clickNodeHandler treeView-->',node);
        appEvent.trigger('change_tree_selectedNode', {
            node
        })

        if (node.nodeType === '2') {
            console.log('该端口节点已经没下级');
            return;
        }

        if (node.children && node.children.length) {
            console.log('该节点的子节点已加载过');
            return;
        }

        this.loadChilderNode(node);

    },
    loadChilderNode(node) {
        const index = this.model.get('curTabIndex');
        getTree({
            view_type: index === 0 ? '1' : '0',
            id: node.id,
            nodeType: node.nodeType
        }).then(({ header, response }) => {
            if (header.rspcode !== '0000') return alert('加载失败');

            for (var i = 0; i < response.list.length; i++){
                var item = response.list[i];

                if(item.ischirdens  === 1 )  item.state = 'closed';
                if (item.alarmInfo) {
                    Object.assign(item, {
                        alarmInfo: {
                            grade: 2,
                            title: ""
                        }
                    })
                }
            }

            const newNodeList = addIconCls(response.list);

            const childrenNodeType = node.nodeType === '0' ? '1': node.nodeType === '1' ? '2': null;
            if (childrenNodeType){
                const idList =
                    newNodeList
                        .filter(item => item.nodeType === childrenNodeType)
                        .map(item => item.nodeType === '1' ? item.equipment_id : item.id )
                        .map(item => item.toString());

                if (idList.length){

                this.fetchAlarmGrade(childrenNodeType,idList)
                    .then(({
                        header,
                        response
                    }) => {
                        if (header.rspcode !== '0000')  return alert('加载失败');
                        response.list.forEach(alarmItem => {
                            newNodeList.forEach(nodeItem => {
                                if ('' + alarmItem.id === '' + nodeItem.id) {
                                    Object.assign(nodeItem, {
                                        alarmInfo: {
                                            grade: alarmItem.grade,
                                            title: alarmItem.title
                                        }
                                    })
                                }
                            })
                        })

                        this.loadChilderNodeNew(newNodeList)

                        // this.model.loadChilderNode(node, newNodeList)
                    })
                }else{
                    // this.model.loadChilderNode(node, newNodeList);
                    this.loadChilderNodeNew(newNodeList)
                }

            }else{
                this.loadChilderNodeNew(newNodeList);
                // this.model.loadChilderNode(node, newNodeList);
            }
        }, err => {
            alert(err)
            console.log(err)
        })
    },

    getCurTab(){
        const index = this.model.get('curTabIndex');
        return this.$(`#${index === 0 ? 'proTree' : 'geographyTree'}`)
    },

    loadChilderNodeNew(children){
        const $tree = this.getCurTab();
        const root = $tree.tree('getRoot');  // get root node
        const data = $tree.tree('getData', root.target);  // get the root node data
        const node = this.curTreeSelectNode || $tree.tree('getSelected');

        const recursive = data => {
            for (var i = 0, len = data.length, item; i < len; i++) {
                item = data[i];
                if (item.id === node.id && item.nodeType === node.nodeType) {
                    $tree
                        .tree('update',{
                            target : node.target,
                            children : []
                        })
                        .tree('reload',node.target)
                        .tree('append',{
                            parent : node.target,
                            data : children,
                        })
                        .tree('collapse',node.target)
                        .tree('expand',node.target)

                    break;
                } else if (Array.isArray(item.children)) {
                    recursive(item.children)
                }
            }
        }

        recursive([data]);
    },

    fetchAlarmGrade(type,idList) {
        return alarmGrade({
            type: type === '2' ? '0' : type === '0' ? '2' : '1',
            id: idList
        })
    }
});
