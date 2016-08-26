<?php
header("content-type:text/html; charset=gbk");
require 'Phpsocket.class.php';
error_reporting(E_ALL);
set_time_limit(0);//确保在连接客户端时不会超时
Class llk{
	private $room_data=array();//房间信息
	private $user_data=array();//记录用户所在房间号
	private $socket_class='';
	/*游戏数据*/
	private $game_data=array(
			array('times'=>40,'apink_picture_number'=>36,'picture_score'=>40),
			array('times'=>35,'apink_picture_number'=>64,'picture_score'=>15),
			array('times'=>30,'apink_picture_number'=>80,'picture_score'=>20),
			array('times'=>25,'apink_picture_number'=>96,'picture_score'=>30),
			array('times'=>25,'apink_picture_number'=>120,'picture_score'=>30)
	);
	public function __construct(){
		$this->socket_class=new phpsocket('localhost',4000,$this);
		$this->socket_class->run();
	}
	
	public function get_socket_data($client,$msg){
	    $data=json_decode($msg,true);
 	    if($data['caozuo']=='create_room'){//创建房间
	      	$this->create_room($client,$data);
      	}else
      	if($data['caozuo']=='connect_room'){//连接房间
      		$this->connect_room($client,$data);
      	}else
      	if($data['caozuo']=='game_start'){//游戏开始
      		$this->game_start($client,$data);
      	}else
      	if($data['caozuo']=='clear'){//消除图片消息
      		$this->clear($client,$data);
      	}else
      	if($data['caozuo']=='ready'){//玩家已经准备就绪
      		$this->ready($client,$data);
      	}else 
      	if($data['caozuo']=='afresh_assemble'){//玩家重新组合排列图片
      	    $this->afresh_assemble($client,$data);
      	} 
	}
	
    /*创建房间*/
    public function create_room($client,$data){
      	if(array_key_exists($data['room_number'],$this->room_data)){
      		$json_data=json_encode(array('caozuo'=>'connect_room','state'=>'2','msg'=>'房间已经存在啦!'));
      		$this->socket_class->send($client,$json_data);
      	}else{
      		$this->room_data[$data['room_number']]['information']=array(
      				'room_number'=>$data['room_number'],
      				'password'=>md5($data['room_pwd'])
      		);
      		$this->room_data[$data['room_number']]['user'][]=array(
      				'socket_flag'=>$client,
      				'user_data'=>array('nickname'=>$data['nickname'])
      		);
      		$this->user_data[$client]=$data['room_number'];
      		$json_data=json_encode(array('caozuo'=>'create_room','state'=>'1','msg'=>'ok','nickname'=>$data['nickname']));
      		$this->socket_class->send($client,$json_data);
      	}
    }
       
    /*连接房间*/
    public function connect_room($client,$data){
      	    $error='';
	      	if(array_key_exists($data['room_number'],$this->room_data)){
	      		if(md5($data['room_pwd'])!=$this->room_data[$data['room_number']]['information']['password']){
	      			$error='密码错误';
	      		}else{
	      			if(count($this->room_data[$data['room_number']]['user'])==2){
	      				$error='房间已经满了';
	      			}
	      		}
	      	}else{
	      		$error='房间不存在';
	      	}
	      	if(!$error){//连接成功
	      		$this->room_data[$data['room_number']]['user'][]=array(
	      				'socket_flag'=>$client,
	      				'user_data'=>array('nickname'=>$data['nickname'])
	      		);
	      		$this->user_data[$client]=$data['room_number'];
	      		foreach($this->room_data[$data['room_number']]['user'] as $v){
	      			$all_user_data[]=$v['user_data'];
	      		}
	      		$json_data=json_encode(array('caozuo'=>'connect_room','state'=>'1','msg'=>'ok','nickname'=>$data['nickname']));
	      		$json_all_data=json_encode(array('caozuo'=>'connect_room','type'=>'all','state'=>'1','msg'=>'ok','user_data'=>$all_user_data));
	      		foreach($this->room_data[$data['room_number']]['user'] as $k=>$v){//通知所有人
	      			if($client==$v['socket_flag']){//第一次连接发送所有成员数据
	      				$this->socket_class->send($v['socket_flag'],$json_all_data);
	      			}else{//已经连接过 了
	      				$this->socket_class->send($v['socket_flag'],$json_data);
	      			}
	      		}
	      	}else{//连接失败
	      		$json_data=json_encode(array('caozuo'=>'connect_room','state'=>'2','msg'=>$error));
	      		$this->socket_class->send($client,$json_data);
	      	}
    }
       
      /*游戏开始*/
      public function game_start($client,$data){   
      	$room_number=$this->user_data[$client];//获取房间号
            if(count($this->room_data[$room_number]['user'])==2){
            	$json_data=$this->set_game_data();         	
            	foreach($this->room_data[$room_number]['user'] as $k=>$v){//通知所有人
            		$this->socket_class->send($v['socket_flag'],$json_data);//发送游戏开始通知
            	}
            }else{
            	$json_data=json_encode(array('caozuo'=>'game_start','state'=>2,'msg'=>'当前房间人数不满足游戏条件'));
            	$this->socket_class->send($client,$json_data);//发送游戏开始通知
            }         
      }
      
      /*获取各玩家游戏配置*/
      public function set_game_data(){
      	  $game_lv=rand(0,4);//游戏难度
      	  $picture_key=rand(0,2);//游戏图片抽取
      	  $json_data=json_encode(array('caozuo'=>'game_start','game_lv'=>$game_lv,'picture_key'=>$picture_key,'state'=>'1','msg'=>'ok'));
      	  return $json_data;
      }
      
      /*消除图片消息*/
      public function clear($client,$data){
	      $room_number=$this->user_data[$client];//获取房间号
	      foreach($this->room_data[$room_number]['user'] as $k=>$v){//通知所有人(除消息发送者)
	      	  if($client!=$v['socket_flag']){
	      	  	  $this->socket_class->send($v['socket_flag'],json_encode($data));//发送游戏开始通知
	      	  }	      	  
	      }
      }
      
      /*玩家准备就绪消息*/
      public function ready($client,$data){
	      $room_number=$this->user_data[$client];//获取房间号
	      foreach($this->room_data[$room_number]['user'] as $k=>$v){//通知所有人(除消息发送者)
      		if($client!=$v['socket_flag']){
      			$this->socket_class->send($v['socket_flag'],json_encode($data));//发送游戏开始通知
      		}
	      }
      }
      
      /*玩家重新排列组合图片消息*/
      public function afresh_assemble($client,$data){
	      $room_number=$this->user_data[$client];//获取房间号
	      foreach($this->room_data[$room_number]['user'] as $k=>$v){//通知所有人(除消息发送者)
	      	if($client!=$v['socket_flag']){
	      			$this->socket_class->send($v['socket_flag'],json_encode($data));//发送xiaoxi
	      	}
	      }
      }
      
      /*玩家断开连接踢出玩家*/
      public function disConnect($client){
      	  if(isset($this->user_data[$client])){
      	  	  $room_number=$this->user_data[$client];//获取房间号
      	  	  foreach($this->room_data[$room_number]['user'] as $k=>$v){
      	  		  if($client==$v['socket_flag']){
      	  			unset($this->room_data[$room_number]['user'][$k]);
      	  			unset($this->user_data[$client]);
      	  		  }
      	  	  }
      	  	  if(empty($this->room_data[$room_number]['user'])){//房间没人
      	  		unset($this->room_data[$room_number]);//删除该房间
      	  	  }      	  	
      	  }
      }
}
$obj=new llk();