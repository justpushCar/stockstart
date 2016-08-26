/*
 *游戏初始化部分
 */
var Apink = (function(apink){
     apink.run=function(config){             
           this.config(config);//配置游戏基础数据
           this.set_html();
           this.loading_special_effect();//加载特效图片后运行初始函数             
     };
     /***初始运行***/
     apink.init=function(){         
           if(this.get_error()){
              alert(this.get_error());
           }
           this.set_background();//设置背景
           this.set_EventListener();//监听事件
           this.create_table_data();//创建画布坐标系 
           this.create_game_data();//创建游戏坐标 
           this.create_apink_data();//生成需要显示的数据
           this.loading_img();//先加载需要显示的图片  
           this.set_timer();//游戏开始,设置计时器
     };
     /***基础数据***/
     apink.config=function(config){           
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
           this.Apink_data=new Array();//保存图片数据
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
           this.picture_array=this.get_picture_array();//根据图片数量获取最佳的图片排列
           this.help_point=[{x:'',y:''},{x:'',y:''}];//记录提示的坐标         
           this.loading_picture_number=0;//已经加载的图片数量         
           this.error='';
           this.callback=config.callback;
           this.img_obj=new Object();
     };
     /***游戏难度***/
     apink.set_game_difficulty=function(){
           var difficulty_config=this.difficulty_config;
           var key=this.game_difficulty;
           this.times=difficulty_config[key].times;//游戏初始时间s
           this.apink_picture_number=difficulty_config[key].apink_picture_number;//图片数量
           this.picture_score=difficulty_config[key].picture_score;//每张图片分数
     };
     /***游戏难度默认配置***/
     apink.difficulty_config=function(){
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
     apink.get_error=function(){
            return this.error;
     };
     /*得分处理*/
     apink.get_score=function(){

     };
     /***生成需要显示的图片数据***/
     apink.create_apink_data=function(){
           //复制游戏界面坐标数据
           var table_data=new Array();
           for(var i=0;i<this.game_data.length;i++){
                 table_data[i]={'x':this.game_data[i].x,'y':this.game_data[i].y};
           }
           apink_picture_number=this.apink_picture_number/2;
           length=this.Apink_picture.length;  
           var apink=Array();
           for(var i=1;i<=apink_picture_number;i++){
                      key_picture=parseInt(length*Math.random()); //随机抽取图片一张 
                      /*图片必须成双*/
                      for(var j=0;j<2;j++){
                           var node={};    
                           node.flag=1;//该图片存在标识                        
                           node.key= this.Apink_picture[key_picture].key;//图片对应下标(相同图片标识)   
                           node.img= this.Apink_picture[key_picture].img; //图片路径
                           /*随机获取坐标*/
                           key=parseInt(table_data.length*Math.random());//先随机获取游戏坐标数据的键值                
                           node.x=table_data[key].x;    
                           node.y=table_data[key].y; 
                           //图片位置按数组从左到右从上到下排列,便于后续消除判断
                           apink_key=this.get_apink_data_key(node);
                           apink[apink_key]=node;
                           table_data.splice(key,1);//删除已经取出坐标(已经被占用的坐标)
                      }
           };
           this.Apink_data=apink; 
           //空闲坐标处理
           for(var i=0;i<this.table_data.length;i++){
                  if(typeof(this.Apink_data[i])=='undefined'){
                          this.Apink_data[i]={x:this.table_data[i].x,y:this.table_data[i].y,flag:0,key:'',img:''};
                  } 
           }  
           this.callback.ready(this.Apink_data);//游戏初始化完成
     };
     /***创建显示图像的画布坐标系***/
     apink.create_table_data=function(){
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
     apink.get_picture_array=function(){
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
     apink.create_game_data=function(){
           var column=this.column;//最大列
           var row=this.row;//最大行
           var picture_array=this.picture_array;//图片排列
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
     apink.show_apink_img=function(){         
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
     /***设置监听事件***/
     apink.set_EventListener=function(){
            canvas=  this.canvas;
            _this=this;
            //监听点击事件
            canvas.addEventListener('click', function(e){
                   var position=_this.get_ClickPosition(e);//获取点击点的坐标                  
                   _this.set_click_position(position);//保存点击时获取的坐标                  
            }, false);
            //重新排列
            $(".btn_cp").click(function(){
                    _this.afresh_assemble();
            });
            //提示
            $(".btn_ts").click(function(){
                    var result=_this.help();
                    if(result.flag){
                          if(_this.click_position[0].p.x!==''){
                                _this.clear_picture_special_effect(_this.click_position[0].p);//清除点击图片的特效
                          }
                          if(_this.click_position[1].p.x!==''){
                                _this.clear_picture_special_effect(_this.click_position[1].p);//清除点击图片的特效
                          }                          
                          _this.add_picture_special_effect(result.p1);
                          _this.add_picture_special_effect(result.p2);
                    }
            })
     };
     return apink;
}(Apink || {}));