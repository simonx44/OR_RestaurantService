<?php


/*

/ -> get all orders

DELETE ORDER  =>  ?cancel={id}  -> {id}: number  => 

CREATE ORDER => ?create 

GET ALL ORDERS => / | default  

CREATE ITEM IN ORDER -> /?addItem={orderId}  -> body needed

DELETE ITEM IN ORDER -> /?deleteItem={orderId}&itemId={itemId}

*/

$GLOBALS["ORDERS_PATH"] = "./orders.json";
$GLOBALS["MENU_PATH"] = "./menu.json";
$GLOBALS["TAX_RATE"] = 0.19;

###############################################################
###############################################################
#####################     "Controller" :-) ####################
###############################################################
###############################################################


// Get order details

if (isset($_GET['orderId'])) {
    //GET ORDER BY ID
    $orderID = $_GET['orderId'];

    return getOrderDetails($orderID);
}


//create new Order

else if (isset($_GET['create'])) {

    return createOrder();
}



//delete order

else if (isset($_GET['cancel'])) {
    $id = $_GET['cancel'];
    deleteOrderById($id);
}



// delete item in order

else if (isset($_GET['deleteItem']) && isset($_GET['itemId'])) {
    //DELETE ITEM FROM ORDER
    $orderId = $_GET['deleteItem'];
    $itemId = $_GET['itemId'];
    return deleteItemFromOrder($orderId, $itemId);
}


// Add item to order

else if (isset($_GET['addItem'])) {

    $orderId = $_GET['addItem'];
    $order = getPostBody();
    addItemToOrder($orderId, $order);
    return;
}

// Default Route: show all orders

else {
    // GET ALL ORDERS
    listOrders();
}

###############################################################
###############################################################
#####################     Services  ###########################
###############################################################
###############################################################


/**
 * $orderId - orderId
 * $orderBody - Format: 
 * {
 *  itemId: number;
 *  quantity: number;
 * }
 * 
 *  
 */
function addItemToOrder($orderId, $orderBody)
{
    try {


        $orderID = transformParameter($orderId);
        $orders = readJson($GLOBALS["ORDERS_PATH"]);
        $menu = readJson($GLOBALS["MENU_PATH"]);

        if (!isset($orders[$orderID])) {
            return httpResponse("Order with id: " . $orderID . " does not exists", null, 404);
        } else if (!isset($orderBody["itemId"]) || !isset($orderBody["quantity"])) {

            return httpResponse("incorrect body", null, 400);
        } else if (!isset($menu[$orderBody["itemId"]])) {
            return httpResponse("Item does not exists", $orderBody->itemId, 400);
        }


        $item = $menu[$orderBody["itemId"]];

        $price = intval($orderBody["quantity"]) * intval($item["price"]);

        $order = $orders[$orderID];


        // Item already in basket

        if (isset($order["items"][$orderBody["itemId"]])) {

            $orderItem =  $order["items"][$orderBody["itemId"]];

            $orderItem["quantity"] += $orderBody["quantity"];

            $orderItem["totalPrice"] += $price;

            $orderItem["tax"] += $price * $GLOBALS["TAX_RATE"];

            $order["price"] +=  $price;

            $order["tax"] += $price * $GLOBALS["TAX_RATE"];

            $order["items"][$orderBody["itemId"]] = $orderItem;
        } else {
            // add Item to basket
            $basketItem = (object) [
                "title" => $item["title"],
                "totalPrice" =>  $price,
                "itemPrice" =>   $item["price"],
                "quantity" =>  $orderBody["quantity"],
                "tax" => $price * $GLOBALS["TAX_RATE"]
            ];


            $order["items"][$orderBody["itemId"]] = $basketItem;
            $order["price"] = $order["price"] + $price;
            $order["tax"] = $order["tax"] + $price * $GLOBALS["TAX_RATE"];
        }


        $orders[$orderID] = $order;

        file_put_contents($GLOBALS["ORDERS_PATH"], json_encode($orders));

        return httpResponse("success", $order, 200);
    } catch (Exception $e) {
        return httpResponse($e->getMessage(), null, 400);
    }
}

