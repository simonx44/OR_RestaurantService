//const BASE_URL = "http://localhost/or/backend/restaurant.php";

const BASE_URL = "https://www.rapid-speech.com/ws2021/mandators/ws2021/STUDENT_4_WS2021/clients/client_student4/backend/restaurant.php"

let isRestautantView = true;

$(document).ready(function () {


    getOrderOverview("OPEN");


    createHelperBox();



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

    $("#orders").empty();



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



        const order = orders[key];



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


function createHelperBox() {

    const boxId = "#helper-box";

    $(boxId).empty();

    $('<div/>', {
        class: 'card h-100',
        html: '<div class="card-body d-flex flex-column" id="helper-body"></div>'
    }).appendTo(boxId);


    $('<div/>', {
        class: 'card-title border-bottom',
        html: '<h5>How to:</h5>'
    }).appendTo("#helper-body");

    $('<div/>', {
        id: "helper-label",
        class: "d-flex align-self-center",
        html: `<div class="input-group mb-3">
        <input id="in-1" type="text" class="max-vh-10 form-control" placeholder="Bestellung bzw. Item"
            aria-label="Bestellung bzw. Item" aria-describedby="basic-addon1">
    </div>`
    }).appendTo("#helper-body");

    $('<div/>', {
        class: 'flex-grow-1',
        id: "helper-list",
        html: `
        <table class="table table-striped">
        <thead>
        <tr>
          <th scope="Funktion">ID</th>
          <th scope="Beispiele">TITLE</th>
          <th scope="col"></th>
        </tr>
      </thead>
      <tbody id="helper-items"> 
    </tbody>
    </table>`
    }).appendTo('#helper-body');


    helperContent.forEach((el, index) => {

        const btn = `btn_helper${index}`;

        $('<tr/>', {
            id: `helper-element-${el.name}`,
            class: "",
            html: `
                        <td>${el.name}</td>
                        <td>${el.example}</td>
                        <td><div id='${btn}' class="btn btn-primary ${el.function ? '' : 'disabled'}">Test</div></td>`
        }).appendTo("#helper-items")

        $(`#${btn}`).click(function () {
            el.function();
        });

    })

    //helperContent

}



const helperContent = [{

    name: "Auftragsbearbeitung initiieren:",
    example: "Aufträge starten, Auftragsbearbeitung starten,......",
    function: undefined
},
{
    name: "Bestimmte Bestellung anzeigen:",
    example: "Zeige Bestellung BESTELLID an, Zeige BESTELLID an,........",
    function: () => {
        const v = $("#in-1").val();
        getOrderDetails(v)
    }
},
{
    name: "Alle Bestellungen anzeigen:",
    example: "Zeige alle Bestellungen an, Alle Bestellungen anzeigen,.....",
    function: () => {

        getOrderOverview("OPEN")
    }
},

{
    name: "Eine Bestellung abschließen: ",
    example: " Ändere Status von BESTELLID auf closed, Status von BESTELLID auf fertig,....",
    function: () => {
        const v = $("#in-1").val();
        closeOrdner(v)
    }
},
]