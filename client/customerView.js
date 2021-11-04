//const BASE_URL = "http://localhost/or/backend/restaurant.php";

const BASE_URL = "https://www.rapid-speech.com/ws2021/mandators/ws2021/STUDENT_4_WS2021/clients/client_student4/backend/restaurant.php"

let isRestautantView = false;

$(document).ready(function () {

    initCustomerView();

    getMenu();

    createHelperBox();


    $("#btn21").click(function () {

        itemID = Math.floor(Math.random() * 100);

        addItemToBasket(1000, 1);
    });

    $("#btn22").click(function () {

        deleteItemFromBasket(1000);

    });

    $("#btn23").click(function () {

        clearCustomerBasket();
    });


    $("#btn24").click(function () {



        placeOrder();




    });



});

function openOrderCreatedModal(order) {
    const modal = "#orderModal";

    let countdown = 5;

    const { date, items, orderId, price, state, tax } = order;

    const mTax = formatDecimalNumber(tax);
    const mPrice = formatDecimalNumber(price);


    $("<div/>", {
        class: "modal-dialog modal-dialog-centered modal-xl",
        html: `
        <div class="modal-content">
        <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel">Bestellung: ${orderId}</h5>
            <div id="countdown" class="fw-bold"> ${countdown} </div>
        </div>
        <div class="modal-body" id="modal-body">
        <table class="table table-striped">
        <thead>
        <tr>
          <th scope="col">ID</th>
          <th scope="col">TITLE</th>
          <th scope="col">QUANTITY</th>
          <th scope="col">PRICE</th>
          <th scope="col">TAX</th>
          <th scope="col">TOTAL</th>
        </tr>
      </thead>
      <tbody id="order-items"> 
    </tbody>
    </table>
        </div>
    </div>
        `
    }).appendTo("#orderModal")




    Object.keys(items).forEach((key) => {



        let { id, title, totalPrice, itemPrice, quantity, tax } = items[key];

        totalPrice = formatDecimalNumber(totalPrice);

        itemPrice = formatDecimalNumber(itemPrice);

        tax = formatDecimalNumber(tax);


        $('<tr/>', {
            dataId: `order-element-${id}`,
            class: "fade-in-text",
            html: `
                     <td>${id}</td>
                     <td>${title}</td>
                     <td>${quantity}</td>
                     <td>${itemPrice}</td>
                     <td>${tax}</td>
                     <td>${totalPrice}</td>`
        }).appendTo("#order-items")

    })


    $("#modal-body").append(`<div class="d-flex flex-row justify-content-between border-top border-primary">
     
    <div class="d-flex flex-column">
    <span class="fw-bold">Datum:</span> 
    <span> ${date}</span>
    </div>

    <div class="d-flex flex-column">
    <span class="fw-bold">State</span> 
    <span> ${"OPEN"} </span>
    </div>

    <div class="d-flex flex-column">
    <span class="fw-bold">TAX</span> 
    <span> ${mTax} </span>
    </div>

    <div class="d-flex flex-column">
    <span class="fw-bold">Total</span> 
    <span> ${mPrice} </span>
    </div>

    </div>`)


    $(modal).modal('show');

    const interval = setInterval(() => {

        countdown--;
        $("#countdown").text(countdown);

    }, 1000)

    setTimeout(() => {
        clearInterval(interval);
        $("#orderModal").empty();
        $(modal).modal('hide');
        initBasket();
    }, countdown * 1000)


}


function renderInitalBasket() {



    $("#basket").empty();

    $('<div/>', {
        class: 'card h-100',
        html: '<div class="card-body d-flex flex-column" id="basket-body"></div>'
    }).appendTo("#basket");


    $('<div/>', {
        class: 'card-title border-bottom',
        html: '<h5>Basket:</h5>'
    }).appendTo("#basket-body");

    $('<div/>', {
        id: "basket-list-empty",
        class: "flex-grow-1 d-flex align-self-center",
        html: `<span class="align-middle"> basket is empty! </span>`
    }).appendTo("#basket-body");


    updateBasket("-", "-");

}

function deleteBasketItem(id) {


    const htmlID = `basket-element-${id}`;


    $(`#${htmlID}`).remove();

    if ($("#basket-items tr").length == 0) {

        $("#basket-list").remove();

        $('<div/>', {
            id: "basket-list-empty",
            class: "flex-grow-1 d-flex align-self-center",
            html: `<span class="align-middle"> basket is empty! </span>`
        }).appendTo("#basket-body");

    }

}

