var DplManager = require('./dplmanager');

//  DplManager.deleteDpl('System', 'Core', 'AaaB');
DplManager.createDpl('System', 'Core', 'AaaB', '啊啊');
//DplManager.updateDpl('System', 'Core', 'AaaB', '啊2213啊2', {
//    status: 'develop'
//});


//var list = DplManager.getDplList('src');
//console.log(list);


var DplFileManager = require('./dplfilemanager');


DplFileManager.buildDplFile('D:\\Projects\\JPlus\\dplmanager\\assets\\data\\untitled.dpl');