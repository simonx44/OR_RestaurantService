<?php


/*

BASKET



INIT_BASKET => /?init  

CLEAR BASKET => /?clear=id

GET BASKET => /?basket=57164


DELETE ITEM IN BASKET -> /?deleteItem=1&basketId=57164



ADD ITEM TO BASKET -> /?addItem    BODY -> itemId quantity basketId


///// ORDERS

/ -> get all orders

GET ALL ORDERS => / | default  


GET ORDERS => /?orders={state} -> state: OPEN | CLOSED 


CREATE ORDER => ?create 


GET ORDER DETAILS => ?orderId={orderID}



// MENU

GET MENU  -> /?menu


*/

$GLOBALS["ORDERS_PATH"] = "./orders.json";
$GLOBALS["MENU_PATH"] = "./menu.json";
$GLOBALS["TAX_RATE"] = 0.19;

###############################################################
###############################################################
#####################     "Controller" :-) ####################
###############################################################
###############################################################



if (isset($_GET["reset"])) {


    return resetOrders();
}
// Get order details
else if (isset($_GET['orderId'])) {
    //GET ORDER BY ID
    $orderID = $_GET['orderId'];

    return getOrderDetails($orderID);
}

//update order
else if (isset($_GET['update'])) {
    //GET ORDER BY ID
    $orderID = $_GET['update'];

    updateOrder($orderID);
}


// Get basketID by id

else if (isset($_GET['basket'])) {


    return getBasket($_GET['basket']);
}


// clear basket

else if (isset($_GET['clear'])) {


    return clearBasket($_GET['clear']);
}

//create new Order

else if (isset($_GET['create'])) {

    return createOrder($_GET['create']);
}

// Init basket

else if (isset($_GET['init'])) {

    return initBasket();
}

// delete item in basket

else if (isset($_GET['deleteItem']) && isset($_GET['basketId'])) {
    //DELETE ITEM FROM ORDER
    $itemId = $_GET['deleteItem'];
    $basketId = $_GET['basketId'];
    return deleteItemFromBasket($itemId, $basketId);
}

// Add item to basket

else if (isset($_GET['addItem'])) {

    $quantity = $_POST["quantity"];
    $itemId =  $_POST["itemId"];
    $basketId = $_POST["basketId"];


    addItemToBasket($itemId, $quantity, $basketId);
    return;
}

// Get MENU

else if (isset($_GET['menu'])) {

    return getMenu();
} else if (isset($_GET['orders'])) {

    return listOrders($_GET['orders']);
}
// Default Route: show all orders

else {
    // GET ALL ORDERS
    return  listOrders("ALL");
}

###############################################################
###############################################################
#####################     Services  ###########################
###############################################################
###############################################################
function resetOrders()
{
    $initJson = (object) [
        "basket" => (object) [],
        "orders" => (object) ["OPEN" => (object)[], "CLOSED" => (object)[]]
    ];

    file_put_contents($GLOBALS["ORDERS_PATH"], json_encode($initJson));

    return httpResponse("cleard", null, 200);
}

function getMenu()
{

    try {

        $menu = readJson($GLOBALS["MENU_PATH"]);

        return  httpResponse("success", $menu, 200);
    } catch (Exception $e) {
        return httpResponse($e->getMessage(), null, 400);
    }
}

function initBasket()
{


    $basketId = rand(1000, 99999);

    try {
        $data = readJson($GLOBALS["ORDERS_PATH"]);

        $data["basket"][$basketId] = (object)[
            "price" => 0,
            "tax" => 0,
            "items" => (object)[]
        ];

        file_put_contents($GLOBALS["ORDERS_PATH"], json_encode($data));

        return  httpResponse("success", $basketId, 200);
    } catch (Exception $e) {
        return httpResponse($e->getMessage(), null, 400);
    }
}

/**
 * $orderId - orderId
 * $httpBody - Format: 
 * {
 *  itemId: number;
 *  quantity: number;
 * }
 */
function addItemToBasket($itemId, $quantity, $basketId)
{
    try {

        $data = readJson($GLOBALS["ORDERS_PATH"]);
        $menu = readJson($GLOBALS["MENU_PATH"]);


        if (isAvailable($itemId) || isAvailable($quantity) || isAvailable($basketId)) {

            return httpResponse("invalid body", null, 400);
        } else if (!isset($data["basket"][$basketId])) {

            return httpResponse("BasketId invalid", $basketId, 400);
        } else if (!isset($menu[$itemId])) {
            return httpResponse("Item does not exists", $itemId, 400);
        }


        $item = $menu[$itemId];

        $price = intval($quantity) * intval($item["price"]);

        $basket = $data["basket"][$basketId];


        // Item already in basket

        if (isset($basket["items"][$itemId])) {

            $orderItem = $basket["items"][$itemId];

            $orderItem["quantity"] += $quantity;

            $orderItem["totalPrice"] += $price;

            $orderItem["tax"] += $price * $GLOBALS["TAX_RATE"];

            $basket["price"] +=  $price;

            $basket["tax"] += $price * $GLOBALS["TAX_RATE"];

            $basket["items"][$itemId] = $orderItem;
        } else {
            // add Item to basket
            $basketItem = (object) [
                "id" => $itemId,
                "title" => $item["title"],
                "totalPrice" =>  $price,
                "itemPrice" =>   $item["price"],
                "quantity" =>  $quantity,
                "tax" => $price * $GLOBALS["TAX_RATE"]
            ];


            $basket["items"][$itemId] = $basketItem;
            $basket["price"] = $basket["price"] + $price;
            $basket["tax"] = $basket["tax"] + $price * $GLOBALS["TAX_RATE"];
        }


        $data["basket"][$basketId] = $basket;

        file_put_contents($GLOBALS["ORDERS_PATH"], json_encode($data));

        $response = (object)["basket" => $basket["items"][$itemId], "tax" => $basket["tax"], "price" => $basket["price"]];


        return httpResponse("success",  $response, 200);
    } catch (Exception $e) {
        return httpResponse($e->getMessage(), null, 400);
    }
}

