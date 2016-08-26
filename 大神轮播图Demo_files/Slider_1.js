// +----------------------------------------------------------------------
// | time:2016-7-7
// +----------------------------------------------------------------------
// | email:597089187@qq.com
// +----------------------------------------------------------------------
// | Author: yanjin
// +----------------------------------------------------------------------
var Lunbo = function(config){
      this.init(config);//配置变量 
      switch(this.play_type){
            case 'autoplay_left':         
                    this.autoplay_left();  
                    break;
            case 'autoplay_right':
                    this.autoplay_right();  
                    break;   
            case 'play_left':
                    this.play_left();  
                    break;
            case 'play_right':
                    this.play_right();  
                    break;    
            case 'lunbo_play':
                    this.lunbo_play();  
                    break;                                           
      }
}

Lunbo.prototype = {
      /****初始化****/
      init:function(config){
         	//外部容器
             this.container=config.container[0]&&typeof(config.container)=='object'?config.container:$(config.container);
             //滑动的盒子
             this.wraper=config.wraper[0]&&typeof(config.wraper)=='object'?config.wraper:$(config.wraper);
             //滑动的盒子的子类
             this.wraper_sub=config.wraper_sub[0]&&typeof(config.wraper_sub)=='object'?config.wraper_sub:$(config.wraper_sub);
             this.play_type=config.play_type?config.play_type:'autoplay_left';
             this.play_rate=config.play_rate;//自动播放时间间隔
             this.move_time=config.move_time;//每轮播一次所需时间
             this.distance=config.distance;//图片盒子之间的距离
             this.wraper_move= parseInt(this.wraper.css('left'));//滑动盒子当前的定位值(left)
             this.container_width=parseInt(this.container.css('width'));//外部容器的宽度
             this.total_w=parseInt(this.wraper.css('width'));//包住所有图片的盒子的总宽度
             this.play_one=config.play_one;//轮播一次执行的回调函数
             this.play_end=config.play_end;//轮播一轮结束执行的回调函数
             this.play_one_autocode=config.play_one_autocode;//轮播一次执行的回调函数(自定义代码)
             //当前轮播到第几张(默认第1张)
             this.picture_num=config.picture_num!=undefined?config.picture_num:Math.abs(this.wraper_move/this.container_width);
             this.picture_numbers=config.picture_numbers?picture_numbers:parseInt(this.total_w/this.container_width);//图片总数量
             this.manual_play_one=config.manual_play_one||'';//手动轮播后的回调函数           
             this.move_start=0;//第一张图片的left值;
             this.move_end=this.total_w-this.container_width;//轮播到最后一张图片的left值;
             this.special_effect_type=config.special_effect_type!=undefined?config.special_effect_type:'3';//轮播类型(默认第三种无缝滚动)
             this.playState=false;//当前轮播状态
             //第三种特效无缝滚动处理
             if(this.special_effect_type==3){
                  this.move_start=-this.container_width;//重新设置第一张图片的left值;
                  this.move_end=this.total_w;//重新设置最后一张图片的left值;
                  this.appendhtml();//追加元素
                  this.set_css();//
             }
      },
      /* *
       * 自适应轮播图 屏幕尺寸改变时调用函数
       * 浏览器大小改变时 宽度也会变化 此时应该重新调整 wraper_move,total_w,left等值
       * 调整之前 先要清除当前动作
       * */
      resize:function(){
             this.rolltimer_clear();//清除定时器
             this.container_width=parseInt(this.container.css('width'));//重新获取外部容器的宽度                  
             if(this.special_effect_type==3){
                   this.total_w=parseInt(this.wraper.css('width'))+2*this.container_width;//重新计算包住所有图片的盒子的总宽度  
                   this.wraper_move=-(this.picture_num+1)*this.container_width;
                   this.move_start=-this.container_width;//重新计算第一张图片的left值;
                   this.move_end=parseInt(this.wraper.css('width'));//重新计算轮播到最后一张图片的left值;
             }else{
                   this.total_w=parseInt(this.wraper.css('width'));//包住所有图片的盒子的总宽度  
                   this.wraper_move=-this.picture_num*this.container_width;
                   this.move_start=0;//第一张图片的left值;
                   this.move_end=this.total_w-this.container_width;//轮播到最后一张图片的left值;
             }
             this.wraper.css('width',this.total_w+'px'); 
             this.wraper.css('left',this.wraper_move);
             this[this.play_type]();//继续轮播
      },
      /*动态设置样式(无缝轮播)*/
      set_css:function(){  
             this.total_w=parseInt(this.wraper.css('width'))+2*this.container_width;//包住所有图片的盒子的总宽度
             this.wraper.css('width',this.total_w+'px'); 
             this.wraper_move=-this.container_width;
             this.wraper.css('left',this.wraper_move);
      },
      /*****追加元素显示特效(无缝轮播)*******/
      appendhtml:function(){         
             this.wraper.append(this.wraper_sub.eq(0).clone(true));//向尾部追加头部元素
             this.wraper.prepend(this.wraper_sub.eq(this.picture_numbers-1).clone(true));//向头部追加最后一个元素
      },
      /****清除定时器****/
      rolltimer_clear:function(){    
            this.playState=false;    
            clearInterval(this.timer);                                        
      },
      /****轮播一次执行的函数(自定义代码)****/
      execute_autocode:function(){
           var eval_code=this.play_one_autocode.auto_code;
           eval(eval_code);
      },
      /*****轮播开始执行*****/
      lunbo_play:function(lunbo_play_callback){      
          var _this=this;
          this.wraper_move=this.special_effect_type==3?-(this.picture_num+1)*this.container_width:-this.picture_num*this.container_width;            
          this.wraper.stop().animate({'left':this.wraper_move+this.distance},this.move_time,function(){
               _this.playState=false;
          });//滑动 
          if(this.play_one!=undefined){
                this.play_one(this.picture_num);//执行轮播一次执行的函数 
          }
          if(lunbo_play_callback){
                lunbo_play_callback(this.picture_num);
          }
      },
      move:function(number){
              this.picture_num=number;
              this.wraper_move=-(this.picture_num+1)*this.container_width;
              this.wraper.css('left',this.wraper_move);
      },
      /*****轮播最后一张到第一张效果*****/
      lunbo_start_end:function(){
           var _this=this;
          if(this.special_effect_type==1){
              this.wraper_move=0;
              this.picture_num=0;   
              this.wraper.css('left',this.wraper_move);//滑动                                      
              if(this.play_end!=undefined){
                     this.play_end();//执行轮播一轮结束执行的函数 
              }            
               this.playState=false;
          }else
          if(this.special_effect_type==2){
              this.wraper_move=0;
              this.picture_num=0;   
              this.wraper.stop().animate({'left':this.wraper_move+this.distance},this.move_time,function(){
                _this.playState=false;
              });//滑动                                     
              if(this.play_end!=undefined){
                    this.play_end();//执行轮播一轮结束执行的函数 
              }  
          }else
          if(this.special_effect_type==3){
              this.picture_num++; 
              this.wraper_move=-(this.picture_num+1)*this.container_width;              
              this.wraper.stop().animate({'left':this.wraper_move+this.distance},this.move_time,function(){                  
                  _this.wraper_move=-_this.container_width;
                  _this.wraper.css('left',_this.wraper_move);
                  _this.playState=false;
              });
              this.picture_num=0;
          }
          if(this.play_one!=undefined){
               this.play_one(this.picture_num);//执行轮播一次执行的回调函数 
          }
      },
      /*****轮播第一张到最后一张效果*****/
      lunbo_end_start:function(){
          if(this.special_effect_type==1){
              this.wraper_move=-this.move_end;   
              this.picture_num=this.picture_numbers-1;   
              this.wraper.css('left',this.wraper_move);//滑动                                      
              if(this.play_end!=undefined){
                    this.play_end();//执行轮播一轮结束执行的函数 
              }            
              this.playState=false;
          }else
          if(this.special_effect_type==2){
              this.wraper_move=-this.move_end;   
              this.picture_num=this.picture_numbers-1;   
              this.wraper.stop().animate({'left':this.wraper_move+this.distance},this.move_time,function(){
                    _this.playState=false;
              });//滑动                                    
              if(this.play_end!=undefined){
                  this.play_end();//执行轮播一轮结束执行的函数 
              }  
          }else
          if(this.special_effect_type==3){               
              var _this=this;      
              this.wraper.stop().animate({'left':0},this.move_time,function(){                  
                  _this.wraper_move=-(_this.total_w-_this.container_width*2);
                  _this.wraper.css('left',_this.wraper_move);
                  _this.playState=false;
              });
              this.picture_num=this.picture_numbers-1;
          }
          if(this.play_one!=undefined){
                  this.play_one(this.picture_num);//执行轮播一次执行的函数 
          }
      },
      /****左轮播****/
      move_left: function(){
         //当前轮播暂未完成 无法进行下次轮播       
         if(!this.playState){  
                this.playState=true;           
               if(Math.abs(this.wraper_move)>=this.move_end){
                      this.lunbo_start_end(); //最后一张图片到第一张图片处理                           
                }else{  
                      this.picture_num++;  
                      this.lunbo_play();//滑动开始                                  
                }                            
                this.execute_autocode(); 
         }   
     },
     /****右轮播****/
     move_right: function(){
         //当前轮播暂未完成 无法进行下次轮播
         if(!this.playState){
             this.playState=true;    
             if(this.wraper_move>=this.move_start){                    
                  this.lunbo_end_start();//第一张图片到最后一张图片处理         
             }else{               
                  this.picture_num--;
                  this.lunbo_play();//滑动开始   
             }  
             this.execute_autocode();
          }
     },
     /****自动左轮播****/
     autoplay_left:function(){  
          var This=this;
          var time= this.play_rate;   
          t=setInterval(function(){
              This.move_left();
          },time);   
          this.timer=t;    
     },
     /****自动右轮播****/
     autoplay_right:function(){   
          var This=this;
          var time=this.play_rate;     
          t=setInterval(function(){                            
              This.move_right();
          },time);  
          this.timer=t;
     },
     //手动左轮播
     play_left:function(){  
          var This=this;  
          This.move_left();
          if(this.manual_play_one){
              this.manual_play_one(this.picture_num);
          }                     
     },
     //手动右轮播
     play_right:function(){
          var This=this;   
          This.move_right();
          if(this.manual_play_one){
                this.manual_play_one(this.picture_num);
          }    
     }
}	

/*获取浏览器属性*/ 
getOs = function(options){
     var OsObject = ""; 
     var browser=new Array();
     if(isIE = navigator.userAgent.indexOf("MSIE")!=-1){  
       browser['width']=$(document.body).width();
       browser['height']=$(document.body).height();
       browser['type']="MSIE";
       return browser; 
     } 
     if(isFirefox=navigator.userAgent.indexOf("Firefox")!=-1){ 
       browser['width']=screen.width;
       browser['height']=screen.height;
       browser['type']="Firefox";
       return browser;         
     } 
     if(isChrome=navigator.userAgent.indexOf("Chrome")!=-1){ 
       browser['width']=$(document.body).width();
       browser['height']=$(document.body).height();
       browser['type']="Chrome";
       return browser; 
     } 
     if(isSafari=navigator.userAgent.indexOf("Safari")!=-1){ 
       browser['width']=$(document.body).width();
       browser['height']=$(document.body).height();
       browser['type']="Safari";
       return browser; 
     }  
     if(isOpera=navigator.userAgent.indexOf("Opera")!=-1){ 
       browser['width']=$(document.body).width();
       browser['height']=$(document.body).height();
       browser['type']="Opera";
       return browser; 
     } 
  }