/**
 * @author 
 */



using("System.Browser.Base");


Browser.down = function () {
	while (true)
		window.history.back(-1);
};