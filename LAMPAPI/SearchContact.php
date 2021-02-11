<?php
	$inData = getRequestInfo();
	$id = $inData["id"];
    $first = $inData["firstName"];
    $last = $inData["lastName"];
    $phone = $inData["phone"];
    $email = $inData["email"];

	$conn = new mysqli("localhost", "root", "632021Contastic", "Contastic");
	if ($conn->connect_error)
	{
		returnWithError($conn->connect_error);
	}

	else
	{
		$sql = "select FirstName, LastName, Phone, Email from Contacts WHERE FirstName like '%".$first."%' and LastName like '%".$last."%' and Phone like '%".$phone."%' and Email like '%".$email."%' and UserID=".$id;
        $result = $conn->query($sql);

        if ($result->num_rows > 0)
        {
            $firstRes = "[";
            $lastRes = "[";
            $phoneRes = "[";
            $emailRes = "[";

            $count = 0;

            while($row = $result->fetch_assoc())
        	{
                if ($count > 0)
                {
                    $firstRes .= ",";
                    $lastRes .= ",";
                    $phoneRes .= ",";
                    $emailRes .= ",";
                }

                $count += 1;

                $firstRes .= '"'.$row["FirstName"].'"';
                $lastRes .= '"'.$row["LastName"].'"';
                $phoneRes .= '"'.$row["Phone"].'"';
                $emailRes .= '"'.$row["Email"].'"';
        	}

            $firstRes .= "]";
            $lastRes .= "]";
            $phoneRes .= "]";
            $emailRes .= "]";

            $array = array("firstName"=>$firstRes, "lastName"=>$lastRes, "phone"=>$phoneRes, "email"=>$emailRes);
        	returnWithInfo( $array );
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
		sendResultInfoAsJson( $retValue );
	}

	function returnWithInfo( $array )
	{
		$retValue = json_encode( $array );
		sendResultInfoAsJson( $retValue );
	}

?>
