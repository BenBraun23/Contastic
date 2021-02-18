<?php
	$inData = getRequestInfo();
	$id = $inData["id"];
	$firstName = '%' . $inData["firstName"] . '%';
	$lastName = '%' . $inData["lastName"] . '%';
	$phone = '%' . $inData["phone"] . '%';
	$email = '%' . $inData["email"] . '%';
	$conn = new mysqli("localhost", "root", "632021Contastic", "Contastic");
	if ($conn->connect_error)
	{
		returnWithError($conn->connect_error);
	}
	else
	{
		$sql = "SELECT * FROM Contacts WHERE FirstName LIKE ? AND LastName LIKE ? AND Phone LIKE ? AND Email LIKE ? AND UserID=?";
		$stmt = $conn->prepare($sql);
		$stmt->bind_param("ssssd", $firstName, $lastName, $phone, $email, $id);
		$stmt->execute();
		$result = $stmt->get_result();
		if($result->num_rows > 0)
		{
			while($row = $result->fetch_assoc())
			{
				$array[] = array("firstName"=>$row["FirstName"], "lastName"=>$row["LastName"], "phone"=>$row["Phone"], "email"=>$row["Email"], "id"=>$row["id"]);
			}
			returnWithInfo($array);
			$conn->close();
		}
		else
		{
			returnWithError("No Results Found");
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

	function returnWithInfo( $message )
	{
		$retValue = json_encode($message);
		sendResultInfoAsJson( $retValue );
	}

?>
