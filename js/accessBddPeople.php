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
        $toReturn = $request->fetchAll();
        echo json_encode($toReturn);
        
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
        
        $peopleInfo = array(
            'age' => $age,
            'name' => $name,
            'picture' => $picture,
            'language' => $language,
            'role' => $role,
            'microType' => $microType,
            'studio' => $studio,
            'outDoor' => $outDoor,
        );

        echo json_encode($peopleInfo);

        $request->closeCursor();
    }
    
    /**
     * Return the list of chosen people
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

        $request = $bdd->query('SELECT * FROM people WHERE id in ('.$idList.')');

        echo json_encode($request->fetchAll());

        $request->closeCursor();

    }

    /**
     * Return all the language on the people DB
     */
    function getAllLanguage(){
        $bdd = accessBDD();
        $request = $bdd->query('SELECT DISTINCT(language) FROM people ORDER BY language');

        echo json_encode($request->fetchAll());       

        $request->closeCursor();
    }

    /**
     * Return all the role on the people DB
     */
    function getAllRole(){
        $bdd = accessBDD();
        $request = $bdd->query('SELECT DISTINCT(role) FROM people ORDER BY role');

        echo json_encode($request->fetchAll());       

        $request->closeCursor();
    }