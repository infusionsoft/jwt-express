const jwt = require('express-jwt');
const functions = require('firebase-functions');
const jwksRsa = require('jwks-rsa');

module.exports = configureInfusionsoftJwt;

function configureInfusionsoftJwt(app) {
    let infusionsoft = functions.config().infusionsoft || {};
    let cas = infusionsoft.cas || {};
    let requestsPerMinute = cas.requestsPerMinute || 5;
    let jwksUri = `${cas.baseUrl || 'https://signin.infusionsoft.com'}/jwt/keys`;

    let config = {
        secret: jwksRsa.expressJwtSecret({
            cache: true,
            rateLimit: true,
            jwksRequestsPerMinute: requestsPerMinute,
            jwksUri: jwksUri
        }),
        algorithms: ['RS256']
    };

    app.use(jwt(config));

    app.use(function(err, req, res, next) {
        if (err.name === 'UnauthorizedError') {
            res.status(401).send({error: 'Invalid Token'});
        }
    });
}