require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"backgroundLoader":[function(require,module,exports){
"use strict";
cc._RF.push(module, 'b877bKpUKpGHqroh11vogc0', 'backgroundLoader');
// Script/backgroundLoader.js

"use strict";

cc.Class({
    extends: cc.Component,

    properties: {},

    // use this for initialization
    onLoad: function onLoad() {
        var randomNum = "bg" + ((Math.random() * 100 | 0) % 3 + 1);
        var bgSprite = this.node.getComponent(cc.Sprite);
        cc.loader.loadRes("hero/" + randomNum, cc.SpriteFrame, function (err, SpriteFrame) {
            bgSprite.spriteFrame = SpriteFrame;
        });
        cc.log(randomNum);
    }
});

cc._RF.pop();
},{}],"btn":[function(require,module,exports){
"use strict";
cc._RF.push(module, 'f9706UdRQlCQqmR7kS5hHeX', 'btn');
// Script/btn.js

"use strict";

var fsm = require("landMaker");
cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //    default: null,      // The default value will be used only when the component attaching
        //                           to a node for the first time
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
    },

    // use this for initialization
    onLoad: function onLoad() {},

    buttonClicked: function buttonClicked() {
        fsm.restart();
    },
    gameStart: function gameStart() {
        cc.director.loadScene("GameScene");
    }
});

