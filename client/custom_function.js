$(document).ready(function () {
    initCustomerView();

    getMenu();

});



function addItemToBasket(itemId, quan) {

    try {

        const body = {

            basketId: getBasketID(),
            itemId,
            quantity: quan

        }
        const url = BASE_URL + "/?addItem";

        var formBody = [];
        for (var property in body) {
            var encodedKey = encodeURIComponent(property);
            var encodedValue = encodeURIComponent(body[property]);
            formBody.push(encodedKey + "=" + encodedValue);
        }
        formBody = formBody.join("&")


        fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formBody
        })
            .then(response => response.json())
            .then(data => {

                if (data.status == 200) {


                    let { id, title, itemPrice, totalPrice, tax, quantity } = data.data.basket;

                    let { tax: mtax, price: mPrice } = data.data;

                    createBasketItem(id, itemPrice, totalPrice, title, quantity, formatDecimalNumber(tax));

                    updateBasket(formatDecimalNumber(mtax), mPrice);


                    const qunatityToRead = quantity ? 1 : "ein";

                    readMessage(`Artikel mit der ID ${id} wurde ${qunatityToRead} mal hinzugefügt`);

                    showInfo(`Artikel mit der ID ${id} wurde ${qunatityToRead} mal hinzugefügt`, "info")


                } else {

                    showInfo(data.statusText, "error");
                    readMessage(`Artikel konnte nicht hinzugefügt werden`);

                }
            })

    } catch (error) {
        showInfo(error.message, "error")
    }

}

function deleteItemFromBasket(itemId) {

    try {

        const basketId_g = getBasketID();

        fetch(BASE_URL + `/?deleteItem=${itemId}&basketId=${basketId_g}`)
            .then(response => response.json())
            .then(data => {


                if (data.status == 200) {

                    let { id, tax, price } = data.data;

                    deleteBasketItem(id);
                    updateBasket(formatDecimalNumber(tax), formatDecimalNumber(price));
                    readMessage(`Artikel mit der ID ${id} wurde gelöscht`);

                    showInfo(`Artikel mit der ID ${id} wurde gelöscht`, "info")
                } else {

                    showInfo(data.statusText, "error")
                    readMessage(data.statusText);

                }
            });

    } catch (error) {
        showInfo(error.message, "error")

    }
}



function initBasket() {

    try {
        fetch(BASE_URL + "/?init")
            .then(response => response.json())
            .then(data => {

                if (data.status === 200) {

                    const basketId = data.data;

                    setBasketID(basketId);
                    renderInitalBasket();
                    const message = `Basket mit ID ${basketId} wurde erstellt`;
                    showInfo(message);

                } else {

                    showInfo("Basket konnte nicht initalisiert werden", "error");
                }

            });
    } catch (error) {
        showInfo(error.message, "error");
    }


}

function initCustomerView() {

    try {
        const basketId_g = getBasketID();
        if (basketId_g) {

            fetch(BASE_URL + `/?basket=${basketId_g}`)
                .then(response => response.json())
                .then(data => {

                    if (data.status === 200) {

                        renderInitalBasket();

                        let { tax: mTax, price: mPrice, items } = data.data;

                        mTax = formatDecimalNumber(mTax);
                        mPrice = formatDecimalNumber(mPrice);

                        const message = `Basket mit ID ${basketId_g} wurde gefunden`;
                        showInfo(message, "info");



                        Object.keys(items).forEach((key) => {


                            let { id, title, itemPrice, totalPrice, tax, quantity } = items[key];

                            tax = formatDecimalNumber(tax);
                            itemPrice = formatDecimalNumber(itemPrice);
                            totalPrice = formatDecimalNumber(totalPrice);

                            createBasketItem(id, itemPrice, totalPrice, title, quantity, tax);
                        })

                        updateBasket(mTax, mPrice);

                    } else {

                        initBasket();

                    }
                })
        } else {

            initBasket();

        }
    } catch (error) {
        showInfo(error.message, "error");

    }


}


function clearCustomerBasket() {
    if ($("#basket-list-empty").length) {
        readMessage(`Der Warenkorb ist bereits leer`);
        showInfo(`Der Warenkorb ist bereits leer`, "info");
        return;
    }
    try {


        const basketId_g = getBasketID();

        fetch(BASE_URL + `/?clear=${basketId_g}`)
            .then(response => response.json())
            .then(data => {

                console.log("test")
                if (data.status == 200) {

                    readMessage(`Der Warenkorb wurde geleert`);
                    showInfo(`Der Warenkorb wurde geleert`, "info");
                    renderInitalBasket();

                } else {

                    showInfo(data.statusText, "error")
                    readMessage(data.statusText);

                }
            });

    } catch (error) {
        showInfo(error.message, "error")

    }



}

function placeOrder() {

    try {

        const basketId = getBasketID();

        fetch(BASE_URL + `/?create=${basketId}`)
            .then(response => response.json())
            .then(data => {

                if (data.status == 200) {

                    const { id, order } = data.data;


                    const message = `Bestellung mit der ID ${id} wurde angelegt`
                    readMessage(message);
                    showInfo(message, "info");
                    setOrderToLocalStorage(id);
                    openOrderCreatedModal(order);
                } else {

                    const message = `Es befinden sich keine Items im Warenkorb`;
                    showInfo(message, "error")
                    readMessage(message);


                }

            });

    } catch (error) {
        showInfo(error.message, "error")

    }


}

