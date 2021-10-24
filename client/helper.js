
function readMessage(message) {
    sayText(message, 3, 3, 2);
}


function getBasketID() {

    return localStorage.getItem("basketID");

}


function setBasketID(id) {


    localStorage.setItem("basketID", id);

}

function clearBasket() {

    localStorage.clear();
}


function formatDecimalNumber(val) {

    return Math.round(val * 100) / 100;

}

function setOrderToLocalStorage(id) {

    const plainOrders = localStorage.getItem("orders");

    const orders = plainOrders ? JSON.parse(plainOrders) : [];

    orders.push(id);

    localStorage.setItem("orders", JSON.stringify(orders));
}


function getOrdersFromLocalStorage() {


    const plainOrders = localStorage.getItem("orders");

    return plainOrders ? JSON.parse(plainOrders) : [];

}