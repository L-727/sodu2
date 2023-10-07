function SD(){
	this.sdArr = [];//生成的数独数组	
	this.errorArr = [];//错误的格子。
	this.blankNum = [];//空白格子数量 
	this.backupSdArr = [];//数独数组备份。
	this.num;
	this.createBackupSdArr(); // 创建数独备份数组
	this.gridId = "grid-" + Math.random().toString(36).substr(2, 9); // 为每个数独生成一个唯一的标识
}
SD.prototype={
	constructor:SD,
	init:function(){
		this.createDoms();
		this.createSdArr();
		this.globalSdArr = JSON.parse(JSON.stringify(this.sdArr)); // 存储数独的初始状态
		this.blankNum =1;		
		this.drawCells();
		this.createBlank(this.blankNum);
		this.createBlankCells();
},
	solve:function(){
		this.createDoms();
		this.sdArr = JSON.parse(JSON.stringify(this.globalSdArr));
		this.drawCells();
	},
	createBackupSdArr: function() {
		this.backupSdArr = this.sdArr.slice();
	  },
	createSdArr:function(){
		//生成数独数组。
		var that = this;
		try{
			this.sdArr = [];
			this.setThird(2,2);
			this.setThird(5,5);
			this.setThird(8,8);
			var allNum = [1,2,3,4,5,6,7,8,9];
			outerfor:
			for(var i=1;i<=9;i++){
				innerfor:
				for(var j=1;j<=9;j++){
					if(this.sdArr[parseInt(i+''+j)]){
						continue innerfor;
					}
					var XArr = this.getXArr(j,this.sdArr);
					var YArr = this.getYArr(i,this.sdArr);
					var thArr = this.getThArr(i,j,this.sdArr);
					var arr = getConnect(getConnect(XArr,YArr),thArr);
					var ableArr = arrMinus(allNum,arr);
					if(ableArr.length == 0){
						this.createSdArr();
						return;
						break outerfor;
					}
					var item;
					//如果生成的重复了就重新生成。
					do{
						item = ableArr[getRandom(ableArr.length)-1];
					}while(($.inArray(item, arr)>-1));

					this.sdArr[parseInt(i+''+j)] = item;
				}
			}
			this.backupSdArr = this.sdArr.slice();
		}catch(e){
			//如果因为超出浏览器的栈限制出错，就重新运行。
			that.createSdArr();
		}
	},
	getXArr:function(j,sdArr){
		//获取所在行的值。
		var arr = [];
		for(var a =1;a<=9;a++){
			if(this.sdArr[parseInt(a+""+j)]){
				arr.push(sdArr[parseInt(a+""+j)])
			}
		}
		return arr;
	},
	getYArr:function(i,sdArr){
		//获取所在列的值。
		var arr = [];
		for(var a =1;a<=9;a++){
			if(sdArr[parseInt(i+''+a)]){
				arr.push(sdArr[parseInt(i+''+a)])
			}
		}
		return arr;
	},
	getThArr:function(i,j,sdArr){
		//获取所在三宫格的值。
		var arr = [];
		var cenNum = this.getTh(i,j);
		var thIndexArr = [cenNum-11,cenNum-1,cenNum+9,cenNum-10,cenNum,cenNum+10,cenNum-9,cenNum+1,cenNum+11];
		for(var a =0;a<9;a++){
			if(sdArr[thIndexArr[a]]){
				arr.push(sdArr[thIndexArr[a]]);
			}
		}
		return arr;
	},
	getTh:function(i,j){
		//获取所在三宫格的中间位坐标。
		var cenArr = [22,52,82,25,55,85,28,58,88];
		var index = (Math.ceil(j/3)-1) * 3 +Math.ceil(i/3) -1;
		var cenNum = cenArr[index];
		return cenNum;
	},
	setThird:function(i,j){
		//为对角线上的三个三宫格随机生成。
		var numArr = [1,2,3,4,5,6,7,8,9];
		var sortedNumArr= numArr.sort(function(){return Math.random()-0.5>0?-1:1});
		var cenNum = parseInt(i+''+j);
		var thIndexArr = [cenNum-11,cenNum-1,cenNum+9,cenNum-10,cenNum,cenNum+10,cenNum-9,cenNum+1,cenNum+11];
		for(var a=0;a<9;a++){
			this.sdArr[thIndexArr[a]] = sortedNumArr[a];
		}
	},
	drawCells:function(){
		//将生成的数组填写到九宫格
		for(var j =1;j<=9;j++){
			for(var i =1;i<=9;i++){					
				$(".sdli").eq(j-1).find(".sdspan").eq(i-1).html(this.sdArr[parseInt(i+''+j)]);
			}
		}
	},
	createBlank:function(num){
		//生成指定数量的空白格子的坐标。
		var blankArr = [];
		var numArr = [1,2,3,4,5,6,7,8,9];
		var item;
		for(var a =0;a<10+num*10;a++){
			do{
				item = parseInt(numArr[getRandom(9) -1] +''+ numArr[getRandom(9) -1]);
			}while($.inArray(item, blankArr)>-1);
			blankArr.push(item);
		}
		this.blankArr = blankArr;
	},
	createBlankCells:function(){
		//在创建好的数独中去除一部分格子的值，给用户自己填写。把对应格子变成可编辑,并添加事件。
		var blankArr = this.blankArr,len = this.blankArr.length,x,y,dom;
		for(var i =0;i<len;i++){
			x = parseInt(blankArr[i]/10);
			y = blankArr[i]%10;	
			dom = $(".sdli").eq(y-1).find(".sdspan").eq(x-1);
			dom.attr('contenteditable', true).html('').addClass('blankCell');		
			this.backupSdArr[blankArr[i]] = undefined;
		}
		$(".sdspan[contenteditable=true]").keyup(function(event) {
			var val = $(this).html();			
			var reStr = /^[1-9]{1}$/;
			if(!reStr.test(val)){
				$(this).html('');
			};
		});
	},
	checkRes:function(){
		//检测用户输入结果。检测前将输入加入数组。检测单个的时候将这一个的值缓存起来并从数组中删除，检测结束在赋值回去。
		var blankArr = this.blankArr,len = this.blankArr.length,x,y,dom,done,temp;
		this.getInputVals(this);
		this.errorArr.length = 0;
		for(var i =0;i<len;i++){
			x = parseInt(blankArr[i]/10);
			y = blankArr[i]%10;
			temp = this.backupSdArr[blankArr[i]];
			this.backupSdArr[blankArr[i]] = undefined;
			this.checkCell(x,y,this);
			this.backupSdArr[blankArr[i]] = temp;
		}
		done = this.isAllInputed(this);
		if(this.errorArr.length == 0 && done ){
			alert('恭喜你完成本轮游戏!');
			//$(".bg_red").removeClass('bg_red');
			showFireworksAnimation();
			$("#" + this.gridId + " .bg_red").removeClass('bg_red');
		}else{
			if(!done){
				alert("你没有完成本轮游戏，看看哪里错了吧！");
			}
			this.showErrors(this);
		}
	},
	checkCell:function(i,j,sd){
		//检测一个格子中输入的值，在横竖宫里是否已存在。
		var index = parseInt(i+''+j);
		var backupSdArr = this.backupSdArr;
		var XArr = this.getXArr(j,backupSdArr);
		var YArr = this.getYArr(i,backupSdArr);
		var thArr = this.getThArr(i,j,backupSdArr);
		var arr = getConnect(getConnect(XArr,YArr),thArr);			
		//var val = parseInt($(".sdli").eq(j-1).find(".sdspan").eq(i-1).html());
		var val = parseInt($("#" + sd.gridId + " .sdli").eq(j - 1).find(".sdspan").eq(i - 1).html());
		if($.inArray(val, arr)>-1){
			sd.errorArr.push(index);
			// 在特定数独中标红错误格子
			$("#" + sd.gridId + " .sdli").eq(j - 1).find(".sdspan").eq(i - 1).addClass('bg_red');
		}
	},
	getInputVals:function(sd){
		//将用户输入的结果添加到数组中。
		var blankArr = this.blankArr,len = this.blankArr.length,i,x,y,dom,theval;
		for(i=0;i<len;i++){
			x = parseInt(blankArr[i]/10);
			y = blankArr[i]%10;	
			dom =$("#" + sd.gridId + " .sdli").eq(y-1).find(".sdspan").eq(x-1);
			//dom = $(".sdli").eq(y-1).find(".sdspan").eq(x-1);
			theval = parseInt(dom.text())||undefined;
			this.backupSdArr[blankArr[i]] = theval;
		}
	},
	isAllInputed:function(sd){
		//检测是否全部空格都有输入。
		var blankArr = this.blankArr,len = this.blankArr.length,i,x,y,dom;
		for(i=0;i<len;i++){
			x = parseInt(blankArr[i]/10);
			y = blankArr[i]%10;	
			dom =$("#" + sd.gridId + " .sdli").eq(y-1).find(".sdspan").eq(x-1);
			if(dom.text()==''){
				return false
			}
		}
		return true;
	},
	showErrors:function(sd){
		//把错误显示出来。
		var errorArr = this.errorArr,len = this.errorArr.length,x,y,dom;
		$(".bg_red").removeClass('bg_red');
		for(var i =0;i<len;i++){
			x = parseInt(errorArr[i]/10);
			y = errorArr[i]%10;	
			dom =$("#" + sd.gridId + " .sdli").eq(y-1).find(".sdspan").eq(x-1);
			dom.addClass('bg_red');
		}
	},
	createDoms: function () {
		var gridId = this.gridId; // 获取数独的唯一标识
		var html = '<ul class="sd clearfix" id="' + gridId + '">';
		String.prototype.times = String.prototype.times || function (n) {
		  return (new Array(n + 1)).join(this);
		};
		html = html + ('<li class="sdli">' + '<span class="sdspan"></span>'.times(9) + '</li>').times(9) + '</ul>';
		$("body").prepend(html);
		var k;
		for (k = 0; k < 9; k++) {
		  $("#" + gridId + " .sdli:eq(" + k + ") .sdspan").eq(2).addClass('br');
		  $("#" + gridId + " .sdli:eq(" + k + ") .sdspan").eq(5).addClass('br');
		  $("#" + gridId + " .sdli:eq(" + k + ") .sdspan").eq(3).addClass('bl');
		  $("#" + gridId + " .sdli:eq(" + k + ") .sdspan").eq(6).addClass('bl');
		}
		$("#" + gridId + " .sdli:eq(2) .sdspan, #" + gridId + " .sdli:eq(5) .sdspan").addClass('bb');
		$("#" + gridId + " .sdli:eq(3) .sdspan, #" + gridId + " .sdli:eq(6) .sdspan").addClass('bt');
	  }
	  
}
//生成随机正整数
function getRandom(n){
	return Math.floor(Math.random()*n+1)
}
//两个简单数组的并集。
function getConnect(arr1,arr2){
	var i,len = arr1.length,resArr = arr2.slice();
	for(i=0;i<len;i++){
		if($.inArray(arr1[i], arr2)<0){
			resArr.push(arr1[i]);
		}
	}
	return resArr;
}
//两个简单数组差集，arr1为大数组
function　arrMinus(arr1,arr2){
	var resArr = [],len = arr1.length;
	for(var i=0;i<len;i++){
		if($.inArray(arr1[i], arr2)<0){
			resArr.push(arr1[i]);
		}
	}
	return resArr;
}
let initSudokus = [];
var num1=1,cnt=1;
async function generateSudokus() {
  let initPromises = [];  
  for (let i = 0; i < 9; i++) {	  
  initPromises.push(new Promise(resolve => {	
    let sd = new SD();
    sd.init();
	resolve(sd);
  }));
}
  initSudokus = await Promise.all(initPromises);
  console.log("After init:");
  initSudokus.forEach((sd, i) => {
  console.log(`Sudoku ${i}:`, sd.sdArr);
  });
  addEventListeners();  
}
  function addEventListeners() {
	for (let i = 0; i < 9; i++) {
	  let checkButton = document.getElementById(`check-button-${i + 1}`);
	  
	  checkButton.addEventListener('click', (function(index) {
		return function() {
		  initSudokus[index].checkRes();
		};
	  })(i));
	}
  } 
async function solveSudokus() {
  let solvePromises = [];
  for (let i = 0; i < 9; i++) {	  
  solvePromises.push(new Promise(resolve => {
    let sd = initSudokus[i];
    sd.solve();
    resolve(sd);
  }));
}
  let solvedSudokus = await Promise.all(solvePromises);
  console.log("After solve:");
  solvedSudokus.forEach((sd, i) => {
  console.log(`Sudoku ${i}:`, sd.sdArr); 
  });
}
window.onload = generateSudokus;  // 当页面加载完毕后，生成数独
//取按钮元素，并设置其点击事件
let solveButton = document.getElementById("solve-button");
solveButton.addEventListener("click", async function() {
	let ulElements = document.querySelectorAll("ul.sd.clearfix");
		ulElements.forEach(element => {
  		element.remove();
});
	let buttonElement = document.getElementById("solve-button");
	buttonElement.remove();
	solveSudokus();
});

