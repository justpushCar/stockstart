
/*
 *显示部分
 */
var Apink = (function(apink){
     /***控制显示的位置***/
     apink.set_html=function(){
            var w=this.width+this.picture_width;
            var h=this.height+this.picture_height;
            $(this.canvas).attr('width',w);
            $(this.canvas).attr('height',h);
            $("#main .game").css({'width':w+'px','height':h+150+'px'});
            $("#main .game .content").css({'width':w+'px','height':h+'px'});
            $("#main .game .time").css('width',w-this.picture_width+'px');
            $("#main .game .text").css('width',w-this.picture_width/2+'px');
            $("#main .game .caozuo").css('width',w-this.picture_width/2+'px');
            //控制画布的位置
            var main_h=parseInt($("#main").css('height'));
            var w=parseInt($("#wraper").css('width'));
            var w_=parseInt($("#main").css('width'));
            var m_l=(w-w_)/2>0?(w-w_)/2:0;
            var h=document.documentElement.clientHeight
            var m_t=(h-main_h)/2;
            if(m_t>=0){
                 $("#main").css('margin-top',m_t+'px');
                 $("#main #content").css('margin-left',m_l+'px');
                 var w_h=h;
            }else{
            	var w_h=main_h;
            }
            $("#wraper").css('height',w_h+'px');
            //控制加载进度条的位置
            var loading_h=parseInt($("#loading .loading_show").css('height'));
            var m_t=(h-loading_h)/2;
            if(m_t>=0){
                 $("#loading .loading_show").css('margin-top',m_t+'px');
            }
           $(this.container+" .picture_number").text('剩余图片:'+this.apink_picture_number);
           $(this.container+" .sy_time").text('剩余时间:'+this.times*1000+'ms');
           $(this.container+" .score").text('统计得分:'+this.score);
     };
     /***设置背景图片***/
     apink.set_background=function(){
           _this=this;
           var k=parseInt(1*Math.random());
           //$("#wraper").css('background-image',"url("+_this.background_img[k]+")");
           $(".bk_img").attr('src',_this.background_img[k]);
           setInterval(function(){
                  var k=parseInt(1*Math.random());
                  $(".bk_img").attr('src',_this.background_img[k]);
           },150000)
     };
     /*加载数据时显示加载进度*/
     apink.loading=function(){
           var total_picture_number=this.apink_picture_number+this.special_effect_picture.length;
           var width=800/total_picture_number;//每张图片进度条占据的宽度
           $("#loading .loading_show p").css('width',this.loading_picture_number*width+'px');
           //保留一位小数显示时间百分比
           var text=parseInt(this.loading_picture_number/total_picture_number*100*10)/10;
           $("#loading .loading_show span").text('数据加载中:'+text+'%');
            //加载完成
            if(total_picture_number==this.loading_picture_number){
                  $("#loading").css('display','none');
            }
     };
     /*图片消除时特效*/
     apink.clear_show=function(p1,p2){
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
    apink.add_picture_special_effect=function(p){
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
    apink.clear_picture_special_effect=function(p){
              var cxt=this.cxt;
              var key=this.get_apink_data_key(p);//获取坐标在数组的索引       
              cxt.drawImage(this.img_obj[this.Apink_data[key].key],p.x,p.y,this.picture_width,this.picture_height);
    };
     /*显示时间进度条*/
    apink.set_timer=function(){
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
     return apink;
}(Apink || {}));


var Apink_picture=[
                     [
                            {'key':'ChoRong1','img':'public/images/Apink_1/ChoRong1.jpg'},
                            {'key':'ChoRong2','img':'public/images/Apink_1/ChoRong2.jpg'},
                            {'key':'ChoRong3','img':'public/images/Apink_1/ChoRong3.jpg'},
                            {'key':'BoMi1','img':'public/images/Apink_1/BoMi1.jpg'},
                            {'key':'BoMi2','img':'public/images/Apink_1/BoMi2.jpg'},
                            {'key':'BoMi3','img':'public/images/Apink_1/BoMi3.jpg'},
                            {'key':'BoMi4','img':'public/images/Apink_1/BoMi4.jpg'},
                            {'key':'EunJi1','img':'public/images/Apink_1/EunJi1.jpg'},
                            {'key':'NaEun1','img':'public/images/Apink_1/NaEun1.jpg'},
                            {'key':'NaEun2','img':'public/images/Apink_1/NaEun2.jpg'},
                            {'key':'NamJoo1','img':'public/images/Apink_1/NamJoo1.jpg'},
                            {'key':'HaYoung1','img':'public/images/Apink_1/HaYoung1.jpg'},
                            {'key':'HaYoung2','img':'public/images/Apink_1/HaYoung2.jpg'},
                            {'key':'Apink1','img':'public/images/Apink_1/Apink1.jpg'},
                            {'key':'Apink2','img':'public/images/Apink_1/Apink2.jpg'},
                      ],
                      [
                            {'key':'ChoRong1','img':'public/images/Apink_2/ChoRong1.jpg'},
                            {'key':'ChoRong2','img':'public/images/Apink_2/ChoRong2.jpg'},
                            {'key':'ChoRong3','img':'public/images/Apink_2/ChoRong3.jpg'},
                            {'key':'ChoRong4','img':'public/images/Apink_2/ChoRong4.jpg'},
                            {'key':'BoMi1','img':'public/images/Apink_2/BoMi1.jpg'},
                            {'key':'BoMi2','img':'public/images/Apink_2/BoMi2.jpg'},
                            {'key':'BoMi3','img':'public/images/Apink_2/BoMi3.jpg'},
                            {'key':'EunJi1','img':'public/images/Apink_2/EunJi1.jpg'},
                            {'key':'EunJi2','img':'public/images/Apink_2/EunJi2.jpg'},
                            {'key':'EunJi3','img':'public/images/Apink_2/EunJi3.jpg'},
                            {'key':'NaEun1','img':'public/images/Apink_2/NaEun1.jpg'},
                            {'key':'NaEun2','img':'public/images/Apink_2/NaEun2.jpg'},
                            {'key':'NaEun3','img':'public/images/Apink_2/NaEun3.jpg'},
                            {'key':'NamJoo1','img':'public/images/Apink_2/NamJoo1.jpg'},
                            {'key':'NamJoo2','img':'public/images/Apink_2/NamJoo2.jpg'},
                            {'key':'HaYoung1','img':'public/images/Apink_2/HaYoung1.jpg'},
                            {'key':'HaYoung2','img':'public/images/Apink_2/HaYoung2.jpg'},
                            {'key':'HaYoung3','img':'public/images/Apink_2/HaYoung3.jpg'},
                            {'key':'Apink1','img':'public/images/Apink_2/Apink1.jpg'},
                            {'key':'Apink2','img':'public/images/Apink_2/Apink2.jpg'},                  
                     ],
                     [
                            {'key':'ChoRong1','img':'public/images/Apink_3/ChoRong1.jpg'},
                            {'key':'ChoRong2','img':'public/images/Apink_3/ChoRong2.jpg'},
                            {'key':'ChoRong3','img':'public/images/Apink_3/ChoRong3.jpg'},
                            {'key':'BoMi1','img':'public/images/Apink_3/BoMi1.jpg'},
                            {'key':'BoMi2','img':'public/images/Apink_3/BoMi2.jpg'},
                            {'key':'BoMi3','img':'public/images/Apink_3/BoMi3.jpg'},
                            {'key':'EunJi1','img':'public/images/Apink_3/EunJi1.jpg'},
                            {'key':'EunJi2','img':'public/images/Apink_3/EunJi2.jpg'},
                            {'key':'EunJi3','img':'public/images/Apink_3/EunJi3.jpg'},
                            {'key':'NaEun1','img':'public/images/Apink_3/NaEun1.jpg'},
                            {'key':'NaEun2','img':'public/images/Apink_3/NaEun2.jpg'},
                            {'key':'NaEun3','img':'public/images/Apink_3/NaEun3.jpg'},
                            {'key':'NamJoo1','img':'public/images/Apink_3/NamJoo1.jpg'},
                            {'key':'NamJoo2','img':'public/images/Apink_3/NamJoo2.jpg'},
                            {'key':'NamJoo3','img':'public/images/Apink_3/NamJoo3.jpg'},
                            {'key':'HaYoung1','img':'public/images/Apink_3/HaYoung1.jpg'},
                            {'key':'HaYoung2','img':'public/images/Apink_3/HaYoung2.jpg'},                
                     ]
             ];
var windows_w=$(document.body).width();    
if(windows_w<1400){
    var width=600+50;
    var height=500+50;
    var picture_width=50;
    var picture_height=50;
}else{
    var width=720+60;
    var height=600+60;
    var picture_width=60;
    var picture_height=60;
}     
var data_config={
          width:width,
          height:height,
          picture_width:picture_width,
          picture_height:picture_height,
          special_effect_picture:[
                 {'img':'public/images/tx/1.png'}, 
                 {'img':'public/images/tx/2.png'},
                 {'img':'public/images/tx/3.png'},
                 {'img':'public/images/tx/4.png'},
                 {'img':'public/images/tx/5.png'},
                 {'img':'public/images/tx/6.png'},
                 {'img':'public/images/tx/7.png'},
          ],
          background_img:[
                 'public/images/background/background_Apink.jpg',
                 'public/images/background/background_ChoRong.jpg'
          ],
          Apink_picture:Apink_picture             
}            
data_config.id='myCanvas1';
data_config.container='.game_1';
