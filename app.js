var express = require('express');
var exphbs = require('express-handlebars');
var mercadopago = require('mercadopago');
var bodyParser = require('body-parser');

var app = express();
var logger = require('morgan');

mercadopago.configure({
    access_token: 'APP_USR-6718728269189792-112017-dc8b338195215145a4ec035fdde5cedf-491494389',
    integrator_id: 'dev_24c65fb163bf11ea96500242ac130004'
});

const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(logger('dev'));

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.get('/', function (req, res) {
    res.render('home');
});

app.get('/detail', function (req, res) {
    res.render('detail', req.query);
});

app.get('/success', function (req, res) {
    res.render('success', req.query);
});

app.get('/failure', function (req, res) {
    res.render('failure');
});

app.get('/pending', function (req, res) {
    res.render('pending');
});

app.get('/webhook', function (req, res) {
    if (req.method === "POST") {
        let body = "";
        req.on("data", chunk => {
            body += chunk.toString();
        });
        req.on("end", () => {
            console.log(body, "webhook response");
            res.end("ok");
        });
    }
    return res.status(200);
});

app.post('/checkout', async function (req, res) {
    let urlImage = `https://aaronjacome-mp-ecommerce-nodej.herokuapp.com${req.body.img.split('.')[1]}.jpg`;
    console.log(urlImage);
    var preference = {
        items: [
            {
                id: "1234",
                picture_url: urlImage,
                title: req.body.title,
                quantity: parseInt(req.body.unit),
                currency_id: 'MXN',
                description: 'Dispositivo móvil de Tienda e-commerce',
                unit_price: parseFloat(req.body.price),
            },
        ],
        external_reference: "aaronjacome93@gmail.com",
        payer: {
            name: "Lalo",
            surname: "Landa",
            email: "test_user_58295862@testuser.com",
            phone: {
                area_code: "52",
                number: 5549737300
            },
            address: {
                zip_code: "03940",
                street_name: "Insugentes Sur",
                street_number: 1602
            }
        },
        payment_methods: {
            excluded_payment_methods: [
                {
                    id: "amex"
                }
            ],
            excluded_payment_types: [{ id: "atm" }],
            installments: 6,
            default_installments: 6
        },
        back_urls: {
            success: "https://localhost:3000/success",
            pending: "https://localhost:3000.com/pending",
            failure: "https://localhost:3000.com/error"
        },
        notification_url: "https://mercadopago-checkout.herokuapp.com/webhook",
        auto_return: "approved"
    };

    const response = await mercadopago.preferences.create(preference);
    console.log(response.body.init_point);
    res.redirect(response.body.init_point);
});

app.use(express.static('assets'));

app.use('/assets', express.static(__dirname + '/assets'));

app.listen(port);