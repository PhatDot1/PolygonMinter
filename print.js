import jimp from 'jimp';
import screen_positions from './assets/enums.js';

var createImageForData = async (indexOfNFTToMint, objectToMint) => {

    var imageTemplate = await jimp.read(objectToMint.certImage);

    if (imageTemplate.bitmap.width != 1200 || imageTemplate.bitmap.height != 1200 || indexOfNFTToMint <= 0  || objectToMint.programmeName == ''  || objectToMint.achievementLevel == '') {
        console.log('Skipping - Data for image creation incorrect or incomplete');
    }

    var smallFont = await jimp.loadFont('./assets/M27oMdHwFp9I5kia9fEvG26N.ttf.fnt');
    var bigFont = await jimp.loadFont('./assets/PV_DFB_5AyqkSVneW96xSWkz.ttf.fnt');

    await printTextAtPosition(smallFont, objectToMint.programmeName, imageTemplate, screen_positions.BottomLeft);
    await printTextAtPosition(bigFont, objectToMint.achievementLevel, imageTemplate, screen_positions.MiddleMiddle);
    await printTextAtPosition(smallFont, `# ${indexOfNFTToMint}`, imageTemplate, screen_positions.BottomRight);

    var fileNameOfNFTImage = `NFT_to_pin${indexOfNFTToMint}.jpg`;

    await imageTemplate.writeAsync(fileNameOfNFTImage);

    return fileNameOfNFTImage;
}

function printTextAtPosition(font, text, image, position) {
    
    var messageWidth = jimp.measureText(font, text);
    var messageHeight = jimp.measureTextHeight(font, text, image.bitmap.width);

    var positionX;
    var positionY;

    switch (position) {
        case screen_positions.TopLeft:
            positionX = 0;
            positionY = 0;
            break;

        case screen_positions.TopMiddle:
            positionX = image.bitmap.width / 2 - messageWidth / 2;
            positionY = 0;
            break;

        case screen_positions.TopRight:
            positionX = image.bitmap.width - messageWidth;
            positionY = 0;
            break;

        case screen_positions.MiddleLeft:
            positionX = 0;
            positionY = image.bitmap.height / 2 - messageHeight / 2;
            break;
    
        case screen_positions.MiddleMiddle:
            positionX = image.bitmap.width / 2 - messageWidth / 2;
            positionY = image.bitmap.height / 2 - messageHeight / 2;
            break;
    
        case screen_positions.MiddleRight:
            positionX = image.bitmap.width - messageWidth;
            positionY = image.bitmap.height / 2 - messageHeight / 2;
            break;

        case screen_positions.BottomLeft:
            positionX = 0;
            positionY = image.bitmap.height - messageHeight;
            break;
    
        case screen_positions.BottomMiddle:
            positionX = image.bitmap.width / 2 - messageWidth / 2;
            positionY = image.bitmap.height - messageHeight;
            break;
    
        case screen_positions.BottomRight:
            positionX = image.bitmap.width - messageWidth;
            positionY = image.bitmap.height - messageHeight;
            break;
    
        default:
            break;
    }
    
    image.print(
        font,
        positionX,
        positionY,
        {
            text: text
        },
        image.bitmap.width,
        image.bitmap.height
    );

}

var print = {
    createImageForData: createImageForData
}

export default print;