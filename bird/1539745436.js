//接口数据
var game_unionId = null;
var game_openId = null;
var game_nickname = null;
var game_headUrl = null;


//游戏玩家信息
var supportUser;
var supportGameId;

//用户信息
function SupportUser() {

    this.isLogin = true;
    this.playerId = "";
    this.nickname;
    this.headUrl;

    //获取用户信息
    this.initInfo = function(playerId,content) {

        // var game_unionId;
        // var game_openId;
        // var game_nikename;
        // var game_headUrl;

        //调取服务器接口，获取信息
        this.playerId = playerId;
        this.nickname = content.nickname;
        this.headUrl = content.headUrl;
    }
}

var gameName;
//支持系统对象
function SupportSystem(app, gameId, gn) {

    var self = this;
    this.gameId = gameId;
    this.gameName = gameName;
    gameName = gn;
    supportGameId = this.gameId;

    this.app = app;
    this.appW = app.renderer.width;
    this.appH = app.renderer.height;
    
    this.btnContainer = new PIXI.Container();
    this.panelContainer = new PIXI.Container();
    this.tipsContainer = new PIXI.Container();
    this.app.stage.addChild(this.btnContainer);
    this.app.stage.addChild(this.panelContainer);
    this.app.stage.addChild(this.tipsContainer);

    //服务器返回值统一处理
    this.callBack = CallBack.getInstance(this).callBack;

    //#############################
    //       消息提示功能
    //#############################

    this.msgSystem = new MsgSystem(this.appW, this.appH);
    this.tipsContainer.addChild(this.msgSystem);

    //#############################
    //       用户初始化功能
    //#############################

    //用户数据载体
    this.user = null;

    //微信登录
    ServerManager.getInstance().weiAction(this.gameId, this.callBack);

    //登录游戏服务器， data 存放微信数据信息
    this.loginServer = function(data) {

        // headPic: null
        // msg: "id验证失败"
        // openId: null
        // status: 400
        // unionId: null
        // userName: null

        //获取服务器用户信息
        var param = {};
        param["openId"] = data.openId;
        param["unionId"] = data.unionId;
        param["nickname"] = data.userName;
        param["headUrl"] = data.headPic;
        ServerManager.getInstance().action(ServerManager.USER_LOGIN, param, this.callBack);
    }
    
    //#############################
    //       排名系统
    //#############################

    //排名系统
    this.rankBtn = new PIXI.Sprite.fromImage("/gameSupport/res/rankBtn.png");

    //这是排行榜的板子，需要做缩放处理 604


    this.rankPanel = new RankPanel(this.appW, this.appH);
    this.panelContainer.addChild(this.rankPanel);
    this.rankBtn.interactive = true;
    this.rankBtn.on("click", function(){
        self.openRankPanel();
    });
    this.rankBtn.on("touchstart", function(){
        self.openRankPanel();
    });

    //添加排行榜入口按钮
    this.addRankBtn = function(x, y) {
        this.btnContainer.addChild(this.rankBtn);
        this.rankBtn.x = x;
        this.rankBtn.y = y;
    }

    //显示排行榜按钮
    this.showRankBtn = function() {
        this.rankBtn.visible = true;
    }

    //隐藏排行榜按钮
    this.hiddenRankBtn = function() {
        this.rankBtn.visible = false;
    }

    //打开排行榜
    this.openRankPanel = function() {
        //获取数据
        var param = {};
        param["gameId"] = this.gameId;
        ServerManager.getInstance().action(ServerManager.GET_RANK, param, this.callBack);
        
    }

    //更新用户排行榜数据
    this.updateRank = function(score) {
        if(this.user == null || this.user.playerId == "") {
            return;
        }
        var param = {};
        param["score"] = score;
        param["gameId"] = this.gameId;
        param["playerId"] = this.user.playerId;
        ServerManager.getInstance().action(ServerManager.UPDATE_RANK, param, this.callBack);

    }

    
    //#############################
    //         对战功能
    //#############################
    this.battleBtn = new PIXI.Sprite.fromImage("/gameSupport/res/battleBtn.png");
    this.battlePanel = new BattlePanel(this.appW, this.appH);
    this.panelContainer.addChild(this.battlePanel);
    this.battleBtn.interactive = true;
    this.battleBtn.on("click", function(){
        self.openBattlePanel();
    });
    this.battleBtn.on("touchstart", function(){
        self.openBattlePanel();
    });

    //添加排行榜入口按钮
    this.addBattleBtn = function(x, y) {
        this.btnContainer.addChild(this.battleBtn);
        this.battleBtn.x = x;
        this.battleBtn.y = y;
    }
    
    this.openBattlePanel = function() {
        this.battlePanel.open();
    }

    //只用于 pk 对战传递分数
    this.sendBattleScoreInfo = function(score) {
        this.battlePanel.sendBattleScoreInfo(score);
    }


}




