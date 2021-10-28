const BASE_URL = "http://localhost/or/backend/restaurant.php";

//const BASE_URL = "https://www.rapid-speech.com/ws2021/mandators/ws2021/STUDENT_4_WS2021/clients/client_student4/backend/restaurant.php"

$(document).ready(function () {


    getOrderOverview("OPEN");




    $("#btn-1").click(function () {
        getOrderDetails(81220);

    })

});


function showInfo(message, type) {

    $('#error').empty();

    let iconStyle = type === "error" ? "bi bi-bug text-danger" : "bi bi-bag-check text-success";

    let shownType = type === "error" ? "Error" : "Info";

    $("<div/>", {
        class: "card info-animation",
        html: `<div class="card-body">
    
        <div>
        <i class="${iconStyle}"></i>
           <span class="fw-bold"> ${shownType}:</span>
           <span>${message}</span>
        </div>
        </div>`
    }).appendTo("#error")
}


function renderOrders(orders, status) {

    //date, orderId, price, tax , status

    const title = status === "OPEN" ? "Offene" : "Geschlossene";



    $("<div/>", {



        html: `
            <div class="card" data-dashlane-rid="5e270fcf4ac9eed1" data-form-type="search">
                <div class="card-header">
                    <h3 class="card-title"> ${title} Bestellungen </h3>
                </div>
                <div class="table-responsive">
                    <table class="table card-table table-vcenter text-nowrap datatable">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Bestelldatum</th>
                                <th>Steuen</th>
                                <th>Preis</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody id="orders-body">


                  

                        </tbody>
                    </table>
                </div>
            </div>`



    }).appendTo("#orders");


    Object.keys(orders).forEach((key) => {

        console.log(orders);

        const order = orders[key];

        console.log("jdsjns")
        console.log(order);

        const { date, orderId, price, tax } = order;

        const color = status === "OPEN" ? "#67b825" : "red";

        $("<tr/>", {

            id: `${orderId}`,
            html: ` <th>${orderId}</th>
        <th>${date}</th>
        <th>${tax}</th>
        <th>${price}</th>
        <th>
        <div class="d-flex flex-row justify-content-center align-items-center">
        <span class="me-2">${status}</span>
        <div class="border rounded-circle" 
        style="
        background-color: ${color};
        width: 14px;
        height: 14px;
        "
    ></div>
    </div>
    </th>`

        }).appendTo("#orders-body");





    })






}



function renderOrderDetails(order) {

    let { date, orderId, price, tax, items } = order;


    let mTax = Math.floor(tax * 100) / 100;

    let mPrice = Math.floor(price * 100) / 100;


    $("#orders").empty();


    $("<div/>", {



        html: `
            <div class="card" data-dashlane-rid="5e270fcf4ac9eed1" data-form-type="search">
                <div class="card-header">
                    <h3 class="card-title"> Bestellungsdetails zur Bestellung: ${orderId} </h3>
                    <div id="card-footer" class="m-3"></div>
                </div>
                <div class="table-responsive">
                    <table class="table card-table table-vcenter text-nowrap datatable">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>GERICHT</th>
                                <th>MENGE</th>
                                <th>PREIS</th>
                                <th>GESAMTPREIS</th>
                                <th>STEUERN</th>
                         
                            </tr>
                        </thead>
                        <tbody id="details-body">


                  

                        </tbody>
                    </table>
                </div>
             
            </div>`



    }).appendTo("#orders");



    Object.keys(items).forEach((key) => {


        let { id, title, totalPrice, itemPrice, quantity, tax } = items[key];

        totalPrice = Math.floor(totalPrice * 100) / 100;
        itemPrice = Math.floor(itemPrice * 100) / 100;
        tax = Math.floor(tax * 100) / 100;


        //const color = status === "OPEN" ? "#67b825" : "red";

        $("<tr/>", {

            id: `item-${id}`,
            html: ` 
        <th>${id}</th>
        <th>${title}</th>
        <th>${quantity}</th>
        <th>${itemPrice}</th>
        <th>${totalPrice}</th>
        <th>${tax}</th >`


        }).appendTo("#details-body");



        $("#card-footer").append(`<div class="d-flex flex-row justify-content-between">
     
        <div class="d-flex flex-column">
        <span class="fw-bold">Datum:</span> 
        <span> ${date}</span>
        </div>
    
    
        <div class="d-flex flex-column">
        <span class="fw-bold">TAX</span> 
        <span> ${mTax} </span>
        </div>
    
        <div class="d-flex flex-column">
        <span class="fw-bold">Total</span> 
        <span> ${mPrice} </span>
        </div>
    
        <div class="d-flex flex-column">
        <span class="fw-bold">ID</span> 
        <span> ${orderId} </span>
        </div>

        </div>`)






    })









}