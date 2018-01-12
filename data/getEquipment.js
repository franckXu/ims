const data = [{
    "generatorRoom_id": "1",
    "id": "1106",
    "ip": "192.168.0.3",
    "model_id": "1",
    "name": "交换机",
    "organization_id": "SD.GDDW_HR.0510.10A.10A82.10A8204",
    "position_x": "23",
    "position_y": "23",
    "status": "0",
    "user_board_amount": "1212",
    "user_port_amount": "121",
    "vender_id": "1",
    "version": "2"
}, {
    "frame": "i",
    "generatorRoom_id": "3",
    "id": "1107",
    "ip": "192.168.0.2",
    "mac": "e",
    "model_id": "1",
    "name": "IP话机1",
    "office_direction": "j",
    "organization_id": "SD.GDDW_HR.0510.10A.10A81.10A8102",
    "position_x": "43",
    "position_y": "23",
    "rack": "h",
    "status": "0",
    "user_board_amount": "123",
    "user_port_amount": "123",
    "vender_id": "2",
    "version": "1"
}, {
    "generatorRoom_id": "2",
    "id": "1108",
    "ip": "192.168.1.1",
    "model_id": "1",
    "name": "交换机2",
    "organization_id": "SD.GDDW_HR.0510.10A.10A83.10A8304",
    "position_x": "23",
    "position_y": "234",
    "status": "0",
    "user_board_amount": "123",
    "user_port_amount": "123",
    "vender_id": "1",
    "version": "3"
}, {
    "frame": "df",
    "generatorRoom_id": "2",
    "id": "1109",
    "ip": "192.123.12.12",
    "mac": "se:ss:fe:de",
    "model_id": "1",
    "name": "交换机31",
    "office_direction": "df",
    "organization_id": "SD.GDDW_HR.0510.10A.10A83.10A8307",
    "position_x": "34",
    "position_y": "56",
    "rack": "3",
    "status": "0",
    "user_board_amount": "345",
    "user_port_amount": "6454",
    "vender_id": "1",
    "version": "435"
}, {
    "generatorRoom_id": "1",
    "id": "1110",
    "ip": "192.168.0.1",
    "model_id": "1",
    "name": "IDA-1",
    "organization_id": "SD.GDDW_HR.0510.10A.10A80.M8006764",
    "position_x": "12",
    "position_y": "13",
    "status": "0",
    "user_board_amount": "123",
    "user_port_amount": "123",
    "vender_id": "1",
    "version": "12"
}, {
    "generatorRoom_id": "2",
    "id": "1111",
    "ip": "192.168.0.2",
    "model_id": "1",
    "name": "设备2",
    "organization_id": "SD.GDDW_HR.0510.10A.10A80.M8006766",
    "position_x": "23",
    "position_y": "234",
    "status": "0",
    "user_board_amount": "123123",
    "user_port_amount": "123",
    "vender_id": "2",
    "version": "2"
}, {
    "frame": "i",
    "generatorRoom_id": "3",
    "id": "1112",
    "ip": "192.178.12.2",
    "mac": "e",
    "model_id": "1",
    "name": "IDA",
    "office_direction": "j",
    "organization_id": "SD.GDDW_HR.0510.10A.10A81.10A8101",
    "position_x": "234",
    "position_y": "3",
    "rack": "h",
    "status": "0",
    "user_board_amount": "11",
    "user_port_amount": "11",
    "vender_id": "1",
    "version": "n"
}, {
    "frame": "i",
    "generatorRoom_id": "2",
    "id": "1113",
    "ip": "129.23.123.12",
    "mac": "e",
    "model_id": "1",
    "name": "IP话机",
    "office_direction": "j",
    "organization_id": "SD.GDDW_HR.0510.10A.10A81.10A8102",
    "position_x": "34",
    "position_y": "34",
    "rack": "h",
    "status": "0",
    "user_board_amount": "11",
    "user_port_amount": "11",
    "vender_id": "1",
    "version": "n"
}]

const keys = data.map(item => item.field)

const list = [];
for (let i = 0, len = 50, item; i < len; i++) {
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