//#############################
//         对战功能
//#############################
function BattlePanel(w, h) {
    PIXI.Container.call(this);
    var self = this;

    //房间号
    this.roomId = 0;
    this.gameMainId = 0;

    //遮罩
    this.zhezhao = new PIXI.Sprite.fromImage("/gameSupport/res/zhezhao.png");
    this.addChild(this.zhezhao);
    this.zhezhao.width = w;
    this.zhezhao.height = h;
    this.zhezhao.visible = false;
    this.zhezhao.interactive = true;
    this.zhezhao.on("click", function(e) {
        e.data.originalEvent.preventDefault();
        //self.close();
    });
    this.zhezhao.on("touchstart", function(e) {
        e.data.originalEvent.preventDefault();
        //self.close();
    });

    //存放ui信息
    this.uiContainer = new PIXI.Container();
    this.addChild(this.uiContainer);

    //背景
    this.bg = new PIXI.Sprite.fromImage("/gameSupport/res/battlePanel.png");
    this.uiContainer.addChild(this.bg);
    this.bg.x = (w - 400)/2;
    this.bg.y = -800;
    // this.img.y = (h - 600)/2;
    this.bg.visible = false;

    //游戏名称
    this.gameNameTxt = new PIXI.Text(gameName + " - 对战");
    this.bg.addChild(this.gameNameTxt);
    this.gameNameTxt.x = 20;
    this.gameNameTxt.y = 20;

    //关闭按钮
    this.closeBtn = new PIXI.Sprite.fromImage("/gameSupport/res/rankCloseBtn.png");
    this.bg.addChild(this.closeBtn);
    this.closeBtn.x = 360;
    this.closeBtn.interactive = true;
    this.closeBtn.on("click", function(event){
        self.close();
    });
    this.closeBtn.on("touchstart", function(){
        self.close();
    });

    //状态信息
    this.noticeTxt = new PIXI.Text("服务器连接中...");
    this.bg.addChild(this.noticeTxt);
    this.noticeTxt.x = 20;
    this.noticeTxt.y = 200;

    //更新状态信息
    this.updateNotice = function(content) {
        this.noticeTxt.text = content;
    }

    //匹配对手
    this.searchPlayerBtn = new PIXI.Sprite.fromImage("/gameSupport/res/searchPlayerBtn.png");
    this.bg.addChild(this.searchPlayerBtn);
    this.searchPlayerBtn.x = 82;
    this.searchPlayerBtn.y = 400;
    this.searchPlayerBtn.interactive = true;
    this.searchPlayerBtn.on("click", function(event){
        self.searchPlayer();
    });
    this.searchPlayerBtn.on("touchstart", function(){
        self.searchPlayer();
    });
    
    this.searchPlayer = function() {
        //验证登录信息
        var param = {};
        param["action"] = "searchPlayer";
        WebSocketManager.getInstance().send(param);
        self.updateNotice("请求服务器 ...");
    }

    //寻找对手成功
    this.searchPlayerSucc = function(action) {
        self.updateNotice("匹配对手成功！准备开始游戏 ...");

        //隐藏按钮
        self.searchPlayerBtn.interactive = false;
        self.searchPlayerBtn.tint = 0xaaaaaa;
        self.cancleSearchBtn.interactive = false;
        self.cancleSearchBtn.tint = 0xaaaaaa;
        self.closeBtn.interactive = false;
        self.closeBtn.tint = 0xaaaaaa;

        //初始化gamemain数据
        GameMain.getInstance().initData(action.gameMain);

        //播放动画，准备开始对战
        var battleStart = zhuye_Factory.buildArmatureDisplay(zhuye_ske.armature[0].name);  //zhuye_ske.armature[1].name
        battleStart.animation.play();
        self.addChild(battleStart);
        battleStart.x = 250;
        battleStart.y = 400;

        setTimeout(function(){
            battleStart.animation.stop();
            self.removeChild(battleStart);
            self.showBattleInfo();
            //开始游戏
            gameStart();
            self.close(false);

        }, 3 * 1000);

    }

    //等待玩家中
    this.waitPlayer = function(roomId) {
        self.roomId = roomId;
        self.updateNotice("寻找对手中 ... 房间号：" + roomId);
        self.searchPlayerBtn.interactive = false;
        self.searchPlayerBtn.tint = 0xaaaaaa;

    }

    //取消匹配
    this.cancleSearchBtn = new PIXI.Sprite.fromImage("/gameSupport/res/cancleSearchBtn.png");
    this.bg.addChild(this.cancleSearchBtn);
    this.cancleSearchBtn.x = 82;
    this.cancleSearchBtn.y = 500;
    this.cancleSearchBtn.interactive = true;
    this.cancleSearchBtn.on("click", function(event){
        self.cancleSearch();
    });
    this.cancleSearchBtn.on("touchstart", function(){
        self.cancleSearch();
    });

    //取消匹配
    this.cancleSearch = function() {
        if(self.roomId == 0){
            return;
        }
        //验证登录信息
        var param = {};
        param["action"] = "cancleSearch";
        param["roomId"] = self.roomId;
        WebSocketManager.getInstance().send(param);

        self.updateNotice("取消匹配中 ...");
    }

    this.cancleSearchSucc = function() {

        self.searchPlayerBtn.interactive = true;
        self.searchPlayerBtn.tint = 0xffffff;
        self.cancleSearchBtn.interactive = true;
        self.cancleSearchBtn.tint = 0xffffff;

        self.updateNotice("已取消匹配");

    }


    //#############################
    //         对战信息展示
    //#############################
    this.battleInfo = new PIXI.Sprite.fromImage("/gameSupport/res/battleInfoBg.png");
    this.addChild(this.battleInfo);
    this.battleInfo.visible = false;
    this.battleInfo.alpha = 0.7;

    this.battlePlayerObj = {};

    this.showBattleInfo = function() {
        this.battleInfo.visible = true;

        //初始化对战信息
        var playerIdArr = GameMain.getInstance().getPlayerArr();

        for(var i = 0 ; i < playerIdArr.length; i ++) {
            var playerId = playerIdArr[i];

            var battlePlayer = new BattlePlayer(playerId);
            this.battleInfo.addChild(battlePlayer);
            battlePlayer.x = i * 250;
            this.battlePlayerObj[playerId] = battlePlayer;

            battlePlayer.updateScore(playerId);
            
        }
    }

    //【对外接口】只用于 pk 对战传递分数
    this.sendBattleScoreInfo = function(score) {
        //验证登录信息
        var param = {};
        param["action"] = "sendBattleScoreInfo";
        param["gameMainId"] = GameMain.getInstance().id;
        param["playerId"] = supportUser.playerId;
        param["score"] = score;
        WebSocketManager.getInstance().send(param);

    }

    //更新所有玩家的分数
    this.updateScore = function(action) {
        //初始化gamemain数据
        GameMain.getInstance().updateScore(action.gameMain);
        //需要更新的角色信息
        var playerId = action.playerId;
        //刷新显示
        this.battlePlayerObj[action.playerId].updateScore(playerId);

    }



    //打开面板
    this.open = function() {
        self.bg.visible = true;
        self.zhezhao.visible = true;

        var m1 = new AnimationMove();
        m1.moveTo(self.bg, {"x":(w - 400)/2,"y":(h - 600)/2}, 0.3, Tween.Sine.easeOut);
        m1.onComplete(this, this.connectWs, "");
        m1.runAction();

        self.searchPlayerBtn.interactive = true;
        self.searchPlayerBtn.tint = 0xffffff;
        self.cancleSearchBtn.interactive = true;
        self.cancleSearchBtn.tint = 0xffffff;
        self.closeBtn.interactive = true;
        self.closeBtn.tint = 0xffffff;


    }

    //连接服务器
    this.connectWs = function() {
        WebSocketManager.getInstance().connect();
    }

    this.close = function(isConnect = true) {
        var m1 = new AnimationMove();
        m1.moveTo(self.bg, {"x":(w - 400)/2,"y": -800}, 0.3, Tween.Sine.easeOut);
        m1.onComplete(this, this.hiddenPanel, isConnect);
        m1.runAction();
    }

    this.hiddenPanel = function(isConnect) {
        self.bg.visible = false;
        self.zhezhao.visible = false;
        if(isConnect == true) {
            //断开服务器
            WebSocketManager.getInstance().disconnect();
        }
        
    }

}
BattlePanel.prototype = Object.create(PIXI.Container.prototype);


