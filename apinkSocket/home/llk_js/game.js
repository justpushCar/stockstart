/*
 *消除条件逻辑部分
 */
var Apink = (function(apink){
     /***获取点击画布的坐标***/
     apink.get_ClickPosition=function(ev){
            var x, y;
            if (ev.layerX || ev.layerX == 0) {
                  x = ev.layerX;
                  y = ev.layerY;
            }else 
            if (ev.offsetX || ev.offsetX == 0) { // Opera
                  x = ev.offsetX;
                  y = ev.offsetY;
            }
            return {x: x, y: y};
      };
      /*清除数组中的数据*/
      apink.clear_apink_data=function(){
              //清除显示的图片
              this.cxt.clearRect(this.click_position[0].p.x,this.click_position[0].p.y,this.picture_width,this.picture_height);
              this.cxt.clearRect(this.click_position[1].p.x,this.click_position[1].p.y,this.picture_width,this.picture_height);
              this.clear_show(this.click_position[0].p,this.click_position[1].p);//图片消除时的特效
              //获取在数组中的下标索引位置
              var p1=this.click_position[0].p;
              var p2=this.click_position[1].p;
              var p1_key=this.get_apink_data_key(p1); 
              var p2_key=this.get_apink_data_key(p2); 
              //清除的图片标记为不存在
              this.Apink_data[p1_key].flag=0;
              this.Apink_data[p2_key].flag=0;
              //初始化点击数据
              this.click_position=[{p:{x:'',y:''}},{p:{x:'',y:''}}];
      };
      /***保存点击时获取的坐标(同时生成每个坐标的上下左右四个附加坐标便于计算是否满足消除条件)***/
      apink.set_click_position=function(position){
            //去掉提示坐标的效果并且初始化记录提示的坐标数据
            if(this.help_point[0].x!=''){
                   this.clear_picture_special_effect(this.help_point[0]);
                   this.clear_picture_special_effect(this.help_point[1]);
                   this.help_point=[{x:'',y:''},{x:'',y:''}];
            }        
             //坐标转换
             position.x=position.x-(position.x-this.picture_width/2)%this.picture_width;
             position.y=position.y-(position.y-this.picture_height/2)%this.picture_height;
             key=this.get_apink_data_key(position);
             if(this.Apink_data[key].flag!=1){
                  return;
             }
             if(this.click_position[0].p.x===''||(position.x==this.click_position[0].p.x)&&position.y==this.click_position[0].p.y){
                    //第一次点击不存在或者点击位置在第一次的地方
                    this.click_position[0]=this.get_five_point(position);//获取该坐标的周围四个点的坐标         
             }else{
                    //第二次点击的位置
                    this.click_position[1]=this.get_five_point(position);//获取该坐标的周围四个点的坐标   
              }  
              if(this.click_position[0].p.x!==''&&this.click_position[1].p.x!==''){
                        var flag=this.dispelled_handle(this.click_position[0],this.click_position[1]);//消除处理    
                        //为真满足消除条件,进行消除处理
                        if(flag){
                                this.times++;                                                        
                                this.apink_picture_number-=2;//更新当前场景上图片剩余数量
                                this.score+=this.picture_score*2;//更新得分
                                $(this.container+" .picture_number").text('剩余图片:'+this.apink_picture_number);//更新文本区域图片显示数量
                                $(this.container+" .score").text('统计得分:'+this.score);//更新文本区域得分显示
                                //执行回调函数
                                this.callback.clear({'score':this.score,'times':this.times,'picture_number':this.apink_picture_number,'point':[this.click_position[0].p,this.click_position[1].p]});
                                this.clear_apink_data();//清除两点数据    
                                //游戏通关
                                if(this.picture_number==0){

                                }
                        }else{
                                //不满足消除条件,第二次点的图片作为第一张
                                var p1=this.click_position[1];
                                this.clear_picture_special_effect(this.click_position[0].p);//清除上张图的特效
                                //初始化点击数据
                                this.click_position=[{p:{x:'',y:''}},{p:{x:'',y:''}}];
                                this.click_position[0]=p1;
                        } 
              }
              p1=this.click_position[0].p;
              p2=this.click_position[1].p;
              if(p1.x!==''){
                     this.add_picture_special_effect(p1);//点击后给点击的图片加上特效        
              }
              if(p2.x!==''){
                     this.add_picture_special_effect(p2);//点击后给点击的图片加上特效        
              }       
      };
      /*获取上下左右中间五个点的坐标*/
      apink.get_five_point=function(p){
             var p1={};
             p1.p={x:p.x,y:p.y};//中间点
             p1.left={x:p.x-this.picture_width,y:p.y};//左
             p1.up={x:p.x,y:p.y-this.picture_height};//上
             p1.down={x:p.x,y:p.y+this.picture_height};//下
             p1.right={x:p.x+this.picture_width,y:p.y};//右      
             return p1;
      };
      /***消除处理***/
      apink.dispelled_handle=function(p1,p2){
             a={x:p1.p.x,y:p1.p.y};//中间点
             b={x:p2.p.x,y:p2.p.y};//中间点
             //位置在数组中的下标索引
             p1_key=this.get_apink_data_key(a);                 
             p2_key=this.get_apink_data_key(b);   
             //两点间的图片不一样返回false
             if(this.Apink_data[p1_key].key!=this.Apink_data[p2_key].key){
                   return false;
             }           
             //在横向一条线上 y坐标 相同     
             if(a.y==b.y){      
                      //2点在y轴相邻                             
                      if ((p1.right.x==p2.p.x) || (p1.left.x==p2.p.x)){                           
                            return true;   
                      }                                  
                      //检测 这条线是否有一条路径相通    
                      if(a.x<b.x){
                            //a在b点的左边
                            if(this.Check_line(p1.right,p2.left)){        
                                 this.line=[
                                                   [{x:a.x+this.picture_width,y:a.y+this.picture_height/2},{x:b.x,y:b.y+this.picture_height/2}],
                                               ];               
                                 return true; 
                            } 
                      }else{
                            //a在b点的右边
                            if(this.Check_line(p1.left,p2.right)){  
                                 this.line=[
                                                   [{x:a.x,y:a.y+this.picture_height/2},{x:b.x+this.picture_width,y:b.y+this.picture_height/2}],
                                               ];                            
                                 return true; 
                            }
                      }                                  
                      /*检测上下*/                 
                      //y 上                             
                      pa={x:a.x,y:a.y};pb={x:b.x,y:b.y};                                
                      for (var y=-this.picture_height/2;y<=p1.up.y;y+=this.picture_height) {    
                            pa.y=y;
                            pb.y=y;                                                 
                            if (this.Check_line(pa,p1.up) && this.Check_line(pb,p2.up ) && this.Check_line(pa,pb)){     
                                 this.line=[
                                                   [{x:a.x+this.picture_width/2,y:a.y},{x:pa.x+this.picture_width/2,y:pa.y+this.picture_height/2}],
                                                   [{x:pa.x+this.picture_width/2,y:pa.y+this.picture_height/2},{x:pb.x+this.picture_width/2,y:pb.y+this.picture_height/2}],
                                                   [{x:pb.x+this.picture_width/2,y:pb.y+this.picture_height/2},{x:b.x+this.picture_width/2,y:b.y}]
                                                ];                                       
                                 return true; 
                            }   
                      }                                                                       
                      // y下                                
                      pa={x:a.x,y:a.y};pb={x:b.x,y:b.y};                                                  
                      for (var y=p1.down.y;y<=this.height+this.picture_height/2;y+=this.picture_height){                                  
                           pa.y=y;
                           pb.y=y;                         
                           if (this.Check_line(pa,p1.down)&&this.Check_line(pb,p2.down )&&this.Check_line(pa,pb ) ){                             
                                this.line=[
                                         [{x:a.x+this.picture_width/2,y:a.y+this.picture_height},{x:pa.x+this.picture_width/2,y:pa.y+this.picture_height/2}],
                                         [{x:pa.x+this.picture_width/2,y:pa.y+this.picture_height/2},{x:pb.x+this.picture_width/2,y:pb.y+this.picture_height/2}],
                                         [{x:pb.x+this.picture_width/2,y:pb.y+this.picture_height/2},{x:b.x+this.picture_width/2,y:b.y+this.picture_height}]
                                ];  
                                return true; 
                           } 
                      }                                                                
             }else
             if(a.x==b.x){
                      //纵向一条线  x 坐标 相同
                      //2点在x轴相邻                             
                      if ((p1.down.y==p2.p.y) || (p1.up.y==p2.p.y)){ 
                            return true;   
                      }                      
                      //检测 这条线是否有一条路径相通        
                      if(a.y<b.y){
                            //a在b点的上面
                            if(this.Check_line(p1.down,p2.up)){    
                                 this.line=[
                                        [{x:a.x+this.picture_width/2,y:a.y+this.picture_height},{x:b.x+this.picture_width/2,y:b.y}],
                                 ];                  
                                 return true; 
                            } 
                      }else{
                            //a在b点的下面
                            if(this.Check_line(p1.up,p2.down)){    
                                this.line=[
                                        [{x:a.x+this.picture_width/2,y:a.y},{x:b.x+this.picture_width/2,y:b.y+this.picture_height}],
                                ];                       
                                return true; 
                            }
                      }                     
                      /*检测左右*/                 
                      //x左                          
                      pa={x:a.x,y:a.y};pb={x:b.x,y:b.y};                             
                      for (var x=-this.picture_width/2;x<=p1.left.x;x+=this.picture_width) {    
                              pa.x=x;
                              pb.x=x;                                 
                              if (this.Check_line(pa,p1.left) && this.Check_line(pb,p2.left ) && this.Check_line(pa,pb)){
                                 this.line=[
                                         [{x:a.x,y:a.y+this.picture_height/2},{x:pa.x+this.picture_width/2,y:pa.y+this.picture_height/2}],
                                         [{x:pa.x+this.picture_width/2,y:pa.y+this.picture_height/2},{x:pb.x+this.picture_width/2,y:pb.y+this.picture_height/2}],
                                         [{x:pb.x+this.picture_width/2,y:pb.y+this.picture_height/2},{x:b.x,y:b.y+this.picture_height/2}]
                                 ];  
                                 return true; 
                              }   
                      }                                                 
                      //x右                                 
                      pa={x:a.x,y:a.y};pb={x:b.x,y:b.y};                                                          
                      for (var x=p1.right.x;x<=this.width+this.picture_width/2;x+=this.picture_width){                                  
                             pa.x=x;
                             pb.x=x;                                
                             if (this.Check_line(pa,p1.right) &&  this.Check_line(pb,p2.right) && this.Check_line(pa,pb)){
                                  this.line=[
                                         [{x:a.x,y:a.y+this.picture_height/2},{x:pa.x+this.picture_width/2,y:pa.y+this.picture_height/2}],
                                         [{x:pa.x+this.picture_width/2,y:pa.y+this.picture_height/2},{x:pb.x+this.picture_width/2,y:pb.y+this.picture_height/2}],
                                         [{x:pb.x+this.picture_width/2,y:pb.y+this.picture_height/2},{x:b.x,y:b.y+this.picture_height/2}]
                                 ];  
                                 return true; 
                             } 
                       }                                                                        
             }else{
                     /*xy 坐标 都不相同*/
                     //p1存放左边坐标
                     if (a.x>b.x){   
                              t={x:a.x,y:a.y};
                              a={x:b.x,y:b.y};
                              b={x:t.x,y:t.y};
                              t=p1;
                              p1=p2;
                              p2=t;
                     }
                     pa={x:a.x,y:a.y};pb={x:b.x,y:b.y}; //初始化转折点坐标                                      
                     /*找x轴路径(共三种路径1:p1左边和p2左边进行连接) */                  
                     for (var x=-this.picture_width/2;x<=p1.left.x;x+=this.picture_width){                         
                                pa.x=x;
                                pb.x=x;                                                    
                                if (this.Check_line(pa,p1.left) && this.Check_line(pa,pb) && this.Check_line(pb,p2.left)){    
                                       this.line=[
                                               [{x:a.x,y:a.y+this.picture_height/2},{x:pa.x+this.picture_width/2,y:pa.y+this.picture_height/2}],
                                               [{x:pa.x+this.picture_width/2,y:pa.y+this.picture_height/2},{x:pb.x+this.picture_width/2,y:pb.y+this.picture_height/2}],
                                               [{x:pb.x+this.picture_width/2,y:pb.y+this.picture_height/2},{x:b.x,y:b.y+this.picture_height/2}]
                                       ];                                     
                                       return true; 
                                }         
                     }                    
                    //2:p1右边和p2左边进行连接
                     for (var x=p1.right.x ;x<= p2.left.x;x+=this.picture_width){                          
                                pa.x=x;
                                pb.x=x;                        
                                if (this.Check_line(p1.right,pa) && this.Check_line(pa,pb)&& this.Check_line(pb,p2.left)){
                                      this.line=[
                                               [{x:a.x+this.picture_width,y:a.y+this.picture_height/2},{x:pa.x+this.picture_width/2,y:pa.y+this.picture_height/2}],
                                               [{x:pa.x+this.picture_width/2,y:pa.y+this.picture_height/2},{x:pb.x+this.picture_width/2,y:pb.y+this.picture_height/2}],
                                               [{x:pb.x+this.picture_width/2,y:pb.y+this.picture_height/2},{x:b.x,y:b.y+this.picture_height/2}]
                                      ]; 
                                      return true;
                                }                                                                         
                     }                                                             
                      //3:p1右边和p2右边进行连接                   
                     for (var x=p2.right.x;x<=this.width;x+=this.picture_width){                          
                                pa.x=x;
                                pb.x=x;                         
                                if (this.Check_line(p1.right ,pa)&&  this.Check_line(p2.right ,pb) && this.Check_line(pa,pb)) {  
                                       this.line=[
                                             [{x:a.x,y:a.y+this.picture_height/2},{x:pa.x+this.picture_width/2,y:pa.y+this.picture_height/2}],
                                             [{x:pa.x+this.picture_width/2,y:pa.y+this.picture_height/2},{x:pb.x+this.picture_width/2,y:pb.y+this.picture_height/2}],
                                             [{x:pb.x+this.picture_width/2,y:pb.y+this.picture_height/2},{x:b.x,y:b.y+this.picture_height/2}]
                                       ];                                                                        
                                       return true; 
                                }                                                                      
                      }                                                                                                 
                      /*找y轴路径(共三种路径) */
                      pa={x:a.x,y:a.y};pb={x:b.x,y:b.y};  //初始化转折点坐标                          
                      //1:p1上和p2上连接(左上右上)       
                      if(a.y>b.y){
                              for(var y=-this.picture_height/2 ;y<=p2.up.y;y+=this.picture_height){                         
                                        pa.y=y;
                                        pb.y=y;                         
                                        if (this.Check_line(pb,pa) && this.Check_line(pa,p1.up) && this.Check_line(pb,p2.up)){ 
                                              this.line=[
                                                     [{x:a.x+this.picture_width/2,y:a.y},{x:pa.x+this.picture_width/2,y:pa.y+this.picture_height/2}],
                                                     [{x:pa.x+this.picture_width/2,y:pa.y+this.picture_height/2},{x:pb.x+this.picture_width/2,y:pb.y+this.picture_height/2}],
                                                     [{x:pb.x+this.picture_width/2,y:pb.y+this.picture_height/2},{x:b.x+this.picture_width/2,y:b.y}]
                                              ];  
                                              return true;
                                        }                                                                    
                              }   
                      }else{
                              for(var y=-this.picture_height/2 ;y<=p1.up.y;y+=this.picture_height){                         
                                        pa.y=y;
                                        pb.y=y;                        
                                        if (this.Check_line(pb,pa) && this.Check_line(pa,p1.up) && this.Check_line(pb,p2.up)){ 
                                              this.line=[
                                                   [{x:a.x+this.picture_width/2,y:a.y},{x:pa.x+this.picture_width/2,y:pa.y+this.picture_height/2}],
                                                   [{x:pa.x+this.picture_width/2,y:pa.y+this.picture_height/2},{x:pb.x+this.picture_width/2,y:pb.y+this.picture_height/2}],
                                                   [{x:pb.x+this.picture_width/2,y:pb.y+this.picture_height/2},{x:b.x+this.picture_width/2,y:b.y}]
                                              ];  
                                              return true;
                                        }                                                                    
                              }                           
                      }     
                     //2:p1下和p2上连接(左上-右下)(p1在p2上方)    
                      if(a.y<b.y){
                              for (var y=p1.down.y ;y<=p2.up.y;y+=this.picture_height){  
                                      pa.y=y;
                                      pb.y=y;                    
                                      if (this.Check_line(pb,pa)&& this.Check_line(p1.down,pa) && this.Check_line(pb,p2.up)){                                       
                                             this.line=[
                                                     [{x:a.x+this.picture_width/2,y:a.y+this.picture_height},{x:pa.x+this.picture_width/2,y:pa.y+this.picture_height/2}],
                                                     [{x:pa.x+this.picture_width/2,y:pa.y+this.picture_height/2},{x:pb.x+this.picture_width/2,y:pb.y+this.picture_height/2}],
                                                     [{x:pb.x+this.picture_width/2,y:pb.y+this.picture_height/2},{x:b.x+this.picture_width/2,y:b.y}]
                                            ];                                                       
                                            return true;
                                      }                                                                       
                              }   
                      }else{
                               for (var y=p2.down.y ;y<=p1.up.y;y+=this.picture_height){  
                                      pa.y=y;
                                      pb.y=y;                        
                                      if (this.Check_line(pb,pa)&& this.Check_line(p1.up,pa) && this.Check_line(pb,p2.down)){
                                            this.line=[
                                                     [{x:a.x+this.picture_width/2,y:a.y},{x:pa.x+this.picture_width/2,y:pa.y+this.picture_height/2}],
                                                     [{x:pa.x+this.picture_width/2,y:pa.y+this.picture_height/2},{x:pb.x+this.picture_width/2,y:pb.y+this.picture_height/2}],
                                                     [{x:pb.x+this.picture_width/2,y:pb.y+this.picture_height/2},{x:b.x+this.picture_width/2,y:b.y+this.picture_height}]
                                            ];                                                         
                                             return true;
                                      }                                                                       
                              } 
                      }             

                      //3:p1下连接p2下(左下右下)     
                      if(a.y<b.y){
                              pa.y=b.y;
                              if(this.Check_line(p1.down,pa)&&this.Check_line(pa,p2.left)){
                                    this.line=[
                                             [{x:a.x+this.picture_width/2,y:a.y+this.picture_height},{x:pa.x+this.picture_width/2,y:pa.y+this.picture_height/2}],
                                             [{x:pa.x+this.picture_width/2,y:pa.y+this.picture_height/2},{x:b.x,y:b.y+this.picture_height/2}]
                                    ];   
                                    return true;
                              }
                              pb.y=a.y;
                              if(this.Check_line(p1.right,pb)&&this.Check_line(pb,p2.up)){
                                    this.line=[
                                             [{x:a.x+this.picture_width,y:a.y+this.picture_height/2},{x:pb.x,y:pb.y+this.picture_height/2}],
                                             [{x:pb.x+this.picture_width/2,y:pb.y+this.picture_height/2},{x:b.x+this.picture_width/2,y:b.y+this.picture_height}]
                                    ];   
                                    return true;
                              }
                              for (var y=p2.down.y;y<=this.height+this.picture_height/2;y+=this.picture_height){                                   
                                      pa.y=y;
                                      pb.y=y;                       
                                      console.log(pb,pa,p1.down,pa,p2.down,pb);
                                      if (this.Check_line(pb,pa) && this.Check_line(p1.down,pa) && this.Check_line(p2.down,pb)){ 
                                              this.line=[
                                                     [{x:a.x+this.picture_width/2,y:a.y},{x:pa.x+this.picture_width/2,y:pa.y+this.picture_height/2}],
                                                     [{x:pa.x+this.picture_width/2,y:pa.y+this.picture_height/2},{x:pb.x+this.picture_width/2,y:pb.y+this.picture_height/2}],
                                                     [{x:pb.x+this.picture_width/2,y:pb.y+this.picture_height/2},{x:b.x+this.picture_width/2,y:b.y}]
                                              ];  
                                              return true;   
                                      }                     
                              } 
                      }else{
                              pa.y=b.y;
                              if(this.Check_line(p1.up,pa)&&this.Check_line(pa,p2.left)){
                                    this.line=[
                                             [{x:a.x+this.picture_width/2,y:a.y},{x:pa.x+this.picture_width/2,y:pa.y+this.picture_height/2}],
                                             [{x:pa.x+this.picture_width/2,y:pa.y+this.picture_height/2},{x:b.x,y:b.y+this.picture_height/2}]
                                    ];   
                                    return true;
                              }
                              pb.y=a.y;
                              if(this.Check_line(p1.right,pb)&&this.Check_line(pb,p2.down)){
                                    this.line=[
                                             [{x:a.x+this.picture_width,y:a.y+this.picture_height/2},{x:pa.x+this.picture_width/2,y:pa.y+this.picture_height/2}],
                                             [{x:pa.x+this.picture_width/2,y:pa.y+this.picture_height/2},{x:b.x+this.picture_width/2,y:b.y}]
                                    ];   
                                    return true;
                              }
                              for (var y=p1.down.y;y<=this.height+this.picture_height/2;y+=this.picture_height){                                   
                                      pa.y=y;
                                      pb.y=y;                       
                                      if (this.Check_line(pb,pa) && this.Check_line(p1.down,pa) && this.Check_line(p2.down,pb)){ 
                                               this.line=[
                                                     [{x:a.x+this.picture_width/2,y:a.y},{x:pa.x+this.picture_width/2,y:pa.y+this.picture_height/2}],
                                                     [{x:pa.x+this.picture_width/2,y:pa.y+this.picture_height/2},{x:pb.x+this.picture_width/2,y:pb.y+this.picture_height/2}],
                                                     [{x:pb.x+this.picture_width/2,y:pb.y+this.picture_height/2},{x:b.x+this.picture_width/2,y:b.y}]
                                              ];  
                                              return true;   
                                      }                     
                              }  
                      }           
             }
             return false;
      },
      /***判断两点间是否满足消除条件***/
      apink.Check_line = function(point1,point2){       
                    var p1={x:point1.x,y:point1.y};
                    var p2={x:point2.x,y:point2.y};              
                    var rowcolumn=(this.width/this.picture_width)* (this.height/this.picture_height); 
                    //出界 必通
                    if( (p1.x==p2.x&&(p1.x<0||p1.x>=this.width))||(p1.y==p2.y&&(p1.y<0||p1.y>=this.height)) ){
                             return true;
                    }
                    //如果X轴相等   
                    if (p1.x==p2.x){                 
                          //p1始终存放最小值
                          if (p1.y>p2.y){
                               t=p1.y;p1.y=p2.y;p2.y=t;
                          } 
                          if(p1.y<0){
                                p1.y+=this.picture_height;
                          }  
                          if(p1.y>this.height){
                                p1.y-=this.picture_height;
                          }  
                          //在数组中的下标索引位置
                          p1_key=this.get_apink_data_key(p1);
                          p2_key=this.get_apink_data_key(p2);
                          //从小到大检查              
                          for (y=p1_key;y<=p2_key;y+=this.column){       
                                //路径中存在图片返回false       
                                if(y>=0&&y<rowcolumn){
                                      if (this.Apink_data[y].flag==1){                               
                                            return false;
                                      } 
                                }                                     
                          }               
                    }  
                    //如果Y轴相等    
                    if (p1.y==p2.y){     
                          //p1始终存放最小值            
                          if (p1.x > p2.x){
                              t=p1.x;p1.x=p2.x;p2.x=t;
                          }    
                          if(p1.x<0){
                                p1.x+=this.picture_width;
                          }  
                          if(p1.x>this.width){
                                p1.x-=this.picture_width;
                          }                                       
                          //在数组中的下标索引位置
                          p1_key=this.get_apink_data_key(p1);
                          p2_key=this.get_apink_data_key(p2);                                            
                          for(x=p1_key;x<=p2_key;x++){   
                                //路径中存在图片返回false      
                                if(x>=0&&x<rowcolumn){                           
                                      if (this.Apink_data[x].flag==1) {
                                            return false;
                                      }
                                }              
                          };             
                    };                          
                    return  true; 
      };
      /***重新组合排列***/
      apink.afresh_assemble=function(){
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
               //随机更改图片坐标
               var apink=Array();
               for(var i=0;i<this.table_data.length;i++){
                     if(this.Apink_data[i].img!=''){
                           var  node=this.Apink_data[i];   
                           /*随机获取坐标*/
                           key=parseInt(table_data.length*Math.random());//先随机获取游戏坐标数据的键值                
                           node.x=table_data[key].x;    
                           node.y=table_data[key].y; 
                           //图片位置按数组从左到右从上到下排列,便于后续消除判断
                           apink_key=this.get_apink_data_key(node);
                           apink[apink_key]=node;
                           table_data.splice(key,1);//删除已经取出坐标(已经被占用的坐标)
                     }else{
                          apink[i]={x:this.table_data[i].x,y:this.table_data[i].y,flag:0,key:'',img:''};
                     }
               };
               this.Apink_data=apink;
               //执行回调函数
               this.callback.afresh_assemble(this.Apink_data);
               this.show_apink_img();//重新显示图片
      };
      /***提示帮助***/
      apink.help=function(){
             for(var i=0;i<this.Apink_data.length;i++){
                    var p1={p:{x:'',y:''}};
                    if(this.Apink_data[i].flag==1){
                            p1.p={x:this.Apink_data[i].x,y:this.Apink_data[i].y};//中间点
                            p1.left={x:this.Apink_data[i].x-this.picture_width,y:this.Apink_data[i].y};//左
                            p1.up={x:this.Apink_data[i].x,y:this.Apink_data[i].y-this.picture_height};//上
                            p1.down={x:this.Apink_data[i].x,y:this.Apink_data[i].y+this.picture_height};//下
                            p1.right={x:this.Apink_data[i].x+this.picture_width,y:this.Apink_data[i].y};//右   
                            for(var j=i+1;j<this.Apink_data.length;j++){
                                   if(this.Apink_data[j].flag==1){
                                          var p2={p:{x:'',y:''}};
                                          p2.p={x:this.Apink_data[j].x,y:this.Apink_data[j].y};//中间点
                                          p2.left={x:this.Apink_data[j].x-this.picture_width,y:this.Apink_data[j].y};//左
                                          p2.up={x:this.Apink_data[j].x,y:this.Apink_data[j].y-this.picture_height};//上
                                          p2.down={x:this.Apink_data[j].x,y:this.Apink_data[j].y+this.picture_height};//下
                                          p2.right={x:this.Apink_data[j].x+this.picture_width,y:this.Apink_data[j].y};//右
                                          flag=this.dispelled_handle(p1,p2);
                                          if(flag){
                                                 this.help_point=[{x:p1.p.x,y:p1.p.y},{x:p2.p.x,y:p2.p.y}];
                                                 return  {flag:true,p1:p1.p,p2:p2.p};
                                          }
                                   }
                            }
                    }
             }
             return {flag:false};
      };
      /***获取坐标在数组中的下标索引***/
      apink.get_apink_data_key=function(p){
           var key=((p.y-this.picture_height/2)/this.picture_height)*(this.width/this.picture_width)+(p.x-this.picture_width/2)/this.picture_width;
           return key;
      };
      return apink;
}(Apink || {}));