function createBasketItem(id, price, total, title, quantity, tax) {


    const htmlID = `basket-element-${id}`;


    if ($("#basket-list-empty").length) {

        $("#basket-list-empty").remove();


        $('<div/>', {
            class: 'flex-grow-1',
            id: "basket-list",
            html: `
            <table class="table table-striped">
            <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">TITLE</th>
              <th scope="col">QUANTITY</th>
              <th scope="col">PRICE</th>
              <th scope="col">TAX</th>
              <th scope="col">TOTAL</th>
            </tr>
          </thead>
          <tbody id="basket-items"> 
        </tbody>
        </table>`
        }).appendTo('#basket-body');

    }


    if ($(`#${htmlID}`).length) {

        $(`#${htmlID}`).remove();

    }


    return $('<tr/>', {
        dataId: `basket-element-${id}`,
        class: "fade-in-text",
        id: `${htmlID}`,
        html: `
      <td>${id}</td>
      <td>${title}</td>
      <td>${quantity}</td>
      <td>${price}</td>
      <td>${tax}</td>
      <td>${total}</td>`
    }).appendTo("#basket-items");


}

function updateBasket(tax, price) {

    /*  const htmlID = `basket-element-${id}`; */

    if ($(`#basket-meta`).length) {

        $(`#basket-meta`).remove();

    }

    $('<div/>', {
        id: "basket-meta",
        class: "border-top border-primary border-5",
        html: `<div class="d-flex flex-row  align-items-center justify-content-between"> 
           
           <div class="d-flex flex-row">
           <span class="fw-bold"> Tax:</span>
           <span> ${tax} €</span>
           </div>
   
           <div class="d-flex flex-row">
           <span class="fw-bold"> Total:</span>
           <span> ${price} €</span>
           </div>
           
           </div>`
    }).appendTo("#basket-body");




};

function getMenu() {

    try {
        fetch(BASE_URL + "/?menu")
            .then(response => response.json())
            .then(data => {

                let html = "";

                const containerId = "#menu"

                if (data.status === 200) {

                    const menu = data.data;

                    const menuList = Object.keys(menu).map(key => {

                        const menuItem = menu[key];
                        return $('<li/>', {
                            dataId: `${key}`,
                            class: "list-group-item",
                            html: `<div class="menu-item d-flex justify-content-between" id="${"menu" + key}">
                            
                            <div class="d-flex flex-column flex-grow-1">
                            <img src="${menuItem.image}" width="200"/>
                    
                            <span class="fw-bold" style="width:200px;"> ${menuItem.title}  </span>
                            </div>

                        <div class="d-flex flex-row">

                        <div class="d-flex flex-column me-5">
                        <span>Price:</span>
                            <span class="fw-bold fs-4">${menuItem.price} €</span>

                            </div>
                            <div class="d-flex flex-column">

                            <span> Nummer: </span>
                            <span class="fw-bold fs-3"> ${key} </span>
                         
                            </div>
                            </div>

                            </div>`
                        });

                    });

                    $('<div/>', {
                        class: 'card',
                        html: '<div class="card-body" id="card-body"></div>'
                    }).appendTo("#menu");


                    $('<div/>', {
                        class: 'card-title border-bottom',
                        html: '<h5>Restaurant menu</h5>'
                    }).appendTo("#card-body");


                    $('<ul/>', {
                        class: 'list-group list-group-flush',
                        html: menuList
                    }).appendTo('#card-body');


                } else {

                    $('<ul/>', {
                        class: 'list-group list-group-flush',
                        html: `<div><span>${data.statusText}</span></div>`
                    }).appendTo('#card-body');


                }


            });



    } catch (error) {

        showInfo(error.message, "error");
    }



}




function loadAvatar() {

    const list = $('<div/>', {
        html: `<div class="d-flex justify-content-between"> basket is empty! </div>`
    });

    $('<div/>', {
        class: 'card',
        html: '<div class="card-body" id="avatar-body"></div>'
    }).appendTo("#avatar");


    $('<div/>', {
        class: 'card-title border-bottom',
        html: '<h5>Avatar</h5>'
    }).appendTo("#avatar-body");


    $('<ul/>', {
        class: 'list-group list-group-flush',
        html: list
    }).appendTo('#avatar-body');



}


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

    name: "Bestellung initiieren: ",
    example: "Starte Bestellung, Bestellung starten,...",
    function: undefined
},
{
    name: "Item hinzufügen:",
    example: "Füge Nummer ARTIKELID hinzu, füge Artikel ARTIKELID hinzu,...",
    function: () => {
        const v = $("#in-1").val();
        addItemToBasket(v, 1)
    }
},
{
    name: "Item löschen:",
    example: "Lösche Nummer ARTIKELID aus der Bestellung, Lösche ARTIKELID aus der Bestellung,....",
    function: () => {
        const v = $("#in-1").val();
        deleteItemFromBasket(v);
    }
},

{
    name: "Bestellung abbrechen:",
    example: "Bestellung abbrechen, brich Bestellung ab,...",
    function: () => { clearCustomerBasket() }
},

{
    name: "Eine Bestellung abschließen: ",
    example: "Bestellung abschließen, schließe Bestellung ab,... ",
    function: () => placeOrder()
},
]


