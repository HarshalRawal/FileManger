export const errorMiddleware = (err,req,res,next)=>{
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";
    let errors = err.errors || [];

    res.status(statusCode).json({
        success: false,
        message,
        errors,
        stack: err.stack,
    });
}