cc._RF.pop();
},{"landMaker":"landMaker"}],"landMaker":[function(require,module,exports){
"use strict";
cc._RF.push(module, '06ab0S0xsZDcpVTrYS0ee/A', 'landMaker');
// Script/landMaker.js

"use strict";

var spriteCreator = require("spriteCreator");
var perfectLabel = require("perfectLabel");
var storageManager = require("storageManager");
var fsm = new StateMachine({
    data: {
        gameDirector: null
    },
    //stand : 站立
    init: 'stand',
    transitions: [
    //stickLengthen ： 棍子延长后
    { name: 'stickLengthen', from: 'stand', to: 'stickLengthened' },
    //heroTick ： 英雄踢瞬间
    { name: 'heroTick', from: 'stickLengthened', to: 'heroTicked' },
    //heroTick ： 棍子下落
    { name: 'stickFall', from: 'heroTicked', to: 'stickFalled' },
    // heroMoveToLand :英雄移动到土地上
    { name: 'heroMoveToLand', from: 'stickFalled', to: 'heroMovedToLand' },
    // landMove: 土地移动
    { name: 'landMove', from: 'heroMovedToLand', to: 'stand' },
    // heroMoveToStickEnd :英雄移动到棍子末端
    { name: 'heroMoveToStickEnd', from: 'stickFalled', to: 'heroMovedToStickEnd' },
    // heroDown : 英雄掉下
    { name: 'heroDown', from: 'heroMovedToStickEnd', to: 'heroDowned' },
    // gameOver : 游戏结束
    { name: 'gameOver', from: 'heroDowned', to: 'end' },
    // restart : 重新开始
    { name: 'restart', from: 'end', to: 'stand' }],
    methods: {
        //
        onLeaveHeroTicked: function onLeaveHeroTicked() {
            gameDirector.unregisterEvent();
        },
        onStickLengthen: function onStickLengthen() {
            gameDirector.gezi.node.active = false;
            gameDirector.stickLengthen = true;
            gameDirector.stick = gameDirector.createStick();
            gameDirector.stick.x = gameDirector.hero.x + gameDirector.hero.width * (1 - gameDirector.hero.anchorX) + gameDirector.stick.width * gameDirector.stick.anchorX;
            var ani = gameDirector.hero.getComponent(cc.Animation);
            ani.play('heroPush');
        },
        onHeroTick: function onHeroTick() {
            gameDirector.stickLengthen = false;
            var ani = gameDirector.hero.getComponent(cc.Animation);
            ani.play('heroTick');
        },
        onStickFall: function onStickFall() {
            //stick fall action.
            var stickFall = cc.rotateBy(0.5, 90);
            stickFall.easing(cc.easeIn(3));
            var callFunc = cc.callFunc(function () {
                var stickLength = gameDirector.stick.height - gameDirector.stick.width * gameDirector.stick.anchorX;
                if (stickLength < gameDirector.currentLandRange || stickLength > gameDirector.currentLandRange + gameDirector.secondLand.width) {
                    //failed.
                    fsm.heroMoveToStickEnd();
                } else {
                    //successed
                    fsm.heroMoveToLand();
                    if (stickLength > gameDirector.currentLandRange + gameDirector.secondLand.width / 2 - 5 && stickLength < gameDirector.currentLandRange + gameDirector.secondLand.width / 2 + 5) {
                        gameDirector.perfect++;
                        gameDirector.getScore(gameDirector.perfect);
                        // var pl = gameDirector.perfectLabel.getComponent(perfectLabel);
                        // pl.showPerfect(gameDirector.perfect);
                    } else {
                        gameDirector.perfect = 0;
                    }
                }
            });
            var se = cc.sequence(stickFall, callFunc);
            gameDirector.stick.runAction(se);
        },
        onHeroMoveToLand: function onHeroMoveToLand() {
            var ani = gameDirector.hero.getComponent(cc.Animation);
            var callFunc = cc.callFunc(function () {
                ani.stop('heroRun');
                gameDirector.getScore();
                fsm.landMove();
            });
            ani.play('heroRun');
            gameDirector.heroMove(gameDirector.hero, { length: gameDirector.currentLandRange + gameDirector.secondLand.width, callFunc: callFunc });
        },
        onLandMove: function onLandMove() {
            var callFunc = cc.callFunc(function () {
                gameDirector.registerEvent();
                gameDirector.gezi.node.active = true;
                gameDirector.gezi.string = "东哥放了你1次鸽子" + '\n' + "并且约你去前面见面";
            });
            gameDirector.landCreateAndMove(callFunc);
        },
        onHeroMoveToStickEnd: function onHeroMoveToStickEnd() {
            var ani = gameDirector.hero.getComponent(cc.Animation);
            var callFunc = cc.callFunc(function () {
                ani.stop('heroRun');
                fsm.heroDown();
                gameDirector.gezi.node.active = false;
                // gameDirector.gezi.string = "东鸽约你去前面见面" + '\n' +       "快去吧骚年！";
            });
            ani.play('heroRun');
            gameDirector.heroMove(gameDirector.hero, { length: gameDirector.stick.height, callFunc: callFunc });
        },
        onHeroDown: function onHeroDown() {
            var callFunc = cc.callFunc(function () {
                fsm.gameOver();
            });
            gameDirector.stickAndHeroDownAction(callFunc);
        },
        onGameOver: function onGameOver() {
            gameDirector.overLabel.node.active = true;
            gameDirector.overLabel2.node.active = true;
            var ci = gameDirector.score + 1;
            gameDirector.overLabel2.string = "你没有见到东鸽 " + "\n" + "并且被东鸽" + "\n" + "放鸽子" + ci + "次";
        },
        onRestart: function onRestart() {
            cc.director.loadScene("GameScene");
        }
    }
});
var gameDirector = null;
cc.Class({
    extends: cc.Component,
    properties: {
        landRange: cc.v2(20, 300),
        landWidth: cc.v2(20, 200),
        hero: cc.Node,
        firstLand: cc.Node,
        secondLand: cc.Node,
        moveDuration: 0.5,
        stickSpeed: 400,
        heroMoveSpeed: 400,
        // stick:cc.Node,
        // stickLengthen:false,
        stickWidth: 6,
        canvas: cc.Node,
        scoreLabel: cc.Label,
        hightestScoreLabel: cc.Label,
        overLabel: cc.Label,
        overLabel2: cc.Label,
        gezi: cc.Label,
        perfectLabel: cc.Node
    },
    onLoad: function onLoad() {
        //init data
        // alert(storageManager.getHighestScore());
        gameDirector = this;
        this.runLength = 0, this.stick = null;
        this.stickLengthen = false;
        this.score = 0;
        this.perfect = 0;
        this.currentLandRange = 0;
        this.heroWorldPosX = 0;
        this.changeHightestScoreLabel();
        this.gezi.node.active = true;
        this.gezi.string = "东鸽约你去前面见面" + '\n' + "快去吧骚年！";
        //create new land;
        this.createNewLand();
        var range = this.getLandRange();
        this.heroWorldPosX = this.firstLand.width - (1 - this.hero.anchorX) * this.hero.width - this.stickWidth;
        this.secondLand.setPosition(range + this.firstLand.width, 0);

        this.registerEvent();
        //init hero animation callback.
        var ani = gameDirector.hero.getComponent(cc.Animation);
        ani.on('stop', function (event) {
            if (event.target.name == 'heroTick') {
                fsm.stickFall();
            }
        });
    },
    registerEvent: function registerEvent() {
        this.canvas.on(cc.Node.EventType.TOUCH_START, this.touchStart.bind(this), this.node);
        this.canvas.on(cc.Node.EventType.TOUCH_END, this.touchEnd.bind(this), this.node);
        this.canvas.on(cc.Node.EventType.TOUCH_CANCEL, this.touchCancel.bind(this), this.node);
        console.log("on");
    },

    //注销事件
    unregisterEvent: function unregisterEvent() {
        this.canvas.targetOff(this.node);
        console.log("off");
    },
    update: function update(dt) {
        // console.log(dt);
        if (this.stickLengthen) {
            this.stick.height += dt * this.stickSpeed;
            // this.stick.height = this.currentLandRange + this.secondLand.width/2;
        }
    },
    touchStart: function touchStart(event) {
        fsm.stickLengthen();
        cc.log("touchStart");
    },
    touchEnd: function touchEnd(event) {
        fsm.heroTick();
        cc.log("touchEnd");
    },
    touchCancel: function touchCancel() {
        this.touchEnd();
        cc.log("touchCancel");
    },
    stickAndHeroDownAction: function stickAndHeroDownAction(callFunc) {
        //stick down action;
        var stickAction = cc.rotateBy(0.5, 90);
        stickAction.easing(cc.easeIn(3));
        this.stick.runAction(stickAction);
        //hero down action;
        var heroAction = cc.moveBy(0.5, cc.p(0, -300 - this.hero.height));
        heroAction.easing(cc.easeIn(3));
        var seq = cc.sequence(heroAction, callFunc);
        this.hero.runAction(seq);
    },
    heroMove: function heroMove(target, data) {
        var time = data.length / this.heroMoveSpeed;
        var heroMove = cc.moveBy(time, cc.p(data.length, 0));
        if (data.callFunc) {
            var se = cc.sequence(heroMove, data.callFunc);
            this.hero.runAction(se);
        } else {
            this.hero.runAction(heroMove);
        }
    },
    landCreateAndMove: function landCreateAndMove(callFunc) {
        var winSize = cc.director.getWinSize();
        //firstland;
        var length = this.currentLandRange + this.secondLand.width;
        this.runLength += length;
        var action = cc.moveBy(this.moveDuration, cc.p(-length, 0));
        this.node.runAction(action);
        this.firstLand = this.secondLand;

        this.createNewLand();

        //landRange
        var range = this.getLandRange();

        //secondland;
        this.secondLand.setPosition(this.runLength + winSize.width, 0);
        var l = winSize.width - range - this.heroWorldPosX - this.hero.width * this.hero.anchorX - this.stickWidth;
        var secondAction = cc.moveBy(this.moveDuration, cc.p(-l, 0));
        var seq = cc.sequence(secondAction, callFunc);
        this.secondLand.runAction(seq);
    },
    createStick: function createStick() {
        cc.log("sc");
        var stick = spriteCreator.createStick(this.stickWidth);
        stick.parent = this.node;
        return stick;
    },
    createNewLand: function createNewLand() {
        this.secondLand = spriteCreator.createNewLand(this.getLandWidth());
        this.secondLand.parent = this.node;
    },
    getScore: function getScore(num) {
        if (num) {
            this.score += num;
        } else {
            this.score++;
        }
        if (storageManager.getHighestScore() < this.score) {
            storageManager.setHighestScore(this.score);
            this.changeHightestScoreLabel();
        }
        this.scoreLabel.string = "得分:" + this.score;
    },
    changeHightestScoreLabel: function changeHightestScoreLabel() {
        this.hightestScoreLabel.string = "最高分:" + storageManager.getHighestScore();
    },
    getLandRange: function getLandRange() {
        this.currentLandRange = this.landRange.x + (this.landRange.y - this.landRange.x) * Math.random();
        var winSize = cc.director.getWinSize();
        if (winSize.width < this.currentLandRange + this.heroWorldPosX + this.hero.width + this.secondLand.width) {
            this.currentLandRange = winSize.width - this.heroWorldPosX - this.hero.width - this.secondLand.width;
        }
        return this.currentLandRange;
    },
    getLandWidth: function getLandWidth() {
        return this.landWidth.x + (this.landWidth.y - this.landWidth.x) * Math.random();
    }
});
module.exports = fsm;

cc._RF.pop();
},{"perfectLabel":"perfectLabel","spriteCreator":"spriteCreator","storageManager":"storageManager"}],"perfectLabel":[function(require,module,exports){
"use strict";
cc._RF.push(module, '39827GFyPRNJbWrKz6ShGhU', 'perfectLabel');
// Script/perfectLabel.js

"use strict";

cc.Class({
    extends: cc.Component,

    properties: {},

    // use this for initialization
    onLoad: function onLoad() {
        this.anim = this.node.getComponent(cc.Animation);
        this.label = this.node.getComponent(cc.Label);
    },
    showPerfect: function showPerfect(count) {
        this.label.string = "Perfect x" + count;
        var fadeInAction = cc.fadeIn(0.1);
        var moveAction = cc.moveBy(1, cc.p(0, 0));
        var fadeOutAction = cc.fadeOut(0);
        var seq = cc.sequence(fadeInAction, moveAction, fadeOutAction);
        this.node.runAction(seq);
        //has bug.  web will 花屏...
        // this.anim.play("perfect_anim");
    },
    removeLabel: function removeLabel() {
        // this.node.x = -100;
        // this.node.y = -100;
        cc.log("removeLabel");
    },
    showLabel: function showLabel() {
        // this.node.x = cc.director.getWinSize().width/2;
        // this.node.y = cc.director.getWinSize().height/2;
        cc.log("showLabel");
    }
});

cc._RF.pop();
},{}],"spriteCreator":[function(require,module,exports){
"use strict";
cc._RF.push(module, 'fac0cFOzGJKMaEGKF/+6AMU', 'spriteCreator');
// Script/spriteCreator.js

"use strict";

var spriteCreator = function () {
    var spriteFrameCache = null;
    return {
        createNewLand: function createNewLand(width) {
            //create new land.
            var newLand = new cc.Node("Land");
            newLand.anchorX = 0;
            newLand.anchorY = 0;
            var sprite = newLand.addComponent(cc.Sprite);
            sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
            newLand.color = cc.Color.BLACK;
            newLand.height = 300;
            newLand.width = width;

            //create red land.
            var redLand = new cc.Node("Red Land");
            redLand.anchorY = 1;
            var redSprite = redLand.addComponent(cc.Sprite);
            redSprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
            redLand.color = cc.Color.RED;
            redLand.parent = newLand;
            redLand.height = 10;
            redLand.width = 10;
            redLand.setPosition(newLand.width / 2, newLand.height);
            if (spriteFrameCache) {
                sprite.spriteFrame = spriteFrameCache;
                redSprite.spriteFrame = spriteFrameCache;
            } else {
                cc.loader.loadRes("hero/blank", cc.SpriteFrame, function (err, SpriteFrame) {
                    sprite.spriteFrame = SpriteFrame;
                    redSprite.spriteFrame = SpriteFrame;
                    spriteFrameCache = SpriteFrame;
                });
            }
            newLand.center = redLand;
            return newLand;
        },
        createStick: function createStick(width) {
            var stick = new cc.Node("stick");
            stick.anchorY = 0;
            stick.y = 300;
            var sprite = stick.addComponent(cc.Sprite);
            sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
            sprite.spriteFrame = spriteFrameCache;
            stick.color = cc.Color.BLACK;
            stick.width = width;
            stick.height = 0;
            return stick;
        } };
}();
module.exports = spriteCreator;

cc._RF.pop();
},{}],"storageManager":[function(require,module,exports){
"use strict";
cc._RF.push(module, '333dfNuUoxPM6skEF3RI/C3', 'storageManager');
// Script/storageManager.js

"use strict";

var storageManager = function () {
    var spriteFrameCache = null;
    if (!cc.sys.localStorage.highestScore) {
        cc.sys.localStorage.highestScore = 0;
    }
    return {
        getHighestScore: function getHighestScore() {
            return cc.sys.localStorage.highestScore;
        },
        setHighestScore: function setHighestScore(score) {
            cc.sys.localStorage.highestScore = score;
        }
    };
}();
module.exports = storageManager;

cc._RF.pop();
},{}]},{},["backgroundLoader","btn","landMaker","perfectLabel","spriteCreator","storageManager"]);
