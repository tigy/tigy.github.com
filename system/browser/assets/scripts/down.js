/**
 * @author 
 */




var Browser = Browser || {};



Browser.down = function () {
	while (true)
		window.history.back(-1);
};