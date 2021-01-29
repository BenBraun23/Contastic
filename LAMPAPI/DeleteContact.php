<?php
	$inData = getRequestInfo();
	$id = $inData["id"];

	$conn = new mysqli("localhost", "root", "632021Contastic", "Contastic");
	if ($conn->connect_error)
	{
		returnWithError($conn->connect_error);
	}

	else
	{
		$sql = "DELETE FROM Contacts WHERE id=?";
		$stmt = $conn->prepare($sql);
		$stmt->bind_param("d", $id);
		$stmt->execute();
		$conn->close();
		returnWithInfo("Contact deleted");
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
