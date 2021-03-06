/* eslint-disable */
export default {
  parentNode: null,
  node: null,
  // 获取一个节点Id
  generateUUID: function () {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = (d + Math.random()*16)%16 | 0;
      d = Math.floor(d / 16);
      return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
  },

  //根据节点id,获取节点
  getNode: function (tree, nodePath) {
    var searchNode;
    this.node = null;
    this.parentNode= null;
    if (tree.path == nodePath) {
      return {
        parentNode: null,
        node: tree
      }
    }

    searchNode = this.searchNode(tree.children, nodePath, tree);
    return searchNode;
  },

  //递归寻找父节点
  searchNode: function (tree, nodePath, parentNode) {
    for (var i = 0; i < tree.length; i++) {
      //递归终止的条件
      if (this.node) {
        break;
      }
      var obj = tree[i];
      if (!obj || !obj.path) {
        continue;
      }
      if (obj.path == nodePath) {
        //找到对应节点，this.node赋值
        this.node = obj;
        this.parentNode = parentNode;
        break;
      } else {
        //未找到对应节点，且该节点有子节点，继续递归
        if (obj.children && obj.children.length > 0) {
          this.searchNode(obj.children, nodePath, obj);
        } else {
          continue;
        }
      }
    }
    return {
      parentNode: this.parentNode,
      node: this.node
    }

  },
  // 对文件树节点进行简单排序，美化显示
  treeSort: function (tree) {
    if (tree.children == null || !tree.children.length) {
      return;
    }
    tree.children.sort(this.ascSort);
    for (var i = 0; i < tree.children.length; i++) {
      this.treeSort(tree.children[i]);
    }
  },
  // 对文件树子节点进行排序
  childrenSort: function (child) {
    child.sort(this.ascSort);
  },
  ascSort: function (a, b) {
    if (a.type === 'dir' && b.type !== 'dir') {
      return -1;
    } else if (a.type !== 'dir' && b.type === 'dir') {
      return 1;
    } else {
      return a.name[0] <= b.name[0] ? (a.name[0] === b.name[0] ? 0 : -1) : 1;
    }
  },
  // 规范文件树的children和isSelected
  formatChildren: function (tree) {
    if (!tree.children) {
      tree.children = [];
      tree.isSelected = false;
      tree.editable = false;
      return;
    }
    this.format_recursion(tree.children);
  },
  format_recursion: function (children) {
    if (!children) {
      return;
    }
    for (let i = 0; i < children.length; i++) {
      children[i].isSelected = false;
      children[i].editable = false;
      this.format_recursion(children[i].children);
    }
  },

  clearTable: function (tree) {
    for (var i = 0; i < tree.length; i++) {
      var obj = tree[i];
      if (!obj || !obj.path) {
        continue;
      }
      if (obj.edit_status == -1) {
        tree.splice(i,1);
        i--;
        continue;
      } else {
        if (obj.children && obj.children.length > 0) {
          this.clearTable(obj.children);
        } else {
          continue;
        }
      }
    }
  },
  formatNum:function (str) {
    var newStr = "";
    var count = 0;
    if (!isNaN(str)) {
      str = str.toString();
    }
    if(str.indexOf(".") == -1){
      for(var i = str.length - 1; i >= 0; i--){
        if(count % 3 == 0 && count != 0){
          newStr = str.charAt(i) + "," + newStr;
        }else{
          newStr = str.charAt(i) + newStr;
        }
        count++;
      }
      return newStr;
    }
    else {
      for(var i = str.indexOf(".") - 1; i >= 0; i--){
        if(count % 3 == 0 && count != 0){
          newStr = str.charAt(i) + "," + newStr;
        }else{
          newStr = str.charAt(i) + newStr; //逐个字符相接起来
        }
        count++;
      }
      str = newStr + (str + "00").substr((str + "00").indexOf("."), 3);
      return str;
    }
  }
}
