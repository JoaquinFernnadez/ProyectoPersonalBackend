import { Router } from "express";
import { isAdmin } from "../middlewares/user.middleware";
import OfferController from "../controlers/offer.controller";


const router = Router()
// Listar ofertas y poder filtrar GET
router.get('/',  OfferController.getAll )
// Añadir oferta POST {body}
router.get('/',  OfferController.getById )
router.post('/',  OfferController.create )
// Borrar oferta DELETE localhost:3000/api/offert/id
router.delete('/:id',isAdmin,  OfferController.delete )
// Actualizar una oferta PUT localhost:3000/api/offert/id && {body}
router.put('/:id',isAdmin,  OfferController.update )
// Calificar una oferta  {body}
router.post('/:id/rate/',  OfferController.rate )
// Ver calificaiones de los usuarios
router.get('/:id/rate/',  OfferController.getRate )

export default router