function deleteItemFromOrder($orderId, $itemId)
{

    try {

        $orderID = transformParameter($orderId);
        $itemID = transformParameter($itemId);
        $orders = readJson($GLOBALS["ORDERS_PATH"]);
        $message = "Item with id: " . $itemID . " deleted";

        if (!isset(($orders[$orderID]))) {
            return httpResponse("Order with id: " . $orderID . " does not exists", null, 404);
        } else if (!isset(($orders[$orderID]["items"][$itemID]))) {

            return httpResponse("Item with id: " . $itemId . " does not exists", null, 404);
        }

        unset($orders[$orderID]["items"][$itemId]);

        file_put_contents($GLOBALS["ORDERS_PATH"], json_encode($orders));

        return httpResponse($message, "", 200);
    } catch (Exception $e) {
        return httpResponse("error occured", null, 400);
    }
}

function listOrders()
{

    try {
        $orders = readJson($GLOBALS["ORDERS_PATH"]);
        return  httpResponse("success", $orders, 200);
    } catch (Exception $e) {
        return httpResponse($e->getMessage(), null, 400);
    }
}


function getOrderDetails($orderID)
{

    try {
        $orderId = transformParameter($orderID);
        $orders = readJson($GLOBALS["ORDERS_PATH"]);

        if (!isset(($orders[$orderId]))) {
            return httpResponse("Order with id: " . $orderID . " does not exists", null, 404);
        }

        $requestedOrder = $orders[$orderId];

        httpResponse("success", $requestedOrder, 200);
    } catch (Exception $e) {
        return httpResponse($e->getMessage(), null, 400);
    }
}

function deleteOrderById($id)
{

    try {
        $paramId = transformParameter($id);
        $orders = readJson($GLOBALS["ORDERS_PATH"]);

        if (empty($orders[$paramId]) || is_null($orders[$paramId])) {

            return httpResponse("Order with id: " . $id . " does not exists", null, 404);
        }

        unset($orders[$paramId]);

        $data = (object) [
            'message' => "Item with id: " . $id . " deleted"
        ];



        file_put_contents($GLOBALS["ORDERS_PATH"], json_encode($orders));

        return  httpResponse("Success", $data, 200);
    } catch (Exception $e) {
        return httpResponse($e->getMessage(), null, 400);
    }
}


function createOrder()
{

    try {
        $orders = readJson($GLOBALS["ORDERS_PATH"]);

        $orderId = rand(1000, 99999);

        $message =  "Order with id: " . $orderId . " created";


        $items = (object) [];

        $order = (object) [

            "date" => date("Y/m/d"),
            "orderId" => $orderId,
            "price" => 0,
            "tax" => 0,
            "state" => "not_ordered",
            "items" => $items
        ];



        $orders[strval($orderId)] = $order;

        file_put_contents($GLOBALS["ORDERS_PATH"], json_encode($orders));

        return  httpResponse($message, $orders, 200);
    } catch (Exception $e) {
        return httpResponse($e->getMessage(), null, 400);
    }
}


###############################################################
###############################################################
#####################     HELPER    ###########################
###############################################################
###############################################################

function httpResponse($message, $data, $status)
{
    // CORS HEADER
    header('Access-Control-Allow-Origin: *');
    header("Access-Control-Allow-Credentials: true");
    header('Access-Control-Allow-Methods: GET, PUT, POST, DELETE, OPTIONS');
    header('Access-Control-Max-Age: 1000');
    header('Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token , Authorization');
    header("HTTP/1.1 " . $status);

    $httpResponse = (object) [
        'status' => $status,
        'statusText' => $message,
        "data" => $data
    ];


    echo json_encode($httpResponse);
}



function transformParameter($id)
{

    if (empty($id) || is_null($id)) {

        throw new ErrorException("Parameter is missing");
    }

    // string is always 0
    $paramId = intval($id, 10);

    if ($paramId == 0) {
        throw new ErrorException("Parameter is not a number");
    }
    return $paramId;
}



function readJson($path)
{

    $orderData = file_get_contents($path);
    return json_decode($orderData, true);
}




function getPostBody()
{
    if (!empty($_POST)) {
        return $_POST;
    }

    $post = json_decode(file_get_contents('php://input'), true);
    if (json_last_error() == JSON_ERROR_NONE) {
        return $post;
    }

    return [];
}


function isAvailable($variable)
{

    return empty($variable) || is_null($variable);
}
