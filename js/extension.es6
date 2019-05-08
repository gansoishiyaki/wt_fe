enchant.Group.prototype.removeAll = function() {
  while (this.firstChild) this.removeChild(this.firstChild);
};