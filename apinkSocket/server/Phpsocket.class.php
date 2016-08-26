<?php
header("content-type:text/html; charset=gbk");
Class phpsocket{
    private $master='';//socket套接字
    private $sockets = array();
    private $accept = array();//所有用户
    private $debug = true;//是否开启调试模式
    private $handshake = false;
    private $client_data=array(); //接受的客户端数据
    public $callback=array(
      	'socket_data'=>'get_socket_data',//默认接受数据的回调函数
      	'disConnect'=>'disConnect'//默认断开连接的回调函数
    );
    
    /*
     * 架构函数
     * @param string $address 需要绑定的ip
     * @param string $port 监听的端口
     * @param obj $class 回调函数所属的类
     * */
    public function __construct($address, $port,$class){
        $this->callback_class=$class;
      	//建立一个 socket 套接字
        $this->master=socket_create(AF_INET, SOCK_STREAM, SOL_TCP)  or die("socket_create() failed");
        //设置socket选项
        socket_set_option($this->master, SOL_SOCKET, SO_REUSEADDR, 1) or die("socket_option() failed");
        socket_set_option($this->master, SOL_SOCKET, SO_RCVBUF,1024*64);
        socket_set_option($this->master, SOL_SOCKET, SO_SNDBUF,1024*64);
        //绑定端口
        socket_bind($this->master, $address, $port)or die("socket_bind() failed");
        //监听端口
        socket_listen($this->master,20)or die("socket_listen() failed");
        $this->sockets[] = $this->master;
        $this->accept[] = $this->master;
        $this->say("Server Started : ".date('Y-m-d H:i:s'));
        $this->say("Listening on   : ".$address." port ".$port);
        $this->say("Master socket  : ".$this->master."\n");
    }
      
    public function run(){
        while(true){
            $socketArr = $this->sockets;
            $write = NULL;
            $except = NULL;                   
            //自动选择来消息的socket 如果是握手 自动选择主机(阻塞用，有新连接时才会结束)
            socket_select($socketArr, $write, $except, NULL);
            //循环处理消息
            $this->acceptData($socketArr);
        }
    }
    
    /*
     * 循环接受数据
     * @param array $socketArr 有消息的客户端标识
     * */
    private function acceptData($socketArr){
    	foreach($socketArr as $k=>$socket){
    		if($socket == $this->master){//这里执行客户端到主机的连接
    			$client = socket_accept($this->master);//接受一个Socket连接
    			if ($client < 0){//连接失败
    				$this->log("socket_accept() failed");
    				continue;
    			}else{
    				$this->connect($client);//将连接进来的用户存入数组
    			}
    		}else{
    			$bytes = @socket_recv($socket,$buffer,1024*64,MSG_DONTWAIT );//从socket里接受数据到缓存
    			if(!$this->accept[$k][0]){//暂未和websocket握手
    				$result=$this->doHandShake($socket, $buffer);//握手
    				if($result){
    					$this->accept[$k][0]=true;//标记握手已经成功,下次接受数据采用数据帧格式
    				}
    			}else{//已经握手
    				if(!isset($this->accept[$k][2]) || empty($this->accept[$k][2])){
    					if($bytes == 0 || (ord($buffer[0]) & 15) == 8){//判断是否断开连接
    						$result=$this->disConnect($socket);//断开连接
    						if($result){
    							$this->accept[$k][0]=false;//取消握手
    						}
    					}
    					$this->accept[$k][2]['data']   = $buffer;
    					$this->accept[$k][2]['length'] = $this->getDataLength($buffer);
    				}else{
    					$this->accept[$k][2]['data'].=$buffer;
    				}
    				$this->accept[$k][2]['length'] = $this->accept[$k][2]['length'] - $bytes;
    				if($this->accept[$k][2]['length'] <= 0){
    					$buffer        = $this->decode($this->accept[$k][2]['data']);
    					$callback_name = $this->callback['socket_data'];
    					$this->callback_class->$callback_name($socket,$buffer);//回调函数通知
    					unset($this->accept[$k][2]);//清空数据
    				}
    			}
    		}
    	}
    }
    
    /*和websocket握手*/
    private function doHandShake($socket, $buffer){
	    $this->log("\nRequesting handshake...");
	    //$this->log($buffer);
	    list($resource, $host, $origin, $key) = $this->getHeaders($buffer);
	    $this->log("Handshaking...");
	    $upgrade  = "HTTP/1.1 101 Switching Protocol\r\n" .
		      		"Upgrade: websocket\r\n" .
		      		"Connection: Upgrade\r\n" .
		      		"Sec-WebSocket-Accept: " . $this->calcKey($key) . "\r\n\r\n";  //必须以两个回车结尾
	    $this->log($upgrade);
	    $send = socket_write($socket, $upgrade, strlen($upgrade));// 写入socket（返回数据到客户端）
	    $this->log("Done handshaking...");
	    return true; 
    }
      
    /*提取Http头部信息*/
    private function getHeaders($req){
		$r = $h = $o = $key = null;
		if (preg_match("/GET (.*) HTTP/"              ,$req,$match)) { $r = $match[1]; }
		if (preg_match("/Host: (.*)\r\n/"             ,$req,$match)) { $h = $match[1]; }
		if (preg_match("/Origin: (.*)\r\n/"           ,$req,$match)) { $o = $match[1]; }
		if (preg_match("/Sec-WebSocket-Key: (.*)\r\n/",$req,$match)) { $key = $match[1]; }//提取 Sec-WebSocket-Key 信息
		return array($r, $h, $o, $key);
	}
	  
   /*
	* 加密 Sec-WebSocket-Key
	* @param string $socket 连接的客户端标识
	* @return string accept 加密后的数据
	* */	  
    private function calcKey($key){
		//基于websocket version 13
		$accept = base64_encode(sha1($key.'258EAFA5-E914-47DA-95CA-C5AB0DC85B11', true));
	    return $accept;
    }
	  
   /* 
    * 将连接进来的用户存入数组
    * @param string $socket 连接的客户端标识
    * */	  
    private function connect($socket){
        array_push($this->accept,array(false,$socket));
	    array_push($this->sockets,$socket);
	    $this->say("\n" . $socket . " CONNECTED!");
	    $this->say(date("Y-n-d H:i:s"));
    }
      
   /* 
    * 获取的websocket数据解码
    * @param string $buffer 接受的客户单websocket的数据
    * @return string $decoded 解码后的数据
    * */
    private function decode($buffer) {
	    $len = $masks = $data = $decoded = null;
	    $len = ord($buffer[1]) & 127;
	    if ($len === 126) {
	      	$masks = substr($buffer, 4, 4);
	      	$data = substr($buffer, 8);
	    }else 
	    if ($len === 127) {
	      	$masks = substr($buffer, 10, 4);
	      	$data = substr($buffer, 14);
	    }else{
	      	$masks = substr($buffer, 2, 4);
	      	$data = substr($buffer, 6);
	    }
	    for ($index = 0; $index < strlen($data); $index++) {
	        $decoded .= $data[$index] ^ $masks[$index % 4];
	    }
	    return $decoded;
    }
      
    /* 
     * 获取数据的真实长度
     * @param string $buffer 接受的客户单websocket的数据
     * @return string $real_length 数据的真实长度
     +----------------------------------------------------------
     * 获取websocket数据长度说明:
     * 1.第二个字节的后7位(1个字节二进制表示是8位)的10进制数表示数据的长度
     * 2.ord($buffer[1])表示获取第二个字节的10进制ASCCI值,与127进行与运算(与运算是二进行数据相互对比),
     *   如 81 & 127 二进制即 01010001 & 01111111 与运算全部为1则为1 结果为01010001,第一位必定为0,
     *   所以第一位必定舍弃 与127进行与运算就是舍弃高一位,获取后7位
     * 3.如果第2个字节后7位所表示的10进制数小于127,则这个数就是数据的真实长度
     *   如果等于126,则后两个字节表示的10进制数才是数据的真实长度,即第3,4两个字节
     *   如果等于127,则后8个字节表示的10进制数才是数据的真实长度,即第3,4,5,6,7,8,9,10八个字节  
     +---------------------------------------------------------- 
     * */
    private function getDataLength($buffer){
    	$length = ord($buffer[1]) & 127; //获取第二个字节的后7位
    	if($length === 126){
    		$real_length = substr($buffer,2,2); //获取数据真实长度的字符
    		$real_length = hexdec(bin2hex($real_length)); //转成10进制
    	}else
    	if($length === 127){
    	    $real_length = substr($buffer,2,8); //获取数据真实长度的字符
    	    $real_length = hexdec(bin2hex($real_length)); //转成10进制    	
    	}else 
    	if($length < 126){
    	    $real_length = $length;
    	}
    	return $real_length;
    }

    // 返回帧信息处理
    private function frame($s){
      	$len = strlen($s);
      	if($len<=125){
      		return "\x81".chr($len).$s;
      	}else 
      	if($len<=65535){
      		return "\x81".chr(126).pack("n", $len).$s;
      	}else{
      		return "\x81".chr(127).pack("xxxxN", $len).$s;
      	}
    }
      
    //断开连接
    private function disConnect($socket){
	    $index = array_search($socket, $this->sockets);//获取连接客户端在数组中的下标
	    socket_close($socket);//断开此连接
	    $this->say($socket . " DISCONNECTED!");
	    if ($index >= 0){
	      	array_splice($this->sockets, $index, 1);//在数组中移除该客户端的标识
	      	array_splice($this->accept, $index, 1);
	    }
	    $callback_name=$this->callback['disConnect'];
        $this->callback_class->$callback_name($socket);
	    return true;
    }
      
	/*发送信息到客户端*/
	public function send($client,$msg){	  	    
		//$this->log("> " . $msg);		
		$msg = $this->frame($msg);			
		socket_write($client, $msg, strlen($msg));
		//$this->log("! " . strlen($msg));
	}
	  
    //提示
    public function say($msg = ""){
        echo $msg . "\n";
    }
      
    //报错
    public function log($msg = ""){
	    if($this->debug){
	        echo $msg . "\n";
	    }
    }       
}