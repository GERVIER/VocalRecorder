<?php
    function accessBDD(){
        $user = 'root';
        $pass = '';
        try{
            $bdd = new PDO('mysql:host=localhost;dbname=vocal_speaker', $user, $pass);
        }catch (Exception $e){
            die("Exception : Error during DBB connexion :".$e->getMessage());
        }
        return $bdd;
    }

    function getPeopleAsList($dataSended){
        if(isset($dataSended['first'])){
            $first = $dataSended['first'];
        }
        else{
            $first = 0;
        }

        if(isset($dataSended['numberPerColumn'])){
            $numberPerColumn = $dataSended['numberPerColumn'];
        }
        else{
            $numberPerColumn = 6;
        }

        $bdd = accessBDD();
        $request = $bdd->query('SELECT * FROM people LIMIT '.$numberPerColumn.' OFFSET '. $first.' ');

        while($data =$request->fetch()){
            $name = $data['name'];
            $age = $data['age'];
            $picture = $data['picture'];
            $language = $data['language']; 
            
            if(isset($first_letter)){
                if($first_letter != substr($name,0,1)){
                    $first_letter = substr($name,0,1);
                    echo '<h2>'.$first_letter.'</h2>';
                }
            }else{
                $first_letter = substr($name,0,1);
                echo '<h2>'.$first_letter.'</h2>';
            }
            
            echo '  <!-- A People card -->             
                    <div class="row mx-1 mb-3 px-2 py-2 rounded peopleCard">
                        <div class="col-auto p-0">
                            <div class="d-flex flex-row h-100 peopleImage"> 
                                <img src="'.$picture.'" alt="'.$name.'" class="rounded-circle mw-100 mh-100 p-0 align-self-center"/>
                            </div>
                        </div>
                        <div class="col d-flex flex-column justify-content-center pl-3">
                            <p class="mb-0"><b>'.$name.'</b></p>
                            <p class="mb-0">Language : '.$language.'</p>
                            <p class="mb-0">'.$age.' year old</p>
                        </div>
                    </div>
            ';


        }

        $request->closeCursor();
    }