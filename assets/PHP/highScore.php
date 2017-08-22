<?php
    require_once 'mysql.php';
    $mysql = new Mysql();
    
    if($_POST && !empty($_POST['score']) && !empty($_POST['name'])) {
        $score = $_POST['score'];
        $name = $_POST['name'];
        $result = $mysql->updateHighScore($score, $name);
        echo $result;
    }
    else if ($_POST && !empty($_POST['action'])){
        echo $mysql->currentHigh();
    }
    else if ($_POST && !empty($_POST['action2'])){
        echo $mysql->currentName();
    }