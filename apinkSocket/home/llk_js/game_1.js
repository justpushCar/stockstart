/*
 *游戏初始化部分(对手)
 */
var Apink_1 = (function(apink_1){
	 apink_1.run=function(config){             
           this.config(config);//配置游戏基础数据
           this.set_html();
           this.loading_special_effect();//加载特效图片后运行初始函数             
     };
     /***初始运行***/
     apink_1.init=function(){         
           if(this.get_error()){
              alert(this.get_error());
           }
           this.create_table_data();//创建画布坐标系 
           this.create_game_data();//创建游戏坐标 
           //this.create_apink_data();//生成需要显示的数据
           this.loading_img();//先加载需要显示的图片  
           this.set_timer();//游戏开始,设置计时器
     };
     /***基础数据***/
     apink_1.config=function(config){           
           var canvas=document.getElementById(config.id);//输出canvas画布
           this.container=config.container;
           this.canvas=canvas;
           this.cxt=canvas.getContext('2d');         
           /*特效及背景图片相关*/
           this.background_img=config.background_img;//背景图片
           this.special_effect_picture=config.special_effect_picture;//消除时的特效图片
           this.special_effect_canvas=[];//保存显示特效的画布
           this.line=[];//记录相通的连线
           /*游戏数据相关*/
           this.Apink_base_data=config.Apink_picture;//参与游戏的图片                   
           var key=config.picture_key?config.picture_key:parseInt((this.Apink_base_data.length)*Math.random());
           this.Apink_picture=this.Apink_base_data[key];//随机抽取一组图片
           this.table_data=new Array();//全局画布的坐标系
           this.game_data=new Array();//全局显示图片的坐标
           this.Apink_data=config.Apink_data;//保存图片数据
           this.picture_width=config.picture_width;//图片长度
           this.picture_height=config.picture_height;//图片宽度
           this.width=config.width-this.picture_width;//显示图像的画布宽(预留宽度便于显示连线)
           this.height=config.height-this.picture_height;//显示图像的画布高(预留高度便于显示连线)
           this.column=this.width/this.picture_width;//画布最大列
           this.row=this.height/this.picture_height;//画布最大行
           this.click_position=[{p:{x:'',y:''}},{p:{x:'',y:''}}];//保存点击时的坐标
           this.score=0;//得分          
           this.game_difficulty=config.game_lv?config.game_lv:4;//parseInt(5*Math.random());//当前游戏难度
           this.difficulty_config=this.difficulty_config();
           this.set_game_difficulty();//配置难度
           this.picture_array=this.get_picture_array();
           this.help_point=[{x:'',y:''},{x:'',y:''}];//记录提示的坐标         
           this.loading_picture_number=0;//已经加载的图片数量         
           this.error='';
           this.img_obj=new Object();
     };
     /***游戏难度***/
     apink_1.set_game_difficulty=function(){
           var difficulty_config=this.difficulty_config;
           var key=this.game_difficulty;
           this.times=difficulty_config[key].times;//游戏初始时间s
           this.apink_picture_number=difficulty_config[key].apink_picture_number;//图片数量
           this.picture_score=difficulty_config[key].picture_score;//每张图片分数
     };
     /***游戏难度默认配置***/
     apink_1.difficulty_config=function(){
           var difficulty_config=[
                   {
                             'times':40,
                             'apink_picture_number':36,
                             'picture_score':10,                 
                    },
                    {
                             'times':35,
                             'apink_picture_number':64,
                             'picture_score':15,                          
                    },
                    {
                             'times':30,
                             'apink_picture_number':80,
                             'picture_score':20,                          
                    },
                    {
                             'times':25,
                             'apink_picture_number':96,
                             'picture_score':30,                          
                    },
                    {
                             'times':25,
                             'apink_picture_number':120,
                             'picture_score':30,                          
                    }
            ]
            return difficulty_config;
     };
     /*错误提示*/
     apink_1.get_error=function(){
            return this.error;
     };
     /*得分处理*/
     apink_1.get_score=function(){

     };
     /***生成需要显示的图片数据***/
     apink_1.create_apink_data=function(){
    	                 
     };
     /***创建显示图像的画布坐标系***/
     apink_1.create_table_data=function(){
           table_data=this.table_data;
           width=this.picture_width;
           height=this.picture_height;
           for(x=0;x<this.width;x=x+width){
                for(y=0;y<this.height;y=y+height){
                      node={'x':x+this.picture_width/2,'y':y+this.picture_height/2};
                      table_data.push(node);
                }               
           }
           this.table_data=table_data;         
     };
     /***根据图片数量获取最佳的图片排列***/
     apink_1.get_picture_array=function(){
           var column=this.column;//最大列
           var row=this.row;//最大行
           /*根据图片数量以及画布的宽高度 获取最佳的图片排列*/
           var t=100;
           for(var i=1;i<this.apink_picture_number;i++){
                 for(var j=i;j<this.apink_picture_number;j++){                                       
                      if(i*j==this.apink_picture_number&&i<=row&&j<=column){
                             s=j-i;                            
                             if(s<t){
                                  var picture_array={r:i,c:j};
                                  t=s;
                             }
                      }
                 }
           }          
           if(typeof(picture_array)=='undefined'){
                 this.error='图片数量配置不正确';
           } 
           return picture_array;
     };
     /***根据图片排列创建显示图片的坐标集***/
     apink_1.create_game_data=function(){
           var column=this.column;//最大列
           var row=this.row;//最大行
           var picture_array=this.picture_array;
           /*根据排列状态获取坐标*/
           var table_data=new Array();
           //最左上角坐标
           var o={x:parseInt((column-picture_array.c)/2)*this.picture_width,y:parseInt((row-picture_array.r)/2)*this.picture_height};
           for(var i=0;i<this.apink_picture_number;i++){
                 var k_x=i-parseInt(i/picture_array.c)*picture_array.c;
                 var k_y=parseInt(i/picture_array.c);
                 table_data[i]={x:o.x+k_x*this.picture_width+this.picture_width/2,y:o.y+k_y*this.picture_height+this.picture_height/2};               
           }
           this.game_data=table_data;
     };
     /***显示图片***/
     apink_1.show_apink_img=function(){         
          var apink=this.Apink_data;
          var cxt= this.cxt;  
          width=this.picture_width;
          height=this.picture_height;
          for(i=0;i<120;i++){
              if(apink[i].img!=''&&apink[i].flag==1){
                  cxt.drawImage(this.img_obj[apink[i].key],apink[i].x,apink[i].y,width,height);
              }           
          }
     };
     return apink_1;
}(Apink_1 || {}));

