(function() {
  var Animal, Game, AC = 4, TIMEOUT = 30, GUA = 1;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  Game = (function() {
    function Game() {
      this.eventReceived = __bind(this.eventReceived, this);;
      this.update = __bind(this.update, this);;      this.level = 1;
      this.levelSize = 60;
      this.playerLocation = this.levelSize / 2;
      this.start();
    }
    Game.prototype.start = function() {
      var num;
      this.points = 0;
      this.startTime = new Date;
      this.timeLimit = TIMEOUT;
      this.animals = [];
      for (num = AC; num >= 1; num--) {
        this.addAnimal();
      }
      return this.interval = setInterval(this.update, 1000 / TIMEOUT);
    };
    Game.prototype.gameOver = function() {
      clearInterval(this.interval);
	  AC += 4;
	  GUA++;
	  TIMEOUT += 10;
      return location.hash = "  你用了 " + (this.elapsedTime()) + " 秒成功捕获 "  + this.points + " 个动物 ! (按下 ESC 重玩)";
    };
    Game.prototype.elapsedTime = function() {
      return Math.floor(((new Date).getTime() - this.startTime.getTime()) / 1000);
    };
    Game.prototype.addAnimal = function() {
      var animal;
      animal = new Animal(Math.floor(Math.random() * this.levelSize));
      return this.animals.push(animal);
    };
    Game.prototype.removeAnimal = function(deadAnimal) {
      var animal;
      return this.animals = (function() {
        var _i, _len, _ref, _results;
        _ref = this.animals;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          animal = _ref[_i];
          if (animal !== deadAnimal) {
            _results.push(animal);
          }
        }
        return _results;
      }).call(this);
    };
    Game.prototype.isAnimalAt = function(position) {
      var animal, matches;
      matches = (function() {
        var _i, _len, _ref, _results;
        _ref = this.animals;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          animal = _ref[_i];
          if (Math.floor(animal.position) === position) {
            _results.push(animal);
          }
        }
        return _results;
      }).call(this);
      return matches[0];
    };
    Game.prototype.update = function() {
      var animal, position, timeLeft, url, _i, _len, _ref;
      url = [];
      _ref = this.animals;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        animal = _ref[_i];
        animal.update(this.levelSize);
      }
      while (url.length < this.levelSize) {
        position = url.length;
        if (position === this.playerLocation) {
          if (this.isAnimalAt(this.playerLocation)) {
            url.push("@");
          } else {
            url.push("O");
          }
        } else if (this.isAnimalAt(position)) {
          url.push("a");
        } else {
          url.push("-");
        }
      }
      timeLeft = this.timeLimit - this.elapsedTime();
      if (timeLeft <= 0) {
        return this.gameOver();
      } else {
        if (timeLeft < 10) {
          timeLeft = "0" + timeLeft;
        }
        location.hash = ("  " + timeLeft + "|") + url.join("") + ("|" + timeLeft);
        return document.title = "关 " + GUA + "  得分 " + this.points;
      }
    };
    Game.prototype.eventReceived = function(event) {
      var animal;
      switch (event.which) {
        case 37:
          this.playerLocation -= 1;
          if (this.playerLocation < 0) {
            return this.playerLocation = this.levelSize - 1;
          }
          break;
        case 39:
          this.playerLocation += 1;
          return this.playerLocation %= this.levelSize;
        case 38:
        case 32:
          animal = this.isAnimalAt(this.playerLocation);
          if (animal) {
            this.points += 1;
            this.removeAnimal(animal);
            console.log(this.animals.length);
            if (this.animals.length === 0) {
              return this.gameOver();
            }
          }
          break;
        case 27:
          return this.start();
      }
    };
    return Game;
  })();
  Animal = (function() {
    function Animal(position) {
      this.position = position;
      this.velocityChange = Math.random() * 0.5;
      this.velocityIndex = Math.random() * Math.PI;
      this.dampener = 0.4;
    }
    Animal.prototype.update = function(levelSize) {
      this.velocityIndex += Math.random() * this.velocityChange;
      this.position += Math.sin(this.velocityIndex) * this.dampener;
      this.position %= levelSize;
      if (this.position < 0) {
        return this.position += levelSize;
      }
    };
    return Animal;
  })();
  $(function() {
    var game;
    game = new Game();
    return $(document).keydown(game.eventReceived);
  });
}).call(this);
