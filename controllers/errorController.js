const errorController = {}

errorController.IntError = async function(req, res ) {
    throw new Error("Intentional error fortesting 500 errors. yayyy!")
    
}


module.exports = errorController