function deleteItemFromBasket($itemId, $basketId)
{

    try {

        $basketId =  transformParameter($basketId);
        $itemID = transformParameter($itemId);
        $data = readJson($GLOBALS["ORDERS_PATH"]);
        $menu = readJson($GLOBALS["MENU_PATH"]);
        $message = "Item with id: " . $itemID . " deleted";

        $basket = $data["basket"];

        if (!isset($basket[$basketId])) {

            return httpResponse("Basket with id: " . $basketId . " does not exists", null, 404);
        } else if (!isset($basket[$basketId]["items"][$itemID])) {

            return httpResponse("Item with id: " . $itemId . " does not exists", null, 404);
        } else  if (!isset($menu[$itemID])) {
            return httpResponse("Item does not exists", $menu, 400);
        }

        $basket = $data["basket"][$basketId];

        $quantity = $basket["items"][$itemID]["quantity"];

        $price =  $menu[$itemID]["price"] * $quantity;

        $basket["price"] -= $price;

        $basket["tax"] -= $price * $GLOBALS["TAX_RATE"];

        unset($basket["items"][$itemID]);

        $data["basket"][$basketId] = $basket;

        file_put_contents($GLOBALS["ORDERS_PATH"], json_encode($data));

        $response = (object)[
            "id" => $itemID,
            "tax" => $basket["tax"],
            "price" => $basket["price"]
        ];

        return httpResponse($message, $response, 200);
    } catch (Exception $e) {
        return httpResponse("error occured", null, 400);
    }
}

function clearBasket($basketId)
{

    $data = readJson($GLOBALS["ORDERS_PATH"]);

    if (isAvailable($basketId)) {

        return httpResponse("no basket id", null, 400);
    } else if (!isset($data["basket"][$basketId])) {

        return httpResponse("there is no basket with given id", null, 400);
    }


    $data["basket"][$basketId] = (object)[
        "price" => 0,
        "tax" => 0,
        "items" => (object)[]
    ];



    file_put_contents($GLOBALS["ORDERS_PATH"], json_encode($data));

    return  httpResponse("success", null, 200);
}

function getBasket($basketId)
{

    $data = readJson($GLOBALS["ORDERS_PATH"]);

    if (isAvailable($basketId)) {

        return httpResponse("no basket id", null, 400);
    } else if (!isset($data["basket"][$basketId])) {

        return httpResponse("there is no basket with given id", null, 400);
    }

    $response = $data["basket"][$basketId];

    return  httpResponse("success", $response, 200);
}

function listOrders($state)
{

    try {

        if ($state != "OPEN" && $state != "CLOSED" && $state != "ALL") {

            return httpResponse("no valid state", null, 400);
        }

        $data = readJson($GLOBALS["ORDERS_PATH"]);

        if ($state == "ALL") {


            $orders = $data["orders"];
        } else {


            $orders = $data["orders"][$state];
        }

        return  httpResponse("success", $orders, 200);
    } catch (Exception $e) {
        return httpResponse($e->getMessage(), null, 400);
    }
}


function getOrderDetails($orderID)
{

    $state = "OPEN";

    try {
        $orderId = transformParameter($orderID);
        $data = readJson($GLOBALS["ORDERS_PATH"]);

        if (!isset(($data["orders"][$state][$orderId]))) {
            return httpResponse("Order with id: " . $orderID . " does not exists", null, 404);
        }

        $requestedOrder = $data["orders"][$state][$orderId];

        httpResponse("success", $requestedOrder, 200);
    } catch (Exception $e) {
        return httpResponse($e->getMessage(), null, 400);
    }
}

function updateOrder($orderID)
{

    try {


        $state = "OPEN";
        $newState = "CLOSED";

        $orderId = transformParameter($orderID);
        $data = readJson($GLOBALS["ORDERS_PATH"]);

        if (!isset(($data["orders"][$state][$orderId]))) {
            return httpResponse("Order with id: " . $orderID . " does not exists", null, 404);
        }

        $requestedOrder = $data["orders"][$state][$orderId];

        unset($data["orders"][$state][$orderId]);

        $data["orders"][$newState][$orderId] = $requestedOrder;

        file_put_contents($GLOBALS["ORDERS_PATH"], json_encode($data));

        return httpResponse("success", null, 200);
    } catch (Exception $e) {
        return httpResponse($e->getMessage(), null, 400);
    }
}

function createOrder($basketId)
{

    try {
        $basketId = transformParameter($basketId);
        $data = readJson($GLOBALS["ORDERS_PATH"]);

        $orderId = rand(1000, 99999);

        $message =  "Order with id: " . $orderId . " created";

        if (!isset($data["basket"][$basketId])) {
            return httpResponse("Basket does not exists", null, 400);
        }

        $basket = $data["basket"][$basketId];

        $items =  $basket["items"];

        $keys = array_keys((array)$items);

        if (sizeof($keys) == 0) {
            return httpResponse("No items in basket", null, 400);
        }


        $order = (object) [

            "date" => date("Y/m/d"),
            "orderId" => $orderId,
            "price" => $basket["price"],
            "tax" => $basket["tax"],
            "items" => $items,
        ];

        unset($data["basket"][$basketId]);

        $data["orders"]["OPEN"][$orderId] = $order;

        file_put_contents($GLOBALS["ORDERS_PATH"], json_encode($data));

        $response = (object)[
            "id" => $orderId,
            "order" => $order
        ];

        return  httpResponse($message, $response, 200);
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