//#############################
//       玩家对战信息展示
//#############################

function BattlePlayer(playerId) {
    PIXI.Container.call(this);
    var self = this;
    
    var player = ModelManager.getInstance().getData("Player", playerId);

    this.headPicBg = new PIXI.Sprite.fromImage("/gameSupport/res/headBg.png");
    this.addChild(this.headPicBg);
    this.headPicBg.x = 8;
    this.headPicBg.y = 8;
    this.headPicBg.width = 48;
    this.headPicBg.height = 48;

    this.headPic = new PIXI.Sprite.fromImage(player.headUrl);
    this.addChild(this.headPic);
    this.headPic.x = 10;
    this.headPic.y = 10;
    this.headPic.width = 44;
    this.headPic.height = 44;

    var style = {
        "align": "right",
        "fontSize": 18,
        "wordWrapWidth": 100
    }

    this.playerNameTxt = new PIXI.Text(player.nickName, style);
    this.addChild(this.playerNameTxt);
    this.playerNameTxt.x = 80;
    this.playerNameTxt.y = 18;

    var style = {
        "align": "right",
        "fontSize": 18,
        "wordWrapWidth": 100
    }

    this.scoreTxt = new PIXI.Text("0", style);
    this.addChild(this.scoreTxt);
    this.scoreTxt.x = 190;
    this.scoreTxt.y = 18;

    this.updateScore = function(playerId) {

        //初始化对战信息
        var score = GameMain.getInstance().getScoreByPlayerId(playerId);
        this.scoreTxt.text = score;

    }


}
BattlePlayer.prototype = Object.create(PIXI.Container.prototype);





