require('./warnView.less')
import Model from "./model";
import createRequest from 'base.service';
const tpl = _.template(require('./warn-detail-form.html'));
const tpl_record = _.template(require('./record-info.html'));
const activeAlarm_listPage = createRequest('activeAlarm_listPage');//告警信息列表
const activeAlarmeSumGrade = createRequest('activeAlarmeSumGrade ');//告警级别的总合
const activeAlarmeSumStatus = createRequest('activeAlarmeSumStatus');//处理动作的总合
const activeAlarmUpdate = createRequest('activeAlarmUpdate');//告警确认/反确认 && 告警清除 / 关闭
const activeAlarmHandle = createRequest('activeAlarmHandle');//添加处理记录
const activeAlarmServiceById = createRequest('activeAlarmServiceById');//告警详情
const alarmProcessHistorySelect = createRequest('alarmProcessHistorySelect');//告警详情

export default Backbone.View.extend({
    events: {},
    model: null,
    templates: {
        wrap: _.template(require('./warnView.html'))
    },

    initialize() {
        this.model = new Model();
        this.listenTo(this.model, "change:data", this.renderWarn.bind(this));
        this.listenTo(this.model, "change:history_data", this.history_data_fn.bind(this));
        this.listenTo(this.model, "change:checkBox_arr", this.render_checkBox_arr.bind(this));
        this.listenTo(this.model, "change:checkBox_arr_top", this.get_warnTable.bind(this));
        this.listenTo(this.model, "change:history_arr_top", this.get_historyTable.bind(this));
    },
    renderWarn() {
        let _self = this;
        let data = _self.model.get('data');
        let columns_arr = [
            { field: 'id', width: 150, align: 'center', title: '警告流水号' },
            { field: 'grade', width: 70, align: 'center', title: '告警级别' },
            { field: 'title', width: 100, align: 'center', title: '告警标题' },
            { field: 'major', width: 70, align: 'center', title: '归属专业' },
            { field: 'org_name', width: 70, align: 'center', title: '归属部门' },
            { field: 'first_time', width: 130, align: 'center', title: '首次发生时间' },
            { field: 'last_time', width: 130, align: 'center', title: '末次发生时间' },
            { field: 'amount', width: 60, align: 'center', title: '发生次数' },
            { field: 'ename', width: 60, align: 'center', title: '设备名称' },
            { field: 'vname', width: 60, align: 'center', title: '设备厂家' },
            { field: 'mname', width: 60, align: 'center', title: '设备类型' },
            { field: 'confirm', width: 60, align: 'center', title: '告警状态' },
        ]
        _self.model.set("checkBox_arr", columns_arr);
        _self.model.set("checkBox_arr_top", columns_arr);
        this.get_warnTable();
    },
    history_data_fn() {
        let _self = this;
        let data = _self.model.get('history_data');
        let columns_arr = [
            { field: 'id', width: 150, align: 'center', title: '警告流水号' },
            { field: 'grade', width: 70, align: 'center', title: '告警级别' },
            { field: 'title', width: 100, align: 'center', title: '告警标题' },
            { field: 'major', width: 70, align: 'center', title: '归属专业' },
            { field: 'org_name', width: 70, align: 'center', title: '归属部门' },
            { field: 'first_time', width: 130, align: 'center', title: '首次发生时间' },
            { field: 'last_time', width: 130, align: 'center', title: '末次发生时间' },
            { field: 'amount', width: 60, align: 'center', title: '发生次数' },
            { field: 'ename', width: 60, align: 'center', title: '设备名称' },
            { field: 'vname', width: 60, align: 'center', title: '设备厂家' },
            { field: 'mname', width: 60, align: 'center', title: '设备类型' },
            { field: 'confirm', width: 60, align: 'center', title: '告警状态' },
        ]
        _self.model.set("checkBox_arr", columns_arr);
        _self.model.set("checkBox_arr_top", columns_arr);
        this.get_historyTable();
    },

    get_warnTable() {
        var history_data = null;
        const data = this.model.get("data");
        const columns_arr = this.model.get("checkBox_arr");
        let _self = this;
        //  告警列表 表头
        $('#active-warn-table').datagrid({
            url: '',
            data: data,
            columns: [columns_arr],
            onRowContextMenu: function (e, _id, _obj) {
                e.preventDefault();
                _self.model.set('contextMenuId', _obj.id);
                $('#warn_panel').menu('show', {
                    left: e.pageX,
                    top: e.pageY
                });
            }
        });
    },

    get_historyTable() {
        const data = this.model.get("history_data");
        const columns_arr = this.model.get("checkBox_arr");
        let _self = this;
        $('#history-warn-table').datagrid({
            url: '',
            data: data,
            columns: [columns_arr],
            onRowContextMenu: function (e, _id, _obj) {
                e.preventDefault();
                _self.model.set('contextMenuId', _obj.id);
                $('#warn_panel').menu('show', {
                    left: e.pageX,
                    top: e.pageY
                });
            }
        });
    },

    render_checkBox_arr() {
        let data = this.model.get('checkBox_arr');
        // 生成告警设置里面的多选框
        $('#radio_data').html(' ');
        for (let i = 0; i < data.length; i++) {
            $('#radio_data').append("<div class='ipt_cell'><input class='radio_data_btn' type='checkbox' value = 'data[i].title'/>" + data[i].title + "</div>")
        }
    },

    get_detail_record(id) {
        Promise.all([
            activeAlarmServiceById({id}),
            alarmProcessHistorySelect({id})
        ]).then(resp => {
            const [a, b] = resp;
            let data = a.response.alarm_detail[0];
            console.log('b==>',b);
            let data_re = b.response.history_list;
            console.log(data_re);
            $('#warn_detail_form').html(tpl({ data }));
            for (let i = 0, len = data_re.length; i < len; i++) {
                let data =  data_re[i]
                $('#warn_detail_record').append(tpl_record({data}))
            }
            $('#warn-detail').dialog('open');
        })
        // window.appEvent.trigger('warnDetail', {
        //     x
        // })
    },

    render() {
        var _self = this;
        this.$el.html(this.templates.wrap());
        $.parser.parse(this.$('#warnbox-box'));
        // $("#warn_detail_form").html(require('./warn-detail-form.html'));
        //  Tab切换
        $('#warnTab').tabs({
            url: '',
        });
        $('#warndata').datagrid({
            // columns :
            // url:''
            // data
        });
        // 点击 tree 生成对应的告警列表
        window.appEvent.on('change_tree_selectedNode', ({ node }) => {
            activeAlarm_listPage({
                category: "0",
                view_type: node.nodeType,
                id: node.id
            }).then(reps => {
                this.model.set('data', reps.response.alarm_list);
            });
            activeAlarm_listPage({
                category: "1",
                view_type: node.nodeType,
                id: node.id
            }).then(reps => {
                this.model.set('history_data', reps.response.alarm_list);
            });
            activeAlarmeSumGrade({
            }).then(reps => {
                $('#warnTable_cell_top').html(' ');
                $('#warnTable_cell_con').html(' ');
                // 动态设置 warnTable_cell_x 宽度
                let arr = reps.response.alarm_list;
                let len = arr.length * 80;
                $('#warnTable_cell_top').css('width', len + 'px');
                $('#warnTable_cell_con').css('width', len + 'px');
                // 生成 告警级别 列表数据
                for (let i = 0; i < arr.length; i++) {
                    $('#warnTable_cell_top').append("<span class ='table_cell'>" + arr[i].grade + "</span>");
                    $('#warnTable_cell_con').append("<span  class ='table_cell' style='background-color:" + arr[i].color + "'>" + arr[i].conut + "</span>")
                }
            });
            activeAlarmeSumStatus({
            }).then(reps => {
                $('#disposeTable_cell_top').html(' ');
                $('#disposeTable_cell_con').html(' ');
                // 动态设置 disposeTable_cell_x 宽度
                let arr = reps.response.alarm_list;
                let len = arr.length * 80;
                $('#disposeTable_cell_top').css('width', len + 'px');
                $('#disposeTable_cell_con').css('width', len + 'px');
                // 生成 处理动作 列表数据
                for (let i = 0; i < arr.length; i++) {
                    $('#disposeTable_cell_top').append("<span class ='table_cell'>" + arr[i].process_type + "</span>");
                    $('#disposeTable_cell_con').append("<span class ='table_cell'>" + arr[i].count + "</span>")
                }
            })
        });
        // warnDeny
        // 告警确认
        $('#warnConfirm').click(() => {
            let contextMenuId = _self.model.get('contextMenuId');
            const contextMenu = _self.model.get('data').find(item => item.id === contextMenuId)
            activeAlarmUpdate({
                id: contextMenu.id,//告警id ,(支持评量)
                confirm: "0" // 0 - 确认 1 - 反确认   
            }).then(() => {
                console.log("告警确认成功")
            })
        })
        // 告警反确认
        $('#warnDeny').click(() => {
            let contextMenuId = _self.model.get('contextMenuId');
            const contextMenu = _self.model.get('data').find(item => item.id === contextMenuId)
            activeAlarmUpdate({
                id: contextMenu.id,//告警id ,(支持评量)
                confirm: "1" // 0 - 确认 1 - 反确认   
            }).then(() => {
                console.log("告警反确认成功")
            })
        })

        //  关闭告警
        $('#closeWarn').click((e) => {
            let contextMenuId = _self.model.get('contextMenuId');
            const contextMenu = _self.model.get('data').find(item => item.id === contextMenuId)
            $('#warn_panel').menu('hide', {
                left: e.pageX,
                top: e.pageY
            });
            let btn = confirm('确定要关闭此告警吗？');
            if (btn === true) {
                activeAlarmUpdate({
                    id: contextMenu.id,
                    confirm: '4' //0 - 确认 1 - 反确认  2 - 清除 4 - 关闭,
                }).then(() => { });
                console.log('成功关闭此告警');
            } else if (btn === false) {
                console.log('成功关闭此告警');
            }
        });

        //  告警清除
        $('#warnClean').click(function () {
            let contextMenuId = _self.model.get('contextMenuId');
            const contextMenu = _self.model.get('data').find(item => item.id === contextMenuId)
            $('#w').window('open');
            $('#ok_confirm').click(function () {
                let text_val = $('#warn_text').val();
                // console.log("text_val_recode-->", text_val);
                activeAlarmUpdate({
                    cause: text_val,
                    id: contextMenu.id,
                    confirm: '2'
                }).then(reps => { });
                $('#warn_text').text('');
                $('#w').window('close');
            })
            $('#cancle_confirm').click(function () {
                $('#w').window('close');
            })
        });

        //  添加处理记录
        $('#add_warnRecord').click(function () {
            $('#record_text').text(null);
            let contextMenuId = _self.model.get('contextMenuId');
            const contextMenu = _self.model.get('data').find(item => item.id === contextMenuId)
            $('#record').window('open');
            $('#ok_confirm_record').click(function () {
                function get_raiod(e) {
                    let x = e;
                    let re;
                    for (let i = 0; i < x.length; i++) {
                        if (x[i].checked == true) {
                            re = x[i];
                            break;
                        }
                    }
                    return re;
                }
                let text_val = $('#record_text').val();
                //  添加处理记录接口
                activeAlarmHandle({
                    status: '11',//处理结果  0 - 已恢复 1 - 部分恢复 2 - 未恢复
                    log: text_val,
                    id: contextMenu.id
                }).then(reps => { });
                $('#record').window('close');
            })
            $('#cancle_confirm_record').click(function () {
                $('#record').window('close');
            })
        });

        // 告警设置
        $('#warnSet').click(() => {
            $('#warnSet_dataGrid').window('open');
            $('#up').click(() => {
                let checkBox_arr = this.model.get("checkBox_arr");
                let el = $('.radio_data_btn');
                let ipt_cell = $('.ipt_cell');
                let arr_ori = [];
                let arr_change = [];
                for (let i = 0; i < el.length; i++) {
                    arr_ori.push(i);
                }
                for (let i = 0; i < el.length; i++) {
                    if ($('.radio_data_btn').eq(i).is(':checked')) {
                        let item = $('.ipt_cell').eq(i);
                        $('.ipt_cell').eq(i).before(item);
                        arr_ori.splice(i - 1, 0, i);
                        arr_ori.splice(i + 1, 1);
                        break;
                    }
                }
                arr_change.length = 0;
                for (let i = 0; i < arr_ori.length; i++) {
                    let x = arr_ori[i]
                    arr_change.push(checkBox_arr[x]);
                }
                this.model.set("checkBox_arr", arr_change);
                this.model.trigger("change:checkBox_arr");
            });
            $('#down').click(() => {
                let checkBox_arr = this.model.get("checkBox_arr");
                let el = $('.radio_data_btn');
                let ipt_cell = $('.ipt_cell');
                let arr_ori = [];
                let arr_change = [];
                for (let i = 0; i < el.length; i++) {
                    arr_ori.push(i);
                }
                for (let i = 0; i < el.length; i++) {
                    if ($('.radio_data_btn').eq(i).is(':checked')) {
                        let y = i;
                        let item = $('.ipt_cell').eq(i);
                        $('.ipt_cell').eq(i + 1).after(item);
                        arr_ori.splice(i + 2, 0, i);
                        arr_ori.splice(y, 1);
                        break;
                    }
                }
                arr_change.length = 0;
                for (let i = 0; i < arr_ori.length; i++) {
                    let x = arr_ori[i];
                    arr_change.push(checkBox_arr[x]);
                }
                this.model.set("checkBox_arr", arr_change);
                this.model.trigger("change:checkBox_arr");
            });
            $('#ok_warnSet').click(() => {
                let arr = this.model.get('checkBox_arr');
                this.model.set("checkBox_arr_top", arr);
                this.model.trigger("change:checkBox_arr_top");
                this.model.set("history_arr_top", arr);
                this.model.trigger("change:history_arr_top");
                $('#warnSet_dataGrid').window('close');
            });
            $('#cancle_warnSet').click(() => {
                $('#warnSet_dataGrid').window('close');
            });
        });

        // 查看处理记录
        $('#check_warnRecord').click(()=>{
            let contextMenuId = _self.model.get('contextMenuId');
            const contextMenu = _self.model.get('data').find(item => item.id === contextMenuId)
            this.get_detail_record(contextMenu.id);

            $('#submitBtn_warnDetail').click(() => {
                $('#warn-detail').dialog('close');
            })
            $('#cancelBtn_warnDetail').click(() => {
                $('#warn-detail').dialog('close');
            })
        })

        // 告警详情
        $('#warnDetail').click(() => {
            let contextMenuId = _self.model.get('contextMenuId');
            const contextMenu = _self.model.get('data').find(item => item.id === contextMenuId)
            this.get_detail_record(contextMenu.id);

            $('#submitBtn_warnDetail').click(() => {
                $('#warn-detail').dialog('close');
            })
            $('#cancelBtn_warnDetail').click(() => {
                $('#warn-detail').dialog('close');
            })
        })
        // render
    }

});