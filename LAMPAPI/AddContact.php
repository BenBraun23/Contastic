<?php
	$inData = getRequestInfo();
	$firstName = $inData["firstName"];
	$lastName = $inData["lastName"];
	$phone = $inData["phone"]; // make optional
	$email = $inData["email"]; // make optional
	$id = $inData["id"];
// update contact takes all parameters
	$conn = new mysqli("localhost", "root", "632021Contastic", "Contastic");
	if ($conn->connect_error)
	{
		returnWithError($conn->connect_error);
	}

	else
	{
		$sql = "INSERT INTO Contacts (FirstName, LastName, Phone, Email, UserID)
						VALUES (?, ?, ?, ?, ?)";
		$stmt = $conn->prepare($sql);
		$stmt->bind_param("ssdsd", $firstName, $lastName, $phone, $email, $id);
		$stmt->execute();
		$conn->close();
		returnWithInfo("Contact added");
	}


	function getRequestInfo()
	{
		return json_decode(file_get_contents('php://input'), true);
	}

	function sendResultInfoAsJson( $obj )
	{
		header('Content-type: application/json');
		echo $obj;
	}

	function returnWithError( $err )
	{
		$retValue = '{"id":0,"firstName":"","lastName":"","error":"' . $err . '"}';
		sendResultInfoAsJson($retValue);
	}

	function returnWithInfo( $message )
	{
		$retValue = '{"id":1, "message":"' . $message . '"}';
		sendResultInfoAsJson( $retValue );
	}

?>