//#############################
//       排行榜功能
//#############################
//排名面板
function RankPanel(w, h) {
    PIXI.Container.call(this);
    var self = this;

    this.scalePre = h / 700;

    //遮罩
    this.zhezhao = new PIXI.Sprite.fromImage("/gameSupport/res/zhezhao.png");
    this.addChild(this.zhezhao);
    this.zhezhao.width = w;
    this.zhezhao.height = h;
    this.zhezhao.visible = false;
    this.zhezhao.interactive = true;
    this.zhezhao.on("click", function(e) {
        e.data.originalEvent.preventDefault();
        //self.close();
    });
    this.zhezhao.on("touchstart", function(e) {
        e.data.originalEvent.preventDefault();
        //self.close();
    });

    //存放ui信息
    this.rankContainer = new PIXI.Container();
    this.addChild(this.rankContainer);


    //背景
    this.bg = new PIXI.Sprite.fromImage("/gameSupport/res/rankBg.png");
    this.rankContainer.addChild(this.bg);
    this.bg.x = (w - 400 * this.scalePre)/2;
    this.bg.y = -800;
    // this.img.y = (h - 600)/2;
    this.bg.visible = false;

    this.bg.scale.x = this.bg.scale.y = this.scalePre;

    //游戏名称
    this.gameNameTxt = new PIXI.Text(gameName);
    this.bg.addChild(this.gameNameTxt);
    this.gameNameTxt.x = 190;
    this.gameNameTxt.y = 42;

    //关闭按钮
    this.closeBtn = new PIXI.Sprite.fromImage("/gameSupport/res/rankCloseBtn.png");
    this.bg.addChild(this.closeBtn);
    this.closeBtn.x = 360;
    this.closeBtn.interactive = true;
    this.closeBtn.on("click", function(event){
        self.close();
    });
    this.closeBtn.on("touchstart", function(){
        self.close();
    });

    //存放排名信息
    this.rankItemContainer = new PIXI.Container();
    this.bg.addChild(this.rankItemContainer);
    //对 rankItemContainer 进行mask
    this.rankItemContainerMask = new PIXI.Graphics();
    this.rankItemContainerMask.beginFill(0xffff00, 1);
    this.rankItemContainerMask.drawRect(0, 80, 400, 480);
    this.bg.addChild(this.rankItemContainerMask);

    this.rankItemContainer.mask = this.rankItemContainerMask;
    DragRollManager.getInstance().addDragObj(this.rankItemContainer);
    
    this.open = function(content) {
        //移除历史信息
        self.rankItemContainer.removeChildren(0, self.rankItemContainer.children.length);

        self.bg.visible = true;
        self.zhezhao.visible = true;

        var m1 = new AnimationMove();
        m1.moveTo(self.bg, {"x":(w - 400 * this.scalePre)/2,"y":(h - 600 * this.scalePre)/2}, 0.3, Tween.Sine.easeOut);
        m1.runAction();
        self.updateRankData(content);
        this.rankItemContainer.y = 0;

        // console.log(this.rankItemContainer.height);
    }

    this.close = function() {
        var m1 = new AnimationMove();
        m1.moveTo(self.bg, {"x":(w - 400)/2,"y": -800}, 0.3, Tween.Sine.easeOut);
        m1.onComplete(this, this.hiddenRank, "");
        m1.runAction();

    }

    this.hiddenRank = function() {
        self.bg.visible = false;
        self.zhezhao.visible = false;
    }
    

    this.updateRankData = function(content) {

        for(var i = 0; i < content.length; i ++) {
            var rank = content[i];
            var rpi = new RankPlaneItem(i + 1,rank);
            self.rankItemContainer.addChild(rpi);
            rpi.x = 16;
            rpi.y = 90 * i + 100;
        }
    }
}
RankPanel.prototype = Object.create(PIXI.Container.prototype);

//排名条目
function RankPlaneItem(rank, content) {
    PIXI.Container.call(this);

    var url = "/gameSupport/res/kuang.png";
    if(rank == 1) {
        url = "/gameSupport/res/jin.png";
    } else if(rank == 2) {
        url = "/gameSupport/res/yin.png";
    } else if(rank == 3) {
        url = "/gameSupport/res/tong.png";
    }

    this.bg = new PIXI.Sprite.fromImage(url);
    this.addChild(this.bg);

    var style = {
        font : 'bold 20px 微软雅黑',//加粗 倾斜 字号 字体名称
        fill : '#F7EDCA',//颜色
        stroke : '#4a1850',//描边颜色
        strokeThickness : 3,//描边宽度
        dropShadow : true,//开启阴影
        dropShadowColor : '#000000',//阴影颜色
        dropShadowAngle : Math.PI / 6,//阴影角度
        dropShadowDistance : 3,//投影距离
        wordWrap : true,//开启自动换行(注：开启后在文本中空格处换行，如文本中没有空格则不换行)
        wordWrapWidth : 150,//自动换行宽度
    };

    this.rank = new PIXI.Text(rank, style);
    this.addChild(this.rank);
    this.rank.y = 40;
    this.rank.x = 43;
    this.rank.anchor.set(0.5,0.5);

    this.headPicBg = new PIXI.Sprite.fromImage("/gameSupport/res/headBg.png");
    this.addChild(this.headPicBg);
    this.headPicBg.x = 90;
    this.headPicBg.y = 18;
    this.headPicBg.width = 48;
    this.headPicBg.height = 48;

    this.headPic = new PIXI.Sprite.fromImage(content.headUrl);
    this.addChild(this.headPic);
    this.headPic.x = 92;
    this.headPic.y = 20;
    this.headPic.width = 44;
    this.headPic.height = 44;

    var style = {
        "align": "right",
        "fontSize": 18,
        "wordWrapWidth": 100
    }

    this.name = new PIXI.Text(content.nickname, style);
    this.addChild(this.name);
    this.name.x = 160;
    this.name.y = 30;

    var style = {
        "fontSize": 26,

    }

    this.score = new PIXI.Text(content.score, style);
    this.addChild(this.score);
    this.score.x = 350;
    this.score.y = 26;
    this.score.anchor.x = 1;

}
RankPlaneItem.prototype = Object.create(PIXI.Container.prototype);




//#############################
//       消息提示功能
//#############################
function MsgSystem(w, h) {
    PIXI.Container.call(this);
    var self = this;

    this.xh = (w - 500)/2;
    this.bg = new PIXI.Sprite.fromImage("/gameSupport/res/systemtip.png");
    this.addChild(this.bg);
    this.visible = false;
    this.bg.y = -100;
    this.bg.x = (w - 500)/2;

    //文本
    this.txt = new PIXI.Text();
    this.bg.addChild(this.txt);
    this.txt.y = 36;
    this.txt.x = 250;
    this.txt.anchor.x = 0.5;
    
    this.show = function(content){

        this.txt.text = content;
        this.visible = true;
        var m1 = new AnimationMove();
        m1.moveTo(self.bg, {"x":this.xh,"y":0}, 0.5, Tween.Sine.easeOut);
        m1.runAction();
        setTimeout(this.close ,3000);

    }

    this.close = function() {
        var m1 = new AnimationMove();
        m1.moveTo(self.bg, {"x":this.xh,"y":-100}, 0.5, Tween.Sine.easeOut);
        m1.runAction();
    }


}
MsgSystem.prototype = Object.create(PIXI.Container.prototype);






