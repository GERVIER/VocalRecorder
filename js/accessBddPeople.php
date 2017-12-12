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

    function getPeopleCount($dataSended){
        $language =         (isset($dataSended['language']))        ?   $dataSended['language']         :"all";
        $term =             (isset($dataSended['term']))            ?   $dataSended['term']             :"";
        
        $bdd = accessBDD();
        $requestText = 'SELECT count(*) as numberPeople FROM people';

        if($language != "all"){
            $requestText .= ' WHERE language LIKE \''.$language.'\' ';

            if($term != ""){
                $requestText .= ' AND name LIKE \'%'.$term.'%\'';
            }
        }else{
            if($term != ""){
                $requestText .= ' WHERE name LIKE \'%'.$term.'%\' ';
            }
        }

        $request = $bdd->query($requestText);
        $data = $request->fetch();

        echo $data['numberPeople'];

        $request->closeCursor();
    }

    function getPeopleAsList($dataSended){

        $first =            (isset($dataSended['first']))           ?   $dataSended['first']            :0;
        $numberPerColumn =  (isset($dataSended['numberPerColumn'])) ?   $dataSended['numberPerColumn']  :6;
        $order =            (isset($dataSended['order']))           ?   $dataSended['order']            :"asc";
        $language =         (isset($dataSended['language']))        ?   $dataSended['language']         :"all";
        $term =             (isset($dataSended['term']))            ?   $dataSended['term']             :"";

        $bdd = accessBDD();
        
        $requestText = 'SELECT * FROM people ';

        if($language != "all"){
            $requestText .= ' WHERE language LIKE \''.$language.'\' ';

            if($term != ""){
                $requestText .= ' AND name LIKE \'%'.$term.'%\'';
            }
        }else{
            if($term != ""){
                $requestText .= ' WHERE name LIKE \'%'.$term.'%\' ';
            }
        }

        $requestText .= ' ORDER by name ';

        if($order == "desc"){
            $requestText .= ' DESC ';
        }

        $requestText .= ' LIMIT '.$numberPerColumn.' OFFSET '. $first.' ';
        $request = $bdd->query($requestText);
        echo echoListOfPeople($request);

        $request->closeCursor();
    }

    function echoListOfPeople($request){
        while($data =$request->fetch()){
            $id = $data['id'];
            $name = $data['name'];
            $age = $data['age'];
            $picture = $data['picture'];
            if($picture == "undefined"){
                $picture = "res/img/people/empty.jpg";
            }
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
                    <div class="row mx-1 mb-3 px-2 py-2 rounded peopleCard" onClick="showPeopleInfo('.$id.')" draggable="true" onDragStart="dragPeople(event, '.$id.')">
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

        if($picture == "undefined"){
            $picture = "res/img/people/empty.jpg";
        }

        $language = $data['language']; 
        $role = $data['role'];
        $otherData = $data['other'];

        $otherData = json_decode($otherData, true);
        $microType = (isset($otherData['MicroType']))?$otherData['MicroType']:"not defined";
        $studio = (isset($otherData['Studio']))?$otherData['Studio']:"not defined";
        $outDoor = (isset($otherData['OutDoor']))?$otherData['OutDoor']:"not defined";
        
        echo '  <!-- People main information  -->
                <div class="row mb-2">
                    <div class="col-3 d-flex flex-column justify-content-center">
                        <img id="peopleImage" src="'.$picture.'" alt="'.$name.'" class="rounded-circle mw-100 mh-100 p-0 align-self-center"/>                         
                    </div>
                    <div class="col d-flex flex-column justify-content-center">
                        <h3 id="peopleName" class="text-center">'.$name.'</h3>
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
                        <b>Role : </b> '.$role.'  <br />
                        <b>Other Information : </b> <br />
                            <span class="mx-4"> <b> Micro type :</b> '.$microType.'     <br /> </span>
                            <span class="mx-4"> <b> Studio :</b>     '.$studio.'         <br /> </span>
                            <span class="mx-4"> <b> Outdoor :</b>    '.$outDoor.'         <br /> </span>
                    </p>
                </div>';

        $request->closeCursor();
    }

    function getPeopleFinalList($dataSended){
        if(isset($dataSended['id'])){
            $id = $dataSended['id'];
        }
        else{
            $id = [0];
        }

        $idList = "";
        for($i = 0; $i<count($id); $i = $i+1){
            if($i != (count($id)-1)){
                $idList .= $id[$i].", ";
            }
            else{
                $idList .= $id[$i]." ";
            }
            
           
        }
        $bdd = accessBDD();

        
        $request = $bdd->query('SELECT * FROM people WHERE id in ('.$idList.') ORDER BY name ');

        while($data = $request->fetch()){
            $id = $data['id'];
            $name = $data['name'];
            $picture = $data['picture'];
            if($picture == "undefined"){
                $picture = "res/img/people/empty.jpg";
            }
            
            echo '<div class="col-2 p-0 mx-1">
                    <img src="'.$picture.'" alt="'. $name.'" class="rounded-circle mw-100 mh-100 p-0 align-self-center" data-toggle="tooltip" data-html="true" title="'.$name.'"/>
                    <p style="text-align:end;margin-top: -1em">
                        <button onclick="removePeople('.$id.')" type="button" class="close" aria-label="Close"> 
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </p>
                    </div>';
        }
    }

    function getAllLanguage(){
        $bdd = accessBDD();
        $request = $bdd->query('SELECT DISTINCT(language) FROM people ORDER BY language');

        while($data = $request->fetch()){
            echo '<a href="#" class="list-group-item list-group-item-action" data-dismiss="modal" onClick="changeLanguage(\''.$data['language'].'\')">'.$data['language'].'</a>';
        }

        $request->closeCursor();
    }