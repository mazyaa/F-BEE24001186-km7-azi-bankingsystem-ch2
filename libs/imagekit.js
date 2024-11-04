const Imagekit = require('imagekit');

const {
    IMAGEKIT_PUBLIC_KEY,
    IMAGEKIT_PRIVATE_KEY,
    IMAGEKIT_URL_ENDPOINT
} = process.env;

module.exports = new Imagekit({
    publicKey:"public_dE5xk0lb7yNuMF8d3GLusxi8BTk=",
    privateKey:"private_7DyIri028EYzGB/Or+g9XADzgvc=",
    urlEndpoint:"https://ik.imagekit.io/rpg3cd9fm"
});