<?php
    require_once 'includes/constants.php';
    
    class Mysql {
        
        private $connection;
        
        function __construct() {
            $this->connection = new mysqli (DB_SERVER, DB_USER, DB_PASSWORD, DB_NAME) or
                          die('There was a problem connecting to the database.');
        }
        
        function updateHighScore($score, $name){
            $score = (int) $score;
            if ($score > 0){
                $query = "DELETE FROM HighScore
                            WHERE score != -1";
    
                //the prepare function returns a STATEMENT OBJECT OR FALSE if an error occurred.
                //Since the echo statement inside the if statement doesn't run, that means $statement is being assigned false.
                if($statement = $this->connection->prepare($query)) {
                    $statement->execute();
                    $statement->close();
                }
                
                
                
                $query = "INSERT INTO HighScore
                            (
                                name, score
                            )
                        VALUES (?,?)";
    
                //the prepare function returns a STATEMENT OBJECT OR FALSE if an error occurred.
                //Since the echo statement inside the if statement doesn't run, that means $statement is being assigned false.
                if($statement = $this->connection->prepare($query)) {
                    $statement->bind_param('si', $name, $score);
                    $statement->execute();
                    $statement->close();
                }
            }
            return $this->currentHigh();
        }
        
        function currentHigh(){
            $query = "SELECT score
                FROM HighScore";
            //the prepare function returns a STATEMENT OBJECT OR FALSE if an error occurred.
            //Since the echo statement inside the if statement doesn't run, that means $statement is being assigned false.
            
            if($statement = $this->connection->prepare($query)) {
                $statement->execute();
                $statement->bind_result($score);
                if($statement->fetch()){
                    $statement->close();
                    return $score;
                }
                
            }
            return "error";
        }
        function currentName(){
            $query = "SELECT name
                FROM HighScore";
            //the prepare function returns a STATEMENT OBJECT OR FALSE if an error occurred.
            //Since the echo statement inside the if statement doesn't run, that means $statement is being assigned false.
            
            if($statement = $this->connection->prepare($query)) {
                $statement->execute();
                $statement->bind_result($name);
                if($statement->fetch()){
                    $statement->close();
                    return $name;
                }
                
            }
            return "error";
        }
    }