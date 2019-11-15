var app = new PIXI.Application(400,500);
document.body.appendChild(app.view);
var game1Ceng = new PIXI.Container();
app.stage.addChild(game1Ceng);
var game2Ceng = new PIXI.Container();
app.stage.addChild(game2Ceng);
game2Ceng.visible = false;
var game3Ceng = new PIXI.Container();
app.stage.addChild(game3Ceng);
var uiCeng = new PIXI.Container();
app.stage.addChild(uiCeng);

var bj1 = new PIXI.Sprite.fromImage("res/bird/bj_01.png");
game1Ceng.addChild(bj1);
bj1.x=0;
var bj2 = new PIXI.Sprite.fromImage("res/bird/bj_01.png");
game1Ceng.addChild(bj2);
bj2.x=280;
var bj3 = new PIXI.Sprite.fromImage("res/bird/bj_01.png");
game1Ceng.addChild(bj3);
bj3.x=560;

for(var i=1;i<=7;i++) {
		for(var j=0;j<2;j++) {
				var ci = new PIXI.Sprite.fromImage("res/bird/luzhang001.png");
				game2Ceng.addChild(ci);
				ci.rotation = Math.PI / -2;
				ci.x = -345;
				ci.y = i*80+j*13-5;
		}
}

var ground1 = new PIXI.Sprite.fromImage("res/bird/ground.png");
game3Ceng.addChild(ground1);
ground1.y=410;
var ground2 = new PIXI.Sprite.fromImage("res/bird/ground.png");
game3Ceng.addChild(ground2);
ground2.y=410;
ground2.x=311;
var bird = new PIXI.Sprite.fromImage("res/bird/bird_01.png");
game3Ceng.addChild(bird);
bird.anchor.set(0.5,0.5);
bird.x=200;
bird.y=250;
bird.visible = false;

var style1 = {
		font:'bold italic 40px 微软雅黑',
		fill:'#f7edca',
		stroke:'#4a1850',
		strokeThickness:5,
		dropShadow:true,
		dropShadowColor:'#000000',
		dropShadowAngle:Math.PI/6,
		dropShadowDistance:6,
}
var style2 = {
		font:'bold italic 30px 微软雅黑',
		fill:'#f7edca',
		stroke:'#4a1850',
		strokeThickness:4,
		dropShadow:true,
		dropShadowColor:'#000000',
		dropShadowAngle:Math.PI/6,
		dropShadowDistance:4.5,
}
var style3 = {
		font:'bold italic 20px 微软雅黑',
		fill:'#f7edca',
		stroke:'#4a1850',
		strokeThickness:3,
		dropShadow:true,
		dropShadowColor:'#000000',
		dropShadowAngle:Math.PI/6,
		dropShadowDistance:3,
}
var style4 = {
		font:'bold 17px 微软雅黑',
		fill:'#FF6A6A',
		stroke:'#ffffff',
		strokeThickness:3,
}
var style5 = {
		font:'bold 20px 微软雅黑',
		fill:'#ff0000',
		stroke:'#FFC0CB',
		strokeThickness:3,
}

/*var start = new PIXI.Text(&quot;START&quot;,style1);
uiCeng.addChild(start);
start.anchor.set(0.5,0.5);
start.x=200;
start.y=180;*/
var readyImage = new PIXI.Sprite.fromImage("res/bird/ready.png");
uiCeng.addChild(readyImage);
readyImage.anchor.set(0.5,0.5);
readyImage.x=200;
readyImage.y=170;
var shoumingshu1 = new PIXI.Text("点击小鸟前方，往前飞",style4);
uiCeng.addChild(shoumingshu1);
shoumingshu1.anchor.set(0.5,0.5);
shoumingshu1.x=200;
shoumingshu1.y=250;
var shoumingshu2 = new PIXI.Text("点击小鸟后方，往后飞",style4);
uiCeng.addChild(shoumingshu2);
shoumingshu2.anchor.set(0.5,0.5);
shoumingshu2.x=200;
shoumingshu2.y=280;
var fenshu1 = new PIXI.Text("分数：0",style3);
uiCeng.addChild(fenshu1);
fenshu1.anchor.set(0.5,0.5);
fenshu1.x=80;
fenshu1.y=30;
fenshu1.visible=false;

var speed1 = 0;
var speed2 = -1;
var bgChangeJiShi = 0;
var pipejishi1 = 0;
var pipejishi2 = 0;
var AttackJiShi1 = 0;
var AttackJiShi2 = 0;
var iszhenping = false;
var zhenpingtime = 0;
var jifen = 0;
var sss = false;

