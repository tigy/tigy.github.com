/**
 * @author 
 */






var Browser = Browser || {};


Browser.noContextMenu = function () {
	document.oncontextmenu = document.onselectstart = Function.returnFalse;
};
