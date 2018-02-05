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

    function applyRequestFilter($dataSended){
        $language =         (isset($dataSended['language']))        ?   $dataSended['language']         :"all";
        $role =             (isset($dataSended['role']))            ?   $dataSended['role']             :"none";
        $term =             (isset($dataSended['term']))            ?   $dataSended['term']             :"";

        $nbFilter = 0;
        $requestText = "";
        if($language != "all")
            $nbFilter += 1;
        if($term != "")
            $nbFilter += 1;
        if($role != "none")
            $nbFilter += 1;

        if($nbFilter > 0){
            $requestText .= ' WHERE ';
            $nbFilter -= 1;
        }

        if($language != "all"){
            $requestText .= ' language LIKE \''.$language.'\' ';

            if($nbFilter > 0){
                $requestText .= ' AND ';
                $nbFilter -= 1;
            }
        }
    
        if($term != ""){
            $requestText .= ' name LIKE \'%'.$term.'%\' ';

            if($nbFilter > 0){
                $requestText .= ' AND ';
                $nbFilter -= 1;
            }
        }
    
        if($role != "none"){
            $requestText .= ' role LIKE \''.$role.'\' ';
        }

        return $requestText;
    }

    /**
     * Return the number of people
     * $dataSended named array that contain all the parameters needed for the request : 
     *  first : first element to display
     *  numberPerColumn : how many element to show per Column
     *  order : arc or desc, indicate in witch order display the list
     *  language: language to display or all for displaying all language
     *  role : role to display or none for displaying all
     *  term : name filter
     */
    function getPeopleCount($dataSended){
        $language =         (isset($dataSended['language']))        ?   $dataSended['language']         :"all";
        $term =             (isset($dataSended['term']))            ?   $dataSended['term']             :"";
        
        $bdd = accessBDD();
        $requestText = 'SELECT count(*) as numberPeople FROM people';

        $requestText .= applyRequestFilter($dataSended);

        $request = $bdd->query($requestText);
        $data = $request->fetch();

        echo $data['numberPeople'];

        $request->closeCursor();
    }

    /**
     * Return the list of people
     * $dataSended named array that contain all the parameters needed for the request : 
     *  first : first element to display
     *  numberPerColumn : how many element to show per Column
     *  order : arc or desc, indicate in witch order display the list
     *  language: language to display or all for displaying all language
     *  role : role to display or none for displaying all
     *  term : name filter
     */
    function getPeopleAsList($dataSended){

        $first =            (isset($dataSended['first']))           ?   $dataSended['first']            :0;
        $numberPerColumn =  (isset($dataSended['numberPerColumn'])) ?   $dataSended['numberPerColumn']  :6;
        $order =            (isset($dataSended['order']))           ?   $dataSended['order']            :"asc";


        $bdd = accessBDD();
        $requestText = 'SELECT * FROM people ';
        $requestText .= applyRequestFilter($dataSended);
        $requestText .= ' ORDER by name ';

        if($order == "desc"){
            $requestText .= ' DESC ';
        }

        $requestText .= ' LIMIT '.$numberPerColumn.' OFFSET '. $first.' ';
        $request = $bdd->query($requestText);
        echo echoListOfPeople($request);
        //echo $requestText;
        $request->closeCursor();
    }

    /**
     * Return a list of people in a HTML format.
     * $request : the result of an PDO SQL request. 
     */
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
                    <div class="row mx-1 mb-3 px-2 py-2 rounded peopleCard" onMouseOver="showButtonAdd(this)" onMouseLeave="hideButtonAdd(this)" onClick="showPeopleInfo('.$id.')" draggable="true" onDragStart="dragPeople(event, '.$id.')">
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

                        <div class="col-auto d-flex flex-column justify-content-center pl-3">
                            <button class="btn btn-light btn-custom-flat hidden" onClick="addPeopleToFinalList('.$id.')"> <i class="fas fa-plus" aria-hidden="true"></i> </button>
                        </div>
                    </div>
            ';
        }

        $request->closeCursor();
    }

    /**
     * Return all the information of the chosen people
     */
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
    
    /**
     * Return the HTML for the list of chosen people
     */
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
            
            echo '  <div onMouseOver="showDeleteButton(this)" onMouseLeave="hideDeleteButton(this)"class=" mx-1 my-1 peopleFinalListImage" data-toggle="tooltip" data-html="true" title="'.$name.'">
                        <div class="peopleFinalListDeleteBtn hidden" onclick="removePeople(this, '.$id.')">
                            <p style="text-align: center; margin-top: 2px; padding-bottom: 0px;"> <i class="fas fa-trash" aria-hidden="true"></i> Delete </p>
                        </div>
                        <img src="'.$picture.'" alt="'. $name.'" class=" mw-100 mh-100 align-self-center"/>
                    </div>'
                    ;
        }
    }

    /**
     * Return the HTML needed to show the carouel of chosen people
     */
    function getPeopleCarousel($dataSended){
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
            
            echo '  <div class="cloud9-item">
                        <img class="peopleCarouselImg rounded-circle" src="'.$picture.'" alt="'.$name.'" />
                        <span style="visibility:hidden">'.$id.'</span> 
                    </div>';
        }
    }


    /**
     * Return all the language on the people DB
     */
    function getAllLanguage(){
        $bdd = accessBDD();
        $request = $bdd->query('SELECT DISTINCT(language) FROM people ORDER BY language');

        while($data = $request->fetch()){
            echo '<a href="#" class="list-group-item list-group-item-action" data-dismiss="modal" onClick="changeLanguage(\''.$data['language'].'\')">'.$data['language'].'</a>';
        }

        $request->closeCursor();
    }

    /**
     * Return all the role on the people DB
     */
    function getAllRole(){
        $bdd = accessBDD();
        $request = $bdd->query('SELECT DISTINCT(role) FROM people ORDER BY role');

        while($data = $request->fetch()){
            echo '<a href="#" class="list-group-item list-group-item-action" data-dismiss="modal" onClick="changeRole(\''.$data['role'].'\')">'.$data['role'].'</a>';
        }

        $request->closeCursor();
    }