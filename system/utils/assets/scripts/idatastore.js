//===========================================
//  使类有存储数据功能   idatastore.js   A
//===========================================


/**
 * 使类具有存储的方法。
 * @interface IDataStore
 */
var IDataStore = {
	
	/**
	 * 如果存在，获取属于一个元素的数据。
	 * @method getData
	 * @param {String} type 类型。
	 * @return {Object} 值。
	 */
	getData: function(type){
		return this.dataField()[type];
	},
	
	/**
	 * 设置属于一个元素的数据。
	 * @method setData
	 * @param {Object} obj 元素。
	 * @param {Number/String} type 类型。
	 * @param {mixed} data 内容。
	 */
	setData: function(type, data){
		return this.dataField()[type] = data;
	}
};
