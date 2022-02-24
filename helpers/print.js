import jimp from 'jimp';
import screen_positions from './enums.js';

var createImageForData = async (indexOfNFTToMint, objectToMint) => {

    var imageTemplate = await jimp.read(objectToMint.certImage);

    if (imageTemplate.bitmap.width != 1200 || imageTemplate.bitmap.height != 1200 || indexOfNFTToMint <= 0  || objectToMint.programmeName == ''  || objectToMint.achievementLevel == '') {
        console.log('Skipping - Data for image creation incorrect or incomplete');
    }

    var smallFont = await jimp.loadFont('./assets/Montserrat-SemiBold.fnt');
    var bigFont = await jimp.loadFont('./assets/Montserrat-Regular.fnt');

    var margin = 80;

    await printTextAtPosition(smallFont, objectToMint.programmeName.toUpperCase(), imageTemplate, screen_positions.LeftBottom, margin, imageTemplate.bitmap.width / 2, 0, 0);
    await printTextAtPosition(bigFont, objectToMint.achievementLevel.toUpperCase(), imageTemplate, screen_positions.LeftMiddle, margin, imageTemplate.bitmap.width, 0, margin * 3.5);
    await printTextAtPosition(smallFont, `# ${indexOfNFTToMint}`, imageTemplate, screen_positions.RightBottom, margin, imageTemplate.bitmap.width / 2, 0, 0);

    var fileNameOfNFTImage = `NFT_to_pin${indexOfNFTToMint}.jpg`;

    await imageTemplate.writeAsync(fileNameOfNFTImage);

    return fileNameOfNFTImage;
}

function printTextAtPosition(font, text, image, position, margin, maxWidth, xOffset, yOffset) {
    
    var messageWidth = jimp.measureText(font, text);
    var messageHeight = jimp.measureTextHeight(font, text, maxWidth);

    var positionX;
    var positionY;

    switch (position) {
        case screen_positions.LeftTop:
            positionX = 0 + margin + xOffset;
            positionY = 0 + margin + yOffset;
            break;

        case screen_positions.MiddleTop:
            positionX = image.bitmap.width / 2 - messageWidth / 2 + xOffset;
            positionY = 0 + margin + yOffset;
            break;

        case screen_positions.RightTop:
            positionX = image.bitmap.width - messageWidth - margin + xOffset;
            positionY = 0 + margin + yOffset;
            break;

        case screen_positions.LeftMiddle:
            positionX = 0 + margin + xOffset;
            positionY = image.bitmap.height / 2 - messageHeight / 2 + yOffset;
            break;
    
        case screen_positions.MiddleMiddle:
            positionX = image.bitmap.width / 2 - messageWidth / 2 + xOffset;
            positionY = image.bitmap.height / 2 - messageHeight / 2 + yOffset;
            break;
    
        case screen_positions.RightMiddle:
            positionX = image.bitmap.width - messageWidth - margin + xOffset;
            positionY = image.bitmap.height / 2 - messageHeight / 2 + yOffset;
            break;

        case screen_positions.LeftBottom:
            positionX = 0 + margin + xOffset;
            positionY = image.bitmap.height - messageHeight - margin + yOffset;
            break;
    
        case screen_positions.MiddleBottom:
            positionX = image.bitmap.width / 2 - messageWidth / 2 + xOffset;
            positionY = image.bitmap.height - messageHeight - margin + yOffset;
            break;
    
        case screen_positions.RightBottom:
            positionX = image.bitmap.width - messageWidth - margin + xOffset;
            positionY = image.bitmap.height - messageHeight - margin + yOffset;
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
        maxWidth,
        image.bitmap.height
    );

}

var print = {
    createImageForData: createImageForData
}

export default print;