// ##############################
//        处理数据返回值信息
//
// ##############################
function CallBack(support) {

    var self = this;
    this.support = support;

    //server call back 这里统一处理服务器返回的数据
    this.callBack = function(data) {
        //alert(data);
        var data = JSON.parse(data);

        var action = data["action"];
        
        if(action == "8001") {
            self.support.msgSystem.show(data["content"]);
        
        } else if(action == "2001") { //更新排名列表
            self.support.rankPanel.open(data["content"]);

        } else if(action == "1001") { //初始化登录信息
            self.support.user = new SupportUser();
            self.support.user.initInfo(data["playerId"],data["content"]);
            self.support.msgSystem.show("欢迎归来！" + self.support.user.nickname);
            supportUser = self.support.user;

        } else if(action == "wsLoginSucc") { //服务器连接成功
            self.support.msgSystem.show("ws服务器连接成功！");
            self.support.battlePanel.updateNotice("已登陆服务器。");

        } else if(action == "otherLogin") { //其他地方登录了
            self.support.msgSystem.show("该账号已在其他设备登录！");

        } else if(action == "beginTurn") { //找到对手，开始游戏
            self.support.battlePanel.searchPlayerSucc(data);

        } else if(action == "waitPlayer") { //等待玩家中
            self.support.battlePanel.waitPlayer(data["roomId"]);

        } else if(action == "cancleSearchSucc") { //取消匹配成功
            self.support.battlePanel.cancleSearchSucc();

        } else if(action == "updateScore") { //更新即时交换分数
            self.support.battlePanel.updateScore(data);

        } else {

            
            if(data.status == "200") {
                if(data.openId == null ) {
                    self.support.msgSystem.show("在微信中游戏，可参与排行");
                } else {
                    //登录游戏服务器
                    self.support.loginServer(data);
                }
                
            } else if(data.status == "400"){
                self.support.msgSystem.show("游戏网络ID不正确");
            }

        }

        //alert(11);
    }

}

CallBack.instance = null;

CallBack.getInstance = function(support){
  if(CallBack.instance==null){
    CallBack.instance = new CallBack(support);
  }
  return CallBack.instance;
}





// #########################
//      排行榜服务器信息
//
// #########################


ServerManager.USER_LOGIN = "1001"; //用户登录
ServerManager.GET_RANK = "2001"; //获取排行榜数据
ServerManager.UPDATE_RANK = "2002"; //更新排行榜数据


function ServerManager(){

    this.serverUrl = "http://127.0.0.1/2018/gameServer/action.php";
    this.serverUrl = "http://www.yyfun001.com/gameServer/action.php";

    //获取微信信息接口
    this.weiUrl = "http://www.yyfun001.com/lesson/action.php?c=UserProxy&a=getUserInfo";

    this.weiAction = function(gameId,callBack) {
        $.get(this.weiUrl + "&gameId=" + gameId, function(data){
            callBack(data);
        });
    }

    this.action = function(command, param, callBack) {
        param["command"] = command;
        param["c"] = "Interface";
        param["a"] = "server";

        $.post(this.serverUrl, param, function(data){
            callBack(data);
        });
    }

}



ServerManager.instance = null;

ServerManager.getInstance = function(){
  if(ServerManager.instance==null){
    ServerManager.instance = new ServerManager();
  }
  return ServerManager.instance;
}






// ############################
//           拖拽信息
//
// ############################


function DragRollManager() {

    this.maxID = 1;
    this.dragPool = [];
    
  
    this.enabled = true;
  
    this.addDragObj = function(target,cb,dragWidth,dragHeight){
      var dragObj = new DragObject();
      dragObj.id = this.maxID;
      dragObj.target = target;
      dragObj.callBack = cb;
  
  
      if(dragWidth!==undefined){
        dragObj.dragWidth = dragWidth;
      }
      if(dragHeight!==undefined){
        dragObj.dragHeight = dragHeight;
      }
  
      this.maxID++;
      this.dragPool.push(dragObj);
      this.packageEvent(dragObj);
      return dragObj;
    };
    this.removeDrag = function(target){
        var dragObj = null;
        for(var key in this.dragPool){
          if(this.dragPool[key].target==target){
            dragObj = this.dragPool[key];
            this.dragPool.splice(key,1);
            this.removeEvent(dragObj);
            break;
          }
        }
    };
  
    this.removeEvent = function(dragObj){
      dragObj.target.interactive = false;
      dragObj.target.buttonMode = false;
  
      dragObj.target.removeListener('mousedown');
      dragObj.target.removeListener('touchend');
    };
    
    this.packageEvent = function(dragObj){
      var self = dragObj;
  
      dragObj.target.interactive = true;
      dragObj.target.buttonMode = true;
  
      var zindex = -1;
      dragObj.target.on('mousedown',onMouseDown);
      dragObj.target.on('touchstart',onMouseDown);
  
      function onMouseDown(event){
        event.stopPropagation();
        //event.data.originalEvent.preventDefault();
        if(self.enabled==false){
          return ;
        }
  
        if(self.startCallBack){
            self.startCallBack(self.target);
        }
  
        zindex = self.target.parent.getChildIndex(self.target);
  
        self.target.parent.addChild(self.target);
        var pt = event.data.getLocalPosition(self.target.parent);
        self.target.alpha=0.5;
        self.posX = self.target.x;
        self.posY = self.target.y;
        self.eventData = event.data;
  
        self.mouseX = pt.x;
        self.mouseY = pt.y;
  
  
        self.target.on('mousemove',onMove);
        self.target.on('touchmove',onMove);
        self.target.on('mouseup',onMouseUp);
        //self.target.on('mouseout',onMouseUp);
        self.target.on('touchend',onMouseUp);
        document.body.addEventListener("mouseup", onMouseUp);
        document.body.addEventListener("touchend", onMouseUp);
  
  
      }
  
      function onMouseUp(event){
        event.stopPropagation();
  
        dragObj.target.alpha = 1;
        dragObj.eventData = null;
        dragObj.target.removeListener('mousemove',onMove);
        dragObj.target.removeListener('touchmove',onMove);
        dragObj.target.removeListener('mouseup',onMouseUp);
        dragObj.target.removeListener('touchend',onMouseUp);
        document.body.removeEventListener("mouseup",onMouseUp);
        document.body.removeEventListener("touchend",onMouseUp);
        dragObj.target.parent.addChildAt(self.target,zindex);
        dragObj.dragComplete();
      }
  
  
      function onMove(event){
        event.stopPropagation();
        
        var pt = event.data.getLocalPosition(this.parent);
        if(self.eventData){
          if(self.dragWidth == -1 || self.dragHeight == -1) {
            //self.target.x = self.posX + pt.x - self.mouseX;
            self.target.y = self.posY + pt.y - self.mouseY;

            if(self.target.y > 0) {
                self.target.y = 0;
            }

            var topPosY = 500 - self.target.height - 80;
            if(self.target.y < topPosY){
                if(topPosY > 0) {
                   topPosY = 0;
                }
                self.target.y = topPosY;
            }
            // console.log(self.target.y);

          }else{
            var xx = pt.x - self.mouseX;
            var yy = pt.y - self.mouseY;
  
            
  
            // //self.target.x = self.posX+xx;
            // self.target.y = self.posY+yy;
  
            // if(self.target.x>self.dragWidth){
            //   //self.target.x = self.dragWidth;
            // }else if(self.target.x<0){
            //   //self.target.x=0;
            // }
            // if(self.target.y>self.dragHeight){
            //   self.target.y = self.dragHeight;
            // }else if(self.target.y<0){
            //   self.target.y=0;
            // }
          }
        }
        if(self.moveCallBack!=null){
          self.moveCallBack(self.target);
        }
      }
    }



}