var uppipeList = [];
var downpipeList = [];
var rightpipeList = [];
var AttackTimeList = [];
var jifenList = [];

app.stage.interactive = true;
//点击控制
app.stage.on(click,kongzhi);
app.stage.on(touchstart,kongzhi);
function kongzhi(event) {
		if(sss === false){
				sss = true;
				//start.visible = false;
				readyImage.visible = false;
				shoumingshu1.visible = false;
				shoumingshu2.visible = false;
				game2Ceng.visible = true;
				bird.visible = true;
				fenshu1.visible = true;
		}
		if(sss === true){
				var pos = event.data.getLocalPosition(app.stage);
				speed1 = -6;
				if(pos.x>bird.x){
						speed2 = 2;
				}
				if(pos.x<bird.x){
						speed2 = -3;
				}
		}
}

app.ticker.add(animate);
function animate() {
		if(sss === true){
				bgmove();//背景移动
				groundmove();//地板移动
				birdmove();//鸟移动
				
				addpipe();//创建水管
				movepipe();//移动水管
				PipeAttack();//水管攻击
				RightPipeAttack();////创建与发射横向水管
				
				crash();//碰撞
				jifenChange();//记分
		}
		zhenping();//震屏
}
//背景移动
function bgmove() {
		bj1.x-=0.5;
		bj2.x-=0.5;
		bj3.x-=0.5;
		
		if(bj1.x<=-280){
				bj1.x=0;
				bj2.x=280;
				bj3.x=560;
		}
}
//地板移动
function groundmove() {
		ground1.x-=1;
		ground2.x-=1;
		
		if(ground1.x<=-144){
				ground1.x=0;
				ground2.x=311;
		}
}
//鸟移动
function birdmove() {
		//横向移动
		bird.x += speed2;
		//下落
		if(bird.y <= 400) {
				bird.y += speed1;
		}
		else {
				bird.y = 400;
				speed1 = 0;
				//震屏与结束
				iszhenping = true;
		}
		speed1 += 0.25;
		//横向速度复位
		if(speed2> -1){
				speed2 -= 0.05;
		}
		if(speed2< -1){
				speed2 += 0.05;
		}
		//超出横向边界结束
		if(bird.x<=30){
				//震屏与结束
				iszhenping = true;
		}
}

//创建水管
function addpipe() {
		if(pipejishi1 === 0) {
				//创建水管
				var uppipe = PIXI.Sprite.fromImage("res/bird/pipe_01.png");
				uppipe.anchor.set(0.5,0.5);
				uppipe.x = 450;
				uppipe.y = Math.random() * 200-120;
				game1Ceng.addChild(uppipe);
				var downpipe = PIXI.Sprite.fromImage("res/bird/pipe_02.png");
				downpipe.anchor.set(0.5,0.5);
				downpipe.x = 450;
				downpipe.y = uppipe.y+450;
				game1Ceng.addChild(downpipe);
				//将水管添加到数组
				uppipeList.push(uppipe);
				jifenList.push(uppipe);
				downpipeList.push(downpipe);
				
				pipejishi1 = 300;
		}
		pipejishi1--;
}
//移动水管
function movepipe() {
		for(var i=0;i<uppipeList.length;i++) {
				var uppipe = uppipeList[i];
				uppipe.x -= 1;
				//水管是否超出边界
				if(uppipe.x < -50) {
						//销毁水管
						game1Ceng.removeChild(uppipe);
						uppipeList.splice(i,1);
				}
		}
		for(var i=0;i<downpipeList.length;i++) {
				var downpipe = downpipeList[i];
				downpipe.x -= 1;
				//水管是否超出边界
				if(downpipe.x < -50) {
						//销毁水管
						game1Ceng.removeChild(downpipe);
						downpipeList.splice(i,1);
				}
		}
}
//水管攻击
function PipeAttack() {
		if(AttackJiShi1 >= 120 && AttackJiShi1 <= 133) {
				for(var i=0;i<uppipeList.length;i++) {
						var uppipe = uppipeList[i];
						uppipe.y += 5;
				}
				for(var i=0;i<downpipeList.length;i++) {
						var downpipe = downpipeList[i];
						downpipe.y -= 5;
				}
		}
		if(AttackJiShi1 >= 133 && AttackJiShi1 <= 146){
				for(var i=0;i<uppipeList.length;i++) {
						var uppipe = uppipeList[i];
						uppipe.y -= 5;
				}
				for(var i=0;i<downpipeList.length;i++) {
						var downpipe = downpipeList[i];
						downpipe.y += 5;
				}
		}
		if(AttackJiShi1 >= 146){
				AttackJiShi1 = 0;
		}
		AttackJiShi1++;
}
//创建与发射横向水管
function RightPipeAttack() {
		if(pipejishi2 == 420) {
				//创建水管
				var rightpipe = PIXI.Sprite.fromImage("res/bird/pipe_01.png");
				rightpipe.anchor.set(0.5,0.5);
				rightpipe.x = 530;
				rightpipe.y = Math.random() * 230+90;
				rightpipe.rotation = Math.PI / 2;
				game1Ceng.addChild(rightpipe);
				//将水管添加到数组
				rightpipeList.push(rightpipe);
				//倒计时
				var AttackTime = new PIXI.Text("3",style5);
				game2Ceng.addChild(AttackTime);
				AttackTime.anchor.set(0.5,0.5);
				AttackTime.x = 380;
				AttackTime.y = rightpipe.y;
				//将倒计时添加到数组
				AttackTimeList.push(AttackTime);
		}
		if(pipejishi2 == 480) {
				AttackTimeList[0].text = "2";
		}
		if(pipejishi2 == 540) {
				AttackTimeList[0].text = "1";
		}
		if(pipejishi2 >= 600) {
				//移除倒计时
				game2Ceng.removeChild(AttackTimeList[0]);
				AttackTimeList.splice(0,1);
				//发射水管
				rightpipeList[0].x -= 30;
				//水管是否超出边界
				if(rightpipeList[0].x < -600) {
						//销毁水管
						game1Ceng.removeChild(rightpipeList[0]);
						rightpipeList.splice(0,1);
						
						pipejishi2 = 0;
				}
		}
		pipejishi2++;
}

