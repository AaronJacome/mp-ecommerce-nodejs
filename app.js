var express = require('express');
var exphbs = require('express-handlebars');
var mercadopago = require('mercadopago');
const bodyParser = require('body-parser');

var app = express();

mercadopago.configure({
    access_token: 'APP_USR-6718728269189792-112017-dc8b338195215145a4ec035fdde5cedf-491494389',
    integrator_id: 'dev_24c65fb163bf11ea96500242ac130004'
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

app.post('/checkout', async function (req, res) {
    let urlImage = '';
    if (port === 3000) {
        urlImage = `${req.protocol}://${req.hostname}:${port}${req.body.img.split('.')[1]}`;
    } else {
        urlImage = `${req.protocol}://${req.hostname}${req.body.img.split('.')[1]}`;
    }
    console.log(urlImage);
    var preference = {
        external_reference: "aaronjacome93@gmail.com",
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
            success: `http://localhost:3000/success?collection_id=[PAYMENT_ID]&collection_status=approved&external_ref
            erence=[EXTERNAL_REFERENCE]&payment_type=credit_card&preference_id=[PREFERENCE_ID]&site_id
            =[SITE_ID]&processing_mode=aggregator&merchant_account_id=null`,
            pending: 'http://localhost:3000/pending',
            failure: 'http://localhost:3000/failure',
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
    // .then(response => {
    //     console.log(response.body.sandbox_init_point);
    //     console.log(response.body.id)
    //     global.id = response.body.id;
    // })
    res.redirect(response.body.sandbox_init_point);
});

app.use(express.static('assets'));

app.use('/assets', express.static(__dirname + '/assets'));

app.listen(port);