DragRollManager.instance = null;

DragRollManager.getInstance = function(){
  if(DragRollManager.instance==null){
    DragRollManager.instance = new DragRollManager();
  }
  return DragRollManager.instance;
}

function DragObject(){
    this.target=null;
    this.callBack = null;
    this.moveCallBack = null;
    this.startCallBack = null;
    this.posX =-1;
    this.posY = -1;
    this.eventData = null;
    this.mouseX = -1;
    this.mouseY = -1;
  
    this.dragWidth = -1;
    this.dragHeight = -1;
    this.maxWidth = -1;
    this.maxHeight = -1;
    this.downTime = 0;
  
    
    this.scrollSpdx = 0;
    this.scrollSpdy = 0;
  
    this.dragMask = null;
    
  
    this.dragComplete = function(){
  
  
      if(this.callBack!=null){
        var pt = new Object();
        pt.x = this.posX;
        pt.y = this.posY;
        if(this.posX == this.target.x && this.posY == this.target.y) {
          this.callBack(this.target,false,pt);
        }else{
          this.callBack(this.target,true,pt);
        }
      }
    }
    
  }
  


// #############################
//          缓动动画组
//
// #############################
//动画组
function AnimationSeries() {
    var self = this;
    this.animationParallelArr = [];

    this.isComplete = false;

    this.detla;
    this.length = 0;

    //callback
    this.callTarget;
    this.callBack;
    this.callBackParam;
    
    //回掉处理
    this.onComplete = function(callTarget, callBack, callBackParam) {
        this.callTarget = callTarget;
        this.callBack = callBack;
        this.callBackParam = callBackParam;
    }

    this.getComplete = function() {
        return self.isComplete;
    }

    //添加动画序列
    this.push = function(animationParallel) {
        this.animationParallelArr.push(animationParallel);
    }

    this.index = 0;
    this.onframe = function(){
        var iAction = self.animationParallelArr[self.index];
        if(iAction == null){
            self.isComplete = true;
            //执行完成
            if(self.callBack != null) {
                self.callBack.apply(self.callTarget, self.callBackParam);
            }
            return;
        }
        iAction.runAction(self.detla);
        if(iAction.getComplete()==true){
            self.index++;
            // if(self.index==self.animationParallelArr.length){
            //     self.isComplete = true;
            // }
        }
        requestAnimationFrame(self.onframe);
    }

    this.runAction = function(detla = 1){
        this.detla = detla;
        self.onframe();
    }
    this.push = function(iAction){
        this.animationParallelArr.push(iAction)
    }

}

//动画序列单元
function AnimationParallel() {
    var self = this;
    this.animationMoveArr = [];
    this.isComplete = false;
    var isRun = false;
    this.detla;

    //callback
    this.callTarget;
    this.callBack;
    this.callBackParam;
    
    //回掉处理
    this.onComplete = function(callTarget, callBack, callBackParam) {
        this.callTarget = callTarget;
        this.callBack = callBack;
        this.callBackParam = callBackParam;
    }

    //添加动画单元
    this.push = function(animationObject) {
        this.animationMoveArr.push(animationObject);
    }

    this.getComplete = function() {
        return self.isComplete;
    }

    var self = this;
    this.onframe = function(){
        var overNum = 0;
        for(var key in self.animationMoveArr){
            self.animationMoveArr[key].runAction(self.detla);
            over = self.animationMoveArr[key].getComplete();
            if(over == true) {
                overNum ++;
            }
        }
        if(overNum != self.animationMoveArr.length){
            requestAnimationFrame(self.onframe);
        } else {
            self.isComplete = true;
            if(self.callBack != null) {
                self.callBack.apply(self.callTarget, self.callBackParam);
            }
        }
    }
  
    this.runAction = function(detla = 1){
        this.detla = detla;
        if(isRun == true) {
            return;
        }
        for(var i = 0; i < this.animationMoveArr.length; i ++) {
            var animationMove = this.animationMoveArr[i];
            animationMove.runAction(detla);
        }
        isRun = true;
        this.onframe();
    }
}

