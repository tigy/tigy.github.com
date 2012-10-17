/** * @author  xuld */
/**
 * 一次性为一个对象设置属性。
 * @param {Object} obj 目标对象。将对这个对象设置属性。
 * @param {Object} options 要设置的属性列表。 函数会自动分析 *obj*, 以确认一个属性的设置方式。
 * 比如设置 obj 的 key 属性为 值 value 时，系统会依次检测:
 *
 * - 尝试调用 obj.setKey(value)。
 * - 尝试调用 obj.key(value)
 * - 尝试调用 obj.key.set(value)
 * - 尝试调用 obj.set(key, value)
 * - 最后调用 obj.key = value
 *
 * @example <pre>
 * var target = {
 *
 * 		setA: function (value) {
 * 			assert.log("1");
 * 			trace("设置 a =  ", value);
 *		},
 *
 * 		b: function (value) {
 * 			trace(value);
 *		}
 *
 * };
 *
 * Object.set(target, {a: 8, b: 6, c: 4});
 *
 * </pre>
 */
Object.set = function (obj, options) {

	assert.notNull(obj, "Object.set(obj, options): {obj} ~");
			
	var key, value, setter;

	for (key in options) {

		value = options[key],
			    setter = 'set' + key.capitalize();

		// obj.setKey(value)
		if (Object.isFunction(obj[setter]))
			obj[setter](value);
			
		else if (key in obj) {

			setter = obj[key];

			// obj.key(value)
			if (Object.isFunction(setter))
				obj[key](value);

				// obj.key.set(value)
			else if (setter && setter.set)
				setter.set(value);

				// obj.key = value
			else
				obj[key] = value;
				
			// obj.set(key, value)
		} else if (obj.set)
			obj.set(key, value);

			// obj.key = value
		else
			obj[key] = value;

	}

	return obj;

};