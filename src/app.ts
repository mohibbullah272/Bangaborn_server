import { Application, Request, Response } from "express";
import express from 'express';
import cors from 'cors'
import globalErrorHandler from "./middlewares/error";
import { productRoute } from "./modules/products/product.route";
import { orderRouter } from "./modules/orders/order.route";
import { adminRoute } from "./modules/admin/admin.route";





const app:Application = express()

app.use(cors())
app.use(express.json())
app.use("/api/products",productRoute)
app.use("/api/orders",orderRouter)
app.use("/api/admin",adminRoute)

app.get("/healthz", (req:Request,res:Response) => {
    res.send("ok");
  });
  
app.get('/',async(req:Request,res:Response)=>{
    res.send(`this is bangaborn server `)
})


app.use(globalErrorHandler);



export default app



