/** * @author  xuld */
/**
 * һ����Ϊһ�������������ԡ�
 * @param {Object} obj Ŀ����󡣽�����������������ԡ�
 * @param {Object} options Ҫ���õ������б� �������Զ����� *obj*, ��ȷ��һ�����Ե����÷�ʽ��
 * �������� obj �� key ����Ϊ ֵ value ʱ��ϵͳ�����μ��:
 *
 * - ���Ե��� obj.setKey(value)��
 * - ���Ե��� obj.key(value)
 * - ���Ե��� obj.key.set(value)
 * - ���Ե��� obj.set(key, value)
 * - ������ obj.key = value
 *
 * @example <pre>
 * var target = {
 *
 * 		setA: function (value) {
 * 			assert.log("1");
 * 			trace("���� a =  ", value);
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