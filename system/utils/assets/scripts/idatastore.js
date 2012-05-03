//===========================================
//  使类有存储数据功能   idatastore.js   A
//===========================================


/**
 * 使类具有存储的方法。
 * @interface System.IDataStore
 */
var IDataStore = {
	
	/**
	 * 获取属于一个元素的数据。
	 * @method data
	 * @param {String} type 类型。
	 * @return {Object} 值。
	 */
	data: function(type){
		return System.data(this, type);
	},
	
	/**
	 * 如果存在，获取属于一个元素的数据。
	 * @method getData
	 * @param {String} type 类型。
	 * @return {Object} 值。
	 */
	getData: function(type){
		return System.getData(this, type);
	},
	
	/**
	 * 设置属于一个元素的数据。
	 * @method setData
	 * @param {Object} obj 元素。
	 * @param {Number/String} type 类型。
	 * @param {mixed} data 内容。
	 */
	setData: function(type, data){
		return System.setData(this, type, data);
	},
	
	/**
	 * 删除属于一个元素的数据。
	 * @param {String} [type] 类型。
	 */
	removeData: function(type) {
		System.removeData(this, type);
		return this;
	}
};
