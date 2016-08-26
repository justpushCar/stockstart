<?php
/*
 * 数据库
 * */
class mysql{
	// 数据库连接参数配置
	protected $config     = array(
			'hostname'          =>  '127.0.0.1', // 服务器地址
			'database'          =>  'tp',          // 数据库名
			'username'          =>  'root',      // 用户名
			'password'          =>  '',          // 密码
			'hostport'          =>  '',        // 端口
	);
	
	public function __construct(){
		$this->connect();
    }		
    
	/*连接数据库*/
	public function connect(){
		$config=$this->config;
		$this->linkID = new PDO("mysql:host=localhost;dbname=tp",$config['username'],$config['password']);			
	}
	
	/**
	 * 查询数据库获得结果集
	 * @access public
	 * @param array $config 连接信息
	 * @return string
	 */
	public function query($sql){
		$query=$this->linkID->query($sql);
		$query->setFetchMode(PDO::FETCH_NUM);//设置获取模式
		$result=$query->fetchAll();//获取所有数据
		return $result;
	}
	
	
	public function insert($data,$table){
		foreach ($data as $key=>$val){
			if(is_scalar($val)) { // 过滤非标量数据
				$fields[]   = $this->parseKey($key);
				$values[]   = $val;
			}
		}
		$sql="INSERT INTO `$table` ".'('.(implode(',',$fields)).') VALUES ('.implode(',', $values).')';
		var_dump($sql);
		$result=$this->linkID->exec($sql);
		return $result;
	}
	
	/**
	 * 字段处理
	 * @access protected
	 * @param string $key
	 * @return string
	 */
	protected function parseKey(&$key) {
		$key   =  trim($key);
		if(!is_numeric($key) && !preg_match('/[,\'\"\*\(\)`.\s]/',$key)) {
			$key = '`'.$key.'`';
		}
		return $key;
	}
	
}
$class=new mysql();
/* $json_data=json_encode(array('caozuo'=>'connect_room','state'=>'2','msg'=>'房间不存在'));
var_dump($json_data); */
//$query = $class -> query("select * from tp_product");
//"insert into tp_order (`time`) values('1')"me


/*
 * query()函数 查询数据库返回结果集
 * setFetchMode 设置从query函数的结果中取得数据的模式 
 * 参数 FETCH_NUM(结果中数组下标用从0开始的数字递增表示) PDO::FETCH_NUM(数组下标用字段表示)
 * fetchAll()获取所有数据,此时数据为二维数组
 * fetch()获取第一条,此时数据为一维数组
 * */