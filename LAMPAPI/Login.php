<?php

	$inData = getRequestInfo();
	$login = $inData["login"];
	$password = $inData["password"];
	$id = 0;
	$firstName = "";
	$lastName = "";

	$conn = new mysqli("localhost", "root", "632021Contastic", "Contastic");
	if ($conn->connect_error)
	{
		returnWithError( $conn->connect_error );
	}
	else
	{
		$sql = "SELECT ID,firstName,lastName FROM Users where Login=? and Password=?";
		$stmt = $conn->prepare($sql);
    $stmt->bind_param("ss", $login, $password);
    $stmt->execute();
    $result = $stmt->get_result();
		if ($result->num_rows > 0)
		{
			$row = $result->fetch_assoc();
			$firstName = $row["firstName"];
			$lastName = $row["lastName"];
			$id = $row["ID"];
			$sql = "UPDATE Users SET DateLastLoggedIn=CURRENT_TIMESTAMP WHERE Login=?";
			$stmt = $conn->prepare($sql);
			$stmt->bind_param("s", $login);
			$stmt->execute();
			returnWithInfo($firstName, $lastName, $id );
		}
		else
		{
			returnWithError("No records found");
		}
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
		throw new Exception($err);
	}

	function returnWithInfo( $firstName, $lastName, $id )
	{
		$retValue = '{"id":' . $id . ',"firstName":"' . $firstName . '","lastName":"' . $lastName . '","error":""}';
		sendResultInfoAsJson( $retValue );
	}

?>
