<?php
	$inData = getRequestInfo();
	$firstName = $inData["firstName"];
	$lastName = $inData["lastName"];
	$phone = $inData["phone"];
	$email = $inData["email"];
	$contactID = $inData["id"];

	$conn = new mysqli("localhost", "root", "632021Contastic", "Contastic");
	if ($conn->connect_error)
	{
		returnWithError($conn->connect_error);
	}

	else
	{
		$sql = "UPDATE Contacts SET FirstName=?, LastName=?, Phone=?, Email=? WHERE id=?";
		$stmt = $conn->prepare($sql);
		$stmt->bind_param("ssdsd", $firstName, $lastName, $phone, $email, $contactID);
		$stmt->execute();
		$conn->close();
		returnWithInfo("Contact updated");
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
