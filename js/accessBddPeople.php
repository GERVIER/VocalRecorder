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

    function getPeopleCount(){
        $bdd = accessBDD();
        $request = $bdd->query('SELECT count(*) as numberPeople FROM people');
        $data = $request->fetch();

        echo $data['numberPeople'];

        $request->closeCursor();
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
        $request = $bdd->query('SELECT * FROM people ORDER by name LIMIT '.$numberPerColumn.' OFFSET '. $first.' ');

        echo echoListOfPeople($request);

        $request->closeCursor();
    }

    function getPeopleAsListInversed(){
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
        $request = $bdd->query('SELECT * FROM people ORDER by name DESC LIMIT '.$numberPerColumn.' OFFSET '. $first.' ');

        echo echoListOfPeople($request);

        $request->closeCursor();
    }

    function echoListOfPeople($request){
        while($data =$request->fetch()){
            $id = $data['id'];
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
                    <div class="row mx-1 mb-3 px-2 py-2 rounded peopleCard" onClick="showPeopleInfo('.$id.')">
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
    }

    function getAPeople($dataSended){
        if(isset($dataSended['id'])){
            $id = $dataSended['id'];
        }
        else{
            $id = 1;
        }

        $bdd = accessBDD();
        $request = $bdd->query('SELECT * FROM people WHERE id = '.$id.'');

        $data = $request->fetch();

        $name = $data['name'];
        $age = $data['age'];
        $picture = $data['picture'];
        $language = $data['language']; 
        
        echo '  <!-- People main information  -->
                <div class="row mb-2">
                    <div class="col-3 d-flex flex-column justify-content-center">
                        <img src="'.$picture.'" alt="'.$name.'" class="rounded-circle mw-100 mh-100 p-0 align-self-center"/>                         
                    </div>
                    <div class="col d-flex flex-column justify-content-center">
                        <h3 class="text-center">'.$name.'</h3>
                        <p class="text-center mb-0">Speek '.$language.'</p>
                        <p class="text-center">'.$age.' years old</p>
                    </div>
                    <div class="col-3 d-flex flex-column justify-content-center">
                        <img src="'.$picture.'" alt="'.$name.'" class="rounded-circle mw-100 mh-100 p-0 align-self-center"/>                   
                    </div>
                </div>

                <!-- Addition information  --> 
                <div class="row mx-1">
                    <p class="mb-0">
                        <b>Role : </b> Journalist  <br />
                        <b>Other Information : </b> <br />
                            <span class="mx-4"> <b> Micro type :</b> Tie     <br /> </span>
                            <span class="mx-4"> <b> Studio :</b>     Yes         <br /> </span>
                            <span class="mx-4"> <b> Outdoor :</b>    No         <br /> </span>
                    </p>
                </div>';

        $request->closeCursor();
    }