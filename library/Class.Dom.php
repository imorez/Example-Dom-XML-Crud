<?php
session_start();
ini_set('display_errors', 0);
libxml_disable_entity_loader(false);
Class XMLDom{

	public $baseURI = "../data/data.xml";
	public $doc;
	public $get = [];
	public $post = [];
	public $limit = 10;
	public $offset = 0;

	function __construct() {
		$this->get = array_filter($_GET, array(&$this, 'is_not_null'));
		$this->post = $_POST;
		$this->limit = !empty($this->get['limit']) ? $this->get['limit'] : $this->limit;
		$this->offset = (!empty($this->get['page']) ? $this->get['page'] : $this->offset ) * $this->limit;
	}
	
	public function is_not_null($value) {
		return !empty($value);
	}

	public function attach() {
		if(isset($_SESSION['exists']) && $_SESSION['exists'] == 1) {
			//unset($_SESSION['exists']);
			$this->doc->load(realpath($this->baseURI));
		} elseif(file_exists($this->baseURI)) {
			$_SESSION['exists'] = 1;
			$this->doc->load(realpath($this->baseURI));
		} else {
			$this->doc->loadXML('<xml/>');
			$this->doc->save($this->baseURI);
			$this->doc->load(realpath($this->baseURI));
		}
	}

	public function ready() {
		$this->doc = new DOMDocument('1.0', 'utf-8');
 		$this->doc->formatOutput = true; 
 		$this->doc->preserveWhiteSpace = false;
		$this->attach();
	}

	public function create() {
		$this->ready();
		if(empty($this->post)) return false;
		$xml = $this->doc->getElementsByTagName('xml')->item(0);
		$node = $this->doc->createElement("node");
		$node->setAttribute("id", uniqid());
		foreach($this->post as $k=>$value) {
			$new = $this->doc->createElement($k);
			$new->nodeValue = empty($value) ? " " : $value;
			$node->appendChild($new);
		}
		$xml->appendChild($node);
		$this->doc->appendChild($xml);
		$this->save();
		echo json_encode(['success'=> true]);
	}

	public function update() {
		$this->ready();
		$xpath = new DomXpath($this->doc);
		$xq = $xpath->query('//node[@id="' . $_GET['id'] . '"]');
		foreach ($xq as $k=>$nodes) {
		    foreach ($nodes->childNodes as $k=>$node) {
				if(isset($this->post[$node->nodeName]))
					$node->nodeValue = $_POST[$node->nodeName]; 
		    }	    
		}
		$this->save();
		echo json_encode(['success'=> true]);
	}

	public function find() {
		$this->ready();
		$xpath = new DomXpath($this->doc);
		$a = [];
		$field = $this->get["id"] ? "@id='{$this->get['value']}'" : 'contains(.,"' . $this->get['value'] . '")';
		if(empty($this->get['value'])) die(" Error! ");
		$xq = $xpath->query("//node[{$field}]");
		$a["length"] = $xq->length;
		foreach ($xq as $k=>$r)
		    foreach ($r->childNodes as $v)
		    	$a['result'][$r->getAttribute('id')][$v->nodeName] = $v->nodeValue;
		echo json_encode($a);
	}

	public function list_json() {
		$this->ready();
		$doc = $this->doc->documentElement->childNodes;
		$a = [];//receive data to display in json
		$a["length"] = $doc->length;
		$cn = iterator_to_array($doc);//Transform collection(DOMNodeList) in array
		$ns = array_slice($cn, $this->offset, $this->limit, true);//Slice the array
		foreach($ns as $n)
			foreach($n->childNodes as $v)
				$a['result'][$n->getAttribute('id')][$v->nodeName] = $v->nodeValue;
		echo json_encode($a);
	}

	public function delete() {
		$this->ready();
		$xpath = new DomXpath($this->doc);
		$xq = $xpath->query('//node[@id="' . $this->get['id'] . '"]');
		if($xq->item(0)) {
			$this->doc->documentElement->removeChild($xq->item(0));
			$this->save();
		} 
		echo json_encode(['success'=> true]);
	}

	public function save() {
		$this->doc->save( $this->baseURI );
	}
};