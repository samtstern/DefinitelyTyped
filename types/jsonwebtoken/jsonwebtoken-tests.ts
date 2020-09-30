/**
 * Test suite created by Maxime LUCE <https://github.com/SomaticIT>
 *
 * Created by using code samples from https://github.com/auth0/node-jsonwebtoken.
 */

import jwt = require("jsonwebtoken");
import fs = require("fs");

let token: string;
let cert: Buffer;

interface TestObject {
    foo: string;
}

const testObject = { foo: "bar" };

/**
 * jwt.sign
 * https://github.com/auth0/node-jsonwebtoken#usage
 */
// sign with default (HMAC SHA256)
token = jwt.sign(testObject, "shhhhh");

// sign with default (HMAC SHA256) and single audience
token = jwt.sign(testObject, "shhhhh", { audience: "theAudience" });

// sign with default (HMAC SHA256) and multiple audiences
token = jwt.sign(testObject, "shhhhh", {
    audience: ["audience1", "audience2"],
});

// sign with default (HMAC SHA256) and a keyid
token = jwt.sign(testObject, "shhhhh", { keyid: "theKeyId" });

// sign with RSA SHA256
cert = fs.readFileSync("private.key"); // get private key
token = jwt.sign(testObject, cert, { algorithm: "RS256" });

// sign with encrypted RSA SHA256 private key (only PEM encoding is supported)
const privKey: Buffer = fs.readFileSync("encrypted_private.key"); // get private key
const secret = { key: privKey.toString(), passphrase: "keypwd" };
token = jwt.sign(testObject, secret, { algorithm: "RS256" }); // the algorithm option is mandatory in this case
token = jwt.sign(testObject, { key: privKey, passphrase: 'keypwd' }, { algorithm: "RS256" });

// sign asynchronously
jwt.sign(testObject, cert, { algorithm: "RS256" }, (
    err: Error | null,
    token: string | undefined,
) => {
    if (err) {
        console.log(err);
        return;
    }

    console.log(token);
});

/**
 * jwt.verify
 * https://github.com/auth0/node-jsonwebtoken#jwtverifytoken-secretorpublickey-options-callback
 */
// verify a token symmetric
jwt.verify(token, "shhhhh", (err, decoded) => {
    const result = decoded as TestObject;

    console.log(result.foo); // bar
});

// use external time for verifying
jwt.verify(token, 'shhhhh', { clockTimestamp: 1 }, (err, decoded) => {
    const result = decoded as TestObject;

    console.log(result.foo); // bar
});

// invalid token
jwt.verify(token, "wrong-secret", (err, decoded) => {
    // err
    // decoded undefined
});

// verify with encrypted RSA SHA256 private key
jwt.verify(token, secret, (err, decoded) => {
    const result = decoded as TestObject;

    console.log(result.foo); // bar
});

// verify a token asymmetric
cert = fs.readFileSync("public.pem"); // get public key
jwt.verify(token, cert, (err, decoded) => {
    const result = decoded as TestObject;

    console.log(result.foo); // bar
});

// verify a token assymetric with async key fetch function
function getKey(header: jwt.JwtHeader, callback: jwt.SigningKeyCallback) {
    cert = fs.readFileSync("public.pem");

    callback(null, cert);
}

jwt.verify(token, getKey, (err, decoded) => {
    const result = decoded as TestObject;

    console.log(result.foo); // bar
});

// verify audience
cert = fs.readFileSync("public.pem"); // get public key
jwt.verify(token, cert, { audience: "urn:foo" }, (err, decoded) => {
    // if audience mismatch, err == invalid audience
});
jwt.verify(token, cert, { audience: /urn:f[o]{2}/ }, (err, decoded) => {
    // if audience mismatch, err == invalid audience
});
jwt.verify(token, cert, { audience: [/urn:f[o]{2}/, "urn:bar"] }, (err, decoded) => {
    // if audience mismatch, err == invalid audience
});

// verify issuer
cert = fs.readFileSync("public.pem"); // get public key
jwt.verify(token, cert, { audience: "urn:foo", issuer: "urn:issuer" }, (
    err,
    decoded,
) => {
    // if issuer mismatch, err == invalid issuer
});

// verify algorithm
cert = fs.readFileSync("public.pem"); // get public key
jwt.verify(token, cert, { algorithms: ["RS256"] }, (err, decoded) => {
    // if algorithm mismatch, err == invalid algorithm
});

// verify without expiration check
cert = fs.readFileSync("public.pem"); // get public key
jwt.verify(token, cert, { ignoreExpiration: true }, (err, decoded) => {
    // if ignoreExpration == false and token is expired, err == expired token
});

// verify a non-signed token
const unsigned = jwt.sign({ aud: 'foo', sub: 'bar' }, null, { algorithm: 'none' });
jwt.verify(unsigned, null, { algorithms: ['none' ]});

/**
 * jwt.decode
 * https://github.com/auth0/node-jsonwebtoken#jwtdecodetoken
 */
let decoded = jwt.decode(token);

decoded = jwt.decode(token, { complete: false });

if (decoded !== null && typeof decoded === "object") {
    console.log(decoded.foo);
}

decoded = jwt.decode(token, { json: false });

decoded = jwt.decode(token, { complete: false, json: false });

decoded = jwt.decode(token, { json: true });
if (decoded) {
    // $ExpectType { [key: string]: any; }
    decoded;
}
