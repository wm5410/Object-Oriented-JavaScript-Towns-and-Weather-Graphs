<?php
// Include database connection
require_once('connect.php');  

try {
    // Create the SQL query
    $query = "SELECT * FROM town";

    // Send the SQL query to the database
    $result = $con->query($query);
    
    // Check if the query was successful
    if($result !== FALSE) {
        $data = [];

        // Fetch data and store it in an array
        while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
            $data[] = $row;
        }

        // Send the JSON response
        header('Content-Type: application/json');
        echo json_encode($data);
    } else {
        // Handle database query error
        echo "Error executing the query";
    }
} catch (PDOException $e) {
    // Handle database connection error
    echo "Database error: " . $e->getMessage();
}
?>