/*
 *加载图片数据部分
 */
var Apink_1 = (function(apink_1){
     /***加载消除时的特效图片***/
	apink_1.loading_special_effect=function(){
          var _this=this;
          var special_effect_picture=this.special_effect_picture;                   
          var i=0;
          var number=this.special_effect_picture.length;
          special_effect_loading(i);
          function special_effect_loading(i){
                  if(i<number){
                            var img=new Image();
                            img.src=special_effect_picture[i].img;//加载图片                       
                            img.onload=function(){                 
                                   special_effect_picture[i].img_obj=img;//加载完成保存图片对象用于显示                                            
                                   i++; 
                                   _this.loading_picture_number++;
                                   special_effect_loading(i);
                            }                            
                  }
                  if(i==number){
                          _this.special_effect_picture=special_effect_picture;
                          _this.init();//运行初始函数
                  }
           }
     };
     /***先加载需要显示的图片***/
     apink_1.loading_img=function(){
          var _this=this;
          var apink=this.Apink_data;                  
          var i=0;
          var apink_picture_number=this.apink_picture_number;
          loading(i);
          function loading(i){
                  if(i<120){
                          if(apink[i].img!=''){
                                    var img=new Image();
                                    img.src=apink[i].img;//加载图片                       
                                    img.onload=function(){                 
                                    	   _this.img_obj[apink[i].key]=img;//加载完成保存图片对象用于显示                                            
                                           i++; 
                                           _this.loading_picture_number++;                                           
                                           loading(i);
                                    }
                          }else{
                                i++; 
                                loading(i);
                          }
                  }
                  if(i==120){
                        _this.Apink_data=apink;                             
                        _this.show_apink_img();//显示图片
                  }
          }
     };
     return  apink_1;
}(Apink_1 || {}));

