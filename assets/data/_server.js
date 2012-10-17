

var ServerConfig = {
    "host": "localhost",
    "port": 50001,
    "physicalPath": "../../../../"
};


if (typeof module === 'object') {
    module.exports = ServerConfig;
}

/**
 * 指示当前系统在后台运行时的跟目录物理路径。
 * @remark 此路径相对于当前 demo.js 的路径。
 */
//physicalPath: "../../../"