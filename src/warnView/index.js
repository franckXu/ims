require('./warnView.less');
import Model from "./model";
import createRequest from 'base.service';
const tpl = _.template(require('./warn-detail-form.html'));
const tpl_record = _.template(require('./record-info.html'));
const listPage = createRequest('listPage');//告警信息列表
const activeAlarmeSumGrade = createRequest('activeAlarmeSumGrade ');//告警级别的总合 && 处理动作的总合
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
        //zhangbaogen
        this.model = new Model();
        this.listenTo(this.model, "change:data", this.renderWarn.bind(this));
        this.listenTo(this.model, "change:history_data", this.history_data_fn.bind(this));
        this.listenTo(this.model, "change:checkBox_arr", this.render_checkBox_arr.bind(this));
        this.listenTo(this.model, "change:checkBox_arr_top", this.get_warnTable.bind(this));
        this.listenTo(this.model, "change:history_arr_top", this.get_historyTable.bind(this));
        this.listenTo(this.model, "change:active_list", this.listPage_active.bind(this));
        this.listenTo(this.model, "change:history_list", this.listPage_history.bind(this));

    },
    renderWarn() {
        let _self = this;
        let data = _self.model.get('data');
        let columns_arr = [
            { field: 'id', width: 150, align: 'center', title: '警告流水号', sortable: true },
            {
                field: 'grade', width: 70, align: 'center', title: '告警级别', sortable: true, styler: function (value, row, index) {
                    if (value == "事件告警") {
                        return 'background-color:#54c054;';
                    } else if (value == "清除告警") {
                        return 'background-color:#5151fb;';
                    } else if (value == "提示告警") {
                        return 'background-color:#fdfd4b;';
                    } else if (value == "一般告警") {
                        return 'background-color:#fa9362;';
                    } else if (value == "严重告警") {
                        return 'background-color:#fd53e9;';
                    } else if (value == "紧急告警") {
                        return 'background-color:#e94747;';
                    }
                }
            },
            { field: 'title', width: 100, align: 'center', title: '告警标题', sortable: true },
            { field: 'major', width: 70, align: 'center', title: '归属专业', sortable: true },
            { field: 'org_name', width: 70, align: 'center', title: '归属部门', sortable: true },
            { field: 'first_time', width: 130, align: 'center', title: '首次发生时间', sortable: true },
            { field: 'last_time', width: 130, align: 'center', title: '末次发生时间', sortable: true },
            { field: 'amount', width: 60, align: 'center', title: '发生次数', sortable: true, sortable: true },
            { field: 'ename', width: 60, align: 'center', title: '设备名称', sortable: true, sortable: true },
            { field: 'vname', width: 60, align: 'center', title: '设备厂家', sortable: true, sortable: true },
            { field: 'mname', width: 60, align: 'center', title: '设备类型', sortable: true, sortable: true },
            { field: 'confirm', width: 60, align: 'center', title: '告警状态', sortable: true, sortable: true },
        ]
        _self.model.set("checkBox_arr", columns_arr);
        _self.model.set("checkBox_arr_top", columns_arr);
        this.get_warnTable();
    },
    history_data_fn() {
        let _self = this;
        let data = _self.model.get('history_data');
        let columns_arr = [
            { field: 'id', width: 150, align: 'center', title: '警告流水号', sortable: true },
            {
                field: 'grade', width: 70, align: 'center', title: '告警级别', sortable: true, styler: function (value, row, index) {
                    if (value == "事件告警") {
                        return 'background-color:#54c054;';
                    } else if (value == "清除告警") {
                        return 'background-color:#5151fb;';
                    } else if (value == "提示告警") {
                        return 'background-color:#fdfd4b;';
                    } else if (value == "一般告警") {
                        return 'background-color:#fa9362;';
                    } else if (value == "严重告警") {
                        return 'background-color:#fd53e9;';
                    } else if (value == "紧急告警") {
                        return 'background-color:#e94747;';
                    }
                }
            },
            { field: 'title', width: 100, align: 'center', title: '告警标题', sortable: true },
            { field: 'major', width: 70, align: 'center', title: '归属专业', sortable: true },
            { field: 'org_name', width: 70, align: 'center', title: '归属部门', sortable: true },
            { field: 'first_time', width: 130, align: 'center', title: '首次发生时间', sortable: true },
            { field: 'last_time', width: 130, align: 'center', title: '末次发生时间', sortable: true },
            { field: 'amount', width: 60, align: 'center', title: '发生次数', sortable: true },
            { field: 'ename', width: 60, align: 'center', title: '设备名称', sortable: true },
            { field: 'vname', width: 60, align: 'center', title: '设备厂家', sortable: true },
            { field: 'mname', width: 60, align: 'center', title: '设备类型', sortable: true },
            { field: 'confirm', width: 60, align: 'center', title: '告警状态', sortable: true },
        ]
        _self.model.set("checkBox_arr", columns_arr);
        _self.model.set("history_arr_top", columns_arr);
        this.get_historyTable();
    },
    aCount() { },

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
            fit: false,
            remoteSort: false,
            fitColumns: true,
            onRowContextMenu: function (e, _id, _obj) {
                e.preventDefault();
                _self.model.set('contextMenuId', _obj.id);
                $('#warn_panel').menu('show', {
                    left: e.pageX,
                    top: e.pageY
                });
            },
            pagination: true,
            pageNumber: 1,
            pageSize: 10,
            pageList: [10, 20, 30],
        });
        const pg = $("#active-warn-table").datagrid("getPager");
        const count = this.model.get('aCount');//活动告警总条数
        pg.pagination({
            total: count,
            pageNumber: window.warnView.model.get("aPageNumber"),
            onSelectPage: function (pageNumber, pageSize) {
                let pageNo = pageNumber;
                let pageS = pageSize;
                _self.listPage_active(pageNo, pageS)
                this.pageNumber = pageNumber;
            },
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
            fit: false,
            remoteSort: false,
            fitColumns: true,
            onRowContextMenu: function (e, _id, _obj) {
                e.preventDefault();
                _self.model.set('contextMenuId', _obj.id);
                $('#his_panel').menu('show', {
                    left: e.pageX,
                    top: e.pageY
                });
            },
            pagination: true,
            pageSize: 10,
            pageList: [10, 20, 30],
        });
        const pg = $("#history-warn-table").datagrid("getPager");
        const count2 = this.model.get('hisCount');//历史告警总条数

        pg.pagination({
            //
            pageNumber: window.warnView.model.get("hisPageNumber"),
            total: count2,
            onSelectPage: function (pageNumber, pageSize) {
                let pageNo = pageNumber;
                let pageS = pageSize;
                _self.listPage_history(pageNo, pageS);
                this.pageNumber = pageNumber;

            },
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

    get_raiod(e) {
        let x = e;
        let re;
        for (let i = 0; i < x.length; i++) {
            if (x[i].checked == true) {
                re = x[i];
                break;
            }
        }
        return re;
    },

    get_detail_record(parameter, his = '') {
        let id;
        let _nodetype;
        let _viewType;
        console.log(parameter);
        if ((typeof parameter) == 'object') {
            id = parameter.nodeInfo.$$data.id;
            if (parameter.nodeInfo) {
                _nodetype = parameter.nodeInfo.$$data.type;
                _viewType = parameter.nodeInfo.curTabIndex;

            } else {
                _nodetype = ''
            }
        } else {
            id = parameter + '';
        }
        let a = this.model.get('active_list');
        activeAlarmServiceById({
            history: his,
            isTopo: _nodetype || '',
            viewType: _viewType || '',
            id: id
        }).then(resp => {
            console.log('get_detail_record-->', resp);
            let data = [];
            if (resp.response.alarm_detail) {
                data = resp.response.alarm_detail;
            }

            $('#warn_detail_form').html('');
            if (data.length != 0) {
                $('#warn_detail_form').html(tpl({ data }));
            }

            $('#warn-detail').window('open');
            this.curAlarmDetailIndex = 0;
        })
        alarmProcessHistorySelect({
            history: his,
            isTopo: _nodetype || '',
            viewType: _viewType || '',
            id: id,
        }).then(resp => {
            $('#warn_detail_record').html('');
            console.log('alarmProcessHistorySelect.resp-->', resp);
            let data_re;
            data_re = resp.response.positionList;
            // if (data_re.length && data_re.length != 0) {
                for (let i = 0, len = data_re.length; i < len; i++) {
                    let data = data_re[i]
                    $('#warn_detail_record').append(tpl_record({ data }))
                }
            // }
            $('#warn-detail').window('open');
            this.curAlarmDetailIndex = 0;
        })
        // Promise.all([
        //     activeAlarmServiceById({ id }),
        //     alarmProcessHistorySelect({ id })
        // ]).then(resp => {
        //     $('#warn_detail_record').html('');
        //     const [a, b] = resp;
        //     let data = a.response.alarm_detail[0];
        //     let data_re = b.response.history_list;
        //     console.log(data);
        //     console.log(data_re);
        //     $('#warn_detail_form').html(tpl({ data }));
        //     for (let i = 0, len = data_re.length; i < len; i++) {
        //         let data = data_re[i]
        //         $('#warn_detail_record').append(tpl_record({ data }))
        //     }
        //     $('#warn-detail').window('open');
        // })
    },
    // 活动告警
    listPage_active(pageNumber, pageSize) {
        if ((typeof pageNumber) !== (typeof 1)) {
            pageNumber = 1;
        }
        if ((typeof pageSize) !== (typeof 1)) {
            pageSize = 10;
        }
        let _pageNumber = pageNumber;
        let _pageSize = pageSize;
        let node = this.model.get('active_list');
        listPage({
            pageNo: _pageNumber + '',
            pageSize: _pageSize + '',
            category: "0",
            view_type: node.curTabIndex,
            id: node.id + ''
        }).then(reps => {
            let aPageNumber = reps.response.pageNo;
            this.model.set('aCount', reps.response.count);
            this.model.set('data', reps.response.alarm_list);
            this.model.set('aPageNumber', aPageNumber);
            this.model.trigger('change:data');
            let count = reps.response.count;

        });
    },
    // 历史告警
    listPage_history(pageNumber, pageSize) {
        if ((typeof pageNumber) !== (typeof 1)) {
            pageNumber = 1;
        }
        if ((typeof pageSize) !== (typeof 1)) {
            pageSize = 10;
        }
        let _pageNumber = pageNumber;
        let _pageSize = pageSize;


        let node = this.model.get('history_list');
        listPage({
            pageNo: _pageNumber + '',
            pageSize: _pageSize + '',
            category: "1",
            view_type: node.curTabIndex,
            id: node.id + ''
        }).then(reps => {
            let count = reps.response.count;
            let hisPageNumber = reps.response.pageNo;

            this.model.set('hisCount', count);
            this.model.set("hisPageNumber", hisPageNumber);
            this.model.set('history_data', reps.response.alarm_list);
        });
    },
    //告警声音
    playSound() {
        var borswer = window.navigator.userAgent.toLowerCase();
        if (borswer.indexOf("ie") >= 0) {
            //IE内核浏览器
            var strEmbed = '<embed name="embedPlay" src="../../assets/audio/audio2.wav" autostart="true" hidden="true" loop="false"></embed>';
            if ($("body").find("embed").length <= 0)
                $("body").append(strEmbed);
            var embed = document.embedPlay;

            //浏览器不支持 audion，则使用 embed 播放
            embed.volume = 100;
            //embed.play();这个不需要
        } else {
            //非IE内核浏览器
            var strAudio = "<audio id='audioPlay' src='../../assets/audio/audio2.wav' hidden='true'>";
            if ($("body").find("audio").length <= 0)
                $("body").append(strAudio);
            var audio = document.getElementById("audioPlay");

            //浏览器支持 audion
            audio.play();
        }
    },
    //告警级别
    warnGrade() {
        activeAlarmeSumGrade({
        }).then(reps => {
            $('#warnTable_cell_top').html(' ');
            $('#warnTable_cell_con').html(' ');
            // 动态设置 warnTable_cell_x 宽度
            let arr1 = reps.response.alarm_list;
            let len1 = arr1.length * 80;
            let counts = 0;
            let oldaCount = this.model.get('oldaCount');
            $('#warnTable_cell_top').css('width', len1 + 'px');
            $('#warnTable_cell_con').css('width', len1 + 'px');
            for (var i = arr1.length - 1; i >= 0; i--) {
                counts += Number(arr1[i].grcount);
                if (arr1[i].grade == "事件告警") {
                    arr1[i].color = '#54c054';
                } else if (arr1[i].grade == "清除告警") {
                    arr1[i].color = '#5151fb';
                } else if (arr1[i].grade == "提示告警") {
                    arr1[i].color = '#fdfd4b';
                } else if (arr1[i].grade == "一般告警") {
                    arr1[i].color = '#fa9362';
                } else if (arr1[i].grade == "严重告警") {
                    arr1[i].color = '#fd53e9';
                } else if (arr1[i].grade == "紧急告警") {
                    arr1[i].color = '#e94747';
                }
            };
            let j = 5;
            if (oldaCount == "" || oldaCount == null || oldaCount == undefined || oldaCount == counts) {
                this.model.set('oldaCount', counts);
            } else if (oldaCount != "" && oldaCount != null && oldaCount != undefined && counts > oldaCount) {
                this.model.set('oldaCount', counts);
                this.playSound();
            };
            // 生成 告警级别 列表数据
            for (let i = 0; i < arr1.length; i++) {
                $('#warnTable_cell_top').append("<span class ='table_cell'>" + arr1[i].grade + "</span>");
                $('#warnTable_cell_con').append("<span  class ='table_cell' style='background-color:" + arr1[i].color + "'>" + arr1[i].grcount + "</span>")
            }

            $('#disposeTable_cell_top').html(' ');
            $('#disposeTable_cell_con').html(' ');
            // 动态设置 disposeTable_cell_x 宽度
            let arr2 = reps.response.process_list;
            let len2 = arr2.length * 80;
            $('#disposeTable_cell_top').css('width', len2 + 'px');
            $('#disposeTable_cell_con').css('width', len2 + 'px');
            // 生成 处理动作 列表数据
            for (let i = 0; i < arr2.length; i++) {
                $('#disposeTable_cell_top').append("<span class ='table_cell'>" + arr2[i].process_type + "</span>");
                $('#disposeTable_cell_con').append("<span class ='table_cell'>" + arr2[i].prcount + "</span>")
            }
        });
    },

    curAlarmDetailIndex :0,
    render() {
        var _self = this;
        this.$el.html(this.templates.wrap());
        $.parser.parse(this.$('#warnbox-box'));

        //  Tab切换
        $('#warnTab').tabs({
            url: '',
        });
        $('#warndata').datagrid({
            // columns :
            // url:''
            // data
        });
        // 点击 tree 生成对应的告警列表 zhangbaogen
        window.appEvent.on('change_tree_selectedNode', ({ node }) => {
            console.log(node);
            //活动告警
            this.model.set('active_list', node);
            this.model.trigger("change:active_list");
            //历史告警
            this.model.set('history_list', node);
            this.model.trigger("change:history_list");
            this.warnGrade();

            this.setInterval_time(10);

        });
        //  topo图触发的告警列表
        window.appEvent.on('warnDetailFn', (parameters) => {
            //zhangbaogen
            // console.log('fromo topo-->',parameters)
            this.get_detail_record(parameters);
            $('#submitBtn_warnDetail').click(() => {
                $('#warn-detail').window('close');
            })
            $('#cancelBtn_warnDetail').click(() => {
                $('#warn-detail').window('close');
            })
        });
        // 告警确认
        $('#warnConfirm').click(() => {

            let contextMenuId = _self.model.get('contextMenuId');
            const contextMenu = _self.model.get('data').find(item => item.id === contextMenuId)
            let [...id] = $('#active-warn-table').datagrid('getSelections');
            let arr = [];
            for (let i = 0, len = [...id].length; i < len; i++) {
                arr.push([...id][i].id + '')
            }
            activeAlarmUpdate({
                id: arr,//告警id ,(支持评量)
                confirm: "0" // 0 - 确认 1 - 反确认
            }).then(() => {
                var pageNumber = $('#active-warn-table').datagrid('getPager').data("pagination").options.pageNumber;
                var pageSize = $('#active-warn-table').datagrid('getPager').data("pagination").options.pageSize;
                this.listPage_active(pageNumber, pageSize);
                this.listPage_history(pageNumber, pageSize);
                this.warnGrade();
                console.log("告警确认成功");
            })
        })

        // 告警反确认
        $('#warnDeny').click(() => {
            let [...id] = $('#active-warn-table').datagrid('getSelections');
            let arr = [];
            for (let i = 0, len = [...id].length; i < len; i++) {
                arr.push([...id][i].id + '')
            }
            let contextMenuId = _self.model.get('contextMenuId');
            const contextMenu = _self.model.get('data').find(item => item.id === contextMenuId)
            activeAlarmUpdate({
                id: arr,//告警id ,(支持评量)
                confirm: "1" // 0 - 确认 1 - 反确认
            }).then(() => {
                var pageNumber = $('#active-warn-table').datagrid('getPager').data("pagination").options.pageNumber;
                var pageSize = $('#active-warn-table').datagrid('getPager').data("pagination").options.pageSize;
                this.listPage_active(pageNumber, pageSize);
                this.listPage_history(pageNumber, pageSize);
                this.warnGrade();
                console.log("告警反确认成功")
            })
        })

        //  关闭告警
        $('#closeWarn').click((e) => {
            let contextMenuId = _self.model.get('contextMenuId');
            const contextMenu = _self.model.get('data').find(item => item.id === contextMenuId)

            let [...id] = $('#active-warn-table').datagrid('getSelections');
            let arr = [];
            for (let i = 0, len = [...id].length; i < len; i++) {
                arr.push([...id][i].id + '')
            }
            if ([...id].length > 0) {
                let btn = confirm('确定要关闭此告警吗？');
                if (btn === true) {
                    activeAlarmUpdate({
                        id: arr,
                        confirm: '4' //0 - 确认 1 - 反确认  2 - 清除 4 - 关闭,
                    }).then(() => {
                        var pageNumber = $('#active-warn-table').datagrid('getPager').data("pagination").options.pageNumber;
                        var pageSize = $('#active-warn-table').datagrid('getPager').data("pagination").options.pageSize;
                        this.listPage_active(pageNumber, pageSize);
                        this.listPage_history(pageNumber, pageSize);
                        this.warnGrade();
                        console.log('成功关闭此告警');
                    });
                } else if (btn === false) {
                    console.log('已取消关闭此告警');
                }
            } else {

                alert('请选择要处理的记录');
            }

        });

        //  告警清除
        $('#warnClean').click((e) => {
            let contextMenuId = _self.model.get('contextMenuId');
            const contextMenu = _self.model.get('data').find(item => item.id === contextMenuId)
            let [...id] = $('#active-warn-table').datagrid('getSelections');
            let arr = [];
            for (let i = 0, len = [...id].length; i < len; i++) {
                arr.push([...id][i].id + '')
            }
            $('#w').window('open');
            $('#ok_confirm').click(function () {
                let text_val = $('#warn_text').val();
                activeAlarmUpdate({
                    cause: text_val,
                    id: arr,
                    confirm: '2'
                }).then(reps => {
                    var pageNumber = $('#active-warn-table').datagrid('getPager').data("pagination").options.pageNumber;
                    var pageSize = $('#active-warn-table').datagrid('getPager').data("pagination").options.pageSize;
                    _self.listPage_active(pageNumber, pageSize);
                    _self.listPage_history(pageNumber, pageSize);
                    _self.warnGrade();
                    console.log('此告警已清楚')
                });
                $('#warn_text').text('');
                $('#w').window('close');
            })
            $('#cancle_confirm').click(function () {
                $('#w').window('close');
            })
        });

        //  添加处理记录
        $('#add_warnRecord').click(() => {
            $('#record_text').text(null);
            let contextMenuId = _self.model.get('contextMenuId');
            const contextMenu = _self.model.get('data').find(item => item.id === contextMenuId)

            let [...id] = $('#active-warn-table').datagrid('getSelections');
            let arr = [];
            for (let i = 0, len = [...id].length; i < len; i++) {
                arr.push([...id][i].id + '');
            }

            $('#record').window('open');
            $('#ok_confirm_record').click(() => {
                let text_val = $('#record_text').val();
                let radios = $('.radio_record');
                let status = this.get_raiod(radios);
                let index = radios.index(status);
                //  添加处理记录接口
                activeAlarmHandle({
                    status: index,//处理结果  0 - 已恢复 1 - 部分恢复 2 - 未恢复
                    log: text_val,
                    id: arr
                }).then(reps => {
                    var pageNumber = $('#active-warn-table').datagrid('getPager').data("pagination").options.pageNumber;
                    var pageSize = $('#active-warn-table').datagrid('getPager').data("pagination").options.pageSize;
                    this.listPage_active(pageNumber, pageSize);
                    this.listPage_history(pageNumber, pageSize);
                    this.warnGrade();
                    console.log('已添加处理记录')
                });
                $('#record').window('close');
            })
            $('#cancle_confirm_record').click(() => {
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
                    let x = arr_ori[i];
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
                let setTimer = $('#setInterval_time').val();
                this.setInterval_time(setTimer);
                $('#warnSet_dataGrid').window('close');
            });
            $('#cancle_warnSet').click(() => {
                $('#warnSet_dataGrid').window('close');
            });
        });

             // 历史告警设置
             $('#warnSet1').click(() => {
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
                        let x = arr_ori[i];
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
                    let setTimer = $('#setInterval_time').val();
                    this.setInterval_time(setTimer);
                    $('#warnSet_dataGrid').window('close');
                });
                $('#cancle_warnSet').click(() => {
                    $('#warnSet_dataGrid').window('close');
                });
            });

        // 查看处理记录
        $('#check_warnRecord').click(() => {
            let contextMenuId = _self.model.get('contextMenuId');
            const contextMenu = _self.model.get('data').find(item => item.id === contextMenuId)
            this.get_detail_record(contextMenu.id);
            $('#submitBtn_warnDetail').click(() => {
                $('#warn-detail').window('close');
            })
            $('#cancelBtn_warnDetail').click(() => {
                $('#warn-detail').window('close');
            })
        })

        // 告警详情
        $('#warnDetail').click(() => {
            let contextMenuId = _self.model.get('contextMenuId');

            const contextMenu = _self.model.get('data').find(item => item.id === contextMenuId);
            this.get_detail_record(contextMenu.id);

            $('#submitBtn_warnDetail').click(() => {
                $('#warn-detail').window('close');
            })
            $('#cancelBtn_warnDetail').click(() => {
                $('#warn-detail').window('close');
            })
        })
        // 历史告警详情
        $('#warnDetail1').click(() => {
            let contextMenuId = _self.model.get('contextMenuId');
            console.log('历史告警详情', contextMenuId);
            // const contextMenu = _self.model.get('data').find(item => item.id === contextMenuId);
            // console.log(contextMenu)
            this.get_detail_record(contextMenuId, '1');

            $('#submitBtn_warnDetail').click(() => {
                $('#warn-detail').window('close');
            })
            $('#cancelBtn_warnDetail').click(() => {
                $('#warn-detail').window('close');
            })
        })
        
        // 历史查看处理记录
        $('#check_warnRecord1').click(() => {
            let contextMenuId = _self.model.get('contextMenuId');
            console.log(contextMenuId)
            
            const contextMenu = _self.model.get('data').find(item => item.id === contextMenuId)
            this.get_detail_record(contextMenuId,'1');
            $('#submitBtn_warnDetail').click(() => {
                $('#warn-detail').window('close');
            })
            $('#cancelBtn_warnDetail').click(() => {
                $('#warn-detail').window('close');
            })
        })

        $("#warn-detail")
            .on('click','#prevBtn',evt=>{
                $(".alarm-detail-item").hide();
                $(`#alarm-detail-item-${--this.curAlarmDetailIndex}`).show();
                this.renderAlarmDetailPageNavBtn();
            })
            .on('click','#nextBtn',evt=>{
                $(".alarm-detail-item").hide();
                $(`#alarm-detail-item-${++this.curAlarmDetailIndex}`).show();
                this.renderAlarmDetailPageNavBtn();
            })

    },// render
    renderAlarmDetailPageNavBtn(){
        if($(".alarm-detail-item").length < 2){
            return $("#warn-detail #prevBtn,#warn-detail #nextBtn").prop('disabled',false);
        }

        if (this.curAlarmDetailIndex === 0) {
            $("#warn-detail")
                .find("#prevBtn").prop('disabled',true).end()
                .find("#nextBtn").prop('disabled',false).end()
        }else if(this.curAlarmDetailIndex === $(".alarm-detail-item").length - 1){
            $("#warn-detail")
                .find("#prevBtn").prop('disabled',false).end()
                .find("#nextBtn").prop('disabled',true).end()
        }else{
            $("#warn-detail #prevBtn,#warn-detail #nextBtn").prop('disabled',false);
        }
    },
    setInterval_time(x = 10) {
        let t = x * 60 * 1000;
        let timer = null;
        clearInterval(timer);
        timer = setInterval(() => {
            var pageNumber = $('#active-warn-table').datagrid('getPager').data("pagination").options.pageNumber;
            var pageSize = $('#active-warn-table').datagrid('getPager').data("pagination").options.pageSize;
            this.listPage_active(pageNumber, pageSize);
            this.listPage_history(pageNumber, pageSize);
            this.warnGrade();
        }, t)
    }

});