/*
 *消除条件逻辑部分
 */
var Apink_1 = (function(apink_1){
      /***重新组合排列***/
      apink_1.afresh_assemble=function(data){
               //复制界面坐标数据
               var table_data=new Array();
               for(var i=0;i<this.game_data.length;i++){
                     table_data[i]={'x':this.game_data[i].x,'y':this.game_data[i].y};
               }
               //先清空已经绘制的区域
               for(i=0;i<this.Apink_data.length;i++){
                      if(this.Apink_data[i].flag==1){
                            this.cxt.clearRect(this.Apink_data[i].x,this.Apink_data[i].y,this.picture_width,this.picture_height);
                      }           
               }
               this.Apink_data=data; 
               this.show_apink_img();//重新显示图片
      };
      /***获取坐标在数组中的下标索引***/
      apink_1.get_apink_data_key=function(p){
           var key=((p.y-this.picture_height/2)/this.picture_height)*(this.width/this.picture_width)+(p.x-this.picture_width/2)/this.picture_width;
           return key;
      };
      return apink_1;
}(Apink_1 || {}));

/*
 *显示部分
 */
var Apink_1 = (function(apink_1){
     /***控制显示的位置***/
	apink_1.set_html=function(){        
           $(this.container+" .picture_number").text('剩余图片:'+this.apink_picture_number);
           $(this.container+" .sy_time").text('剩余时间:'+this.times*1000+'ms');
           $(this.container+" .score").text('统计得分:'+this.score);
     };
     /*图片消除时特效*/
     apink_1.clear_show=function(p1,p2){
    	     //清除显示的图片
	         this.cxt.clearRect(p1.x,p1.y,this.picture_width,this.picture_height);
	         this.cxt.clearRect(p2.x,p2.y,this.picture_width,this.picture_height);
             /*连线效果*/ 
             //动态生成画布用来显示连线(动态生成为了防止各连线动画互不干扰)  
             var num=this.special_effect_canvas.length;
             var htm="<canvas class='canvas special_effect_canvas"+num+"' width='1050' height='630'></canvas>";       
             $(".content").append(htm);
             var special_effect_cxt=$('.special_effect_canvas'+num)[0].getContext('2d');
             this.special_effect_canvas.unshift({cxt:special_effect_cxt,class_name:'special_effect_canvas'+num});
             //获取显示连线的画布对象
             var special_effect_cxt=this.special_effect_canvas[0].cxt;
             var line=this.line;//获取连线路径  
             //连线路径处理           
             for(var i=0;i<line.length;i++){
                      if(line[i][0].y<0){
                           line[i][0].y+=this.picture_height/2;
                      }
                      if(line[i][1].y<0){
                           line[i][1].y+=this.picture_height/2;
                      }
                      if(line[i][0].y>this.height+this.picture_height){
                           line[i][0].y-=this.picture_height/2;
                      }
                      if(line[i][1].y>this.height+this.picture_height){
                           line[i][1].y-=this.picture_height/2;
                      }
                      if(line[i][0].x<0){
                           line[i][0].x+=this.picture_width/2;
                      }
                      if(line[i][1].x<0){
                           line[i][1].x+=this.picture_width/2;
                      }

             }
             for(var i=0;i<line.length;i++){
                   special_effect_cxt.beginPath();
                   special_effect_cxt.moveTo(line[i][0].x,line[i][0].y);
                   special_effect_cxt.lineTo(line[i][1].x,line[i][1].y);
                   special_effect_cxt.lineWidth = 2; //边框宽
                   special_effect_cxt.strokeStyle = 'red';//边框颜色
                   special_effect_cxt.lineJoin="round";
                   special_effect_cxt.stroke();  
                   special_effect_cxt.closePath();
             }      
             this.line=[];//路径清空
             /*图片消失效果*/
             var _this=this;
             var i=0;
             this.cxt.drawImage(this.special_effect_picture[i].img_obj,p1.x,p1.y,_this.picture_width,this.picture_height);
             this.cxt.drawImage(this.special_effect_picture[i].img_obj,p2.x,p2.y,_this.picture_width,this.picture_height);
             i++;
             var tx_timer=setInterval(function(){
                   if(i<7){
                        _this.cxt.drawImage(_this.special_effect_picture[i].img_obj,p1.x,p1.y,_this.picture_width,_this.picture_height);
                        _this.cxt.drawImage(_this.special_effect_picture[i].img_obj,p2.x,p2.y,_this.picture_width,_this.picture_height);
                        i++;
                   }else{
                         _this.cxt.clearRect(p1.x,p1.y,_this.picture_width,_this.picture_height);
                         _this.cxt.clearRect(p2.x,p2.y,_this.picture_width,_this.picture_height);
                         var special_effect_canvas=_this.special_effect_canvas.pop();
                         $('.'+special_effect_canvas.class_name).remove();                        
                         clearInterval(tx_timer);
                   }
             },180)
     };
    /*点击图片时给图片加个效果*/
    apink_1.add_picture_special_effect=function(p){
              var cxt=this.cxt;
              cxt.beginPath(); 
              cxt.moveTo(p.x+2,p.y+2);
              cxt.lineTo(p.x-2+this.picture_width,p.y+2);
              cxt.lineTo(p.x-2+this.picture_width,p.y+this.picture_height-2);
              cxt.lineTo(p.x+2,p.y+this.picture_height-2);
              cxt.lineTo(p.x+2,p.y+2);
              cxt.closePath();//闭合路径 
              cxt.lineWidth = 4; //边框宽
              cxt.strokeStyle = 'rgba(255,192,203,1)';//边框颜色
              cxt.lineJoin="round";
              cxt.stroke();  
    };
     /*清除图片上的效果(重绘图片)*/
    apink_1.clear_picture_special_effect=function(p){
              var cxt=this.cxt;
              var key=this.get_apink_data_key(p);//获取坐标在数组的索引 
              cxt.drawImage(this.img_obj[this.Apink_data[key]],p.x,p.y,this.picture_width,this.picture_height);
    };
     /*显示时间进度条*/
    apink_1.set_timer=function(){
              var _this=this;
              requestAnimationFrame = window.requestAnimationFrame
                  || window.mozRequestAnimationFrame
                  || window.webkitRequestAnimationFrame
                  || window.msRequestAnimationFrame
                  || window.oRequestAnimationFrame
                  || function(callback){
                         setTimeout(callback,1000 / 60);
                    };   
              var now;
              var fps = 50;//帧(1s内重绘次数)
              var interval =1000/fps;//(重绘一次时间); 
              var then=0;
              var delta;
              var width=(this.width-this.picture_width)/this.times;//进度条平均每绘制一次减少宽度
              var times=this.times;
              requestAnimationFrame(play);
              function play(){
                        requestAnimationFrame(play);
                        now = Date.now();
                        delta = now - then;
    　                if(delta>=interval){
                              if(_this.times>0){
                                       $(_this.container+" .time p").css('width',_this.times*width+'px');
                                       _this.times-=interval/1000;
                                       _this.times=_this.times>0?_this.times:0;
                                       var time_text_show=parseInt(_this.times*1000);
                                       $(_this.container+" .sy_time").text('剩余时间:'+time_text_show+'ms');//更新时间显示
                                       var time_jdt_show=parseInt(_this.times*1000/(times*1000)*100*10)/10//保留一位小数显示时间百分比
                                       $(_this.container+" .time span").eq(0).text(time_jdt_show+'%');
                               }else{
                                       $(_this.container+" .time p").css('height',0+'px');
                               } 
    　　　　           then = now;
                        }     
                        //时间到了并且还有图片 游戏结束
                        if(_this.times<=0&&this.apink_picture_number){
                               /*   alert('game over');
                                  window.location.reload();*/
                        }                                   
              }     
     };
     return apink_1;
}(Apink_1 || {}));