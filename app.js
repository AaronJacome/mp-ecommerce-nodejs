var express = require('express');
var exphbs = require('express-handlebars');
var mercadopago = require('mercadopago');
const bodyParser = require('body-parser');

var app = express();

mercadopago.configure({
    access_token: 'APP_USR-6718728269189792-112017-dc8b338195215145a4ec035fdde5cedf-491494389',
    // access_token: 'TEST-675360048701030-062400-2ab485580ea0f74b0281dae7f1704d27-589482002'
    // ,integrator_id: 'dev_24c65fb163bf11ea96500242ac130004'
});

const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));


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

app.get('/notification', function (req, res) {
    res.json(res.body);
});

app.post('/checkout', async function (req, res) {
    let urlImage = `https://aaronjacome-mp-ecommerce-nodej.herokuapp.com${req.body.img.split('.')[1]}`;
    console.log(urlImage);
    var preference = {
        external_reference: "aaronjacome93@gmail.com",
        notification_url: "https://aaronjacome-mp-ecommerce-nodej.herokuapp.com/notification",
        payer: {
            name: 'Lalo Landa',
            email: 'test_user_58295862@testuser.com',
            phone: {
                area_code: '52',
                number: Number('5549737300')
            },
            address: {
                zip_code: 'Insurgentes Sur',
                street_name: '1602',
                street_number: Number('03940')
            }
        },
        items: [
            {
                id: "1234",
                picture_url: urlImage,
                title: req.body.title,
                quantity: 1,
                currency_id: 'MX',
                unit_price: Number(req.body.price),
            },
        ],
        back_urls: {
            success: `https://aaronjacome-mp-ecommerce-nodej.herokuapp.com/success?collection_id=[PAYMENT_ID]&collection_status=approved&external_ref
            erence=[EXTERNAL_REFERENCE]&payment_type=credit_card&preference_id=[PREFERENCE_ID]&site_id
            =[SITE_ID]&processing_mode=aggregator&merchant_account_id=null`,
            pending: 'https://aaronjacome-mp-ecommerce-nodej.herokuapp.com/pending',
            failure: 'https://aaronjacome-mp-ecommerce-nodej.herokuapp.com/failure',
        },
        payment_methods: {
            excluded_payment_methods: [
                { "id": "amex" }
            ],
            excluded_payment_types: [
                { "id": "atm" }
            ],
        }
    };

    const response = await mercadopago.preferences.create(preference);

    res.redirect(response.body.sandbox_init_point);
});

app.use(express.static('assets'));

app.use('/assets', express.static(__dirname + '/assets'));

app.listen(port);