//动画单元
function Animation() {
    var self = this;

    var isRun = false;
    this.isComplete = false;
    this.detla = 1;
    this.target;

    this.time;
    this.frame;
    this.allFrame;

    this.easeType;

    //callback
    this.callTarget;
    this.callBack;
    this.callBackParam;
    
    //回掉处理
    this.onComplete = function(callTarget, callBack, callBackParam) {
        this.callTarget = callTarget;
        this.callBack = callBack;
        this.callBackParam = callBackParam;
    }

    this.getComplete = function() {
        return self.isComplete;
    }
    
    //执行动画
    this.onframe = function(){
        if(self.frame == 0) {
            //执行完成
            self.isComplete = true;
            if(self.callBack != null) {
                // self.callBack;
                self.callBack.call(self.callTarget, self.callBackParam);
                
            }
        } else {
            self.action();
            self.frame --;
            requestAnimationFrame(self.onframe);
        }
    }
    this.runAction = function(detla = 1){
        if(isRun == true) {
            return;
        }
        this.detla = detla;
        this.runReady();
        this.frame = this.time * 60 / detla;
        this.allFrame = this.frame;
        isRun = true;
        this.onframe();
    }

    this.action = function() {}
    this.runReady = function() {}
}

//序列帧动画
function AnimationMovieClip() {
    Animation.call(this);

    //帧频动画
    var i;
    var index;
    var indexNum;
    var textureArr;
    var stopTexture = null;
    var subTime;
    var time;
    var isLoop;

    this.flash = function(target, textureArr, time, subTime=0.1 , isLoop = true) {
        this.target = target;
        this.textureArr = textureArr;
        this.subTime = subTime;
        this.time = time;
        this.isLoop = isLoop;
    }

    this.stop = function(texture) {
        this.stopTexture = texture;
    }

    //执行动画
    this.action = function(){

        if(this.index == this.indexNum) {
            //换纹理
            this.target.texture = this.textureArr[this.i];
            this.index = 0;
            this.i ++;
            if(this.isLoop == false && this.textureArr.length == this.i) {
                this.frame = 1;
            }
            this.i = this.i % this.textureArr.length;
        }
        this.index ++;

        if(this.frame == 1 && this.stopTexture) {
            this.target.texture = this.stopTexture;
        }
        
    }

    this.runReady = function() {
        //处理啥？
        this.indexNum = Math.round(this.subTime * 60 / this.detla); 
        this.index = 0;
        this.i = 0;
    }

}

//移动方法
function 
AnimationMove() {
    Animation.call(this);

    this.moveTo;
    this.dx;
    this.dy;
    this.sx;
    this.sy;

    this.moveTo = function(target, moveTo, time, easeType = Tween.Linear) {
        this.target = target;
        this.moveTo = moveTo;
        this.time = time;
        this.easeType = easeType;
    }

    this.action = function() {
        var nx = this.easeType(this.allFrame - this.frame, this.sx, this.moveTo.x - this.sx, this.allFrame);
        var ny = this.easeType(this.allFrame - this.frame, this.sy, this.moveTo.y - this.sy, this.allFrame);
        this.target.x = nx;
        this.target.y = ny;
    }

    this.runReady = function() {
        this.sx = this.target.x;
        this.sy = this.target.y;
        this.dx = (this.moveTo.x - this.target.x)/this.time / 60 * this.detla;
        this.dy = (this.moveTo.y - this.target.y)/this.time / 60 * this.detla;
    }
}

function AnimatioBezier() {
    Animation.call(this);

    this.moveTo;
    this.p1;
    this.p2;
    this.dx;
    this.dy;
    this.sx;
    this.sy;

    this.moveTo = function(target, moveTo, time, p1, p2, easeType = Tween.Linear) {
        this.target = target;
        this.moveTo = moveTo;
        this.time = time;
        this.easeType = easeType;

        this.p1 = p1;
        this.p2 = p2;
    }

    this.action = function() {
        //Bezier
        this.bezier((this.allFrame - this.frame)/this.allFrame);
        //var nx = this.easeType(this.allFrame - this.frame, this.sx, this.moveTo.x, this.allFrame);
        //var ny = this.easeType(this.allFrame - this.frame, this.sy, this.moveTo.y, this.allFrame);
        //this.target.x = nx;
        //this.target.y = ny;
    }

    this.bezier = function(t) {
        //var p0 = this.target;
        var p3 = this.moveTo;

        var nx = this.sx * (1 - t) * (1 - t) * (1 - t) + 3 * this.p1.x * t * (1-t) * (1-t) + 3 * this.p2.x * t * t * (1 - t) + p3.x * t * t * t;
        var ny = this.sy * (1 - t) * (1 - t) * (1 - t) + 3 * this.p1.y * t * (1-t) * (1-t) + 3 * this.p2.y * t * t * (1 - t) + p3.y * t * t * t;

        //console.log(t + " ----- " + nx + " ------- " + ny);
        this.target.x = nx;
        this.target.y = ny;

    }

    this.runReady = function() {
        this.sx = this.target.x;
        this.sy = this.target.y;
        this.dx = (this.moveTo.x - this.target.x)/this.time / 60 * this.detla;
        this.dy = (this.moveTo.y - this.target.y)/this.time / 60 * this.detla;
    }


}

