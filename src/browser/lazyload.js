/** * @author xuld *///#include dom/base.js//#include fx/animate.jsvar Lazyload = Class({		placeholder: null,		duration: 300,		effect: 'opacity',		onLoad: null,		event: 'scroll',		offset: 0,		update: function(){		if(this.targets.length === 0)			return;					var left = [];		this.targets.forEach(function(value){			var container = Dom.get(this.container) || document,				containerPos = container.getPosition(),				containerRight = containerPos.add(container.getSize());			if(this.isInView(value, containerPos, containerRight)){				this.load(value);				} else {				left.push(value);				}		}, this);				this.targets = left;	},		isInView: function(img, containerPos, containerRight){		var pos = img.getPosition(),			size = img.getSize(),			right = pos.add(size);		return Math.max(pos.x, containerPos.x) <= Math.min(right.x, containerRight.x) &&			Math.max(pos.y, containerPos.y) <= Math.min(right.y, containerRight.y);	},		getSrc: function (img) {	  return img.getAttr('data-src');	},		load: function(img){				if(Dom.get(img).dataField().imageLoaded)			return;				var me = this, proxy = new Image();				proxy.onload = function(){						img.hide().setAttr('src', proxy.src).show(me.effect,me.duration, me.onLoad && function () {				me.onLoad(img);			});						img.dataField().imageLoaded = true;		};		proxy.src = me.getSrc(img);	},		init: function(img){		if(this.placeholder && !img.getAttr('src')){			img.setAttr('src', this.placeholder);		}				var container = Dom.get(this.container || window);						if(this.event === 'scroll'){			container.on('scroll', this.update, this);			new Dom(window).on('resize', this.update, this);		} else {			img.on(this.event, function(){				this.load(img);			}, this);		}	},		constructor: function(targets, options){		Object.extend(this, options);				this.targets = [];				targets.forEach(function(value){			value = Dom.get(value);			this.init(value);			this.targets.push(value);		}, this);		this.update();			}	});DomList.implement({		lazyload: function (options) {		new Lazyload(this, options);		return this;	}	});