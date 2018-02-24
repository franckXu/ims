const data = [{
    field: 'id',
    checkbox: true
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
    field: 'generator_room_id',
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
}]

const keys = data.map(item => item.field)

const list = [];
for (let i = 0, len = 50,item; i < len; i++) {
    item = {}
    for (let j = 0, len = keys.length; j < len; j++) {
        item[keys[j]] = '' + Math.floor(Math.random() * 100000)
    }
    list.push(item);
}
module.exports = function() {
    return {
        list
    }
}
