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
		$sql = "SELECT id, FirstName, LastName, Phone, Email FROM Contacts WHERE UserID=?";
		$stmt = $conn->prepare($sql);
		$stmt->bind_param("d", $id);
		$stmt->execute();
		$result = $stmt->get_result();
		$dataSet = array();
		while($row = $result->fetch_assoc())
		{
			$dataSet[] = $row;
		}
		returnWithInfo($dataSet);
		$conn->close();
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
		$retValue = json_encode($message);
		sendResultInfoAsJson( '{"id":1, "results": "' . $retValue .'"}');
	}

?>
