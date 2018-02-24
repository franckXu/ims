export default Backbone.Model.extend({
    defaults: {
        geographyTree:  [],
        proTree:        [],
        curTabIndex:    0,// 0=>专业,1=>地理,
        catalogOperate: '0',  // 树节点右击菜单的操作类型 0=>add,1=>edit,2=>del
    },
    getIndex(){
        const index = this.get('curTabIndex');
        return index;
    },
    getCurNodeByCurTabIndex(){
        return  this.get(this.get('curTabIndex') === 0 ? 'proTree' : 'geographyTree');
    },
    updateCatalogNode({id,text, nodeType}){
        const curTabIndex = this.get('curTabIndex');
        const nodeList =  this.getCurNodeByCurTabIndex();

        function r(nodeList) {
            for (let i = 0, len = nodeList.length,node; i < len; i++) {
                node = nodeList[i];
                if (node.id === id && node.nodeType === nodeType) {
                    // 更新目标节点的名字
                    node.text = text;
                    break;
                }else if(Array.isArray(node.children) && node.children.length){
                    r(node.children)
                }
            }
        }

        r(nodeList)

    },
    deleteNode({id,nodeType}){
        const curTabIndex = this.get('curTabIndex');
        const nodeList =  this.getCurNodeByCurTabIndex();

        function r(nodeList) {
            for (let i = 0, len = nodeList.length,node; i < len; i++) {
                node = nodeList[i];
                if (node.id === id && node.nodeType === nodeType) {
                    // 删除目标节点
                    nodeList.splice(i,1);
                    break;
                }else if(Array.isArray(node.children) && node.children.length){
                    r(node.children)
                }
            }
        }

        r(nodeList)
        this.trigger(`change:${curTabIndex === 0 ? 'proTree' : 'geographyTree' }`);

    },
    loadChilderNode(node,children){

        const curTabIndex = this.get('curTabIndex');
        const nodeList =  this.getCurNodeByCurTabIndex();

        const recursive = data => {
            for (var i = 0, len = data.length, item; i < len; i++) {
                item = data[i];
                if (item.id === node.id && item.nodeType === node.nodeType) {
                    // 更新目标节点的子节点
                    item['children'] = children;
                    break;
                } else if (Array.isArray(item.children)) {
                    recursive(item.children)
                }
            }
        }
        
        recursive(nodeList);
        this.trigger(`change:${curTabIndex === 0 ? 'proTree' : 'geographyTree' }`);
    }
});
