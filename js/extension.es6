// 子ノードを削除
enchant.Group.prototype.removeAll = function() {
  while (this.firstChild) this.removeChild(this.firstChild);
};

// 最前面に移動
enchant.Group.prototype.frontMost = function() {
  let parent = this.parentNode;
  parent.removeChild(this);
  parent.addChild(this);
};