const errorController = {}

errorController.IntError = async function(req, res ) {
    throw new Error("Intentional error for testing 500 errors. yayyy!")
    
}


module.exports = errorController