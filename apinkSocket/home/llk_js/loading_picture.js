/*
 *加载图片数据部分
 */
var Apink = (function(apink){
     /***加载消除时的特效图片***/
     apink.loading_special_effect=function(){
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
                                   _this.loading();//显示加载进度
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
     apink.loading_img=function(){
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
                                           _this.loading();//显示加载进度
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
     return  apink;
}(Apink || {}));
