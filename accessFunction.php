<?php
require_once 'js/accessBddPeople.php';
$fonction = $_POST['fonction'];
unset($_POST['fonction']);
$fonction($_POST);