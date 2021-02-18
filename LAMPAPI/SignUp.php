<?php
	$inData = getRequestInfo();
	$firstName = $inData["firstName"];
	$lastName = $inData["lastName"];
	$login = $inData["login"];
	$password = $inData["password"];

	$conn = new mysqli("localhost", "root", "632021Contastic", "Contastic");
	if ($conn->connect_error)
	{
		returnWithError($conn->connect_error);
	}

	else
	{
    $sql = "SELECT * FROM Users WHERE Login=?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $login);
    $stmt->execute();
    $result = $stmt->get_result();
    if($result->num_rows > 0)
    {
      returnWithError("Username has already been taken");
    }
		else
    {
      $sql = "INSERT INTO Users (FirstName, LastName, Login, Password) VALUES (?, ?, ?, ?)";
  		$stmt = $conn->prepare($sql);
  		$stmt->bind_param("ssss", $firstName, $lastName, $login, $password);
      $stmt->execute();
			$sql = "SELECT ID FROM Users WHERE Login=?";
			$stmt = $conn->prepare($sql);
			$stmt->bind_param("s", $login);
			$stmt->execute();
			$result = $stmt->get_result();
			$row = $result->fetch_assoc();
			$id = $row["ID"];
			$conn->close();

			returnWithInfo($firstName, $lastName, $id);
    }
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

	function returnWithInfo( $firstName, $lastName, $id )
	{
		$retValue = '{"id":' . $id . ',"firstName":"' . $firstName . '","lastName":"' . $lastName . '","error":""}';
		sendResultInfoAsJson( $retValue );
	}

?>