//碰撞
function crash() {
		//循环上水管数组
		for(var i=0;i<uppipeList.length;i++) {
		var uppipe = uppipeList[i];
				//判断是否发生碰撞
				if(bird.x >= uppipe.x-40 && bird.x <= uppipe.x+40 &&bird.y <= uppipe.y+170) {
						//震屏与结束
						iszhenping = true;
						
						break;
				}
		}
		//循环下水管数组
		for(var i=0;i<downpipeList.length;i++) {
		var downpipe = downpipeList[i];
				//判断是否发生碰撞
				if(bird.x >= downpipe.x-40 && bird.x <= downpipe.x+40 && bird.y >= downpipe.y-170 && bird.y <= downpipe.y+170) {
						//震屏与结束
						iszhenping = true;
						
						break;
				}
		}
		//循环横向水管数组
		for(var i=0;i<rightpipeList.length;i++) {
		var rightpipe = rightpipeList[i];
				//判断是否发生碰撞
				if(bird.x >= rightpipe.x-170 && bird.x <= rightpipe.x+170 && bird.y >= rightpipe.y-40 && bird.y <= rightpipe.y+40) {
						//震屏与结束
						iszhenping = true;
						
						break;
				}
		}
}
//记分
function jifenChange() {
		for(var i=0;i<jifenList.length;i++) {
		var uppipe = jifenList[i];
				//判断是否通过水管
				if(bird.x > uppipe.x+40) {
						//记分
						jifen += 1;
						jifenList.splice(i,1);
						fenshu1.text = "分数："+jifen;
						
						break;
				}
		}
}

//震屏
function zhenping() {
		if(iszhenping === true){
				//结束
				sss = false;
				
				game1Ceng.x = Math.random() * 20-10;
				game1Ceng.y = Math.random() * 20-10;
				game2Ceng.x = game1Ceng.x;
				game2Ceng.y = game1Ceng.y;
				game3Ceng.x = game1Ceng.x;
				game3Ceng.y = game1Ceng.y;
				
				zhenpingtime ++;
				if(zhenpingtime == 10){
						game1Ceng.x = 0;
						game1Ceng.y = 0;
						game2Ceng.x = game1Ceng.x;
						game2Ceng.y = game1Ceng.y;
						game3Ceng.x = game1Ceng.x;
						game3Ceng.y = game1Ceng.y;
						
						iszhenping = false;
						zhenpingtime = 0;
						//结束面板
						over();
				}
		}
}
//结束界面
function over() {
		fenshu1.visible=false;
		
		var gameover = new PIXI.Text("GAMEOVER",style1);
		uiCeng.addChild(gameover);
		gameover.anchor.set(0.5,0.5);
		gameover.x=200;
		gameover.y=210;
		var fenshu2 = new PIXI.Text("分数："+jifen,style2);
		uiCeng.addChild(fenshu2);
		fenshu2.anchor.set(0.5,0.5);
		fenshu2.x=200;
		fenshu2.y=260;
		
		app.stage.on("click",reloadBt);
		app.stage.on("touchstart",reloadBt);
		function reloadBt() {
				window.location.reload();
		}
}