function AnimationRotation() {
    Animation.call(this);

    this.rotationTo;
    this.sr;
    this.dr;

    this.rotationTo = function(target, rotationTo, time, easeType = Tween.Linear) {
        this.target = target;
        this.rotationTo = rotationTo;
        this.time = time;
        this.easeType = easeType;
    }

    this.action = function() {
        var ny = this.easeType(this.allFrame - this.frame, this.sr, this.rotationTo, this.allFrame);
        this.target.rotation = ny;
    }

    this.runReady = function() {
        this.sr = this.target.rotation;
        this.dr = (this.rotationTo - this.target.rotation)/this.time / 60 * this.detla;
    }

}


// //test
// var am1 = new AnimationMove();
// var am2 = new AnimationMove();
// var am3 = new AnimationMove();

// var ap1 = new AnimationParallel();

// ap1.push(am1);
// ap1.push(am2);

// var s1 = new AnimationSeries();
// s1.push(ap1);
// s1.push(am3);

// console.log(s1);


var Tween = {
    Linear: function(t,b,c,d){ return c*t/d + b; },
    Quad: {
        easeIn: function(t,b,c,d){
            return c*(t/=d)*t + b;
        },
        easeOut: function(t,b,c,d){
            return -c *(t/=d)*(t-2) + b;
        },
        easeInOut: function(t,b,c,d){
            if ((t/=d/2) < 1) return c/2*t*t + b;
            return -c/2 * ((--t)*(t-2) - 1) + b;
        }
    },
    Cubic: {
        easeIn: function(t,b,c,d){
            return c*(t/=d)*t*t + b;
        },
        easeOut: function(t,b,c,d){
            return c*((t=t/d-1)*t*t + 1) + b;
        },
        easeInOut: function(t,b,c,d){
            if ((t/=d/2) < 1) return c/2*t*t*t + b;
            return c/2*((t-=2)*t*t + 2) + b;
        }
    },
    Quart: {
        easeIn: function(t,b,c,d){
            return c*(t/=d)*t*t*t + b;
        },
        easeOut: function(t,b,c,d){
            return -c * ((t=t/d-1)*t*t*t - 1) + b;
        },
        easeInOut: function(t,b,c,d){
            if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
            return -c/2 * ((t-=2)*t*t*t - 2) + b;
        }
    },
    Quint: {
        easeIn: function(t,b,c,d){
            return c*(t/=d)*t*t*t*t + b;
        },
        easeOut: function(t,b,c,d){
            return c*((t=t/d-1)*t*t*t*t + 1) + b;
        },
        easeInOut: function(t,b,c,d){
            if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
            return c/2*((t-=2)*t*t*t*t + 2) + b;
        }
    },
    Sine: {
        easeIn: function(t,b,c,d){
            return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
        },
        easeOut: function(t,b,c,d){
            return c * Math.sin(t/d * (Math.PI/2)) + b;
        },
        easeInOut: function(t,b,c,d){
            return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
        }
    },
    Expo: {
        easeIn: function(t,b,c,d){
            return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
        },
        easeOut: function(t,b,c,d){
            return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
        },
        easeInOut: function(t,b,c,d){
            if (t==0) return b;
            if (t==d) return b+c;
            if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
            return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
        }
    },
    Circ: {
        easeIn: function(t,b,c,d){
            return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
        },
        easeOut: function(t,b,c,d){
            return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
        },
        easeInOut: function(t,b,c,d){
            if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
            return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
        }
    },
    Elastic: {
        easeIn: function(t,b,c,d,a,p){
            if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
            if (!a || a < Math.abs(c)) { a=c; var s=p/4; }
            else var s = p/(2*Math.PI) * Math.asin (c/a);
            return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
        },
        easeOut: function(t,b,c,d,a,p){
            if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
            if (!a || a < Math.abs(c)) { a=c; var s=p/4; }
            else var s = p/(2*Math.PI) * Math.asin (c/a);
            return (a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b);
        },
        easeInOut: function(t,b,c,d,a,p){
            if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
            if (!a || a < Math.abs(c)) { a=c; var s=p/4; }
            else var s = p/(2*Math.PI) * Math.asin (c/a);
            if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
            return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
        }
    },
    Back: {
        easeIn: function(t,b,c,d,s){
            if (s == undefined) s = 1.70158;
            return c*(t/=d)*t*((s+1)*t - s) + b;
        },
        easeOut: function(t,b,c,d,s){
            if (s == undefined) s = 1.70158;
            return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
        },
        easeInOut: function(t,b,c,d,s){
            if (s == undefined) s = 1.70158; 
            if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
            return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
        }
    },
    Bounce: {
        easeIn: function(t,b,c,d){
            return c - Tween.Bounce.easeOut(d-t, 0, c, d) + b;
        },
        easeOut: function(t,b,c,d){
            if ((t/=d) < (1/2.75)) {
                return c*(7.5625*t*t) + b;
            } else if (t < (2/2.75)) {
                return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
            } else if (t < (2.5/2.75)) {
                return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
            } else {
                return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
            }
        },
        easeInOut: function(t,b,c,d){
            if (t < d/2) return Tween.Bounce.easeIn(t*2, 0, c, d) * .5 + b;
            else return Tween.Bounce.easeOut(t*2-d, 0, c, d) * .5 + c*.5 + b;
        }
    }
}